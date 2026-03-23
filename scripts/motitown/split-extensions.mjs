#!/usr/bin/env node
/**
 * word-extensions.ts からモチタン取り込みデータを
 * word-extensions-motitown.ts に分離する
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "../..");
const EXT_FILE = join(ROOT, "src/data/word-extensions.ts");
const MOTI_FILE = join(ROOT, "src/data/word-extensions-motitown.ts");

const content = readFileSync(EXT_FILE, "utf-8");
const lines = content.split("\n");

// マーカーを探す
const markerIdx = lines.findIndex((l) =>
  l.includes("── モチタン取り込み ──")
);
if (markerIdx === -1) {
  console.error("モチタンマーカーが見つかりません");
  process.exit(1);
}

// Mapの終端を探す（マーカー以降の最初の `]);`）
let mapEndIdx = -1;
for (let i = markerIdx; i < lines.length; i++) {
  if (lines[i].trim() === "]);") {
    mapEndIdx = i;
    break;
  }
}

console.log(`マーカー: ${markerIdx + 1}行目`);
console.log(`Map終端: ${mapEndIdx + 1}行目`);

// モチタンデータを抽出（マーカー〜Map終端の直前）
const motiEntries = lines.slice(markerIdx + 1, mapEndIdx).join("\n");

// 分離ファイルを作成
const motiFileContent = `/**
 * モチタン取り込み 単語拡張データ
 * word-extensions.ts から分離
 */
import type { WordExtension } from "@/types";

export const motitownExtensions: [number, WordExtension][] = [
${motiEntries}
];
`;

writeFileSync(MOTI_FILE, motiFileContent, "utf-8");

// メインファイルからモチタンデータを削除し、import + merge を追加
const beforeMarker = lines.slice(0, markerIdx);
const afterMapEnd = lines.slice(mapEndIdx); // `]);` 以降

// `]);` 行を見つけてMapの終端を閉じる
const newMainLines = [...beforeMarker, ...afterMapEnd];
let newMainContent = newMainLines.join("\n");

// import を追加
newMainContent = newMainContent.replace(
  'import { exampleJaOverrides } from "./example-ja-overrides";',
  'import { exampleJaOverrides } from "./example-ja-overrides";\nimport { motitownExtensions } from "./word-extensions-motitown";'
);

// Map定義の後にモチタンデータをmerge
newMainContent = newMainContent.replace(
  /export const wordExtensions: Map<number, WordExtension> = new Map\(\[/,
  `const _handwrittenExtensions: [number, WordExtension][] = [`
);

// `]);` を `];` に変更し、その後にMap生成コードを追加
// 最初の `]);` を見つけて置換
const firstCloseIdx = newMainContent.indexOf("];");
if (firstCloseIdx === -1) {
  console.error("配列終端が見つかりません");
  process.exit(1);
}

const before = newMainContent.slice(0, firstCloseIdx + 2);
const after = newMainContent.slice(firstCloseIdx + 2);

newMainContent = before + `

// 手書き + モチタン取り込みを統合
export const wordExtensions: Map<number, WordExtension> = new Map([
  ..._handwrittenExtensions,
  ...motitownExtensions,
]);
` + after;

writeFileSync(EXT_FILE, newMainContent, "utf-8");

console.log(`\n完了:`);
console.log(`  ${MOTI_FILE}: モチタンデータ分離`);
console.log(`  ${EXT_FILE}: import + merge 追加`);
