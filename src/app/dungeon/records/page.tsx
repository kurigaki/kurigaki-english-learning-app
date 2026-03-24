"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { storage } from "@/lib/storage";
import type { DungeonRanking } from "@/lib/dungeon/types";

const DC = {
  bg: "#09090f", bg2: "#111118", bg3: "#181825", bg4: "#1f1f30",
  border: "#2a2a45", border2: "#3a3a60",
  accent: "#7c6af7", accent2: "#f5a623",
  gold: "#f5c842", hp: "#e05252", green: "#52d47a",
  text: "#ddddf5", text2: "#9090b8", text3: "#606080",
};

type SortKey = "score" | "date" | "floor" | "kills" | "correct";

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

function causeIcon(cause: string, cleared: boolean): string {
  if (cleared) return "🏆";
  if (cause.includes("飢") || cause.includes("starv")) return "🍂";
  if (cause.includes("罠") || cause.includes("trap")) return "⚡";
  return "💀";
}

function causeLabel(cause: string, cleared: boolean): string {
  if (cleared) return "CLEAR";
  return cause || "Defeated";
}

export default function RecordsPage() {
  const [rankings, setRankings] = useState<DungeonRanking[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  useEffect(() => {
    setRankings(storage.getDungeonRankings());
  }, []);

  const sorted = useMemo(() => {
    const arr = rankings.map((r, i) => ({ ...r, originalIdx: i }));
    arr.sort((a, b) => {
      let va: number | string = 0, vb: number | string = 0;
      switch (sortKey) {
        case "score": va = a.score; vb = b.score; break;
        case "date": va = a.date; vb = b.date; break;
        case "floor": va = a.floor; vb = b.floor; break;
        case "kills": va = a.kills; vb = b.kills; break;
        case "correct": va = a.correct; vb = b.correct; break;
      }
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ? 1 : -1;
      return 0;
    });
    return arr;
  }, [rankings, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const selectedRecord = selectedIdx !== null ? sorted[selectedIdx] : null;

  return (
    <div style={{
      minHeight: "100vh", background: DC.bg, color: DC.text,
      fontFamily: "'DotGothic16', sans-serif",
      padding: "20px 16px",
    }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Link href="/dungeon" style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 9,
            color: DC.text2, textDecoration: "none",
          }}>
            ← BACK
          </Link>
          <h1 style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 14,
            color: DC.accent, margin: 0,
          }}>
            📊 RECORDS
          </h1>
          <div style={{ width: 50 }} />
        </div>

        {/* Stats Summary */}
        {rankings.length > 0 && (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
            marginBottom: 16,
          }}>
            {[
              { label: "BEST", value: Math.max(...rankings.map((r) => r.score)).toLocaleString(), color: DC.gold },
              { label: "CLEARS", value: String(rankings.filter((r) => r.cleared).length), color: DC.green },
              { label: "TOTAL", value: String(rankings.length), color: DC.text2 },
            ].map((s) => (
              <div key={s.label} style={{
                background: DC.bg3, border: `1px solid ${DC.border}`,
                borderRadius: 6, padding: "8px 6px", textAlign: "center",
              }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: DC.text3 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: s.color, marginTop: 2 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sort Controls */}
        <div style={{ display: "flex", gap: 4, marginBottom: 10, flexWrap: "wrap" }}>
          {([
            ["score", "SCORE"],
            ["date", "DATE"],
            ["floor", "FLOOR"],
            ["kills", "KILLS"],
            ["correct", "CORRECT"],
          ] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleSort(key)}
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                color: sortKey === key ? DC.bg : DC.text2,
                background: sortKey === key ? DC.accent : DC.bg3,
                border: `1px solid ${sortKey === key ? DC.accent : DC.border}`,
                borderRadius: 4, padding: "4px 8px", cursor: "pointer",
              }}
            >
              {label} {sortKey === key ? (sortAsc ? "▲" : "▼") : ""}
            </button>
          ))}
        </div>

        {/* Records List */}
        {rankings.length === 0 ? (
          <div style={{
            background: DC.bg3, border: `1px solid ${DC.border}`,
            borderRadius: 8, padding: "40px 16px", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
            <div style={{ color: DC.text3, fontSize: 12 }}>まだ記録がありません</div>
            <div style={{ color: DC.text3, fontSize: 10, marginTop: 4 }}>
              ダンジョンに挑戦して記録を残そう
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {sorted.map((r, idx) => (
              <button
                key={`${r.date}-${r.originalIdx}`}
                onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                style={{
                  background: selectedIdx === idx ? DC.bg4 : DC.bg3,
                  border: `1px solid ${selectedIdx === idx ? DC.accent : DC.border}`,
                  borderRadius: 6, padding: "8px 10px",
                  cursor: "pointer", textAlign: "left",
                  display: "grid", gridTemplateColumns: "28px 1fr auto",
                  alignItems: "center", gap: 8,
                }}
              >
                {/* Rank / Icon */}
                <div style={{ fontSize: 16, textAlign: "center" }}>
                  {causeIcon(r.cause, r.cleared)}
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{
                      fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                      color: r.cleared ? DC.gold : DC.text,
                    }}>
                      B{r.floor}F
                    </span>
                    <span style={{ fontSize: 10, color: DC.text2 }}>
                      Lv{r.lv}
                    </span>
                    <span style={{ fontSize: 9, color: DC.text3 }}>
                      {causeLabel(r.cause, r.cleared)}
                    </span>
                  </div>
                  <div style={{ fontSize: 9, color: DC.text3, marginTop: 2 }}>
                    {formatDate(r.date)} | {r.mode}
                  </div>
                </div>

                {/* Score */}
                <div style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 10,
                  color: DC.gold, textAlign: "right",
                }}>
                  {r.score.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected Record Detail */}
        {selectedRecord && (
          <div style={{
            background: DC.bg4, border: `1px solid ${DC.accent}40`,
            borderRadius: 8, padding: "14px 16px", marginTop: 12,
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 10,
              color: selectedRecord.cleared ? DC.gold : DC.hp,
              marginBottom: 10,
            }}>
              {selectedRecord.cleared ? "🏆 DUNGEON CLEAR" : `💀 ${selectedRecord.cause}`}
            </div>

            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "6px 16px", fontSize: 11,
            }}>
              {[
                ["Floor", `B${selectedRecord.floor}F`],
                ["Level", `Lv${selectedRecord.lv}`],
                ["Score", selectedRecord.score.toLocaleString()],
                ["Turns", String(selectedRecord.turns)],
                ["Kills", String(selectedRecord.kills)],
                ["Correct", `${selectedRecord.correct} / ${selectedRecord.correct + selectedRecord.wrong}`],
                ["Mode", selectedRecord.mode],
                ["Date", formatDate(selectedRecord.date)],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: DC.text3 }}>{label}</span>
                  <span style={{ color: DC.text, fontFamily: "'Press Start 2P', monospace", fontSize: 9 }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Accuracy bar */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 9, color: DC.text3, marginBottom: 3 }}>
                Accuracy: {selectedRecord.correct + selectedRecord.wrong > 0
                  ? Math.round(selectedRecord.correct / (selectedRecord.correct + selectedRecord.wrong) * 100)
                  : 0}%
              </div>
              <div style={{ background: DC.bg, borderRadius: 3, height: 6, overflow: "hidden" }}>
                <div style={{
                  background: DC.green, height: "100%", borderRadius: 3,
                  width: `${selectedRecord.correct + selectedRecord.wrong > 0
                    ? (selectedRecord.correct / (selectedRecord.correct + selectedRecord.wrong)) * 100
                    : 0}%`,
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
