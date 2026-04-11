# 参考文献・データソース一覧

> 策定: 2026-04-11（Project Vocabulary Quality Sweep Phase 2 / T-VQS-020）
> 関連: `docs/tier-calibration-policy.md`, `docs/vocabulary-policy.md`

## 1. 方針

- **著作権問題の完全回避**: Oxford 3000/5000・Cambridge EVP・旺文社 Pass単・金フレ/銀フレ等の商用ライセンス必要ソースは使用しない
- **オープンライセンス優先**: CC-BY / CC-BY-SA / MIT / Apache / ISC / パブリックドメインのソースを選定
- **学術的信頼性**: 研究機関が公開している語彙リストを優先
- **日本人学習者向けへの最適化**: CEFR-J（東京外国語大学）等の日本人学習者向けリソースを積極採用
- **アプリ内でのクレジット表示**: ライセンスが要求する出典記載を `/profile` ページ下部で実装

## 2. 採用データソース

### 2.1 NGSL ファミリー（語彙頻度リスト）

Charles Browne / Brent Culligan / Joseph Phillips らによる一連のオープン語彙リスト。全て Cambridge English Corpus ベースで、CC-BY-SA 4.0 で公開されている。

#### NGSL (New General Service List) v1.2
- **URL**: https://www.newgeneralservicelist.com/new-general-service-list
- **ライセンス**: CC-BY-SA 4.0
- **カバレッジ**: 2,809語、英語コーパスの90%超カバー（一般英語）
- **用途**: 中学/高校/英会話 A1-B2 / TOEIC 500-600 のベース頻度リスト

#### TSL (TOEIC Service List) v1.2
- **URL**: https://www.newgeneralservicelist.com/toeic-service-list
- **ライセンス**: CC-BY-SA 4.0
- **カバレッジ**: 約1,200語、NGSL + TSL で TOEIC の 99% カバー
- **用途**: TOEIC 全スコア帯の優先語彙

#### NAWL (New Academic Word List)
- **URL**: https://www.newgeneralservicelist.org/nawl-new-academic-word-list
- **ライセンス**: CC-BY-SA 4.0
- **カバレッジ**: 約960語、88百万語の学術コーパスベース
- **用途**: 英検2級以上 / 高校3年 / TOEIC 800+ / 会話 B2-C1 の学術語彙

#### BSL (Business Service List) v1.2
- **URL**: https://www.newgeneralservicelist.com/business-service-list
- **ライセンス**: CC-BY-SA 4.0
- **カバレッジ**: 約1,700語、NGSL + BSL でビジネステキストの97%カバー
- **用途**: TOEIC 700-900 / 会話 B1-B2 のビジネス語彙

#### NGSL-Spoken v1.2
- **URL**: https://www.newgeneralservicelist.com/ngsl-spoken
- **ライセンス**: CC-BY-SA 4.0
- **カバレッジ**: 721語、口語英語の90%カバー
- **用途**: 英会話 A1-B1 の口語優先語彙

### 2.2 CEFR 関連リソース

#### CEFR-J Wordlist v1.5 (GitHub 版)
- **URL**: https://github.com/openlanguageprofiles/olp-en-cefrj
- **公式**: http://www.cefr-j.org/download_eng (v1.6 最新版、要ライセンス同意)
- **ライセンス**: 要出典（"CEFR-J Wordlist Version 1.5, Tono Lab, TUFS"）、研究・商用とも無償
- **カバレッジ**: 7,801エントリー（6,868ユニーク語）、CEFR A1-B2
- **用途**: 中学/高校/英会話 A1-B2 / 英検3-準1級の **日本人学習者向け** CEFR レベル判定
- **注意**: アプリ内で出典クレジットを必ず表示する

#### Octanove Vocabulary Profile C1/C2 v1.0
- **URL**: https://github.com/openlanguageprofiles/olp-en-cefrj
- **ライセンス**: CC-BY-SA 4.0
- **カバレッジ**: C1/C2 レベル語彙（英検準1-1級相当）
- **用途**: 英検準1級/1級 / TOEIC 900 / 会話 C1-C2 の最上位語彙判定
- **補足**: CEFR-J が A1-B2 までしかカバーしないため、C1-C2 はこれで補完

#### Words-CEFR-Dataset (Maximax67)
- **URL**: https://github.com/Maximax67/Words-CEFR-Dataset
- **ライセンス**: MIT
- **カバレッジ**: 10,000語、CEFR A1-C2、Google N-Gram 頻度付き
- **形式**: SQLite + CSV
- **用途**: C1/C2 補完、機械処理用の自由度最高の基盤データ

### 2.3 補助頻度データ

#### subtlex-word-frequencies (npm / GitHub)
- **URL**: https://github.com/words/subtlex-word-frequencies
- **元データ**: https://osf.io/djpqz/
- **ライセンス**: ISC（コード）/ 学術公開（データ）
- **カバレッジ**: 74,286語、5,100万語の映画字幕コーパス
- **用途**: 口語頻度スコア補助、SUBTLEX-US ベース

#### wordfreq (Python ライブラリ)
- **URL**: https://github.com/rspeer/wordfreq
- **ライセンス**: コード Apache 2.0 / データ CC-BY-SA 4.0
- **カバレッジ**: 多言語・複数コーパスのアグリゲート
- **用途**: 頻度スコア付与の補助（Phase 2.4 以降で検討）

#### machine_readable_wordlists (lpmi-13)
- **URL**: https://github.com/lpmi-13/machine_readable_wordlists
- **ライセンス**: CC0-1.0（パブリックドメイン）
- **カバレッジ**: NGSL / NAWL / GSL / AWL / BNC-COCA 等を JSON/YAML 化
- **用途**: NGSL ファミリーの機械可読版（Phase 2.2 でスクリプト入力として活用可）

### 2.4 英検レベル対応

#### 英検 CEFR 公式対応表（英検協会）
- **URL**: https://www.eiken.or.jp/cse/
- **マッピング**:
  - 5級/4級: A1 未満
  - 3級: A1
  - 準2級: A2
  - 2級: B1
  - 準1級: B2
  - 1級: C1 相当（C2 は英検でも計測不能）
- **用途**: 英検グレードと CEFR-J データの橋渡し
- **ライセンス**: 参照利用

## 3. 採用しないソース（使用不可）

| ソース | 理由 |
|---|---|
| **英検過去問・公式語彙リスト** | All rights reserved、配布・組み込み不可 |
| **Oxford 3000/5000** | Oxford University Press 著作権、商用は許諾制 |
| **English Vocabulary Profile (Cambridge)** | 非商用のみ無料 |
| **Longman Communication 3000** | Pearson 著作権 |
| **旺文社 Pass単 でる度 A/B/C** | 旺文社著作権 |
| **金のフレーズ / 銀のフレーズ (TOEIC)** | 朝日新聞出版著作権 |
| **Kelly Project（英語）** | CC-BY-NC-SA 2.0（非商用のみ、商用不可） |
| **JACET8000** | JACET 著作権、商用利用は要確認 |
| **BNC/COCA Full Corpus** | BYU 有料ライセンス |

## 4. アプリ内クレジット表示

以下を `/profile` ページ下部の「参考文献」セクションに表示する:

```
本アプリの語彙データは以下のオープンライセンスリソースを使用しています。

- CEFR-J Wordlist v1.5 (Tono Lab, TUFS) — 要出典
- NGSL / TSL / NAWL / BSL / NGSL-Spoken — CC-BY-SA 4.0
  (Browne, Culligan, Phillips. https://www.newgeneralservicelist.com/)
- Octanove Vocabulary Profile C1/C2 — CC-BY-SA 4.0
- Words-CEFR-Dataset — MIT License
- subtlex-word-frequencies — ISC License
```

## 5. データ取得・更新手順

### 5.1 初回取得（Phase 2.2）

1. 各ソースの公式サイト/GitHub から最新版を取得
2. `scripts/download-vocab-sources.mjs` を作成（自動化スクリプト）
3. 取得データは `data/vocab-sources/` 配下に配置（gitignore 対象外、リポジトリに含める）
4. 各ファイルに取得元・取得日・ライセンスをヘッダコメントとして付記

### 5.2 バージョン更新

- NGSL ファミリーはバージョン番号が付与されている（例: v1.2）→ 更新時は差分確認必須
- CEFR-J は GitHub で更新が管理されている → 定期的に pull check
- データ更新時は tier 再判定スクリプトを再実行し、差分をコミット

## 6. 改訂履歴

- 2026-04-11: 初版策定（T-VQS-020 着手時）
