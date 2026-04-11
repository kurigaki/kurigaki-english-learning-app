import { DIFFICULTY_MAP } from "./difficulty";
import { COURSE_DEFINITIONS } from "./courses";
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

/**
 * COURSE_DEFINITIONS.stages の序列に基づいて [fromStage, toStage] の範囲に含まれる
 * 全 Stage を返す。ユーザーが指定した順序に関わらず、内部で昇順に揃える。
 *
 * 例: eiken で fromStage="5", toStage="3" → ["5", "4", "3"]
 * 例: conversation で fromStage="a1", toStage="b1" → ["a1", "a2", "b1"]
 */
export function getStagesInRange(
  course: Course,
  fromStage: Stage,
  toStage: Stage,
): Stage[] {
  const stages = COURSE_DEFINITIONS[course].stages;
  const fromIdx = stages.findIndex((s) => s.stage === fromStage);
  const toIdx = stages.findIndex((s) => s.stage === toStage);
  if (fromIdx < 0 || toIdx < 0) {
    throw new Error(
      `Stage not found in course "${course}": fromStage="${fromStage}" toStage="${toStage}"`,
    );
  }
  const minIdx = Math.min(fromIdx, toIdx);
  const maxIdx = Math.max(fromIdx, toIdx);
  return stages.slice(minIdx, maxIdx + 1).map((s) => s.stage);
}

/**
 * MasterWord[] からコース内の連続ステージ範囲に属する Word[] を生成する。
 *
 * 1 語が複数ステージに所属する場合は、範囲内のうち最上位（toStage に近い）の
 * assignment を採用する（より新しい学習目標として扱う）。
 */
export function getWordsForCourseStageRange(
  masterWords: MasterWord[],
  course: Course,
  fromStage: Stage,
  toStage: Stage,
): Word[] {
  const rangeStages = getStagesInRange(course, fromStage, toStage);
  // 範囲内の序列 index（toStage に近いほど大きい値）
  const stageRank = new Map<Stage, number>();
  rangeStages.forEach((s, i) => stageRank.set(s, i));

  const result: Word[] = [];
  for (const w of masterWords) {
    // 範囲内のすべての assignment を収集し、最上位のものを採用
    let bestAssignment: { stage: Stage; rank: number; meaning?: string; tier?: 1 | 2 | 3 } | null = null;
    for (const a of w.courses) {
      if (a.course !== course) continue;
      const rank = stageRank.get(a.stage);
      if (rank === undefined) continue;
      if (!bestAssignment || rank > bestAssignment.rank) {
        bestAssignment = { stage: a.stage, rank, meaning: a.meaning, tier: a.tier };
      }
    }
    if (!bestAssignment) continue;

    const diffKey = `${course}:${bestAssignment.stage}`;
    const difficulty = DIFFICULTY_MAP[diffKey];
    if (!difficulty) {
      throw new Error(`No difficulty mapping for "${diffKey}" (word: ${w.word})`);
    }
    result.push({
      ...w,
      meaning: bestAssignment.meaning ?? w.meaning,
      course,
      stage: bestAssignment.stage,
      difficulty,
      example: w.examples[0].en,
      exampleJa: w.examples[0].ja,
      category: w.categories[0],
      categories: [...w.categories],
      courseTier: bestAssignment.tier ?? w.frequencyTier,
    });
  }
  return result;
}
