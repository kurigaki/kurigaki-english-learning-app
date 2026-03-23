import { describe, expect, it } from "vitest";
import { words, categoryLabels } from "@/data/words";

const getCategories = (w: (typeof words)[number]) =>
  w.categories && w.categories.length > 0 ? w.categories : [w.category];

describe("category classification quality", () => {
  it("カテゴリは定義済みラベルに一致し、主カテゴリを必ず含む", () => {
    const valid = new Set(Object.keys(categoryLabels));
    const invalid: string[] = [];
    const inconsistent: string[] = [];

    words.forEach((w) => {
      const cats = getCategories(w);
      cats.forEach((c) => {
        if (!valid.has(c)) invalid.push(`${w.id}:${w.word}:${c}`);
      });
      if (!cats.includes(w.category)) {
        inconsistent.push(`${w.id}:${w.word}:${w.category}`);
      }
    });

    expect(invalid, `Invalid categories: ${invalid.join(", ")}`).toHaveLength(0);
    expect(
      inconsistent,
      `Primary category missing in categories[]: ${inconsistent.join(", ")}`
    ).toHaveLength(0);
  });

  it("apple/happy が技術・ITに誤分類されない", () => {
    const targets = words.filter((w) =>
      ["apple", "happy"].includes(w.word.toLowerCase())
    );
    expect(targets.length).toBeGreaterThan(0);

    const misclassified = targets.filter((w) =>
      getCategories(w).includes("technology")
    );

    expect(
      misclassified.map((w) => `${w.id}:${w.word}:${getCategories(w).join("|")}`),
      "apple/happy should not be classified as technology"
    ).toHaveLength(0);
  });

  it("run を含む慣用表現がスポーツに誤分類されない", () => {
    const targets = words.filter((w) =>
      ["in the long run", "run it up the flagpole", "run interference"].includes(
        w.word.toLowerCase()
      )
    );
    expect(targets.length).toBe(3);

    const misclassified = targets.filter((w) =>
      getCategories(w).includes("sports")
    );
    expect(
      misclassified.map((w) => `${w.id}:${w.word}:${getCategories(w).join("|")}`),
      "run-idioms should not be classified as sports"
    ).toHaveLength(0);
  });
});
