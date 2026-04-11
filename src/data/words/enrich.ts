import { DIFFICULTY_MAP } from "./difficulty";
import type { MasterWord, Word, Course, Stage } from "./types";

/**
 * MasterWord[] から特定コースの Word[] を生成する。
 * MasterWordの全フィールドを引き継ぎつつ、コース固有の導出フィールドを付与する。
 *
 * - meaning: CourseAssignment.meaning があればそれを使用、なければ MasterWord.meaning
 * - courses: MasterWordの全コース情報を引き継ぐ（word.coursesで他コース情報にアクセス可能）
 */
export function getWordsForCourse(
  masterWords: MasterWord[],
  course: Course,
  stage?: Stage,
): Word[] {
  return masterWords
    .filter((w) =>
      w.courses.some(
        (c) => c.course === course && (!stage || c.stage === stage),
      ),
    )
    .map((w) => {
      const assignment = w.courses.find(
        (c) => c.course === course && (!stage || c.stage === stage),
      )!;
      const diffKey = `${course}:${assignment.stage}`;
      const difficulty = DIFFICULTY_MAP[diffKey];
      if (!difficulty) {
        throw new Error(`No difficulty mapping for "${diffKey}" (word: ${w.word})`);
      }
      return {
        ...w,
        // コース固有meaningがあればそれを使用（クイズで出題される意味）
        meaning: assignment.meaning ?? w.meaning,
        course,
        stage: assignment.stage,
        difficulty,
        example: w.examples[0].en,
        exampleJa: w.examples[0].ja,
        category: w.categories[0],
        categories: [...w.categories],
        // コース別tier: assignment.tier があればそれを使用、なければ MasterWord.frequencyTier にフォールバック
        // docs/tier-calibration-policy.md 参照
        courseTier: assignment.tier ?? w.frequencyTier,
      };
    });
}
