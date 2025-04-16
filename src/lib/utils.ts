import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

export type Message = {
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

export const formatToMarkdown = (text: string): string => {
  return text
    .trim()
    .replace(/\*\*\s*Title\s*:\s*(.*?)\s*\*\*/gi, '# $1')
    .replace(/([a-zA-Z0-9])([.!?])\s+(?=[A-Z])/g, '$1$2\n\n')
    .replace(/\s{2,}/g, ' ')
}

export function fixSpacing(text: string): string {
  return (
    text
      // Add space after punctuation if missing
      .replace(/([,.!?])([^\s])/g, '$1 $2')
      // Add space after a word if directly followed by another word
      .replace(/([a-zA-Z])([A-Z])/g, '$1 $2')
      // Remove space before punctuation
      .replace(/\s+([,.!?])/g, '$1')
      // Collapse multiple spaces
      .replace(/\s{2,}/g, ' ')
      .trim()
  )
}
