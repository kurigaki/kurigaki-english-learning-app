"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { words } from "@/data/words";
import { Card, Button } from "@/components/ui";
import {
  WordHeader,
  WordExamples,
  WordRelations,
  WordColumn,
  WordMastery,
  WordImage,
  WordPlaceholderSection,
} from "@/components/features/word-detail";
import { categoryLabels, difficultyLabels } from "@/data/words";
import { storage } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function WordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const wordId = Number(params.id);

  // 遷移元を取得（quiz, history, weak-words など）
  const fromPage = searchParams.get("from");

  const [masteryData, setMasteryData] = useState<{
    accuracy: number | null;
    totalAttempts: number;
  }>({ accuracy: null, totalAttempts: 0 });

  const word = words.find((w) => w.id === wordId);

  // 学習履歴から記憶度を計算
  useEffect(() => {
    if (!word) return;
    const statsMap = storage.getWordStats();
    const stats = statsMap.get(word.id);
    if (stats) {
      setMasteryData({
        accuracy: stats.accuracy,
        totalAttempts: stats.totalAttempts,
      });
    }
  }, [word]);

  // 戻るボタンの処理
  const handleBack = () => {
    // 遷移元に応じて適切な画面に戻る
    switch (fromPage) {
      case "quiz":
        // クイズリザルト画面に戻る
        router.push("/quiz");
        break;
      case "speed":
        // スピードチャレンジリザルト画面に戻る
        router.push("/speed-challenge");
        break;
      case "history":
        // 学習履歴画面に戻る
        router.push("/history");
        break;
      case "weak":
        // 苦手単語画面に戻る
        router.push("/weak-words");
        break;
      default:
        // それ以外はブラウザの履歴を使用
        router.back();
    }
  };

  // 戻り先のラベルを取得
  const getBackLabel = () => {
    switch (fromPage) {
      case "quiz":
        return "リザルトに戻る";
      case "speed":
        return "リザルトに戻る";
      case "history":
        return "学習履歴に戻る";
      case "weak":
        return "苦手単語に戻る";
      default:
        return "戻る";
    }
  };

  if (!word) {
    return (
      <div className="min-h-[calc(100vh-64px)] px-4 py-8 flex items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <span className="text-6xl mb-4 block">😵</span>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            単語が見つかりません
          </h1>
          <p className="text-slate-500 mb-6">
            指定された単語は存在しないか、削除された可能性があります。
          </p>
          <Link href="/">
            <Button fullWidth>ホームに戻る</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // 例文データを変換（例文がある場合）
  const examples = word.examples || (word.example
    ? [{
        en: word.example,
        ja: word.exampleJa ?? "",
      }]
    : []);

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6">
      <div className="max-w-lg mx-auto">
        {/* 戻るボタン */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>{getBackLabel()}</span>
        </button>

        <Card className="overflow-hidden">
          {/* カテゴリ・難易度バッジ */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
              {categoryLabels[word.category]}
            </span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
              {difficultyLabels[word.difficulty]}
            </span>
          </div>

          {/* イメージ画像 */}
          <WordImage
            word={word.word}
            category={word.category}
            imageUrl={word.imageUrl}
            imageKeyword={word.imageKeyword}
          />

          {/* ヘッダー（単語・発音・品詞・意味） */}
          <WordHeader
            word={word.word}
            meaning={word.meaning}
            pronunciation={word.pronunciation}
            partOfSpeech={word.partOfSpeech}
          />

          {/* 記憶度 */}
          <WordMastery
            accuracy={masteryData.accuracy}
            totalAttempts={masteryData.totalAttempts}
          />

          {/* 例文 */}
          {examples.length > 0 && (
            <WordExamples examples={examples} targetWord={word.word} />
          )}

          {/* コアイメージ */}
          <WordPlaceholderSection
            title="コアイメージ"
            emoji="💡"
            placeholder="この単語のコアイメージは今後追加予定です"
          />

          {/* 使い方 */}
          <WordPlaceholderSection
            title="使い方"
            emoji="📝"
            placeholder="この単語の使い方解説は今後追加予定です"
          />

          {/* 類義語・対義語 */}
          <WordRelations synonyms={word.synonyms} antonyms={word.antonyms} />

          {/* 類義語との違い */}
          <WordPlaceholderSection
            title="類義語との違い"
            emoji="🔍"
            content={word.column?.content?.includes("vs") ? word.column.content : undefined}
            placeholder="類義語との使い分けは今後追加予定です"
          />

          {/* 関連語 */}
          {word.synonyms && word.synonyms.length > 0 && (
            <div className="py-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1">
                <span>🔗</span> 関連語
              </h3>
              <p className="text-slate-400 text-sm italic">関連語は今後追加予定です</p>
            </div>
          )}

          {/* 英英定義 */}
          <WordPlaceholderSection
            title="英英定義"
            emoji="🇬🇧"
            placeholder="英語による定義は今後追加予定です"
          />

          {/* 語源 */}
          <WordPlaceholderSection
            title="語源"
            emoji="📜"
            content={word.column?.title?.includes("語源") ? word.column.content : undefined}
            placeholder="語源解説は今後追加予定です"
          />

          {/* コラム */}
          {word.column && <WordColumn column={word.column} />}

          {/* アクションボタン */}
          <div className="pt-6 space-y-3">
            <Link href={`/quiz?wordId=${word.id}`}>
              <Button fullWidth variant="primary">
                この単語を復習する
              </Button>
            </Link>
            {fromPage ? (
              <Button fullWidth variant="secondary" onClick={handleBack}>
                {getBackLabel()}
              </Button>
            ) : (
              <Link href="/">
                <Button fullWidth variant="secondary">
                  ホームに戻る
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* 関連単語への誘導 */}
        {word.synonyms && word.synonyms.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-slate-500 text-center">
              類義語をタップして、関連する単語も学習しましょう
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
