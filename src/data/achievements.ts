import { Achievement } from "@/types";

export const ACHIEVEMENTS: Achievement[] = [
  // 学習回数系
  {
    id: "first_quiz",
    name: "はじめの一歩",
    description: "初めてのクイズに挑戦",
    icon: "🎯",
    category: "learning",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "quiz_10",
    name: "学習者",
    description: "10問に回答",
    icon: "📚",
    category: "learning",
    requirement: 10,
    rarity: "common",
  },
  {
    id: "quiz_50",
    name: "努力家",
    description: "50問に回答",
    icon: "💪",
    category: "learning",
    requirement: 50,
    rarity: "rare",
  },
  {
    id: "quiz_100",
    name: "熟練者",
    description: "100問に回答",
    icon: "🌟",
    category: "learning",
    requirement: 100,
    rarity: "rare",
  },
  {
    id: "quiz_500",
    name: "マスター",
    description: "500問に回答",
    icon: "👑",
    category: "learning",
    requirement: 500,
    rarity: "epic",
  },
  {
    id: "quiz_1000",
    name: "レジェンド",
    description: "1000問に回答",
    icon: "🏆",
    category: "learning",
    requirement: 1000,
    rarity: "legendary",
  },

  // 連続正解系
  {
    id: "combo_5",
    name: "コンボスタート",
    description: "5連続正解",
    icon: "⚡",
    category: "combo",
    requirement: 5,
    rarity: "common",
  },
  {
    id: "combo_10",
    name: "コンボマスター",
    description: "10連続正解",
    icon: "🔥",
    category: "combo",
    requirement: 10,
    rarity: "rare",
  },
  {
    id: "combo_20",
    name: "無敵モード",
    description: "20連続正解",
    icon: "💥",
    category: "combo",
    requirement: 20,
    rarity: "epic",
  },
  {
    id: "combo_50",
    name: "超人",
    description: "50連続正解",
    icon: "🦸",
    category: "combo",
    requirement: 50,
    rarity: "legendary",
  },

  // ストリーク系
  {
    id: "streak_3",
    name: "3日連続",
    description: "3日連続で学習",
    icon: "📅",
    category: "streak",
    requirement: 3,
    rarity: "common",
  },
  {
    id: "streak_7",
    name: "週間チャンピオン",
    description: "7日連続で学習",
    icon: "🗓️",
    category: "streak",
    requirement: 7,
    rarity: "rare",
  },
  {
    id: "streak_14",
    name: "2週間継続",
    description: "14日連続で学習",
    icon: "🔄",
    category: "streak",
    requirement: 14,
    rarity: "rare",
  },
  {
    id: "streak_30",
    name: "月間マラソン",
    description: "30日連続で学習",
    icon: "🏃",
    category: "streak",
    requirement: 30,
    rarity: "epic",
  },
  {
    id: "streak_100",
    name: "鉄人",
    description: "100日連続で学習",
    icon: "💎",
    category: "streak",
    requirement: 100,
    rarity: "legendary",
  },

  // 習熟度系（正答率80%以上の単語数）
  {
    id: "master_10",
    name: "単語コレクター",
    description: "10単語を習得",
    icon: "📖",
    category: "mastery",
    requirement: 10,
    rarity: "common",
  },
  {
    id: "master_25",
    name: "語彙力向上",
    description: "25単語を習得",
    icon: "📗",
    category: "mastery",
    requirement: 25,
    rarity: "rare",
  },
  {
    id: "master_50",
    name: "ボキャブラリスト",
    description: "50単語を習得",
    icon: "📘",
    category: "mastery",
    requirement: 50,
    rarity: "rare",
  },
  {
    id: "master_100",
    name: "辞書マスター",
    description: "100単語を習得",
    icon: "📙",
    category: "mastery",
    requirement: 100,
    rarity: "epic",
  },

  // レベル系
  {
    id: "level_5",
    name: "成長中",
    description: "レベル5に到達",
    icon: "🌱",
    category: "level",
    requirement: 5,
    rarity: "common",
  },
  {
    id: "level_10",
    name: "中級者",
    description: "レベル10に到達",
    icon: "🌿",
    category: "level",
    requirement: 10,
    rarity: "rare",
  },
  {
    id: "level_20",
    name: "上級者",
    description: "レベル20に到達",
    icon: "🌳",
    category: "level",
    requirement: 20,
    rarity: "epic",
  },
  {
    id: "level_50",
    name: "達人",
    description: "レベル50に到達",
    icon: "🏔️",
    category: "level",
    requirement: 50,
    rarity: "legendary",
  },

  // スピードチャレンジ系
  {
    id: "speed_first",
    name: "スピードスター",
    description: "初めてのスピードチャレンジ",
    icon: "⏱️",
    category: "speed",
    requirement: 1,
    rarity: "common",
  },
  {
    id: "speed_10",
    name: "ライトニング",
    description: "スピードチャレンジで10点獲得",
    icon: "⚡",
    category: "speed",
    requirement: 10,
    rarity: "rare",
  },
  {
    id: "speed_15",
    name: "サンダーボルト",
    description: "スピードチャレンジで15点獲得",
    icon: "🌩️",
    category: "speed",
    requirement: 15,
    rarity: "epic",
  },
  {
    id: "speed_20",
    name: "神速",
    description: "スピードチャレンジで20点獲得",
    icon: "🚀",
    category: "speed",
    requirement: 20,
    rarity: "legendary",
  },
];

export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find((a) => a.id === id);
};

export const getAchievementsByCategory = (category: Achievement["category"]): Achievement[] => {
  return ACHIEVEMENTS.filter((a) => a.category === category);
};

export const getRarityColor = (rarity: Achievement["rarity"]): string => {
  switch (rarity) {
    case "common":
      return "text-gray-600 bg-gray-100";
    case "rare":
      return "text-blue-600 bg-blue-100";
    case "epic":
      return "text-purple-600 bg-purple-100";
    case "legendary":
      return "text-yellow-600 bg-yellow-100";
  }
};

export const getRarityBorderColor = (rarity: Achievement["rarity"]): string => {
  switch (rarity) {
    case "common":
      return "border-gray-300";
    case "rare":
      return "border-blue-400";
    case "epic":
      return "border-purple-400";
    case "legendary":
      return "border-yellow-400";
  }
};
