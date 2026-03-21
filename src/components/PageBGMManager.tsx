"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { stopAllDungeonBGM } from "@/lib/dungeon/audio";

/**
 * ページ遷移を監視し、BGMを制御するグローバルコンポーネント。
 * - ダンジョン(/dungeon)から他ページへ離脱したら全ダンジョンBGMを停止する。
 * - 将来的に他のページのBGMもここで管理する。
 */
export function PageBGMManager() {
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;

    // ダンジョンから離脱したら BGM を停止
    if (prev.startsWith("/dungeon") && !pathname.startsWith("/dungeon")) {
      stopAllDungeonBGM();
    }
  }, [pathname]);

  return null;
}
