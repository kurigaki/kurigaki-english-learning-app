"use client";

import { useEffect, useState } from "react";

type PerfectScorePopupProps = {
  mode: "quiz" | "speed";
  onClose: () => void;
};

export const PerfectScorePopup = ({ mode, onClose }: PerfectScorePopupProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // フェードイン
    setTimeout(() => setIsVisible(true), 50);

    // 3秒後に自動で閉じる
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getMessage = () => {
    if (mode === "speed") {
      return {
        title: "Perfect!",
        subtitle: "全問正解！",
        description: "驚異的なスピードと正確さ！",
      };
    }
    return {
      title: "Perfect!",
      subtitle: "全問正解！",
      description: "素晴らしい学習成果です！",
    };
  };

  const message = getMessage();

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className={`relative transform transition-all duration-300 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400 max-w-sm mx-4">
          {/* 装飾的な背景 */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 opacity-20 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 opacity-20 blur-2xl" />
          </div>

          <div className="relative text-center">
            {/* アイコン */}
            <div className="text-8xl mb-4 animate-perfect-bounce">
              🎉
            </div>

            {/* タイトル */}
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent mb-2">
              {message.title}
            </h2>

            {/* サブタイトル */}
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {message.subtitle}
            </p>

            {/* 説明 */}
            <p className="text-slate-600 dark:text-slate-300 mb-4">{message.description}</p>

            {/* 星の装飾 */}
            <div className="flex justify-center gap-2 text-3xl">
              <span className="animate-float emoji-icon">⭐</span>
              <span className="animate-float emoji-icon" style={{ animationDelay: "0.2s" }}>🌟</span>
              <span className="animate-float emoji-icon" style={{ animationDelay: "0.4s" }}>⭐</span>
            </div>

            {/* 閉じるヒント */}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
              タップして閉じる
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
