# Vocabulary Data Policy

## Goal Definition ("Completed")
このアプリにおける「完成」は、対象コースのクイズを学習することで、その試験・学年帯で必要となる語彙範囲を網羅できる状態を指します。

例:
- 英検5級を目指す学習者は `eiken` コースの `stage: "5"` を中心に学習して合格語彙をカバーできる
- TOEIC学習者は `toeic` コースの目標スコア帯ステージを学習して必要語彙を段階的にカバーできる

## Primary Source
- 単語データはオリジナルで構築する（著作権リスクのある外部サービスからのスクレイピングは禁止）
- 推奨ソース: WordNet（プリンストン大学, CC BY-SA）、NGSL、EVP（ケンブリッジ大学）等の商用利用可能な公開データ
- コース構成・ステージ分け・単語配置は独自基準で設計する
- フレーズ（句動詞・熟語・複合語）も独自に選定する

## Course Priority
- コース間で語数を同数に揃えることは目標にしない
- 各コースは「そのコースの合格・到達目標」に必要な語彙カバレッジを最優先する
- `junior` / `senior` は学習範囲に上限があるため、語彙候補が枯渇しても問題ない
- `eiken` / `toeic` は試験範囲カバレッジを優先して段階的に拡張する

## Data Integrity Rules
- 同一コース内で `word` の重複を禁止する（大小文字違いも同一語として扱う）
- 異なるコース間の重複は原則許可するが、学年継続コース（`junior` → `senior`）では基礎語の再出題を避ける
  - 例: `senior` に `apple` などの中学基礎語を重複配置しない
- 信頼ソース由来でないテンプレート生成語は採用しない
- `junior` には中学課程で扱わない語彙（過度に専門的・稀少な語）を入れない

## Word Format Rules
- フレーズ（句動詞・熟語・複合語）は学習上有用であれば全コースで許可
  - 例: "want to", "credit card", "hear from" 等
- 禁止語（公序良俗・学習用途不適切語）は全コースで不採用にする

## Category Classification Policy
- カテゴリは単語データファイル（`words/*.js`）に事前計算済みで格納
- 1語に対して複数カテゴリを許可する（`categories`）
- UI上の主カテゴリは `category`（先頭カテゴリ）を使用するが、検索・フィルタは `categories` 全体で判定する
- カテゴリラベルは `src/data/words/category.ts` の `categoryLabels` で管理

## Difficulty Rules
- 難易度（`difficulty`: 1-7）は `course` + `stage` から事前計算
- 難易度マッピングは `src/data/words/difficulty.ts` の `DIFFICULTY_MAP` で管理
- 難易度上限（`frequencyRank`）をコース別に適用する
  - `junior`: `<= 2`
  - `senior`: `<= 2`
  - `eiken`: `<= 3`
  - `toeic`: `<= 3`
  - `conversation`: 会話表現重視のため上限は緩和
- TOEIC高スコア帯の基礎語混入を禁止する
  - `toeic` の `stage: "700" | "800" | "900"` には、中学基礎の具体名詞（動物・食べ物・身体部位・季節など）を配置しない
  - `toeic` で中学基礎語を許可する場合は、ビジネス用途の語義（例: `schedule`, `purchase`）であることを確認する
- 英検高級での低難度語混入を禁止する
  - `eiken` の `stage: "pre2" | "2" | "pre1" | "1"` には、英検5級〜4級相当の基礎語を原則配置しない

## Recommended Sources
優先度の高い順に採用する。

1. 公式・準公式
- 英検公式（級の目安・出題レベル）
- `https://www.eiken.or.jp/eiken/exam/about/`
- 学習指導要領準拠資料（中学・高校）

2. 頻度ベース語彙
- NGSL (New General Service List)
- NAWL (New Academic Word List)

3. 既存アプリ資産
- 既存 `src/data/words/*.js` の語彙を重複除去・ステージ再配分して拡張

## Operational Notes
- 語彙追加時は、同一コース重複チェックを先に実施する
- `senior` 追加時は `junior` との重複をチェックし、重複語は除外する
- 追加後にステージ別件数を確認し、偏りが大きい場合は段階的に補正する
- 既存語の削除・差し替えを行う場合は、学習体験への影響を明記する

## Word Extension Data Policy

### データ構成（2026-03-24 現在）
```
src/data/
├── word-extensions/
│   ├── index.ts       ← 公開API（Map統合 + getWordExtension）
│   ├── manual.ts      ← 手書き拡張（TOEIC 500/600, Junior Stage 1）
│   └── generated.ts   ← 自動補完エンジン
```

### 手書きコンテンツの対象範囲
- **TOEIC 500**（IDs: 30001–30180）: 全180語に手書きの詳細解説
- **TOEIC 600**（IDs: 30181–30450）: 全語に手書きの詳細解説
- **Junior Stage 1**（IDs: 10001–10530）: 全語に手書きのコンパクト解説
- それ以外: 自動生成（`buildGeneratedExtension()`）でフォールバック提供

### 拡張データの管理ルール
- 手書きコンテンツは `src/data/word-extensions/manual.ts` の `handwrittenExtensions` 配列に登録
- `word-extensions/index.ts` で `wordExtensions` Map としてエクスポート
- `wordExtensions` に登録したIDは必ず対応する単語データファイル（`words/*.js`）に存在すること
- 単語データから語を削除する場合は、対応する拡張エントリも同時に削除する

### フォールバック方針
- 手書きエントリがない単語は `getWordExtension()` が `buildGeneratedExtension()` を自動適用
- 単語詳細ページで手書きデータ優先・生成データフォールバックの順で表示

## Japanese Translation Policy
- クイズの和訳ヒントは「英語を混在させない日本語文」で表示する
- 全単語に `exampleJa`（例文の日本語訳）が必須（充足率100%を維持）
- 「未登録」表示は出さず、最低限の日本語ヒントを常に返す
