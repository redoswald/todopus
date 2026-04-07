import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parse pasted text into individual task lines, stripping markdown checkbox prefixes. */
export function parseBulkPasteLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim().replace(/^[-*]\s*(\[.\]\s*)?/, '').trim())
    .filter(Boolean)
}

/** Returns true when pasted text would produce 2+ tasks. */
export function isBulkPaste(text: string): boolean {
  return parseBulkPasteLines(text).length >= 2
}
