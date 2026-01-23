"use client";

type MasteryLevel = "new" | "learning" | "familiar" | "mastered";

type WordMasteryProps = {
  accuracy: number | null; // 0-100 or null if not studied
  totalAttempts: number;
};

const getMasteryLevel = (accuracy: number | null, attempts: number): MasteryLevel => {
  if (attempts === 0 || accuracy === null) return "new";
  if (accuracy >= 80 && attempts >= 3) return "mastered";
  if (accuracy >= 60) return "familiar";
  return "learning";
};

const MASTERY_CONFIG: Record<MasteryLevel, { label: string; emoji: string; color: string; bgColor: string }> = {
  new: {
    label: "未学習",
    emoji: "🆕",
    color: "text-slate-500",
    bgColor: "bg-slate-100",
  },
  learning: {
    label: "学習中",
    emoji: "📖",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  familiar: {
    label: "習得中",
    emoji: "📝",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  mastered: {
    label: "習得済み",
    emoji: "✅",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
};

export const WordMastery = ({ accuracy, totalAttempts }: WordMasteryProps) => {
  const level = getMasteryLevel(accuracy, totalAttempts);
  const config = MASTERY_CONFIG[level];

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{config.emoji}</span>
        <div>
          <p className={`font-bold ${config.color}`}>{config.label}</p>
          <p className="text-xs text-slate-400">
            {totalAttempts > 0 ? `${totalAttempts}回学習 / 正答率${accuracy ?? 0}%` : "まだ学習していません"}
          </p>
        </div>
      </div>
      {/* 記憶度バー */}
      {totalAttempts > 0 && (
        <div className="w-24">
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${level === "mastered" ? "bg-green-500" : level === "familiar" ? "bg-blue-500" : "bg-orange-500"}`}
              style={{ width: `${accuracy ?? 0}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
