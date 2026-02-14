import { Course, Stage } from "./types";

export type StageDefinition = {
  stage: Stage;
  displayName: string;
};

export type CourseDefinition = {
  name: string;
  stages: StageDefinition[];
};

// コース定義マスタ
export const COURSE_DEFINITIONS: Record<Course, CourseDefinition> = {
  junior: {
    name: "中学英語",
    stages: [
      { stage: "1", displayName: "中学1年" },
      { stage: "2", displayName: "中学2年" },
      { stage: "3", displayName: "中学3年" },
    ],
  },
  senior: {
    name: "高校英語",
    stages: [
      { stage: "1", displayName: "高校1年" },
      { stage: "2", displayName: "高校2年" },
      { stage: "3", displayName: "高校3年" },
    ],
  },
  eiken: {
    name: "英検",
    stages: [
      { stage: "5", displayName: "5級" },
      { stage: "4", displayName: "4級" },
      { stage: "3", displayName: "3級" },
      { stage: "pre2", displayName: "準2級" },
      { stage: "2", displayName: "2級" },
      { stage: "pre1", displayName: "準1級" },
      { stage: "1", displayName: "1級" },
    ],
  },
  toeic: {
    name: "TOEIC",
    stages: [
      { stage: "500", displayName: "500点" },
      { stage: "600", displayName: "600点" },
      { stage: "700", displayName: "700点" },
      { stage: "800", displayName: "800点" },
      { stage: "900", displayName: "900点" },
    ],
  },
  general: {
    name: "一般英語",
    stages: [],
  },
  business: {
    name: "ビジネス英語",
    stages: [],
  },
  conversation: {
    name: "英会話",
    stages: [
      { stage: "1", displayName: "超初歩" },
      { stage: "2", displayName: "初級" },
      { stage: "3", displayName: "中級" },
      { stage: "4", displayName: "上級" },
      { stage: "5", displayName: "ネイティブ" },
    ],
  },
};
