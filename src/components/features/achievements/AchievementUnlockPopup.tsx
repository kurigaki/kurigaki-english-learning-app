"use client";

import { useEffect, useState } from "react";
import { Achievement } from "@/types";
import { getRarityBorderColor } from "@/data/achievements";

type AchievementUnlockPopupProps = {
  achievement: Achievement;
  onClose: () => void;
};

export const AchievementUnlockPopup = ({
  achievement,
  onClose,
}: AchievementUnlockPopupProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const borderColor = getRarityBorderColor(achievement.rarity);

  useEffect(() => {
    // フェードイン
    setTimeout(() => setIsVisible(true), 50);

    // 自動で閉じる
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const rarityLabel =
    achievement.rarity === "legendary"
      ? "伝説"
      : achievement.rarity === "epic"
      ? "エピック"
      : achievement.rarity === "rare"
      ? "レア"
      : "ノーマル";

  const rarityBgGradient =
    achievement.rarity === "legendary"
      ? "from-yellow-400 via-yellow-500 to-amber-500"
      : achievement.rarity === "epic"
      ? "from-purple-400 via-purple-500 to-purple-600"
      : achievement.rarity === "rare"
      ? "from-blue-400 via-blue-500 to-blue-600"
      : "from-gray-400 via-gray-500 to-gray-600";

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
        <div
          className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl border-4 ${borderColor} max-w-sm mx-4`}
        >
          {/* 装飾的な背景 */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div
              className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${rarityBgGradient} opacity-20 blur-2xl`}
            />
            <div
              className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-br ${rarityBgGradient} opacity-20 blur-2xl`}
            />
          </div>

          <div className="relative text-center">
            {/* ヘッダー */}
            <div
              className={`inline-block px-4 py-1 rounded-full text-white text-sm font-bold mb-4 bg-gradient-to-r ${rarityBgGradient}`}
            >
              実績解除！
            </div>

            {/* アイコン */}
            <div className="text-7xl mb-4 animate-bounce">
              {achievement.icon}
            </div>

            {/* 実績名 */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              {achievement.name}
            </h2>

            {/* 説明 */}
            <p className="text-slate-600 dark:text-slate-300 mb-4">{achievement.description}</p>

            {/* レアリティ */}
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${rarityBgGradient} text-white`}
            >
              {rarityLabel}
            </span>

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
