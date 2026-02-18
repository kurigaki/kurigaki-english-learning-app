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
    date: "2026-02-18",
    version: "1.6.0",
    title: "ホーム画面をリデザイン＆モバイルナビ追加",
    content: [
      "ホーム画面を「行動中心UI」に刷新（クイズCTAを最上部に配置）",
      "モバイル向けボトムナビゲーションを追加（1タップでクイズ・単語帳・履歴にアクセス）",
      "ヘッダーをシンプル化（モバイルではハンバーガーメニューを廃止）",
      "「その他」ページを新設（実績・ブックマーク・苦手単語へのリンク）",
      "コース別進捗を折りたたみ式に変更し、画面スペースを最適化",
    ],
    category: "improvement",
  },
  {
    date: "2026-02-17",
    version: "1.5.0",
    title: "SRS（間隔反復学習）を導入",
    content: [
      "SM-2アルゴリズムによるスペーシング復習機能を追加",
      "ホーム画面にSRS復習セクションを表示（復習が必要な単語がある場合）",
      "クイズ回答時にSRS進捗を自動更新",
      "単語帳に記憶度フィルターを追加（新規・学習中・定着・習得済み）",
      "記憶度の凡例表示切り替え機能を追加",
      "コース別進捗から単語帳への導線を改善",
    ],
    category: "feature",
  },
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
