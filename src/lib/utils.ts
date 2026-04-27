import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shouldIgnoreSurfaceHotkeys(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tagName = target.tagName.toLowerCase()
  if (tagName === "input" || tagName === "textarea" || tagName === "select") return true
  return Boolean(target.closest("[contenteditable='true'], [role='textbox'], [data-hotkey-scope='ignore']"))
}
