import { NextRequest, NextResponse } from "next/server";
import { allWords, getWordsByCourse } from "@/data/words";
import type { Course, Stage } from "@/data/words/types";

type DungeonQuestion = {
  wordId: number;
  word: string;
  ans: string;
  ch: string[];
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

  // 出題対象単語
  let pool = course ? getWordsByCourse(course, stage ?? undefined) : allWords;
  if (wordIdsParam) {
    const ids = new Set(wordIdsParam.split(",").map(Number).filter((n) => !Number.isNaN(n)));
    pool = allWords.filter((w) => ids.has(w.id));
  }
  const selected = shuffleArray(pool).slice(0, limit);

  // 誤答候補：全単語の meaning から重複除去
  const allMeanings = Array.from(new Set(allWords.map((w) => w.meaning)));

  const questions: DungeonQuestion[] = selected.map((w) => {
    const ans = w.meaning;
    const distractors = shuffleArray(allMeanings.filter((m) => m !== ans)).slice(0, 3);
    const ch = shuffleArray([ans, ...distractors]);
    return { wordId: w.id, word: w.word, ans, ch };
  });

  return NextResponse.json(questions);
}
