import React from "react";
import { type Root, createRoot } from "react-dom/client";
import HoverWindow from "./components/HoverWindow";

// 注入済みフラグを設定
declare global {
  interface Window {
    hoverCopyToolInjected?: boolean;
  }
}

window.hoverCopyToolInjected = true;

interface RegexPattern {
  id: string;
  name: string;
  regex: string;
  createdAt: number;
}

interface ExtractedMatch {
  value: string;
  patternName: string;
}

interface StorageData {
  regexPatterns?: RegexPattern[];
  activePatternIds?: string[];
  isAppEnabled?: boolean;
}

class HoverCopyTool {
  private hoverWindow: HTMLElement | null = null;
  private reactRoot: Root | null = null;
  private currentLink: HTMLAnchorElement | null = null;
  private activePatterns: RegexPattern[] = [];
  private hideTimer: number | null = null;
  private isAppEnabled = true;
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.init();
  }

  private init(): void {
    this.loadPatterns();
    this.attachEventListeners();
  }

  private async loadPatterns(): Promise<void> {
    try {
      const result = (await chrome.storage.sync.get([
        "regexPatterns",
        "activePatternIds",
        "activePatternId", // Legacy support
        "isAppEnabled",
      ])) as StorageData & { activePatternId?: string };
      const patterns = result.regexPatterns || [];

      let activeIds = result.activePatternIds || [];
      // Migration: convert old single activePatternId to array
      if (!result.activePatternIds && result.activePatternId) {
        activeIds = [result.activePatternId];
      }

      this.isAppEnabled = result.isAppEnabled ?? true;

      console.log("Loaded patterns:", patterns);
      console.log("Active pattern IDs:", activeIds);
      console.log("App enabled:", this.isAppEnabled);

      this.activePatterns = patterns.filter((p) => activeIds.includes(p.id));

      console.log("Final active patterns:", this.activePatterns);
    } catch (error) {
      console.error("Failed to load patterns:", error);
      this.activePatterns = [];
      this.isAppEnabled = true;
    }
  }

  private attachEventListeners(): void {
    document.addEventListener("mouseover", (e: MouseEvent) =>
      this.handleMouseOver(e)
    );
    document.addEventListener("mouseout", (e: MouseEvent) =>
      this.handleMouseOut(e)
    );

    // Document level mousemove to track if cursor is over window
    document.addEventListener("mousemove", (e: MouseEvent) => {
      if (this.hoverWindow && this.isMouseOverWindow(e)) {
        this.clearHideTimer();
      }
    });

    chrome.storage.onChanged.addListener((changes) => {
      if (
        changes.regexPatterns ||
        changes.activePatternIds ||
        changes.activePatternId ||
        changes.isAppEnabled
      ) {
        this.loadPatterns();
      }
    });
  }

  private handleMouseOver(event: MouseEvent): void {
    if (!this.isAppEnabled) return;
    
    const link = (event.target as Element).closest(
      "a[href]"
    ) as HTMLAnchorElement;
    if (!link || link === this.currentLink) return;

    this.mousePosition = { x: event.clientX, y: event.clientY };
    this.clearHideTimer();
    this.currentLink = link;
    this.showHoverWindow(link);
  }

  private handleMouseOut(event: MouseEvent): void {
    const link = (event.target as Element).closest(
      "a[href]"
    ) as HTMLAnchorElement;
    if (!link || link !== this.currentLink) {
      console.log("Link mouseout - scheduling hide");
      this.scheduleHideWindow();
    }
  }

  private extractMatches(url: string): ExtractedMatch[] {
    const matches: ExtractedMatch[] = [];

    for (const pattern of this.activePatterns) {
      try {
        const regex = new RegExp(pattern.regex, "g");
        let match: RegExpExecArray | null = regex.exec(url);
        while (match !== null) {
          if (match[1]) {
            matches.push({
              value: match[1],
              patternName: pattern.name,
            });
          } else if (match[0]) {
            matches.push({
              value: match[0],
              patternName: pattern.name,
            });
          }
          // Prevent infinite loop for zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
          match = regex.exec(url);
        }
      } catch (error) {
        console.error("Invalid regex pattern:", pattern.regex, error);
      }
    }

    return matches;
  }

  private showHoverWindow(link: HTMLAnchorElement): void {
    const url = link.href;
    console.log("Hovering over link:", url);
    console.log("Active patterns:", this.activePatterns);

    const matches = this.extractMatches(url);
    console.log("Extracted matches:", matches);

    if (matches.length === 0) {
      console.log("No matches found, not showing window");
      return;
    }

    this.hideHoverWindow();

    this.hoverWindow = document.createElement("div");
    this.hoverWindow.className = "hover-copy-window-container";
    document.body.appendChild(this.hoverWindow);

    this.reactRoot = createRoot(this.hoverWindow);
    this.reactRoot.render(
      React.createElement(HoverWindow, {
        matches: matches,
        onCopy: (value: string) => this.copyToClipboard(value),
      })
    );

    this.positionHoverWindow(link);
    this.attachHoverWindowEvents();
  }

  private positionHoverWindow(link: HTMLAnchorElement): void {
    if (!this.hoverWindow) return;

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    // マウス位置を基準にウィンドウを配置（マウスカーソルの右下に配置）
    let top = this.mousePosition.y + window.scrollY + 10;
    let left = this.mousePosition.x + window.scrollX + 10;

    const hoverRect = this.hoverWindow.getBoundingClientRect();

    // 画面の下端を超える場合はマウスカーソルの上に配置
    if (top + hoverRect.height > windowHeight + window.scrollY) {
      top = this.mousePosition.y + window.scrollY - hoverRect.height - 10;
    }

    // 画面の右端を超える場合はマウスカーソルの左に配置
    if (left + hoverRect.width > windowWidth + window.scrollX) {
      left = this.mousePosition.x + window.scrollX - hoverRect.width - 10;
    }

    // 画面の上端・左端を超えないように調整
    if (top < window.scrollY) {
      top = window.scrollY + 5;
    }
    if (left < window.scrollX) {
      left = window.scrollX + 5;
    }

    this.hoverWindow.style.top = `${top}px`;
    this.hoverWindow.style.left = `${left}px`;
  }

  private attachHoverWindowEvents(): void {
    if (!this.hoverWindow) return;

    this.hoverWindow.addEventListener("mouseenter", () => {
      console.log("Window mouseenter - clearing timer");
      this.clearHideTimer();
    });

    this.hoverWindow.addEventListener("mouseleave", () => {
      console.log("Window mouseleave - scheduling hide");
      this.scheduleHideWindow();
    });
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      this.showCopyNotification();
      this.hideHoverWindow();
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }

  private showCopyNotification(): void {
    const notification = document.createElement("div");
    notification.className = "copy-notification";
    notification.textContent = "コピーしました！";
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }

  private clearHideTimer(): void {
    if (this.hideTimer !== null) {
      console.log("Clearing hide timer");
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  private scheduleHideWindow(): void {
    console.log("Scheduling hide window in 200ms");
    this.clearHideTimer();
    this.hideTimer = window.setTimeout(() => {
      console.log("Timer executed - hiding window");
      this.hideHoverWindow();
      this.currentLink = null;
    }, 200);
  }

  private isMouseOverWindow(event: MouseEvent): boolean {
    if (!this.hoverWindow) return false;

    const rect = this.hoverWindow.getBoundingClientRect();
    return (
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom
    );
  }

  private hideHoverWindow(): void {
    this.clearHideTimer();
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
    if (this.hoverWindow?.parentNode) {
      this.hoverWindow.parentNode.removeChild(this.hoverWindow);
      this.hoverWindow = null;
    }
  }
}

new HoverCopyTool();
