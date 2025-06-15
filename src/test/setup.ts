import { vi } from "vitest";
import "@testing-library/jest-dom";

// Configure React Testing Library to use automatic act
(global as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

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
