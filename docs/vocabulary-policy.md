# Vocabulary Data Policy

## Goal Definition ("Completed")
このアプリにおける「完成」は、対象コースのクイズを学習することで、その試験・学年帯で必要となる語彙範囲を網羅できる状態を指します。

例:
- 英検5級を目指す学習者は `eiken` コースの `stage: "5"` を中心に学習して合格語彙をカバーできる
- TOEIC学習者は `toeic` コースの目標スコア帯ステージを学習して必要語彙を段階的にカバーできる

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

## Course-Fit Filters (Rebuild Rules)
- 非 `conversation` コースはフレーズ語を除外する（空白・ハイフン・スラッシュを含む `word` は不採用）
- 禁止語（公序良俗・学習用途不適切語）は全コースで不採用にする
- 難易度上限（`frequencyRank`）をコース別に適用する
  - `junior`: `<= 2`
  - `senior`: `<= 2`
  - `eiken`: `<= 3`
  - `toeic`: `<= 3`
  - `conversation`: 会話表現重視のため上限は緩和（フレーズ許可）
- TOEIC高スコア帯の基礎語混入を禁止する
  - `toeic` の `stage: "700" | "800" | "900"` には、中学基礎の具体名詞（動物・食べ物・身体部位・季節など）を配置しない
  - `toeic` で中学基礎語を許可する場合は、ビジネス用途の語義（例: `schedule`, `purchase`）であることを確認する
- 英検高級での低難度語混入を禁止する
  - `eiken` の `stage: "pre2" | "2" | "pre1" | "1"` には、英検5級〜4級相当の基礎語を原則配置しない
  - 再配置が必要な語は `stage: "5" | "4" | "3"` へ降格して扱う
- フィルタ適用後に語彙が減ったステージは、同一方針（公式/頻度リスト突合）で段階的に補充する

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
- 既存 `src/data/words/*.ts` の語彙を重複除去・ステージ再配分して拡張

4. 外部語彙取り込み（補完）
- NGSL/NAWL の語彙を優先して取り込み、不足分は信頼可能な公開語彙リストで補完する
- 本リポジトリでは、運用上の補完ソースとしてシステム辞書（`/usr/share/dict/words`）を利用可能とする

4. 補助的な公開記事（一次情報を補完する用途）
- `https://english-club.jp/blog/juniorhigh-english-word/`
- `https://allabout.co.jp/gm/gc/487726/`
- `https://ei-raku.com/2017/11/exam-eiken-comparison/`
- `https://www.rarejob.com/englishlab/column/20210926_02/`
- `https://eigosapuri.jp/article/toeic-word-count/`

## Operational Notes
- 語彙追加時は、同一コース重複チェックを先に実施する
- `senior` 追加時は `junior` との重複をチェックし、重複語は除外する
- 追加後にステージ別件数を確認し、偏りが大きい場合は段階的に補正する
- 既存語の削除・差し替えを行う場合は、学習体験への影響を明記する
- 外部取り込み時は、`NGSL/NAWL -> 補完ソース` の順で投入し、同一コース内重複ゼロを維持する
- 大量取り込み時も「コース別の到達目標カバレッジ」を優先し、コース横並びの件数最適化は行わない

## Word Extension Data Policy

### 手書きコンテンツの対象範囲（2026-03-01 現在）
- **TOEIC 500**（IDs: 30001–30180）: 全180語に手書きの詳細解説（コアイメージ・使い方・類義語との違い・英英定義・語源）
- **TOEIC 600**（IDs: 30181–30450）: 全語に手書きの詳細解説
- **Junior Stage 1**（IDs: 10001–10530）: 全語に手書きのコンパクト解説
- それ以外のコース・ステージ: 自動生成（`buildGeneratedExtension()`）でフォールバック提供

### 拡張データの管理ルール
- 手書きコンテンツは `src/data/word-extensions.ts` の `wordExtensions` Map に登録する
- `wordExtensions` に登録したIDは必ず対応する単語データファイル（`words/*.ts`）に存在すること
- テンプレート生成コンテンツを `wordExtensions` に登録しない（フォールバックは `buildGeneratedExtension()` が自動提供）
- `src/data/word-extensions/` ディレクトリは将来のコース別ファイル分割用に予約されている（現在は未使用）
- 単語データから語を削除する場合は、`wordExtensions` の対応エントリも同時に削除する

### フォールバック方針
- 手書きエントリがない単語は、単語詳細画面で `getWordExtension()` が `buildGeneratedExtension()` を自動適用する
- `compat.ts` の `words` 配列には手書きエントリのみ反映する（起動時コスト最適化）
- 単語詳細ページ（`app/word/[id]/page.tsx`）で手書きデータ優先・生成データフォールバックの順で表示

## Japanese Translation Policy
- クイズの和訳ヒントは「英語を混在させない日本語文」で表示する
- 例文和訳のデータ追加時は、以下の順で採用する
1. 公式・準公式（英検公式情報、学習指導要領準拠）
2. 頻度語彙リスト（NGSL/NAWL）に基づく既存語義
3. 既存 `meaning` と例文構文ルールによる補完ヒント
- 「未登録」表示は出さず、最低限の日本語ヒントを常に返す
- 手動和訳データは `src/data/example-ja-overrides.ts` に集約してバッチ追加する
