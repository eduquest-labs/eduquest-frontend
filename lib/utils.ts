import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * id-ID's ICU data separates time parts with "." (17.45.16). Formats with
 * this formatter and swaps the separator to ":" for the conventional look.
 */
export function formatTimeID(formatter: Intl.DateTimeFormat, date: Date) {
  return formatter
    .formatToParts(date)
    .map((part) => (part.type === "literal" && part.value === "." ? ":" : part.value))
    .join("");
}
