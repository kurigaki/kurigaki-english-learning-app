"use client";

import { useState, useEffect, useCallback, useRef, useReducer, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { words, Word } from "@/data/words";
import Confetti from "react-confetti";
import { unifiedStorage } from "@/lib/unified-storage";
import { storage } from "@/lib/storage";
import { Card, Button, SpeakButton } from "@/components/ui";
import { Question, QuestionType, Achievement } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getAchievementById } from "@/data/achievements";
import { AchievementUnlockPopup } from "@/components/features/achievements/AchievementUnlockPopup";
import { PerfectScorePopup } from "@/components/features/quiz";
import { speakWord, isSpeechSynthesisSupported } from "@/lib/audio";
import { shuffleArray, pickRandom } from "@/lib/shuffle";
import {
  AnsweredWord,
  saveSpeedResultState,
  getSpeedResultState,
  clearSpeedResultState,
} from "@/lib/speed-session";
import { saveWordNavState } from "@/lib/word-nav-state";
import { getAndClearTimeAttackContext } from "@/lib/time-attack-best";

const TIME_LIMIT = 30;
const FEEDBACK_DURATION_MS = 300;

/**
 * コンボ数に応じた獲得ポイントを計算する。
 * combo 1: 10pt, 2: 20pt, 3: 40pt, 4: 80pt, 5以上: 160pt（上限）
 */
function calcPointsForCombo(combo: number): number {
  return 10 * Math.pow(2, Math.min(combo, 5) - 1);
}

type SpeedChallengeMode = 'mixed' | 'en-to-ja' | 'ja-to-en' | 'ja-to-en-speaking';

type Title = { emoji: string; text: string };

function getSpeedChallengeTitle(score: number, maxCombo: number, correctCount: number, totalQuestions: number): Title {
  const isPerfect = totalQuestions > 0 && correctCount === totalQuestions;

  if (isPerfect && score >= 300) {
    return { emoji: "👑", text: "単語マスター" };
  }
  if (score >= 600) {
    return { emoji: "🚀", text: "電光石火" };
  }
  if (score >= 300) {
    return { emoji: "🏆", text: "スピードスター" };
  }
  if (maxCombo >= 10 && score >= 200) {
    return { emoji: "🔥", text: "コンボマスター" };
  }
  if (score >= 100) {
    return { emoji: "⚡", text: "素晴らしい！" };
  }
  if (score >= 50) {
    return { emoji: "👍", text: "ナイスチャレンジ！" };
  }
  return { emoji: "💪", text: "もう一歩！" };
}

type QuestionTypeWeight = { type: QuestionType; weight: number };
const QUESTION_TYPE_WEIGHTS: QuestionTypeWeight[] = [
  { type: "en-to-ja", weight: 60 },
  { type: "ja-to-en", weight: 40 },
];

function selectQuestionType(mode: SpeedChallengeMode): QuestionType {
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

function generateQuestion(word: Word, allWords: Word[], mode: SpeedChallengeMode): Question {
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

function getNextQuestion(usedWordIds: Set<number>, mode: SpeedChallengeMode, wordPool?: Word[]): Question {
  const pool = wordPool && wordPool.length > 0 ? wordPool : words;
  const availableWords = pool.filter((w) => !usedWordIds.has(w.id));
  // 全ての単語を使い切ったら、再度全体から選ぶ
  const wordsToChooseFrom = availableWords.length > 0 ? availableWords : pool;
  const randomWord = wordsToChooseFrom[Math.floor(Math.random() * wordsToChooseFrom.length)];
  return generateQuestion(randomWord, words, mode);
}

// レーベンシュタイン距離（編集距離）を計算する関数
function levenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[len1][len2];
}

type GameState = "ready" | "playing" | "paused" | "finished";

interface SpeedChallengeState {
  gameState: GameState;
  timeLeft: number;
  timeLimit: number; // 0 = 無制限
  score: number;      // 獲得ポイント合計
  correctCount: number; // 正解数（正答率・全問正解判定に使用）
  combo: number;
  maxCombo: number;
  question: Question | null;
  usedWordIds: Set<number>;
  totalQuestions: number;
  highScore: number;
  isNewHighScore: boolean;
  showingAchievement: Achievement | null;
  pendingAchievements: Achievement[];
  showPerfectScore: boolean;
  feedback: { correct: boolean; show: boolean } | null;
  answeredWords: AnsweredWord[];
  recognizedText: { text: string; isCorrect: boolean } | null;
  earnedXp: number;
  levelUp: { from: number; to: number } | null;
  scoreDiff: number;
  ranking: { rank: number; total: number } | null;
  showComboLost: boolean;
  showComboMilestone: number | null;
  showComebackEffect: boolean;
}

const initialState: SpeedChallengeState = {
  gameState: "ready",
  timeLeft: TIME_LIMIT,
  timeLimit: 30,
  score: 0,
  correctCount: 0,
  combo: 0,
  maxCombo: 0,
  question: null,
  usedWordIds: new Set(),
  totalQuestions: 0,
  highScore: 0,
  isNewHighScore: false,
  showingAchievement: null,
  pendingAchievements: [],
  showPerfectScore: false,
  feedback: null,
  answeredWords: [],
  recognizedText: null,
  earnedXp: 0,
  levelUp: null,
  scoreDiff: 0,
  ranking: null,
  showComboLost: false,
  showComboMilestone: null,
  showComebackEffect: false,
};

type Action =
  | { type: "SET_HIGH_SCORE"; payload: number }
  | { type: "RESTORE_SESSION"; payload: NonNullable<ReturnType<typeof getSpeedResultState>> }
  | { type: "START_GAME"; payload: { question: Question; timeLimit: number } }
  | { type: "TICK" }
  | { type: "END_GAME"; payload: { isNewHighScore: boolean; newHighScore?: number; scoreDiff: number; newAchievements: Achievement[]; isPerfectScore: boolean; earnedXp: number; levelUp: { from: number; to: number } | null; ranking: { rank: number; total: number } | null } }
  | { type: "ANSWER"; payload: { correct: boolean; answeredWord: AnsweredWord; nextQuestion: Question } }
  | { type: "SET_FEEDBACK"; payload: { correct: boolean; show: boolean } | null }
  | { type: "SET_PENDING_ACHIEVEMENTS"; payload: Achievement[] }
  | { type: "SET_RECOGNIZED_TEXT"; payload: { text: string; isCorrect: boolean } | null }
  | { type: "HIDE_COMBO_MILESTONE" }
  | { type: "HIDE_COMEBACK_EFFECT" }
  | { type: "SET_SHOWING_ACHIEVEMENT"; payload: Achievement | null }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" }
  | { type: "HIDE_COMBO_LOST" }
  | { type: "CLOSE_PERFECT_SCORE" };

function speedChallengeReducer(state: SpeedChallengeState, action: Action): SpeedChallengeState {
  switch (action.type) {
    case "SET_HIGH_SCORE":
      return { ...state, highScore: action.payload };
    case "RESTORE_SESSION": {
      const { score, totalQuestions, maxCombo, isNewHighScore, answeredWords } = action.payload;
      const correctCount = answeredWords.filter((w) => w.correct).length;
      return { ...state, gameState: "finished", score, correctCount, totalQuestions, maxCombo, isNewHighScore, answeredWords, scoreDiff: 0, ranking: null, showComboLost: false, showComboMilestone: null, showComebackEffect: false };
    }
    case "START_GAME":
      return {
        ...initialState,
        timeLimit: action.payload.timeLimit,
        timeLeft: action.payload.timeLimit === 0 ? 0 : action.payload.timeLimit, // 無制限なら0からカウントアップ
        highScore: state.highScore,
        gameState: "playing",
        question: action.payload.question,
        usedWordIds: new Set([action.payload.question.word.id]),
      };
    case "TICK":
      // 制限時間ありなら減らす、無制限(0)なら増やす
      return { ...state, timeLeft: state.timeLimit > 0 ? state.timeLeft - 1 : state.timeLeft + 1 };
    case "END_GAME": {
      const { isNewHighScore, newHighScore, scoreDiff, newAchievements, isPerfectScore, earnedXp, levelUp, ranking } = action.payload;
      return {
        ...state,
        gameState: "finished",
        isNewHighScore,
        highScore: newHighScore ?? state.highScore,
        scoreDiff,
        pendingAchievements: newAchievements,
        showingAchievement: newAchievements[0] ?? null,
        showPerfectScore: isPerfectScore,
        earnedXp,
        levelUp,
        ranking,
        showComboLost: false,
        showComboMilestone: null,
        showComebackEffect: false,
      };
    }
    case "ANSWER": {
      const { correct, answeredWord, nextQuestion } = action.payload;
      const newCombo = correct ? state.combo + 1 : 0;
      const points = correct ? calcPointsForCombo(newCombo) : 0;
      const penalty = correct ? 0 : 10;
      const newScore = Math.max(0, state.score + points - penalty);
      const newCorrectCount = correct ? state.correctCount + 1 : state.correctCount;
      const showComboLost = !correct && state.combo >= 2;
      const showComboMilestone = correct && newCombo > 0 && newCombo % 10 === 0 ? newCombo : null;
      const showComebackEffect = correct && state.timeLeft <= 5 && state.timeLeft > 0;
      return {
        ...state,
        totalQuestions: state.totalQuestions + 1,
        answeredWords: [...state.answeredWords, answeredWord],
        combo: newCombo,
        score: newScore,
        correctCount: newCorrectCount,
        maxCombo: Math.max(state.maxCombo, newCombo),
        question: nextQuestion,
        usedWordIds: new Set(state.usedWordIds).add(nextQuestion.word.id),
        showComboLost,
        showComboMilestone,
        showComebackEffect,
      };
    }
    case "SET_FEEDBACK":
      return { ...state, feedback: action.payload };
    case "SET_PENDING_ACHIEVEMENTS":
      return { ...state, pendingAchievements: action.payload };
    case "SET_RECOGNIZED_TEXT":
      return { ...state, recognizedText: action.payload };
    case "SET_SHOWING_ACHIEVEMENT":
      return { ...state, showingAchievement: action.payload };
    case "CLOSE_PERFECT_SCORE":
      return { ...state, showPerfectScore: false };
    case "PAUSE_GAME":
      return { ...state, gameState: "paused" };
    case "RESUME_GAME":
      return { ...state, gameState: "playing" };
    case "HIDE_COMBO_LOST":
      return { ...state, showComboLost: false };
    case "HIDE_COMBO_MILESTONE":
      return { ...state, showComboMilestone: null };
    case "HIDE_COMEBACK_EFFECT":
      return { ...state, showComebackEffect: false };
    default:
      return state;
  }
}

type GlobalRanking = {
  user_id: string;
  score: number;
  total_questions?: number;
  max_combo?: number;
  incorrect_word_ids?: number[];
  created_at?: string;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
    total_xp?: number;
    streak?: number;
    level?: number;
  } | null
};

// グローバル宣言を追加（TypeScript用）
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    SpeechGrammarList: any;
    webkitSpeechGrammarList: any;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function SpeedChallengePage() {
  const [state, dispatch] = useReducer(speedChallengeReducer, initialState);
  const { gameState, timeLeft, timeLimit, score, correctCount, combo, maxCombo, question, usedWordIds, totalQuestions, highScore, isNewHighScore, showingAchievement, pendingAchievements, showPerfectScore, feedback, answeredWords, recognizedText, earnedXp, levelUp, scoreDiff, ranking, showComboLost, showComboMilestone, showComebackEffect } = state;
  const [wordFilter, setWordFilter] = useState<"all" | "correct" | "incorrect">("all");
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  // TODO: public/audio/ に音声ファイルを配置したら true に戻す
  // 必要なファイル: speed-challenge-bgm.mp3 / correct.mp3 / incorrect.mp3 /
  //               combo.mp3 / highscore.mp3 / countdown.mp3
  const [isBgmEnabled, setIsBgmEnabled] = useState(false);
  const [isSfxEnabled, setIsSfxEnabled] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(0.3);
  const [mode, setMode] = useState<SpeedChallengeMode>('mixed');
  const [timeLimitSetting, setTimeLimitSetting] = useState(30);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  const [speakingDifficulty, setSpeakingDifficulty] = useState<'strict' | 'normal' | 'easy'>('normal');
  const [rankingPeriod, setRankingPeriod] = useState<'all' | 'monthly' | 'weekly' | 'friends'>('all');
  const [hasNotifiedHighScore, setHasNotifiedHighScore] = useState(false);
  const [hasNotifiedCloseToHighScore, setHasNotifiedCloseToHighScore] = useState(false);
  const [showHighScoreToast, setShowHighScoreToast] = useState(false);
  const [showCloseToHighScoreToast, setShowCloseToHighScoreToast] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [allHighScores, setAllHighScores] = useState<Record<string, { score: number; timestamp?: number }>>({});
  const [globalRankings, setGlobalRankings] = useState<GlobalRanking[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<GlobalRanking | null>(null);
  const [weakWordStats, setWeakWordStats] = useState<{ word: Word; count: number }[]>([]);
  const [playerHistory, setPlayerHistory] = useState<{ score: number; created_at: string }[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isRival, setIsRival] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoadingRankings, setIsLoadingRankings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isShareSupported, setIsShareSupported] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<{ correct?: HTMLAudioElement; incorrect?: HTMLAudioElement; combo?: HTMLAudioElement; highscore?: HTMLAudioElement; countdown?: HTMLAudioElement; }>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  // 音声認識の再開意図フラグ（true=再開したい, false=意図的に停止）
  const shouldRestartRecognitionRef = useRef(false);
  // 音声認識が現在起動中かどうか（onstart/onendで更新）
  const isRecognitionRunningRef = useRef(false);
  // onend によるリスタートタイマーの参照（null=予約なし）
  // useEffect 側が「再開予約済みなら start() しない」ために参照する
  const pendingRestartTimerRef = useRef<NodeJS.Timeout | null>(null);
  // モバイル端末かどうか（iOS/Android ではトグルUI を使う）
  const isMobileRef = useRef(false);
  // iOS Safari かどうか（iOS は start() のたびに通知が出るため auto-restart しない）
  const isIOSRef = useRef(false);
  // モバイル: 話すボタンの ref（ネイティブ contextmenu を抑止するため）
  const speakButtonRef = useRef<HTMLButtonElement>(null);
  // 音声専用セッション判定: ja-to-en問題をタップで回答した回数（音声入力有効中）
  const tapAnswerOnVoiceQuestionRef = useRef(0);
  // endGame(useCallback) から voiceInputEnabled を参照するための ref
  const voiceInputEnabledRef = useRef(false);

  // 1/2/3/4 キー回答のための ref（handleSelect は useCallback でないため）
  const questionRef = useRef(question);
  const gameStateRef = useRef(gameState);
  useEffect(() => { questionRef.current = question; }, [question]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  // handleSelect の最新版を ref 経由で参照
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectRef = useRef<(choice: string, source?: any) => void>(() => {});

  // タイムアタックコンテキスト（単語帳からの出題範囲）
  const initializedRef = useRef(false);
  const wordPoolRef = useRef<Word[]>([]); // 空=全単語
  const [settingsLabel, setSettingsLabel] = useState<string>("");

  // 単語帳からのコンテキストを読み込む（React Strict Mode 対策で initializedRef を使用）
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const context = getAndClearTimeAttackContext();
    if (context) {
      wordPoolRef.current = context.wordIds.length > 0
        ? words.filter((w) => context.wordIds.includes(w.id))
        : [];
      setSettingsLabel(context.settingsLabel);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if ('share' in navigator) {
      setIsShareSupported(true);
    }

    isMobileRef.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    isIOSRef.current = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // 音声認識のサポート確認
    // Chrome for iOS (CriOS) / Firefox for iOS (FxiOS) は Apple の規約で WKWebView を使う。
    // webkitSpeechRecognition は API として存在するが WKWebView では動作せず、
    // onstart 直後に onend が発火して即OFFになるため明示的に除外する。
    const ua = typeof window !== 'undefined' ? navigator.userAgent : '';
    const isWebViewBrowser = /CriOS|FxiOS/i.test(ua); // Chrome/Firefox on iOS (WKWebView)
    const hasApi = !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
    setIsSpeechRecognitionSupported(hasApi && !isWebViewBrowser);
  }, []);

  // voiceInputEnabled state を endGame(useCallback) から参照できるよう ref に同期
  useEffect(() => { voiceInputEnabledRef.current = voiceInputEnabled; }, [voiceInputEnabled]);

  // モバイル: 話すボタンのコンテキストメニューをネイティブリスナーで抑止
  // React の onContextMenu だけでは Chrome Android で効かない場合があるため capture フェーズで処理
  useEffect(() => {
    const btn = speakButtonRef.current;
    if (!btn || !isMobileRef.current) return;
    const prevent = (e: Event) => e.preventDefault();
    btn.addEventListener('contextmenu', prevent, { capture: true });
    return () => btn.removeEventListener('contextmenu', prevent, { capture: true });
  }, []);

  // コンポーネントアンマウント時に音声認識を確実に停止
  useEffect(() => {
    return () => {
      shouldRestartRecognitionRef.current = false;
      if (pendingRestartTimerRef.current) {
        clearTimeout(pendingRestartTimerRef.current);
        pendingRestartTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  // プレイヤー詳細が閉じられたらいいね・フォロー状態をリセット
  useEffect(() => {
    if (selectedPlayer) {
      setIsLiked(false);
      setIsFollowed(false);
      setIsRival(false);
      setShowComparison(false);
      setPlayerHistory([]);
      
      // 履歴データの取得
      const fetchHistory = async () => {
        if (!isAuthenticated) return;
        setIsLoadingHistory(true);
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data } = await supabase
            .from('speed_challenge_results')
            .select('score, created_at')
            .eq('user_id', selectedPlayer.user_id)
            .eq('time_limit', timeLimitSetting)
            .eq('mode', mode)
            .eq('difficulty', mode === 'ja-to-en-speaking' ? speakingDifficulty : 'normal')
            .order('created_at', { ascending: false })
            .limit(20);
          
          if (data) {
            // グラフ用に古い順に並べ替え（スキーマ未適用カラムのため any キャスト）
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setPlayerHistory([...(data as any)].reverse());
          }
        }
        setIsLoadingHistory(false);
      };
      
      fetchHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlayer, isAuthenticated, timeLimitSetting, mode, speakingDifficulty]);

  // Combo Lost表示のタイマー
  useEffect(() => {
    if (showComboLost) {
      const timer = setTimeout(() => {
        dispatch({ type: "HIDE_COMBO_LOST" });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showComboLost]);

  // Combo Milestone表示のタイマー
  useEffect(() => {
    if (showComboMilestone) {
      const timer = setTimeout(() => {
        dispatch({ type: "HIDE_COMBO_MILESTONE" });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showComboMilestone]);

  // Comeback Effect表示のタイマー
  useEffect(() => {
    if (showComebackEffect) {
      const timer = setTimeout(() => {
        dispatch({ type: "HIDE_COMEBACK_EFFECT" });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showComebackEffect]);

  // ハイスコア取得とセッション復元
  useEffect(() => {
    const loadHighScore = async () => {
      const hs = await unifiedStorage.getSpeedChallengeHighScore(timeLimitSetting, mode, mode === 'ja-to-en-speaking' ? speakingDifficulty : 'normal');
      dispatch({ type: "SET_HIGH_SCORE", payload: hs });
    };
    loadHighScore();

    // 保存されたリザルト状態を復元（単語詳細から戻ってきた場合）
    const savedState = getSpeedResultState();
    if (savedState) {
      dispatch({ type: "RESTORE_SESSION", payload: savedState });
    }

    const loadAudioSettings = async () => {
      const enabled = await unifiedStorage.getBgmEnabled();
      const volume = await unifiedStorage.getBgmVolume();
      const sfxEnabled = await unifiedStorage.getSfxEnabled();
      const savedMode = await unifiedStorage.getSpeedChallengeMode();
      const savedTimeLimit = await unifiedStorage.getSpeedChallengeTimeLimit();
      const savedVoiceInput = await unifiedStorage.getSpeedChallengeVoiceInput();
      const savedDifficulty = await unifiedStorage.getSpeedChallengeSpeakingDifficulty();
      // TODO: 音声ファイル配置後に以下2行のコメントを外す
      // setIsBgmEnabled(enabled);
      // setIsSfxEnabled(sfxEnabled);
      void enabled; // 将来用に取得だけしておく（lint 対策）
      void sfxEnabled;
      setBgmVolume(volume ?? 0.3);
      setMode(savedMode);
      setTimeLimitSetting(savedTimeLimit);
      setVoiceInputEnabled(savedVoiceInput);
      setSpeakingDifficulty(savedDifficulty);
    };
    loadAudioSettings();
  }, [timeLimitSetting, mode, speakingDifficulty]);

  // タイマーコールバック内で最新のstateを参照するためのRef
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const endGame = useCallback(async () => {
    const { score, correctCount, totalQuestions, answeredWords, maxCombo } = stateRef.current;
    const incorrectWordIds = answeredWords.filter(w => !w.correct).map(w => w.id);

    // ハイスコア対象判定:
    //   - ja-to-en-speaking モード: 全問スピーキングで回答した場合のみ対象
    //   - その他のモード: 常に対象（タップ/クリックで競う）
    const isVoiceOnlyRun = mode !== 'ja-to-en-speaking' || tapAnswerOnVoiceQuestionRef.current === 0;

    // 非スピーキングモードは difficulty を 'normal' 固定（タップ競技に難易度差なし）
    const effectiveDifficulty = mode === 'ja-to-en-speaking' ? speakingDifficulty : 'normal';

    // ハイスコアは addSpeedChallengeResult が localStorage を更新する前に取得する
    const prevHighScore = await unifiedStorage.getSpeedChallengeHighScore(timeLimit, mode, effectiveDifficulty);

    // 結果を保存（音声専用でない場合はハイスコアを更新しない）
    await unifiedStorage.addSpeedChallengeResult({
      score: score,
      correctCount: correctCount,
      totalQuestions: totalQuestions,
      timeLimit: timeLimit,
      maxCombo: maxCombo, // コンボ数も保存（称号判定用）
      incorrectWordIds: incorrectWordIds,
      mode: mode,
      difficulty: effectiveDifficulty,
    }, { updateHighScore: isVoiceOnlyRun });

    // 今日のランキングを取得（音声専用セッションのみ）
    const ranking = isVoiceOnlyRun
      ? await unifiedStorage.getTodaysSpeedChallengeRanking(score, timeLimit, mode, effectiveDifficulty)
      : null;

    // ハイスコアチェック（音声専用セッションのみ更新）
    const newHighScore = isVoiceOnlyRun && score > prevHighScore;
    const scoreDiff = newHighScore ? score - prevHighScore : 0;

    // セッション状態を保存（単語詳細から戻ってきた際に復元するため）
    saveSpeedResultState({
      score: score,
      totalQuestions: totalQuestions,
      maxCombo: maxCombo,
      isNewHighScore: newHighScore, // isNewHighScoreはここで計算した最新の値を使う
      answeredWords: answeredWords,
    });

    // ミッション進捗記録
    storage.recordModePlay("speed");

    // 学習セッション記録 (XP, Level)
    // XP = 獲得ポイント数（score は 10 の倍数なので score/10 を correctCount として渡す）
    const prevUserData = await unifiedStorage.getUserData();
    const newUserData = await unifiedStorage.recordStudySession(score / 10, 0);
    const earnedXp = newUserData.totalXp - prevUserData.totalXp;
    const levelUp = newUserData.level > prevUserData.level
      ? { from: prevUserData.level, to: newUserData.level }
      : null;

    // 実績チェック
    const newAchievementIds = await unifiedStorage.checkAndUnlockAchievements({
      speedScore: score,
      isSpeedChallenge: true,
    });

    const newAchievements = newAchievementIds
      .map((id) => getAchievementById(id))
      .filter((a): a is Achievement => a !== undefined);

    // 全問正解の場合はパーフェクトスコアポップアップを表示
    const isPerfectScore = correctCount > 0 && correctCount === totalQuestions;

    dispatch({
      type: "END_GAME",
      payload: {
        isNewHighScore: newHighScore,
        newHighScore: newHighScore ? score : undefined,
        scoreDiff,
        newAchievements,
        isPerfectScore,
        earnedXp,
        levelUp,
        ranking,
      },
    });
  }, [dispatch, timeLimit, mode, speakingDifficulty]);

  const startGame = useCallback(() => {
    // 前回のセッション状態をクリア
    clearSpeedResultState();
    tapAnswerOnVoiceQuestionRef.current = 0; // 音声専用判定をリセット
    setWordFilter("all");
    setHasNotifiedHighScore(false);
    setHasNotifiedCloseToHighScore(false);
    setRevealedWords(new Set());
    const firstQuestion = getNextQuestion(new Set(), mode, wordPoolRef.current);
    dispatch({ type: "START_GAME", payload: { question: firstQuestion, timeLimit: timeLimitSetting } });
  }, [dispatch, mode, timeLimitSetting]);

  useEffect(() => {
    if (gameState === "playing") {
      // 制限時間あり(>0)で残り時間0になったら終了
      if (timeLimit > 0 && timeLeft === 0) {
        endGame();
        return;
      }

      // カウントダウン音 (残り10秒以下)
      if (timeLimit > 0 && timeLeft <= 10 && isSfxEnabled) {
        const sound = sfxRef.current.countdown;
        if (sound) {
          sound.currentTime = 0;
          sound.play().catch(() => {});
        }
      }
      timerRef.current = setTimeout(() => dispatch({ type: "TICK" }), 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft, timeLimit, endGame, dispatch, isSfxEnabled]);

  // 無制限モードでの自動一時停止
  useEffect(() => {
    // 音声入力中はタイマーを止める（喋っている間に一時停止されないよう）
    if (gameState === "playing" && timeLimit === 0 && !isListening) {
      const timer = setTimeout(() => {
        dispatch({ type: "PAUSE_GAME" });
      }, 15000); // 15秒操作がない場合
      return () => clearTimeout(timer);
    }
  }, [gameState, timeLimit, question, isListening]); // question/isListeningが変わるとリセットされる

  // ハイスコア更新通知エフェクト
  useEffect(() => {
    if (gameState === 'playing' && highScore > 0 && score > highScore && !hasNotifiedHighScore) {
      setHasNotifiedHighScore(true);
      setShowHighScoreToast(true);
      
      // 効果音再生
      if (isSfxEnabled) {
        sfxRef.current.highscore?.play().catch(console.error);
      }

      const timer = setTimeout(() => {
        setShowHighScoreToast(false);
      }, 4000); // 4秒間表示
      return () => clearTimeout(timer);
    }

    // ハイスコア接近通知 (あと3点以内)
    if (gameState === 'playing' && highScore >= 10 && score < highScore && highScore - score <= 3 && !hasNotifiedCloseToHighScore) {
      setHasNotifiedCloseToHighScore(true);
      setShowCloseToHighScoreToast(true);
      const timer = setTimeout(() => {
        setShowCloseToHighScoreToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [score, gameState, highScore, hasNotifiedHighScore, hasNotifiedCloseToHighScore, isSfxEnabled]);

  // 音声認識テキストの自動消去
  useEffect(() => {
    if (recognizedText) {
      const timer = setTimeout(() => {
        dispatch({ type: "SET_RECOGNIZED_TEXT", payload: null });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [recognizedText]);

  // BGM・効果音のセットアップ
  // TODO: 以下のファイルを public/audio/ に配置することで音声が有効になります
  //   - speed-challenge-bgm.mp3 (ループ再生するBGM)
  //   - correct.mp3   (正解時の効果音)
  //   - incorrect.mp3 (不正解時の効果音)
  //   - combo.mp3     (コンボ達成時の効果音)
  //   - highscore.mp3 (ハイスコア更新時の効果音)
  //   - countdown.mp3 (カウントダウン時の効果音)
  //
  // 参考フリー素材: https://www.zapsplat.com / https://freesound.org
  // ファイル配置後は isBgmEnabled / isSfxEnabled の初期値を true に変更してください
  useEffect(() => {
    const audio = new Audio('/audio/speed-challenge-bgm.mp3');
    audio.loop = true;
    audio.volume = bgmVolume;
    bgmRef.current = audio;

    sfxRef.current = {
      correct: new Audio('/audio/correct.mp3'),
      incorrect: new Audio('/audio/incorrect.mp3'),
      combo: new Audio('/audio/combo.mp3'),
      highscore: new Audio('/audio/highscore.mp3'),
      countdown: new Audio('/audio/countdown.mp3'),
    };
    Object.values(sfxRef.current).forEach(sfx => {
      if (sfx) sfx.volume = 0.4;
    });

    return () => {
      audio.pause();
      bgmRef.current = null;
    };
    // BGM初期化は1回のみ（bgmVolumeは別effectで同期するため意図的に除外）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // BGM音量を同期
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = bgmVolume;
    }
  }, [bgmVolume]);

  // gameStateとBGM設定に応じてBGMを再生・停止
  useEffect(() => {
    if (gameState === "playing" && isBgmEnabled) {
      bgmRef.current?.play().catch(error => {
        console.error("BGMの自動再生に失敗しました:", error);
      });
    } else {
      if (bgmRef.current && !bgmRef.current.paused) {
        bgmRef.current.pause();
        if (gameState !== "paused") {
          bgmRef.current.currentTime = 0;
        }
      }
    }
  }, [gameState, isBgmEnabled]);

  // BGMピッチをスコアに応じて変更
  useEffect(() => {
    if (gameState === "playing" && bgmRef.current) {
      // スコアに応じて再生速度を計算 (例: 1.0から始めて、30点で1.2倍速になるように調整)
      const newRate = 1.0 + (score * 0.007);
      bgmRef.current.playbackRate = Math.min(newRate, 1.2); // 上限を設ける
    } else if (bgmRef.current && bgmRef.current.playbackRate !== 1.0) {
      // ゲーム終了時や準備画面に戻った時にリセット
      bgmRef.current.playbackRate = 1.0;
    }
  }, [score, gameState]);

  // 問題出題時の自動読み上げ（英→日タイプの場合のみ）
  useEffect(() => {
    if (gameState !== "playing" || !question || !isSpeechSynthesisSupported()) return;

    // 英→日の場合のみ自動再生
    if (question.type === "en-to-ja") {
      // スピードチャレンジは短い遅延で即座に再生
      const timeoutId = setTimeout(() => {
        speakWord(question.word.word);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [question, gameState]);

  // 音声認識の制御
  // 【iOS】start() のたびに「マイクへのアクセスが許可されています」通知が出るため
  //   自動再起動しない（トグルボタンでユーザーが明示的に開始）
  // 【Android Chrome】無音タイムアウト（~1-2秒）で onend が発火する。
  //   iOS の通知問題がないため Desktop と同じ auto-restart ロジックを適用。
  // 【共通】interimResults=true で話し途中の interim 結果を受信し、
  //   完全一致なら即座に正解判定（Safari のラグ軽減）
  useEffect(() => {
    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true; // true: 話しながら部分結果を受信 → 正解なら即判定（Safari のラグ軽減）
      recognition.lang = 'en-US';
      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;
    const isMobile = isMobileRef.current;

    // 文法リストの更新（認識実行中でなければ更新。実行中に更新すると Android で abort が起きる場合がある）
    if (question && !isRecognitionRunningRef.current && (window.SpeechGrammarList || window.webkitSpeechGrammarList)) {
      const SpeechGrammarListAPI = window.SpeechGrammarList || window.webkitSpeechGrammarList;
      const speechRecognitionList = new SpeechGrammarListAPI();
      const wordsToRecognize = [...question.choices, question.correctAnswer];
      const uniqueWords = Array.from(new Set(wordsToRecognize));
      const grammar = `#JSGF V1.0; grammar choices; public <choice> = ${uniqueWords.join(' | ')} ;`;
      speechRecognitionList.addFromString(grammar, 1);
      recognition.grammars = speechRecognitionList;
    }

    const shouldListen = gameState === 'playing' && voiceInputEnabled && question?.type === 'ja-to-en';

    if (shouldListen) {
      shouldRestartRecognitionRef.current = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim().toLowerCase();
        if (!transcript) return; // 空の interim 結果は無視（Android で発生することがある）
        const answer = question.correctAnswer.toLowerCase();

        const isCorrect = (() => {
          if (speakingDifficulty === 'strict') {
            return transcript === answer;
          }

          if (transcript === answer || transcript.includes(answer)) return true;

          if (speakingDifficulty === 'easy') {
            const stripArticles = (s: string) =>
              s.replace(/\b(a|an|the|to|of|in|on|at|for)\b/g, '').replace(/\s+/g, ' ').trim();
            const cleanTranscript = stripArticles(transcript);
            const cleanAnswer = stripArticles(answer);

            const threshold = Math.max(3, Math.floor(cleanAnswer.length * 0.5));

            if (levenshteinDistance(cleanTranscript, cleanAnswer) <= threshold) return true;
            if (cleanAnswer.startsWith(cleanTranscript) && cleanTranscript.length >= 3) return true;

            const tokens = cleanTranscript.split(/\s+/);
            return tokens.some((w: string) => {
              if (levenshteinDistance(w, cleanAnswer) <= threshold) return true;
              return cleanAnswer.startsWith(w) && w.length >= 3;
            });
          }
          return false;
        })();

        dispatch({ type: "SET_RECOGNIZED_TEXT", payload: { text: transcript, isCorrect } });
        if (isCorrect) {
          handleSelect(question.correctAnswer, 'voice');
        }
      };

      recognition.onstart = () => { setIsListening(true); };

      recognition.onend = () => {
        isRecognitionRunningRef.current = false;
        setIsListening(false);
        if (!shouldRestartRecognitionRef.current) return;

        if (isMobile) {
          // モバイル全般（iOS/Android Chrome）: 自動再開しない
          // iOS: start() のたびにシステム通知が出る
          // Android Chrome: Chrome 55+ は setTimeout 等の非ユーザージェスチャーから
          //   start() を呼ぶと NotAllowedError/aborted が発生し永続的にOFFになる
          // → いずれもトグルボタンでユーザーが次回を明示的に開始する
        } else {
          // デスクトップのみ: タイマーで自動再開
          if (pendingRestartTimerRef.current) {
            clearTimeout(pendingRestartTimerRef.current);
          }
          pendingRestartTimerRef.current = setTimeout(() => {
            pendingRestartTimerRef.current = null;
            if (shouldRestartRecognitionRef.current && !isRecognitionRunningRef.current) {
              isRecognitionRunningRef.current = true;
              try { recognition.start(); } catch { isRecognitionRunningRef.current = false; }
            }
          }, 300);
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        // not-allowed / service-not-allowed: 権限エラー → 以降の自動再開を停止
        // aborted: 非ユーザージェスチャーからの start() を Chrome Android がブロック → 同様に停止
        if (['not-allowed', 'service-not-allowed', 'aborted'].includes(event.error)) {
          shouldRestartRecognitionRef.current = false;
          if (pendingRestartTimerRef.current) {
            clearTimeout(pendingRestartTimerRef.current);
            pendingRestartTimerRef.current = null;
          }
        }
        // no-speech: 無音タイムアウト（モバイルで頻発）→ onend に任せる（モバイルは再開しない）
      };

      if (isMobile) {
        // モバイル: 自動起動しない。push-to-talk ボタンが常時表示されている
      } else {
        // デスクトップ: 未起動かつ再開タイマーが予約されていない場合のみ自動起動
        if (!isRecognitionRunningRef.current && pendingRestartTimerRef.current === null) {
          isRecognitionRunningRef.current = true;
          try { recognition.start(); } catch { isRecognitionRunningRef.current = false; }
        }
      }
    } else {
      // 意図的な停止（voiceInput OFF / ゲーム終了 / ja-to-en 以外）
      shouldRestartRecognitionRef.current = false;
      if (pendingRestartTimerRef.current) {
        clearTimeout(pendingRestartTimerRef.current);
        pendingRestartTimerRef.current = null;
      }
      if (isRecognitionRunningRef.current) {
        try { recognition.stop(); } catch { /* ignore */ }
      }
      setIsListening(false);
    }

    // cleanup では stop しない（question 変更時に認識を継続させるため）
    // アンマウント時の stop は専用 useEffect([]) で実施
    // handleSelect を deps に追加すると認識が再初期化されるため意図的に除外
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, voiceInputEnabled, question, isSpeechRecognitionSupported, speakingDifficulty]);

  const handleSelect = (choice: string, source: 'tap' | 'voice' = 'tap') => {
    if (!question || gameState !== "playing") return;

    // スピーキングモードで ja-to-en 問題をタップで回答した場合を記録（ハイスコード判定に使用）
    if (source === 'tap' && mode === 'ja-to-en-speaking' && question.type === 'ja-to-en') {
      tapAnswerOnVoiceQuestionRef.current += 1;
    }

    const correct = choice === question.correctAnswer;

    // 効果音を再生
    if (isSfxEnabled) {
      let sfx: HTMLAudioElement | undefined;
      if (correct) {
        const newCombo = combo + 1;
        // コンボ2以上でコンボ効果音（ポイントが倍増するタイミング）
        if (newCombo >= 2) {
          sfx = sfxRef.current.combo;
        } else {
          sfx = sfxRef.current.correct;
        }
      } else {
        sfx = sfxRef.current.incorrect;
      }

      if (sfx) {
        sfx.currentTime = 0;
        sfx.play().catch(console.error);
      }
    }

    // ja-to-en問題で選択した英単語を読み上げ（正誤に関わらず、音と文字の結びつけ）
    if (question.type === "ja-to-en" && isSpeechSynthesisSupported()) {
      speakWord(choice);
    }

    // 回答した単語を追跡
    const answeredWord = {
      id: question.word.id,
      word: question.word.word,
      meaning: question.word.meaning,
      correct,
    };

    // フィードバック表示
    dispatch({ type: "SET_FEEDBACK", payload: { correct, show: true } });
    setTimeout(() => dispatch({ type: "SET_FEEDBACK", payload: null }), FEEDBACK_DURATION_MS);

    // 次の問題
    const newQuestion = getNextQuestion(usedWordIds, mode, wordPoolRef.current);
    dispatch({ type: "ANSWER", payload: { correct, answeredWord, nextQuestion: newQuestion } });
  };

  const handleAchievementClose = () => {
    const remaining = pendingAchievements.slice(1);
    dispatch({ type: "SET_PENDING_ACHIEVEMENTS", payload: remaining });
    if (remaining.length > 0) {
      // ポップアップが閉じるアニメーションのために一度nullをセット
      dispatch({ type: "SET_SHOWING_ACHIEVEMENT", payload: null });
      setTimeout(() => dispatch({ type: "SET_SHOWING_ACHIEVEMENT", payload: remaining[0] }), 300);
    } else {
      dispatch({ type: "SET_SHOWING_ACHIEVEMENT", payload: null });
    }
  };

  // handleSelect ref を常に最新に保つ
  handleSelectRef.current = handleSelect;

  // 1/2/3/4 キーで選択肢を選択（マウント時に一度だけリスナー登録）
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (gameStateRef.current !== "playing" || !questionRef.current) return;
      const idx = ["1", "2", "3", "4"].indexOf(e.key);
      if (idx >= 0 && questionRef.current.choices[idx] !== undefined) {
        e.preventDefault();
        handleSelectRef.current(questionRef.current.choices[idx]);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBgmToggle = () => {
    const newBgmState = !isBgmEnabled;
    setIsBgmEnabled(newBgmState);
    unifiedStorage.setBgmEnabled(newBgmState);
  };

  const handleSfxToggle = () => {
    const newSfxState = !isSfxEnabled;
    setIsSfxEnabled(newSfxState);
    unifiedStorage.setSfxEnabled(newSfxState);
  };

  const handleVolumeChange = (newVolume: number) => {
    setBgmVolume(newVolume);
    unifiedStorage.setBgmVolume(newVolume);
  };

  const handleModeChange = (newMode: SpeedChallengeMode) => {
    setMode(newMode);
    unifiedStorage.setSpeedChallengeMode(newMode);
    // スピーキングモード選択時は音声入力を自動ON
    if (newMode === 'ja-to-en-speaking') {
      setVoiceInputEnabled(true);
      unifiedStorage.setSpeedChallengeVoiceInput(true);
    }
  };

  const handleTimeLimitChange = (newLimit: number) => {
    setTimeLimitSetting(newLimit);
    unifiedStorage.setSpeedChallengeTimeLimit(newLimit);
  };

  const handleVoiceInputToggle = () => {
    setVoiceInputEnabled(!voiceInputEnabled);
    unifiedStorage.setSpeedChallengeVoiceInput(!voiceInputEnabled);
  };

  // モバイル: タップでON/OFFトグル（長押し不要 → コンテキストメニュー問題を回避）
  const handleSpeakToggle = () => {
    if (isListening) {
      // 停止: shouldRestart を先に落とし pending タイマーもキャンセルしてから stop
      // → onend が発火しても自動再開しない
      shouldRestartRecognitionRef.current = false;
      if (pendingRestartTimerRef.current) {
        clearTimeout(pendingRestartTimerRef.current);
        pendingRestartTimerRef.current = null;
      }
      if (recognitionRef.current && isRecognitionRunningRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    } else {
      if (!recognitionRef.current || isRecognitionRunningRef.current) return;
      // ユーザーが再開したので restart フラグを立てる（Android auto-restart のため）
      shouldRestartRecognitionRef.current = true;
      isRecognitionRunningRef.current = true;
      try { recognitionRef.current.start(); } catch { isRecognitionRunningRef.current = false; }
    }
  };

  const handleSpeakingDifficultyChange = (diff: 'strict' | 'normal' | 'easy') => {
    setSpeakingDifficulty(diff);
    unifiedStorage.setSpeedChallengeSpeakingDifficulty(diff);
  };

  const handleResetHighScores = async () => {
    if (window.confirm('すべてのスピードチャレンジのハイスコアをリセットします。よろしいですか？この操作は元に戻せません。')) {
      await unifiedStorage.resetAllSpeedChallengeHighScores();
      setAllHighScores({});
      dispatch({ type: "SET_HIGH_SCORE", payload: 0 });
    }
  };

  const fetchRankings = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    // モーダルが開いている時のみ取得
    if (showHighScores) {
      setIsLoadingRankings(true);
      const supabase = getSupabaseClient();
      if (supabase) {
        let dateFilter = null;
        let friendIds: string[] | null = null;
        if (rankingPeriod === 'weekly') {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          dateFilter = d.toISOString();
        } else if (rankingPeriod === 'monthly') {
          const d = new Date();
          d.setMonth(d.getMonth() - 1);
          dateFilter = d.toISOString();
        } else if (rankingPeriod === 'friends') {
          // フレンドIDを取得（friendsテーブルを想定）
          const { data: friends } = await supabase
            .from('friends')
            .select('friend_id')
            .eq('user_id', user.id);
          if (friends) {
            // friendsテーブルはスキーマ未適用のため any キャスト
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            friendIds = (friends as any[]).map((f: any) => f.friend_id);
            friendIds.push(user.id); // 自分も含める
          } else {
            friendIds = [user.id];
          }
        }

        const effectiveDifficultyForRanking = mode === 'ja-to-en-speaking' ? speakingDifficulty : 'normal';
        // ランキング取得
        let query = supabase
          .from('speed_challenge_results')
          .select('user_id, score, total_questions, max_combo, incorrect_word_ids, created_at, profiles(display_name, avatar_url, total_xp, streak, level)')
          // 現在の設定でフィルタリング
          .eq('time_limit', timeLimitSetting)
          .eq('mode', mode)
          .eq('difficulty', effectiveDifficultyForRanking)
          .order('score', { ascending: false })
          .limit(10);
        
        if (dateFilter) {
          query = query.gte('created_at', dateFilter);
        }

        if (rankingPeriod === 'friends' && friendIds) {
          query = query.in('user_id', friendIds);
        }

        // スキーマ未適用カラム（max_combo, incorrect_word_ids等）のため any キャスト
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (query as any);

        if (!error) {
          const rankings: GlobalRanking[] = data || [];
          setGlobalRankings(rankings);

          // 苦手単語の集計
          const wordCounts: Record<number, number> = {};
          rankings.forEach(r => {
            if (r.incorrect_word_ids && Array.isArray(r.incorrect_word_ids)) {
              r.incorrect_word_ids.forEach((id: number) => {
                wordCounts[id] = (wordCounts[id] || 0) + 1;
              });
            }
          });

          const sortedStats = Object.entries(wordCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5) // 上位5つ
            .map(([id, count]) => {
              const word = words.find(w => w.id === parseInt(id));
              return word ? { word, count } : null;
            })
            .filter((item): item is { word: Word; count: number } => item !== null);
          
          setWeakWordStats(sortedStats);
        } else {
          console.error("Error fetching global rankings:", error);
        }

        // 自分の順位取得
        // 1. 自分のベストスコアを取得（スキーマ未適用カラムのため any キャスト）
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let myBestQuery: any = supabase
          .from('speed_challenge_results')
          .select('score')
          .eq('user_id', user.id)
          .eq('time_limit', timeLimitSetting)
          .eq('mode', mode)
          .eq('difficulty', effectiveDifficultyForRanking)
          .order('score', { ascending: false })
          .limit(1)
          .single();

        if (dateFilter) {
          myBestQuery = myBestQuery.gte('created_at', dateFilter);
        }

        if (rankingPeriod === 'friends' && friendIds) {
          myBestQuery = myBestQuery.in('user_id', friendIds);
        }

        const { data: myBest } = await myBestQuery;
        
        if (myBest) {
          // 2. 自分より高いスコアの数をカウント
          let countQuery = supabase
            .from('speed_challenge_results')
            .select('*', { count: 'exact', head: true })
            .eq('time_limit', timeLimitSetting)
            .eq('mode', mode)
            .eq('difficulty', effectiveDifficultyForRanking)
            .gt('score', myBest.score);
          
          if (dateFilter) {
            countQuery = countQuery.gte('created_at', dateFilter);
          }

          if (rankingPeriod === 'friends' && friendIds) {
            countQuery = countQuery.in('user_id', friendIds);
          }

          const { count } = await countQuery;
          if (count !== null) setUserRank(count + 1);
        } else {
          setUserRank(null);
        }
      }
      setIsLoadingRankings(false);
    }
  }, [isAuthenticated, user, showHighScores, rankingPeriod, timeLimitSetting, mode, speakingDifficulty]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  const handleQuizWeakWords = () => {
    const weakWordIds = weakWordStats.map(stat => stat.word.id);
    if (weakWordIds.length === 0) return;

    sessionStorage.setItem('quiz-custom-word-ids', JSON.stringify(weakWordIds));
    router.push('/word-list');
  };

  const handleShowHighScores = async () => {
    const scores = await unifiedStorage.getAllSpeedChallengeHighScores();
    setAllHighScores(scores);
    setShowHighScores(true);
  };

  const handleShare = () => {
    if (!navigator.share) return;

    const title = getSpeedChallengeTitle(score, maxCombo, correctCount, totalQuestions);
    const shareText = `「栗垣英単語」のスピードチャレンジで【${title.text}】の称号を獲得！ (スコア: ${score}pt, 最大コンボ: ${maxCombo}) #栗垣英単語`;

    navigator.share({
      title: 'スピードチャレンジ結果',
      text: shareText,
      url: window.location.origin + '/speed-challenge',
    })
    .catch((error) => console.log('シェアに失敗しました', error));
  };

  const handleRetryIncorrect = () => {
    const incorrectWordIds = answeredWords.filter(w => !w.correct).map(w => w.id);
    if (incorrectWordIds.length === 0) return;

    // クイズモードで使う単語IDをセッションストレージに保存
    sessionStorage.setItem('quiz-custom-word-ids', JSON.stringify(incorrectWordIds));
    // クイズページに遷移
    router.push('/word-list');
  };

  const comboEffectClass = useMemo(() => {
    if (combo >= 20) return "animate-pulse bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 shadow-[0_0_20px_rgba(239,68,68,0.4)]";
    if (combo >= 10) return "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 shadow-[0_0_15px_rgba(249,115,22,0.3)]";
    if (combo >= 5) return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 shadow-[0_0_10px_rgba(234,179,8,0.3)]";
    return "";
  }, [combo]);

  // 背景演出（スコアに応じて風景が出来上がっていく）
  const backgroundInfo = useMemo(() => {
    let gradient = "from-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-800";
    if (score >= 30) gradient = "from-indigo-100 to-purple-100 dark:from-indigo-950 dark:to-purple-950"; // 夜/宇宙
    else if (score >= 20) gradient = "from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950"; // 夕方
    else if (score >= 10) gradient = "from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950"; // 昼
    else gradient = "from-sky-100 to-blue-50 dark:from-sky-950 dark:to-blue-950"; // 朝

    const allItems = ["🌱", "🍄", "🌷", "🌳", "🏡", "🌲", "🏠", "🏢", "🌈", "🏰", "🎡", "🚀", "🪐", "✨"];
    const count = Math.min(Math.floor(score / 2), allItems.length);
    const visibleItems = allItems.slice(0, count);
    return { gradient, visibleItems };
  }, [score]);

  // 準備画面
  if (gameState === "ready") {
    if (showHighScores) {
      return (
        <div className="main-content px-3 py-2 flex items-center justify-center">
          <Card className="max-w-md w-full !p-4 flex flex-col h-[80vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">ハイスコア一覧</h2>
              <button onClick={() => setShowHighScores(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {isAuthenticated && (
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  サーバーランキング (Top 10)
                </h3>
                
                {/* 期間切り替えタブ */}
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mb-3">
                  {[
                    { id: 'all', label: '全期間' },
                    { id: 'monthly', label: '月間' },
                    { id: 'weekly', label: '週間' },
                    { id: 'friends', label: 'フレンド' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setRankingPeriod(p.id as 'all' | 'monthly' | 'weekly' | 'friends')}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${
                        rankingPeriod === p.id
                          ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {isLoadingRankings ? (
                  <div className="text-center py-4 text-slate-400">読み込み中...</div>
                ) : (
                  <div className="space-y-1 text-xs">
                    {globalRankings.map((rank, index) => (
                      <div 
                        key={index}
                        onClick={() => setSelectedPlayer(rank)}
                        className={`flex items-center justify-between p-1.5 rounded cursor-pointer transition-colors ${
                          user?.id === rank.user_id
                            ? "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700"
                            : "bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold w-6 text-center flex justify-center text-base">
                            {index === 0 ? "🥇" : 
                             index === 1 ? "🥈" : 
                             index === 2 ? "🥉" : index + 1}
                          </span>
                          <div className="flex flex-col">
                            <span>{rank.profiles?.display_name || '匿名'}</span>
                            {/* 称号表示 */}
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              {(() => {
                                const title = getSpeedChallengeTitle(rank.score, rank.max_combo || 0, 0, rank.total_questions || 0);
                                return `${title.emoji} ${title.text}`;
                              })()}
                            </span>
                            {rank.created_at && (
                              <span className="text-[9px] text-slate-400">
                                {new Date(rank.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-primary-500">{rank.score}</span>
                      </div>
                    ))}
                    {globalRankings.length === 0 && (
                      <div className="text-center py-4 text-slate-400 text-xs">
                        まだランキングデータがありません。
                      </div>
                    )}
                  </div>
                )}

                {/* 苦手単語トレンド */}
                {weakWordStats.length > 0 && (
                  <div className="mt-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-2 border border-red-100 dark:border-red-800">
                    <div className="flex justify-between items-center mb-1.5">
                      <h4 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span>📉</span> 上位プレイヤーの苦手単語
                      </h4>
                      <button
                        onClick={handleQuizWeakWords}
                        className="text-[10px] bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors shadow-sm"
                      >
                        この単語でクイズ
                      </button>
                    </div>
                    <div className="space-y-1">
                      {weakWordStats.map((stat) => (
                        <div key={stat.word.id} className="flex justify-between items-center text-[10px] bg-white dark:bg-slate-900/50 px-2 py-1 rounded">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{stat.word.word}</span>
                          <span className="text-slate-400">{stat.count}人がミス</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userRank && (
                  <div className="mt-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded border border-primary-100 dark:border-primary-800 flex justify-between items-center">
                    <span className="text-xs font-bold text-primary-700 dark:text-primary-300">あなたの順位</span>
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{userRank}位</span>
                  </div>
                )}
              </div>
            )}
            
            {/* プレイヤー詳細モーダル */}
            {selectedPlayer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedPlayer(null)}>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 w-full max-w-xs shadow-xl transform transition-all" onClick={e => e.stopPropagation()}>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full mb-3 overflow-hidden flex items-center justify-center">
                      {selectedPlayer.profiles?.avatar_url ? (
                        <Image src={selectedPlayer.profiles.avatar_url} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">👤</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {selectedPlayer.profiles?.display_name || '匿名ユーザー'}
                    </h3>
                    <div className="inline-block bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-bold mb-4">
                      Score: {selectedPlayer.score}
                    </div>
                    
                    {/* プロフィール詳細 */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">LEVEL</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200">{selectedPlayer.profiles?.level || 1}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">総XP</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200">{selectedPlayer.profiles?.total_xp || 0}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">連続学習</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200">{selectedPlayer.profiles?.streak || 0}<span className="text-[10px] font-normal ml-0.5">日</span></div>
                      </div>
                    </div>

                    {showComparison ? (
                      <div className="mb-4 bg-slate-50 dark:bg-slate-900/50 rounded p-2">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">スコア比較</h4>
                        <div className="flex justify-between items-end h-20 px-4 pb-1">
                          <div className="flex flex-col items-center gap-1 w-1/3">
                            <div className="w-full bg-blue-400 rounded-t" style={{ height: `${Math.min(100, (highScore / Math.max(highScore, selectedPlayer.score)) * 100)}%` }}></div>
                            <span className="text-[10px] font-bold">あなた</span>
                            <span className="text-xs font-bold">{highScore}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 w-1/3">
                            <div className="w-full bg-red-400 rounded-t" style={{ height: `${Math.min(100, (selectedPlayer.score / Math.max(highScore, selectedPlayer.score)) * 100)}%` }}></div>
                            <span className="text-[10px] font-bold">相手</span>
                            <span className="text-xs font-bold">{selectedPlayer.score}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" fullWidth onClick={() => setShowComparison(false)} className="mt-2 text-xs h-6">
                          戻る
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="secondary" fullWidth onClick={() => setShowComparison(true)} className="mb-4">
                        📊 ライバルと比較
                      </Button>
                    )}

                    {/* スコア履歴グラフ */}
                    <div className="mb-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 text-left">直近のスコア推移</p>
                      <div className="w-full h-24 bg-slate-50 dark:bg-slate-900/50 rounded border border-slate-100 dark:border-slate-700 relative overflow-hidden flex items-end">
                        {isLoadingHistory ? (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">読み込み中...</div>
                        ) : playerHistory.length > 1 ? (
                          <svg width="100%" height="100%" viewBox={`0 0 100 100`} preserveAspectRatio="none" className="w-full h-full">
                            <polyline
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-primary-500"
                              points={playerHistory.map((h, i) => {
                                const max = Math.max(...playerHistory.map(p => p.score), 10);
                                const x = (i / (playerHistory.length - 1)) * 100;
                                const y = 100 - (h.score / max) * 80 - 10; // 下に余白
                                return `${x},${y}`;
                              }).join(' ')}
                            />
                          </svg>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">データ不足</div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center mb-4 flex-wrap">
                      <Button size="sm" variant={isLiked ? undefined : "outline"} onClick={() => setIsLiked(!isLiked)} className="flex-1">
                        {isLiked ? "❤️" : "🤍"} いいね
                      </Button>
                      <Button size="sm" variant={isFollowed ? undefined : "outline"} onClick={() => setIsFollowed(!isFollowed)} className="flex-1">
                        {isFollowed ? "👤 フォロー中" : "➕ フォロー"}
                      </Button>
                      <Button size="sm" variant={isRival ? undefined : "outline"} onClick={() => setIsRival(!isRival)} className="flex-1">
                        {isRival ? "🔥 ライバル" : "⚔️ ライバル登録"}
                      </Button>
                    </div>

                    <Button fullWidth onClick={() => setSelectedPlayer(null)}>
                      閉じる
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-2">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                個人ハイスコア
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              {[30, 60, 0].map((t) => (
                <div key={t} className="mb-4">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {t === 0 ? "無制限" : `${t}秒`}
                  </h3>
                  <div className="space-y-2">
                    {[
                      { id: 'mixed', label: 'ミックス', speaking: false },
                      { id: 'en-to-ja', label: '英→日', speaking: false },
                      { id: 'ja-to-en', label: '日→英', speaking: false },
                      { id: 'ja-to-en-speaking', label: '日→英 スピーキング', speaking: true },
                    ].map((m) => (
                      <div key={m.id} className={`border rounded-lg p-2 ${m.speaking ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold flex items-center gap-1 ${m.speaking ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"}`}>
                            {m.speaking && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>}
                            {m.label}
                          </span>
                        </div>
                        {m.speaking ? (
                          <div className="grid grid-cols-3 gap-1">
                            {[
                              { id: 'strict', label: 'ネイティブ' },
                              { id: 'normal', label: '標準' },
                              { id: 'easy', label: '入門' },
                            ].map((d) => {
                              const key = `${t}_${m.id}_${d.id}`;
                              const entry = allHighScores[key];
                              const hs = entry?.score || 0;
                              const dateStr = entry?.timestamp ? new Date(entry.timestamp).toLocaleString('ja-JP', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              }) : null;
                              return (
                                <div key={d.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                  <div className="flex flex-col items-start">
                                    <span className="text-[10px] text-slate-500 dark:text-slate-500">{d.label}</span>
                                    {dateStr && <span className="text-[9px] text-slate-400 leading-none">{dateStr}</span>}
                                  </div>
                                  <span className={`text-sm font-bold ${hs > 0 ? "text-orange-500" : "text-slate-300 dark:text-slate-600"}`}>
                                    {hs}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          (() => {
                            const key = `${t}_${m.id}_normal`;
                            const entry = allHighScores[key];
                            const hs = entry?.score || 0;
                            const dateStr = entry?.timestamp ? new Date(entry.timestamp).toLocaleString('ja-JP', {
                              year: 'numeric',
                              month: 'numeric',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : null;
                            return (
                              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                <div className="flex flex-col items-start">
                                  <span className="text-[10px] text-slate-500 dark:text-slate-500">ベスト</span>
                                  {dateStr && <span className="text-[9px] text-slate-400 leading-none">{dateStr}</span>}
                                </div>
                                <span className={`text-sm font-bold ${hs > 0 ? "text-orange-500" : "text-slate-300 dark:text-slate-600"}`}>
                                  {hs}
                                </span>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <Button variant="secondary" fullWidth onClick={handleResetHighScores} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                全ハイスコアをリセット
              </Button>
              <Button variant="secondary" fullWidth onClick={() => setShowHighScores(false)}>
                閉じる
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="main-content px-3 py-2 flex items-center justify-center">
        <Card className="max-w-md w-full text-center !p-4">
          <div className="mb-3">
            <span className="text-5xl emoji-icon">⚡</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            スピードチャレンジ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-1">
            {TIME_LIMIT}秒間で何問正解できるか挑戦！
          </p>
          {settingsLabel && (
            <p className="text-xs text-primary-500 mb-3">出題範囲: {settingsLabel}</p>
          )}
          {!settingsLabel && <div className="mb-3" />}

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-2 mb-3">
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">ハイスコア</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{highScore}</p>
              <button 
                onClick={handleShowHighScores}
                className="text-[10px] text-orange-500/80 hover:text-orange-600 underline mt-1"
              >
                一覧を見る
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">🎵 実装予定</span>
                <button
                  onClick={handleBgmToggle}
                  disabled
                  className="p-2 rounded-full bg-white/30 dark:bg-black/10 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50 transition-colors"
                  title="BGM (音声ファイル準備中)"
                >
                  {isBgmEnabled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                  )}
                </button>
                <button
                  onClick={handleSfxToggle}
                  disabled
                  className="p-2 rounded-full bg-white/30 dark:bg-black/10 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50 transition-colors"
                  title="効果音 (音声ファイル準備中)"
                >
                  {isSfxEnabled ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  )}
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={bgmVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                disabled
                className="w-full h-2 bg-white/50 dark:bg-black/20 rounded-lg appearance-none cursor-not-allowed opacity-50"
                title="音量 (音声ファイル準備中)"
              />
            </div>
            
            <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800/30">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1 text-left">出題モード</p>
              <div className="flex gap-1 mb-1">
                {[
                  { id: 'mixed', label: 'ミックス' },
                  { id: 'en-to-ja', label: '英→日' },
                  { id: 'ja-to-en', label: '日→英' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleModeChange(m.id as SpeedChallengeMode)}
                    className={`flex-1 py-1 px-2 rounded text-[10px] font-bold transition-colors ${
                      mode === m.id
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-black/40"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {/* スピーキングモード: 全幅で目立つ配置 */}
              <button
                onClick={() => handleModeChange('ja-to-en-speaking')}
                className={`w-full py-1 px-2 rounded text-[10px] font-bold transition-colors flex items-center justify-center gap-1 ${
                  mode === 'ja-to-en-speaking'
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700/50 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                日→英 スピーキング（全問音声でハイスコア対象）
              </button>
            </div>

            <div className="mt-2 pt-2 border-t border-yellow-200 dark:border-yellow-800/30">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">制限時間</p>
                {mode === 'ja-to-en-speaking' ? (
                  // スピーキングモード: トグル不要、状態を表示
                  !isSpeechRecognitionSupported ? (
                    <p className="text-[9px] text-amber-600 dark:text-amber-400">
                      {isIOSRef.current ? "Safari でのみ利用可" : "このブラウザは音声非対応"}
                    </p>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] text-blue-600 dark:text-blue-400 font-bold">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                      音声入力 ON
                    </span>
                  )
                ) : (
                  // 通常モード: 任意の音声入力トグル
                  <>
                    {!isSpeechRecognitionSupported && isIOSRef.current && (
                      <p className="text-[9px] text-amber-600 dark:text-amber-400">
                        音声入力はSafariのみ対応
                      </p>
                    )}
                    {isSpeechRecognitionSupported && (
                      <button
                        onClick={handleVoiceInputToggle}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          voiceInputEnabled ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                        </svg>
                        音声入力 {voiceInputEnabled ? "ON" : "OFF"}
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-1">
                {[
                  { val: 30, label: '30秒' },
                  { val: 60, label: '60秒' },
                  { val: 0, label: '無制限' }
                ].map((t) => (
                  <button
                    key={t.val}
                    onClick={() => handleTimeLimitChange(t.val)}
                    className={`flex-1 py-1 px-2 rounded text-[10px] font-bold transition-colors ${
                      timeLimitSetting === t.val
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-white/50 dark:bg-black/20 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-black/40"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {mode === 'ja-to-en-speaking' && isSpeechRecognitionSupported && (
                <div className="flex justify-between items-center mt-2 border-t border-dashed border-slate-200 dark:border-slate-700 pt-1">
                  <span className="text-[9px] text-slate-500 dark:text-slate-400">判定難易度:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleSpeakingDifficultyChange('strict')}
                      className={`px-2 py-0.5 text-[9px] rounded transition-colors ${speakingDifficulty === 'strict' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      ネイティブ
                    </button>
                    <button
                      onClick={() => handleSpeakingDifficultyChange('normal')}
                      className={`px-2 py-0.5 text-[9px] rounded transition-colors ${speakingDifficulty === 'normal' ? 'bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      標準
                    </button>
                    <button
                      onClick={() => handleSpeakingDifficultyChange('easy')}
                      className={`px-2 py-0.5 text-[9px] rounded transition-colors ${speakingDifficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-bold' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      入門
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5 text-left mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-lg emoji-icon">1️⃣</span>
              <p className="text-slate-600 dark:text-slate-300 text-xs">コンボが続くほどスコア倍増！最大+160pt</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg emoji-icon">2️⃣</span>
              <p className="text-slate-600 dark:text-slate-300 text-xs">不正解は-10ptでコンボリセット</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg emoji-icon">3️⃣</span>
              <p className="text-slate-600 dark:text-slate-300 text-xs">制限時間内に高スコアを目指せ！</p>
            </div>
          </div>

          <Button fullWidth onClick={startGame}>
            スタート！
          </Button>

          {isAuthenticated && (
            <button
              onClick={handleShowHighScores}
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="emoji-icon">🏆</span>
              <span>ランキングを見る</span>
            </button>
          )}
          {!isAuthenticated && (
            <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 text-center">
              ログインするとランキングに参加できます
            </p>
          )}
        </Card>
      </div>
    );
  }

  // 一時停止画面
  if (gameState === "paused") {
    return (
      <div className="main-content px-3 py-2 flex items-center justify-center">
        <Card className="max-w-md w-full text-center !p-8">
          <div className="mb-4">
            <span className="text-5xl emoji-icon">zzz</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            一時停止中
          </h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">現在のスコア</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{score}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {timeLimit === 0 ? "経過時間" : "残り時間"}
              </p>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
                {timeLeft}<span className="text-sm font-normal ml-0.5">s</span>
              </p>
            </div>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            操作がなかったため一時停止しました。
          </p>
          <div className="space-y-2 w-full">
            <Button fullWidth onClick={() => dispatch({ type: "RESUME_GAME" })}>
              再開する
            </Button>
            <Button variant="secondary" fullWidth onClick={endGame}>
              終了して結果を見る
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // プレイ中
  if (gameState === "playing" && question) {
    const isEnToJa = question.type === "en-to-ja";
    const isUnlimited = timeLimit === 0;
    const timePercentage = isUnlimited ? 100 : (timeLeft / timeLimit) * 100;
    const isLowTime = !isUnlimited && timeLeft <= 10;

    return (
      <div className="main-content px-2 py-1.5 flex flex-col">
        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-4px); }
            40% { transform: translateX(4px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
          .animate-shake {
            animation: shake 0.3s cubic-bezier(.36,.07,.19,.97) both;
          }
        `}</style>
        
        {/* ダイナミック背景レイヤー */}
        <div className={`absolute inset-0 bg-gradient-to-b ${backgroundInfo.gradient} transition-colors duration-1000 -z-20`} />
        <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 pb-4 opacity-60 pointer-events-none -z-10 overflow-hidden">
          {backgroundInfo.visibleItems.map((item, i) => (
            <span key={i} className="text-2xl animate-fade-in-up transition-all duration-500">{item}</span>
          ))}
        </div>

        {/* 残り時間減少時の赤枠点滅演出 */}
        {isLowTime && (
          <div className="fixed inset-0 border-4 border-red-500/60 z-50 pointer-events-none animate-pulse" />
        )}

        {showHighScoreToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-sm font-bold px-4 py-2 rounded-full shadow-lg z-20 animate-fade-in-down">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <span>新記録！</span>
            </div>
          </div>
        )}
        {showCloseToHighScoreToast && !showHighScoreToast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg z-20 animate-fade-in-down">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <span>ハイスコアまであと少し！</span>
            </div>
          </div>
        )}
        <div className="max-w-md w-full mx-auto flex flex-col">
          {/* 上部固定: タイマー & スコア */}
          <div className="flex-shrink-0 mb-1">
            <div className="flex justify-between items-center mb-1">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                isLowTime ? "bg-red-100 dark:bg-red-900/40 animate-pulse" : "bg-slate-100 dark:bg-slate-800"
              }`}>
                <span className="text-base emoji-icon">⏱️</span>
                <span className={`text-lg font-bold ${isLowTime ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"}`}>
                  {isUnlimited ? `${timeLeft}s` : timeLeft}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {feedback?.show && !feedback.correct && (
                  <span className="text-xs font-bold text-red-500 animate-pulse">-10</span>
                )}
                <div className="flex items-center gap-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white px-2 py-1 rounded-full">
                  <span className="text-base emoji-icon">⭐</span>
                  <span className="text-lg font-bold">{score}</span>
                </div>
              </div>
            </div>

            {/* タイムバー */}
            {!isUnlimited && (
              <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full mb-1 overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ease-linear ${
                    isLowTime ? "bg-red-500" : "bg-gradient-to-r from-primary-400 to-accent-400"
                  }`}
                  style={{ width: `${timePercentage}%` }}
                />
              </div>
            )}

            {/* コンボ */}
            {combo >= 2 && (
              <div className="text-center">
                <span key={combo} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-bold ${
                  combo >= 5 ? "bg-gradient-to-r from-orange-500 to-red-500 animate-bounce" : "bg-gradient-to-r from-blue-500 to-primary-500"
                }`}>
                  {combo >= 5 ? "🔥" : "⚡"} {combo}連続正解！
                  <span className="opacity-80">×{Math.min(Math.pow(2, combo - 1), 16)}</span>
                </span>
              </div>
            )}
            {!combo && showComboLost && (
              <div className="text-center animate-pulse">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-400 text-white text-xs font-bold">
                  💔 Combo Lost...
                </span>
              </div>
            )}
            {showComboMilestone && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 drop-shadow-lg animate-bounce scale-150">
                  {showComboMilestone}
                </div>
              </div>
            )}
            {showComebackEffect && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500 drop-shadow-lg animate-bounce scale-110 whitespace-nowrap">
                  🔥 逆転チャンス！
                </div>
              </div>
            )}
          </div>

          {/* 中央: 問題カード */}
          <Card className={`!p-3 transition-all flex flex-col relative ${
            feedback?.show
              ? feedback.correct
                ? "ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20 scale-105"
                : "ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20 animate-shake"
              : comboEffectClass
          }`}>
            <div className="text-center mb-2">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">
                {isEnToJa ? "この単語の意味は?" : "この意味の英単語は?"}
              </p>
              <div className="flex items-center justify-center gap-1.5 relative min-h-[2.5rem]">
                <h2 className="text-2xl font-bold text-gradient">
                  {isEnToJa ? question.word.word : question.word.meaning}
                </h2>
                {!isEnToJa && isMobileRef.current && isSpeechRecognitionSupported && voiceInputEnabled && (
                  <div className="flex flex-col items-center ml-2 relative">
                    {/* タップでON/OFFトグル。長押し不要なのでコンテキストメニューが出ない */}
                    <button
                      ref={speakButtonRef}
                      onClick={handleSpeakToggle}
                      onContextMenu={(e) => e.preventDefault()}
                      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none', touchAction: 'manipulation' }}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                        isListening
                          ? "bg-blue-500 text-white dark:bg-blue-600"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      }`}
                      aria-label={isListening ? "タップして停止" : "タップして話す"}
                      title={isListening ? "タップして停止" : "タップして話す"}
                    >
                      {/* aria-hidden で絵文字を非インタラクティブ化し Chrome の画像長押しメニューを抑止 */}
                      <span aria-hidden="true" style={{ pointerEvents: 'none', userSelect: 'none' }}>🎙️</span>
                      <span style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        {isListening ? "今すぐ話して" : "話す"}
                      </span>
                    </button>
                    {recognizedText && (
                      <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[10px] px-2 py-0.5 rounded-full z-10 animate-fade-in ${
                        recognizedText.isCorrect
                          ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                      }`}>
                        {recognizedText.text}
                      </span>
                    )}
                  </div>
                )}
                {isListening && !isEnToJa && !isMobileRef.current && (
                  <div className="flex flex-col items-center ml-2">
                    <span className="animate-pulse text-blue-500" title="音声認識中">
                      🎙️
                    </span>
                    {recognizedText && (
                      <span className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap text-[10px] px-2 py-0.5 rounded-full z-10 animate-fade-in ${
                        recognizedText.isCorrect
                          ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300"
                      }`}>
                        {recognizedText.text}
                      </span>
                    )}
                  </div>
                )}
                {isEnToJa && <SpeakButton text={question.word.word} size="sm" />}
              </div>
            </div>

            {/* 音声入力手動切り替えボタン */}
            {isSpeechRecognitionSupported && !isEnToJa && (
              <button
                onClick={handleVoiceInputToggle}
                className={`absolute right-2 top-2 p-2 rounded-full transition-colors ${
                  voiceInputEnabled
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
                title={voiceInputEnabled ? "音声入力停止" : "音声入力開始"}
              >
                {voiceInputEnabled ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg>
                )}
              </button>
            )}

            {/* 選択肢 */}
            <div className="flex flex-col gap-1.5 mt-2">
              {question.choices.map((choice, index) => (
                <button
                  key={`${question.word.id}-${index}`}
                  onClick={() => handleSelect(choice)}
                  className="p-2 text-left text-xs bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg font-medium hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 active:scale-95 transition-all"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span>{choice}</span>
                  </span>
                </button>
              ))}
            </div>

            {isUnlimited && (
              <div className="mt-3">
                <Button variant="secondary" size="sm" fullWidth onClick={endGame}>終了して結果を見る</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // 結果画面
  if (gameState === "finished") {
    const title = getSpeedChallengeTitle(score, maxCombo, correctCount, totalQuestions);
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const filteredAnsweredWords = answeredWords.filter((word) => {
      if (wordFilter === "correct") return word.correct;
      if (wordFilter === "incorrect") return !word.correct;
      return true;
    });
    const { width, height } = windowSize;

    return (
      <div className="main-content px-3 py-2 flex flex-col">
        {isNewHighScore && (
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={400}
            tweenDuration={10000}
          />
        )}
        <div className="max-w-md w-full mx-auto flex flex-col h-full">
          {/* 上部固定: スコアサマリー */}
          <div className="flex-shrink-0 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-card p-2 mb-2">
            {isNewHighScore && (
              <div className="mb-1 p-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg border border-yellow-300 dark:border-yellow-800/40">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-base emoji-icon">🎉</span>
                  <p className="text-[10px] font-bold text-yellow-700 dark:text-yellow-300">
                    新記録
                    {scoreDiff > 0 && <span className="ml-1 text-orange-600 dark:text-orange-400">(+{scoreDiff})</span>}
                  </p>
                </div>
              </div>
            )}
            {mode === 'ja-to-en-speaking' && tapAnswerOnVoiceQuestionRef.current > 0 && (
              <div className="mb-1 p-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/40">
                <p className="text-[10px] text-blue-600 dark:text-blue-400">
                  {isMobileRef.current ? "タップ" : "クリック"}回答 {tapAnswerOnVoiceQuestionRef.current} 問あり — 全問スピーキングで回答するとハイスコア対象になります
                </p>
              </div>
            )}
            {mode === 'ja-to-en-speaking' && tapAnswerOnVoiceQuestionRef.current === 0 && (
              <div className="mb-1 p-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/40">
                <p className="text-[10px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                  全問スピーキングで回答！ハイスコア対象
                </p>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl emoji-icon">{title.emoji}</span>
              <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title.text}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-[10px]">結果</p>
            </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-lg p-1.5">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">スコア</p>
                <p className="text-2xl font-bold text-gradient">{score}<span className="text-sm font-normal ml-0.5">pt</span></p>
              </div>
              {ranking ? (
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">今日のランキング</p>
                  <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                    {ranking.rank}<span className="text-[10px] font-normal">位</span> / {ranking.total}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">今日のランキング</p>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500">未集計</p>
                </div>
              )}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-1.5 flex items-center justify-center gap-1">
                <span className="text-base">✨</span>
                <p className="text-xs font-bold text-blue-600 dark:text-blue-400">+{earnedXp} XP</p>
              </div>
              {levelUp ? (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-lg p-1.5 flex items-center justify-center gap-1">
                  <span className="text-base">🆙</span>
                  <p className="text-[10px] font-bold text-yellow-800 dark:text-yellow-300">
                    Lv {levelUp.from} → {levelUp.to}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">レベル</p>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">変化なし</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-1.5">
                <p className="text-base font-bold text-slate-700 dark:text-slate-200">{correctCount}/{totalQuestions}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">正解/回答</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-1.5">
                <p className="text-base font-bold text-slate-700 dark:text-slate-200">{accuracy}%</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">正答率</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-md p-1.5">
                <p className="text-base font-bold text-slate-700 dark:text-slate-200">{maxCombo}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">最大コンボ</p>
              </div>
            </div>
          </div>

          {/* 中央スクロール可能エリア: 出題された全単語一覧 */}
          {answeredWords.length > 0 && (
            <div className="flex-1 overflow-y-auto min-h-0 mb-2 bg-white dark:bg-slate-800 rounded-xl shadow-card p-2">
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">出題単語一覧</p>
                <div className="flex items-center gap-1 text-[10px] font-bold">
                  <button onClick={() => setWordFilter("all")} className={`px-2 py-0.5 rounded-full transition-colors ${wordFilter === "all" ? "bg-primary-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"}`}>すべて</button>
                  <button onClick={() => setWordFilter("correct")} className={`px-2 py-0.5 rounded-full transition-colors ${wordFilter === "correct" ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"}`}>正解</button>
                  <button onClick={() => setWordFilter("incorrect")} className={`px-2 py-0.5 rounded-full transition-colors ${wordFilter === "incorrect" ? "bg-red-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"}`}>不正解</button>
                </div>
              </div>
              <div className="space-y-1.5">
                {filteredAnsweredWords.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                      {wordFilter === 'correct' && '正解した単語はありません。'}
                      {wordFilter === 'incorrect' && '不正解の単語はありません。'}
                    </p>
                  </div>
                )}
                {filteredAnsweredWords.map((word, index) => {
                  const isRevealed = revealedWords.has(index);
                  return (
                    <div
                      key={`${word.id}-${index}`}
                      className={`flex items-center justify-between p-1.5 rounded-lg border transition-all ${
                        word.correct
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800/40"
                          : "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800/40"
                      }`}
                    >
                      <div
                        className="flex items-center gap-1.5 flex-1 cursor-pointer group"
                        onClick={() => {
                          setRevealedWords(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(index)) newSet.delete(index);
                            else newSet.add(index);
                            return newSet;
                          });
                        }}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                            word.correct
                              ? "bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {word.correct ? "✓" : "✗"}
                        </div>
                        <SpeakButton text={word.word} size="sm" />
                        <div className="text-left">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-xs group-hover:text-primary-600 transition-colors">
                            {word.word}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 h-3">
                            {isRevealed ? word.meaning : 'タップして意味を表示'}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/word/${word.id}?from=speed`}
                        onClick={() => saveWordNavState(answeredWords.map((w) => w.id), "speed")}
                        className="flex-shrink-0 p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-primary-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        title="単語詳細へ"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 下部固定: アクションボタン */}
          <div className="flex-shrink-0 space-y-1.5">
            {answeredWords.some(w => !w.correct) && (
              <Button size="sm" variant="secondary" fullWidth onClick={handleRetryIncorrect}>
                不正解だけを復習する
              </Button>
            )}
            <div className="grid grid-cols-3 gap-1.5">
              {isShareSupported && (
                <Button size="sm" variant="outline" fullWidth onClick={handleShare}>
                  共有
                </Button>
              )}
              <Link href="/" className="block">
                <Button size="sm" variant="secondary" fullWidth onClick={() => clearSpeedResultState()}>
                  ホーム
                </Button>
              </Link>
              <Button size="sm" fullWidth onClick={startGame}>
                再挑戦
              </Button>
            </div>
          </div>
        </div>

        {showingAchievement && (
          <AchievementUnlockPopup
            achievement={showingAchievement}
            onClose={handleAchievementClose}
          />
        )}

        {/* 全問正解ポップアップ */}
        {showPerfectScore && (
          <PerfectScorePopup
            mode="speed"
            onClose={() => dispatch({ type: "CLOSE_PERFECT_SCORE" })}
          />
        )}
      </div>
    );
  }

  return null;
}
