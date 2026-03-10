import type { ManualMasteryLevel, WordStats } from "@/lib/storage";

export const MANUAL_MASTERY_OPTIONS_ORDERED: { key: ManualMasteryLevel; label: string }[] = [
  { key: "remembered", label: "覚えた単語 (100%)" },
  { key: "almost", label: "ほぼ覚えた単語 (67%)" },
  { key: "vague", label: "うろ覚え単語 (34%)" },
  { key: "weak", label: "苦手単語 (0%)" },
  { key: "unlearned", label: "未学習単語" },
];

export function getDisplayedManualMastery(
  wordId: number,
  statsMap: Map<number, WordStats>,
  manualMap: Record<number, ManualMasteryLevel>
): ManualMasteryLevel {
  const manual = manualMap[wordId];
  const stats = statsMap.get(wordId);
  const attempts = stats?.totalAttempts ?? 0;
  if (manual && !(manual === "unlearned" && attempts > 0)) return manual;
  const accuracy = stats?.accuracy;
  if (attempts === 0) return "unlearned";
  if (accuracy === null || accuracy === undefined || accuracy < 34) return "weak";
  if (accuracy < 67) return "vague";
  if (accuracy < 100) return "almost";
  return "remembered";
}
