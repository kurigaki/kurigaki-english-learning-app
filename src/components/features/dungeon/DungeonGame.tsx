"use client";

import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import type { DungeonQuestion, DmgPop, InventoryItem, DeathState, GameState } from "@/lib/dungeon/types";
import { ITEMS_DEF, TILE, MW, MH } from "@/lib/dungeon/constants";
import { useDungeon, type DungeonSave, type CaneCharges } from "./useDungeon";
import { storage, type DungeonRunLog } from "@/lib/storage";
import { SpeakButton } from "@/components/ui";

const DUNGEON_DEATH_KEY = "dungeon-death-state";

// ─── Color constants ───────────────────────────────────────────────
const DC = {
  bg: "#09090f",
  bg2: "#111118",
  bg3: "#181825",
  bg4: "#1f1f30",
  border: "#2a2a45",
  border2: "#3a3a60",
  accent: "#7c6af7",
  accent2: "#f5a623",
  gold: "#f5c842",
  hp: "#e05252",
  mp: "#52a8e0",
  green: "#52d47a",
  text: "#ddddf5",
  text2: "#9090b8",
  text3: "#606080",
};

const COURSE_OPTIONS = [
  { value: "", label: "全コース（ランダム）" },
  { value: "junior", label: "中学英語" },
  { value: "senior", label: "高校英語" },
  { value: "toeic", label: "TOEIC" },
  { value: "eiken", label: "英検" },
  { value: "conversation", label: "会話" },
];

// ─── Sub-components ────────────────────────────────────────────────

function DungeonHUD({
  floor, hp, mhp, lv, exp, enext,
}: {
  floor: number; hp: number; mhp: number; lv: number; exp: number; enext: number;
}) {
  const hpPct = Math.max(0, (hp / mhp) * 100);
  const expPct = (exp / enext) * 100;

  return (
    <div style={{
      background: DC.bg2,
      borderBottom: `2px solid ${DC.border}`,
      padding: "5px 10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      gap: 8,
    }}>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: DC.gold, whiteSpace: "nowrap" }}>
        B{floor}F
      </div>
      <div style={{ display: "flex", gap: 8, flex: 1, justifyContent: "flex-end" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 68 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: DC.text2 }}>HP</div>
          <div style={{ height: 6, background: "#ffffff10", borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${hpPct}%`, background: "linear-gradient(90deg,#a02020,#e05252)", borderRadius: 1, transition: "width .3s" }} />
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: DC.text, textAlign: "right" }}>
            {hp}/{mhp}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 68 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: DC.text2 }}>LV/EXP</div>
          <div style={{ height: 6, background: "#ffffff10", borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${expPct}%`, background: "linear-gradient(90deg,#2060a0,#52a8e0)", borderRadius: 1, transition: "width .3s" }} />
          </div>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: DC.text, textAlign: "right" }}>
            Lv{lv}
          </div>
        </div>
      </div>
    </div>
  );
}

function DungeonQuizPanel({
  quiz, quizAnswered, quizResult,
  onAnswer,
}: {
  quiz: import("@/lib/dungeon/types").QuizState | null;
  quizAnswered: boolean;
  quizResult: import("@/lib/dungeon/types").QuizResult | null;
  onAnswer: (chosen: string) => void;
}) {
  const KEYS = ["１", "２", "３", "４"];

  if (!quiz) {
    return (
      <div style={{
        background: DC.bg2,
        borderTop: `2px solid ${DC.border2}`,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, color: DC.text2 }}>敵に隣接してZ/Spaceで攻撃</span>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: DC.text3 }}>1/2/3/4で回答</span>
      </div>
    );
  }

  const e = quiz.enemy;
  const q = quiz.question;
  const hpPct = Math.max(0, (e.hp / e.mhp) * 100);

  return (
    <div style={{
      background: DC.bg2,
      borderTop: `2px solid ${DC.border2}`,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <div style={{ padding: "8px 10px 10px", display: "flex", flexDirection: "column", gap: 7 }}>
        {/* Enemy strip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "5px 8px",
          background: DC.bg3, borderRadius: 4, border: `1px solid ${DC.border}`,
        }}>
          <div style={{ fontSize: 22, lineHeight: 1 }}>{e.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: DC.accent2 }}>{e.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
              <div style={{ flex: 1, height: 5, background: "#ffffff10", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${hpPct}%`, background: "linear-gradient(90deg,#a02020,#e05252)", transition: "width .35s" }} />
              </div>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: DC.text2 }}>{e.hp}/{e.mhp}</div>
            </div>
          </div>
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 7, padding: "2px 5px",
            borderRadius: 2, background: "#7c6af720", color: DC.accent, border: `1px solid #7c6af730`, whiteSpace: "nowrap",
          }}>
            正解:90%命中
          </div>
        </div>

        {/* Word */}
        <div style={{ fontSize: 20, color: DC.gold, fontWeight: 700, textAlign: "center", fontFamily: "'DotGothic16', sans-serif", padding: "2px 0" }}>
          {q.word}
        </div>

        {/* Choices */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {quiz.choiceOrder.map((c, i) => {
            let borderColor = DC.border2;
            let bg = DC.bg3;
            let textColor = DC.text;
            let opacity = 1;

            if (quizAnswered) {
              if (c === q.ans) {
                borderColor = DC.green;
                bg = "#52d47a12";
                textColor = DC.green;
              } else if (quizResult && !quizResult.correct && i === quiz.choiceOrder.indexOf(c)) {
                // wrong chosen - handled via quizResult
              }
              // non-answer choices get dimmed
              if (c !== q.ans) opacity = 0.4;
            }

            return (
              <button
                key={i}
                onClick={() => !quizAnswered && onAnswer(c)}
                style={{
                  background: bg,
                  border: `1.5px solid ${borderColor}`,
                  borderRadius: 4,
                  padding: "9px 6px",
                  color: textColor,
                  fontFamily: "'DotGothic16', sans-serif",
                  fontSize: 13,
                  cursor: quizAnswered ? "default" : "pointer",
                  textAlign: "center",
                  lineHeight: 1.3,
                  position: "relative",
                  opacity,
                  transition: "all .1s",
                }}
              >
                <span style={{
                  position: "absolute", top: 3, left: 4,
                  fontFamily: "'Press Start 2P', monospace", fontSize: 6, color: DC.text2,
                  background: DC.bg4, padding: "1px 3px", borderRadius: 2, border: `1px solid ${DC.border}`,
                }}>
                  {KEYS[i]}
                </span>
                {c}
              </button>
            );
          })}
        </div>

        {/* Result */}
        {quizAnswered && quizResult && (
          <div style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 8, textAlign: "center", padding: 5,
            borderRadius: 3, lineHeight: 1.8,
            color: quizResult.correct ? DC.green : DC.hp,
            background: quizResult.correct ? "#52d47a10" : "#e0525210",
            border: `1px solid ${quizResult.correct ? "#52d47a30" : "#e0525230"}`,
          }}>
            {quizResult.correct
              ? quizResult.miss
                ? "✅ 正解！ しかしミスった…"
                : `✅ 正解！${quizResult.crit ? " 会心！" : ""} ${quizResult.damage}ダメージ！`
              : quizResult.miss
              ? `❌ 不正解（正解:${quiz.question.ans}）ミス`
              : `❌ 不正解（正解:${quiz.question.ans}）命中 ${quizResult.damage}dmg`
            }
          </div>
        )}
      </div>
    </div>
  );
}

const ITEM_TABS = [
  { cat: "all", label: "全て" },
  { cat: "grass", label: "🌿草" },
  { cat: "scroll", label: "📜巻物" },
  { cat: "cane", label: "🪄杖" },
  { cat: "food", label: "🍙食料" },
  { cat: "jar", label: "🫙壷" },
  { cat: "special", label: "✨特殊" },
];

function DungeonItemOverlay({
  items, itemFilter, onFilter, onUse, onClose, caneCharges,
}: {
  items: InventoryItem[];
  itemFilter: string;
  onFilter: (cat: string) => void;
  onUse: (id: string) => void;
  onClose: () => void;
  caneCharges: CaneCharges;
}) {
  const tabs = ITEM_TABS;

  const catLabels: Record<string, string> = {
    grass: "草", scroll: "巻物", cane: "杖", food: "食料", jar: "壷", special: "特殊",
  };

  // 杖はcharges切れでも表示（count >= 0 かつ cat=cane のものを含む）
  const avail = useMemo(() => {
    let result = items.filter((i) => i.count > 0 || i.cat === "cane");
    if (itemFilter !== "all") {
      const ids = ITEMS_DEF.filter((d) => d.cat === itemFilter).map((d) => d.id);
      result = result.filter((i) => ids.includes(i.id));
    }
    return result;
  }, [items, itemFilter]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // フィルタ変更時はカーソルをリセット
  useEffect(() => {
    setSelectedIndex(0);
  }, [itemFilter]);

  // availが縮んだ場合にカーソルをクランプ
  useEffect(() => {
    if (avail.length > 0 && selectedIndex >= avail.length) {
      setSelectedIndex(avail.length - 1);
    }
  }, [avail.length, selectedIndex]);

  // キーボードナビゲーション
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "i" || e.key === "I") {
        onClose();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, avail.length - 1));
        return;
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "z" || e.key === "Z") {
        if (avail.length > 0) {
          e.preventDefault();
          onUse(avail[selectedIndex]?.id ?? "");
        }
        return;
      }
      // 数字キー 1〜7 でタブ切り替え
      const tabIdx = parseInt(e.key, 10) - 1;
      if (tabIdx >= 0 && tabIdx < tabs.length) {
        e.preventDefault();
        onFilter(tabs[tabIdx].cat);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [avail, selectedIndex, onClose, onUse, onFilter, tabs]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#09090fee",
      display: "flex", flexDirection: "column", padding: 14, overflowY: "auto", zIndex: 50,
    }}>
      {/* ヘッダー行: タイトル + 常時表示の閉じるボタン */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: DC.gold }}>
          🎒 道具袋
        </div>
        <button
          onClick={onClose}
          style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: DC.text2,
            background: DC.bg4, border: `1px solid ${DC.border2}`,
            width: 32, height: 32, cursor: "pointer", borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: DC.text3, textAlign: "center", marginBottom: 8, flexShrink: 0 }}>
        ▲▼ / W・S で選択　Enter / Z で使用　1〜7 でタブ
      </div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {tabs.map((t, ti) => (
          <button
            key={t.cat}
            onClick={() => onFilter(t.cat)}
            style={{
              fontFamily: "'DotGothic16', sans-serif", fontSize: 11,
              color: itemFilter === t.cat ? DC.text : DC.text2,
              background: itemFilter === t.cat ? DC.bg4 : DC.bg3,
              border: `1px solid ${itemFilter === t.cat ? DC.accent : DC.border}`,
              padding: "4px 8px", cursor: "pointer", borderRadius: 3,
            }}
          >
            [{ti + 1}]{t.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {avail.length === 0 ? (
          <div style={{ color: DC.text2, textAlign: "center", padding: 20, fontSize: 13 }}>該当アイテムなし</div>
        ) : (
          avail.map((item, idx) => {
            const def = ITEMS_DEF.find((d) => d.id === item.id);
            const catLabel = catLabels[item.cat] || "";
            const isSelected = idx === selectedIndex;
            const isDepleted = item.count <= 0; // 杖で charges 切れ
            return (
              <div
                key={item.id}
                onClick={() => { setSelectedIndex(idx); onUse(item.id); }}
                onMouseEnter={() => setSelectedIndex(idx)}
                style={{
                  background: isSelected ? DC.bg4 : DC.bg3,
                  border: `1px solid ${isSelected ? DC.accent : DC.border2}`,
                  borderRadius: 5,
                  padding: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  opacity: isDepleted ? 0.5 : 1,
                  outline: isSelected ? `2px solid ${DC.accent}40` : "none",
                  transition: "background 0.1s, border-color 0.1s",
                }}
              >
                <div style={{ fontSize: 24 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: DC.gold, marginBottom: 3 }}>
                    {item.name}{" "}
                    <span style={{ fontFamily: "'DotGothic16', sans-serif", fontSize: 9, color: DC.text3, fontWeight: "normal" }}>[{catLabel}]</span>
                    {isDepleted && <span style={{ fontFamily: "'DotGothic16', sans-serif", fontSize: 9, color: DC.hp, marginLeft: 4 }}>魔力切れ</span>}
                  </div>
                  <div style={{ fontSize: 12, color: DC.text2 }}>{def?.desc || item.desc}</div>
                </div>
                {item.cat === "cane" ? (
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: isDepleted ? DC.hp : DC.mp }}>
                    残{caneCharges[item.id as keyof CaneCharges] ?? 0}回
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: DC.accent }}>×{item.count}</div>
                )}
              </div>
            );
          })
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: DC.text2,
          background: DC.bg3, border: `1px solid ${DC.border2}`,
          padding: "9px 18px", cursor: "pointer", borderRadius: 4, alignSelf: "center", marginTop: 10,
        }}
      >
        ✕ 閉じる [I/Esc]
      </button>
    </div>
  );
}

function DungeonDeathScreen({
  death, onRetry, onBackToTitle,
}: {
  death: DeathState;
  onRetry: () => void;
  onBackToTitle: () => void;
}) {
  const isCleared = death.isCleared;
  // 過去ログ（最新1件=今回の結果を除いた直近4件）
  const pastLogs = useMemo<DungeonRunLog[]>(() => storage.getDungeonRunLog().slice(1, 5), []);

  const handleWordLinkClick = useCallback(() => {
    sessionStorage.setItem(DUNGEON_DEATH_KEY, JSON.stringify(death));
  }, [death]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#09090fef",
      display: "flex", flexDirection: "column", alignItems: "center",
      zIndex: 200, padding: 20, gap: 10, overflowY: "auto",
    }}>
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "clamp(16px,4.5vw,24px)",
        color: isCleared ? DC.gold : DC.hp,
        textShadow: isCleared ? "0 0 20px #f5c84260" : "0 0 20px #e0525260",
        flexShrink: 0,
      }}>
        {isCleared ? "🏆 CLEAR!" : "💀 YOU DIED"}
      </div>
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: DC.text2, flexShrink: 0 }}>
        {isCleared ? "全フロアを踏破した！" : "全ての持ち物を失い、Lv1に戻った"}
      </div>
      {death.newRecords.length > 0 && (
        <div style={{
          background: "#f5c84220", border: `1px solid ${DC.gold}`,
          borderRadius: 5, padding: "6px 12px", width: "100%", maxWidth: 300,
          fontFamily: "'Press Start 2P', monospace", fontSize: 8,
          color: DC.gold, textAlign: "center", flexShrink: 0,
        }}>
          🏅 NEW RECORD: {death.newRecords.join(" / ")}
        </div>
      )}
      <div style={{ background: DC.bg3, border: `1px solid ${DC.border2}`, borderRadius: 5, padding: 12, width: "100%", maxWidth: 300, flexShrink: 0 }}>
        {[
          ["到達フロア", `B${death.floor}F`, death.newRecords.includes("到達フロア")],
          ["レベル", `Lv${death.lv}`, false],
          ["倒した敵", `${death.kills}体`, death.newRecords.includes("撃破数")],
          ["正解数", `${death.correct}問`, death.newRecords.includes("正解数")],
          ["不正解数", `${death.wrong}問`, false],
          ["経過ターン", `${death.turns}T`, false],
        ].map(([lbl, val, isNew]) => (
          <div key={lbl as string} style={{
            display: "flex", justifyContent: "space-between", fontSize: 13,
            padding: "3px 0", borderBottom: `1px solid ${DC.border}`,
          }}>
            <span style={{ color: DC.text2 }}>{lbl as string}</span>
            <span style={{ color: isNew ? DC.gold : DC.text, fontWeight: isNew ? 700 : 400 }}>
              {val as string}{isNew ? " ★" : ""}
            </span>
          </div>
        ))}
      </div>

      {/* 回答した単語一覧 */}
      <div style={{ width: "100%", maxWidth: 300, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: DC.text2, marginBottom: 7, textAlign: "center" }}>
          回答した単語
        </div>
        {death.answeredQuestions.length === 0 ? (
          <div style={{ color: DC.text3, textAlign: "center", padding: 8, fontSize: 13 }}>なし</div>
        ) : (
          death.answeredQuestions.map((aq, idx) => {
            const { question: q, correct } = aq;
            const href = q.wordId !== 0 ? `/word/${q.wordId}?from=dungeon` : null;
            const rowStyle: React.CSSProperties = {
              background: correct ? "#52d47a10" : "#e0525210",
              border: `1px solid ${correct ? "#52d47a28" : "#e0525228"}`,
              borderRadius: 3,
              padding: "6px 10px",
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              gap: 8,
            };
            const inner = (
              <>
                <span style={{
                  fontFamily: "'Press Start 2P', monospace", fontSize: 7,
                  color: correct ? DC.green : DC.hp, flexShrink: 0,
                }}>
                  {correct ? "✓" : "✗"}
                </span>
                <SpeakButton text={q.word} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DC.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.word}</div>
                  <div style={{ fontSize: 11, color: DC.text2 }}>{q.ans}</div>
                </div>
                {href && (
                  <span style={{ color: DC.text3, fontSize: 13, flexShrink: 0 }}>→</span>
                )}
              </>
            );
            return href ? (
              <Link
                key={idx}
                href={href}
                onClick={handleWordLinkClick}
                style={{ ...rowStyle, textDecoration: "none" }}
              >
                {inner}
              </Link>
            ) : (
              <div key={idx} style={rowStyle}>{inner}</div>
            );
          })
        )}
      </div>

      {pastLogs.length > 0 && (
        <div style={{ width: "100%", maxWidth: 300, flexShrink: 0 }}>
          <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: DC.text2, marginBottom: 6, textAlign: "center" }}>
            過去の記録
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {pastLogs.map((log, i) => {
              const d = new Date(log.playedAt);
              const label = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
              return (
                <div key={i} style={{
                  background: DC.bg3, border: `1px solid ${log.isCleared ? DC.gold + "40" : DC.border}`,
                  borderRadius: 3, padding: "4px 8px",
                  display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11,
                }}>
                  <span style={{ color: DC.text3 }}>{label}</span>
                  <span style={{ color: log.isCleared ? DC.gold : DC.text2 }}>
                    {log.isCleared ? "🏆" : "💀"} B{log.floor}F &nbsp;{log.kills}体 &nbsp;{log.correct}問
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", flexShrink: 0, marginTop: 4 }}>
        <button
          onClick={onBackToTitle}
          style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: DC.text,
            background: DC.bg3, border: `1px solid ${DC.border2}`, padding: "12px 20px", cursor: "pointer",
            clipPath: "polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)",
          }}
        >
          ← タイトルに戻る
        </button>
        <button
          onClick={onRetry}
          style={{
            fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#09090f",
            background: DC.accent2, border: "none", padding: "12px 22px", cursor: "pointer",
            clipPath: "polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)",
          }}
        >
          ↺ 再挑戦
        </button>
      </div>
    </div>
  );
}

function DungeonControls({
  onDpad, onAttack, onWait, onItems, onStairs, showStairs,
}: {
  onDpad: (dx: number, dy: number) => void;
  onAttack: () => void;
  onWait: () => void;
  onItems: () => void;
  onStairs: () => void;
  showStairs: boolean;
}) {
  const dpStyle: React.CSSProperties = {
    width: 32, height: 32, background: DC.bg3, border: `1px solid ${DC.border}`,
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
    cursor: "pointer", borderRadius: 3, color: DC.text2, userSelect: "none",
  };
  const btnStyle: React.CSSProperties = {
    fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: DC.text2,
    background: DC.bg3, border: `1px solid ${DC.border}`,
    padding: "6px 9px", cursor: "pointer", borderRadius: 3,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  };

  // タッチ後に生成される click を抑制するためにタイムスタンプで判定
  const lastTouchTimeRef = useRef(0);
  const handleTouch = (dx: number, dy: number) => (e: React.TouchEvent) => {
    e.preventDefault();
    lastTouchTimeRef.current = Date.now();
    onDpad(dx, dy);
  };
  const handleClick = (dx: number, dy: number) => () => {
    // タッチから 500ms 以内の click は無視（ダブル発火防止）
    if (Date.now() - lastTouchTimeRef.current < 500) return;
    onDpad(dx, dy);
  };

  return (
    <div style={{
      background: DC.bg2, borderTop: `2px solid ${DC.border}`,
      padding: "5px 8px", flexShrink: 0, display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap", alignItems: "center",
    }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <div style={{ display: "flex", gap: 2 }}>
          <div style={{ width: 32, height: 32 }} />
          <div style={dpStyle} onTouchStart={handleTouch(0, -1)} onClick={handleClick(0, -1)}>▲</div>
          <div style={{ width: 32, height: 32 }} />
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <div style={dpStyle} onTouchStart={handleTouch(-1, 0)} onClick={handleClick(-1, 0)}>◀</div>
          <div style={dpStyle} onTouchStart={handleTouch(0, 0)} onClick={handleClick(0, 0)}>·</div>
          <div style={dpStyle} onTouchStart={handleTouch(1, 0)} onClick={handleClick(1, 0)}>▶</div>
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          <div style={{ width: 32, height: 32 }} />
          <div style={dpStyle} onTouchStart={handleTouch(0, 1)} onClick={handleClick(0, 1)}>▼</div>
          <div style={{ width: 32, height: 32 }} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <button style={{ ...btnStyle, borderColor: DC.accent2, color: DC.accent2 }} onClick={onAttack}>
          <span style={{ fontSize: 15 }}>⚔️</span>攻撃[Z]
        </button>
        <button style={btnStyle} onClick={onItems}>
          <span style={{ fontSize: 15 }}>🎒</span>道具[I]
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <button style={btnStyle} onClick={onWait}>
          <span style={{ fontSize: 15 }}>⏸</span>待機[X]
        </button>
        {showStairs && (
          <button style={{ ...btnStyle, borderColor: DC.accent2, color: DC.accent2 }} onClick={onStairs}>
            <span style={{ fontSize: 15 }}>🔽</span>降りる[Enter]
          </button>
        )}
      </div>
    </div>
  );
}

function DmgPopLayer({
  pops, canvasRef,
}: {
  pops: DmgPop[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
}) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 5 }}>
      {pops.map((p) => {
        const canvas = canvasRef.current;
        const m = canvas?.style.transform.match(/translate\(([^,]+)px,([^)]+)px\)/);
        const tx = m ? -parseFloat(m[1]) : 0;
        const ty = m ? -parseFloat(m[2]) : 0;
        const sx = p.gx * TILE + tx + TILE / 2 - 8;
        const sy = p.gy * TILE + ty;

        let color = DC.accent2;
        let fontSize = 15;
        let text = "";

        switch (p.type) {
          case "miss":
            color = "#7070a0";
            fontSize = 11;
            text = "MISS!";
            break;
          case "hit":
            color = DC.accent2;
            fontSize = 15;
            text = `-${p.value}`;
            break;
          case "crit":
            color = DC.gold;
            fontSize = 18;
            text = `💥${p.value}!!`;
            break;
          case "recv":
            color = DC.hp;
            fontSize = 14;
            text = `-${p.value}`;
            break;
          case "wake":
            color = "#7070c0";
            fontSize = 16;
            text = "!";
            break;
        }

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: sx,
              top: sy,
              fontFamily: "'Press Start 2P', monospace",
              pointerEvents: "none",
              color,
              fontSize,
              animation: "dpop 0.85s ease forwards",
            }}
          >
            {text}
          </div>
        );
      })}
      <style>{`
        @keyframes dpop {
          0%   { opacity: 1; transform: translateY(0) scale(1); }
          55%  { opacity: 1; transform: translateY(-28px) scale(1.1); }
          100% { opacity: 0; transform: translateY(-52px) scale(.8); }
        }
      `}</style>
    </div>
  );
}

// ─── Title screen ──────────────────────────────────────────────────
function TitleScreen({
  onStart, onContinue, hasSave,
}: {
  onStart: (course: string, weakOnly: boolean) => void;
  onContinue: () => void;
  hasSave: boolean;
}) {
  const [course, setCourse] = useState("");
  const [weakOnly, setWeakOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const weakWordCount = storage.getWeakWords().length;

  const handleStart = async () => {
    setLoading(true);
    await onStart(course, weakOnly);
    setLoading(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 40%,#1a0f2e 0%,#09090f 65%)",
      zIndex: 100, gap: 10, padding: 20,
    }}>
      <div style={{ fontSize: 56, animation: "tfloat 3s ease-in-out infinite" }}>🗡️</div>
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "clamp(13px,3.5vw,22px)",
        color: DC.gold,
        letterSpacing: 3,
        textAlign: "center",
        animation: "tglow 2s ease-in-out infinite",
      }}>
        WORD DUNGEON
      </div>
      <div style={{
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "clamp(7px,2vw,9px)",
        color: DC.accent,
        letterSpacing: 2,
        textAlign: "center",
      }}>
        〜英語で戦うローグライク〜
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, width: "100%", maxWidth: 260 }}>
        <label style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: DC.text2 }}>コース選択</label>
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          disabled={weakOnly}
          style={{
            fontFamily: "'DotGothic16', sans-serif", fontSize: 13, color: weakOnly ? DC.text3 : DC.text,
            background: DC.bg3, border: `1px solid ${DC.border2}`, borderRadius: 4,
            padding: "6px 10px", width: "100%", cursor: weakOnly ? "default" : "pointer",
            appearance: "none",
          }}
        >
          {COURSE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <label style={{
          display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
          color: weakOnly ? DC.accent2 : DC.text2,
          fontSize: 12, fontFamily: "'DotGothic16', sans-serif",
          background: weakOnly ? "#f5a62318" : "transparent",
          border: `1px solid ${weakOnly ? DC.accent2 : DC.border}`,
          borderRadius: 4, padding: "5px 10px", width: "100%",
        }}>
          <input
            type="checkbox"
            checked={weakOnly}
            onChange={(e) => setWeakOnly(e.target.checked)}
            style={{ accentColor: DC.accent2, width: 14, height: 14 }}
          />
          <span>
            苦手単語モード
            {weakWordCount > 0
              ? <span style={{ color: DC.hp, marginLeft: 4 }}>({weakWordCount}語)</span>
              : <span style={{ color: DC.text3, marginLeft: 4 }}>(なし)</span>
            }
          </span>
        </label>
      </div>

      {hasSave && (
        <button
          onClick={onContinue}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "clamp(9px,2.5vw,12px)",
            color: DC.text,
            background: DC.bg4,
            border: `2px solid ${DC.accent}`,
            padding: "12px 24px",
            cursor: "pointer",
            marginTop: 6,
            clipPath: "polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)",
          }}
        >
          ▶ 続きから
        </button>
      )}
      <button
        onClick={handleStart}
        disabled={loading}
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "clamp(9px,2.5vw,12px)",
          color: "#09090f",
          background: DC.gold,
          border: "none",
          padding: "14px 28px",
          cursor: loading ? "default" : "pointer",
          marginTop: hasSave ? 4 : 6,
          opacity: loading ? 0.7 : 1,
          clipPath: "polygon(4px 0%,calc(100% - 4px) 0%,100% 4px,100% calc(100% - 4px),calc(100% - 4px) 100%,4px 100%,0% calc(100% - 4px),0% 4px)",
        }}
      >
        ▶ {hasSave ? "新しくはじめる" : "START"}
      </button>

      {loading && (
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: DC.text2 }}>読み込み中…</div>
      )}

      <div style={{
        fontSize: 11, color: DC.text2, textAlign: "center", lineHeight: 2.1,
        background: DC.bg3, border: `1px solid ${DC.border}`, padding: "12px 18px", borderRadius: 4, width: "100%", maxWidth: 360,
      }}>
        <b style={{ color: DC.text }}>移動:</b> 矢印/WASD &nbsp;|&nbsp; <b style={{ color: DC.text }}>攻撃:</b> Z/Space<br />
        <b style={{ color: DC.text }}>足踏み:</b> X/. &nbsp;|&nbsp; <b style={{ color: DC.text }}>道具:</b> I<br />
        <b style={{ color: DC.text }}>英語回答:</b> 1 / 2 / 3 / 4 キー<br />
        <b style={{ color: DC.text }}>階段を降りる:</b> Enter / &gt;<br /><br />
        戦闘中もターンは進む。敵に囲まれるな！<br />
        💤 寝ている敵は部屋に入ると起きる
      </div>

      <style>{`
        @keyframes tfloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes tglow { 0%,100%{text-shadow:0 0 20px #f5c84260} 50%{text-shadow:0 0 30px #f5c842aa} }
      `}</style>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────
export function DungeonGame({ initialWordId }: { initialWordId?: number } = {}) {
  const [phase, setPhase] = useState<"title" | "game">("title");
  const [questions, setQuestions] = useState<DungeonQuestion[]>([]);
  const [restoredDeath, setRestoredDeath] = useState<DeathState | null>(null);
  const pendingSaveRef = useRef<GameState | null>(null);
  const [hasSave, setHasSave] = useState(false);

  const {
    canvasRef, wrapRef, uiState, dmgPops,
    startGame, doTurn, playerAttack, doWait, answerQuiz,
    goNextFloor, useItem, openItems, closeItems, filterItems, retryGame,
    loadSave, stopAutoWalk, handleCanvasTap,
  } = useDungeon(questions);

  // sessionStorage からリザルト状態を復元 & localStorage セーブ確認
  useEffect(() => {
    const saved = sessionStorage.getItem(DUNGEON_DEATH_KEY);
    if (saved) {
      try {
        const death = JSON.parse(saved) as DeathState;
        setRestoredDeath(death);
        setPhase("game");
      } catch {
        sessionStorage.removeItem(DUNGEON_DEATH_KEY);
      }
    }
    setHasSave(storage.hasDungeonGame());
  }, []);

  // Load Google Fonts
  useEffect(() => {
    if (typeof document === "undefined") return;
    const existing = document.getElementById("dungeon-fonts");
    if (existing) return;
    const link = document.createElement("link");
    link.id = "dungeon-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=DotGothic16&display=swap";
    document.head.appendChild(link);
  }, []);

  const handleBackToTitle = useCallback(() => {
    sessionStorage.removeItem(DUNGEON_DEATH_KEY);
    stopAutoWalk();
    setRestoredDeath(null);
    setPhase("title");
    setHasSave(storage.hasDungeonGame());
    startedRef.current = false;
  }, [stopAutoWalk]);

  const handleStart = useCallback(async (course: string, weakOnly: boolean) => {
    sessionStorage.removeItem(DUNGEON_DEATH_KEY);
    let url = "/api/dungeon-words";
    if (weakOnly) {
      const weakIds = storage.getWeakWords();
      if (weakIds.length > 0) {
        url += "?wordIds=" + weakIds.join(",");
      }
    } else if (course) {
      url += "?course=" + encodeURIComponent(course);
    }
    let qs: DungeonQuestion[] = [];
    try {
      const res = await fetch(url);
      if (res.ok) qs = await res.json();
    } catch {
      // fallback below
    }
    if (!qs || qs.length === 0) {
      qs = [
        { wordId: 0, word: "apple", ans: "りんご", ch: ["りんご", "みかん", "ぶどう", "もも"] },
        { wordId: 0, word: "water", ans: "水", ch: ["火", "水", "土", "風"] },
        { wordId: 0, word: "brave", ans: "勇敢な", ch: ["臆病な", "勇敢な", "賢い", "強い"] },
        { wordId: 0, word: "ancient", ans: "古代の", ch: ["現代の", "未来の", "古代の", "中世の"] },
        { wordId: 0, word: "treasure", ans: "宝物", ch: ["罠", "宝物", "毒", "呪い"] },
        { wordId: 0, word: "escape", ans: "逃げる", ch: ["攻める", "守る", "逃げる", "探す"] },
        { wordId: 0, word: "monster", ans: "怪物", ch: ["英雄", "魔法使い", "怪物", "王様"] },
        { wordId: 0, word: "victory", ans: "勝利", ch: ["敗北", "逃走", "休息", "勝利"] },
        { wordId: 0, word: "courage", ans: "勇気", ch: ["恐怖", "勇気", "怒り", "悲しみ"] },
        { wordId: 0, word: "danger", ans: "危険", ch: ["安全", "危険", "平和", "喜び"] },
      ];
    }
    setQuestions(qs);
    setPhase("game");
  }, []);

  const handleContinue = useCallback(() => {
    const raw = storage.getDungeonGame() as DungeonSave | null;
    if (!raw) return;
    pendingSaveRef.current = raw.gameState;
    setQuestions(raw.questions);
    setPhase("game");
  }, []);

  // initialWordId が指定された場合、タイトルをスキップして自動起動
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!initialWordId || autoStartedRef.current) return;
    autoStartedRef.current = true;
    handleStart("", false);
  }, [initialWordId, handleStart]);

  // Start game once questions are set and phase is "game"
  const startedRef = useRef(false);
  useEffect(() => {
    if (phase === "game" && questions.length > 0 && !startedRef.current) {
      startedRef.current = true;
      if (pendingSaveRef.current) {
        loadSave(pendingSaveRef.current);
        pendingSaveRef.current = null;
      } else {
        startGame();
      }
    }
  }, [phase, questions, startGame, loadSave]);

  // Keyboard handler
  useEffect(() => {
    if (phase !== "game") return;

    const handleKeyDown = (ev: KeyboardEvent) => {
      if (uiState.showItems) {
        if (["i", "I", "Escape"].includes(ev.key)) closeItems();
        return;
      }
      if (uiState.death) return;

      const k = ev.key;

      // Quiz answers
      if (uiState.quiz && !uiState.quizAnswered) {
        if (k === "1") { ev.preventDefault(); answerQuiz(uiState.quiz.choiceOrder[0]); return; }
        if (k === "2") { ev.preventDefault(); answerQuiz(uiState.quiz.choiceOrder[1]); return; }
        if (k === "3") { ev.preventDefault(); answerQuiz(uiState.quiz.choiceOrder[2]); return; }
        if (k === "4") { ev.preventDefault(); answerQuiz(uiState.quiz.choiceOrder[3]); return; }
      }

      // Movement（手動操作はオートウォークを停止）
      if (k === "ArrowUp" || k === "w" || k === "W") { ev.preventDefault(); stopAutoWalk(); doTurn(0, -1); }
      else if (k === "ArrowDown" || k === "s" || k === "S") { ev.preventDefault(); stopAutoWalk(); doTurn(0, 1); }
      else if (k === "ArrowLeft" || k === "a" || k === "A") { ev.preventDefault(); stopAutoWalk(); doTurn(-1, 0); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { ev.preventDefault(); stopAutoWalk(); doTurn(1, 0); }
      else if (k === " " || k === "z" || k === "Z") { ev.preventDefault(); playerAttack(); }
      else if (k === "." || k === "x" || k === "X") { ev.preventDefault(); doWait(); }
      else if (k === "i" || k === "I") { ev.preventDefault(); openItems(); }
      else if (k === ">" || k === "Enter") { ev.preventDefault(); if (uiState.onStairs) goNextFloor(); }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    phase, uiState, answerQuiz, closeItems, doTurn, doWait, goNextFloor,
    openItems, playerAttack, stopAutoWalk,
  ]);

  // Canvas のタイル座標を計算するユーティリティ
  const getTileFromEvent = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const m = canvas.style.transform.match(/translate\(([^,]+)px,([^)]+)px\)/);
    const tx = m ? parseFloat(m[1]) : 0;
    const ty = m ? parseFloat(m[2]) : 0;
    return {
      x: Math.floor((clientX - rect.left - tx) / TILE),
      y: Math.floor((clientY - rect.top - ty) / TILE),
    };
  }, [canvasRef]);

  // マウスクリック → タップ移動（クイズ中は無視）
  const handleCanvasClick = useCallback(
    (ev: React.MouseEvent<HTMLCanvasElement>) => {
      if (uiState.quiz && !uiState.quizAnswered) return;
      const tile = getTileFromEvent(ev.clientX, ev.clientY);
      if (tile) handleCanvasTap(tile.x, tile.y);
    },
    [getTileFromEvent, handleCanvasTap, uiState.quiz, uiState.quizAnswered]
  );

  // タッチタップ → タップ移動（スマホ用・クイズ中は無視）
  const handleCanvasTouchEnd = useCallback(
    (ev: React.TouchEvent<HTMLCanvasElement>) => {
      ev.preventDefault();
      if (uiState.quiz && !uiState.quizAnswered) return;
      const touch = ev.changedTouches[0];
      if (!touch) return;
      const tile = getTileFromEvent(touch.clientX, touch.clientY);
      if (tile) handleCanvasTap(tile.x, tile.y);
    },
    [getTileFromEvent, handleCanvasTap, uiState.quiz, uiState.quizAnswered]
  );

  if (phase === "title") {
    return (
      <div style={{ width: "100%", height: "100%", background: DC.bg, color: DC.text, fontFamily: "'DotGothic16', sans-serif", overflow: "hidden" }}>
        <TitleScreen onStart={handleStart} onContinue={handleContinue} hasSave={hasSave} />
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", height: "100%",
      background: DC.bg, color: DC.text,
      fontFamily: "'DotGothic16', sans-serif",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      maxWidth: 640,
      margin: "0 auto",
    }}>
      {/* HUD */}
      <DungeonHUD
        floor={uiState.floor}
        hp={uiState.hp}
        mhp={uiState.mhp}
        lv={uiState.lv}
        exp={uiState.exp}
        enext={uiState.enext}
      />

      {/* Map */}
      <div
        ref={wrapRef}
        style={{ flex: 1, overflow: "hidden", position: "relative", background: "#09090f", minHeight: 0 }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onTouchEnd={handleCanvasTouchEnd}
          style={{ position: "absolute", top: 0, left: 0, imageRendering: "pixelated", cursor: "pointer", touchAction: "none" }}
          width={MW * TILE}
          height={MH * TILE}
        />
        <DmgPopLayer pops={dmgPops} canvasRef={canvasRef} />
      </div>

      {/* Quiz panel */}
      <DungeonQuizPanel
        quiz={uiState.quiz}
        quizAnswered={uiState.quizAnswered}
        quizResult={uiState.quizResult}
        onAnswer={(chosen) => answerQuiz(chosen)}
      />

      {/* Message bar */}
      <div style={{
        background: DC.bg2, borderTop: `1px solid ${DC.border}`,
        padding: "3px 10px", flexShrink: 0, minHeight: 22,
      }}>
        <div style={{ fontSize: 11, color: DC.text2, textAlign: "center" }}>
          {uiState.msg}
        </div>
      </div>

      {/* Controls */}
      <DungeonControls
        onDpad={(dx, dy) => { stopAutoWalk(); if (dx === 0 && dy === 0) { doWait(); } else { doTurn(dx, dy); } }}
        onAttack={playerAttack}
        onWait={doWait}
        onItems={openItems}
        onStairs={goNextFloor}
        showStairs={uiState.onStairs}
      />

      {/* Notification */}
      {uiState.notification && (
        <div style={{
          position: "fixed", top: 52, left: "50%", transform: "translateX(-50%)",
          background: DC.bg3, border: `1px solid ${DC.accent}`, borderRadius: 4,
          padding: "7px 16px", fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: DC.accent,
          zIndex: 300, whiteSpace: "nowrap",
        }}>
          {uiState.notification}
        </div>
      )}

      {/* Item overlay */}
      {uiState.showItems && (
        <DungeonItemOverlay
          items={uiState.items}
          itemFilter={uiState.itemFilter}
          onFilter={filterItems}
          onUse={useItem}
          onClose={closeItems}
          caneCharges={uiState.caneCharges}
        />
      )}

      {/* Death screen */}
      {(uiState.death ?? restoredDeath) && (
        <DungeonDeathScreen
          death={(uiState.death ?? restoredDeath)!}
          onRetry={() => {
            sessionStorage.removeItem(DUNGEON_DEATH_KEY);
            setRestoredDeath(null);
            startedRef.current = false;
            retryGame();
            startedRef.current = true;
          }}
          onBackToTitle={handleBackToTitle}
        />
      )}
    </div>
  );
}
