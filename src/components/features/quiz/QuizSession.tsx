import { Dispatch, SetStateAction, MutableRefObject } from "react";
import { Card, Button, ProgressBar, SpeakButton } from "@/components/ui";
import { Question } from "@/types";
import { CATEGORY_EMOJIS, getCategoryGradient } from "@/lib/image";
import { getQuestionPrompt, getQuestionDisplay } from "@/lib/quiz/display";
import { parseDictationParts } from "@/lib/quiz/generator";
import { getTranslationInfo } from "@/lib/quiz/translation";

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
};

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
}: QuizSessionProps) => {
  const questionDisplay = currentQuestion ? getQuestionDisplay(currentQuestion) : "";
  const isSentenceType = currentQuestion.type === "listening" || currentQuestion.type === "dictation";

  // 書き取り問題: 例文をパーツに分割（ブランク数チェックにも使用）
  const dictationParts =
    currentQuestion.type === "dictation" && currentQuestion.word.example
      ? parseDictationParts(currentQuestion.word.example, currentQuestion.word.word)
      : [];
  const dictationBlankCount = dictationParts.filter((p) => p.kind === "blank").length;

  return (
    <div className="main-content px-2 py-1.5 flex flex-col">
      <div className="max-w-md w-full mx-auto flex flex-col">
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
                            // 次のブランクへ移動（最後のブランクから最初に戻る）
                            const nextIdx = (wordIndex + 1) % answerWords.length;
                            dictationInputRefs.current[nextIdx]?.focus();
                          } else if (e.key === "Enter") {
                            e.stopPropagation();
                            handleDictationSubmit();
                          }
                        }}
                        className="border-b-2 border-primary-400 dark:border-primary-500 bg-transparent text-center text-base leading-[1.4] font-bold text-primary-700 dark:text-primary-300 focus:outline-none focus:border-primary-600 dark:focus:border-primary-400 transition-colors"
                        style={{
                          width: `${Math.max(4, correctWord.length + 2)}ch`,
                        }}
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
              {currentQuestion.type === "en-to-ja" && (
                <div className="mt-1">
                  <SpeakButton text={currentQuestion.word.word} size="sm" />
                </div>
              )}
              {/* リスニング・書き取り: 例文音声ボタン */}
              {isSentenceType && currentQuestion.word.example && (
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

            {/* 書き取り問題: 回答ボタン（入力フィールドは問題文にインライン埋め込み） */}
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
    </div>
  );
};