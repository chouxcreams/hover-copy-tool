import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PopupApp from "./PopupApp";

// Mock Chrome storage API
const mockChromeStorage = {
  sync: {
    get: vi.fn(),
    set: vi.fn(),
  },
  onChanged: {
    addListener: vi.fn(),
  },
};

// Mock window.confirm and window.alert
const mockConfirm = vi.fn();
const mockAlert = vi.fn();

Object.defineProperty(global, "chrome", {
  value: {
    storage: mockChromeStorage,
  },
  writable: true,
});

Object.defineProperty(global, "confirm", {
  value: mockConfirm,
  writable: true,
});

Object.defineProperty(global, "alert", {
  value: mockAlert,
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

describe("PopupApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockChromeStorage.sync.get.mockResolvedValue({
      regexPatterns: mockPatterns,
      activePatternIds: ["pattern1"],
    });
    mockChromeStorage.sync.set.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders header correctly", async () => {
    render(<PopupApp />);

    expect(screen.getByText("Hover Copy Tool")).toBeInTheDocument();
    expect(screen.getByText("正規表現パターンの設定")).toBeInTheDocument();
  });

  it("loads and displays patterns from storage", async () => {
    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByText("User ID Pattern")).toBeInTheDocument();
      expect(screen.getByText("Product Code Pattern")).toBeInTheDocument();
    });

    expect(screen.getByText("/user/(\\d+)")).toBeInTheDocument();
    expect(screen.getByText("/product/([A-Z]+\\d+)")).toBeInTheDocument();
  });

  it("shows active pattern correctly", async () => {
    render(<PopupApp />);

    await waitFor(() => {
      const activePattern = screen
        .getByText("User ID Pattern")
        .closest(".pattern-item");
      expect(activePattern).toHaveClass("active");

      const checkbox = activePattern?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox).toBeChecked();
    });
  });

  it("shows no patterns message when empty", async () => {
    mockChromeStorage.sync.get.mockResolvedValue({
      regexPatterns: [],
      activePatternIds: [],
    });

    render(<PopupApp />);

    await waitFor(() => {
      expect(
        screen.getByText("パターンが登録されていません")
      ).toBeInTheDocument();
    });
  });

  it("toggles form visibility when add button is clicked", async () => {
    render(<PopupApp />);

    await waitFor(() => {
      expect(screen.getByText("新しいパターンを追加")).toBeInTheDocument();
    });

    const toggleButton = screen.getByText("新しいパターンを追加");
    fireEvent.click(toggleButton);

    expect(screen.getByText("フォームを閉じる")).toBeInTheDocument();
    expect(screen.getByLabelText("パターン名:")).toBeInTheDocument();
    expect(screen.getByLabelText("正規表現:")).toBeInTheDocument();
  });

  it("submits new pattern with valid data", async () => {
    render(<PopupApp />);

    await waitFor(() => {
      const toggleButton = screen.getByText("新しいパターンを追加");
      fireEvent.click(toggleButton);
    });

    const nameInput = screen.getByLabelText("パターン名:");
    const regexInput = screen.getByLabelText("正規表現:");
    const submitButton = screen.getByText("保存");

    fireEvent.change(nameInput, { target: { value: "Test Pattern" } });
    fireEvent.change(regexInput, { target: { value: "test-\\d+" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regexPatterns: expect.arrayContaining([
            expect.objectContaining({
              name: "Test Pattern",
              regex: "test-\\d+",
            }),
          ]),
          activePatternIds: expect.any(Array),
        })
      );
    });
  });

  it("shows error for invalid regex", async () => {
    render(<PopupApp />);

    await waitFor(() => {
      const toggleButton = screen.getByText("新しいパターンを追加");
      fireEvent.click(toggleButton);
    });

    const nameInput = screen.getByLabelText("パターン名:");
    const regexInput = screen.getByLabelText("正規表現:");
    const submitButton = screen.getByText("保存");

    fireEvent.change(nameInput, { target: { value: "Invalid Pattern" } });
    fireEvent.change(regexInput, { target: { value: "[invalid regex" } });
    fireEvent.click(submitButton);

    expect(mockAlert).toHaveBeenCalledWith(
      "正規表現が無効です。正しい形式で入力してください。"
    );
  });

  it("shows error for empty fields", async () => {
    render(<PopupApp />);

    await waitFor(() => {
      const toggleButton = screen.getByText("新しいパターンを追加");
      fireEvent.click(toggleButton);
    });

    const submitButton = screen.getByText("保存");
    fireEvent.click(submitButton);

    expect(mockAlert).toHaveBeenCalledWith(
      "パターン名と正規表現を入力してください。"
    );
  });

  it("toggles pattern activation when checkbox is clicked", async () => {
    render(<PopupApp />);

    await waitFor(() => {
      const productPattern = screen
        .getByText("Product Code Pattern")
        .closest(".pattern-item");
      const checkbox = productPattern?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          activePatternIds: ["pattern1", "pattern2"],
        })
      );
    });
  });

  it("deactivates pattern when checkbox is unchecked", async () => {
    render(<PopupApp />);

    await waitFor(() => {
      const userPattern = screen
        .getByText("User ID Pattern")
        .closest(".pattern-item");
      const checkbox = userPattern?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      fireEvent.click(checkbox);
    });

    await waitFor(() => {
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          activePatternIds: [],
        })
      );
    });
  });

  it("opens edit form with pattern data", async () => {
    render(<PopupApp />);

    await waitFor(() => {
      const editButtons = screen.getAllByText("編集");
      fireEvent.click(editButtons[0]);
    });

    expect(screen.getByDisplayValue("User ID Pattern")).toBeInTheDocument();
    expect(screen.getByDisplayValue("/user/(\\d+)")).toBeInTheDocument();
  });

  it("deletes pattern with confirmation", async () => {
    mockConfirm.mockReturnValue(true);

    render(<PopupApp />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText("削除");
      fireEvent.click(deleteButtons[0]);
    });

    expect(mockConfirm).toHaveBeenCalledWith("このパターンを削除しますか？");

    await waitFor(() => {
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regexPatterns: expect.arrayContaining([
            expect.objectContaining({
              id: "pattern2",
            }),
          ]),
          activePatternIds: expect.any(Array),
        })
      );
    });
  });

  it("cancels delete when confirmation is rejected", async () => {
    mockConfirm.mockReturnValue(false);

    render(<PopupApp />);

    await waitFor(() => {
      const deleteButtons = screen.getAllByText("削除");
      fireEvent.click(deleteButtons[0]);
    });

    expect(mockConfirm).toHaveBeenCalledWith("このパターンを削除しますか？");
    expect(mockChromeStorage.sync.set).not.toHaveBeenCalled();
  });

  it("handles storage errors gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockChromeStorage.sync.get.mockRejectedValue(new Error("Storage error"));

    render(<PopupApp />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load patterns:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("shows multiple active patterns correctly", async () => {
    mockChromeStorage.sync.get.mockResolvedValue({
      regexPatterns: mockPatterns,
      activePatternIds: ["pattern1", "pattern2"],
    });

    render(<PopupApp />);

    await waitFor(() => {
      const userPattern = screen
        .getByText("User ID Pattern")
        .closest(".pattern-item");
      const productPattern = screen
        .getByText("Product Code Pattern")
        .closest(".pattern-item");

      expect(userPattern).toHaveClass("active");
      expect(productPattern).toHaveClass("active");

      const userCheckbox = userPattern?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      const productCheckbox = productPattern?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;

      expect(userCheckbox).toBeChecked();
      expect(productCheckbox).toBeChecked();
    });
  });

  it("migrates from legacy single active pattern", async () => {
    mockChromeStorage.sync.get.mockResolvedValue({
      regexPatterns: mockPatterns,
      activePatternId: "pattern2", // Legacy single pattern
    });

    render(<PopupApp />);

    await waitFor(() => {
      const productPattern = screen
        .getByText("Product Code Pattern")
        .closest(".pattern-item");
      expect(productPattern).toHaveClass("active");

      const checkbox = productPattern?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      expect(checkbox).toBeChecked();

      const userPattern = screen
        .getByText("User ID Pattern")
        .closest(".pattern-item");
      expect(userPattern).not.toHaveClass("active");
    });
  });

  it("handles empty active patterns array", async () => {
    mockChromeStorage.sync.get.mockResolvedValue({
      regexPatterns: mockPatterns,
      activePatternIds: [],
    });

    render(<PopupApp />);

    await waitFor(() => {
      const userPattern = screen
        .getByText("User ID Pattern")
        .closest(".pattern-item");
      const productPattern = screen
        .getByText("Product Code Pattern")
        .closest(".pattern-item");

      expect(userPattern).not.toHaveClass("active");
      expect(productPattern).not.toHaveClass("active");

      const userCheckbox = userPattern?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;
      const productCheckbox = productPattern?.querySelector(
        'input[type="checkbox"]'
      ) as HTMLInputElement;

      expect(userCheckbox).not.toBeChecked();
      expect(productCheckbox).not.toBeChecked();
    });
  });

  it("auto-activates first pattern when adding to empty list", async () => {
    mockChromeStorage.sync.get.mockResolvedValue({
      regexPatterns: [],
      activePatternIds: [],
    });

    render(<PopupApp />);

    await waitFor(() => {
      const toggleButton = screen.getByText("新しいパターンを追加");
      fireEvent.click(toggleButton);
    });

    const nameInput = screen.getByLabelText("パターン名:");
    const regexInput = screen.getByLabelText("正規表現:");
    const submitButton = screen.getByText("保存");

    fireEvent.change(nameInput, { target: { value: "First Pattern" } });
    fireEvent.change(regexInput, { target: { value: "test-\\d+" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockChromeStorage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          regexPatterns: expect.arrayContaining([
            expect.objectContaining({
              name: "First Pattern",
              regex: "test-\\d+",
            }),
          ]),
          activePatternIds: expect.arrayContaining([expect.any(String)]),
        })
      );

      // Check that the active IDs array has exactly one element
      const setCall =
        mockChromeStorage.sync.set.mock.calls[
          mockChromeStorage.sync.set.mock.calls.length - 1
        ];
      expect(setCall[0].activePatternIds).toHaveLength(1);
    });
  });

  describe("Export/Import functionality", () => {
    beforeEach(() => {
      global.URL.createObjectURL = vi.fn(() => "mock-blob-url");
      global.URL.revokeObjectURL = vi.fn();
    });

    it("should export settings as JSON", async () => {
      const createElementSpy = vi.spyOn(document, "createElement");
      const appendChildSpy = vi.spyOn(document.body, "appendChild");
      const removeChildSpy = vi.spyOn(document.body, "removeChild");

      render(<PopupApp />);

      await waitFor(() => {
        expect(screen.getByText("User ID Pattern")).toBeInTheDocument();
      });

      const exportButton = screen.getByText("設定をエクスポート");
      fireEvent.click(exportButton);

      expect(createElementSpy).toHaveBeenCalledWith("a");
      expect(appendChildSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should import valid settings", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            regexPatterns: [
              {
                id: "imported1",
                name: "Imported Pattern",
                regex: "[a-z]+",
                createdAt: 1234567890001,
              },
            ],
            activePatternIds: ["imported1"],
            exportedAt: "2023-01-01T00:00:00.000Z",
            version: "1.0",
          }),
        ],
        "test-settings.json",
        { type: "application/json" }
      );

      mockConfirm.mockReturnValue(true);

      render(<PopupApp />);

      await waitFor(() => {
        expect(screen.getByText("User ID Pattern")).toBeInTheDocument();
      });

      const importLabel = screen.getByLabelText("設定をインポート");
      const fileInput = importLabel.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      if (fileInput) {
        Object.defineProperty(fileInput, "files", {
          value: [mockFile],
          configurable: true,
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
          expect(mockConfirm).toHaveBeenCalledWith(
            "1個のパターンをインポートします。既存の設定は置き換えられます。続行しますか？"
          );
        });

        expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({
          regexPatterns: [
            {
              id: "imported1",
              name: "Imported Pattern",
              regex: "[a-z]+",
              createdAt: 1234567890001,
            },
          ],
          activePatternIds: ["imported1"],
        });
      }
    });

    it("should reject invalid JSON format", async () => {
      const mockFile = new File(["invalid json"], "invalid.json", {
        type: "application/json",
      });

      render(<PopupApp />);

      const importLabel = screen.getByLabelText("設定をインポート");
      const fileInput = importLabel.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      if (fileInput) {
        Object.defineProperty(fileInput, "files", {
          value: [mockFile],
          configurable: true,
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
          expect(mockAlert).toHaveBeenCalledWith(
            "ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。"
          );
        });
      }
    });

    it("should reject file with invalid regex patterns", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            regexPatterns: [
              {
                id: "invalid1",
                name: "Invalid Pattern",
                regex: "[invalid",
                createdAt: 1234567890002,
              },
            ],
            activePatternIds: ["invalid1"],
          }),
        ],
        "invalid-regex.json",
        { type: "application/json" }
      );

      render(<PopupApp />);

      const importLabel = screen.getByLabelText("設定をインポート");
      const fileInput = importLabel.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      if (fileInput) {
        Object.defineProperty(fileInput, "files", {
          value: [mockFile],
          configurable: true,
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
          expect(mockAlert).toHaveBeenCalledWith(
            "無効な正規表現が含まれています: Invalid Pattern - [invalid"
          );
        });
      }
    });

    it("should reject file without regexPatterns", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            someOtherData: "test",
          }),
        ],
        "missing-patterns.json",
        { type: "application/json" }
      );

      render(<PopupApp />);

      const importLabel = screen.getByLabelText("設定をインポート");
      const fileInput = importLabel.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      if (fileInput) {
        Object.defineProperty(fileInput, "files", {
          value: [mockFile],
          configurable: true,
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
          expect(mockAlert).toHaveBeenCalledWith(
            "無効なファイル形式です。正しい設定ファイルを選択してください。"
          );
        });
      }
    });

    it("should filter out invalid patterns during import", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            regexPatterns: [
              {
                id: "valid1",
                name: "Valid Pattern",
                regex: "[a-z]+",
                createdAt: 1234567890001,
              },
              {
                id: "invalid1",
                name: "Missing regex",
                createdAt: 1234567890002,
              },
              {
                name: "Missing ID",
                regex: "[0-9]+",
                createdAt: 1234567890003,
              },
            ],
            activePatternIds: ["valid1", "invalid1"],
          }),
        ],
        "mixed-patterns.json",
        { type: "application/json" }
      );

      mockConfirm.mockReturnValue(true);

      render(<PopupApp />);

      const importLabel = screen.getByLabelText("設定をインポート");
      const fileInput = importLabel.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      if (fileInput) {
        Object.defineProperty(fileInput, "files", {
          value: [mockFile],
          configurable: true,
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
          expect(mockConfirm).toHaveBeenCalledWith(
            "1個のパターンをインポートします。既存の設定は置き換えられます。続行しますか？"
          );
        });

        expect(mockChromeStorage.sync.set).toHaveBeenCalledWith({
          regexPatterns: [
            {
              id: "valid1",
              name: "Valid Pattern",
              regex: "[a-z]+",
              createdAt: 1234567890001,
            },
          ],
          activePatternIds: ["valid1"],
        });
      }
    });

    it("should handle user cancellation during import", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            regexPatterns: [
              {
                id: "test1",
                name: "Test Pattern",
                regex: "[a-z]+",
                createdAt: 1234567890001,
              },
            ],
            activePatternIds: ["test1"],
          }),
        ],
        "test-settings.json",
        { type: "application/json" }
      );

      mockConfirm.mockReturnValue(false);

      render(<PopupApp />);

      const importLabel = screen.getByLabelText("設定をインポート");
      const fileInput = importLabel.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      if (fileInput) {
        Object.defineProperty(fileInput, "files", {
          value: [mockFile],
          configurable: true,
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
          expect(mockConfirm).toHaveBeenCalled();
        });

        expect(mockChromeStorage.sync.set).not.toHaveBeenCalled();
      }
    });
  });
});
