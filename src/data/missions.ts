import type { Mission } from "@/types";

export const MISSIONS: Mission[] = [
  // ── 日ミッション（毎日リセット）──
  {
    id: "daily_quiz_1",
    period: "daily",
    name: "今日のクイズ",
    description: "クイズを1回プレイする",
    icon: "📝",
    target: 1,
    progressKey: "quizPlays",
  },
  {
    id: "daily_speed_1",
    period: "daily",
    name: "今日のスピードチャレンジ",
    description: "スピードチャレンジを1回プレイする",
    icon: "⚡",
    target: 1,
    progressKey: "speedPlays",
  },
  {
    id: "daily_dungeon_1",
    period: "daily",
    name: "今日のダンジョン",
    description: "ダンジョンを1回プレイする",
    icon: "⚔️",
    target: 1,
    progressKey: "dungeonPlays",
  },

  // ── 週ミッション（毎週月曜リセット）──
  {
    id: "weekly_quiz_5",
    period: "weekly",
    name: "クイズウィーク 初級",
    description: "クイズを5回プレイする",
    icon: "📝",
    target: 5,
    progressKey: "quizPlays",
  },
  {
    id: "weekly_quiz_10",
    period: "weekly",
    name: "クイズウィーク 上級",
    description: "クイズを10回プレイする",
    icon: "📚",
    target: 10,
    progressKey: "quizPlays",
  },
  {
    id: "weekly_speed_3",
    period: "weekly",
    name: "週間スピードランナー",
    description: "スピードチャレンジを3回プレイする",
    icon: "⚡",
    target: 3,
    progressKey: "speedPlays",
  },
  {
    id: "weekly_dungeon_3",
    period: "weekly",
    name: "週間冒険者",
    description: "ダンジョンを3回プレイする",
    icon: "⚔️",
    target: 3,
    progressKey: "dungeonPlays",
  },

  // ── 月ミッション（毎月1日リセット）──
  {
    id: "monthly_quiz_30",
    period: "monthly",
    name: "クイズマラソン",
    description: "クイズを30回プレイする",
    icon: "📝",
    target: 30,
    progressKey: "quizPlays",
  },
  {
    id: "monthly_speed_10",
    period: "monthly",
    name: "スピードマスター",
    description: "スピードチャレンジを10回プレイする",
    icon: "⚡",
    target: 10,
    progressKey: "speedPlays",
  },
  {
    id: "monthly_dungeon_10",
    period: "monthly",
    name: "ダンジョンマスター",
    description: "ダンジョンを10回プレイする",
    icon: "⚔️",
    target: 10,
    progressKey: "dungeonPlays",
  },
];

export const getMissionsByPeriod = (period: Mission["period"]): Mission[] =>
  MISSIONS.filter((m) => m.period === period);
