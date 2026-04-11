# frequencyTier キャリブレーション方針

> 策定: 2026-04-11（Project Vocabulary Quality Sweep Phase 2 / T-VQS-020）
> 関連: `docs/data-sources.md`

## 1. 目的

英語学習アプリの単語帳で、**学習者が試験・カリキュラムに合わせて「必須語」「標準語」「発展語」を段階的に学べる**ようにする。

特に:
- 英検1級合格を目指す人が**英検1級で頻出の語だけ**を tier1 として学習できる
- TOEIC 600点を目指す人が**TOEIC 600点レベルで頻出の語だけ**を tier1 として学習できる
- 中学1年生が**中1の基礎語だけ**を tier1 として学習できる

## 2. 設計（2026-04-11 以降）

### 2.1 データモデル

`frequencyTier` は **コース単位（CourseAssignment）** で持つ。1 語が複数コースに所属する場合、それぞれのコースで異なる tier を持てる。

```typescript
// src/data/words/types.ts
type CourseAssignment = {
  course: Course;
  stage: Stage;
  meaning?: string;
  tier?: 1 | 2 | 3;  // コース固有 tier（未設定時は MasterWord.frequencyTier にフォールバック）
};

type Word = MasterWord & {
  course: Course;
  stage: Stage;
  courseTier: FrequencyTier;  // 導出フィールド: assignment.tier ?? masterWord.frequencyTier
  // ...
};
```

### 2.2 旧設計との違い

| 項目 | 旧（〜2026-04-10） | 新（2026-04-11〜） |
|---|---|---|
| tier の粒度 | MasterWord 共通 | CourseAssignment 別 |
| 判定ソース | NGSL のみ（暗黙） | コース別に層別化 |
| 英検1級 tier1 | 0.7%（日常語のみ） | 英検1級頻出語が tier1 |

### 2.3 移行戦略

- `MasterWord.frequencyTier` は当面 **保持**（フォールバック用）
- `CourseAssignment.tier` が未設定のコースでは従来通り `MasterWord.frequencyTier` が使われる
- Phase 2.4 で全コースに `tier` 投入完了 → `MasterWord.frequencyTier` を `@deprecated` 宣言
- 既存 257 テストへの影響ゼロ（後方互換）

## 3. 判定ルール（参考文献ベース）

### 3.1 基本原則

**オーナー方針（2026-04-11）**:
> 目標分布を決めずに参考文献に従う。信頼性・品質を優先。
> クイズに影響が出るようであれば UI でフォールバックで吸収する。

### 3.2 ステージ別のソース優先順

| ステージ群 | 優先ソース | tier1 条件 | tier2 条件 |
|---|---|---|---|
| 中1・英検5級・会話A1 | CEFR-J A1 + NGSL 1-500 | rank ≤ 500 | rank ≤ 1000 |
| 中2・英検4級・会話A2 | CEFR-J A2 + NGSL 1-1000 | rank ≤ 1000 | rank ≤ 1500 |
| 中3・英検3級・高1・会話B1 | CEFR-J A2-B1 + NGSL 全体 | rank ≤ 1500 | rank ≤ 2800 |
| 高2・英検準2級・会話B2 | CEFR-J B1-B2 | B1 | B2 |
| 高3・英検2級・TOEIC500 | CEFR-J B1-B2 + NGSL | B1 | B2 |
| TOEIC 600 | NGSL + TSL rank ≤ 600 | NGSL1000 / TSL600 | NGSL2800 / TSL1200 |
| TOEIC 700 | TSL + NGSL + NAWL | TSL rank ≤ 800 | TSL 全体 |
| TOEIC 800 | TSL + BSL + NAWL | TSL + BSL rank ≤ 1000 | TSL + BSL 全体 |
| TOEIC 900 | TSL + BSL + NAWL 全体 | 全体の前半 | 全体の後半 |
| 英検準1級 | Octanove B2 + NAWL | Octanove B2 + NAWL rank ≤ 500 | それ以外 |
| 英検1級 | Octanove C1/C2 全体 | Octanove C1 | Octanove C2 |
| 会話 C1 | Octanove C1 + NAWL | Octanove C1 + NAWL | それ以外 |
| 会話 C2 | Octanove C2 + Words-CEFR C2 | Octanove C2 | それ以外 |

### 3.3 判定優先度

1. **ステージ優先ソース** で tier が判定できた語 → その tier を採用
2. **複数ソースにヒット** する場合 → **最上位の tier**（tier1 > tier2 > tier3）を採用
3. **いずれのソースにもヒットしない** → tier3（暫定）+ `unranked` フラグ（Phase 3 で再判定）

### 3.4 分布目標（参考値、強制しない）

参考文献に従う方針のため**目標分布は強制しない**が、以下を参考指標とする:

- **理想**: tier1 ≈ 25% / tier2 ≈ 45% / tier3 ≈ 30%
- **許容**: tier1 ≥ 5% / tier3 ≤ 80%
- **要対応**: tier1 < 5% → UI フォールバック発動（§4）

## 4. UI フォールバック

コース/ステージで tier1 が **5% 未満** の場合:
- ユーザーが「tier1 で絞る」を選択したとき、**自動的に tier1 + tier2** を表示
- 画面上にバナー表示: 「このコースでは優先語が tier2 まで含まれます」
- データは純粋に保ち、UI で吸収する（社員会議案 B）

## 5. Phase 実装順序

| Phase | 内容 | 工数 |
|---|---|---|
| 2.1 | 型拡張・フォールバックロジック・テスト | 0.5日 |
| 2.2 | 英検1級パイロット自動判定（NGSL+NAWL+Octanove） | 3-5日 |
| 2.3 | UI 5ファイル変更（quiz/word-list/dungeon/book） | 2-3日 |
| 2.4 | 全24ステージ投入 + `frequencyTier` 廃止宣言 | 1-2週間 |

## 6. テスト戦略

### 6.1 既存テスト

- 既存 257 テストへの影響は **ゼロ**（後方互換）
- 型拡張・フォールバックロジックのみでは挙動変化なし

### 6.2 新規テスト

1. `getWordsForCourse()` のフォールバックテスト（`assignment.tier` あり/なしで分岐確認）
2. Phase 2.2 完了後: 英検1級 tier 分布テスト（tier1 比率 ≥ 10%, tier3 比率 ≤ 80% 等）
3. UI フォールバックテスト（tier1 5% 未満時の挙動）

## 7. リスクと対策

| リスク | 対策 |
|---|---|
| Phase 2.4 工数ブレ | 自動判定スクリプトの精度を Phase 2.2 で検証 |
| `word-list/all` での tier 意味の曖昧さ | 全コース表示は `MasterWord.frequencyTier` を使い続ける |
| tier 分布テスト閾値の根拠 | Phase 2.2 パイロット結果を見て根拠ベースで設定 |
| データ未収録語の誤判定 | `unranked: true` フラグで明示化、Phase 3 で手動補完 |

## 8. 改訂履歴

- 2026-04-11: 初版策定（T-VQS-020 着手時）
