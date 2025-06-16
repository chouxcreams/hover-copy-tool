import { vi } from "vitest";
import "@testing-library/jest-dom";

// Configure React Testing Library to use automatic act
(global as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Suppress React act() warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: An update to') &&
    args[0].includes('inside a test was not wrapped in act')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock HTMLElement.click to prevent JSDOM navigation errors
Object.defineProperty(HTMLElement.prototype, 'click', {
  value: vi.fn(),
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL for file download tests
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-blob-url'),
    revokeObjectURL: vi.fn(),
  },
  writable: true,
});

// Mock Chrome APIs
Object.defineProperty(global, "chrome", {
  value: {
    storage: {
      local: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
      },
      sync: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
      },
    },
    runtime: {
      sendMessage: vi.fn(),
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
  },
  writable: true,
});
