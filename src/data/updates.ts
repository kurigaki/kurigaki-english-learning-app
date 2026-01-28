// アップデート情報データ
export type AppUpdate = {
  date: string; // YYYY-MM-DD
  version?: string;
  title: string;
  content: string[];
  category: "feature" | "improvement" | "fix";
};

// カテゴリのラベルと色
export const UPDATE_CATEGORY_CONFIG: Record<
  AppUpdate["category"],
  { label: string; bgColor: string; textColor: string }
> = {
  feature: {
    label: "新機能",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  improvement: {
    label: "改善",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  fix: {
    label: "修正",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
};

// アップデート履歴（新しい順）
export const APP_UPDATES: AppUpdate[] = [
  {
    date: "2025-01-28",
    version: "1.1.0",
    title: "ユーザー認証機能を追加",
    content: [
      "ユーザー登録・ログイン機能を追加",
      "学習進捗がデバイス間で同期されるように",
      "プロフィール編集ページを追加",
      "アバター画像のアップロード機能を追加",
    ],
    category: "feature",
  },
  {
    date: "2025-01-20",
    version: "1.0.0",
    title: "正式リリース",
    content: [
      "クイズ機能（英→日、日→英、穴埋め）",
      "スピードチャレンジモード",
      "単語帳（検索・フィルター・ソート）",
      "学習履歴と苦手単語の管理",
      "実績システムとレベルアップ",
      "ブックマーク機能",
    ],
    category: "feature",
  },
];

// 日付をフォーマット
export function formatUpdateDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
