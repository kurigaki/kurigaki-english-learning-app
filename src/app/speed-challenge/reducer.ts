import { Question, Achievement } from "@/types";
import { AnsweredWord, getSpeedResultState } from "@/lib/speed-session";

export const TIME_LIMIT = 30;
export const COMBO_BONUS_THRESHOLD = 5;

export type GameState = "ready" | "playing" | "paused" | "finished";

export interface SpeedChallengeState {
  gameState: GameState;
  timeLeft: number;
  timeLimit: number; // 0 = 無制限
  score: number;
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

export const initialState: SpeedChallengeState = {
  gameState: "ready",
  timeLeft: TIME_LIMIT,
  timeLimit: 30,
  score: 0,
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

export type Action =
  | { type: "SET_HIGH_SCORE"; payload: number }
  | { type: "RESTORE_SESSION"; payload: NonNullable<ReturnType<typeof getSpeedResultState>> }
  | { type: "START_GAME"; payload: { question: Question; timeLimit: number } }
  | { type: "SYNC_TIME"; payload: number }
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

export function speedChallengeReducer(state: SpeedChallengeState, action: Action): SpeedChallengeState {
  switch (action.type) {
    case "SET_HIGH_SCORE":
      return { ...state, highScore: action.payload };
    case "RESTORE_SESSION": {
      const { score, totalQuestions, maxCombo, isNewHighScore, answeredWords } = action.payload;
      return { ...state, gameState: "finished", score, totalQuestions, maxCombo, isNewHighScore, answeredWords, scoreDiff: 0, ranking: null, showComboLost: false, showComboMilestone: null, showComebackEffect: false };
    }
    case "START_GAME":
      return {
        ...initialState,
        timeLimit: action.payload.timeLimit,
        timeLeft: action.payload.timeLimit === 0 ? 0 : action.payload.timeLimit,
        highScore: state.highScore,
        gameState: "playing",
        question: action.payload.question,
        usedWordIds: new Set([action.payload.question.word.id]),
      };
    case "SYNC_TIME":
      if (state.timeLeft === action.payload) return state;
      return { ...state, timeLeft: action.payload };
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
      const scoreBonus = correct && newCombo >= COMBO_BONUS_THRESHOLD ? 1 : 0;
      const newScore = correct ? state.score + 1 + scoreBonus : state.score;
      const showComboLost = !correct && state.combo >= 2;
      const showComboMilestone = correct && newCombo > 0 && newCombo % 10 === 0 ? newCombo : null;
      const showComebackEffect = correct && state.timeLeft <= 5 && state.timeLeft > 0;
      return {
        ...state,
        totalQuestions: state.totalQuestions + 1,
        answeredWords: [...state.answeredWords, answeredWord],
        combo: newCombo,
        score: newScore,
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
