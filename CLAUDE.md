# CLAUDE.md - english-learning-app 開発ガイド

## プロジェクト概要

英語学習アプリ（ゲーミフィケーション要素あり）のMVP開発プロジェクト。
**一人プレイ前提**、認証なしで動作する学習体験を最優先。

---

## 技術スタック

| レイヤー | 技術 | MVP状態 |
|----------|------|---------|
| フロントエンド | Next.js 14 (App Router) + TypeScript | ✅ |
| スタイリング | Tailwind CSS | ✅ |
| 状態管理 | React State + localStorage | ✅ |
| 音声再生 | Web Speech API | ✅ |
| 画像 | Unsplashプレースホルダー + Next/Image | ✅ |
| 認証 | なし（将来: Supabase Auth） | 🔜 |
| DB | localStorage（将来: Supabase） | 🔜 |

---

## 開発ルール

### 基本方針

- **MVP優先**: 動くものを最優先で作る
- **一人プレイ前提**: 認証なしで完結する機能を優先
- **テンポ重視**: 学習体験を損なう重い処理は避ける
- **既存コード尊重**: 新規ファイル作成より既存ファイルの編集を優先
- **単語詳細への導線**: 「単語が表示されている = その単語の詳細画面に遷移できる」

### 実装時の注意点

- コンポーネントは `components/ui`（汎用）と `components/features`（機能別）に分離
- 状態は最小限に保つ（必要以上にuseStateを増やさない）
- 型定義は `src/types/index.ts` に集約
- 単語データは `src/data/words.ts` に静的定義

---

## ファイル構成

```
src/
├── app/                          # Next.js App Router ページ
│   ├── page.tsx                  # ホーム画面
│   ├── layout.tsx                # 共通レイアウト
│   ├── globals.css               # グローバルスタイル
│   ├── quiz/page.tsx             # クイズに挑戦
│   ├── speed-challenge/page.tsx  # スピードチャレンジ
│   ├── word/[id]/page.tsx        # 単語詳細
│   ├── weak-words/page.tsx       # 苦手単語一覧
│   ├── history/page.tsx          # 学習履歴（タブ: 概要/苦手単語/履歴）
│   └── achievements/page.tsx     # 実績一覧
├── components/
│   ├── ui/                       # 汎用UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Header.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── SpeakButton.tsx
│   │   └── index.ts
│   └── features/                 # 機能別コンポーネント
│       ├── achievements/         # 実績機能
│       │   ├── AchievementCard.tsx
│       │   ├── AchievementList.tsx
│       │   └── AchievementUnlockPopup.tsx
│       └── word-detail/          # 単語詳細機能
│           ├── WordHeader.tsx
│           ├── WordImage.tsx
│           ├── WordMastery.tsx
│           ├── WordExamples.tsx
│           ├── WordRelations.tsx
│           ├── WordColumn.tsx
│           ├── WordPlaceholderSection.tsx
│           └── index.ts
├── lib/                          # ユーティリティ
│   ├── audio.ts                  # 音声再生（Web Speech API）
│   ├── storage.ts                # localStorage管理
│   ├── image.ts                  # 画像URL/コンセプト画像管理
│   └── quiz-session.ts           # クイズセッション状態永続化
├── data/                         # 静的データ
│   ├── words.ts                  # 単語データベース
│   └── achievements.ts           # 実績定義
└── types/
    └── index.ts                  # 型定義（集約）
```

---

## 主要な型定義（`src/types/index.ts`）

```typescript
// 問題タイプ
type QuestionType = "en-to-ja" | "ja-to-en" | "fill-blank";

// クイズモード
type QuizMode = "normal" | "speed-challenge";

// 品詞
type PartOfSpeech = "noun" | "verb" | "adjective" | "adverb" | "preposition" | "conjunction";

// 単語データ（拡張版）
type WordExtended = {
  id: number;
  word: string;
  meaning: string;
  category: string;
  difficulty: number;
  pronunciation?: string;
  partOfSpeech?: PartOfSpeech;
  examples?: WordExample[];
  synonyms?: string[];
  antonyms?: string[];
  column?: WordColumn;
  // 将来追加予定
  coreImage?: string;
  usage?: string;
  synonymDifference?: string;
  englishDefinition?: string;
  etymology?: string;
  relatedWords?: string[];
  imageUrl?: string;
  audioUrl?: string;
};

// 学習記録
type LearningRecord = {
  id: string;
  wordId: number;
  questionType: QuestionType;
  correct: boolean;
  studiedAt: string;
};

// ユーザーデータ
type UserData = {
  streak: number;
  lastStudyDate: string | null;
  totalXp: number;
  level: number;
  dailyGoal: number;
  todayCorrect: number;
  todayDate: string | null;
};
```

---

## 画面遷移ルール（単語詳細への導線）

### 基本原則

**「単語が表示されている = その単語の詳細画面に遷移できる」**

### 遷移対応状況

| 画面 | 遷移箇所 | 状態 |
|------|----------|------|
| クイズリザルト | 回答した全単語リスト | ✅ |
| 学習履歴（苦手単語タブ） | 苦手単語リスト | ✅ |
| 学習履歴（履歴タブ） | 回答履歴リスト | ✅ |
| スピードチャレンジリザルト | 正解/不正解単語リスト | 🔜 |

### 実装パターン

```tsx
<Link
  href={`/word/${word.id}`}
  className="flex items-center justify-between p-3 hover:bg-primary-50 transition-colors group"
>
  <div className="flex items-center gap-3">
    <SpeakButton text={word.word} size="sm" />
    <div>
      <p className="font-bold">{word.word}</p>
      <p className="text-sm text-slate-500">{word.meaning}</p>
    </div>
  </div>
  <div className="text-slate-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
    →
  </div>
</Link>
```

---

## 音声機能（`src/lib/audio.ts`）

### 利用可能な関数

```typescript
// 音声合成のサポート確認
isSpeechSynthesisSupported(): boolean

// 単語の発音
speakWord(word: string, options?: { slow?: boolean; onEnd?: () => void }): void

// 例文の読み上げ
speakSentence(sentence: string, options?: { slow?: boolean; onEnd?: () => void }): void

// 再生中かどうか
isSpeaking(): boolean

// 再生停止
stopSpeaking(): void
```

### 自動再生の実装パターン

```typescript
const hasAutoPlayedRef = useRef<Set<number>>(new Set());

useEffect(() => {
  if (!currentQuestion || !isSpeechSynthesisSupported()) return;
  if (selected !== null) return;
  if (hasAutoPlayedRef.current.has(currentIndex)) return;

  hasAutoPlayedRef.current.add(currentIndex);

  const timeoutId = setTimeout(() => {
    if (currentQuestion.type === "en-to-ja") {
      speakWord(currentQuestion.word.word);
    }
  }, 300);

  return () => clearTimeout(timeoutId);
}, [currentQuestion, currentIndex, selected]);
```

### 遅延時間の目安

| 画面 | 遅延時間 | 理由 |
|------|---------|------|
| クイズに挑戦 | 300ms | 画面表示を見てから聞く |
| スピードチャレンジ | 100ms | テンポ最優先 |
| 単語詳細 | 0ms | ユーザー操作に即応 |

---

## 画像機能（`src/lib/image.ts`）

### フォールバックチェーン

1. **単語固有URL** (`word.imageUrl`)
2. **キーワードベースURL** (`word.imageKeyword` → `CONCEPT_IMAGE_URLS`)
3. **単語名からコンセプト検索** (`word.word` → `CONCEPT_IMAGE_URLS`)
4. **カテゴリURL** (`CATEGORY_IMAGE_URLS`)
5. **絵文字フォールバック** (`CATEGORY_EMOJIS`)

### 利用可能な関数

```typescript
// 画像URL取得（新API）
getImageUrl(options: {
  wordImageUrl?: string;    // 単語固有URL
  imageKeyword?: string;    // コンセプトキーワード
  word?: string;            // 単語名
  category?: string;        // カテゴリ
}): string | null

// 後方互換性のための旧API
getImageUrl(imageUrl?: string, category?: string): string | null

// カテゴリ絵文字取得（フォールバック用）
getCategoryEmoji(category?: string): string

// カテゴリグラデーション取得（背景用）
getCategoryGradient(category?: string): string

// コンセプト画像の利用可否チェック
hasConceptImage(keyword: string): boolean
```

### コンセプト画像マッピング（CONCEPT_IMAGE_URLS）

単語の意味やコアイメージに即した画像を自動選択:

- **ビジネス関連**: meeting, schedule, deadline, project, client, contract...
- **オフィス関連**: office, desk, document, employee, supervisor...
- **金融関連**: budget, invoice, expense, profit, revenue, investment...
- **旅行関連**: travel, flight, airport, hotel, reservation, passport...
- **技術関連**: technology, software, hardware, network, database...
- **動作・状態**: approve, submit, review, postpone, cancel, attend...

### カテゴリ定義

| カテゴリ | 絵文字 | 用途 |
|----------|--------|------|
| business | 💼 | ビジネス一般 |
| office | 🏢 | オフィス |
| travel | ✈️ | 旅行 |
| shopping | 🛒 | 買い物 |
| finance | 💰 | 金融 |
| technology | 💻 | テクノロジー |
| daily | 🏠 | 日常生活 |
| communication | 💬 | コミュニケーション |

---

## クイズセッション状態管理（`src/lib/quiz-session.ts`）

リザルト画面から単語詳細に遷移し、戻ってきた際にリザルト状態を復元するための機能。

### 利用可能な関数

```typescript
// リザルト状態を保存
saveQuizResultState(state: QuizResultState): void

// リザルト状態を取得（有効期限切れならnull）
getQuizResultState(): QuizResultState | null

// リザルト状態をクリア
clearQuizResultState(): void

// リザルト状態が存在するかチェック
hasQuizResultState(): boolean
```

### 特徴

- **sessionStorage使用**: ブラウザタブ単位で状態管理
- **30分有効期限**: 長時間放置後は新規セッションに
- **遷移元追跡**: `?from=quiz` クエリパラメータで戻り先を特定

---

## ストレージ（`src/lib/storage.ts`）

### 主要なメソッド

```typescript
const storage = {
  // 学習記録
  getRecords(): LearningRecord[]
  addRecord(record: Omit<LearningRecord, "id">): void
  clearRecords(): void

  // ユーザーデータ
  getUserData(): UserData
  saveUserData(data: UserData): void

  // 単語統計
  getWordStats(wordId: number): WordStats
  getWeakWords(): WordStats[]
  getStudiedWordIds(): number[]
  getMasteredWordCount(): number

  // XP・レベル
  recordStudySession(correct: number, total: number): { xpEarned: number; ... }
  getXpProgress(): { currentXp: number; requiredXp: number; progress: number }

  // 実績
  getUnlockedAchievements(): UnlockedAchievement[]
  checkAndUnlockAchievements(context: { ... }): Achievement[]
  unlockAchievement(achievementId: string): void

  // スピードチャレンジ
  getSpeedChallengeResults(): SpeedChallengeResult[]
  addSpeedChallengeResult(result: SpeedChallengeResult): void
  getSpeedChallengeHighScore(): number
}
```

---

## 単語詳細画面の構成

### 表示項目と状態

| 項目 | 状態 | コンポーネント |
|------|------|---------------|
| イメージ画像 | ✅ | WordImage |
| 単語・発音・品詞 | ✅ | WordHeader |
| 記憶度 | ✅ | WordMastery |
| 例文 | ✅ | WordExamples |
| 類義語・対義語 | ✅ | WordRelations |
| コラム | ✅ | WordColumn |
| コアイメージ | 🔜 | WordPlaceholderSection |
| 使い方 | 🔜 | WordPlaceholderSection |
| 類義語との違い | 🔜 | WordPlaceholderSection |
| 英英定義 | 🔜 | WordPlaceholderSection |
| 語源 | 🔜 | WordPlaceholderSection |
| 関連語 | 🔜 | WordPlaceholderSection |

### 記憶度の計算

```typescript
const getMasteryLevel = (accuracy: number | null, attempts: number) => {
  if (attempts === 0) return "new";
  if (accuracy >= 80 && attempts >= 3) return "mastered";
  if (accuracy >= 60) return "familiar";
  return "learning";
};
```

---

## ゲーミフィケーション機能

### XP・レベルシステム

- 正解: 10 XP
- コンボボーナス: 5 XP（3連続以上）
- レベルアップ: `100 * level` XP 必要

### 実績システム（`src/data/achievements.ts`）

| カテゴリ | 実績例 |
|----------|--------|
| streak | 連続学習日数達成 |
| score | 正解数達成 |
| mastery | 単語習得数達成 |
| speed | スピードチャレンジ関連 |
| special | 特別実績 |

---

## よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Lint実行
npm run lint

# 型チェック
npx tsc --noEmit
```

---

## 参照ドキュメント

| ドキュメント | パス | 内容 |
|--------------|------|------|
| 設計詳細 | `docs/design.md` | 機能仕様・画面仕様 |
| コーディング規約 | `.claude/agents/best-practices.md` | コード規約 |
| コードレビュー | `.claude/agents/reviewer.md` | レビュー基準 |
| 単語データ | `src/data/words.ts` | 単語データベース |
| 実績データ | `src/data/achievements.ts` | 実績定義 |
| 型定義 | `src/types/index.ts` | TypeScript型定義 |
