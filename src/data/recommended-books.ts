import type { Course } from "@/data/words/types";

export type RecommendedBook = {
  /** `recommended:${id}` の id 部分 */
  id: string;
  name: string;
  description: string;
  emoji: string;
  /** この単語帳に含めるコース（複数可） */
  courses: Course[];
  /** グラデーションの Tailwind クラス */
  gradientClass: string;
};

export const RECOMMENDED_BOOKS: RecommendedBook[] = [
  {
    id: "高校入試頻出",
    name: "高校入試頻出単語",
    description: "高校受験で頻出の必須単語",
    emoji: "✏️",
    courses: ["junior"],
    gradientClass: "from-blue-600 to-indigo-700",
  },
  {
    id: "大学入試頻出",
    name: "大学入試頻出単語",
    description: "大学受験・共通テスト頻出単語",
    emoji: "🎓",
    courses: ["senior"],
    gradientClass: "from-purple-600 to-violet-700",
  },
  {
    id: "ビジネスメール頻出",
    name: "ビジネスメール頻出",
    description: "ビジネスメール・報告書でよく使う表現",
    emoji: "💼",
    courses: ["business"],
    gradientClass: "from-slate-600 to-slate-800",
  },
  {
    id: "日常会話フレーズ",
    name: "日常会話フレーズ",
    description: "日常の英会話で使えるフレーズ集",
    emoji: "💬",
    courses: ["conversation"],
    gradientClass: "from-green-600 to-teal-700",
  },
];
