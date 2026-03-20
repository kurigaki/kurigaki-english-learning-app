"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type {
  GameState,
  DungeonQuestion,
  QuizState,
  QuizResult,
  DeathState,
  DmgPop,
  InventoryItem,
  Enemy,
  DungeonMode,
} from "@/lib/dungeon/types";
import { findPath } from "@/lib/dungeon/pathfinding";
import type { StageDefinition } from "@/data/words/courses";

export type DungeonSave = {
  gameState: GameState;
  questions: DungeonQuestion[];
  savedAt: string;
};

export type CaneCharges = {
  cane_blow: number;
  cane_sleep: number;
  cane_seal: number;
  cane_warp: number;
};
import { generateMap } from "@/lib/dungeon/map";
import { adjEnemy, moveEnemies, adj } from "@/lib/dungeon/ai";
import { drawMap, TILE } from "@/lib/dungeon/renderer";
import {
  sfxHit,
  sfxCrit,
  sfxMiss,
  sfxRecv,
  sfxCorrect,
  sfxWrong,
  sfxLevelUp,
  sfxStairs,
  sfxItem,
  startBGM,
  stopBGM,
} from "@/lib/dungeon/audio";
import { ITEMS_DEF, ENEMIES_DEF, MW, MH } from "@/lib/dungeon/constants";
import { speakWord } from "@/lib/audio";
import { storage } from "@/lib/storage";

export type ShopPrompt = {
  itemId: string;
  price: number;
  x: number;
  y: number;
};

export type UIState = {
  hp: number;
  mhp: number;
  lv: number;
  exp: number;
  enext: number;
  floor: number;
  turn: number;
  msg: string;
  msgLog: string[];
  onStairs: boolean;
  quiz: QuizState | null;
  quizAnswered: boolean;
  quizResult: QuizResult | null;
  showItems: boolean;
  itemFilter: string;
  death: DeathState | null;
  notification: string;
  items: InventoryItem[];
  caneCharges: CaneCharges;
  // New mechanics
  hunger: number;
  maxHunger: number;
  gold: number;
  shopPrompt: ShopPrompt | null;
};

const INITIAL_UI: UIState = {
  hp: 25,
  mhp: 25,
  lv: 1,
  exp: 0,
  enext: 30,
  floor: 1,
  turn: 0,
  msg: "ダンジョンに入った！",
  msgLog: [],
  onStairs: false,
  quiz: null,
  quizAnswered: false,
  quizResult: null,
  showItems: false,
  itemFilter: "all",
  death: null,
  notification: "",
  items: [],
  caneCharges: { cane_blow: 3, cane_sleep: 4, cane_seal: 4, cane_warp: 2 },
  hunger: 100,
  maxHunger: 100,
  gold: 0,
  shopPrompt: null,
};

export function initGameState(missedWords: string[] = [], dungeonMode: DungeonMode = "easy"): GameState {
  const healGrass = ITEMS_DEF.find((d) => d.id === "heal_grass")!;
  const scrollPower = ITEMS_DEF.find((d) => d.id === "scroll_power")!;
  const rice = ITEMS_DEF.find((d) => d.id === "rice")!;

  return {
    floor: 1,
    p: { hp: 25, mhp: 25, lv: 1, exp: 0, enext: 30, atk: 4 },
    items: [
      { id: healGrass.id, name: healGrass.name, icon: healGrass.icon, cat: healGrass.cat, desc: healGrass.desc, count: 2 },
      { id: scrollPower.id, name: scrollPower.name, icon: scrollPower.icon, cat: scrollPower.cat, desc: scrollPower.desc, count: 1 },
      { id: rice.id, name: rice.name, icon: rice.icon, cat: rice.cat, desc: rice.desc, count: 1 },
    ],
    map: [],
    rooms: [],
    px: 2,
    py: 2,
    enemies: [],
    itemTiles: [],
    stairsPos: null,
    turn: 0,
    kills: 0,
    correct: 0,
    wrong: 0,
    missedWords,
    powerUp: false,
    sureHit: false,
    onStairs: false,
    swiftTurns: 0,
    blindTurns: 0,
    cane_blow_charges: 3,
    cane_sleep_charges: 4,
    cane_seal_charges: 4,
    cane_warp_charges: 2,
    answeredQuestions: [],
    hunger: 100,
    maxHunger: 100,
    gold: 0,
    traps: [],
    shopItems: [],
    dungeonMode,
    monsterHouseRoomIdx: null,
  };
}

let _popId = 0;

/** フロア番号（1-5）をステージインデックスに変換する（プログレッシブモード用） */
function getStageForFloor(stages: StageDefinition[], floor: number): string {
  if (stages.length === 0) return "";
  const idx = Math.min(Math.floor((floor - 1) * stages.length / 5), stages.length - 1);
  return stages[idx].stage;
}

export function useDungeon(questions: DungeonQuestion[], progressiveStages?: StageDefinition[], dungeonMode: DungeonMode = "easy") {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<GameState | null>(null);
  const [uiState, setUiState] = useState<UIState>(INITIAL_UI);
  const [dmgPops, setDmgPops] = useState<DmgPop[]>([]);
  const msgQueueRef = useRef<string[]>([]);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // オートウォーク用
  const autoWalkPathRef = useRef<{ x: number; y: number }[]>([]);
  const autoWalkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const doTurnLatestRef = useRef<(dx: number, dy: number) => void>(() => {});

  const redraw = useCallback(() => {
    const g = gameRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!g || !canvas || !wrap) return;
    const vpW = wrap.clientWidth;
    const vpH = wrap.clientHeight;
    drawMap(canvas, g, vpW, vpH);
  }, []);

  const updateUI = useCallback((g: GameState, extra: Partial<UIState> = {}) => {
    setUiState((prev) => {
      const newMsg = extra.msg ?? prev.msg;
      const msgLog = extra.msg && extra.msg !== prev.msg
        ? [extra.msg, ...prev.msgLog].slice(0, 3)
        : prev.msgLog;
      return {
        ...prev,
        hp: g.p.hp,
        mhp: g.p.mhp,
        lv: g.p.lv,
        exp: g.p.exp,
        enext: g.p.enext,
        floor: g.floor,
        turn: g.turn,
        onStairs: g.onStairs,
        items: [...g.items],
        caneCharges: {
          cane_blow: g.cane_blow_charges,
          cane_sleep: g.cane_sleep_charges,
          cane_seal: g.cane_seal_charges,
          cane_warp: g.cane_warp_charges,
        },
        hunger: g.hunger,
        maxHunger: g.maxHunger,
        gold: g.gold,
        ...extra,
        msg: newMsg,
        msgLog,
      };
    });
  }, []);

  const showNotification = useCallback((msg: string) => {
    setUiState((prev) => ({ ...prev, notification: msg }));
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => {
      setUiState((prev) => ({ ...prev, notification: "" }));
    }, 2200);
  }, []);

  const queueMsg = useCallback((msg: string) => {
    msgQueueRef.current.push(msg);
  }, []);

  const flushMsg = useCallback(() => {
    const q = msgQueueRef.current;
    if (q.length > 0) {
      const last = q[q.length - 1];
      msgQueueRef.current = [];
      setUiState((prev) => ({
        ...prev,
        msg: last,
        msgLog: [last, ...prev.msgLog].slice(0, 3),
      }));
    }
  }, []);

  const addDmgPop = useCallback(
    (gx: number, gy: number, type: DmgPop["type"], value: number) => {
      const id = ++_popId;
      setDmgPops((prev) => [...prev, { id, gx, gy, type, value }]);
      setTimeout(() => {
        setDmgPops((prev) => prev.filter((p) => p.id !== id));
      }, 950);
    },
    []
  );

  const onEnemyDied = useCallback(
    (g: GameState, e: Enemy) => {
      g.kills++;
      g.p.exp += e.exp;
      g.enemies = g.enemies.filter((en) => en.id !== e.id);
      // Gold drop
      const goldDrop = 2 + Math.floor(Math.random() * 7); // 2-8 gold
      g.gold += goldDrop;
      queueMsg(`⚔️ ${e.name}を倒した！ EXP+${e.exp} 💰+${goldDrop}G`);
      if (g.p.exp >= g.p.enext) {
        g.p.lv++;
        g.p.exp -= g.p.enext;
        g.p.enext = Math.floor(g.p.enext * 1.5);
        g.p.mhp += 5;
        g.p.hp = Math.min(g.p.hp + 5, g.p.mhp);
        g.p.atk++;
        sfxLevelUp();
        showNotification(`✨ Lv${g.p.lv}アップ！ MaxHP+5 攻撃+1`);
      }
    },
    [queueMsg, showNotification]
  );

  const showDeath = useCallback(
    (g: GameState, isCleared: boolean) => {
      const missedWordDefs: DungeonQuestion[] = g.missedWords
        .map((w) => questions.find((q) => q.word === w))
        .filter((q): q is DungeonQuestion => q !== undefined);

      // XP・ストリーク更新
      const updatedUser = storage.recordStudySession(g.correct);

      // ダンジョン統計更新 & ベストスコア判定
      const prevStats = storage.getDungeonStats();
      const newRecords: string[] = [];
      if (g.floor > prevStats.maxFloor) newRecords.push("到達フロア");
      if (g.kills > prevStats.bestKills) newRecords.push("撃破数");
      if (g.correct > prevStats.bestCorrect) newRecords.push("正解数");

      const dungeonStats = {
        attempts: prevStats.attempts + 1,
        kills: prevStats.kills + g.kills,
        correct: prevStats.correct + g.correct,
        clears: prevStats.clears + (isCleared ? 1 : 0),
        maxFloor: Math.max(prevStats.maxFloor, g.floor),
        bestKills: Math.max(prevStats.bestKills, g.kills),
        bestCorrect: Math.max(prevStats.bestCorrect, g.correct),
      };
      storage.saveDungeonStats(dungeonStats);

      // ラン履歴を記録
      storage.addDungeonRunLog({
        floor: g.floor,
        kills: g.kills,
        correct: g.correct,
        wrong: g.wrong,
        turns: g.turn,
        isCleared,
      });

      // 実績チェック
      const totalRecords = storage.getRecords().length;
      const masteredWords = storage.getMasteredWordCount();
      storage.checkAndUnlockAchievements({
        totalQuestions: totalRecords,
        streak: updatedUser.streak,
        masteredWords,
        level: updatedUser.level,
        dungeonStats,
      });

      stopBGM();

      setUiState((prev) => ({
        ...prev,
        quiz: null,
        quizAnswered: false,
        quizResult: null,
        death: {
          floor: g.floor,
          lv: g.p.lv,
          kills: g.kills,
          correct: g.correct,
          wrong: g.wrong,
          turns: g.turn,
          missedWords: missedWordDefs,
          isCleared,
          newRecords,
          answeredQuestions: g.answeredQuestions,
        },
      }));
    },
    [questions]
  );

  const runEnemyTurn = useCallback(
    (g: GameState) => {
      g.turn++;
      // HP自然回復（4ターン毎）
      if (g.turn % 4 === 0 && g.p.hp < g.p.mhp) {
        g.p.hp = Math.min(g.p.hp + 1, g.p.mhp);
      }
      // 空腹度減少: easy=2ターン毎に1、hard=毎ターン1
      if (g.hunger > 0) {
        const decayThisTurn = g.dungeonMode === "hard" ? true : (g.turn % 2 === 0);
        if (decayThisTurn) {
          g.hunger = Math.max(0, g.hunger - 1);
          if (g.hunger === 0) queueMsg("🍂 お腹が空いた！HPが減っていく…");
          else if (g.hunger === 20) queueMsg("🍂 お腹が空いてきた…食料を食べよう！");
        }
      } else {
        // 空腹時はHPが減る（0になると死亡）
        g.p.hp = Math.max(0, g.p.hp - 2);
        if (g.p.hp <= 0) {
          updateUI(g);
          flushMsg();
          storage.clearDungeonGame();
          setTimeout(() => showDeath(g, false), 300);
          return;
        }
        queueMsg("💀 飢えでHPが限界に！");
      }
      // 足速ターンカウントダウン
      if (g.swiftTurns > 0) {
        g.swiftTurns--;
        if (g.swiftTurns === 0) setUiState((prev) => ({ ...prev, msg: "💨 素早さが戻った", msgLog: ["💨 素早さが戻った", ...prev.msgLog].slice(0, 3) }));
        updateUI(g);
        redraw();
        flushMsg();
        return;
      }
      // 盲目カウントダウン
      if (g.blindTurns > 0) {
        g.blindTurns--;
        if (g.blindTurns === 0) setUiState((prev) => ({ ...prev, msg: "👁️ 視界が戻った", msgLog: ["👁️ 視界が戻った", ...prev.msgLog].slice(0, 3) }));
        updateUI(g);
        redraw();
        flushMsg();
        return;
      }

      const results = moveEnemies(g);
      redraw();

      for (const res of results) {
        if (res.enemyHit) {
          sfxRecv();
          addDmgPop(g.px, g.py, "recv", res.damage);
          queueMsg(`💥 ${res.enemy.name}から${res.damage}ダメージを受けた！（残HP:${g.p.hp}）`);
          if (res.killedPlayer) {
            updateUI(g);
            flushMsg();
            storage.clearDungeonGame();
          setTimeout(() => showDeath(g, false), 300);
            return;
          }
        }
      }

      updateUI(g);
      flushMsg();

      const near = adjEnemy(g);
      if (near) {
        setUiState((prev) => {
          if (prev.msg === "足踏み中…" || prev.msg === "") {
            const m = `⚠ ${near.name}が隣にいる！ [Z]で攻撃`;
            return { ...prev, msg: m, msgLog: [m, ...prev.msgLog].slice(0, 3) };
          }
          return prev;
        });
      }
    },
    [addDmgPop, flushMsg, queueMsg, redraw, showDeath, updateUI]
  );

  const wakeEnemiesInRoom = useCallback((g: GameState, rx: number, ry: number) => {
    for (const e of g.enemies) {
      if (e.sleeping) {
        const ra = g.rooms.find(
          (r) =>
            e.x >= r.x && e.x < r.x + r.w && e.y >= r.y && e.y < r.y + r.h
        );
        if (ra) {
          const playerInRoom = rx >= ra.x && rx < ra.x + ra.w && ry >= ra.y && ry < ra.y + ra.h;
          if (playerInRoom) {
            e.sleeping = false;
            e.alert = true;
            addDmgPop(e.x, e.y, "wake", 0);
          }
        }
      }
    }
  }, [addDmgPop]);

  const applyItem = useCallback(
    (
      g: GameState,
      itemId: string,
      callbacks: {
        notify: (msg: string) => void;
        goNextFloor: () => void;
      }
    ): boolean => {
      const { notify, goNextFloor } = callbacks;

      switch (itemId) {
        case "heal_grass": {
          const v = 15;
          g.p.hp = Math.min(g.p.hp + v, g.p.mhp);
          sfxItem();
          notify(`💚 HPが${v}回復！`);
          return true;
        }
        case "big_heal": {
          g.p.hp = g.p.mhp;
          sfxItem();
          notify("💚 HPが全回復！");
          return true;
        }
        case "poison_grass": {
          g.p.hp = Math.min(g.p.hp + 5, g.p.mhp);
          sfxItem();
          notify("✨ 毒が消えた！");
          return true;
        }
        case "power_grass": {
          g.p.atk += 2;
          sfxLevelUp();
          notify(`⚔️ 攻撃力が${g.p.atk}になった！`);
          return true;
        }
        case "hp_grass": {
          g.p.mhp += 5;
          g.p.hp = Math.min(g.p.hp + 5, g.p.mhp);
          sfxLevelUp();
          notify(`❤️ 最大HPが${g.p.mhp}になった！`);
          return true;
        }
        case "swift_grass": {
          g.swiftTurns = (g.swiftTurns || 0) + 3;
          sfxItem();
          notify("💨 素早くなった！（3ターン）");
          return true;
        }
        case "sleep_grass": {
          let cnt = 0;
          g.enemies.forEach((e) => {
            if (adj(e.x, e.y, g.px, g.py) && !e.sleeping) {
              e.sleeping = true;
              e.alert = false;
              cnt++;
            }
          });
          sfxItem();
          notify(cnt > 0 ? `💤 ${cnt}体の敵が眠った！` : "近くに敵がいない");
          redraw();
          return true;
        }
        case "confuse_grass": {
          g.enemies.forEach((e) => {
            e.confused = (e.confused || 0) + 4;
          });
          sfxItem();
          notify("🌀 敵が混乱した！");
          return true;
        }
        case "warp_grass": {
          let tries = 0;
          let nx = 0;
          let ny = 0;
          do {
            nx = 1 + Math.floor(Math.random() * (MW - 2));
            ny = 1 + Math.floor(Math.random() * (MH - 2));
            tries++;
          } while (
            tries < 200 &&
            (g.map[ny][nx] === 0 || g.enemies.find((e) => e.x === nx && e.y === ny))
          );
          if (g.map[ny][nx] !== 0) {
            g.px = nx;
            g.py = ny;
            sfxStairs();
            notify("✨ ワープした！");
            redraw();
          }
          return true;
        }
        case "fire_grass": {
          let cnt = 0;
          const dead: Enemy[] = [];
          g.enemies.forEach((e) => {
            if (Math.abs(e.x - g.px) <= 2 && Math.abs(e.y - g.py) <= 2) {
              e.hp = Math.max(0, e.hp - 8);
              cnt++;
              addDmgPop(e.x, e.y, "hit", 8);
              if (e.hp <= 0) dead.push(e);
            }
          });
          dead.forEach((e) => {
            setTimeout(() => {
              onEnemyDied(g, e);
              updateUI(g);
              redraw();
            }, 100);
          });
          g.enemies = g.enemies.filter((e) => e.hp > 0);
          sfxCrit();
          notify(cnt > 0 ? `🔥 ${cnt}体に8ダメージ！` : "周囲に敵がいない");
          redraw();
          return true;
        }
        case "scroll_identify": {
          sfxItem();
          notify("🔍 アイテムの正体が分かった！（フレーバー）");
          return true;
        }
        case "scroll_hp": {
          const v = 20;
          g.p.hp = Math.min(g.p.hp + v, g.p.mhp);
          sfxItem();
          notify(`💚 HPが${v}回復！`);
          return true;
        }
        case "scroll_power": {
          g.sureHit = true;
          sfxItem();
          notify("🎯 次の攻撃が必中！");
          return true;
        }
        case "scroll_attack": {
          g.powerUp = true;
          sfxItem();
          notify("💪 次の攻撃が強化！");
          return true;
        }
        case "scroll_sleep": {
          g.enemies.forEach((e) => {
            e.sleeping = true;
            e.alert = false;
          });
          sfxItem();
          notify("💤 全ての敵が眠った！");
          redraw();
          return true;
        }
        case "scroll_escape": {
          goNextFloor();
          return true;
        }
        case "scroll_monster": {
          let spawned = 0;
          for (let t2 = 0; t2 < 50 && spawned < 3; t2++) {
            const sx = g.px - 3 + Math.floor(Math.random() * 7);
            const sy = g.py - 3 + Math.floor(Math.random() * 7);
            if (sx < 0 || sx >= MW || sy < 0 || sy >= MH || g.map[sy][sx] === 0) continue;
            if (g.enemies.find((e) => e.x === sx && e.y === sy)) continue;
            if (sx === g.px && sy === g.py) continue;
            const pool = ENEMIES_DEF.filter((e) => e.floor <= Math.min(g.floor, 3));
            const tmpl = pool[Math.floor(Math.random() * pool.length)];
            g.enemies.push({
              ...tmpl,
              hp: tmpl.mhp,
              x: sx,
              y: sy,
              id: Date.now() + spawned,
              alert: true,
              sleeping: false,
              confused: 0,
              sealed: 0,
              wanderTarget: null,
              lastDx: undefined,
              lastDy: undefined,
              stuckCount: 0,
            });
            spawned++;
          }
          sfxRecv();
          notify(`👹 ${spawned}体の魔物が現れた！`);
          redraw();
          return true;
        }
        case "scroll_map": {
          sfxItem();
          notify("🗺️ フロアの地形が頭に浮かんだ！");
          return true;
        }
        case "scroll_blind": {
          g.blindTurns = (g.blindTurns || 0) + 4;
          sfxWrong();
          notify("💀 呪われた！数ターン動けない！");
          return true;
        }
        case "cane_blow": {
          if (g.cane_blow_charges <= 0) {
            notify("💨 杖の魔力が尽きた");
            return false;
          }
          const e = adjEnemy(g);
          if (!e) {
            notify("🪄 正面に敵がいない");
            return false;
          }
          let tx = e.x;
          let ty = e.y;
          const dx = e.x - g.px;
          const dy = e.y - g.py;
          for (let i = 0; i < 4; i++) {
            const nx = tx + dx;
            const ny = ty + dy;
            if (nx < 0 || nx >= MW || ny < 0 || ny >= MH || g.map[ny][nx] === 0) break;
            if (!g.enemies.find((o) => o.id !== e.id && o.x === nx && o.y === ny)) {
              tx = nx;
              ty = ny;
            } else break;
          }
          e.x = tx;
          e.y = ty;
          g.cane_blow_charges--;
          sfxCrit();
          notify(`💨 ${e.name}を吹き飛ばした！（残${g.cane_blow_charges}回）`);
          redraw();
          return true;
        }
        case "cane_sleep": {
          if (g.cane_sleep_charges <= 0) {
            notify("😴 杖の魔力が尽きた");
            return false;
          }
          const e = adjEnemy(g);
          if (!e) {
            notify("🪄 正面に敵がいない");
            return false;
          }
          e.sleeping = true;
          e.alert = false;
          g.cane_sleep_charges--;
          sfxItem();
          notify(`💤 ${e.name}が眠った！（残${g.cane_sleep_charges}回）`);
          redraw();
          return true;
        }
        case "cane_seal": {
          if (g.cane_seal_charges <= 0) {
            notify("🔒 杖の魔力が尽きた");
            return false;
          }
          const e = adjEnemy(g);
          if (!e) {
            notify("🪄 正面に敵がいない");
            return false;
          }
          e.sealed = (e.sealed || 0) + 5;
          e.alert = false;
          g.cane_seal_charges--;
          sfxItem();
          notify(`🔒 ${e.name}を封印した！（残${g.cane_seal_charges}回）`);
          return true;
        }
        case "cane_warp": {
          if (g.cane_warp_charges <= 0) {
            notify("🌀 杖の魔力が尽きた");
            return false;
          }
          const e = adjEnemy(g);
          if (!e) {
            notify("🪄 正面に敵がいない");
            return false;
          }
          g.enemies = g.enemies.filter((en) => en.id !== e.id);
          g.cane_warp_charges--;
          sfxStairs();
          notify(`🌀 ${e.name}がワープした！（残${g.cane_warp_charges}回）`);
          redraw();
          return true;
        }
        case "rice": {
          g.p.hp = g.p.mhp;
          g.hunger = g.maxHunger;
          sfxItem();
          notify("🍙 HP全回復！空腹も満たされた！");
          return true;
        }
        case "rice_big": {
          g.p.mhp += 3;
          g.p.hp = g.p.mhp;
          g.hunger = g.maxHunger;
          sfxLevelUp();
          notify("🍱 HP全回復＆最大HP+3！空腹も満たされた！");
          return true;
        }
        case "herb": {
          const v = 12;
          g.p.hp = Math.min(g.p.hp + v, g.p.mhp);
          g.hunger = Math.min(g.maxHunger, g.hunger + 20);
          sfxItem();
          notify(`💚 HPが${v}回復！空腹度+20`);
          return true;
        }
        case "jar_store": {
          const v = 18;
          g.p.hp = Math.min(g.p.hp + v, g.p.mhp);
          g.hunger = Math.min(g.maxHunger, g.hunger + 30);
          sfxItem();
          notify(`🫙 壷から${v}HP回復！空腹度+30`);
          return true;
        }
        case "jar_exp": {
          g.p.exp = g.p.enext;
          if (g.p.exp >= g.p.enext) {
            g.p.lv++;
            g.p.exp -= g.p.enext;
            g.p.enext = Math.floor(g.p.enext * 1.5);
            g.p.mhp += 5;
            g.p.hp = Math.min(g.p.hp + 5, g.p.mhp);
            sfxLevelUp();
            notify(`🏺 経験値補充！ Lv${g.p.lv}にアップ！`);
          } else {
            sfxItem();
            notify("🏺 経験値を補充した！");
          }
          return true;
        }
        case "jar_curse": {
          g.p.hp = Math.max(1, Math.floor(g.p.hp / 2));
          sfxWrong();
          notify("💀 呪いの壷！HPが半分に…");
          return true;
        }
        case "escape_wing": {
          goNextFloor();
          return true;
        }
        case "lucky_gold": {
          g.sureHit = true;
          g.powerUp = true;
          sfxLevelUp();
          notify("🪙 幸運が宿った！必中&会心確定！");
          return true;
        }
        default:
          return false;
      }
    },
    [addDmgPop, onEnemyDied, redraw, updateUI]
  );

  const goNextFloor = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    g.onStairs = false;
    g.floor++;
    if (g.floor > 5) {
      storage.clearDungeonGame();
      showDeath(g, true);
      return;
    }
    sfxStairs();
    generateMap(g);

    // プログレッシブモード: フロア移動時にステージ変化を通知
    let stageNotice = "";
    if (progressiveStages && progressiveStages.length > 0) {
      const prevStage = getStageForFloor(progressiveStages, g.floor - 1);
      const nextStage = getStageForFloor(progressiveStages, g.floor);
      if (nextStage !== prevStage) {
        const stageDef = progressiveStages.find((s) => s.stage === nextStage);
        if (stageDef) stageNotice = `⚠ ここから「${stageDef.displayName}」の問題が出現！`;
      }
    }

    updateUI(g, { quiz: null, quizAnswered: false, quizResult: null, msg: `✨ B${g.floor}Fへ降りた！` });
    if (stageNotice) showNotification(stageNotice);
    redraw();
    // フロア移動後に自動セーブ（次回「続きから」で再開できる）
    setTimeout(() => {
      const save: DungeonSave = {
        gameState: { ...g, enemies: g.enemies.map((e) => ({ ...e })), items: g.items.map((i) => ({ ...i })), itemTiles: [...g.itemTiles], map: g.map.map((row) => [...row]), rooms: [...g.rooms] },
        questions,
        savedAt: new Date().toISOString(),
      };
      storage.saveDungeonGame(save);
    }, 100);
  }, [questions, progressiveStages, redraw, showDeath, showNotification, updateUI]);

  const initiateAttack = useCallback(
    (g: GameState, e: Enemy) => {
      // プログレッシブモード: 現在フロアに対応するステージの問題のみ出題
      const floorStage = progressiveStages && progressiveStages.length > 0
        ? getStageForFloor(progressiveStages, g.floor)
        : null;
      const basePool = floorStage
        ? questions.filter((q) => q.stage === floorStage)
        : [...questions];
      // フィルタ後の pool が空なら全体にフォールバック
      const effectivePool = basePool.length > 0 ? basePool : [...questions];

      // 問題選択（ミス単語を優先）
      let pool = [...effectivePool];
      if (g.missedWords.length > 0 && Math.random() < 0.6) {
        const mw = g.missedWords[Math.floor(Math.random() * g.missedWords.length)];
        const f = effectivePool.find((q) => q.word === mw);
        if (f) pool = [f, ...pool.filter((q) => q.word !== mw)];
      }
      const q = pool[Math.floor(Math.random() * pool.length)];

      const choices = [...q.ch].sort(() => Math.random() - 0.5);

      setUiState((prev) => ({
        ...prev,
        quiz: { enemy: e, question: q, choiceOrder: choices },
        quizAnswered: false,
        quizResult: null,
      }));

      // 単語を自動読み上げ
      speakWord(q.word);
    },
    [questions, progressiveStages]
  );

  const doTurn = useCallback(
    (dx: number, dy: number) => {
      const g = gameRef.current;
      if (!g) return;
      // quiz active guard
      if (uiState.quiz && !uiState.quizAnswered) return;

      const nx = g.px + dx;
      const ny = g.py + dy;
      if (nx < 0 || nx >= MW || ny < 0 || ny >= MH || g.map[ny][nx] === 0) return;

      const eAt = g.enemies.find((e) => e.x === nx && e.y === ny);
      if (eAt) {
        if (eAt.sleeping) {
          eAt.sleeping = false;
          eAt.alert = true;
          addDmgPop(eAt.x, eAt.y, "wake", 0);
        }
        initiateAttack(g, eAt);
        return;
      }

      // 移動
      g.px = nx;
      g.py = ny;
      g.onStairs = !!(g.stairsPos && nx === g.stairsPos.x && ny === g.stairsPos.y);

      // 罠チェック
      let trapMsg: string | null = null;
      if (g.traps) {
        const trapIdx = g.traps.findIndex((t) => t.x === nx && t.y === ny);
        if (trapIdx >= 0) {
          const trap = g.traps[trapIdx];
          trap.visible = true;
          switch (trap.type) {
            case "damage": {
              const dmg = g.dungeonMode === "hard" ? 6 + Math.floor(Math.random() * 5) : 3 + Math.floor(Math.random() * 4);
              g.p.hp = Math.max(1, g.p.hp - dmg);
              sfxRecv();
              addDmgPop(nx, ny, "recv", dmg);
              trapMsg = `⚡ ダメージトラップ！ ${dmg}ダメージを受けた！`;
              break;
            }
            case "sleep": {
              const turns = 3 + Math.floor(Math.random() * 3);
              // blindTurns は「動けない」全般に共用（眠り罠・盲目の巻物どちらも同じ効果）
              g.blindTurns = (g.blindTurns || 0) + turns;
              trapMsg = `💤 眠りトラップ！ ${turns}ターン動けない！`;
              break;
            }
            case "warp": {
              let tries = 0;
              let wx = nx; let wy = ny;
              do {
                wx = 1 + Math.floor(Math.random() * (MW - 2));
                wy = 1 + Math.floor(Math.random() * (MH - 2));
                tries++;
              } while (tries < 200 && (g.map[wy][wx] === 0 || g.enemies.find((e) => e.x === wx && e.y === wy)));
              if (g.map[wy][wx] !== 0) { g.px = wx; g.py = wy; }
              trapMsg = "🌀 ワープトラップ！ 飛ばされた！";
              break;
            }
            case "hunger": {
              const loss = 20 + Math.floor(Math.random() * 20);
              g.hunger = Math.max(0, g.hunger - loss);
              trapMsg = `🍂 空腹トラップ！ 空腹度-${loss}！`;
              break;
            }
          }
          g.traps.splice(trapIdx, 1);
          if (trapMsg) queueMsg(trapMsg);
        }
      }

      // アイテム取得
      const iIdx = g.itemTiles.findIndex((i) => i.x === g.px && i.y === g.py);
      if (iIdx >= 0) {
        const it = g.itemTiles.splice(iIdx, 1)[0];
        const def = ITEMS_DEF.find((d) => d.id === it.id);
        if (def) {
          const ex = g.items.find((i) => i.id === it.id);
          if (ex) ex.count++;
          else
            g.items.push({
              id: def.id,
              name: def.name,
              icon: def.icon,
              desc: def.desc,
              cat: def.cat,
              count: 1,
            });
          sfxItem();
          queueMsg(`${def.icon}${def.name}を拾った！`);
        }
      }

      // ショップタイルチェック
      let newShopPrompt: ShopPrompt | null = null;
      if (g.shopItems) {
        const shop = g.shopItems.find((s) => s.x === g.px && s.y === g.py);
        if (shop) {
          const def = ITEMS_DEF.find((d) => d.id === shop.itemId);
          newShopPrompt = { itemId: shop.itemId, price: shop.price, x: shop.x, y: shop.y };
          queueMsg(`🏪 ${def?.icon}${def?.name} ${shop.price}G で売っている`);
        }
      }

      // 部屋への侵入で起床
      wakeEnemiesInRoom(g, g.px, g.py);

      // 敵のターン
      runEnemyTurn(g);

      // ショッププロンプトを更新（runEnemyTurnのupdateUIより後に適用）
      setUiState((prev) => ({ ...prev, shopPrompt: newShopPrompt }));
    },
    [addDmgPop, initiateAttack, queueMsg, runEnemyTurn, uiState.quiz, uiState.quizAnswered, wakeEnemiesInRoom]
  );

  const playerAttack = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (uiState.quiz && !uiState.quizAnswered) return;
    const e = adjEnemy(g);
    if (!e) {
      setUiState((prev) => ({ ...prev, msg: "隣に敵がいない", msgLog: ["隣に敵がいない", ...prev.msgLog].slice(0, 3) }));
      return;
    }
    if (e.sleeping) {
      e.sleeping = false;
      e.alert = true;
      addDmgPop(e.x, e.y, "wake", 0);
    }
    initiateAttack(g, e);
  }, [addDmgPop, initiateAttack, uiState.quiz, uiState.quizAnswered]);

  const doWait = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (uiState.quiz && !uiState.quizAnswered) return;
    if (g.onStairs) {
      goNextFloor();
      return;
    }
    queueMsg("足踏み中…");
    runEnemyTurn(g);
  }, [goNextFloor, queueMsg, runEnemyTurn, uiState.quiz, uiState.quizAnswered]);

  const answerQuiz = useCallback(
    (chosen: string) => {
      const g = gameRef.current;
      if (!g) return;

      setUiState((prev) => {
        if (prev.quizAnswered || !prev.quiz) return prev;

        const q = prev.quiz.question;
        const e = prev.quiz.enemy;
        const correct = chosen === q.ans;

        let damage = 0;
        let miss = false;
        let crit = false;

        // アプリの学習記録に保存（wordId=0 はフォールバック単語なのでスキップ）
        if (q.wordId !== 0) {
          storage.addRecord({
            wordId: q.wordId,
            word: q.word,
            meaning: q.ans,
            questionType: "en-to-ja",
            correct,
          });
        }

        // 回答履歴を記録
        g.answeredQuestions.push({ question: q, correct });

        if (correct) {
          g.correct++;
          g.missedWords = g.missedWords.filter((w) => w !== q.word);
          // 正解で空腹度回復
          g.hunger = Math.min(g.maxHunger, g.hunger + 3);
          sfxCorrect();
          const hitRate = g.sureHit ? 1 : 0.9;
          g.sureHit = false;
          const hit = Math.random() < hitRate;
          if (hit) {
            damage = g.p.atk + Math.floor(Math.random() * 3);
            crit = g.powerUp;
            if (crit) {
              damage *= 2;
              g.powerUp = false;
            }
            e.hp = Math.max(0, e.hp - damage);
            if (crit) { sfxCrit(); } else { sfxHit(); }
            addDmgPop(e.x, e.y, crit ? "crit" : "hit", damage);
            queueMsg(`✅ 正解！ ${e.name}に${damage}ダメージ${crit ? " 会心！" : ""}`);
          } else {
            g.powerUp = false;
            miss = true;
            sfxMiss();
            addDmgPop(e.x, e.y, "miss", 0);
            queueMsg("✅ 正解！ しかしミスった…");
          }
        } else {
          g.wrong++;
          if (!g.missedWords.includes(q.word)) g.missedWords.push(q.word);
          sfxWrong();
          const hitRate = g.sureHit ? 0.55 : 0.4;
          g.sureHit = false;
          const hit = Math.random() < hitRate;
          if (hit) {
            damage = 1 + Math.floor(Math.random() * 2);
            if (g.powerUp) {
              damage = Math.ceil(damage * 1.5);
              g.powerUp = false;
            }
            e.hp = Math.max(0, e.hp - damage);
            sfxHit();
            addDmgPop(e.x, e.y, "hit", damage);
            queueMsg(`❌ 不正解（正解:${q.ans}） ${e.name}に${damage}dmg`);
          } else {
            g.powerUp = false;
            miss = true;
            sfxMiss();
            addDmgPop(e.x, e.y, "miss", 0);
            queueMsg(`❌ 不正解（正解:${q.ans}） ミス…`);
          }
        }

        // Update enemy hp in quiz state
        const updatedEnemy = { ...e };
        const result: QuizResult = { correct, damage, miss, crit };

        if (e.hp <= 0) {
          setTimeout(() => {
            onEnemyDied(g, e);
            setUiState((p) => ({ ...p, quiz: null, quizAnswered: false, quizResult: null }));
            runEnemyTurn(g);
          }, 500);
        } else {
          setTimeout(() => {
            setUiState((p) => ({ ...p, quiz: null, quizAnswered: false, quizResult: null }));
            runEnemyTurn(g);
          }, 750);
        }

        return {
          ...prev,
          quizAnswered: true,
          quizResult: result,
          quiz: { ...prev.quiz, enemy: updatedEnemy },
        };
      });
    },
    [addDmgPop, onEnemyDied, queueMsg, runEnemyTurn]
  );

  const openItems = useCallback(() => {
    setUiState((prev) => ({ ...prev, showItems: true, itemFilter: "all" }));
  }, []);

  const closeItems = useCallback(() => {
    setUiState((prev) => ({ ...prev, showItems: false }));
  }, []);

  const filterItems = useCallback((cat: string) => {
    setUiState((prev) => ({ ...prev, itemFilter: cat }));
  }, []);

  const useItem = useCallback(
    (itemId: string) => {
      const g = gameRef.current;
      if (!g) return;
      const item = g.items.find((i) => i.id === itemId);
      if (!item) return;
      // 杖は charges が別管理なので count が 0 でも使用試行を許可
      if (item.count <= 0 && item.cat !== "cane") return;

      const used = applyItem(g, itemId, {
        notify: showNotification,
        goNextFloor,
      });

      if (used) {
        // 杖は count を消費しない（charges で管理）
        if (item.cat !== "cane") {
          item.count--;
        }
        closeItems();
        updateUI(g);
      }
    },
    [applyItem, closeItems, goNextFloor, showNotification, updateUI]
  );

  const buyFromShop = useCallback(
    (shopPrompt: ShopPrompt) => {
      const g = gameRef.current;
      if (!g) return;
      if (g.gold < shopPrompt.price) {
        showNotification("💰 お金が足りない！");
        return;
      }
      const shopIdx = g.shopItems?.findIndex((s) => s.x === shopPrompt.x && s.y === shopPrompt.y) ?? -1;
      if (shopIdx < 0) {
        setUiState((prev) => ({ ...prev, shopPrompt: null }));
        return;
      }
      g.gold -= shopPrompt.price;
      g.shopItems.splice(shopIdx, 1);
      const def = ITEMS_DEF.find((d) => d.id === shopPrompt.itemId);
      if (def) {
        const ex = g.items.find((i) => i.id === shopPrompt.itemId);
        if (ex) ex.count++;
        else g.items.push({ id: def.id, name: def.name, icon: def.icon, cat: def.cat, desc: def.desc, count: 1 });
      }
      sfxItem();
      showNotification(`🏪 ${def?.name ?? shopPrompt.itemId}を購入！`);
      updateUI(g, { shopPrompt: null });
      redraw();
    },
    [redraw, showNotification, updateUI]
  );

  const skipShop = useCallback(() => {
    setUiState((prev) => ({ ...prev, shopPrompt: null }));
  }, []);

  // ── オートウォーク ──────────────────────────────────────────────
  const stopAutoWalk = useCallback(() => {
    if (autoWalkTimerRef.current) {
      clearTimeout(autoWalkTimerRef.current);
      autoWalkTimerRef.current = null;
    }
    autoWalkPathRef.current = [];
  }, []);

  const scheduleWalkStep = useCallback(() => {
    const step = () => {
      const g = gameRef.current;
      const path = autoWalkPathRef.current;
      if (!g || path.length === 0) { autoWalkPathRef.current = []; return; }
      // 隣に敵がいたら停止
      if (adjEnemy(g)) { autoWalkPathRef.current = []; return; }
      const next = path[0];
      // 通路が壁になっていたら停止（再生成などで変化した場合）
      if (!next || g.map[next.y]?.[next.x] === 0) { autoWalkPathRef.current = []; return; }
      autoWalkPathRef.current = path.slice(1);
      doTurnLatestRef.current(next.x - g.px, next.y - g.py);
      if (autoWalkPathRef.current.length > 0) {
        autoWalkTimerRef.current = setTimeout(step, 160);
      }
    };
    if (autoWalkTimerRef.current) clearTimeout(autoWalkTimerRef.current);
    autoWalkTimerRef.current = setTimeout(step, 160);
  }, []);

  const handleCanvasTap = useCallback((tileX: number, tileY: number) => {
    const g = gameRef.current;
    if (!g) return;
    stopAutoWalk();
    // アイテム画面・死亡・クイズ中は無視（doTurn 側でも quiz guard あり）
    const dx = tileX - g.px;
    const dy = tileY - g.py;
    if (dx === 0 && dy === 0) return;
    // 隣接タイル（マンハッタン距離 1）
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      doTurnLatestRef.current(dx, dy);
      return;
    }
    // 非隣接：A* でパスを探して自動歩行
    const path = findPath(g.map, { x: g.px, y: g.py }, { x: tileX, y: tileY }, g.enemies);
    if (path.length > 0) {
      autoWalkPathRef.current = path;
      scheduleWalkStep();
    }
  }, [stopAutoWalk, scheduleWalkStep]);

  // ── セーブ / ロード ──────────────────────────────────────────────
  const saveGame = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    const save: DungeonSave = {
      gameState: { ...g, enemies: g.enemies.map((e) => ({ ...e })), items: g.items.map((i) => ({ ...i })), itemTiles: [...g.itemTiles], map: g.map.map((row) => [...row]), rooms: [...g.rooms] },
      questions,
      savedAt: new Date().toISOString(),
    };
    storage.saveDungeonGame(save);
  }, [questions]);

  const loadSave = useCallback((savedState: GameState) => {
    // Backward compatibility: fill in new fields if missing from old saves
    // Cast to partial to allow runtime saves missing these new fields
    const raw = savedState as Partial<GameState> & Omit<GameState, "hunger" | "maxHunger" | "gold" | "traps" | "shopItems" | "dungeonMode" | "monsterHouseRoomIdx">;
    const migrated: GameState = {
      ...savedState,
      hunger: raw.hunger ?? 100,
      maxHunger: raw.maxHunger ?? 100,
      gold: raw.gold ?? 0,
      traps: raw.traps ?? [],
      shopItems: raw.shopItems ?? [],
      dungeonMode: raw.dungeonMode ?? "easy",
      monsterHouseRoomIdx: raw.monsterHouseRoomIdx ?? null,
    };
    gameRef.current = migrated;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = MW * TILE;
      canvas.height = MH * TILE;
      canvas.style.width = MW * TILE + "px";
      canvas.style.height = MH * TILE + "px";
    }
    updateUI(migrated, { msg: `セーブデータを読み込んだ！（B${migrated.floor}F）` });
    setTimeout(() => {
      redraw();
      startBGM();
    }, 50);
  }, [redraw, updateUI]);

  const startGame = useCallback(() => {
    storage.clearDungeonGame();
    const g = initGameState([], dungeonMode);
    gameRef.current = g;
    generateMap(g);
    updateUI(g, { msg: "ダンジョンに入った！" });
    // canvas サイズ設定
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = MW * TILE;
      canvas.height = MH * TILE;
      canvas.style.width = MW * TILE + "px";
      canvas.style.height = MH * TILE + "px";
    }
    // ゲーム開始直後にセーブ（「続きから」を有効にするため）
    setTimeout(() => {
      const save: DungeonSave = {
        gameState: { ...g, enemies: g.enemies.map((e) => ({ ...e })), items: g.items.map((i) => ({ ...i })), itemTiles: [...g.itemTiles], map: g.map.map((row) => [...row]), rooms: [...g.rooms] },
        questions,
        savedAt: new Date().toISOString(),
      };
      storage.saveDungeonGame(save);
      redraw();
      startBGM();
    }, 50);
  }, [dungeonMode, questions, redraw, updateUI]);

  const retryGame = useCallback(() => {
    storage.clearDungeonGame();
    stopAutoWalk();
    const prevMissed = gameRef.current?.missedWords ?? [];
    const g = initGameState(prevMissed, dungeonMode);
    gameRef.current = g;
    generateMap(g);
    updateUI(g, {
      death: null,
      quiz: null,
      quizAnswered: false,
      quizResult: null,
      msg: "再挑戦！ 前回の間違い単語が再出題される",
    });
    setTimeout(() => {
      redraw();
      startBGM();
    }, 50);
  }, [dungeonMode, redraw, stopAutoWalk, updateUI]);

  // doTurn が再生成されるたびに最新参照を更新（オートウォークで常に最新版を呼ぶため）
  useEffect(() => {
    doTurnLatestRef.current = doTurn;
  }, [doTurn]);

  // アンマウント時にBGM停止・オートウォーク停止
  useEffect(() => {
    return () => {
      stopBGM();
      stopAutoWalk();
    };
  }, [stopAutoWalk]);

  // resize
  useEffect(() => {
    const handleResize = () => {
      if (gameRef.current) redraw();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [redraw]);

  return {
    canvasRef,
    wrapRef,
    uiState,
    dmgPops,
    startGame,
    doTurn,
    playerAttack,
    doWait,
    answerQuiz,
    goNextFloor,
    useItem,
    openItems,
    closeItems,
    filterItems,
    retryGame,
    saveGame,
    loadSave,
    stopAutoWalk,
    handleCanvasTap,
    buyFromShop,
    skipShop,
  };
}
