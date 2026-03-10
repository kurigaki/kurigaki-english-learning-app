import Link from "next/link";
import type { Word } from "@/data/words/compat";
import { categoryLabels } from "@/data/words/compat";
import type { Course } from "@/data/words/types";
import { COURSE_DEFINITIONS } from "@/data/words/courses";
import { Card, Button } from "@/components/ui";
import type { QuestionTypeRatios } from "@/types";
import {
  QuizSettings,
  defaultQuizSettings,
  ALL_CATEGORIES,
} from "@/lib/quiz/settings";
import { filterWordsBySettings } from "@/lib/quiz/generator";
import type { QuizProgressState } from "@/lib/quiz-session";

const QUESTIONS_PER_SESSION = 10;

type QuizSetupProps = {
  quizSettings: QuizSettings;
  setQuizSettings: React.Dispatch<React.SetStateAction<QuizSettings>>;
  startNewSession: (settings: QuizSettings) => void;
  bookmarkedIds: number[];
  words: Word[];
  savedProgress: QuizProgressState | null;
  onResumeSaved: () => void;
  onDiscardSaved: () => void;
};

export const QuizSetup = ({
  quizSettings,
  setQuizSettings,
  startNewSession,
  bookmarkedIds,
  words,
  savedProgress,
  onResumeSaved,
  onDiscardSaved,
}: QuizSetupProps) => {
  const bookmarkedCount = bookmarkedIds.filter((id) => words.some((w) => w.id === id)).length;
  const filteredPreview = filterWordsBySettings(words, quizSettings, bookmarkedIds);
  const savedTotal = savedProgress?.questions.length ?? 0;
  const savedIndex = (savedProgress?.currentIndex ?? 0) + 1;

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
          {savedProgress && (
            <Card className="!p-3 border-2 border-primary-200 dark:border-primary-700 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20">
              <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">中断したクイズがあります</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">
                進捗: {savedIndex} / {savedTotal} 問
              </p>
              <div className="flex gap-2">
                <Button size="sm" fullWidth onClick={onResumeSaved}>
                  再開する
                </Button>
                <Button size="sm" variant="secondary" fullWidth onClick={onDiscardSaved}>
                  破棄する
                </Button>
              </div>
            </Card>
          )}
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

          {/* 問題タイプの出題比率 */}
          <Card className="!p-3">
            <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">問題タイプの出題比率</h2>
            {(() => {
              const ratios = quizSettings.typeRatios;
              const total = ratios.enToJa + ratios.jaToEn + ratios.listening + ratios.dictation + (ratios.speaking ?? 0);
              const toPercent = (v: number) => total > 0 ? Math.round((v / total) * 100) : 0;
              const typeItems: { key: keyof QuestionTypeRatios; label: string }[] = [
                { key: "enToJa",    label: "A 英→日" },
                { key: "jaToEn",    label: "B 日→英" },
                { key: "listening", label: "C リスニング" },
                { key: "dictation", label: "D 書き取り" },
                { key: "speaking",  label: "E スピーキング" },
              ];
              return (
                <div className="space-y-2">
                  {typeItems.map(({ key, label }) => {
                    const value = ratios[key] ?? 0;
                    const pct = toPercent(value);
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-600 dark:text-slate-300 w-24 flex-shrink-0">{label}</span>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={value}
                          onChange={(e) =>
                            setQuizSettings((prev) => ({
                              ...prev,
                              typeRatios: { ...prev.typeRatios, [key]: parseInt(e.target.value) },
                            }))
                          }
                          className="flex-1 h-1.5 accent-primary-500"
                        />
                        <span className="text-[11px] font-bold text-primary-600 dark:text-primary-400 w-8 text-right flex-shrink-0">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                  {total === 0 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                      ※ 全て0の場合は「英→日」のみで出題されます
                    </p>
                  )}
                  <button
                    onClick={() =>
                      setQuizSettings((prev) => ({
                        ...prev,
                        typeRatios: { ...defaultQuizSettings.typeRatios },
                      }))
                    }
                    className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    デフォルトに戻す（A〜D 各25% / E 0%）
                  </button>
                </div>
              );
            })()}
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
            quizSettings.includeBookmarksOnly ||
            quizSettings.course !== null) && (
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
};
