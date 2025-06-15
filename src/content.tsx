import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import HoverWindow from './components/HoverWindow';

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
  activePatternId?: string;
}

class HoverCopyTool {
  private hoverWindow: HTMLElement | null = null;
  private reactRoot: Root | null = null;
  private currentLink: HTMLAnchorElement | null = null;
  private activePatterns: RegexPattern[] = [];
  private hideTimer: number | null = null;

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
        "activePatternId",
      ])) as StorageData;
      const patterns = result.regexPatterns || [];
      const activeId = result.activePatternId;

      console.log("Loaded patterns:", patterns);
      console.log("Active pattern ID:", activeId);

      if (activeId) {
        const activePattern = patterns.find((p) => p.id === activeId);
        this.activePatterns = activePattern ? [activePattern] : [];
      }

      console.log("Final active patterns:", this.activePatterns);
    } catch (error) {
      console.error("Failed to load patterns:", error);
      this.activePatterns = [];
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
      if (changes.regexPatterns || changes.activePatternId) {
        this.loadPatterns();
      }
    });
  }

  private handleMouseOver(event: MouseEvent): void {
    const link = (event.target as Element).closest(
      "a[href]"
    ) as HTMLAnchorElement;
    if (!link || link === this.currentLink) return;

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
        let match;
        while ((match = regex.exec(url)) !== null) {
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

    const rect = link.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    let top = rect.bottom + window.scrollY + 5;
    let left = rect.left + window.scrollX;

    const hoverRect = this.hoverWindow.getBoundingClientRect();

    if (top + hoverRect.height > windowHeight + window.scrollY) {
      top = rect.top + window.scrollY - hoverRect.height - 5;
    }

    if (left + hoverRect.width > windowWidth + window.scrollX) {
      left = windowWidth + window.scrollX - hoverRect.width - 10;
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
    if (this.hoverWindow && this.hoverWindow.parentNode) {
      this.hoverWindow.parentNode.removeChild(this.hoverWindow);
      this.hoverWindow = null;
    }
  }
}

new HoverCopyTool();
