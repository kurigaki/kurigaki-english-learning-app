# 品質向上タスクリスト

Project Clean Vocabulary 完了後の次フェーズ施策。
全社員会議（2026-03-29）で決定。

---

## 優先度1: データ品質テスト（vitest）✅ 完了
- **担当**: キラーT
- **状態**: 完了（2026-03-29）
- **成果物**: `src/data/words/__tests__/word-data-quality.test.ts`（48テスト、全合格）
- **概要**: 単語データの品質を自動検証するテストをvitestで作成し、CIに組み込む
- **検証項目**:
  - [ ] word重複がないこと
  - [ ] ID重複がないこと
  - [ ] 全エントリにexamplesが3件あること
  - [ ] meaningが10文字以内であること
  - [ ] stage-difficulty対応が正しいこと（5→1, 4→2, 3→3, pre2→4, 2→5, pre1→6, 1→7）
  - [ ] partOfSpeechが5種（noun/verb/adjective/adverb/other）のいずれかであること
  - [ ] 各コースファイルのcourse/stageが正しい値であること
  - [ ] 壊れた例文（バックスラッシュ）がないこと
- **効果**: 今後のデータ変更でデグレを防止する安全網

## 優先度2: クイズ選択肢ロジック改善 ✅ 完了
- **担当**: キラーT
- **状態**: 完了（2026-03-29）
- **修正ファイル**: `quiz/generator.ts`, `speed-challenge-logic.ts`, `speed-challenge/page.tsx`, `review-quiz.ts`（計4箇所）
- **修正内容**: 選択肢候補から正解と同一meaningの語を除外するフィルタ追加
- **概要**: 同一meaningの語をダミー選択肢に含めないロジックを追加
- **対象ファイル**: `src/lib/hooks/useQuiz.ts`（選択肢生成部分）
- **背景**: 2級内で"恐ろしい"4語（horrible/dreadful/fearsome/frightening）、"強化する"3語（reinforce/strengthen/intensify）が同一meaningのため、選択肢に混ざると学習者が混乱する
- **実装案**: 選択肢候補からanswer wordと同一meaningの語を除外するフィルタ追加

## 優先度3: WordExtension Phase 2
- **担当**: マクロファージ
- **状態**: 未着手
- **概要**: 3級〜2級の頻出1,000語に対して単語詳細データを充実
- **追加データ**:
  - [ ] コアイメージ（`coreImage`）: 一言で単語のイメージを伝える
  - [ ] 語源（`etymology`）: ラテン語・ゲルマン語の由来
  - [ ] 使い方（`usage`）: "say/tell/speak/talkの使い分け"のような実践ガイド
  - [ ] 類義語との違い（`synonymDifferenceEntries`）: 構造化データ
- **対象ファイル**: `src/data/word-extensions/manual.ts`
- **効果**: 単語帳アプリとの決定的差別化。ユーザー定着に最も効果的

## 優先度4: 単語画像生成（Stable Diffusion）
- **担当**: 血小板
- **状態**: 未着手
- **概要**: Stable Diffusion（Replicate API）で全単語のイメージ画像を一括生成
- **見積り**: 約$16-20（~11,000語 × $0.003/枚）
- **配置先**: `public/images/words/{wordId}.webp`
- **前提**: `scripts/generate-word-images.mjs`を作成して実行
- **関連**: `src/lib/image.ts`の`WordImage`コンポーネントのコメントアウト解除

## 優先度5: 頻出フレーズ追加 ✅ 完了
- **担当**: 赤血球
- **状態**: 完了（2026-03-29）
- **成果**: 30件の英検頻出フレーズをeiken.jsに追加（stage 4: 8件、stage 3: 10件、stage pre2: 12件）
- **概要**: 英検3級〜2級の慣用句・頻出フレーズを独立エントリとして追加
- **候補例**: "look forward to", "be interested in", "take care of", "make a decision", "get along with"
- **コロケーション情報**: WordExtensionに自然な組み合わせを追加

---

## 追加施策（優先度低・将来検討）

### 学習進捗の可視化改善（B細胞提案）
- 「英検3級コースの○%完了」のプログレスバー
- カテゴリ別の正答率表示
- 各ステージクリア時のお祝い演出

### 音声の充実（血小板提案）
- UK/US発音の両方を全単語に追加
- 例文の読み上げ速度調整（初級者向けゆっくりオプション）

---

## 完了済み: Project Clean Vocabulary

2026-03-29 完了。主な成果:
- 全5コース 11,335語（英検）+ 4,011語（TOEIC）+ 2,004語（中学）+ 2,161語（高校）+ 2,209語（会話）
- 全コース: word重複0、ID重複0、壊れた例文0、不正stage0
- 英検累積: 3級2,136語、準2級3,655語、2級5,797語（全目標達成）
- 全ステージ動詞比率15%以上
- 5/4/3級のmeaning衝突0件
- meaning全て10文字以内
- 必須語カバー率100%（46/46）
