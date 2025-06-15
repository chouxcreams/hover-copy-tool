import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SimpleButton from "./SimpleButton";

describe("SimpleButton", () => {
  it("renders with label", () => {
    render(<SimpleButton label="Test Button" onClick={() => {}} />);
    expect(
      screen.getByRole("button", { name: "Test Button" })
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<SimpleButton label="Click Me" onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies primary variant class by default", () => {
    render(<SimpleButton label="Primary" onClick={() => {}} />);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn", "btn-primary");
  });

  it("applies secondary variant class when specified", () => {
    render(
      <SimpleButton label="Secondary" onClick={() => {}} variant="secondary" />
    );
    const button = screen.getByRole("button");
    expect(button).toHaveClass("btn", "btn-secondary");
  });
});
