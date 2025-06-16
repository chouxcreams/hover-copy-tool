import React from "react";
import { createRoot } from "react-dom/client";
import PopupApp from "./components/PopupApp";
import "./popup.css";

// コンテンツスクリプトを動的に注入
async function injectContentScript() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      // 既に注入されているかチェック
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.hoverCopyToolInjected || false,
      });
      
      if (!results[0].result) {
        // CSSを注入
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["content.css"],
        });
        
        // JavaScriptを注入
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
      }
    }
  } catch (error) {
    console.error("Failed to inject content script:", error);
  }
}

// ポップアップが開かれた時にコンテンツスクリプトを注入
injectContentScript();

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
