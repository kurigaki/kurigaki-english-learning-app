/**
 * カテゴリ定義・ラベル・推論ロジック
 *
 * Category型とcategoryLabelsはアプリUIから参照される。
 * inferCategories()は単語追加スクリプト専用（アプリバンドルには含まれない）。
 */

// Category union
export type Category =
  | "business"
  | "office"
  | "travel"
  | "shopping"
  | "finance"
  | "technology"
  | "daily"
  | "communication"
  | "school"
  | "family"
  | "hobby"
  | "nature"
  | "health"
  | "food"
  | "sports"
  | "culture"
  | "greeting"
  | "emotion"
  | "opinion"
  | "request"
  | "smalltalk";

// Category labels (21 categories)
export const categoryLabels: Record<Category, string> = {
  business: "ビジネス一般",
  office: "オフィス・職場",
  travel: "旅行・交通",
  shopping: "買い物・店舗",
  finance: "金融・経済",
  technology: "技術・IT",
  daily: "日常生活",
  communication: "コミュニケーション",
  school: "学校",
  family: "家族・家庭",
  hobby: "趣味・娯楽",
  nature: "自然・環境",
  health: "健康・医療",
  food: "食事・料理",
  sports: "スポーツ",
  culture: "文化・芸術",
  greeting: "挨拶",
  emotion: "感情表現",
  opinion: "意見表明",
  request: "依頼・お願い",
  smalltalk: "雑談",
};

export const CATEGORY_PRIORITY: Category[] = [
  "business", "office", "finance", "technology", "travel", "shopping",
  "school", "family", "health", "food", "sports", "nature", "culture",
  "greeting", "request", "opinion", "emotion", "smalltalk",
  "communication", "hobby", "daily",
];

export const CATEGORY_MAP: Record<string, Category> = {
  junior: "school",
  senior: "school",
  toeic: "business",
  eiken: "daily",
  general: "daily",
  business: "business",
  conversation: "communication",
};
