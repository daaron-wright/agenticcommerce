"use client";

// Basic button component if shadcn/ui is not available
import type React from "react";

type ButtonProps = {
  variant?: "default" | "outline" | "ghost" | "gold" | "grey" | "black";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export function Button({
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  onClick,
  children,
  style,
}: ButtonProps) {
  // Base classes
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors";

  // Size classes
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  };

  // Variant classes
  const variantClasses = {
    default:
      "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90",
    outline:
      "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50",
    ghost:
      "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
    gold: "border border-[#a18b5c] bg-white text-[#a18b5c] hover:bg-[rgba(161,139,92,0.1)]",
    grey: "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-700",
    black: "border border-black bg-white text-black hover:bg-gray-100",
  };

  // Disabled classes
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed pointer-events-none"
    : "";

  // Combine all classes
  const allClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`;

  return (
    <button
      className={allClasses}
      disabled={disabled}
      onClick={onClick}
      type="button"
      style={style}
    >
      {children}
    </button>
  );
}
