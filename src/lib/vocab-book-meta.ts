// 単語帳メタ情報（表示名・絵文字・グラデーション）の解決ロジック
// word-list/page.tsx と word-list/book/[bookId]/page.tsx で共有

import type { Course } from "@/data/words/types";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { RECOMMENDED_BOOKS } from "@/data/recommended-books";
import type { MyVocabBook } from "@/lib/vocabulary-books";
import type { ManualMasteryLevel } from "@/lib/storage";

export type BookDisplayMeta = {
  name: string;
  emoji: string;
  gradientClass: string;
};

export const COURSE_EMOJI: Record<string, string> = {
  junior: "📚",
  senior: "🏫",
  eiken: "📝",
  toeic: "💼",
  conversation: "💬",
  general: "📖",
  business: "🏢",
};

export const COURSE_GRADIENT: Record<string, string> = {
  junior: "from-blue-400 to-indigo-500",
  senior: "from-green-400 to-teal-500",
  eiken: "from-purple-400 to-pink-500",
  toeic: "from-emerald-600 to-cyan-700",
  conversation: "from-fuchsia-600 to-rose-700",
  general: "from-slate-400 to-slate-600",
  business: "from-orange-600 to-amber-700",
};

export const MASTERY_META: Record<ManualMasteryLevel, { name: string; emoji: string; gradient: string }> = {
  weak:       { name: "苦手単語",       emoji: "😓", gradient: "from-red-400 to-orange-500" },
  vague:      { name: "うろ覚え単語",   emoji: "🤔", gradient: "from-yellow-400 to-amber-500" },
  almost:     { name: "ほぼ覚えた単語", emoji: "😶", gradient: "from-blue-400 to-indigo-500" },
  remembered: { name: "覚えた単語",     emoji: "😊", gradient: "from-green-400 to-teal-500" },
  unlearned:  { name: "未学習単語",     emoji: "📖", gradient: "from-slate-400 to-slate-600" },
};

/** accuracy タイプのメタ情報。"75-100" は 75〜99% を意味し、"100" は 100% 専用 */
export const ACCURACY_META: Record<string, { name: string; emoji: string; gradient: string }> = {
  "0-25":   { name: "25%未満",    emoji: "😰", gradient: "from-rose-600 to-rose-700" },
  "25-50":  { name: "25~50%",     emoji: "😅", gradient: "from-orange-600 to-orange-700" },
  "50-75":  { name: "50~75%",     emoji: "🙂", gradient: "from-amber-600 to-amber-700" },
  "75-100": { name: "75~99%",     emoji: "😄", gradient: "from-sky-600 to-sky-700" },
  "100":    { name: "100%達成！",  emoji: "🎯", gradient: "from-violet-600 to-violet-700" },
};

/**
 * bookId を解析して表示用メタ情報を返す。
 * 未知の bookId の場合は null を返す。
 */
export function resolveBookMeta(bookId: string, myBooks: MyVocabBook[]): BookDisplayMeta | null {
  const parts = bookId.split(":");
  const type = parts[0];

  if (type === "course") {
    const course = parts[1] as Course;
    const stage = parts[2];
    const def = COURSE_DEFINITIONS[course];
    if (!def) return null;
    const stageDef = def.stages.find((s) => s.stage === stage);
    return {
      name: stageDef?.displayName ?? def.name,
      emoji: COURSE_EMOJI[course] ?? "📖",
      gradientClass: COURSE_GRADIENT[course] ?? "from-slate-400 to-slate-600",
    };
  }

  if (type === "mastery") {
    const level = parts[1] as ManualMasteryLevel;
    const m = MASTERY_META[level];
    if (!m) return null;
    return { name: m.name, emoji: m.emoji, gradientClass: m.gradient };
  }

  if (type === "accuracy") {
    const range = parts[1];
    const m = ACCURACY_META[range];
    if (!m) return null;
    return { name: m.name, emoji: m.emoji, gradientClass: m.gradient };
  }

  if (type === "recommended") {
    const id = parts.slice(1).join(":");
    const rec = RECOMMENDED_BOOKS.find((b) => b.id === id);
    if (!rec) return null;
    return { name: rec.name, emoji: rec.emoji, gradientClass: rec.gradientClass };
  }

  if (type === "my") {
    const uuid = parts.slice(1).join(":");
    const book = myBooks.find((b) => b.id === uuid);
    if (!book) return null;
    return { name: book.name, emoji: "📌", gradientClass: "from-primary-400 to-primary-600" };
  }

  return null;
}

/**
 * bookId から quiz の遷移先 URL を返す。
 * 完全なクイズパラメータ対応は course と mastery:weak のみ。
 * それ以外は /quiz にフォールバック。
 */
export function resolveQuizHref(bookId: string): string {
  const parts = bookId.split(":");
  const type = parts[0];
  if (type === "course") return `/quiz?course=${parts[1]}&stage=${parts[2]}`;
  if (type === "mastery" && parts[1] === "weak") return `/quiz?weakOnly=true`;
  // TODO: mastery(weak以外), accuracy, recommended タイプのクイズパラメータは未実装
  return "/quiz/settings";
}
