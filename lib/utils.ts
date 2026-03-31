import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single class string.
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind CSS class conflicts.
 *
 * @param inputs - Class values to be merged
 * @returns A single class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
