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
});
