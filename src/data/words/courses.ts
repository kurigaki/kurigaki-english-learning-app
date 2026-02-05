import { CourseDefinitions } from "./types";

// コース定義マスタ
export const COURSE_DEFINITIONS: CourseDefinitions = {
  junior: {
    name: "中学英語",
    levels: [
      { level: "junior1", displayName: "中学1年", targetVocab: 600, difficulty: 1 },
      { level: "junior2", displayName: "中学2年", targetVocab: 1200, difficulty: 2 },
      { level: "junior3", displayName: "中学3年", targetVocab: 1800, difficulty: 3 },
    ],
  },
  senior: {
    name: "高校英語",
    levels: [
      { level: "senior1", displayName: "高校1年", targetVocab: 2500, difficulty: 4 },
      { level: "senior2", displayName: "高校2年", targetVocab: 3500, difficulty: 4 },
      { level: "senior3", displayName: "高校3年", targetVocab: 5000, difficulty: 5 },
    ],
  },
  eiken: {
    name: "英検",
    levels: [
      { level: "eiken5", displayName: "5級", targetVocab: 600, difficulty: 1 },
      { level: "eiken4", displayName: "4級", targetVocab: 1300, difficulty: 2 },
      { level: "eiken3", displayName: "3級", targetVocab: 2100, difficulty: 3 },
      { level: "eikenPre2", displayName: "準2級", targetVocab: 3600, difficulty: 4 },
      { level: "eiken2", displayName: "2級", targetVocab: 5000, difficulty: 5 },
      { level: "eikenPre1", displayName: "準1級", targetVocab: 7500, difficulty: 6 },
      { level: "eiken1", displayName: "1級", targetVocab: 10000, difficulty: 7 },
    ],
  },
  toeic: {
    name: "TOEIC",
    levels: [
      { level: "toeic500", displayName: "500点", targetVocab: 2000, difficulty: 3 },
      { level: "toeic600", displayName: "600点", targetVocab: 4000, difficulty: 4 },
      { level: "toeic700", displayName: "700点", targetVocab: 6000, difficulty: 5 },
      { level: "toeic800", displayName: "800点", targetVocab: 8000, difficulty: 6 },
      { level: "toeic900", displayName: "900点", targetVocab: 10000, difficulty: 7 },
    ],
  },
  conversation: {
    name: "英会話",
    levels: [
      { level: "convBeginner", displayName: "超初歩", targetVocab: 500, difficulty: 1 },
      { level: "convElementary", displayName: "初級", targetVocab: 1500, difficulty: 2 },
      { level: "convIntermediate", displayName: "中級", targetVocab: 3000, difficulty: 4 },
      { level: "convAdvanced", displayName: "上級", targetVocab: 5000, difficulty: 5 },
      { level: "convNative", displayName: "ネイティブ", targetVocab: 8000, difficulty: 7 },
    ],
  },
} as const;

// ヘルパー関数：コースレベル定義を取得
export function getCourseLevelDefinition(
  courseType: keyof typeof COURSE_DEFINITIONS,
  level: string
) {
  const course = COURSE_DEFINITIONS[courseType];
  return course.levels.find((l) => l.level === level);
}

// ヘルパー関数：全コースレベルをフラットに取得
export function getAllCourseLevels() {
  return Object.entries(COURSE_DEFINITIONS).flatMap(([courseType, course]) =>
    course.levels.map((level) => ({
      courseType: courseType as keyof typeof COURSE_DEFINITIONS,
      courseName: course.name,
      ...level,
    }))
  );
}
