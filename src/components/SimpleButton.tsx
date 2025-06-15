import type React from "react";

interface SimpleButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

const SimpleButton: React.FC<SimpleButtonProps> = ({
  label,
  onClick,
  variant = "primary",
}) => {
  const baseClasses = "btn";
  const variantClass = variant === "primary" ? "btn-primary" : "btn-secondary";

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantClass}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default SimpleButton;
