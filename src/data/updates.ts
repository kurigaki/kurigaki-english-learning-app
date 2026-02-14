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
    date: "2025-02-14",
    version: "1.4.0",
    title: "単語データ構造を最適化",
    content: [
      "10,000語以上に対応できるデータ構造へリストラクチャリング",
      "コース別ID範囲を予約（将来のDB移行に備えた設計）",
      "Word型をシンプル化し、ビルド速度・型安全性を向上",
      "Supabase本番スキーマを設計（SRS間隔反復学習対応）",
    ],
    category: "improvement",
  },
  {
    date: "2025-02-12",
    version: "1.3.0",
    title: "単語データを大幅拡充（4,240語）",
    content: [
      "収録単語数を500語から4,240語に拡大（約8.5倍）",
      "5コース対応: 中学英語・高校英語・英検・TOEIC・英会話",
      "難易度を7段階に拡張（中1〜最難関・1級）",
      "カテゴリを21種類に拡充",
      "クイズ設定画面にコース選択UIを追加",
    ],
    category: "feature",
  },
  {
    date: "2025-02-06",
    version: "1.2.0",
    title: "学習機能の強化とUI改善",
    content: [
      "単語帳ページを追加（検索・フィルター・ソート）",
      "ブックマーク機能を追加（お気に入り単語の管理）",
      "カスタムクイズ機能（カテゴリ・難易度の絞り込み）",
      "苦手単語・特定単語の復習モードを追加",
      "レスポンシブデザインを全画面に適用（iOS Safari対応）",
      "穴埋め問題に和訳表示ボタンを追加",
      "キーボード操作（Enterキー）でクイズ進行が可能に",
    ],
    category: "feature",
  },
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
