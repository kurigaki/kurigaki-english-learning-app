import { describe, expect, it } from "vitest";
import {
  juniorWords,
  seniorWords,
  toeicWords,
  eikenWords,
  conversationWords,
} from "@/data/words";

const toSet = (arr: { word: string }[]) =>
  new Set(arr.map((w) => w.word.toLowerCase()));

describe("course coverage policy", () => {
  it("TOEIC 700/800/900 に中学基礎の具体語を混入させない", () => {
    const banned = new Set([
      "apple",
      "book",
      "cat",
      "dog",
      "pig",
      "cake",
      "meat",
      "banana",
      "orange",
      "lion",
      "tiger",
      "bird",
      "fish",
      "zoo",
      "sun",
      "moon",
      "star",
      "snow",
      "wind",
      "cloud",
    ]);

    const upper = toeicWords.filter((w) =>
      ["700", "800", "900"].includes(w.stage)
    );
    const found = upper.filter((w) => banned.has(w.word.toLowerCase()));
    expect(found, `Unexpected TOEIC upper-stage basics: ${found
      .map((w) => `${w.id}:${w.stage}:${w.word}`)
      .join(", ")}`).toHaveLength(0);
  });

  it("英検 pre2/2/pre1/1 に5級〜4級基礎語を混入させない", () => {
    const banned = new Set([
      "apple",
      "book",
      "cat",
      "dog",
      "pig",
      "cake",
      "meat",
      "zoo",
      "mother",
      "father",
      "sister",
      "brother",
      "spring",
      "summer",
      "autumn",
      "winter",
      "season",
      "flower",
      "tree",
      "head",
      "eye",
      "ear",
      "mouth",
      "nose",
      "hand",
      "foot",
    ]);

    const upper = eikenWords.filter((w) =>
      ["pre2", "2", "pre1", "1"].includes(w.stage)
    );
    const found = upper.filter((w) => banned.has(w.word.toLowerCase()));
    expect(found, `Unexpected Eiken upper-stage basics: ${found
      .map((w) => `${w.id}:${w.stage}:${w.word}`)
      .join(", ")}`).toHaveLength(0);
  });

  it("各コースの最低語数を維持する（カバレッジ下限）", () => {
    expect(juniorWords.length).toBeGreaterThanOrEqual(1500);
    expect(seniorWords.length).toBeGreaterThanOrEqual(650);
    expect(toeicWords.length).toBeGreaterThanOrEqual(800);
    expect(eikenWords.length).toBeGreaterThanOrEqual(900);
    expect(conversationWords.length).toBeGreaterThanOrEqual(650);
  });

  it("同一コース内で単語重複がない", () => {
    const courses = [
      ["junior", juniorWords],
      ["senior", seniorWords],
      ["toeic", toeicWords],
      ["eiken", eikenWords],
      ["conversation", conversationWords],
    ] as const;

    courses.forEach(([name, words]) => {
      const seen = new Set<string>();
      const dup: string[] = [];
      words.forEach((w) => {
        const key = w.word.toLowerCase();
        if (seen.has(key)) dup.push(`${w.id}:${w.word}`);
        seen.add(key);
      });
      expect(dup, `Duplicate words in ${name}: ${dup.join(", ")}`).toHaveLength(
        0
      );
    });
  });

  it("TOEIC ステージ別アンカー語を維持する", () => {
    const byStage = {
      "500": toSet(toeicWords.filter((w) => w.stage === "500")),
      "600": toSet(toeicWords.filter((w) => w.stage === "600")),
      "700": toSet(toeicWords.filter((w) => w.stage === "700")),
      "800": toSet(toeicWords.filter((w) => w.stage === "800")),
      "900": toSet(toeicWords.filter((w) => w.stage === "900")),
    } as const;

    const anchors: Record<keyof typeof byStage, string[]> = {
      "500": [
        "appointment",
        "invoice",
        "budget",
        "customer",
        "deadline",
        "payment",
        "contract",
        "reservation",
        "department",
        "employee",
      ],
      "600": [
        "comply",
        "incentive",
        "authorize",
        "asset",
        "allocate",
        "evaluate",
        "eligible",
        "deficit",
        "compensate",
        "consolidate",
      ],
      "700": [
        "acquisition",
        "cashflow",
        "compliance",
        "contingency",
        "mitigate",
        "remittance",
        "portfolio",
        "reconcile",
        "subsidy",
        "underwriting",
      ],
      "800": [
        "calibrate",
        "circumvent",
        "disseminate",
        "streamline",
        "stringent",
        "assessment",
        "credibility",
        "disclosure",
        "integrate",
        "optimize",
      ],
      "900": [
        "liquidity",
        "ratification",
        "amortization",
        "arbitrage",
        "covenant",
        "embezzlement",
        "indemnity",
        "subpoena",
        "rectify",
        "promulgate",
      ],
    };

    (Object.keys(anchors) as Array<keyof typeof byStage>).forEach((stage) => {
      const missing = anchors[stage].filter((w) => !byStage[stage].has(w));
      expect(
        missing,
        `Missing TOEIC anchors at stage ${stage}: ${missing.join(", ")}`
      ).toHaveLength(0);
    });
  });

  it("英検 ステージ別アンカー語を維持する", () => {
    const byStage = {
      "5": toSet(eikenWords.filter((w) => w.stage === "5")),
      "4": toSet(eikenWords.filter((w) => w.stage === "4")),
      "3": toSet(eikenWords.filter((w) => w.stage === "3")),
      pre2: toSet(eikenWords.filter((w) => w.stage === "pre2")),
      "2": toSet(eikenWords.filter((w) => w.stage === "2")),
      pre1: toSet(eikenWords.filter((w) => w.stage === "pre1")),
      "1": toSet(eikenWords.filter((w) => w.stage === "1")),
    } as const;

    const anchors: Record<keyof typeof byStage, string[]> = {
      "5": ["today", "weather", "homework", "family", "station"],
      "4": ["agree", "arrive", "borrow", "culture", "dangerous"],
      "3": ["communicate", "environment", "government", "technology", "solution"],
      pre2: ["sustainable", "financial", "influence", "consumer", "significantly"],
      "2": ["legislation", "controversy", "ethical", "validate", "coherent"],
      pre1: ["consensus", "scrutiny", "adverse", "compliance", "transparent"],
      "1": ["ubiquitous", "ephemeral", "conundrum", "disseminate", "inscrutable"],
    };

    (Object.keys(anchors) as Array<keyof typeof byStage>).forEach((stage) => {
      const missing = anchors[stage].filter((w) => !byStage[stage].has(w));
      expect(
        missing,
        `Missing Eiken anchors at stage ${stage}: ${missing.join(", ")}`
      ).toHaveLength(0);
    });
  });
});
