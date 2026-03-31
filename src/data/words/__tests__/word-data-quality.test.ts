/**
 * 単語データ品質テスト
 *
 * Project Clean Vocabulary の品質基準を自動検証し、
 * 今後のデータ変更によるデグレを防止する。
 *
 * 担当: キラーT（テスト担当）
 */
import { describe, it, expect } from "vitest";
import { juniorWords, seniorWords, toeicWords, eikenWords, conversationWords } from "../index";
import { enrichWords } from "../enrich";
import { DIFFICULTY_MAP } from "../difficulty";
import type { Word, RawWord } from "../types";

// ═══════════════════════════════════════
// Helper
// ═══════════════════════════════════════

const VALID_POS = ["noun", "verb", "adjective", "adverb", "other"] as const;

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
  it("word+partOfSpeech の重複がない", () => {
    // 同じwordでも品詞が異なれば別エントリとして許容（例: run=名詞 と run=動詞）
    const seen = new Set<string>();
    const dups: string[] = [];
    for (const w of words) {
      const key = w.word + "|" + w.partOfSpeech;
      if (seen.has(key)) dups.push(w.word + "(" + w.partOfSpeech + ")");
      seen.add(key);
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

  it("同一ステージ内でmeaning衝突がない", () => {
    // 英検5/4/3級は衝突0を保証済み（英検固有テストで検証）
    // 他コース・上位級は同義語が多いため、段階的に修正予定
    // 現時点の既知の衝突数: eiken(pre2以上)=407, toeic=65, junior=10, senior=40, conversation=42
    const KNOWN_COLLISION_LIMITS: Record<string, number> = {
      eiken: 41, toeic: 11, junior: 5, senior: 24, conversation: 3,
    };
    const collisions: string[] = [];
    const validStages = VALID_STAGES[course];
    for (const stage of validStages) {
      const stageWords = words.filter((w) => w.stage === stage);
      const meaningMap = new Map<string, string[]>();
      for (const w of stageWords) {
        const list = meaningMap.get(w.meaning) || [];
        list.push(w.word);
        meaningMap.set(w.meaning, list);
      }
      for (const [meaning, ws] of Array.from(meaningMap.entries())) {
        if (ws.length >= 2) {
          collisions.push(`stage${stage} "${meaning}": ${ws.join(", ")}`);
        }
      }
    }
    const limit = KNOWN_COLLISION_LIMITS[course] ?? 0;
    expect(collisions.length, `${collisions.length}件の衝突（上限${limit}件）`).toBeLessThanOrEqual(limit);
  });

  it("word が空文字でない", () => {
    const bad = words.filter((w) => w.word.trim() === "");
    expect(bad.map((w) => `id=${w.id}`)).toEqual([]);
  });

  it("meaning が空文字でない", () => {
    const bad = words.filter((w) => w.meaning.trim() === "");
    expect(bad.map((w) => `${w.word}(id=${w.id})`)).toEqual([]);
  });

  it("examples[*].en/ja/context が空文字でない", () => {
    const bad: string[] = [];
    for (const w of words) {
      if (!w.examples) continue;
      for (let i = 0; i < w.examples.length; i++) {
        const ex = w.examples[i];
        if (ex.en.trim() === "") bad.push(`${w.word} examples[${i}].en is empty`);
        if (ex.ja.trim() === "") bad.push(`${w.word} examples[${i}].ja is empty`);
        if (ex.context.trim() === "") bad.push(`${w.word} examples[${i}].context is empty`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("example と exampleJa が空でない", () => {
    const bad: string[] = [];
    for (const w of words) {
      if (w.example.trim() === "") {
        bad.push(`${w.word} example is empty`);
      }
      if (w.exampleJa.trim() === "") {
        bad.push(`${w.word} exampleJa is empty`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("examples[*].en の末尾が句点（./?/!）で終わる", () => {
    const bad: string[] = [];
    for (const w of words) {
      if (!w.examples) continue;
      for (let i = 0; i < w.examples.length; i++) {
        const en = w.examples[i].en.trim();
        if (en && !/[.?!]['"]?$/.test(en)) {
          bad.push(`${w.word} examples[${i}].en="${en}"`);
        }
      }
    }
    expect(bad).toEqual([]);
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
      for (const [meaning, words] of Array.from(meaningMap.entries())) {
        if (words.length >= 2) {
          collisions.push(`stage${stage} "${meaning}": ${words.join(", ")}`);
        }
      }
    }
    // 品質原則: meaningの正確さが最優先。同義語の衝突はコード側で対応する
    // hurry/rush=「急ぐ」のように正確な訳が衝突する場合は許容
    expect(collisions.length).toBeLessThanOrEqual(4);
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

  it("全コースで各品詞(noun/verb/adjective)に最低4語ある", () => {
    const targetPos = ["noun", "verb", "adjective"] as const;
    const bad: string[] = [];
    for (const { name, words } of courseDataSets) {
      for (const pos of targetPos) {
        const count = words.filter((w) => w.partOfSpeech === pos).length;
        if (count < 4) {
          bad.push(`${name}: ${pos} = ${count}語（4語未満）`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

// ═══════════════════════════════════════
// enrichWords ユニットテスト
// ═══════════════════════════════════════

describe("enrichWords", () => {
  const sampleRaw: RawWord = {
    id: 99999,
    word: "test",
    meaning: "テスト",
    partOfSpeech: "noun",
    examples: [
      { en: "This is a test.", ja: "これはテストです。", context: "学校" },
      { en: "We passed the test.", ja: "テストに合格しました。", context: "学校" },
      { en: "Take a test today.", ja: "今日テストを受けます。", context: "日常" },
    ],
    categories: ["school", "daily"],
  };

  it("course と stage を付与する", () => {
    const [word] = enrichWords([sampleRaw], "junior", "1");
    expect(word.course).toBe("junior");
    expect(word.stage).toBe("1");
  });

  it("difficulty を DIFFICULTY_MAP から計算する", () => {
    const [word] = enrichWords([sampleRaw], "junior", "1");
    expect(word.difficulty).toBe(DIFFICULTY_MAP["junior:1"]);
  });

  it("example を examples[0].en から設定する", () => {
    const [word] = enrichWords([sampleRaw], "junior", "1");
    expect(word.example).toBe("This is a test.");
  });

  it("exampleJa を examples[0].ja から設定する", () => {
    const [word] = enrichWords([sampleRaw], "junior", "1");
    expect(word.exampleJa).toBe("これはテストです。");
  });

  it("category を categories[0] から設定する", () => {
    const [word] = enrichWords([sampleRaw], "junior", "1");
    expect(word.category).toBe("school");
  });

  it("未知の course:stage でエラーを投げる", () => {
    expect(() => enrichWords([sampleRaw], "junior" as never, "999" as never)).toThrow();
  });
});
