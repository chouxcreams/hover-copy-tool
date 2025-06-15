import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActivePatterns, loadPatterns, savePatterns } from "./storage";

// Mock Chrome storage API
const mockChromeStorage = {
  sync: {
    get: vi.fn(),
    set: vi.fn(),
  },
};

Object.defineProperty(global, "chrome", {
  value: {
    storage: mockChromeStorage,
  },
  writable: true,
});

const mockPatterns = [
  {
    id: "pattern1",
    name: "User ID Pattern",
    regex: "/user/(\\d+)",
    createdAt: 1234567890,
  },
  {
    id: "pattern2",
    name: "Product Code Pattern",
    regex: "/product/([A-Z]+\\d+)",
    createdAt: 1234567891,
  },
];

describe("Storage utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loadPatterns", () => {
    it("loads patterns and active IDs from storage", async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternIds: ["pattern1", "pattern2"],
      });

      const result = await loadPatterns();

      expect(result).toEqual({
        patterns: mockPatterns,
        activeIds: ["pattern1", "pattern2"],
      });

      expect(mockChromeStorage.sync.get).toHaveBeenCalledWith([
        "regexPatterns",
        "activePatternIds",
        "activePatternId",
      ]);
    });

    it("migrates from legacy activePatternId to activePatternIds", async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternId: "pattern1",
      });

      const result = await loadPatterns();

      expect(result).toEqual({
        patterns: mockPatterns,
        activeIds: ["pattern1"],
      });
    });

    it("returns defaults when storage is empty", async () => {
      mockChromeStorage.sync.get.mockResolvedValue({});

      const result = await loadPatterns();

      expect(result).toEqual({
        patterns: [],
        activeIds: [],
      });
    });

    it("handles storage errors gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockChromeStorage.sync.get.mockRejectedValue(new Error("Storage error"));

      const result = await loadPatterns();

      expect(result).toEqual({
        patterns: [],
        activeIds: [],
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load patterns:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("handles partial storage data", async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        // activePatternIds is missing
      });

      const result = await loadPatterns();

      expect(result).toEqual({
        patterns: mockPatterns,
        activeIds: [],
      });
    });
  });

  describe("savePatterns", () => {
    it("saves patterns and active IDs to storage", async () => {
      mockChromeStorage.sync.set.mockResolvedValue(undefined);

      await savePatterns(mockPatterns, ["pattern1", "pattern2"]);

      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({
        regexPatterns: mockPatterns,
        activePatternIds: ["pattern1", "pattern2"],
      });
    });

    it("saves with empty active IDs array", async () => {
      mockChromeStorage.sync.set.mockResolvedValue(undefined);

      await savePatterns(mockPatterns, []);

      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({
        regexPatterns: mockPatterns,
        activePatternIds: [],
      });
    });

    it("saves empty patterns array", async () => {
      mockChromeStorage.sync.set.mockResolvedValue(undefined);

      await savePatterns([], []);

      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({
        regexPatterns: [],
        activePatternIds: [],
      });
    });

    it("saves single active pattern", async () => {
      mockChromeStorage.sync.set.mockResolvedValue(undefined);

      await savePatterns(mockPatterns, ["pattern1"]);

      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({
        regexPatterns: mockPatterns,
        activePatternIds: ["pattern1"],
      });
    });

    it("throws error when storage fails", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const storageError = new Error("Storage error");
      mockChromeStorage.sync.set.mockRejectedValue(storageError);

      await expect(savePatterns(mockPatterns, ["pattern1"])).rejects.toThrow(
        "Storage error"
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to save patterns:",
        storageError
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe("getActivePatterns", () => {
    it("returns active patterns when found", async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternIds: ["pattern1", "pattern2"],
      });

      const result = await getActivePatterns();

      expect(result).toEqual(mockPatterns);
    });

    it("returns partial patterns when some IDs not found", async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternIds: ["pattern1", "nonexistent"],
      });

      const result = await getActivePatterns();

      expect(result).toEqual([mockPatterns[0]]);
    });

    it("returns empty array when no active pattern IDs", async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternIds: [],
      });

      const result = await getActivePatterns();

      expect(result).toEqual([]);
    });

    it("returns empty array when no patterns exist", async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: [],
        activePatternIds: ["pattern1"],
      });

      const result = await getActivePatterns();

      expect(result).toEqual([]);
    });

    it("handles migration from legacy single pattern", async () => {
      mockChromeStorage.sync.get.mockResolvedValue({
        regexPatterns: mockPatterns,
        activePatternId: "pattern2",
      });

      const result = await getActivePatterns();

      expect(result).toEqual([mockPatterns[1]]);
    });

    it("handles storage errors gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockChromeStorage.sync.get.mockRejectedValue(new Error("Storage error"));

      const result = await getActivePatterns();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load patterns:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
