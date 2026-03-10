import { Word, getWordsByCourse } from "@/data/words/compat";
import { Question, QuestionType, QuestionTypeRatios } from "@/types";
import { shuffleArray, pickRandom } from "@/lib/shuffle";
import { QuizSettings } from "./settings";

/**
 * 比率設定と例文の有無に基づいて問題タイプを選択する。
 * 例文のない単語は listening / dictation を除外して選択する。
 */
function selectQuestionTypeWithRatios(
  ratios: QuestionTypeRatios,
  hasExample: boolean
): QuestionType {
  // weight > 0 のみに絞る。
  // - 0 を含めると Math.random()=0 のとき weight=0 のエントリが誤選択される
  // - 例文のない単語は listening / dictation を除外
  const pool = [
    { type: "en-to-ja" as QuestionType, weight: ratios.enToJa },
    { type: "ja-to-en" as QuestionType, weight: ratios.jaToEn },
    { type: "speaking" as QuestionType, weight: ratios.speaking ?? 0 },
    ...(hasExample
      ? [
          { type: "listening" as QuestionType, weight: ratios.listening },
          { type: "dictation" as QuestionType, weight: ratios.dictation },
        ]
      : []),
  ].filter((p) => p.weight > 0);

  // 全タイプが 0 の場合: 例文なし単語で listening/dictation=100% など
  // enToJa / jaToEn の ratio でフォールバック（両方 0 なら均等に選択）
  if (pool.length === 0) {
    const enToJaWeight = ratios.enToJa || 1;
    const jaToEnWeight = ratios.jaToEn || 1;
    return Math.random() * (enToJaWeight + jaToEnWeight) < enToJaWeight
      ? "en-to-ja"
      : "ja-to-en";
  }

  const total = pool.reduce((s, p) => s + p.weight, 0);
  let random = Math.random() * total;

  for (const { type, weight } of pool) {
    random -= weight;
    if (random <= 0) return type;
  }
  // 浮動小数点誤差で random がわずかに正のまま残るケースへの安全策。
  // "en-to-ja" をハードコードせず、最後の要素（最大確率のタイプ）を返す。
  return pool[pool.length - 1].type;
}

function generateChoicesForEnToJa(correctWord: Word, allWords: Word[]): string[] {
  const wrongWords = pickRandom(
    allWords.filter((w) => w.id !== correctWord.id),
    3
  );

  const choices = [correctWord.meaning, ...wrongWords.map((w) => w.meaning)];
  return shuffleArray(choices);
}

function generateChoicesForJaToEn(correctWord: Word, allWords: Word[]): string[] {
  const wrongWords = pickRandom(
    allWords.filter((w) => w.id !== correctWord.id),
    3
  );

  const choices = [correctWord.word, ...wrongWords.map((w) => w.word)];
  return shuffleArray(choices);
}

/**
 * 例文中に単語が含まれているかチェック（穴あき問題用）
 * 単語境界を考慮し、実際に穴を空けられるか確認
 */
function canCreateFillBlank(example: string, word: string): boolean {
  // 単語境界付きの正規表現でチェック
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
  return regex.test(example);
}

/**
 * 正規表現の特殊文字をエスケープ
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * 穴あき例文を生成（リスニング問題・回答後の表示に使用）
 */
export function createFillBlankSentence(example: string, word: string): string {
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
  return example.replace(regex, (match) => {
    const wordCount = match.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount <= 1) return "_____";
    return Array.from({ length: wordCount }, () => "_____").join(" ");
  });
}

/**
 * リスニング/書き取り問題用の例文を選択する。
 * word.examples[] がある場合は穴あき可能なものをランダムに選択する。
 * なければ従来の word.example にフォールバック。
 */
export function selectFillBlankExample(word: Word): { example: string; exampleJa: string | undefined } | null {
  // examples[] がある場合は穴あき可能なものをランダムに選ぶ
  if (word.examples && word.examples.length > 0) {
    const validExamples = word.examples.filter((ex) => canCreateFillBlank(ex.en, word.word));
    if (validExamples.length > 0) {
      const selected = validExamples[Math.floor(Math.random() * validExamples.length)];
      return { example: selected.en, exampleJa: selected.ja };
    }
  }
  // フォールバック: 従来の単一例文
  if (word.example && canCreateFillBlank(word.example, word.word)) {
    return { example: word.example, exampleJa: word.exampleJa };
  }
  return null;
}

// 書き取り問題のインライン入力用パーツ
export type DictationPart =
  | { kind: "text"; content: string }
  | { kind: "blank"; wordIndex: number };

/**
 * 例文を「テキスト部分」と「入力ブランク部分」に分割する（書き取り問題用）
 * "Please stand up and leave." + "stand up"
 * → [{text:"Please "}, {blank:0}, {text:" "}, {blank:1}, {text:" and leave."}]
 */
export function parseDictationParts(example: string, word: string): DictationPart[] {
  const escaped = escapeRegex(word);
  const regex = new RegExp(`\\b${escaped}\\b`, "gi");
  const match = regex.exec(example);
  if (!match) return [{ kind: "text", content: example }];

  const parts: DictationPart[] = [];

  if (match.index > 0) {
    parts.push({ kind: "text", content: example.slice(0, match.index) });
  }

  // フレーズ内の単語を個別のブランクに分割（例: "stand up" → blank[0], blank[1]）
  const matchedWords = match[0].split(/\s+/);
  matchedWords.forEach((_, i) => {
    if (i > 0) parts.push({ kind: "text", content: " " });
    parts.push({ kind: "blank", wordIndex: i });
  });

  const after = example.slice(match.index + match[0].length);
  if (after) parts.push({ kind: "text", content: after });

  return parts;
}

export function generateQuestion(word: Word, allWords: Word[], ratios: QuestionTypeRatios): Question {
  // examples[] を考慮した例文選択（hasExample の判定も改善）
  const selectedExample = selectFillBlankExample(word);
  const hasExample = selectedExample !== null;
  let type = selectQuestionTypeWithRatios(ratios, hasExample);

  // listening / dictation は例文が必要。例文なしなら enToJa/jaToEn の ratio でフォールバック
  if ((type === "listening" || type === "dictation") && !hasExample) {
    const enToJaWeight = ratios.enToJa || 1;
    const jaToEnWeight = ratios.jaToEn || 1;
    type = Math.random() * (enToJaWeight + jaToEnWeight) < enToJaWeight ? "en-to-ja" : "ja-to-en";
  }

  const wordData = {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
    // examples[] があれば選択された例文を使用し、なければ従来の word.example にフォールバック
    example: selectedExample?.example ?? word.example,
    exampleJa: selectedExample?.exampleJa ?? word.exampleJa,
    category: word.category,
  };

  switch (type) {
    case "en-to-ja":
      return {
        word: wordData,
        type: "en-to-ja",
        choices: generateChoicesForEnToJa(word, allWords),
        correctAnswer: word.meaning,
      };

    case "ja-to-en":
      return {
        word: wordData,
        type: "ja-to-en",
        choices: generateChoicesForJaToEn(word, allWords),
        correctAnswer: word.word,
      };

    case "listening":
      // 選択式（リスニング）: 例文の空欄に入る単語を4択で選ぶ
      return {
        word: wordData,
        type: "listening",
        choices: generateChoicesForJaToEn(word, allWords),
        correctAnswer: word.word,
      };

    case "dictation":
      // 入力式（書き取り）: 例文の空欄に入る単語をキーボードで入力
      return {
        word: wordData,
        type: "dictation",
        choices: [],
        correctAnswer: word.word,
      };

    case "speaking":
      // スピーキング: 日本語の意味を見て英語で声に出す。choices は音声非対応時の選択肢フォールバック用
      return {
        word: wordData,
        type: "speaking",
        choices: generateChoicesForJaToEn(word, allWords),
        correctAnswer: word.word,
      };
  }
}

// 設定に基づいて単語をフィルタリング
export function filterWordsBySettings(
  allWords: Word[],
  settings: QuizSettings,
  bookmarkedIds: number[]
): Word[] {
  let filtered = allWords;

  // コースフィルター
  if (settings.course) {
    const courseWords = getWordsByCourse(settings.course, settings.stage ?? undefined);
    const courseIds = new Set(courseWords.map((w) => w.id));
    filtered = filtered.filter((w) => courseIds.has(w.id));
  }

  // カテゴリフィルター
  if (settings.categories.length > 0) {
    filtered = filtered.filter((w) => {
      const wordCategories = w.categories && w.categories.length > 0
        ? w.categories
        : [w.category];
      return settings.categories.some((c) => wordCategories.includes(c));
    });
  }

  // 難易度フィルター
  if (settings.difficulties.length > 0) {
    filtered = filtered.filter((w) => settings.difficulties.includes(w.difficulty));
  }

  // ブックマークのみ
  if (settings.includeBookmarksOnly) {
    filtered = filtered.filter((w) => bookmarkedIds.includes(w.id));
  }

  return filtered;
}

// セッション構成比率
const SESSION_COMPOSITION = {
  weakWords: 0.4,    // 苦手単語 40%
  newWords: 0.3,     // 未学習単語 30%
  reviewWords: 0.3,  // 復習単語 30%
};

export function generateSessionQuestions(
  targetWords: Word[],
  allWords: Word[],
  count: number,
  weakWordIds: number[],
  studiedWordIds: number[],
  ratios: QuestionTypeRatios
): Question[] {

  // targetWordsからカテゴリ別に単語を分類
  const weakWords = targetWords.filter((w) => weakWordIds.includes(w.id));
  const newWords = targetWords.filter((w) => !studiedWordIds.includes(w.id));
  const reviewWords = targetWords.filter(
    (w) => studiedWordIds.includes(w.id) && !weakWordIds.includes(w.id)
  );

  // 目標数を計算
  const targetWeak = Math.floor(count * SESSION_COMPOSITION.weakWords);
  const targetNew = Math.floor(count * SESSION_COMPOSITION.newWords);
  const targetReview = count - targetWeak - targetNew;

  // 各カテゴリからランダムに選択
  const selectedWeak = pickRandom(weakWords, targetWeak);
  const selectedNew = pickRandom(newWords, targetNew);
  const selectedReview = pickRandom(reviewWords, targetReview);

  // 足りない分を他のカテゴリで補充
  let selected = [...selectedWeak, ...selectedNew, ...selectedReview];

  if (selected.length < count) {
    const selectedIds = new Set(selected.map((w) => w.id));
    const remaining = targetWords.filter((w) => !selectedIds.has(w.id));
    const additional = pickRandom(remaining, count - selected.length);
    selected = [...selected, ...additional];
  }

  // シャッフルして問題を生成
  const shuffledSelected = shuffleArray(selected);
  return shuffledSelected.map((word) => generateQuestion(word, allWords, ratios));
}
