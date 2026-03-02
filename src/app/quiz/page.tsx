"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { words, Word, Category, categoryLabels, getWordsByCourse } from "@/data/words/compat";
import type { Course, Stage } from "@/data/words/types";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { unifiedStorage } from "@/lib/unified-storage";
import { Card, Button, ProgressBar, SpeakButton } from "@/components/ui";
import { Question, QuestionType, Achievement } from "@/types";
import { getAchievementById } from "@/data/achievements";
import { AchievementUnlockPopup } from "@/components/features/achievements/AchievementUnlockPopup";
import { PerfectScorePopup } from "@/components/features/quiz";
import { speakWord, isSpeechSynthesisSupported } from "@/lib/audio";
import { CATEGORY_EMOJIS, getCategoryGradient } from "@/lib/image";
import { shuffleArray, pickRandom } from "@/lib/shuffle";
import {
  saveQuizResultState,
  getQuizResultState,
  clearQuizResultState,
  AnsweredWord,
  SessionResult,
} from "@/lib/quiz-session";
import { getInitialSrsProgress, calculateSm2, answerQualityFromResult } from "@/lib/srs";
import { saveWordNavState } from "@/lib/word-nav-state";

const QUESTIONS_PER_SESSION = 10;

// クイズフェーズの型
type QuizPhase = "setup" | "quiz" | "result";

// クイズ設定の型
type QuizSettings = {
  course: Course | null;   // null は「全コース」
  stage: Stage | null;     // null は「全ステージ」
  categories: Category[];  // 空配列は「全カテゴリ」
  difficulties: number[];  // 空配列は「全難易度」
  includeBookmarksOnly: boolean;
};

const defaultQuizSettings: QuizSettings = {
  course: null,
  stage: null,
  categories: [],
  difficulties: [],
  includeBookmarksOnly: false,
};

// カテゴリリスト
const ALL_CATEGORIES: Category[] = [
  "daily", "school", "family", "food", "hobby",
  "nature", "health", "sports", "culture",
  "business", "office", "travel", "shopping",
  "finance", "technology", "communication",
  "greeting", "emotion", "opinion", "request", "smalltalk",
];

// 問題タイプの出題比率
const QUESTION_TYPE_WEIGHTS: { type: QuestionType; weight: number }[] = [
  { type: "en-to-ja", weight: 50 },
  { type: "ja-to-en", weight: 30 },
  { type: "fill-blank", weight: 20 },
];

function selectQuestionType(): QuestionType {
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
 * 穴あき例文を生成
 */
function createFillBlankSentence(example: string, word: string): string {
  const regex = new RegExp(`\\b${escapeRegex(word)}\\b`, "gi");
  return example.replace(regex, "_____");
}

/**
 * fill-blank 用の例文を選択する。
 * word.examples[] があればその中から単語が含まれるものをランダムに選択する。
 * なければ従来の word.example にフォールバック。
 */
function selectFillBlankExample(word: Word): { example: string; exampleJa: string | undefined } | null {
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

function generateQuestion(word: Word, allWords: Word[]): Question {
  let type = selectQuestionType();

  // 穴あき問題の検証（examples[] を考慮）
  let selectedExample: { example: string; exampleJa: string | undefined } | null = null;
  if (type === "fill-blank") {
    selectedExample = selectFillBlankExample(word);
    if (!selectedExample) {
      // 有効な例文がなければ別の問題タイプへ
      type = Math.random() > 0.5 ? "en-to-ja" : "ja-to-en";
    }
  }

  const wordData = {
    id: word.id,
    word: word.word,
    meaning: word.meaning,
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

    case "fill-blank":
      return {
        word: wordData,
        type: "fill-blank",
        choices: generateChoicesForJaToEn(word, allWords),
        correctAnswer: word.word,
      };
  }
}

// 設定に基づいて単語をフィルタリング
function filterWordsBySettings(
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
    filtered = filtered.filter((w) => settings.categories.includes(w.category));
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

function generateSessionQuestions(
  targetWords: Word[],
  allWords: Word[],
  count: number,
  weakWordIds: number[],
  studiedWordIds: number[]
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
  return shuffledSelected.map((word) => generateQuestion(word, allWords));
}

function getQuestionPrompt(type: QuestionType): string {
  switch (type) {
    case "en-to-ja":
      return "この単語の意味は?";
    case "ja-to-en":
      return "この意味の英単語は?";
    case "fill-blank":
      return "空欄に入る単語は?";
  }
}

function getQuestionDisplay(question: Question): string {
  switch (question.type) {
    case "en-to-ja":
      return question.word.word;
    case "ja-to-en":
      return question.word.meaning;
    case "fill-blank":
      // 穴あき例文を生成
      return question.word.example
        ? createFillBlankSentence(question.word.example, question.word.word)
        : "";
  }
}

// 例文の日本語訳と単語の意味を取得
type TranslationInfo = {
  sentenceJa: string | null; // 例文の日本語訳
  wordMeaning: string;       // 単語の意味
};

const SUBJECT_JA_MAP: Record<string, string> = {
  i: "私は",
  you: "あなたは",
  he: "彼は",
  she: "彼女は",
  we: "私たちは",
  they: "彼らは",
};

const VERB_FORMS_JA_MAP: Record<string, { masu: string; te: string }> = {
  eat: { masu: "食べます", te: "食べて" },
  drink: { masu: "飲みます", te: "飲んで" },
  read: { masu: "読みます", te: "読んで" },
  write: { masu: "書きます", te: "書いて" },
  play: { masu: "します", te: "して" },
  study: { masu: "勉強します", te: "勉強して" },
  use: { masu: "使います", te: "使って" },
  make: { masu: "作ります", te: "作って" },
  go: { masu: "行きます", te: "行って" },
  come: { masu: "来ます", te: "来て" },
  have: { masu: "持っています", te: "持って" },
  know: { masu: "知っています", te: "知って" },
  see: { masu: "見ます", te: "見て" },
  watch: { masu: "見ます", te: "見て" },
  buy: { masu: "買います", te: "買って" },
  carry: { masu: "運びます", te: "運んで" },
  open: { masu: "開けます", te: "開けて" },
  close: { masu: "閉めます", te: "閉めて" },
  help: { masu: "手伝います", te: "手伝って" },
  give: { masu: "くれます", te: "くれて" },
  take: { masu: "取ります", te: "取って" },
  put: { masu: "置きます", te: "置いて" },
  call: { masu: "電話します", te: "電話して" },
  like: { masu: "好きです", te: "好きで" },
};

const FUNCTION_WORD_JA_MAP: Record<string, string> = {
  this: "この",
  that: "その",
  these: "これらの",
  those: "それらの",
  my: "私の",
  your: "あなたの",
  his: "彼の",
  her: "彼女の",
  our: "私たちの",
  their: "彼らの",
  box: "箱",
  book: "本",
  pen: "ペン",
  bag: "かばん",
  room: "部屋",
  door: "ドア",
  window: "窓",
};

function pickPrimaryMeaning(meaning: string): string {
  const primary = meaning
    .split(/[;；、,\/]/)
    .map((s) => s.trim())
    .find(Boolean);
  return primary || meaning.trim();
}

const WORD_MEANING_INDEX: Record<string, string> = {};
for (const w of words) {
  const key = w.word.toLowerCase();
  if (!WORD_MEANING_INDEX[key]) {
    WORD_MEANING_INDEX[key] = pickPrimaryMeaning(w.meaning);
  }
}

const TIME_PHRASE_MAP: Record<string, string> = {
  "every day": "毎日",
  "every morning": "毎朝",
  "every night": "毎晩",
  "every week": "毎週",
  "every sunday": "毎週日曜日",
  "today": "今日",
  "tomorrow": "明日",
  "yesterday": "昨日",
};

function phraseToJapanese(phrase: string, targetWord: string, targetMeaning: string): string {
  const clean = phrase.replace(/[.?!]/g, "").trim();
  if (!clean) return "";
  let normalized = ` ${clean.toLowerCase()} `;
  let timePrefix = "";
  for (const [en, ja] of Object.entries(TIME_PHRASE_MAP)) {
    const needle = ` ${en} `;
    if (normalized.includes(needle)) {
      timePrefix = ja;
      normalized = normalized.replace(needle, " ");
    }
  }
  const compact = normalized.trim();
  if (!compact) return timePrefix;
  return compact
    .split(/\s+/)
    .map((token) => {
      const lower = token.toLowerCase();
      if (lower === "a" || lower === "an" || lower === "the" || lower === "to") return "";
      if (new RegExp(`^${targetWord}$`, "i").test(token)) return pickPrimaryMeaning(targetMeaning);
      const fromFunc = FUNCTION_WORD_JA_MAP[lower];
      if (fromFunc) return fromFunc;
      const fromWord = WORD_MEANING_INDEX[lower];
      return fromWord || "";
    })
    .filter(Boolean)
    .join("")
    .replace(/^を/, "")
    .replace(/^が/, "")
    .replace(/^は/, "")
    .replace(/。。+/g, "。")
    .replace(/\s+/g, "")
    .replace(/^/, timePrefix);
}

function toJapaneseHint(exampleSentence: string, word: string, meaning: string): string | null {
  const src = exampleSentence.trim().replace(/\s+/g, " ");
  const wordJa = pickPrimaryMeaning(meaning);

  // Can you + verb + object ?
  const m0 = src.match(/^Can\s+you\s+([A-Za-z]+)\s+(.+)\?$/i);
  if (m0) {
    const verb = m0[1].toLowerCase();
    const objectEn = m0[2];
    const objectJa = phraseToJapanese(objectEn, word, meaning);
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    if (objectJa) return `${objectJa}を${form.te}もらえますか？`;
    return `${wordJa}を${form.te}もらえますか？`;
  }

  // Could you + verb + object ?
  const m0b = src.match(/^Could\s+you\s+([A-Za-z]+)\s+(.+)\?$/i);
  if (m0b) {
    const verb = m0b[1].toLowerCase();
    const objectEn = m0b[2];
    const objectJa = phraseToJapanese(objectEn, word, meaning);
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    if (objectJa) return `${objectJa}を${form.te}いただけますか？`;
    return `${wordJa}を${form.te}いただけますか？`;
  }

  // Can I + verb + object ?
  const m0c = src.match(/^Can\s+I\s+([A-Za-z]+)\s+(.+)\?$/i);
  if (m0c) {
    const verb = m0c[1].toLowerCase();
    const objectEn = m0c[2];
    const objectJa = phraseToJapanese(objectEn, word, meaning);
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    if (objectJa) return `${objectJa}を${form.te}もいいですか？`;
    return `${wordJa}を${form.te}もいいですか？`;
  }

  // Subject + verb + object .
  const m1 = src.match(/^(I|You|He|She|We|They)\s+([A-Za-z]+)\s+(.+)\.$/i);
  if (m1) {
    const subject = m1[1].toLowerCase();
    const verb = m1[2].toLowerCase();
    const objectEn = m1[3];
    const subjectJa = SUBJECT_JA_MAP[subject] ?? "私は";
    const objectJa = phraseToJapanese(objectEn, word, meaning);
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    if (verb === "like") {
      return `${subjectJa}${objectJa || wordJa}が${form.masu}。`;
    }
    return `${subjectJa}${objectJa || wordJa}を${form.masu}。`;
  }

  // This/That/It is ...
  const m2 = src.match(/^(This|That|It)\s+is\s+(.+)\.$/i);
  if (m2) {
    const objJa = phraseToJapanese(m2[2], word, meaning);
    return `これは${objJa || wordJa}です。`;
  }

  // There is/are ...
  const m3 = src.match(/^There\s+(is|are)\s+(.+)\.$/i);
  if (m3) {
    const objJa = phraseToJapanese(m3[2], word, meaning);
    return `${objJa || wordJa}があります。`;
  }

  // Please <verb> ...
  const m4 = src.match(/^Please\s+([A-Za-z]+)(?:\s+(.+))?\.$/i);
  if (m4) {
    const verb = m4[1].toLowerCase();
    const objectJa = m4[2] ? phraseToJapanese(m4[2], word, meaning) : wordJa;
    const form = VERB_FORMS_JA_MAP[verb] ?? { masu: "します", te: "して" };
    return `${objectJa}を${form.te}ください。`;
  }

  // fallback: 文全体から語を拾って和訳文を生成
  const allJa = phraseToJapanese(src, word, meaning);
  return `「${allJa || wordJa}」という意味です。`;
}

function getTranslationInfo(wordId: number, exampleSentence?: string): TranslationInfo {
  const fullWordData = words.find((w) => w.id === wordId);
  if (!fullWordData) return { sentenceJa: null, wordMeaning: "" };

  let sentenceJa: string | null = null;

  // 1. examples[]から出題例文に対応する日本語訳を優先（ランダム選択された例文と訳を一致させる）
  if (fullWordData.examples && fullWordData.examples.length > 0 && exampleSentence) {
    const matchingExample = fullWordData.examples.find(
      (ex) => ex.en.toLowerCase() === exampleSentence.toLowerCase()
    );
    if (matchingExample) {
      sentenceJa = matchingExample.ja;
    }
  }
  // 2. examples[]にマッチなし → exampleJa（word.example の訳）にフォールバック
  if (!sentenceJa && fullWordData.exampleJa) {
    sentenceJa = fullWordData.exampleJa;
  }
  // 3. 未登録時は日本語のみの簡易ヒントを生成
  if (!sentenceJa && exampleSentence) {
    sentenceJa = toJapaneseHint(
      exampleSentence,
      fullWordData.word,
      fullWordData.meaning
    );
  }

  return {
    sentenceJa,
    wordMeaning: fullWordData.meaning,
  };
}

const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100];

function getStreakMilestone(streak: number, previousStreak: number): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (streak >= milestone && previousStreak < milestone) {
      return milestone;
    }
  }
  return null;
}

function getStreakMilestoneMessage(milestone: number): { emoji: string; title: string; description: string } {
  switch (milestone) {
    case 3:
      return { emoji: "🌱", title: "3日連続達成!", description: "良いスタートです！この調子で続けましょう" };
    case 7:
      return { emoji: "🔥", title: "1週間連続!", description: "素晴らしい継続力！習慣化の第一歩です" };
    case 14:
      return { emoji: "⭐", title: "2週間連続!", description: "すごい！もう学習が習慣になっていますね" };
    case 30:
      return { emoji: "🏆", title: "1ヶ月連続!", description: "驚異的な継続力！あなたは本物の学習者です" };
    case 50:
      return { emoji: "💎", title: "50日連続!", description: "圧倒的な努力！尊敬に値します" };
    case 100:
      return { emoji: "👑", title: "100日連続!", description: "伝説の学習者！この領域に達する人はほとんどいません" };
    default:
      return { emoji: "🎉", title: `${milestone}日連続!`, description: "素晴らしい継続です！" };
  }
}

export default function QuizPage() {
  // URLパラメータを取得
  const searchParams = useSearchParams();
  const reviewWordId = searchParams.get("wordId");      // 特定の単語を復習
  const weakOnly = searchParams.get("weakOnly");        // 苦手単語のみ
  const srsReview = searchParams.get("srsReview");      // SRS復習モード
  const bookmarksOnly = searchParams.get("bookmarksOnly"); // ブックマーク単語のみ

  // クイズフェーズ管理
  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [quizSettings, setQuizSettings] = useState<QuizSettings>(defaultQuizSettings);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [answeredWords, setAnsweredWords] = useState<AnsweredWord[]>([]);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  const [showingAchievement, setShowingAchievement] = useState<Achievement | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [showPerfectScore, setShowPerfectScore] = useState(false);
  const [isRestoredFromSession, setIsRestoredFromSession] = useState(false);

  // ストレージから取得するデータの状態
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [weakWordIds, setWeakWordIds] = useState<number[]>([]);
  const [studiedWordIds, setStudiedWordIds] = useState<number[]>([]);
  const [srsWordIds, setSrsWordIds] = useState<number[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 回答開始時刻を記録（SRS quality計算用）
  const questionStartTimeRef = useRef<number>(Date.now());

  // 初期データをロード
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookmarks, weaks, studied, dueWords] = await Promise.all([
          unifiedStorage.getBookmarkedWordIds(),
          unifiedStorage.getWeakWords(70),
          unifiedStorage.getStudiedWordIds(),
          unifiedStorage.getDueWords(),
        ]);
        setBookmarkedIds(bookmarks);
        setWeakWordIds(weaks);
        setStudiedWordIds(studied);
        setSrsWordIds(dueWords.map((p) => p.wordId));
      } catch (error) {
        console.error("[Quiz] Failed to load initial data:", error);
        // エラー時は空の配列のままにする（クイズは動作する）
      }
      setDataLoaded(true);
    };
    loadData();
  }, []);

  // 次の問題へ進む / クイズ終了処理
  const handleNext = useCallback(async () => {
    if (currentIndex + 1 >= questions.length) {
      // セッション完了時の処理（エラーが発生してもリザルト画面は表示する）
      let sessionResult: SessionResult | null = null;
      let newAchievements: Achievement[] = [];

      try {
        // セッション完了時にXP・レベル・ストリークを記録
        const previousUserData = await unifiedStorage.getUserData();
        const previousLevel = previousUserData.level;
        const previousStreak = previousUserData.streak;
        const updatedUserData = await unifiedStorage.recordStudySession(score, maxCombo);
        const dailyProgress = unifiedStorage.getDailyProgress(updatedUserData);

        const earnedXp = (score * 10) + (maxCombo * 5); // XP_PER_CORRECT + combo bonus

        // 実績チェック
        const records = await unifiedStorage.getRecords();
        const totalQuestions = records.length;
        const masteredWords = await unifiedStorage.getMasteredWordCount();
        const newAchievementIds = await unifiedStorage.checkAndUnlockAchievements({
          totalQuestions,
          maxCombo,
          streak: updatedUserData.streak,
          masteredWords,
          level: updatedUserData.level,
        });

        newAchievements = newAchievementIds
          .map((id) => getAchievementById(id))
          .filter((a): a is Achievement => a !== undefined);

        sessionResult = {
          earnedXp,
          newLevel: updatedUserData.level,
          previousLevel,
          streak: updatedUserData.streak,
          previousStreak,
          dailyProgress: {
            current: dailyProgress.current,
            goal: dailyProgress.goal,
            completed: dailyProgress.completed,
          },
          newAchievementIds,
        };
      } catch (error) {
        console.error("[Quiz] Error during session completion:", error);
        // エラー時もデフォルト値でリザルト画面を表示
        sessionResult = {
          earnedXp: score * 10 + maxCombo * 5,
          newLevel: 1,
          previousLevel: 1,
          streak: 1,
          previousStreak: 0,
          dailyProgress: {
            current: score,
            goal: 10,
            completed: score >= 10,
          },
          newAchievementIds: [],
        };
      }

      // 実績ポップアップ表示用にキュー
      if (newAchievements.length > 0) {
        setPendingAchievements(newAchievements);
        setShowingAchievement(newAchievements[0]);
      }

      setSessionResult(sessionResult);
      setIsFinished(true);
      setPhase("result");

      // 全問正解の場合はパーフェクトスコアポップアップを表示
      if (score === questions.length) {
        setShowPerfectScore(true);
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelected(null);
      setIsCorrect(null);
      setShowTranslation(false);
    }
  }, [currentIndex, questions.length, score, maxCombo]);

  // Enterキーで「次の問題へ」進む
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (selected === null) return;
      if (isFinished) return;

      e.preventDefault();
      handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected, isFinished, handleNext]);



  const currentQuestion = questions[currentIndex];
  const hasAutoPlayedRef = useRef<Set<number>>(new Set());

  // 保存されたリザルト状態を復元
  useEffect(() => {
    const savedState = getQuizResultState();
    if (savedState) {
      setScore(savedState.score);
      setMaxCombo(savedState.maxCombo);
      setAnsweredWords(savedState.answeredWords);
      setSessionResult(savedState.sessionResult);
      setIsFinished(true);
      setIsRestoredFromSession(true);
      setPhase("result");
      // 復元後、状態をクリア（ページリロード時は新しいセッションになるように）
      // 注: 詳細画面から戻ってきた時のために、状態はクリアしない
    }
  }, []);

  // リザルト画面表示時に状態を保存
  useEffect(() => {
    if (isFinished && !isRestoredFromSession && answeredWords.length > 0) {
      saveQuizResultState({
        score,
        totalQuestions: answeredWords.length,
        maxCombo,
        answeredWords,
        sessionResult,
      });
    }
  }, [isFinished, isRestoredFromSession, score, maxCombo, answeredWords, sessionResult]);

  // 問題出題時の自動読み上げ
  // 問題切り替え時に回答開始時刻をリセット（SRS quality計算用）
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, [currentIndex]);

  useEffect(() => {
    if (!currentQuestion || !isSpeechSynthesisSupported()) return;

    // 既に回答済み（フィードバック表示中）の場合は再生しない
    if (selected !== null) return;

    // 同じ問題で既に自動再生済みの場合はスキップ
    if (hasAutoPlayedRef.current.has(currentIndex)) return;

    // 自動再生済みとしてマーク
    hasAutoPlayedRef.current.add(currentIndex);

    // 問題タイプに応じて読み上げ
    // 少し遅延を入れて画面表示後に再生（ユーザー体験向上）
    const timeoutId = setTimeout(() => {
      switch (currentQuestion.type) {
        case "en-to-ja":
          // 英単語を読み上げ
          speakWord(currentQuestion.word.word);
          break;
        // fill-blank: 自動再生なし（手動の音声ボタンで再生可能）
        // ja-to-en: 日本語なので読み上げなし
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentQuestion, currentIndex, selected]);

  /**
   * 新しいクイズセッションを開始
   * @param settings クイズ設定
   * @param options.priorityWordId この単語を必ず含める（単語詳細からの復習用）
   * @param options.weakOnlyMode 苦手単語のみで構成（苦手単語一覧からの復習用）
   * @param options.srsReviewMode SRS復習対象単語のみで構成
   */
  const startNewSession = useCallback((
    settings: QuizSettings = defaultQuizSettings,
    options?: { priorityWordId?: number; weakOnlyMode?: boolean; srsReviewMode?: boolean }
  ) => {
    // 新しいセッション開始時は保存された状態をクリア
    clearQuizResultState();

    let targetWords: Word[];

    // SRS復習モード
    if (options?.srsReviewMode && srsWordIds.length > 0) {
      targetWords = words.filter((w) => srsWordIds.includes(w.id));
    // 苦手単語のみモード
    } else if (options?.weakOnlyMode && weakWordIds.length > 0) {
      targetWords = words.filter((w) => weakWordIds.includes(w.id));
    } else {
      // 設定に基づいて単語をフィルタリング
      targetWords = filterWordsBySettings(words, settings, bookmarkedIds);
    }

    // フィルター後の単語数が少なすぎる場合の対応
    const questionCount = Math.min(QUESTIONS_PER_SESSION, targetWords.length);

    if (questionCount === 0) {
      // 該当する単語がない場合は設定画面に戻す
      setPhase("setup");
      return;
    }

    let newQuestions: Question[];

    // 優先単語が指定されている場合、その単語を必ず含める
    if (options?.priorityWordId) {
      const priorityWord = words.find((w) => w.id === options.priorityWordId);
      if (priorityWord) {
        // 優先単語の問題を生成
        const priorityQuestion = generateQuestion(priorityWord, words);
        // 残りの問題を生成（優先単語を除外）
        const remainingTargetWords = targetWords.filter((w) => w.id !== options.priorityWordId);
        const remainingQuestions = generateSessionQuestions(
          remainingTargetWords,
          words,
          questionCount - 1,
          weakWordIds,
          studiedWordIds
        );
        // 優先単語を最初に配置
        newQuestions = [priorityQuestion, ...remainingQuestions];
      } else {
        newQuestions = generateSessionQuestions(targetWords, words, questionCount, weakWordIds, studiedWordIds);
      }
    } else {
      newQuestions = generateSessionQuestions(targetWords, words, questionCount, weakWordIds, studiedWordIds);
    }

    setQuestions(newQuestions);
    setQuizSettings(settings);
    setPhase("quiz");
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsFinished(false);
    setSelected(null);
    setIsCorrect(null);
    setSessionResult(null);
    setAnsweredWords([]);
    setIsRestoredFromSession(false);
    setShowTranslation(false);
    setShowPerfectScore(false);
    // 自動再生済みの記録をリセット
    hasAutoPlayedRef.current = new Set();
  }, [bookmarkedIds, weakWordIds, studiedWordIds, srsWordIds]);

  // 初回ロード時：URLパラメータまたは保存状態に基づいて処理
  useEffect(() => {
    // データロードが完了するまで待機
    if (!dataLoaded) return;

    const savedState = getQuizResultState();
    if (savedState) {
      // 保存された状態がある場合はそれを復元（既存の動作）
      return;
    }

    // URLパラメータによる自動開始
    if (reviewWordId) {
      // 特定の単語を復習（単語詳細画面からの遷移）
      const wordIdNum = parseInt(reviewWordId, 10);
      if (!isNaN(wordIdNum) && words.some((w) => w.id === wordIdNum)) {
        startNewSession(defaultQuizSettings, { priorityWordId: wordIdNum });
        return;
      }
    }

    if (srsReview === "true" && srsWordIds.length > 0) {
      // SRS復習モード（ホーム画面からの遷移）
      startNewSession(defaultQuizSettings, { srsReviewMode: true });
      return;
    }

    if (weakOnly === "true" && weakWordIds.length > 0) {
      // 苦手単語のみモード（苦手単語一覧からの遷移）
      startNewSession(defaultQuizSettings, { weakOnlyMode: true });
      return;
    }

    if (bookmarksOnly === "true") {
      // ブックマーク単語のみモード（ブックマーク一覧からの遷移）
      const validBookmarked = bookmarkedIds.filter((id) => words.some((w) => w.id === id));
      if (validBookmarked.length > 0) {
        startNewSession({ ...defaultQuizSettings, includeBookmarksOnly: true });
        return;
      }
    }

    // パラメータがない場合は設定画面から開始
    setPhase("setup");
  }, [dataLoaded, reviewWordId, weakOnly, srsReview, bookmarksOnly, weakWordIds, srsWordIds, bookmarkedIds, startNewSession]);

  const handleSelect = (choice: string) => {
    if (selected !== null || !currentQuestion) return;

    setSelected(choice);
    const correct = choice === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    // ja-to-en問題で選択した英単語を読み上げ（正誤に関わらず、音と文字の結びつけ）
    if (currentQuestion.type === "ja-to-en" && isSpeechSynthesisSupported()) {
      speakWord(choice);
    }
    // 全単語の結果を記録
    setAnsweredWords((prev) => [
      ...prev,
      {
        id: currentQuestion.word.id,
        word: currentQuestion.word.word,
        meaning: currentQuestion.word.meaning,
        correct,
      },
    ]);

    if (correct) {
      setScore((prev) => prev + 1);
      setCombo((prev) => {
        const newCombo = prev + 1;
        setMaxCombo((max) => Math.max(max, newCombo));
        return newCombo;
      });
    } else {
      setCombo(0);
    }

    // 学習記録を保存（エラーは無視 - UIの動作に影響させない）
    unifiedStorage.addRecord({
      wordId: currentQuestion.word.id,
      word: currentQuestion.word.word,
      meaning: currentQuestion.word.meaning,
      questionType: currentQuestion.type,
      correct,
    }).catch((error) => {
      console.error("[Quiz] Failed to add record:", error);
    });

    // SRS進捗を更新（エラーは無視 - UIの動作に影響させない）
    const responseTimeMs = Date.now() - questionStartTimeRef.current;
    const quality = answerQualityFromResult(correct, responseTimeMs);
    (async () => {
      try {
        const existing = await unifiedStorage.getSrsProgress(currentQuestion.word.id);
        const current = existing ?? getInitialSrsProgress(currentQuestion.word.id);
        const updated = calculateSm2(current, quality);
        await unifiedStorage.saveSrsProgress(updated);
      } catch (error) {
        console.error("[Quiz] Failed to update SRS progress:", error);
      }
    })();
  };

  const handleAchievementClose = () => {
    const remaining = pendingAchievements.slice(1);
    setPendingAchievements(remaining);
    if (remaining.length > 0) {
      setTimeout(() => setShowingAchievement(remaining[0]), 300);
    } else {
      setShowingAchievement(null);
    }
  };

  // 設定画面
  if (phase === "setup") {
    const bookmarkedCount = bookmarkedIds.filter((id) => words.some((w) => w.id === id)).length;
    const filteredPreview = filterWordsBySettings(words, quizSettings, bookmarkedIds);

    return (
      <div className="main-content px-3 py-2 flex flex-col">
        <div className="max-w-md w-full mx-auto flex flex-col h-full">
          {/* 上部固定: ヘッダー */}
          <div className="flex-shrink-0 flex items-center gap-2 mb-2">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">クイズ設定</h1>
          </div>

          {/* 中央スクロール可能エリア */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
            <Card className="!p-3">
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">コースを選択</h2>
              <div className="flex flex-wrap gap-1 mb-1.5">
                <button
                  onClick={() => setQuizSettings((prev) => ({ ...prev, course: null, stage: null }))}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                    quizSettings.course === null
                      ? "bg-primary-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  全コース
                </button>
                {(Object.keys(COURSE_DEFINITIONS) as Course[]).filter((ct) => COURSE_DEFINITIONS[ct].stages.length > 0).map((ct) => (
                  <button
                    key={ct}
                    onClick={() => setQuizSettings((prev) => ({
                      ...prev,
                      course: prev.course === ct ? null : ct,
                      stage: null,
                    }))}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                      quizSettings.course === ct
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {COURSE_DEFINITIONS[ct].name}
                  </button>
                ))}
              </div>
              {quizSettings.course && (
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setQuizSettings((prev) => ({ ...prev, stage: null }))}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                      quizSettings.stage === null
                        ? "bg-accent-500 text-white"
                        : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    全レベル
                  </button>
                  {COURSE_DEFINITIONS[quizSettings.course].stages.map((stg) => (
                    <button
                      key={stg.stage}
                      onClick={() => setQuizSettings((prev) => ({
                        ...prev,
                        stage: prev.stage === stg.stage ? null : stg.stage,
                      }))}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        quizSettings.stage === stg.stage
                          ? "bg-accent-500 text-white"
                          : "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {stg.displayName}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {quizSettings.course === null
                  ? "全コースから出題"
                  : `${COURSE_DEFINITIONS[quizSettings.course].name}${quizSettings.stage ? ` - ${COURSE_DEFINITIONS[quizSettings.course].stages.find((s) => s.stage === quizSettings.stage)?.displayName}` : ""}`}
              </p>
            </Card>

            <Card className="!p-3">
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">カテゴリを選択</h2>
              <div className="flex flex-wrap gap-1">
                {ALL_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setQuizSettings((prev) => ({
                        ...prev,
                        categories: prev.categories.includes(category)
                          ? prev.categories.filter((c) => c !== category)
                          : [...prev.categories, category],
                      }));
                    }}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                      quizSettings.categories.includes(category)
                        ? "bg-primary-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {categoryLabels[category]}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {quizSettings.categories.length === 0
                  ? "全カテゴリから出題"
                  : `${quizSettings.categories.length}カテゴリ選択中`}
              </p>
            </Card>

            <Card className="!p-3">
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">難易度を選択</h2>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setQuizSettings((prev) => ({
                        ...prev,
                        difficulties: prev.difficulties.includes(level)
                          ? prev.difficulties.filter((d) => d !== level)
                          : [...prev.difficulties, level],
                      }));
                    }}
                    className={`w-9 h-9 rounded-md text-sm font-bold transition-all ${
                      quizSettings.difficulties.includes(level)
                        ? "bg-amber-500 text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {quizSettings.difficulties.length === 0
                  ? "全難易度から出題"
                  : `難易度${quizSettings.difficulties.sort().join(", ")}を選択中`}
              </p>
            </Card>

            <Card className="!p-3">
              <button
                onClick={() => {
                  setQuizSettings((prev) => ({
                    ...prev,
                    includeBookmarksOnly: !prev.includeBookmarksOnly,
                  }));
                }}
                className={`w-full flex items-center justify-between p-2 rounded-md transition-all ${
                  quizSettings.includeBookmarksOnly
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill={quizSettings.includeBookmarksOnly ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                  <span className="text-xs font-medium">ブックマークのみ</span>
                </div>
                <span className="text-xs">({bookmarkedCount}語)</span>
              </button>
            </Card>
          </div>

          {/* 下部固定: プレビュー＋ボタン */}
          <div className="flex-shrink-0 pt-2 space-y-1.5">
            {/* プレビュー */}
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                対象: <span className="text-primary-600 dark:text-primary-400">{filteredPreview.length}語</span>
              </p>
              {filteredPreview.length < QUESTIONS_PER_SESSION && filteredPreview.length > 0 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400">
                  ※ {filteredPreview.length}問のみ出題されます
                </p>
              )}
              {filteredPreview.length === 0 && (
                <p className="text-[10px] text-red-500 dark:text-red-400">
                  条件に合う単語がありません
                </p>
              )}
            </div>

            {/* 開始ボタン */}
            <Button
              fullWidth
              onClick={() => startNewSession(quizSettings)}
              disabled={filteredPreview.length === 0}
            >
              {filteredPreview.length === 0 ? "単語がありません" : `${Math.min(filteredPreview.length, QUESTIONS_PER_SESSION)}問で開始`}
            </Button>

            {/* 設定リセット */}
            {(quizSettings.categories.length > 0 ||
              quizSettings.difficulties.length > 0 ||
              quizSettings.includeBookmarksOnly) && (
              <button
                onClick={() => setQuizSettings(defaultQuizSettings)}
                className="w-full text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 dark:text-slate-200"
              >
                設定をリセット
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase !== "result" && questions.length === 0) {
    return (
      <div className="main-content flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">読み込み中...</p>
      </div>
    );
  }

  if (phase === "result" || isFinished) {
    const totalQuestions = answeredWords.length || questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const getMessage = () => {
      if (percentage === 100) return { emoji: "🎉", text: "パーフェクト!" };
      if (percentage >= 80) return { emoji: "🌟", text: "素晴らしい!" };
      if (percentage >= 60) return { emoji: "👍", text: "いい調子!" };
      return { emoji: "💪", text: "次は頑張ろう!" };
    };
    const message = getMessage();
    const leveledUp = sessionResult && sessionResult.newLevel > sessionResult.previousLevel;
    const streakMilestone = sessionResult
      ? getStreakMilestone(sessionResult.streak, sessionResult.previousStreak)
      : null;
    const streakMilestoneMessage = streakMilestone ? getStreakMilestoneMessage(streakMilestone) : null;

    // 解除された実績を取得
    const newAchievements = sessionResult
      ? sessionResult.newAchievementIds
          .map((id) => getAchievementById(id))
          .filter((a): a is Achievement => a !== undefined)
      : [];

    return (
      <div className="main-content px-3 py-2 flex flex-col">
        <div className="max-w-md w-full mx-auto flex flex-col h-full">
          {/* 上部固定: スコアサマリー */}
          <div className="flex-shrink-0 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-card p-3 mb-2">
            {/* ストリークマイルストーン達成（コンパクト表示） */}
            {streakMilestoneMessage && (
              <div className="mb-2 p-1.5 bg-gradient-to-r from-orange-100 via-red-100 to-pink-100 dark:from-orange-900/30 dark:via-red-900/30 dark:to-pink-900/30 rounded-lg border border-orange-300 dark:border-orange-800/40">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xl emoji-icon">{streakMilestoneMessage.emoji}</span>
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-300">{streakMilestoneMessage.title}</p>
                </div>
              </div>
            )}

            {/* レベルアップ表示（コンパクト表示） */}
            {leveledUp && (
              <div className="mb-2 p-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-300 dark:border-yellow-800/40">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-xl emoji-icon">🎊</span>
                  <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300">
                    レベルアップ! Lv.{sessionResult?.previousLevel} → Lv.{sessionResult?.newLevel}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="text-3xl emoji-icon">{message.emoji}</span>
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{message.text}</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs">セッション完了!</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-2">
              <div className="flex items-center justify-center gap-3">
                <div>
                  <div className="text-2xl font-bold text-gradient">
                    {score} / {totalQuestions}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-xs">正答率 {percentage}%</p>
                </div>
                {maxCombo >= 3 && (
                  <div className="text-center border-l border-slate-200 dark:border-slate-700 pl-3">
                    <div className="text-xl font-bold text-accent-500">{maxCombo}</div>
                    <p className="text-[10px] text-accent-400">最大コンボ</p>
                  </div>
                )}
              </div>
            </div>

            {/* XP・ストリーク・デイリー目標（コンパクト） */}
            {sessionResult && (
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-900/20 rounded-md p-1.5">
                  <span className="text-base emoji-icon">✨</span>
                  <p className="text-xs font-bold text-purple-600 dark:text-purple-300">+{sessionResult.earnedXp}</p>
                  <p className="text-[9px] text-purple-400 dark:text-purple-400">XP</p>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-900/20 rounded-md p-1.5">
                  <span className="text-base emoji-icon">🔥</span>
                  <p className="text-xs font-bold text-orange-600 dark:text-orange-300">{sessionResult.streak}</p>
                  <p className="text-[9px] text-orange-400 dark:text-orange-400">日連続</p>
                </div>
                <div className={`rounded-md p-1.5 ${
                  sessionResult.dailyProgress.completed
                    ? "bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/30 dark:to-green-900/20"
                    : "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-900/20"
                }`}>
                  <span className="text-base emoji-icon">{sessionResult.dailyProgress.completed ? "🏆" : "🎯"}</span>
                  <p className={`text-xs font-bold ${
                    sessionResult.dailyProgress.completed ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                  }`}>
                    {sessionResult.dailyProgress.current}/{sessionResult.dailyProgress.goal}
                  </p>
                  <p className={`text-[9px] ${
                    sessionResult.dailyProgress.completed ? "text-green-400 dark:text-green-500" : "text-blue-400 dark:text-blue-500"
                  }`}>
                    {sessionResult.dailyProgress.completed ? "達成!" : "目標"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 中央スクロール可能エリア */}
          <div className="flex-1 overflow-y-auto min-h-0 mb-2">
            {/* 新しく獲得した実績 */}
            {newAchievements.length > 0 && (
              <div className="mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-card p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">新しい実績を獲得!</p>
                <div className="space-y-1.5">
                  {newAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-2 p-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800/40"
                    >
                      <span className="text-xl emoji-icon">{achievement.icon}</span>
                      <div className="text-left">
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{achievement.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 出題された全単語一覧 */}
            {answeredWords.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-card p-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  出題単語一覧（タップで詳細）
                </p>
                <div className="space-y-1.5">
                  {answeredWords.map((word) => (
                    <Link
                      key={`${word.id}-${word.word}`}
                      href={`/word/${word.id}?from=quiz`}
                      onClick={() => saveWordNavState(answeredWords.map((w) => w.id), "quiz")}
                      className={`flex items-center justify-between p-1.5 rounded-lg border transition-all hover:scale-[1.02] group ${
                        word.correct
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/40"
                          : "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            word.correct
                              ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {word.correct ? "✓" : "✗"}
                        </div>
                        <SpeakButton text={word.word} size="sm" />
                        <div className="text-left">
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-xs group-hover:text-primary-600 transition-colors">
                            {word.word}
                          </p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400">{word.meaning}</p>
                        </div>
                      </div>
                      <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 下部固定: アクションボタン */}
          <div className="flex-shrink-0 space-y-1.5">
            <Button fullWidth onClick={() => startNewSession(quizSettings)}>
              同じ設定でもう1セット
            </Button>
            <Button variant="secondary" fullWidth onClick={() => {
              clearQuizResultState();
              setPhase("setup");
            }}>
              設定を変更して挑戦
            </Button>
            <Link href="/" className="block">
              <Button variant="ghost" fullWidth onClick={() => clearQuizResultState()}>
                ホームに戻る
              </Button>
            </Link>
          </div>
        </div>

        {/* 実績解除ポップアップ */}
        {showingAchievement && (
          <AchievementUnlockPopup
            achievement={showingAchievement}
            onClose={handleAchievementClose}
          />
        )}

        {/* 全問正解ポップアップ */}
        {showPerfectScore && (
          <PerfectScorePopup
            mode="quiz"
            onClose={() => setShowPerfectScore(false)}
          />
        )}
      </div>
    );
  }

  const questionDisplay = getQuestionDisplay(currentQuestion);
  const isFillBlank = currentQuestion.type === "fill-blank";

  return (
    <div className="main-content px-2 py-1.5 flex flex-col">
      <div className="max-w-md w-full mx-auto flex flex-col h-full">
        {/* 上部固定: Progress & Score */}
        <div className="flex-shrink-0 mb-1">
          <div className="mb-1">
            <ProgressBar current={currentIndex + 1} total={questions.length} />
          </div>

          <div className="flex justify-center gap-1.5">
            <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full px-2 py-0.5 shadow-card border border-primary-100">
              <span className="text-sm emoji-icon">✨</span>
              <span className="font-bold text-primary-500 text-xs">{score}</span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">正解</span>
            </div>
            {combo >= 2 && (
              <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 shadow-lg ${
                combo >= 5
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : combo >= 3
                    ? "bg-gradient-to-r from-accent-500 to-primary-500"
                    : "bg-gradient-to-r from-blue-400 to-primary-400"
              }`}>
                <span className="text-sm emoji-icon">{combo >= 5 ? "🔥" : "⚡"}</span>
                <span className="font-bold text-white text-xs">{combo}</span>
                <span className="text-white/90 text-[10px] font-medium">連続!</span>
              </div>
            )}
          </div>
        </div>

        {/* 中央: Question Card - flex-1でスペースを埋める */}
        <div className="flex-1 min-h-0 flex flex-col">
          <Card className="flex flex-col p-2 h-full">
            {/* カテゴリ表示（コンパクト） */}
            {currentQuestion.word.category && (
              <div className={`w-full h-7 mb-1 rounded-md bg-gradient-to-br ${getCategoryGradient(currentQuestion.word.category)} flex items-center justify-center border border-slate-100 dark:border-slate-700`}>
                <span className="text-lg emoji-icon">{CATEGORY_EMOJIS[currentQuestion.word.category] || "📝"}</span>
              </div>
            )}

            <div className="text-center mb-1">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">{getQuestionPrompt(currentQuestion.type)}</p>
              <h2 className={`font-bold text-gradient ${isFillBlank ? "text-xs leading-relaxed" : "text-lg"}`}>
                {questionDisplay}
              </h2>
              {currentQuestion.type === "en-to-ja" && (
                <div className="mt-1">
                  <SpeakButton text={currentQuestion.word.word} size="sm" />
                </div>
              )}
              {currentQuestion.type === "fill-blank" && currentQuestion.word.example && (
                <div className="mt-1">
                  <SpeakButton text={currentQuestion.word.example} type="sentence" size="sm" />
                </div>
              )}
              {/* 穴埋め問題の和訳表示トグル */}
              {currentQuestion.type === "fill-blank" && selected === null && (() => {
                const translationInfo = getTranslationInfo(currentQuestion.word.id, currentQuestion.word.example);
                return (
                  <div className="mt-1 text-center">
                    <button
                      onClick={() => setShowTranslation(!showTranslation)}
                      className="text-[10px] text-primary-500 hover:text-primary-600 underline transition-colors"
                    >
                      {showTranslation ? "和訳を隠す" : "和訳を表示"}
                    </button>
                    {showTranslation && translationInfo.sentenceJa && (
                      <p className="mt-0.5 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-md p-1.5">
                        {translationInfo.sentenceJa}
                      </p>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Choices - flex-1でスペースを均等に使う */}
            <div className="flex-1 flex flex-col justify-evenly gap-1">
              {currentQuestion.choices.map((choice, index) => {
                let buttonClass = "choice-btn";

                if (selected !== null) {
                  if (choice === currentQuestion.correctAnswer) {
                    buttonClass = "choice-btn choice-btn-correct";
                  } else if (choice === selected) {
                    buttonClass = "choice-btn choice-btn-wrong";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(choice)}
                    disabled={selected !== null}
                    className={`${buttonClass} py-1.5`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-xs">{choice}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* 下部固定: Result & Next */}
        <div className="flex-shrink-0 mt-1">
          {selected !== null ? (
            <div className={`${isCorrect ? "animate-pop-in" : "animate-shake"}`}>
              <Card className={`mb-1 p-1.5 ${
                isCorrect
                  ? "bg-gradient-to-r from-success-50 to-green-50 border-success-300"
                  : "bg-gradient-to-r from-error-50 to-red-50 border-error-300"
              } border-2`}>
                <div className="flex items-center gap-1.5">
                  <span className={`text-lg ${isCorrect ? "animate-bounce" : ""}`}>
                    {isCorrect ? (combo >= 3 ? "🔥" : "🎉") : "😢"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold ${isCorrect ? "text-success-600" : "text-error-600"}`}>
                      {isCorrect ? (
                        combo >= 5 ? `${combo}連続! すごい!` :
                        combo >= 3 ? `${combo}連続正解!` : "正解!"
                      ) : "不正解..."}
                    </p>
                    {isCorrect && combo >= 2 && (
                      <p className="text-[10px] text-accent-500 font-medium">+{10 + (combo > 2 ? 5 : 0)} XP</p>
                    )}
                    {!isCorrect && (
                      <div className="text-[10px] text-slate-600 dark:text-slate-300">
                        <p className="truncate">
                          正解: <span className="text-primary-600 dark:text-primary-400 font-bold">{currentQuestion.correctAnswer}</span>
                          {currentQuestion.type !== "en-to-ja" && (
                            <span className="text-slate-500 dark:text-slate-400 ml-1">({currentQuestion.word.meaning})</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  {!isCorrect && (
                    <SpeakButton
                      text={currentQuestion.word.example || currentQuestion.word.word}
                      type={currentQuestion.word.example ? "sentence" : "word"}
                      size="sm"
                    />
                  )}
                </div>
                {!isCorrect && currentQuestion.word.example && (() => {
                  const translationInfo = getTranslationInfo(currentQuestion.word.id, currentQuestion.word.example);
                  return (
                    <div className="mt-1 text-[10px] bg-white/70 dark:bg-slate-800/70 rounded p-1 border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-700 dark:text-slate-200 line-clamp-1">{currentQuestion.word.example}</p>
                      {translationInfo.sentenceJa && (
                        <p className="text-slate-500 dark:text-slate-400 line-clamp-1">→ {translationInfo.sentenceJa}</p>
                      )}
                    </div>
                  );
                })()}
              </Card>

              <Button onClick={handleNext} fullWidth size="sm">
                {currentIndex + 1 >= questions.length ? "結果を見る" : "次の問題へ"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
