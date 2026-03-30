/**
 * 単語データ品質テスト
 *
 * Project Clean Vocabulary の品質基準を自動検証し、
 * 今後のデータ変更によるデグレを防止する。
 *
 * 担当: キラーT（テスト担当）
 */
import { describe, it, expect } from "vitest";
import { allWords, juniorWords, seniorWords, toeicWords, eikenWords, conversationWords } from "../index";
import type { Word } from "../types";

// ═══════════════════════════════════════
// Helper
// ═══════════════════════════════════════

const VALID_POS = ["noun", "verb", "adjective", "adverb", "other"] as const;

const STAGE_DIFFICULTY_MAP: Record<string, number> = {
  // eiken
  "5": 1, "4": 2, "3": 3, "pre2": 4, "2": 5, "pre1": 6, "1": 7,
  // toeic
  "500": 3, "600": 4, "700": 5, "800": 6, "900": 7,
};

const VALID_STAGES: Record<string, string[]> = {
  eiken: ["5", "4", "3", "pre2", "2", "pre1", "1"],
  toeic: ["500", "600", "700", "800", "900"],
  junior: ["1", "2", "3"],
  senior: ["1", "2", "3"],
  conversation: ["1", "2", "3", "4", "5"],
};

type CourseDataSet = { name: string; words: Word[]; course: string };

const courseDataSets: CourseDataSet[] = [
  { name: "英検", words: eikenWords, course: "eiken" },
  { name: "TOEIC", words: toeicWords, course: "toeic" },
  { name: "中学", words: juniorWords, course: "junior" },
  { name: "高校", words: seniorWords, course: "senior" },
  { name: "会話", words: conversationWords, course: "conversation" },
];

// ═══════════════════════════════════════
// 全コース共通テスト
// ═══════════════════════════════════════

describe.each(courseDataSets)("$name コース", ({ words, course }) => {
  it("word の重複がない", () => {
    const seen = new Set<string>();
    const dups: string[] = [];
    for (const w of words) {
      if (seen.has(w.word)) dups.push(w.word);
      seen.add(w.word);
    }
    expect(dups).toEqual([]);
  });

  it("ID の重複がない", () => {
    const seen = new Set<number>();
    const dups: number[] = [];
    for (const w of words) {
      if (seen.has(w.id)) dups.push(w.id);
      seen.add(w.id);
    }
    expect(dups).toEqual([]);
  });

  it("全エントリに examples が3件ある", () => {
    const bad = words.filter((w) => !w.examples || w.examples.length !== 3);
    expect(bad.map((w) => w.word)).toEqual([]);
  });

  it("meaning が10文字以内", () => {
    const bad = words.filter((w) => w.meaning.length > 10);
    expect(bad.map((w) => `${w.word}=${w.meaning}(${w.meaning.length})`)).toEqual([]);
  });

  it("partOfSpeech が正しい値", () => {
    const bad = words.filter((w) => !(VALID_POS as readonly string[]).includes(w.partOfSpeech));
    expect(bad.map((w) => `${w.word}=${w.partOfSpeech}`)).toEqual([]);
  });

  it("course フィールドが正しい", () => {
    const bad = words.filter((w) => w.course !== course);
    expect(bad.map((w) => `${w.word}:course=${w.course}`)).toEqual([]);
  });

  it("stage が正しい値", () => {
    const validStages = VALID_STAGES[course];
    const bad = words.filter((w) => !validStages.includes(w.stage));
    expect(bad.map((w) => `${w.word}:stage=${w.stage}`)).toEqual([]);
  });

  it("壊れた例文（バックスラッシュ）がない", () => {
    const bad = words.filter((w) => {
      const str = JSON.stringify(w);
      return str.includes("\\\\");
    });
    expect(bad.map((w) => w.word)).toEqual([]);
  });
});

// ═══════════════════════════════════════
// 英検コース固有テスト
// ═══════════════════════════════════════

describe("英検コース固有", () => {
  it("stage-difficulty 対応が正しい", () => {
    const eikenDiffMap: Record<string, number> = {
      "5": 1, "4": 2, "3": 3, "pre2": 4, "2": 5, "pre1": 6, "1": 7,
    };
    const bad = eikenWords.filter((w) => w.difficulty !== eikenDiffMap[w.stage]);
    expect(bad.map((w) => `${w.word}:stage=${w.stage},diff=${w.difficulty}`)).toEqual([]);
  });

  it("累積語数が目標を達成", () => {
    const stageCounts: Record<string, number> = {};
    for (const w of eikenWords) {
      stageCounts[w.stage] = (stageCounts[w.stage] || 0) + 1;
    }
    const grade3 = (stageCounts["5"] || 0) + (stageCounts["4"] || 0) + (stageCounts["3"] || 0);
    const pre2 = grade3 + (stageCounts["pre2"] || 0);
    const grade2 = pre2 + (stageCounts["2"] || 0);

    expect(grade3).toBeGreaterThanOrEqual(2000);
    expect(pre2).toBeGreaterThanOrEqual(3500);
    expect(grade2).toBeGreaterThanOrEqual(5000);
  });

  it("各ステージの動詞比率が14.9%以上", () => {
    for (const stage of ["5", "4", "3", "pre2", "2", "pre1", "1"]) {
      const stageWords = eikenWords.filter((w) => w.stage === stage);
      const verbCount = stageWords.filter((w) => w.partOfSpeech === "verb").length;
      const ratio = verbCount / stageWords.length;
      expect(ratio, `stage ${stage}: ${verbCount}/${stageWords.length}`).toBeGreaterThanOrEqual(0.149);
    }
  });

  it("5/4/3級で同一ステージのmeaning衝突がない", () => {
    const collisions: string[] = [];
    for (const stage of ["5", "4", "3"]) {
      const stageWords = eikenWords.filter((w) => w.stage === stage);
      const meaningMap = new Map<string, string[]>();
      for (const w of stageWords) {
        const list = meaningMap.get(w.meaning) || [];
        list.push(w.word);
        meaningMap.set(w.meaning, list);
      }
      for (const [meaning, words] of meaningMap) {
        if (words.length >= 2) {
          collisions.push(`stage${stage} "${meaning}": ${words.join(", ")}`);
        }
      }
    }
    expect(collisions).toEqual([]);
  });

  it("I始まり例文が15%未満（5/4/3級）", () => {
    for (const stage of ["5", "4", "3"]) {
      const stageWords = eikenWords.filter((w) => w.stage === stage);
      const iStart = stageWords.filter(
        (w) => w.example?.startsWith("I ") || w.example?.startsWith("I'")
      ).length;
      const ratio = iStart / stageWords.length;
      expect(ratio, `stage ${stage}`).toBeLessThan(0.15);
    }
  });

  it("必須語が含まれている", () => {
    const wordSet = new Set(eikenWords.map((w) => w.word.toLowerCase()));
    const essential = [
      "have", "be", "do", "go", "come", "get", "make", "take", "give",
      "man", "woman", "life", "health", "event", "language",
      "discuss", "although", "whether", "necessary", "environment",
      "technology", "opportunity", "realize", "way", "thank",
    ];
    const missing = essential.filter((w) => !wordSet.has(w));
    expect(missing).toEqual([]);
  });
});

// ═══════════════════════════════════════
// 全コース統合テスト
// ═══════════════════════════════════════

describe("全コース統合", () => {
  it("コース間でIDが衝突しない", () => {
    const seen = new Set<number>();
    const conflicts: string[] = [];
    for (const { name, words } of courseDataSets) {
      for (const w of words) {
        if (seen.has(w.id)) conflicts.push(`${name}:${w.word}(id=${w.id})`);
        seen.add(w.id);
      }
    }
    expect(conflicts).toEqual([]);
  });

  it("各品詞に4語以上ある（クイズ4択生成可能）", () => {
    for (const pos of VALID_POS) {
      const count = eikenWords.filter((w) => w.partOfSpeech === pos).length;
      expect(count, pos).toBeGreaterThanOrEqual(4);
    }
  });
});
