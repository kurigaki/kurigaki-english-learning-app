import { NextRequest, NextResponse } from "next/server";
import { allWords, getWordsByCourse } from "@/data/words";
import type { Course, Stage } from "@/data/words/types";

// APIキャッシュを無効化（毎回ランダムな問題を生成）
export const dynamic = "force-dynamic";

type DungeonQuestion = {
  wordId: number;
  word: string;
  ans: string;
  ch: string[];
  stage?: string;
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const course = params.get("course") as Course | null;
  const stage = params.get("stage") as Stage | null;
  const limit = Math.min(parseInt(params.get("limit") ?? "150", 10), 500);
  const wordIdsParam = params.get("wordIds");
  const wordLevel = params.get("wordLevel") ?? "standard"; // essential/standard/all
  const contentFilter = params.get("contentFilter") === "1";

  // 出題対象単語
  let pool = course ? getWordsByCourse(course, stage ?? undefined) : allWords;

  // コンテンツフィルタ（センシティブ単語を除外）
  if (contentFilter) {
    pool = pool.filter((w) => !w.contentFlags || w.contentFlags.length === 0);
  }

  // 頻出度ティアフィルタ（コース別 courseTier を優先）
  if (wordLevel !== "all") {
    const maxTier = wordLevel === "essential" ? 1 : 2;
    pool = pool.filter((w) => w.courseTier <= maxTier);
  }
  if (wordIdsParam) {
    const ids = new Set(wordIdsParam.split(",").map(Number).filter((n) => !Number.isNaN(n)));
    pool = allWords.filter((w) => ids.has(w.id));
    if (contentFilter) {
      pool = pool.filter((w) => !w.contentFlags || w.contentFlags.length === 0);
    }
  }
  const selected = shuffleArray(pool).slice(0, limit);

  // 誤答候補：全単語の meaning から重複除去（コンテンツフィルタ適用）
  const distractorSource = contentFilter
    ? allWords.filter((w) => !w.contentFlags || w.contentFlags.length === 0)
    : allWords;
  const allMeanings = Array.from(new Set(distractorSource.map((w) => w.meaning)));

  const questions: DungeonQuestion[] = selected.map((w) => {
    const ans = w.meaning;
    const distractors = shuffleArray(allMeanings.filter((m) => m !== ans)).slice(0, 3);
    const ch = shuffleArray([ans, ...distractors]);
    // stage は progressive モード（コース全体選択）でフロア別フィルタに使用
    const q: DungeonQuestion = { wordId: w.id, word: w.word, ans, ch };
    if (course && !stage && "stage" in w && w.stage) q.stage = String(w.stage);
    return q;
  });

  return NextResponse.json(questions);
}
