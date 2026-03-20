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
│   ├── flashcard/page.tsx        # フラッシュカード専用ページ（saveQuickFlashcardSession でセッション渡し）
│   ├── word-list/page.tsx        # 単語帳ハブ（お気に入り・最近見た・My単語帳・コース別等のカードグリッド）
│   ├── word-list/all/page.tsx    # 単語帳フィルター一覧（コース・カテゴリ・難易度・検索・ソート8種・フラッシュカードモード）
│   ├── word-list/book/[bookId]/page.tsx  # 個別単語帳（並び替え・絞り込み・表示切替・再生・記憶度セレクト・フラッシュカード・出題設定・設定永続化）
│   ├── weak-words/page.tsx       # 苦手単語一覧
│   ├── bookmarks/page.tsx        # ブックマーク一覧（旧ブックマーク + My単語帳を統合表示）
│   ├── history/page.tsx          # 学習履歴（タブ: 概要/苦手単語/履歴）
│   ├── achievements/page.tsx     # 実績一覧
│   ├── review/page.tsx           # SRS・苦手単語復習（list フェーズで予習→クイズへ遷移）
│   ├── dungeon/page.tsx          # WORD DUNGEON（ローグライク）- DungeonGame コンポーネントを表示
│   └── updates/page.tsx          # お知らせ（アップデート情報一覧）
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
│       ├── word-list/            # 単語帳機能
│       │   ├── FlashcardView.tsx          # フラッシュカードモード（SRS連動）
│       │   ├── VocabBookCard.tsx          # 単語帳ハブのカードコンポーネント
│       │   ├── BookmarkSelectDialog.tsx   # My単語帳選択ダイアログ
│       │   ├── CreateBookDialog.tsx       # My単語帳作成ダイアログ
│       │   ├── BookStudySettingsDialog.tsx # 出題設定ダイアログ（FC/クイズ共通）
│       │   ├── BookFilterSheet.tsx        # 絞り込みシート（正答率・最終遭遇日・記憶度）
│       │   └── BookProgressBar.tsx        # 単語帳詳細の進捗バー（記憶度別の色分け）
│       └── word-detail/          # 単語詳細機能
│           ├── WordHeader.tsx
│           ├── WordImage.tsx
│           ├── WordMastery.tsx
│           ├── WordExamples.tsx
│           ├── WordRelations.tsx
│           ├── WordColumn.tsx
│           ├── WordPlaceholderSection.tsx
│           ├── WordSynonymDiff.tsx   # 類義語との違い（構造化リスト）
│           ├── WordText.tsx          # テキスト内英単語リンク化
│           └── index.ts
├── lib/                          # ユーティリティ
│   ├── audio.ts                  # 音声再生（Web Speech API）
│   ├── storage.ts                # localStorage管理
│   ├── image.ts                  # 画像URL/コンセプト画像管理
│   ├── quiz-session.ts           # クイズセッション状態永続化 + 単語帳クイズ用IDリスト管理
│   ├── flashcard-session.ts      # フラッシュカードセッション状態永続化（30分有効期限）
│   ├── navigation-state.ts       # ページナビゲーション状態（タブ・ソート順の復元）
│   ├── word-lookup.ts            # 語彙DBルックアップ（単語→IDのO(1)検索）
│   ├── vocabulary-books.ts       # My単語帳・お気に入り・最近見た単語帳管理（localStorage）
│   └── vocab-book-meta.ts        # bookId→表示名/emoji/gradient/quizHref を共通解決
├── data/                         # 静的データ
│   ├── words.ts                  # 単語データベース
│   ├── achievements.ts           # 実績定義
│   └── recommended-books.ts      # おすすめ単語帳定義
└── types/
    └── index.ts                  # 型定義（集約）
```

---

## 主要な型定義（`src/types/index.ts`）

```typescript
// 問題タイプ
type QuestionType = "en-to-ja" | "ja-to-en" | "listening" | "dictation";

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

> **⚠️ 現在、イメージ画像表示は無効化中**
> 既存の画像（Unsplash URLベース）は品質が不十分なため、`word/[id]/page.tsx` の `<WordImage>` をコメントアウトしている。
> **Stable Diffusion (Replicate API) で全単語の画像を一括生成後に再有効化すること。**

### 画像一括生成計画

- **方式**: Stable Diffusion（Replicate API）でバッチ生成
- **対象**: 全単語（現在 5,346 語、今後増加予定）
- **単価**: 約 $0.003/枚 → 全語で $16〜20 程度
- **生成物の配置**: `public/images/words/{wordId}.webp`（静的配信）
- **生成スクリプト**: `scripts/generate-word-images.mjs`（未作成）
- **前提条件**: 単語データ追加が完了してから一括実行すること
- **再有効化手順**:
  1. スクリプトで全単語画像を生成し `public/images/words/` に配置
  2. `WordImage` コンポーネントが `public/images/words/{wordId}.webp` を参照するよう修正
  3. `word/[id]/page.tsx` のコメントアウトを解除

### フォールバックチェーン（再有効化後）

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
単語帳からクイズを開始するための単語IDリスト管理も担当。

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

// 単語帳クイズ用: 指定単語IDリストを sessionStorage に保存
saveBookWordIds(wordIds: number[]): void

// 単語帳クイズ用: 保存された単語IDリストを取得してクリア（一度だけ使う）
getAndClearBookWordIds(): number[] | null
```

### 特徴

- **sessionStorage使用**: ブラウザタブ単位で状態管理
- **30分有効期限**: 長時間放置後は新規セッションに
- **遷移元追跡**: `?from=quiz` クエリパラメータで戻り先を特定
- **単語帳クイズ**: `saveBookWordIds` → `/quiz?bookWords=true` → `getAndClearBookWordIds` で
  指定単語セットでクイズ開始（`BookStudySettingsDialog` + `useQuiz` が連携）

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

## フラッシュカードセッション管理（`src/lib/flashcard-session.ts`）

フラッシュカード専用ページ `/flashcard` との状態共有に使用。

### 利用可能な関数

```typescript
// フラッシュカードセッション状態を保存（全フィールド指定）
saveFlashcardSession(state: Omit<FlashcardSessionState, "timestamp">): void

// クイック保存（任意画面からフラッシュカードを即開始するため）
// startIndex を省略すると 0 から開始
saveQuickFlashcardSession(wordIds: number[], startIndex?: number): void

// フラッシュカードセッション状態を取得（有効期限切れならnull）
getFlashcardSession(): FlashcardSessionState | null

// フラッシュカードセッション状態をクリア
clearFlashcardSession(): void
```

### フラッシュカード専用ページ `/flashcard` の利用パターン

```typescript
// 1. 遷移元（単語帳詳細・ブックマーク等）でセッション保存して遷移
saveQuickFlashcardSession(wordIds, startIndex);
router.push("/flashcard");

// 2. /flashcard がマウント時にセッション読み込み
const session = getFlashcardSession();
if (!session || !session.flashcardWordIds) {
  router.replace("/word-list"); // セッションなしはハブへリダイレクト
  return;
}

// 3. 詳細画面へ遷移するときは現在位置を更新して保存
onDetailView={(index) => saveQuickFlashcardSession(wordIds, index)}
```

---

## 出題設定ダイアログ（`BookStudySettingsDialog`）

単語帳詳細ページ（`word-list/book/[bookId]/page.tsx`）の「フラッシュカード」「クイズ」ボタンから開く設定ダイアログ。フラッシュカード・クイズ共通で使用。

### 設定項目

| 設定 | 選択肢 | 備考 |
|------|--------|------|
| 出題数 | 全単語 / 任意（スライダー） | 「全単語」選択時は並び順が disabled |
| 並び順 | ランダム / 正答率が低い順・高い順 / 記憶度が低い順・高い順 | 「全単語」→「任意」に切り替えると前回選択を維持 |

### 内部ロジック

- `computeWordIds(allWordIds, countMode, sortBy, statsMap, manualMap)` — ピュアな関数でソート＆スライス
- `accuracy-asc` ソート: 未学習（統計なし）は `-1` として先頭に来る（最も苦手な単語を優先）
- 「全単語」ラジオ選択時: `setSortBy("random")` でリセット（UIと内部状態の一致を保証）
- Fisher-Yates シャッフルでランダム並び替え

---

## 単語帳詳細の並び替え・絞り込み・表示切替・再生（`book/[bookId]/page.tsx`）

### ツールバー機能

個別単語帳ページには進捗バーの下にツールバーが表示されます。

| 機能 | 説明 |
|------|------|
| ↕ 並び替え | 8種類のソートオプション（デフォルト・A→Z・Z→A・記憶度低→高/高→低・遭遇回数少→多/多→少・正答率低→高/高→低） |
| ▽ 絞り込み | `BookFilterSheet` を開く（正答率範囲・最終遭遇日・記憶度レベル） |
| 文A 表示切替 | `WordDisplayMode`（両方表示 / 和訳を隠す / 単語を隠す）の切り替え |
| ▶ 再生 / ■ 停止 | 上から順に `speakWord` で逐次再生（`onEnd` コールバックチェーン） |

### 設定永続化

ツールバーの並び替え・出題設定ダイアログの設定は `vocabularyBooks.saveBookStudySettings(bookId, settings)` で bookId ごとに localStorage に保存され、次回訪問時に自動復元されます。

```typescript
// 保存（bookId ごとのネストで管理）
vocabularyBooks.saveBookStudySettings(bookId, { listSortBy, countMode, sortBy });

// 読込
const saved = vocabularyBooks.loadBookStudySettings(bookId);
if (saved) { /* saved.listSortBy など */ }
```

### 絞り込みシート（`BookFilterSheet`）

| 設定 | UI | 動作 |
|------|-----|------|
| 正答率の範囲 | range スライダー（下限・上限） | 下限 ≤ 上限 を自動クランプ |
| 最終遭遇日 | チェックボックス + number input | N日以上前に遭遇した単語を表示 |
| 記憶度 | 5つのトグルボタン（pill） | 空選択 = 全て表示、選択 = AND 条件 |

- フィルタが1件以上有効な場合、絞り込みボタンに「●」を表示
- `isFilterActive` useMemo で判定

### 逐次再生の実装

```typescript
const playNext = useCallback((i: number) => {
  if (!isPlayingRef.current || i >= filteredWords.length) {
    setIsPlaying(false);
    setPlayingIndex(null);
    return;
  }
  setPlayingIndex(i);
  speakWord(filteredWords[i].word, {
    onEnd: () => setTimeout(() => playNext(i + 1), 400),
  });
}, [filteredWords]);

// アンマウント時クリーンアップ
useEffect(() => () => { isPlayingRef.current = false; stopSpeaking(); }, []);
```

---

## 単語詳細画面の構成

### 表示項目と状態

| 項目 | 状態 | コンポーネント |
|------|------|---------------|
| イメージ画像 | ⏸️ 無効化中（SD生成待ち） | WordImage |
| 単語・発音・品詞 | ✅ | WordHeader |
| 記憶度 | ✅ | WordMastery |
| 例文 | ✅ | WordExamples |
| コアイメージ | 🔜 | WordPlaceholderSection |
| 関連語 | ✅ | WordRelations |
| 使い方 | 🔜 | WordPlaceholderSection |
| 類義語との違い | ✅ | WordSynonymDiff（構造化）/ WordPlaceholderSection（テキスト） |
| 英英定義 | 🔜 | WordPlaceholderSection |
| 語源 | 🔜 | WordPlaceholderSection |
| コラム | ✅ | WordColumn |

> **テキスト内リンク**: 例文・使い方・類義語との違い・英英定義・語源・コラムのテキスト内に登場する英単語は `WordText` コンポーネントにより自動リンク化される。現在の単語は青色表示、語彙DB登録済みの他単語は点線アンダーライン付きリンクで遷移可能。

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
| listening | 例文リスニング（選択式） | 例文全文を読み上げ |
| dictation | 書き取り（キーボード入力式） | 例文全文を読み上げ |

> 旧タイプ `fill-blank` は廃止。履歴画面の互換表示も削除済み。

### 問題タイプの出題比率

クイズ設定画面で各タイプの出題比率（0〜100の重みづけ、内部で正規化）をスライダーで調整可能。

```typescript
type QuestionTypeRatios = {
  enToJa: number;    // A: 英語→日本語
  jaToEn: number;    // B: 日本語→英語
  listening: number; // C: リスニング（例文の空欄選択）
  dictation: number; // D: 書き取り（例文の空欄入力）
};
// デフォルト: 各25%均等
```

- 例文のない単語は `listening` / `dictation` を除外して `en-to-ja` / `ja-to-en` にフォールバック

### リスニング・書き取り問題の共通仕様

- 出題と同時に例文全体を自動読み上げ（300ms遅延）
- 「音声」ボタンで例文を再生
- 「和訳を表示」ボタンで例文の日本語訳を表示（回答前のみ）
  - 例文の日本語訳がある場合はそれを表示
  - ない場合は自動生成ヒントを表示

### 書き取り問題の回答判定

- 大文字・小文字を区別しない（case-insensitive）
- 前後の空白を無視（trim）
- Enter キーで送信可能
- 問題表示時に最初の空欄を自動フォーカス（`key={\`${currentIndex}-${i}\``} と `autoFocus` で実装）

### キーボード操作

クイズ画面全体でキーボード操作が可能：

| キー | 動作 |
|------|------|
| `1` / `2` / `3` / `4` | 選択肢を選択（en-to-ja・ja-to-en・listening） |
| `Enter` | 回答後に次の問題へ進む |

- `e.repeat` チェックで長押しによる誤送信を防止
- `dictation` タイプでは 1〜4 キーは無効（テキスト入力優先）
- キーボードハンドラは `useQuiz.ts` で一元管理（`src/lib/hooks/useQuiz.ts`）

### 1セッションの問題数

```typescript
const QUESTIONS_PER_SESSION = 10; // quiz/page.tsx と review/page.tsx で同値を定義
```

- 対象単語が 10 語未満の場合はその語数がそのまま出題数になる
- `review/page.tsx` の「クイズを始める」ボタンには実際の出題問数を表示：
  - 10 語以下: `クイズを始める（N問）`
  - 10 語超: `クイズを始める（10問 / 全N語から）`

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
| `srsReview` | SRS復習対象単語のみで構成 | `/quiz?srsReview=true` |

**使用箇所**:
- 単語詳細画面の「この単語を復習する」ボタン → `/quiz?wordId=${word.id}`
- ホーム「苦手単語の復習」→ `/review?mode=weak` → 予習リストの「クイズを始める」→ `/quiz?weakOnly=true`
- ホーム「今日の復習」→ `/review?mode=srs` → 予習リストの「クイズを始める」→ `/quiz?srsReview=true`

**実装**:
```typescript
// quiz/page.tsx
const searchParams = useSearchParams();
const reviewWordId = searchParams.get("wordId");
const weakOnly = searchParams.get("weakOnly");
const srsReview = searchParams.get("srsReview");

// startNewSessionのオプション
startNewSession(settings, {
  priorityWordId: wordIdNum,  // この単語を最初に出題
  weakOnlyMode: true,         // 苦手単語のみ
  srsReviewMode: true,        // SRS復習対象のみ（getDailyReviewBatch使用）
});
```

### /review ページ（SRS・苦手単語の予習リスト）

ホームの「今日の復習」「苦手単語の復習」カードからアクセスされる中間ページ。
クイズ自体は quiz/page.tsx に委譲するため、list フェーズのみ担当。

```
/review?mode=srs   → SRS復習対象の単語一覧を表示
/review?mode=weak  → 苦手単語（正答率60%未満）の一覧を表示
```

- **フェーズ**: `list`（予習）→ 「クイズを始める」で `/quiz?srsReview=true` or `/quiz?weakOnly=true` へ遷移
- **list フェーズ**: 単語ごとのSRSステータス（新規/学習中/復習/習得済）または正答率を表示
- SRS は `getDailyReviewBatch()`（当日キャッシュ）を使用し、quiz/page.tsx と同じ単語セットを返す

### ホーム画面のSRS・苦手単語カード（常時表示）

```typescript
// page.tsx — 件数が 0 でもカードを表示し、状態に応じてスタイル変化
{isMounted && (
  <Card hover className={srsReviewCount > 0 ? "border-primary-200 ..." : "border-slate-200 ..."}>
    {srsReviewCount > 0 ? `今日の復習: ${srsReviewCount}語` : "今日の復習: 完了"}
  </Card>
)}
```

- 0件: グレー背景 + 「完了」または「なし」メッセージ
- 1件以上: カラー背景 + 件数表示

---

## ゲーミフィケーション機能

### XP・レベルシステム

- 通常クイズ: 正解 10 XP、コンボボーナス 5 XP（3連続以上）
- スピードチャレンジ: 獲得ポイント = 獲得 XP（`recordStudySession(score / 10, 0)`）
- レベルアップ: `100 * level` XP 必要

### スピードチャレンジ スコアシステム

コンボが続くほど獲得ポイントが倍増し、combo 5以上で 160pt に上限固定。

| コンボ数 | 加算ポイント | 計算式 |
|----------|------------|--------|
| 1 | +10pt | 10 × 2⁰ |
| 2 | +20pt | 10 × 2¹ |
| 3 | +40pt | 10 × 2² |
| 4 | +80pt | 10 × 2³ |
| 5以上 | +160pt（上限） | 10 × 2⁴ |

コンボが途切れると次の正解は +10pt からリスタート。

```ts
// calcPointsForCombo(combo: number): number
10 * Math.pow(2, Math.min(combo, 5) - 1)
```

**称号閾値（スコア = ポイント）:**
- 👑 単語マスター: 全問正解 & score ≥ 300
- 🚀 電光石火: score ≥ 600
- 🏆 スピードスター: score ≥ 300
- 🔥 コンボマスター: maxCombo ≥ 10 & score ≥ 200
- ⚡ 素晴らしい！: score ≥ 100
- 👍 ナイスチャレンジ！: score ≥ 50

**実績閾値:**
- ライトニング: 100pt
- サンダーボルト: 250pt
- 神速: 500pt

### 実績システム（`src/data/achievements.ts`）

| カテゴリ | 実績例 |
|----------|--------|
| streak | 連続学習日数達成 |
| score | 正解数達成 |
| mastery | 単語習得数達成 |
| speed | スピードチャレンジ関連（ポイントベース） |
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

## WORD DUNGEON（ローグライク機能）

### 概要

「英語学習 × ローグライク」をコンセプトにした新モード。
風来のシレンのように冒険に失敗すると所持アイテムをすべて失い、Lv1から再スタートする仕組みで繰り返し英語学習ができる。

### 現在の状態（Phase 3 完了）

- プロトタイプ: `public/dungeon.html`（参照用スタンドアロン HTML/CSS/JS、削除不要）
- React 実装: `src/components/features/dungeon/DungeonGame.tsx`（iframe 廃止）
- ゲームエンジン: `src/lib/dungeon/` 以下の TypeScript モジュール群
- ナビゲーション: 「クイズ」と「単語帳」の間に「⚔️ ダンジョン」を追加済み

### ファイル構成（Phase 3）

```
src/lib/dungeon/
├── types.ts          - ゲーム全型定義（GameState, Enemy, DungeonQuestion 等）
├── constants.ts      - ITEMS_DEF, ENEMIES_DEF, MW/MH/TILE 定数
├── map.ts            - generateMap(), getItemPool()
├── ai.ts             - 敵AI（BFS経路探索・徘徊・moveEnemies）
├── audio.ts          - Web Audio API SFX / BGM（ダンジョン専用）
└── renderer.ts       - Canvas描画（drawMap, scrollToPlayer）

src/components/features/dungeon/
├── useDungeon.ts     - メインゲームロジックフック（全アクション・アイテム効果）
└── DungeonGame.tsx   - React コンポーネント（HUD/Quiz/Items/Death/Controls）
```

### プロトタイプの主要機能（`public/dungeon.html`）

| 機能 | 説明 |
|------|------|
| ダンジョン生成 | タイル（42×32）のランダムマップ（部屋＋廊下）、canvas描画 |
| クイズ戦闘 | 敵に隣接して攻撃するとクイズパネルが出現（英語→日本語 4択） |
| アイテム | 草/巻物/杖/食料/壷/特殊の6カテゴリ（シレン風） |
| HP/EXP | レベルアップで最大HP+5・攻撃+1 |
| 死亡 | 所持アイテム全ロスト・Lv1リスタート（間違えた単語を次回優先出題） |
| BGM | Web Audio API によるピクセルサウンド |
| 操作 | WASDまたは矢印キー、Zで攻撃、スマホはDパッド |

### 段階的統合ロードマップ

**Phase 1（現在）: iframe 埋め込み**
- `public/dungeon.html` をそのまま iframe で表示
- Next.js アプリへのエントリポイントを作成

**Phase 2: 単語データ統合**
- `QUESTIONS` 配列をアプリの `words.ts` に差し替え
- `src/data/words.ts` から問題生成するスクリプトを追加
- 単語帳・難易度でダンジョンをフィルタリングできるように

**Phase 3: React コンポーネント化 ✅ 完了**
- ゲームロジックを `src/lib/dungeon/` TypeScript モジュール群に移植
- Canvas描画を `renderer.ts` に分離
- ゲーム状態管理を `useDungeon.ts` フックに移行
- iframe 廃止、`DungeonGame.tsx` コンポーネントで直接レンダリング

**Phase 4: アプリ連携 ✅ 完了**
- クイズ回答時に `storage.addRecord()` で学習記録を保存（wordId=0 のフォールバック単語は除外）
- ダンジョン終了（死亡/クリア）時に `storage.recordStudySession()` でXP・ストリーク更新
- `storage.checkAndUnlockAchievements()` で実績を自動解除
- 間違えた単語は苦手単語リストに自動反映（`addRecord` + 正答率計算経由）

**Phase 5: ローグライク演出・バランス ✅ 完了**
- アニメーション: 画面フラッシュ（命中/ミス/ダメージ/レベルアップ/罠種別カラー）+ 画面シェイク
- イベントオーバーレイ: 罠・モンスターハウス初入時にポップアップで効果を説明
- バランス: 満腹度減少ペース緩和、草アイテムで満腹度+5回復、正解時回復廃止
- モンスターハウス: 内部に報酬アイテム3〜5個配置
- ショップ: 1フロアに1箇所・部屋中央に3×3グリッド配置（5×5以上の部屋を優先選択）
- 中断セーブ: ターン毎オートセーブで「辞めた場所から再開」を実現

**Phase 6: フォグオブウォー・全体マップ ✅ 完了**
- `explored: boolean[][]` を GameState に追加。未探索タイルは暗闇描画
- 部屋入室時: 部屋全体 + 壁ボーダー(±1) + 廊下入口を一括開示（`revealAround` 部屋分岐）
- 廊下移動時: 1タイル半径（Chebyshev距離1 = 3×3）を開示
- 壁タイルは未探索でも輪郭が薄く見える（`#0e0c18` + エッジハイライト）
- M キー / 🗺地図ボタンで全体マップオーバーレイ（`drawFullMap` / MINI_TILE=7px）
- 全体マップ: 探索済/未探索で色分け、自分(黄)・敵(赤)・アイテム(黄)・ショップ(緑)・階段(青)
- 旧セーブ後方互換: `explored` なし → 全 true でマイグレーション

### セーブ仕様

**中断セーブ方式**（風来のシレン準拠）:
- **セーブタイミング**: 毎ターン終了後（移動・待機・クイズ回答・アイテム使用・ショップ購入）に自動セーブ
- **再開**: 「続きから」で辞めた瞬間の状態からそのまま再開
- **リセット不可**: セーブは1枠のみ。死亡時はセーブデータ削除 → 死亡を利用したやり直し不可
- **セーブAPI**: `storage.saveDungeonGame(save)` / `storage.loadDungeonGame()` / `storage.clearDungeonGame()`
- **ストレージキー**: `dungeon_save`（localStorage）

```typescript
// DungeonSave の構造
type DungeonSave = {
  gameState: GameState;
  questions: DungeonQuestion[];
  savedAt: string; // ISO文字列
};
```

### ローグライク演出（useDungeon.ts）

| 演出 | トリガー | 実装 |
|------|---------|------|
| 赤フラッシュ | 敵からダメージ | `triggerScreenEffect("recv", true)` |
| 緑フラッシュ | 正解 + 命中 | `triggerScreenEffect("correct", false)` |
| 黄フラッシュ | ミス | `triggerScreenEffect("miss", false)` |
| 金フラッシュ | レベルアップ | `triggerScreenEffect("levelup", false)` |
| 罠カラー | 罠踏み（種別ごと） | `triggerScreenEffect("trap_damage" ｜ "trap_sleep" ｜ "trap_warp" ｜ "trap_hunger", shake)` |
| 画面シェイク | 重いダメージ | `shake: true` を渡す（wrapRef に CSS アニメーション）|
| トラップ説明 | 罠踏み時 | `showEventOverlay(TRAP_OVERLAYS.XXX)` |
| モンスターハウス警告 | 初入時のみ | `showEventOverlay(MONSTER_HOUSE_OVERLAY)` |

### クイズ戦闘ダメージ仕様（`useDungeon.ts` > `answerQuiz`）

設計思想: 「知らない単語でもクリアできる・知らない単語にチャレンジしてほしい」

**ベースダメージ（正解/不正解共通で先に計算）**
```typescript
const baseDamage = Math.max(1, Math.round(g.p.atk * (0.8 + Math.random() * 0.4)));
```

| 状況 | 命中率 | ダメージ |
|------|--------|---------|
| 正解 | 90% | `baseDamage` |
| 正解 + 必中の巻物 | 100% | `baseDamage` |
| 不正解 | 45%（正解の半分） | `baseDamage ÷ 2`（最低1） |
| 不正解 + 必中の巻物 | **100%**（必中なので不正解でも必ず当たる） | `baseDamage ÷ 2` |
| 会心（パワーアップ中）| 正解/不正解どちらも変わらず | **`baseDamage × 2`**（防御貫通の特例） |

**ポイント**
- `crit`（会心）と `sureHit`（必中）はどちらも `if (correct)` の分岐の前に消費する
- 不正解でも必中・会心が効く（アイテムの価値を落とさない）
- `g.powerUp` / `g.sureHit` は両フラグとも回答時に必ずリセット

### 敵AI仕様（`ai.ts` > `moveEnemies`）

- **行動順**: プレイヤーが先行し、その後に敵が順番に行動する（同時ではない）
- **1ターン1アクション**: 敵は「移動」か「攻撃」のどちらか1アクションのみ。移動したターンに攻撃しない
- **初認識ターンは行動しない**: `alert=false → true` に変わったターンは `continue` でスキップ（プレイヤーが隣接移動した瞬間に即攻撃されるバグを防ぐ）
- **起床ターンは行動しない**: `justWoke=true` の場合は `continue` でスキップ（`wakeEnemiesInRoom` / `playerAttack` / `doTurn` で眠り解除時に設定）
- **隣接チェックのみで攻撃**: `adj(e.x, e.y, px, py)` が true の場合のみ攻撃。移動ループ内では攻撃しない
  - プレイヤーが動いて敵に隣接 → 敵は攻撃する（プレイヤーの新座標で adj 判定）
  - 敵が移動して隣接 → そのターンは攻撃しない（次ターンに攻撃）
- **移動先にプレイヤーがいる場合は移動不可**: `continue` でその方向をスキップ（斜め移動で着地→攻撃のバグを防ぐ）
- 非アラート中は部屋の廊下入口を BFS で目指して徘徊

### 実装メモ

- 単語データは `useDungeon` の `questions` prop（ダンジョン起動時に単語帳から生成）
- シェイクは `wrapRef`（キャンバスの親要素）に適用。`canvas.style.transform` を使う `scrollToPlayer` と競合しないよう分離
- `screenEffect` / `eventOverlay` は `UIState` とは別 `useState` で管理（`setUiState` コールバック内から別セッター呼び出し可能にするため）
- `seenMonsterHouseRef`: フロア毎の初回モンスターハウス入室フラグ（`goNextFloor` でリセット）
- リザルト復元: `restoredDeath` state は `handleStart` / `handleContinue` 両方で必ず `null` にリセットする（しないと「新しく始める」後に前のリザルトが表示されるバグが発生）
- iframe 内の BGM は iframe をマウントするだけでは再生されない（ユーザー操作が必要）→ 現状の「START GAME」ボタンで問題なし
- 罠配置: アイテムと同タイルに重ならない・部屋入口（廊下隣接タイル）には配置しない（`isRoomEntrance()` で判定）
- 罠発動: 踏んだ時に80%の確率で発動（20%で回避）。罠は踏んでも消えず、再踏みも80%判定
- `justWoke`: 眠りから覚めたターンは行動しない（`Enemy.justWoke?: boolean`。起床時に `true` → `moveEnemies` 先頭で `false` にリセットしてスキップ）
- フォグオブウォー: `explored[y][x]` が `false` のタイルは暗闇描画。`revealAround()` が部屋/廊下を判定して開示範囲を決定。全体マップは `drawFullMap()` (MINI_TILE=7px)、`DungeonMapOverlay` コンポーネントで表示。M キーでトグル
- 旧セーブの `explored` フィールドなし: `loadSave` で `explored ?? Array.from(...)` により全 true にフォールバック（旧プレイヤーがいきなり真っ暗になるのを防ぐ）

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
