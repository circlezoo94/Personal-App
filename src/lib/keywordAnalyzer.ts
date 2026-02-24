import type { KeywordEntry } from "@/types/analysis";

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
  "for", "of", "with", "is", "it", "this", "that", "was", "are",
  "be", "as", "by", "from", "we", "i", "my", "our", "your", "their",
  "they", "he", "she", "his", "her", "have", "had", "has", "not",
  "no", "can", "will", "do", "did", "would", "could", "should",
  "very", "just", "so", "than", "then", "when", "what", "which",
  "who", "how", "its", "also", "been", "more", "were", "me", "you",
  "up", "out", "about", "get", "got", "use", "used", "all", "one",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

export function extractKeywords(texts: string[], topN = 20): KeywordEntry[] {
  const frequency: Map<string, number> = new Map();
  for (const text of texts) {
    const tokens = tokenize(text);
    for (const token of tokens) {
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
  }
  return Array.from(frequency.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}
