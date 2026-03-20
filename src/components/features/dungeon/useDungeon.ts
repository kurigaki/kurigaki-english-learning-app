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
} from "@/lib/dungeon/types";
import { findPath } from "@/lib/dungeon/pathfinding";

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

export type UIState = {
  hp: number;
  mhp: number;
  lv: number;
  exp: number;
  enext: number;
  floor: number;
  msg: string;
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
};

const INITIAL_UI: UIState = {
  hp: 25,
  mhp: 25,
  lv: 1,
  exp: 0,
  enext: 30,
  floor: 1,
  msg: "ダンジョンに入った！",
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
};

export function initGameState(missedWords: string[] = []): GameState {
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
  };
}

let _popId = 0;

export function useDungeon(questions: DungeonQuestion[]) {
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
    setUiState((prev) => ({
      ...prev,
      hp: g.p.hp,
      mhp: g.p.mhp,
      lv: g.p.lv,
      exp: g.p.exp,
      enext: g.p.enext,
      floor: g.floor,
      onStairs: g.onStairs,
      items: [...g.items],
      caneCharges: {
        cane_blow: g.cane_blow_charges,
        cane_sleep: g.cane_sleep_charges,
        cane_seal: g.cane_seal_charges,
        cane_warp: g.cane_warp_charges,
      },
      ...extra,
    }));
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
      setUiState((prev) => ({ ...prev, msg: last }));
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
      queueMsg(`⚔️ ${e.name}を倒した！ EXP+${e.exp}`);
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
      // 足速ターンカウントダウン
      if (g.swiftTurns > 0) {
        g.swiftTurns--;
        if (g.swiftTurns === 0) setUiState((prev) => ({ ...prev, msg: "💨 素早さが戻った" }));
        updateUI(g);
        redraw();
        flushMsg();
        return;
      }
      // 盲目カウントダウン
      if (g.blindTurns > 0) {
        g.blindTurns--;
        if (g.blindTurns === 0) setUiState((prev) => ({ ...prev, msg: "👁️ 視界が戻った" }));
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
            return { ...prev, msg: `⚠ ${near.name}が隣にいる！ [Z]で攻撃` };
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
          sfxItem();
          notify("🍙 HP全回復！");
          return true;
        }
        case "rice_big": {
          g.p.mhp += 3;
          g.p.hp = g.p.mhp;
          sfxLevelUp();
          notify("🍱 HP全回復＆最大HP+3！");
          return true;
        }
        case "herb": {
          const v = 12;
          g.p.hp = Math.min(g.p.hp + v, g.p.mhp);
          sfxItem();
          notify(`💚 HPが${v}回復！`);
          return true;
        }
        case "jar_store": {
          const v = 18;
          g.p.hp = Math.min(g.p.hp + v, g.p.mhp);
          sfxItem();
          notify(`🫙 壷から${v}HP回復！`);
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
    updateUI(g, { quiz: null, quizAnswered: false, quizResult: null, msg: `✨ B${g.floor}Fへ降りた！` });
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
  }, [questions, redraw, showDeath, updateUI]);

  const initiateAttack = useCallback(
    (g: GameState, e: Enemy) => {
      // 問題選択（ミス単語を優先）
      let pool = [...questions];
      if (g.missedWords.length > 0 && Math.random() < 0.6) {
        const mw = g.missedWords[Math.floor(Math.random() * g.missedWords.length)];
        const f = questions.find((q) => q.word === mw);
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
    [questions]
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

      // アイテム取得
      const iIdx = g.itemTiles.findIndex((i) => i.x === nx && i.y === ny);
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

      // 部屋への侵入で起床
      wakeEnemiesInRoom(g, nx, ny);

      // 敵のターン
      runEnemyTurn(g);
    },
    [addDmgPop, initiateAttack, queueMsg, runEnemyTurn, uiState.quiz, uiState.quizAnswered, wakeEnemiesInRoom]
  );

  const playerAttack = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (uiState.quiz && !uiState.quizAnswered) return;
    const e = adjEnemy(g);
    if (!e) {
      setUiState((prev) => ({ ...prev, msg: "隣に敵がいない" }));
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
    gameRef.current = savedState;
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = MW * TILE;
      canvas.height = MH * TILE;
      canvas.style.width = MW * TILE + "px";
      canvas.style.height = MH * TILE + "px";
    }
    updateUI(savedState, { msg: `セーブデータを読み込んだ！（B${savedState.floor}F）` });
    setTimeout(() => {
      redraw();
      startBGM();
    }, 50);
  }, [redraw, updateUI]);

  const startGame = useCallback(() => {
    storage.clearDungeonGame();
    const g = initGameState();
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
  }, [questions, redraw, updateUI]);

  const retryGame = useCallback(() => {
    storage.clearDungeonGame();
    stopAutoWalk();
    const prevMissed = gameRef.current?.missedWords ?? [];
    const g = initGameState(prevMissed);
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
  }, [redraw, stopAutoWalk, updateUI]);

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
  };
}
