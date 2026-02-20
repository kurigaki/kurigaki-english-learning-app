# CLAUDE.md - english-learning-app 開発ガイド

## Role

あなたは熟練したNext.js/TypeScriptエンジニアです。
SOLID原則、React Best Practices、およびTDD（テスト駆動開発）に従い、保守性が高く安全なコードを書きます。

---

## Workflow

あなたは、以下のステップを実行します。

### Step 1: タスク受付と準備

1. ユーザーから **GitHub Issue 番号**を受け付けたらフロー開始です。GitHub MCPを使用してIssueの内容を取得し、作業ブランチを作成します。
2. Issueの内容を把握し、関連するコードを調査します。調査時にはSerena MCPの解析結果を利用してください。

### Step 2: 実装計画の策定と承認

1. 分析結果に基づき、実装計画を策定します。
2. 計画をユーザーに提示し、承認を得ます。**承認なしに次へ進んではいけません。**

### Step 3: 実装・レビュー・修正サイクル

1. 承認された計画に基づき、TDDで実装を行います。
2. 実装完了後、**`english-learning-app-reviewer` サブエージェントを呼び出し、コードレビューを実行させます。**
3. 実装内容とレビュー結果をユーザーに報告します。
4. **【ユーザー承認】**: 報告書を提示し、承認を求めます。
   - `yes`: コミットして完了。
   - `fix`: 指摘に基づき修正し、再度レビューからやり直す。

---

## Rules

以下のルールは、あなたの行動を規定する最優先事項およびガイドラインです。

### 重要・最優先事項 (CRITICAL)

- **ユーザー承認は絶対**: いかなる作業も、ユーザーの明示的な承認なしに進めてはいけません。
- **品質の担保**: コミット前には必ずテスト(`npm run test`)とLint(`npm run lint`)を実行し、全てパスすることを確認してください。
- **効率と透明性**: 作業に行き詰まった場合、同じ方法で3回以上試行することはやめてください。
- **Serena MCP推奨**: コードベースの調査・分析にはSerena MCPの使用を推奨します。

### Serena MCP 使用ガイド

コード解析は以下のツールを使用してください。

| ツール | 用途 | 使用例 |
|--------|------|--------|
| `find_symbol` | クラス・関数の検索、シンボルの定義取得 | 特定関数の実装を確認したいとき |
| `get_symbols_overview` | ファイル内のシンボル一覧を取得 | ファイル構造を把握したいとき |
| `find_referencing_symbols` | シンボルの参照箇所を検索 | 関数がどこから呼ばれているか調べるとき |
| `search_for_pattern` | 正規表現でコード検索 | 特定パターンの使用箇所を探すとき |

### GitHub MCP 使用ガイド

GitHub操作は以下のツールを使用してください。

| ツール | 用途 |
|--------|------|
| `get_issue` | Issueの内容を取得 |
| `create_branch` | 作業ブランチを作成 |
| `create_pull_request` | PRを作成 |
| `add_issue_comment` | Issueにコメントを追加 |

### 基本理念 (PHILOSOPHY)

- **大きな変更より段階的な進捗**: テストを通過する小さな変更を積み重ねる。
- **シンプルさが意味すること**: コンポーネントや関数は単一責任を持つ（Single Responsibility）。
- **MVP優先**: 動くものを最優先で作る。過度な抽象化を避ける。

### 技術・実装ガイドライン

- **実装プロセス (TDD)**: Red -> Green -> Refactor のサイクルを厳守する。
- **テストファイル配置**: テストファイルは `__tests__/` ディレクトリ、または対象ファイルと同階層に `.test.ts(x)` として配置。
- **完了の定義**:
  - [ ] テストが通っている
  - [ ] ESLintのエラーがない
  - [ ] TypeScriptの型チェックが通っている
  - [ ] アプリが正常に動作する

### コミット方針（重要）

- **小さく意味のある単位でコミット**: 複数の変更を1コミットにまとめない
- **明確なコミットメッセージ**: 内容が分かるメッセージを付ける
- **squash（まとめコミット）禁止**: 各コミットは独立して意味を持つようにする
- **コミット後の報告**: 以下を必ず報告する
  - 作成したコミットメッセージ一覧
  - 変更内容の簡単な要約
  - 安全のためにあえて変更しなかった点

### 安全面のルール（重要）

- **指示されていない挙動変更は禁止**: 明示的に依頼された変更のみ行う
- **既存の公開仕様を維持**: 既存のAPI・props・ルーティング・公開仕様は削除／リネームしない
- **関係ないリファクタリング禁止**: 今回の修正と関係ないコードの改善は行わない
- **影響の大きい変更は提案のみ**: 実装せずTODOコメントで提案する
- **判断に迷う場合は質問**: 勝手に実装せず、ユーザーに確認する

### ブランチ・ロールバック方針

- **影響が小さい変更**: 現在のブランチに直接コミットしてOK
- **以下に関係する変更は分けてコミット**:
  - 音声再生（読み上げ）
  - スコア・コンボ計算
  - 出題ロジック
- **コミット単位で簡単に戻せる状態を維持**: 各コミットは独立して動作可能にする

### バグ修正時の説明ルール

バグ修正を行った場合、コミットメッセージまたはコメントに以下を簡潔に記載:

- **原因**: なぜ起きていたか
- **対応**: どう直したか

---

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
| テスト | Vitest + Testing Library | ✅ |
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

### 日付文字列のタイムゾーン

"YYYY-MM-DD" 形式の日付文字列は **必ずローカルタイムゾーン基準** で生成する。

**NG（UTC基準）**:
```typescript
new Date().toISOString().split("T")[0]  // 日本では0〜9時が前日の日付になる
```

**OK（ローカルタイムゾーン基準）**:
```typescript
const d = new Date();
const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
```

**適用箇所**: ストリーク計算、SRS復習日、今日の単語、デイリーバッチキャッシュなど「日付の境界」に関わる全処理。

> **注意**: `studiedAt`・`unlockedAt` などのタイムスタンプ（比較に使わず記録のみ）はUTC ISO文字列のままで構わない。

### レスポンシブデザイン

PCでもスマホでも1画面に収まるよう、以下のレイアウトパターンを使用:

**CSS変数とユーティリティクラス**

`globals.css`で定義されたCSS変数とユーティリティクラスを使用:

```css
:root {
  --header-height: 52px;
  --safe-area-top: env(safe-area-inset-top, 0px);
  --safe-area-bottom: env(safe-area-inset-bottom, 0px);
  /* フォールバック（100vh） */
  --main-height: calc(100vh - var(--header-height) - var(--safe-area-top) - var(--safe-area-bottom));
}

/* svh対応ブラウザ向け（iOS Safari 15.4+） */
@supports (height: 100svh) {
  :root {
    --main-height: calc(100svh - var(--header-height) - var(--safe-area-top) - var(--safe-area-bottom));
  }
}

.main-content {
  height: var(--main-height);
  overflow: hidden;
}

.main-content-scroll {
  min-height: var(--main-height);
  padding-bottom: var(--safe-area-bottom);
}
```

### 実機とPC検証ツール差分対策

**問題**: PC検証ツール（モバイル表示）では1画面に収まるが、実機（iPhone）では縦スクロールが発生する

**原因**:
1. **100vh の iOS Safari 問題**: `100vh` = アドレスバーが隠れた状態の高さ（Large Viewport）
2. **Safe Area の未考慮**: ノッチ・ホームバーの領域が計算に含まれていない

**解決策**: Dynamic Viewport Units を使用

| 単位 | 説明 | 用途 |
|------|------|------|
| `svh` | Small Viewport Height（アドレスバー表示時） | **推奨**: 常に見える領域 |
| `dvh` | Dynamic Viewport Height（動的に変化） | アドレスバー操作に追従 |
| `lvh` | Large Viewport Height（アドレスバー非表示時） | 従来の `vh` と同等 |

**実装パターン**:

```css
/* フォールバック */
--main-height: calc(100vh - var(--header-height) - var(--safe-area-top) - var(--safe-area-bottom));

/* svh対応ブラウザ向け */
@supports (height: 100svh) {
  --main-height: calc(100svh - var(--header-height) - var(--safe-area-top) - var(--safe-area-bottom));
}
```

**ブラウザサポート**:
- iOS Safari 15.4+
- Chrome 108+
- Firefox 101+
- Edge 108+

**Viewport-Fit Layout（リスト・ナビゲーション系画面）**

`main-content`クラスを使用。スクロールなしで全要素にアクセスできる構造:

```tsx
<div className="main-content px-3 py-2 flex flex-col">
  <div className="max-w-{size} w-full mx-auto flex flex-col h-full">
    <div className="flex-shrink-0">{/* 上部固定 */}</div>
    <div className="flex-1 overflow-y-auto min-h-0">{/* スクロール可能 */}</div>
    <div className="flex-shrink-0">{/* 下部固定 */}</div>
  </div>
</div>
```

- **適用画面**: クイズ設定/問題/リザルト、スピードチャレンジ、単語帳、学習履歴、苦手単語、実績、ブックマーク

**Scrollable Content Layout（詳細・ダッシュボード系画面）**

`main-content-scroll`クラスを使用。情報量が多く自然なスクロールが適切な画面:

```tsx
<div className="main-content-scroll px-4 py-6">
  {/* 自然にスクロール */}
</div>
```

- **適用画面**: ホーム、単語詳細、ログイン、新規登録、プロフィール、アップデート情報

詳細は `docs/design.md` の「10.5 レスポンシブデザイン」を参照。

### 絵文字アイコンの表示

テキストと絵文字を並べて表示する際、縦位置のズレを防ぐため、`emoji-icon` クラスを使用:

```tsx
// 見出しでアイコンとテキストを並べる
<h2 className="flex items-center gap-2">
  <span className="emoji-icon">📈</span>
  <span>あなたの学習状況</span>
</h2>

// サイズ指定がある場合
<span className="text-2xl emoji-icon">🔥</span>

// アニメーションと組み合わせる場合
<span className="animate-float emoji-icon">⭐</span>
```

**重要**: 絵文字とテキストを同じ行に表示する際は、必ず両方を`<span>`で囲み、絵文字側に`emoji-icon`を付ける。

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
│   ├── word-list/page.tsx        # 単語帳（コース・カテゴリ・難易度フィルター・検索・ソート）
│   ├── weak-words/page.tsx       # 苦手単語一覧
│   ├── bookmarks/page.tsx        # ブックマーク一覧
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
│       ├── quiz/                 # クイズ機能
│       │   ├── PerfectScorePopup.tsx  # 全問正解ポップアップ
│       │   └── index.ts
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

// 発音データ（UK/US切り替え対応）
type PronunciationData = {
  us: string;   // US発音記号 (例: /ˈskedʒuːl/)
  uk?: string;  // UK発音記号 (例: /ˈʃedjuːl/) - 差がある場合のみ
};

// 単語データ（拡張版）
type WordExtended = {
  id: number;
  word: string;
  meaning: string;
  example?: string;           // 例文（英語）
  exampleJa?: string;         // 例文の日本語訳
  category: string;
  difficulty: number;
  pronunciation?: string | PronunciationData; // UK/US発音切り替え対応
  partOfSpeech?: PartOfSpeech;
  examples?: WordExample[];   // 複数の例文（詳細形式）
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
| スピードチャレンジリザルト | 正解/不正解単語リスト | ✅ |
| ブックマーク一覧 | ブックマーク済み単語リスト | ✅ |

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

// UK/US発音切り替えで単語を読み上げ
speakWordWithVariant(word: string, variant: "us" | "uk", options?: { slow?: boolean; onEnd?: () => void }): void

// 例文の読み上げ
speakSentence(sentence: string, options?: { slow?: boolean; onEnd?: () => void }): void

// 再生中かどうか
isSpeaking(): boolean

// 再生停止
stopSpeaking(): void

// 音声が利用可能になるまで待機
waitForVoices(timeout?: number): Promise<SpeechSynthesisVoice[]>

// 音声初期化を確認
ensureVoicesLoaded(): Promise<boolean>
```

### UK/US発音切り替え

単語詳細画面では、UK/US発音の切り替えが可能です。

```typescript
type PronunciationData = {
  us: string;   // US発音記号 (例: /ˈskedʒuːl/)
  uk?: string;  // UK発音記号 (例: /ˈʃedjuːl/) - 差がある場合のみ
};

// SpeakButtonでvariantを指定
<SpeakButton text={word} variant="uk" />
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
  recordStudySession(correct: number, comboBonus?: number): UserData
  getXpProgress(userData: UserData): { current: number; required: number; percentage: number }

  // 実績
  getUnlockedAchievements(): UnlockedAchievement[]
  checkAndUnlockAchievements(context: { ... }): Achievement[]
  unlockAchievement(achievementId: string): void

  // スピードチャレンジ
  getSpeedChallengeResults(): SpeedChallengeResult[]
  addSpeedChallengeResult(result: SpeedChallengeResult): void
  getSpeedChallengeHighScore(): number

  // ブックマーク
  getBookmarkedWordIds(): number[]
  isWordBookmarked(wordId: number): boolean
  addBookmark(wordId: number): void
  removeBookmark(wordId: number): void
  toggleBookmark(wordId: number): boolean
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

## クイズ機能

### 問題タイプ

| タイプ | 説明 | 自動読み上げ |
|--------|------|--------------|
| en-to-ja | 英語→日本語選択 | 英単語を読み上げ |
| ja-to-en | 日本語→英語選択 | 選択した英単語を読み上げ |
| fill-blank | 穴埋め問題 | 例文全体を読み上げ |

### 穴埋め問題の和訳表示

穴埋め問題では「和訳を表示」ボタンで日本語訳を確認できます。

- 例文の日本語訳がある場合はそれを表示
- ない場合は単語の意味をフォールバック表示
- 回答後は自動で非表示

### 全問正解フィードバック（PerfectScorePopup）

クイズ・スピードチャレンジで全問正解した場合、専用のポップアップを表示します。

- アニメーション付きの祝福メッセージ
- 3秒後に自動クローズ
- タップでも閉じられる

### カスタムクイズ機能

クイズ開始前に出題範囲をカスタマイズできます。

**フェーズ管理**:
```typescript
type QuizPhase = "setup" | "quiz" | "result";
```

**設定項目**:
```typescript
type QuizSettings = {
  categories: Category[];      // 空配列は「全カテゴリ」
  difficulties: number[];      // 空配列は「全難易度」
  includeBookmarksOnly: boolean;
};
```

**フロー**:
1. 設定画面でカテゴリ・難易度・ブックマークを選択
2. 対象単語数をプレビュー表示
3. 「開始」で選択した条件でクイズ開始
4. リザルト画面から「同じ設定で再挑戦」or「設定変更」

### 復習機能（URLパラメータによる自動開始）

特定の単語や苦手単語を復習するためのURLパラメータをサポートしています。

**URLパラメータ**:
| パラメータ | 説明 | 例 |
|-----------|------|-----|
| `wordId` | 特定の単語を最初に出題 | `/quiz?wordId=42` |
| `weakOnly` | 苦手単語のみで構成 | `/quiz?weakOnly=true` |

**使用箇所**:
- 単語詳細画面の「この単語を復習する」ボタン → `/quiz?wordId=${word.id}`
- 苦手単語一覧の「苦手単語を復習する」ボタン → `/quiz?weakOnly=true`
- 学習履歴の「苦手単語を復習する」ボタン → `/quiz?weakOnly=true`

**実装**:
```typescript
// quiz/page.tsx
const searchParams = useSearchParams();
const reviewWordId = searchParams.get("wordId");
const weakOnly = searchParams.get("weakOnly");

// startNewSessionのオプション
startNewSession(settings, {
  priorityWordId: wordIdNum,  // この単語を最初に出題
  weakOnlyMode: true,         // 苦手単語のみ
});
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

### 開発

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build
```

### テスト・Lint

```bash
# テスト実行（Vitest）
npm run test

# テスト（watchモード）
npm run test:watch

# Lint実行
npm run lint

# 型チェック
npx tsc --noEmit
```

### TDDサイクル

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを書く
3. **Refactor**: コードを改善する（テストは通ったまま）

```bash
# TDD開発時の推奨フロー
npm run test:watch  # テストをwatchモードで起動
# 別ターミナルで開発
```

> **Note**: テストフレームワークはVitest。テストファイルは `src/**/__tests__/*.test.ts(x)` に配置。

---

## トラブルシューティング

### Next.js キャッシュ問題

UIが崩れる、エラーが発生する場合は、キャッシュをクリアして再起動:

```bash
# サーバー停止
pkill -f "next" 2>/dev/null

# キャッシュクリア
rm -rf .next node_modules/.cache

# 再起動
npm run dev
```

**ブラウザ側のキャッシュクリア**も必要:
- ハードリロード: `Ctrl+Shift+R` (Mac: `Cmd+Shift+R`)
- または DevTools (F12) → Network → 「Disable cache」→ リロード

### 認証・データ同期の注意点

**AuthGuard による認証待機**:
- `AuthGuard` コンポーネントが認証完了まで全ページをローディング画面でブロック
- これにより、Supabaseセッションが復元される前にページが表示されることを防ぐ
- 複数タブを開いても、各タブで認証が完了してからページが表示される

```typescript
// src/app/layout.tsx
<AuthProvider>
  <Header />
  <main>
    <AuthGuard>{children}</AuthGuard>  {/* ★認証完了まで待機 */}
  </main>
</AuthProvider>
```

**auth-context.tsx の認証フロー**:
1. `getSessionWithTimeout()` で初期セッションを取得（3秒タイムアウト）
2. タイムアウト時は `tryRecoverSessionFromStorage()` でlocalStorageから復元を試みる
3. `onAuthStateChange` でログイン/ログアウトを監視
4. セッションがあれば `setCurrentUserId()` でユーザーIDを設定
5. `isLoading` が `false` になったら認証完了（AuthGuardが解除される）

**getSession() タイムアウトとリカバリー**:
```typescript
// Promise.raceで3秒タイムアウトを実装
const getSessionWithTimeout = async (timeoutMs: number) => {
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve({ data: { session: null }, error: new Error("timeout") }), timeoutMs);
  });
  return Promise.race([supabase.auth.getSession(), timeoutPromise]);
};

// タイムアウト時はlocalStorageから直接セッションを復元
const tryRecoverSessionFromStorage = () => {
  // Supabaseのauth-tokenキー（sb-*-auth-token）を検索
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes("auth-token")) {
      const parsed = JSON.parse(localStorage.getItem(key));
      if (parsed?.user?.id) return { userId: parsed.user.id, email: parsed.user.email };
    }
  }
  return null;
};
```

**直接REST API使用によるデッドロック回避**:

複数タブ問題を根本的に解決するため、Supabaseクライアントの一部機能を直接REST APIで代替しています：

```typescript
// src/lib/supabase/client.ts
createClient(url, key, {
  auth: {
    autoRefreshToken: false,  // 手動でリフレッシュ（デッドロック回避）
    lock: noopLock,           // Web Locks APIを無効化
  }
});

// src/lib/supabase/database.ts - 直接REST APIでデータ取得
async function supabaseRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const accessToken = await getValidAccessToken();  // 必要に応じてリフレッシュ
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${accessToken}`,
    },
    ...options,
  });
  return response.json();
}
```

**この方式のメリット**:
- Supabaseクライアントの内部状態に依存しない
- Web Locks APIのデッドロックを完全に回避
- トークンリフレッシュを明示的に制御可能

**注意点**:
- localStorageのトークンが期限切れの場合、手動リフレッシュが必要
- Supabaseのキー形式が変更された場合は対応が必要

**unifiedStorageを使用するページの実装パターン**:
```typescript
// 認証状態を監視し、変更時にデータを再取得
// ★重要: isLoading（認証初期化中）をチェックし、Supabaseセッション準備完了を待つ
const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

const loadData = useCallback(async () => {
  const data = await unifiedStorage.getData();
  setData(data);
}, []);

// 認証初期化完了後にデータを再取得（認証中はSupabaseセッションが未準備のため待機）
useEffect(() => {
  if (!isAuthLoading) {
    loadData();
  }
}, [isAuthLoading, isAuthenticated, loadData]);
```

**なぜ `isAuthLoading` のチェックが必要か**:
1. 新しいタブを開くと、Supabaseセッションの復元は非同期で行われる
2. `isAuthLoading` が `true` の間は、Supabaseセッションが未準備
3. この状態でSupabaseにクエリすると、RLS（Row Level Security）により空データが返る
4. `isAuthLoading` が `false` になるまで待機することで、正しいデータが取得できる

**対応済みページ**: page.tsx, history, bookmarks, achievements, weak-words

### 複数タブ問題のデバッグ

**症状**: 新しいタブを開くとデータが空になる、またはログアウト状態になる

**考えられる原因**:
1. **getSession() ハング**: Web Locks APIのデッドロックでgetSession()が完了しない
2. **タイムアウト後の復元失敗**: localStorageからセッションを復元できない
3. **認証完了前のデータ読み込み**: `getCurrentUserId()` が `null` を返す
4. **トークン期限切れ**: アクセストークンが期限切れでリフレッシュが必要

**デバッグ用ログ**:
- `[Auth] initializeAuth開始` - 認証初期化開始
- `[Auth] tryRecoverSessionFromStorage:` - localStorageからの復元試行
- `[Auth] localStorageから認証データ発見:` - リカバリー成功
- `[Auth] fetchProfile開始（直接API）:` - プロフィール取得（REST API経由）
- `[UnifiedStorage] shouldUseSupabase:` - Supabase/localStorage切り替え判定

**チェックポイント**:
1. コンソールで `[Auth]` ログを確認し、どこで処理が止まっているか特定
2. ページが `isAuthLoading` を確認し、認証完了後にデータを取得しているか
3. localStorage に `english-app-auth` キーが存在するか
4. トークンの `expires_at` が現在時刻より未来か

**正しい実装**:
```typescript
const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

useEffect(() => {
  if (!isAuthLoading) {  // ★認証完了を待つ
    loadData();
  }
}, [isAuthLoading, isAuthenticated, loadData]);
```

---

## サブエージェント

### english-learning-app-reviewer

コードレビューを実行するサブエージェントです。

**使用タイミング**: 実装完了後、コミット前

**レビュー観点**:
- MVP適合性（過度な抽象化がないか）
- 保守性・可読性（型定義、命名、責務分離）
- UX・学習テンポ（音声再生、画像フォールバック、遷移）
- 共通モジュールの活用（audio.ts, storage.ts, image.ts）

**呼び出し例**:
```
english-learning-app-reviewerサブエージェントを使用して、
今回の変更内容をレビューしてください。
```

---

## 参照ドキュメント

| ドキュメント | パス | 内容 |
|--------------|------|------|
| 設計詳細 | `docs/design.md` | 機能仕様・画面仕様 |
| コーディング規約 | `.claude/agents/best-practices.md` | コード規約 |
| コードレビュー | `.claude/agents/reviewer.md` | レビュー基準（サブエージェント定義） |
| Supabaseセットアップ | `supabase/README.md` | DB設定・マイグレーション手順 |
| 単語データ | `src/data/words.ts` | 単語データベース |
| 実績データ | `src/data/achievements.ts` | 実績定義 |
| 型定義 | `src/types/index.ts` | TypeScript型定義 |
