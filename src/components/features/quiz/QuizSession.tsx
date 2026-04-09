import { useState, useEffect, useCallback, Dispatch, SetStateAction, MutableRefObject } from "react";
import { Card, Button, ProgressBar, SpeakButton } from "@/components/ui";
import { Question } from "@/types";
// import { CATEGORY_EMOJIS, getCategoryGradient } from "@/lib/image"; // TODO: SD画像一括生成後に再有効化
import { getQuestionPrompt, getQuestionDisplay } from "@/lib/quiz/display";
import { parseDictationParts } from "@/lib/quiz/generator";
import { getTranslationInfo } from "@/lib/quiz/translation";
import { getMasterMeaning } from "@/lib/word-lookup";
import { InQuizSettings, AudioMode } from "@/lib/quiz/in-quiz-settings";
import { speakSentence } from "@/lib/audio";

type QuizSessionProps = {
  questions: Question[];
  currentIndex: number;
  score: number;
  combo: number;
  currentQuestion: Question;
  selected: string | null;
  isCorrect: boolean | null;
  dictationInputs: string[];
  setDictationInputs: Dispatch<SetStateAction<string[]>>;
  dictationInputRefs: MutableRefObject<(HTMLInputElement | null)[]>;
  showTranslation: boolean;
  setShowTranslation: Dispatch<SetStateAction<boolean>>;
  handleNext: () => void;
  handleSelect: (choice: string) => void;
  handleDictationSubmit: () => void;
  isSpeechRecognitionSupported: boolean;
  isListening: boolean;
  recognizedText: { text: string; isCorrect: boolean } | null;
  isMobile: boolean;
  handleSpeakStart: () => void;
  handleSpeakingSkip: () => void;
  inQuizSettings: InQuizSettings;
  setInQuizSettings: Dispatch<SetStateAction<InQuizSettings>>;
  onSuspend: () => void;
  onSaveProgress: () => boolean;
};

// US / UK 発音ボタンを並べて表示
const WordAudioButtons = ({ word }: { word: string }) => (
  <div className="inline-flex items-center gap-2 mt-1">
    <div className="flex items-center gap-0.5">
      <SpeakButton text={word} variant="us" size="sm" />
      <span className="text-[9px] text-slate-400 dark:text-slate-500 select-none">US</span>
    </div>
    <div className="flex items-center gap-0.5">
      <SpeakButton text={word} variant="uk" size="sm" />
      <span className="text-[9px] text-slate-400 dark:text-slate-500 select-none">UK</span>
    </div>
  </div>
);

// 音声モード別アイコン
const AudioIcon = ({ mode }: { mode: AudioMode }) => {
  if (mode === "off") {
    return (
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>
    );
  }
  if (mode === "button") {
    return (
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
    );
  }
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072M12.728 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );
};

// 和訳表示アイコン（目）
const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

// 再生回数制限付き音声ボタン
const LimitedPlayButton = ({
  atLimit,
  remaining,
  disabled,
  onClick,
}: {
  atLimit: boolean;
  remaining: number;
  disabled: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    disabled={disabled || atLimit}
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
      atLimit
        ? "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
        : "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800/40"
    }`}
  >
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
      {atLimit
        ? <path d="M11 5L6 9H2v6h4l5 4V5zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        : <path d="M11 5L6 9H2v6h4l5 4V5zM15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
      }
    </svg>
    {atLimit ? "再生終了" : `聞く（あと${remaining}回）`}
  </button>
);

export const QuizSession = ({
  questions,
  currentIndex,
  score,
  combo,
  currentQuestion,
  selected,
  isCorrect,
  dictationInputs,
  setDictationInputs,
  dictationInputRefs,
  showTranslation,
  setShowTranslation,
  handleNext,
  handleSelect,
  handleDictationSubmit,
  isSpeechRecognitionSupported,
  isListening,
  recognizedText,
  isMobile,
  handleSpeakStart,
  handleSpeakingSkip,
  inQuizSettings,
  setInQuizSettings,
  onSuspend,
  onSaveProgress,
}: QuizSessionProps) => {
  const [hintRevealed, setHintRevealed] = useState(false);

  // 問題が変わったらヒント表示をリセット
  useEffect(() => {
    setHintRevealed(false);
  }, [currentIndex]);

  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (window.location.pathname === href || window.location.href === anchor.href) return;
      event.preventDefault();
      event.stopPropagation();
      onSaveProgress();
      window.location.href = anchor.href;
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [onSaveProgress]);

  // 回答後の自動次へ
  useEffect(() => {
    if (selected === null) return;
    if (inQuizSettings.autoAdvanceMode === "instant") {
      const timer = setTimeout(() => handleNext(), 0);
      return () => clearTimeout(timer);
    }
    if (inQuizSettings.autoAdvanceMode === "timed") {
      const timer = setTimeout(() => handleNext(), inQuizSettings.autoAdvanceMs);
      return () => clearTimeout(timer);
    }
  }, [selected, inQuizSettings.autoAdvanceMode, inQuizSettings.autoAdvanceMs, handleNext]);

  const questionDisplay = currentQuestion ? getQuestionDisplay(currentQuestion) : "";
  const isSentenceType = currentQuestion.type === "listening" || currentQuestion.type === "dictation";
  const sentenceAudioMode = currentQuestion.type === "listening"
    ? inQuizSettings.listeningAudioMode
    : inQuizSettings.writingAudioMode;

  // 書き取り問題: 例文をパーツに分割（ブランク数チェックにも使用）
  const dictationParts =
    currentQuestion.type === "dictation" && currentQuestion.word.example
      ? parseDictationParts(currentQuestion.word.example, currentQuestion.word.word)
      : [];
  const dictationBlankCount = dictationParts.filter((p) => p.kind === "blank").length;

  // インライン音声トグル
  const audioModeKey =
    currentQuestion.type === "listening" ? "listeningAudioMode"
    : currentQuestion.type === "dictation" ? "writingAudioMode"
    : currentQuestion.type === "speaking" ? "speakingAudioMode"
    : "readingAudioMode";
  const currentAudioMode = inQuizSettings[audioModeKey];

  const handleAudioCycle = () => {
    const next: AudioMode =
      currentAudioMode === "off" ? "button" : currentAudioMode === "button" ? "auto" : "off";
    setInQuizSettings((prev) => ({ ...prev, [audioModeKey]: next }));
  };

  // 問題タイプに応じた和訳モードを選択
  const effectiveTranslationMode =
    currentQuestion.type === "listening"
      ? inQuizSettings.listeningTranslationMode
      : inQuizSettings.writingTranslationMode;

  // 書き取り問題のフォールバック
  // 音声も和訳も OFF → 和訳を強制表示（例文を見て書き取るのが基本形）
  const dictationForceTranslation =
    currentQuestion.type === "dictation" &&
    currentAudioMode === "off" &&
    inQuizSettings.writingTranslationMode === "none";
  // 和訳がOFF・音声あり → 音声を自動再生に昇格（聞いて書き取る練習）
  const dictationForceAutoAudio =
    currentQuestion.type === "dictation" &&
    inQuizSettings.writingTranslationMode === "none" &&
    currentAudioMode === "button";
  const effectiveSentenceAudioMode: AudioMode =
    dictationForceAutoAudio ? "auto" : sentenceAudioMode;

  // 書き取り音声の再生回数トラッキング
  const [dictationPlayCount, setDictationPlayCount] = useState(0);
  useEffect(() => {
    if (currentQuestion.type !== "dictation") return;
    // 自動再生が発火する場合は初期カウントを1にする
    const willAutoPlay =
      inQuizSettings.writingAudioMode === "auto" ||
      (inQuizSettings.writingTranslationMode === "none" && inQuizSettings.writingAudioMode === "button");
    setDictationPlayCount(willAutoPlay ? 1 : 0);
  // currentIndex が変わるたびにリセット
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const dictationPlayLimit = inQuizSettings.dictationAudioPlayLimit;
  const dictationAtPlayLimit = dictationPlayLimit !== null && dictationPlayCount >= dictationPlayLimit;

  const handleDictationPlay = useCallback(() => {
    if (dictationAtPlayLimit || !currentQuestion.word.example) return;
    speakSentence(currentQuestion.word.example);
    setDictationPlayCount((prev) => prev + 1);
  }, [dictationAtPlayLimit, currentQuestion]);

  // リスニング音声の再生回数トラッキング
  const [listeningPlayCount, setListeningPlayCount] = useState(0);
  useEffect(() => {
    if (currentQuestion.type !== "listening") return;
    // 自動再生が発火する場合は初期カウントを1にする
    const willAutoPlay = inQuizSettings.listeningAudioMode === "auto";
    setListeningPlayCount(willAutoPlay ? 1 : 0);
  // currentIndex が変わるたびにリセット
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  const listeningPlayLimit = inQuizSettings.listeningAudioPlayLimit;
  const listeningAtPlayLimit = listeningPlayLimit !== null && listeningPlayCount >= listeningPlayLimit;

  const handleListeningPlay = useCallback(() => {
    if (listeningAtPlayLimit || !currentQuestion.word.example) return;
    speakSentence(currentQuestion.word.example);
    setListeningPlayCount((prev) => prev + 1);
  }, [listeningAtPlayLimit, currentQuestion]);

  // インライン訳トグル（sentence types のみ）
  const translationModeKey =
    currentQuestion.type === "listening" ? "listeningTranslationMode" : "writingTranslationMode";
  const isTranslationOn = effectiveTranslationMode !== "none";
  const handleTranslationToggle = () => {
    if (effectiveTranslationMode === "none") {
      setShowTranslation(true);
      setInQuizSettings((prev) => ({ ...prev, [translationModeKey]: "always" }));
    } else {
      setShowTranslation(false);
      setInQuizSettings((prev) => ({ ...prev, [translationModeKey]: "none" }));
    }
  };

  return (
    <div className="main-content px-2 py-1.5 flex flex-col">
      <div className="max-w-md w-full mx-auto flex flex-col">
        {/* 上部固定: Progress & Score */}
        <div className="flex-shrink-0 mb-1">
          <div className="mb-1">
            <ProgressBar current={currentIndex + 1} total={questions.length} />
          </div>

          <div className="relative flex justify-center gap-1.5 items-center">
            <button
              type="button"
              onClick={onSuspend}
              className="absolute left-0 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              中断
            </button>
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

        {/* 中央: Question Card */}
        <div>
          <Card className="flex flex-col p-2">
            {/* カテゴリ表示 + インライン設定ボタン */}
            <div className="flex items-center gap-1.5 mb-1">
              {/* TODO: Stable Diffusion 一括生成後に再有効化
              {currentQuestion.word.category && (
                <div className={`flex-1 h-7 rounded-md bg-gradient-to-br ${getCategoryGradient(currentQuestion.word.category)} flex items-center justify-center border border-slate-100 dark:border-slate-700`}>
                  <span className="text-lg emoji-icon">{CATEGORY_EMOJIS[currentQuestion.word.category] || "📝"}</span>
                </div>
              )}
              */}
              {/* 🔊 音声チップ: OFF/手動/自動 をタップで切り替え */}
              <button
                type="button"
                onClick={handleAudioCycle}
                title="音声モードを切り替え（OFF → 手動 → 自動）"
                className={`inline-flex items-center gap-1 h-7 px-2 rounded-full text-[11px] font-semibold border transition-colors flex-shrink-0 ${
                  currentAudioMode === "auto"
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600"
                    : currentAudioMode === "button"
                      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600"
                      : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-500"
                }`}
              >
                <AudioIcon mode={currentAudioMode} />
                <span>{currentAudioMode === "auto" ? "自動" : currentAudioMode === "button" ? "手動" : "OFF"}</span>
              </button>
              {/* 👁 和訳チップ（sentence types のみ）: ON/OFF をタップで切り替え */}
              {isSentenceType && (
                <button
                  type="button"
                  onClick={handleTranslationToggle}
                  title={isTranslationOn ? "和訳を隠す" : "和訳を表示"}
                  className={`inline-flex items-center gap-1 h-7 px-2 rounded-full text-[11px] font-semibold border transition-colors flex-shrink-0 ${
                    isTranslationOn
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600"
                      : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-500"
                  }`}
                >
                  <EyeIcon open={isTranslationOn} />
                  <span>{isTranslationOn ? "和訳" : "和訳"}</span>
                </button>
              )}
            </div>

            <div className="text-center mb-1">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">{getQuestionPrompt(currentQuestion.type)}</p>

              {/* 書き取り問題（未回答時）: 例文中にインライン入力フィールドを埋め込む */}
              {currentQuestion.type === "dictation" && selected === null && dictationBlankCount > 0 ? (
                <div className="flex flex-wrap items-baseline justify-center gap-x-0.5 gap-y-2 font-bold text-sm text-slate-700 dark:text-slate-200 leading-loose px-1">
                  {dictationParts.map((part, i) => {
                    if (part.kind === "text") {
                      return <span key={i} className="text-gradient">{part.content}</span>;
                    }
                    const wordIndex = part.wordIndex;
                    const correctWord = currentQuestion.correctAnswer.split(/\s+/)[wordIndex] ?? "";
                    return (
                      <input
                        key={`${currentIndex}-${i}`}
                        ref={(el) => { dictationInputRefs.current[wordIndex] = el; }}
                        type="text"
                        autoFocus={wordIndex === 0}
                        value={dictationInputs[wordIndex] ?? ""}
                        onChange={(e) => {
                          setDictationInputs((prev) => {
                            const next = [...prev];
                            next[wordIndex] = e.target.value;
                            return next;
                          });
                        }}
                        onKeyDown={(e) => {
                          const answerWords = currentQuestion.correctAnswer.split(/\s+/);
                          if (e.key === "Tab") {
                            e.preventDefault();
                            const nextIdx = (wordIndex + 1) % answerWords.length;
                            dictationInputRefs.current[nextIdx]?.focus();
                          } else if (e.key === "Enter") {
                            e.stopPropagation();
                            handleDictationSubmit();
                          }
                        }}
                        className="border-b-2 border-primary-400 dark:border-primary-500 bg-transparent text-center text-base leading-[1.4] font-bold text-primary-700 dark:text-primary-300 focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 transition-colors"
                        style={{ width: `${Math.max(4, correctWord.length + 2)}ch` }}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        inputMode="text"
                        lang="en"
                      />
                    );
                  })}
                </div>
              ) : (
                <h2 className={`font-bold text-gradient ${isSentenceType ? "text-xs leading-relaxed" : "text-lg"}`}>
                  {questionDisplay}
                </h2>
              )}

              {/* スピーキング問題: ヒント表示 */}
              {currentQuestion.type === "speaking" && selected === null && (() => {
                if (inQuizSettings.hintMode === "always") {
                  return (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      💡 {currentQuestion.word.word}
                    </p>
                  );
                }
                if (inQuizSettings.hintMode === "reveal") {
                  return hintRevealed ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      💡 {currentQuestion.word.word}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setHintRevealed(true)}
                      className="text-[10px] text-primary-500 hover:text-primary-600 underline mt-0.5 transition-colors"
                    >
                      💡 ヒントを見る
                    </button>
                  );
                }
                return null;
              })()}

              {/* en-to-ja: US/UK 発音ボタン */}
              {currentQuestion.type === "en-to-ja" && inQuizSettings.readingAudioMode !== "off" && (
                <WordAudioButtons word={currentQuestion.word.word} />
              )}
              {/* speaking: US/UK 発音ボタン（発音練習の参考に） */}
              {currentQuestion.type === "speaking" && inQuizSettings.speakingAudioMode !== "off" && selected === null && (
                <WordAudioButtons word={currentQuestion.word.word} />
              )}
              {/* リスニング・書き取り: 例文音声ボタン */}
              {isSentenceType && currentQuestion.word.example && effectiveSentenceAudioMode !== "off" && (
                <div className="mt-1 flex justify-center">
                  {currentQuestion.type === "dictation" && dictationPlayLimit !== null ? (
                    // 書き取り: 再生回数制限付きボタン
                    <LimitedPlayButton
                      atLimit={dictationAtPlayLimit}
                      remaining={dictationPlayLimit - dictationPlayCount}
                      disabled={selected !== null}
                      onClick={handleDictationPlay}
                    />
                  ) : currentQuestion.type === "listening" && listeningPlayLimit !== null ? (
                    // リスニング: 再生回数制限付きボタン
                    <LimitedPlayButton
                      atLimit={listeningAtPlayLimit}
                      remaining={listeningPlayLimit - listeningPlayCount}
                      disabled={selected !== null}
                      onClick={handleListeningPlay}
                    />
                  ) : (
                    <SpeakButton text={currentQuestion.word.example} type="sentence" size="sm" />
                  )}
                </div>
              )}
              {/* リスニング・書き取り: 和訳表示 */}
              {isSentenceType && selected === null && (() => {
                const translationInfo = getTranslationInfo(currentQuestion.word.id, currentQuestion.word.example);
                const shouldShowTranslation =
                  dictationForceTranslation
                  || effectiveTranslationMode === "always"
                  || (effectiveTranslationMode === "reveal" && showTranslation);
                return shouldShowTranslation && translationInfo.sentenceJa ? (
                  <p className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 rounded-md p-1.5 text-center">
                    {translationInfo.sentenceJa}
                  </p>
                ) : null;
              })()}
            </div>

            {/* 書き取り問題: 回答ボタン */}
            {currentQuestion.type === "dictation" ? (
              <div className="flex flex-col gap-2 mt-2">
                {selected === null ? (
                  <Button
                    fullWidth
                    size="sm"
                    onClick={handleDictationSubmit}
                    disabled={
                      dictationBlankCount === 0 ||
                      !currentQuestion.correctAnswer
                        .split(/\s+/)
                        .every((_, i) => (dictationInputs[i] ?? "").trim() !== "")
                    }
                  >
                    回答する
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">あなたの回答</p>
                    <p className={`text-sm font-bold ${isCorrect ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"}`}>
                      {selected}
                    </p>
                  </div>
                )}
              </div>
            ) : currentQuestion.type === "speaking" ? (
              /* スピーキング問題 */
              <div className="flex flex-col gap-2 mt-2">
                {selected === null ? (
                  isSpeechRecognitionSupported ? (
                    /* 音声認識あり: マイク UI */
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-full text-center py-2 px-3 rounded-lg text-xs min-h-[2.5rem] flex items-center justify-center ${
                        isListening
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400"
                          : recognizedText
                            ? (recognizedText.isCorrect
                                ? "bg-success-50 dark:bg-success-900/20 border border-success-200 text-success-600 dark:text-success-400"
                                : "bg-error-50 dark:bg-error-900/20 border border-error-200 text-error-600 dark:text-error-400")
                            : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-400"
                      }`}>
                        {isListening ? (
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            認識中...
                          </span>
                        ) : recognizedText ? (
                          <span>{recognizedText.text}</span>
                        ) : (
                          <span>ここに認識結果が表示されます</span>
                        )}
                      </div>
                      <div className="flex gap-2 w-full">
                        <Button
                          fullWidth
                          size="sm"
                          onClick={handleSpeakStart}
                          className={isListening ? "opacity-50 pointer-events-none" : ""}
                        >
                          <span className="flex items-center justify-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                            </svg>
                            {isMobile ? "話す" : "もう一度"}
                          </span>
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleSpeakingSkip} className="flex-shrink-0">
                          スキップ
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* 音声認識非対応: ja-to-en 選択肢にフォールバック */
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center">
                        {/iPhone|iPad|iPod/.test(typeof window !== "undefined" ? navigator.userAgent : "")
                          ? "音声入力はSafariのみ対応"
                          : "このブラウザは音声認識非対応"}
                      </p>
                      {currentQuestion.choices.map((choice, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelect(choice)}
                          className="choice-btn py-1.5"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-xs">{choice}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">あなたの回答</p>
                    <p className={`text-sm font-bold ${isCorrect ? "text-success-600 dark:text-success-400" : "text-error-600 dark:text-error-400"}`}>
                      {selected}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* リスニング・英→日・日→英: 選択肢ボタン */
              <div className="flex flex-col gap-2 mt-2">
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
                          {index + 1}
                        </span>
                        <span className="text-xs">{choice}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
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
                    <div className="text-[10px] text-slate-600 dark:text-slate-300">
                      <p className="truncate">
                        正解: <span className="text-primary-600 dark:text-primary-400 font-bold">{currentQuestion.correctAnswer}</span>
                        {currentQuestion.type !== "en-to-ja" && (
                          <span className="text-slate-500 dark:text-slate-400 ml-1">({currentQuestion.word.meaning})</span>
                        )}
                      </p>
                      {(() => {
                        const masterMeaning = getMasterMeaning(currentQuestion.word.id);
                        if (masterMeaning && masterMeaning !== currentQuestion.word.meaning && masterMeaning.includes("・")) {
                          return (
                            <p className="text-slate-400 dark:text-slate-500 truncate">
                              他の意味: {masterMeaning}
                            </p>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  <SpeakButton
                    text={currentQuestion.word.example || currentQuestion.word.word}
                    type={currentQuestion.word.example ? "sentence" : "word"}
                    size="sm"
                  />
                </div>
                {currentQuestion.word.example && (() => {
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
};
