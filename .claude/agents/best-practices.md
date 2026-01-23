# english-learning-app コーディング規約

## 1. プロジェクト概要

英語学習アプリ（ゲーミフィケーション要素あり）のMVP開発プロジェクト。
**一人プレイ前提**、認証なしで動作する学習体験を最優先。

---

## 2. 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 14 (App Router) + TypeScript |
| スタイリング | Tailwind CSS |
| 状態管理 | React State + localStorage |
| 音声再生 | Web Speech API |
| 画像 | Unsplash + Next/Image |

---

## 3. ディレクトリ構成

```
src/
├── app/                # Next.js App Router ページ
├── components/
│   ├── ui/            # 汎用UIコンポーネント（Button, Card等）
│   └── features/      # 機能別コンポーネント
├── lib/               # ユーティリティ（audio, storage, image）
├── data/              # 静的データ（words, achievements）
└── types/             # 型定義（index.ts に集約）
```

---

## 4. MVP開発の基本方針

### 4.1 やること

- **動くものを最優先**: 完璧より動作を優先
- **シンプルな設計**: 過度な抽象化を避ける
- **既存コード尊重**: 新規ファイル作成より既存ファイルの編集を優先
- **テンポ重視**: 学習体験を損なう重い処理は避ける

### 4.2 やらないこと

- 認証機能（一人プレイ前提）
- サーバーサイドDB（localStorageで十分）
- 過度なエラーハンドリング
- 使われていない抽象化レイヤー

---

## 5. TypeScript規約

### 5.1 型定義

```typescript
// Good: 型は src/types/index.ts に集約
import { Word, Question, LearningRecord } from "@/types";

// Bad: 各ファイルで独自に型定義
type Word = { ... }; // 散らばった定義
```

### 5.2 any の使用禁止

```typescript
// Good: 適切な型を使用
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { ... };

// Bad: any の濫用
const handleClick = (e: any) => { ... };
```

### 5.3 Union Types の活用

```typescript
// Good: 明確なユニオン型
type QuestionType = "en-to-ja" | "ja-to-en" | "fill-blank";
type MasteryLevel = "new" | "learning" | "familiar" | "mastered";

// Bad: 曖昧な string 型
type QuestionType = string;
```

---

## 6. コンポーネント規約

### 6.1 ファイル構成

```typescript
// 1. インポート（React/Next → 外部ライブラリ → 内部モジュール）
import { useState, useEffect } from "react";
import Link from "next/link";

import { Word } from "@/types";
import { Button, Card } from "@/components/ui";

// 2. 型定義（Props）
type QuizCardProps = {
  question: Question;
  onAnswer: (answer: string) => void;
};

// 3. コンポーネント本体
export function QuizCard({ question, onAnswer }: QuizCardProps) {
  // ...
}
```

### 6.2 コンポーネント分類

| 種類 | 配置 | 責務 |
|------|------|------|
| UIコンポーネント | `components/ui/` | 見た目のみ、ロジックなし |
| 機能コンポーネント | `components/features/` | ドメインロジックを含む |
| ページ | `app/` | ルーティング、データ取得 |

### 6.3 Client Component の使用

```typescript
// Client Component が必要な場合のみ "use client" を付与
"use client";

// useState, useEffect, イベントハンドラを使う場合
// localStorage, Web Speech API にアクセスする場合
```

---

## 7. 状態管理規約

### 7.1 状態の最小化

```typescript
// Good: 必要最小限の状態
const [currentIndex, setCurrentIndex] = useState(0);
const currentQuestion = questions[currentIndex]; // 派生値は計算で取得

// Bad: 冗長な状態
const [currentIndex, setCurrentIndex] = useState(0);
const [currentQuestion, setCurrentQuestion] = useState(questions[0]); // 同期が必要
```

### 7.2 localStorage の使用

```typescript
// Good: storage.ts を通じてアクセス
import { storage } from "@/lib/storage";
const records = storage.getRecords();

// Bad: 直接アクセス
const records = JSON.parse(localStorage.getItem("records") || "[]");
```

---

## 8. スタイリング規約

### 8.1 Tailwind CSS

```tsx
// Good: Tailwind ユーティリティクラスを直接使用
<button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
  送信
</button>

// Bad: インラインスタイル
<button style={{ padding: "8px 16px", backgroundColor: "#3b82f6" }}>
  送信
</button>
```

### 8.2 カラーパレット

```css
/* primary: 緑系（学習・成功） */
primary-50 〜 primary-900

/* slate: グレー系（テキスト・背景） */
slate-50 〜 slate-900

/* red: エラー・不正解 */
/* green: 成功・正解 */
```

---

## 9. 音声機能規約

### 9.1 共通モジュールの使用

```typescript
// Good: lib/audio.ts を使用
import { speakWord, speakSentence, isSpeechSynthesisSupported } from "@/lib/audio";

// Bad: 独自実装
const synth = window.speechSynthesis;
synth.speak(new SpeechSynthesisUtterance(text));
```

### 9.2 自動再生の重複防止

```typescript
// Good: Ref で再生済みを記録
const hasAutoPlayedRef = useRef<Set<number>>(new Set());

useEffect(() => {
  if (hasAutoPlayedRef.current.has(currentIndex)) return;
  hasAutoPlayedRef.current.add(currentIndex);
  speakWord(word);
}, [currentIndex]);
```

### 9.3 テンポの維持

| 画面 | 遅延時間 | 理由 |
|------|---------|------|
| クイズに挑戦 | 300ms | 画面表示を見てから聞く |
| スピードチャレンジ | 100ms | テンポ最優先 |
| 単語詳細 | 0ms | ユーザー操作に即応 |

---

## 10. 画像機能規約

### 10.1 共通モジュールの使用

```typescript
// Good: lib/image.ts を使用
import { getImageUrl, getCategoryEmoji, getCategoryGradient } from "@/lib/image";

// Bad: 各コンポーネントで独自定義
const imageUrl = word.imageUrl || "https://...";
```

### 10.2 エラーハンドリング

```tsx
// Good: フォールバック付き
<Image
  src={imageUrl}
  alt={word}
  onError={() => setHasError(true)}
/>
{hasError && <FallbackEmoji emoji={getCategoryEmoji(category)} />}
```

---

## 11. 画面遷移規約

### 11.1 単語詳細への導線

**原則: 「単語が表示されている = その単語の詳細画面に遷移できる」**

```tsx
// Good: 単語表示箇所にリンクを設置
<Link
  href={`/word/${word.id}`}
  className="flex items-center justify-between p-3 hover:bg-primary-50 group"
>
  <SpeakButton text={word.word} size="sm" />
  <div>{word.word} - {word.meaning}</div>
  <span className="group-hover:translate-x-1">→</span>
</Link>

// Bad: 単語を表示するだけで遷移不可
<div>{word.word} - {word.meaning}</div>
```

---

## 12. パフォーマンス規約

### 12.1 避けるべきこと

- 100KB以上の画像の使用
- 音声再生完了を待つブロッキング処理
- 複数音声の同時再生
- ネットワークエラー時のリトライループ

### 12.2 推奨事項

- 1問5〜15秒で回答できるUI設計
- 即時フィードバック（回答後すぐに結果表示）
- 画像読み込み失敗時のフォールバック

---

## 13. 命名規約

### 13.1 ファイル名

| 種類 | 規則 | 例 |
|------|------|-----|
| コンポーネント | PascalCase | `QuizCard.tsx` |
| ユーティリティ | camelCase | `storage.ts` |
| 型定義 | `index.ts` に集約 | `types/index.ts` |

### 13.2 関数・変数名

```typescript
// Good: 意図が明確な命名
const getMasteryLevel = (accuracy: number, attempts: number) => { ... };
const handleAnswerSelect = (answer: string) => { ... };

// Bad: 曖昧な命名
const calc = (a: number, n: number) => { ... };
const onClick = (v: string) => { ... };
```

---

## 14. 将来の拡張に向けた設計

### 14.1 型定義での事前準備

```typescript
// 将来追加予定のフィールドも型に含める
export type Word = {
  // 現在使用中
  id: number;
  word: string;
  meaning: string;

  // 将来追加予定（オプショナル）
  coreImage?: string;
  englishDefinition?: string;
  etymology?: string;
};
```

### 14.2 ストレージ抽象化

```typescript
// storage.ts の内部実装を変えるだけで
// localStorage → Supabase への移行が可能
export const storage = {
  getRecords: () => { ... },
  saveRecord: (record: LearningRecord) => { ... },
};
```
