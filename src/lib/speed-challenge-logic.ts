import { words, Word } from "@/data/words/compat";
import { Question, QuestionType } from "@/types";
import { shuffleArray, pickRandom } from "@/lib/shuffle";

export type SpeedChallengeMode = 'mixed' | 'en-to-ja' | 'ja-to-en' | 'ja-to-en-speaking';

export type Title = { emoji: string; text: string };

export function getSpeedChallengeTitle(score: number, maxCombo: number, totalQuestions: number): Title {
  const isPerfect = totalQuestions > 0 && score === totalQuestions;

  if (isPerfect && score >= 15) {
    return { emoji: "👑", text: "単語マスター" };
  }
  if (score >= 25) {
    return { emoji: "🚀", text: "電光石火" };
  }
  if (score >= 20) {
    return { emoji: "🏆", text: "スピードスター" };
  }
  if (maxCombo >= 15 && score >= 15) {
    return { emoji: "🔥", text: "コンボマスター" };
  }
  if (score >= 10) {
    return { emoji: "⚡", text: "素晴らしい！" };
  }
  if (score >= 5) {
    return { emoji: "👍", text: "ナイスチャレンジ！" };
  }
  return { emoji: "💪", text: "もう一歩！" };
}

type QuestionTypeWeight = { type: QuestionType; weight: number };
const QUESTION_TYPE_WEIGHTS: QuestionTypeWeight[] = [
  { type: "en-to-ja", weight: 60 },
  { type: "ja-to-en", weight: 40 },
];

export function selectQuestionType(mode: SpeedChallengeMode): QuestionType {
  if (mode === 'en-to-ja') return 'en-to-ja';
  if (mode === 'ja-to-en' || mode === 'ja-to-en-speaking') return 'ja-to-en';

  const totalWeight = QUESTION_TYPE_WEIGHTS.reduce((sum, q) => sum + q.weight, 0);
  let random = Math.random() * totalWeight;
  for (const { type, weight } of QUESTION_TYPE_WEIGHTS) {
    random -= weight;
    if (random <= 0) return type;
  }
  return "en-to-ja";
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

export function generateQuestion(word: Word, allWords: Word[], mode: SpeedChallengeMode): Question {
  const type = selectQuestionType(mode);
  if (type === "ja-to-en") {
    return {
      word: { id: word.id, word: word.word, meaning: word.meaning },
      type: "ja-to-en",
      choices: generateChoicesForJaToEn(word, allWords),
      correctAnswer: word.word,
    };
  }
  return {
    word: { id: word.id, word: word.word, meaning: word.meaning },
    type: "en-to-ja",
    choices: generateChoicesForEnToJa(word, allWords),
    correctAnswer: word.meaning,
  };
}

export function getNextQuestion(usedWordIds: Set<number>, mode: SpeedChallengeMode): Question {
  const availableWords = words.filter((w) => !usedWordIds.has(w.id));
  // 全ての単語を使い切ったら、再度全体から選ぶ
  const wordsToChooseFrom = availableWords.length > 0 ? availableWords : words;
  const randomWord = wordsToChooseFrom[Math.floor(Math.random() * wordsToChooseFrom.length)];
  return generateQuestion(randomWord, words, mode);
}

// レーベンシュタイン距離（後方互換のため再エクスポート）
export { levenshteinDistance } from "@/lib/string-utils";
