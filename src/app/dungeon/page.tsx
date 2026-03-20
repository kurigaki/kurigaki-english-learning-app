"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { DungeonGame } from "@/components/features/dungeon/DungeonGame";

function DungeonContent() {
  const searchParams = useSearchParams();
  const wordId = searchParams.get("wordId");
  const initialWordId = wordId ? parseInt(wordId, 10) : undefined;

  return (
    <div style={{
      position: "fixed",
      top: "var(--header-height, 52px)",
      left: 0,
      right: 0,
      bottom: 0,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <DungeonGame initialWordId={initialWordId} />
    </div>
  );
}

export default function DungeonPage() {
  return (
    <Suspense fallback={
      <div className="main-content flex items-center justify-center">
        <div className="text-slate-400">読み込み中...</div>
      </div>
    }>
      <DungeonContent />
    </Suspense>
  );
}
