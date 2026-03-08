import { useState, useEffect, Dispatch, SetStateAction, MutableRefObject } from "react";
import { Card, Button, ProgressBar, SpeakButton } from "@/components/ui";
import { Question } from "@/types";
import { CATEGORY_EMOJIS, getCategoryGradient } from "@/lib/image";
import { getQuestionPrompt, getQuestionDisplay } from "@/lib/quiz/display";
import { parseDictationParts } from "@/lib/quiz/generator";
import { getTranslationInfo } from "@/lib/quiz/translation";
import { InQuizSettings, SpeakingDifficulty, HintMode, AudioMode, AutoAdvanceMode } from "@/lib/quiz/in-quiz-settings";

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
};

// セグメントボタングループ
const SegmentGroup = <T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) => (
  <div className="flex gap-1.5">
    {options.map(({ value: v, label }) => (
      <button
        key={String(v)}
        type="button"
        onClick={() => onChange(v)}
        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          value === v
            ? "bg-primary-500 text-white"
            : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

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

const DIFFICULTY_OPTIONS: { value: SpeakingDifficulty; label: string }[] = [
  { value: "easy", label: "入門" },
  { value: "normal", label: "標準" },
  { value: "strict", label: "ネイティブ" },
];

const AUDIO_MODE_OPTIONS: { value: AudioMode; label: string }[] = [
  { value: "off", label: "OFF" },
  { value: "button", label: "ボタン" },
  { value: "auto", label: "ON" },
];

const HINT_MODE_OPTIONS: { value: HintMode; label: string }[] = [
  { value: "none", label: "なし" },
  { value: "reveal", label: "ボタン表示" },
  { value: "always", label: "常時表示" },
];

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
}: QuizSessionProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);

  // 問題が変わったらヒント表示をリセット
  useEffect(() => {
    setHintRevealed(false);
  }, [currentIndex]);

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

  // 書き取り問題: 例文をパーツに分割（ブランク数チェックにも使用）
  const dictationParts =
    currentQuestion.type === "dictation" && currentQuestion.word.example
      ? parseDictationParts(currentQuestion.word.example, currentQuestion.word.word)
      : [];
  const dictationBlankCount = dictationParts.filter((p) => p.kind === "blank").length;

  // timedモード時の表示用ラベル
  const timedLabel = `${(inQuizSettings.autoAdvanceMs / 1000).toFixed(1)}秒後`;
  const autoAdvanceModeOptions: { value: AutoAdvanceMode; label: string }[] = [
    { value: "off", label: "OFF" },
    { value: "timed", label: inQuizSettings.autoAdvanceMode === "timed" ? timedLabel : "秒数設定" },
    { value: "instant", label: "即時" },
  ];

  return (
    <div className="main-content px-2 py-1.5 flex flex-col">
      <div className="max-w-md w-full mx-auto flex flex-col">
        {/* 上部固定: Progress & Score */}
        <div className="flex-shrink-0 mb-1">
          <div className="mb-1">
            <ProgressBar current={currentIndex + 1} total={questions.length} />
          </div>

          <div className="relative flex justify-center gap-1.5 items-center">
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
            {/* 設定ギアボタン */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="absolute right-0 w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
              aria-label="クイズ設定"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* 中央: Question Card */}
        <div>
          <Card className="flex flex-col p-2">
            {/* カテゴリ表示（コンパクト） */}
            {currentQuestion.word.category && (
              <div className={`w-full h-7 mb-1 rounded-md bg-gradient-to-br ${getCategoryGradient(currentQuestion.word.category)} flex items-center justify-center border border-slate-100 dark:border-slate-700`}>
                <span className="text-lg emoji-icon">{CATEGORY_EMOJIS[currentQuestion.word.category] || "📝"}</span>
              </div>
            )}

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
              {currentQuestion.type === "en-to-ja" && inQuizSettings.audioMode !== "off" && (
                <WordAudioButtons word={currentQuestion.word.word} />
              )}
              {/* speaking: US/UK 発音ボタン（発音練習の参考に） */}
              {currentQuestion.type === "speaking" && inQuizSettings.audioMode !== "off" && selected === null && (
                <WordAudioButtons word={currentQuestion.word.word} />
              )}
              {/* リスニング・書き取り: 例文音声ボタン */}
              {isSentenceType && currentQuestion.word.example && inQuizSettings.audioMode !== "off" && (
                <div className="mt-1">
                  <SpeakButton text={currentQuestion.word.example} type="sentence" size="sm" />
                </div>
              )}
              {/* リスニング・書き取り: 和訳表示トグル */}
              {isSentenceType && selected === null && (() => {
                const translationInfo = getTranslationInfo(currentQuestion.word.id, currentQuestion.word.example);
                return (
                  <div className="mt-1 text-center">
                    <button
                      type="button"
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
                              {String.fromCharCode(65 + index)}
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
                          {String.fromCharCode(65 + index)}
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

      {/* クイズ中設定パネル */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full bg-white dark:bg-slate-800 rounded-t-2xl p-4 pb-6 shadow-xl max-w-md mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">クイズ中の設定</h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* スピーキング難易度 */}
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">スピーキング難易度</p>
                <SegmentGroup
                  options={DIFFICULTY_OPTIONS}
                  value={inQuizSettings.speakingDifficulty}
                  onChange={(v) => setInQuizSettings((prev) => ({ ...prev, speakingDifficulty: v }))}
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {inQuizSettings.speakingDifficulty === "strict" && "完全一致のみ正解"}
                  {inQuizSettings.speakingDifficulty === "normal" && "発音が近ければ正解（標準）"}
                  {inQuizSettings.speakingDifficulty === "easy" && "多少の発音のずれも正解"}
                </p>
              </div>

              {/* ヒント（英単語表示） */}
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">ヒント（英単語）</p>
                <SegmentGroup
                  options={HINT_MODE_OPTIONS}
                  value={inQuizSettings.hintMode}
                  onChange={(v) => setInQuizSettings((prev) => ({ ...prev, hintMode: v }))}
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {inQuizSettings.hintMode === "none" && "スピーキング問題でヒントを表示しない"}
                  {inQuizSettings.hintMode === "reveal" && "ボタンを押したときだけ答えの英単語を表示"}
                  {inQuizSettings.hintMode === "always" && "常に答えの英単語を表示"}
                </p>
              </div>

              {/* 音声 */}
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">音声</p>
                <SegmentGroup
                  options={AUDIO_MODE_OPTIONS}
                  value={inQuizSettings.audioMode}
                  onChange={(v) => setInQuizSettings((prev) => ({ ...prev, audioMode: v }))}
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  {inQuizSettings.audioMode === "off" && "音声ボタンを表示しない"}
                  {inQuizSettings.audioMode === "button" && "🔊 US / UK ボタンを表示（手動再生）"}
                  {inQuizSettings.audioMode === "auto" && "問題表示時に自動再生 + ボタン表示"}
                </p>
              </div>

              {/* 回答後に自動で次へ */}
              <div>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">回答後に自動で次へ進む</p>
                <SegmentGroup
                  options={autoAdvanceModeOptions}
                  value={inQuizSettings.autoAdvanceMode}
                  onChange={(v) => setInQuizSettings((prev) => ({ ...prev, autoAdvanceMode: v }))}
                />
                {inQuizSettings.autoAdvanceMode === "timed" && (
                  <div className="flex items-center gap-3 mt-2">
                    <input
                      type="range"
                      min={500}
                      max={5000}
                      step={500}
                      value={inQuizSettings.autoAdvanceMs}
                      onChange={(e) =>
                        setInQuizSettings((prev) => ({ ...prev, autoAdvanceMs: parseInt(e.target.value) }))
                      }
                      className="flex-1 accent-primary-500"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-12 text-right tabular-nums">
                      {(inQuizSettings.autoAdvanceMs / 1000).toFixed(1)} 秒
                    </span>
                  </div>
                )}
                {inQuizSettings.autoAdvanceMode === "instant" && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">解説を表示せずに次の問題へ進みます</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
