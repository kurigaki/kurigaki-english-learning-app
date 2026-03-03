import type { ManualMasteryLevel, WordStats } from "@/lib/storage";

export type MemoryLevel = ManualMasteryLevel;

export const MEMORY_LEVEL_ORDER: MemoryLevel[] = [
  "unlearned",
  "weak",
  "vague",
  "almost",
  "remembered",
];

export const memoryLevelLabels: Record<MemoryLevel, string> = {
  unlearned: "未学習",
  weak: "苦手 (0%)",
  vague: "うろ覚え (34%)",
  almost: "ほぼ覚えた (67%)",
  remembered: "覚えた (100%)",
};

export const memoryLevelBadgeClass: Record<MemoryLevel, string> = {
  unlearned: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600",
  weak: "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800/50",
  vague: "bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800/50",
  almost: "bg-lime-100 text-lime-700 border border-lime-200 dark:bg-lime-900/30 dark:text-lime-200 dark:border-lime-800/50",
  remembered: "bg-cyan-100 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-200 dark:border-cyan-800/50",
};

export const memoryLevelBarClass: Record<MemoryLevel, string> = {
  unlearned: "bg-slate-400 dark:bg-slate-500",
  weak: "bg-red-500 dark:bg-red-400",
  vague: "bg-yellow-400 dark:bg-yellow-300",
  almost: "bg-lime-500 dark:bg-lime-400",
  remembered: "bg-cyan-500 dark:bg-cyan-400",
};

export function getAutoMemoryLevel(
  accuracy: number | null,
  attempts: number
): MemoryLevel {
  if (attempts === 0) return "unlearned";
  if (accuracy === null || accuracy < 34) return "weak";
  if (accuracy < 67) return "vague";
  if (accuracy < 100) return "almost";
  return "remembered";
}

export function resolveMemoryLevel(
  wordId: number,
  statsMap: Map<number, WordStats>,
  manualMap: Record<number, ManualMasteryLevel>
): MemoryLevel {
  const stats = statsMap.get(wordId);
  const attempts = stats?.totalAttempts ?? 0;
  const manual = manualMap[wordId];
  // 学習済み単語で "未学習" が残っている場合は自動判定へフォールバック
  if (manual && !(manual === "unlearned" && attempts > 0)) return manual;
  return getAutoMemoryLevel(stats?.accuracy ?? null, attempts);
}
