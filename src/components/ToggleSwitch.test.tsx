import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ToggleSwitch from "./ToggleSwitch";

describe("ToggleSwitch", () => {
  it("renders with correct initial state", () => {
    const mockOnChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={mockOnChange} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("renders as checked when checked prop is true", () => {
    const mockOnChange = vi.fn();
    render(<ToggleSwitch checked={true} onChange={mockOnChange} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("calls onChange when clicked", () => {
    const mockOnChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={mockOnChange} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with correct value when toggled from checked to unchecked", () => {
    const mockOnChange = vi.fn();
    render(<ToggleSwitch checked={true} onChange={mockOnChange} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  it("does not call onChange when disabled", () => {
    const mockOnChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={mockOnChange} disabled={true} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();

    fireEvent.click(checkbox);
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("applies custom className", () => {
    const mockOnChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={mockOnChange} className="custom-class" />);

    const label = screen.getByRole("checkbox").closest("label");
    expect(label).toHaveClass("toggle-switch");
    expect(label).toHaveClass("custom-class");
  });

  it("has correct accessibility attributes", () => {
    const mockOnChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={mockOnChange} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("prevents onChange when disabled even with direct input change", () => {
    const mockOnChange = vi.fn();
    render(<ToggleSwitch checked={false} onChange={mockOnChange} disabled={true} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.change(checkbox, { target: { checked: true } });

    expect(mockOnChange).not.toHaveBeenCalled();
  });
});