/**
 * 今日の単語（Word of the Day）ユーティリティ
 *
 * 日付文字列をシードとした疑似乱数で、毎日同じ単語セットを
 * 再現性を持って選択する。
 */

import type { Word } from "@/data/words";

/**
 * 日付文字列 "YYYY-MM-DD" を整数シードに変換する。
 * 例: "2026-02-20" → 20260220 → 各桁を混ぜたハッシュ値
 */
function dateSeed(dateStr: string): number {
  // "YYYY-MM-DD" → 数値（例: 20260220）
  const n = parseInt(dateStr.replace(/-/g, ""), 10);
  // ビット混合（Murmur3 finalization mix ベース）
  let h = n;
  h = (h ^ 61) ^ (h >>> 16);
  h = Math.imul(h, 0x45d9f3b);
  h ^= h >>> 11;
  h = Math.imul(h, 0x0c4f6d5d);
  h ^= h >>> 15;
  return h >>> 0; // 符号なし 32bit に正規化
}

/**
 * XorShift32 による軽量シード付き疑似乱数生成器。
 * 同じシードなら毎回同じ数列を生成する。
 */
function createSeededRng(seed: number): () => number {
  let s = seed === 0 ? 1 : seed; // XorShift は 0 を避ける
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s = s >>> 0; // 符号なし 32bit
    return s / 0x100000000; // [0, 1) に正規化
  };
}

/**
 * 日付シードを使って単語リストから count 語をランダムに選択する。
 *
 * - 同じ日付・同じリストには常に同じ結果を返す（再現性）
 * - 重複なし（Fisher-Yates shuffle の部分適用）
 * - count > words.length の場合は全単語を返す
 */
export function pickDailyWords(words: Word[], dateStr: string, count: number): Word[] {
  if (words.length === 0 || count <= 0) return [];

  const seed = dateSeed(dateStr);
  const rng = createSeededRng(seed);

  // 浅いコピーに対して部分 Fisher-Yates シャッフルを実行
  const pool = [...words];
  const actualCount = Math.min(count, pool.length);
  const result: Word[] = [];

  for (let i = 0; i < actualCount; i++) {
    const remaining = pool.length - i;
    const j = i + Math.floor(rng() * remaining);
    // pool[i] と pool[j] を交換
    [pool[i], pool[j]] = [pool[j], pool[i]];
    result.push(pool[i]);
  }

  return result;
}
