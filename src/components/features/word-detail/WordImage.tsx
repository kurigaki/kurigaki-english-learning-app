"use client";

import Image from "next/image";
import { useState } from "react";
import {
  getImageUrl,
  getCategoryEmoji,
  getCategoryGradient,
} from "@/lib/image";

type WordImageProps = {
  imageUrl?: string;       // 単語固有の画像URL
  imageKeyword?: string;   // 画像検索用キーワード（コアイメージ）
  word: string;            // 単語（コンセプト画像検索用）
  category?: string;       // カテゴリ（フォールバック用）
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES = {
  sm: "h-24",
  md: "h-40",
  lg: "h-48",
};

export const WordImage = ({
  imageUrl,
  imageKeyword,
  word,
  category,
  size = "md",
}: WordImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 新しいAPIを使用: 単語固有URL > キーワード > 単語名 > カテゴリ の順でフォールバック
  const effectiveImageUrl = getImageUrl({
    wordImageUrl: imageUrl,
    imageKeyword,
    word,
    category,
  });
  const fallbackEmoji = getCategoryEmoji(category);
  const gradientClass = getCategoryGradient(category);
  const sizeClass = SIZE_CLASSES[size];

  // 画像がない場合、または読み込みエラーの場合はフォールバック表示
  if (!effectiveImageUrl || hasError) {
    return (
      <div
        className={`w-full ${sizeClass} rounded-2xl bg-gradient-to-br ${gradientClass} flex flex-col items-center justify-center mb-6 border border-slate-100`}
      >
        <span className={`${size === "sm" ? "text-4xl" : "text-6xl"}`}>{fallbackEmoji}</span>
        {size !== "sm" && (
          <span className="text-xs text-slate-400 mt-2">イメージ画像</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${sizeClass} rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-slate-100 to-slate-50`}
    >
      {/* ローディング時のプレースホルダー */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 animate-pulse">
          <span className="text-4xl opacity-50">{fallbackEmoji}</span>
        </div>
      )}
      <Image
        src={effectiveImageUrl}
        alt={`${word}のイメージ`}
        fill
        className={`object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        sizes="(max-width: 768px) 100vw, 500px"
        priority
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};
