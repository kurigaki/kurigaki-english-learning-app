/**
 * 会話コース stage4/5 拡充
 *
 * 英検2級/準1級から会話に適した語を転用し、各100語以上にする
 * stage4 (difficulty 5): 英検2級から日常会話で使う語
 * stage5 (difficulty 6): 英検準1級からネイティブ的な語
 */
import { readFileSync, writeFileSync } from 'fs';

const CONV_FILE = 'src/data/words/conversation.js';
const EIKEN_FILE = 'src/data/words/eiken.js';

// Parse eiken
const eikenEntries = [];
for (const line of readFileSync(EIKEN_FILE, 'utf8').split('\n')) {
  const wm = line.match(/word:\s*"([^"]+)"/);
  const sm = line.match(/stage:\s*"([^"]+)"/);
  const mm = line.match(/meaning:\s*"([^"]+)"/);
  const pm = line.match(/partOfSpeech:\s*"([^"]+)"/);
  const cm = line.match(/category:\s*"([^"]+)"/);
  const em = line.match(/example:\s*"([^"]+)"/);
  const ejm = line.match(/exampleJa:\s*"([^"]+)"/);
  const exsm = line.match(/examples:\s*\[([^\]]+)\]/);
  if (wm && sm && mm && pm) {
    eikenEntries.push({
      word: wm[1], stage: sm[1], meaning: mm[1],
      partOfSpeech: pm[1], category: cm ? cm[1] : 'daily',
      example: em ? em[1] : '', exampleJa: ejm ? ejm[1] : '',
      examplesRaw: exsm ? exsm[1] : '',
    });
  }
}

let src = readFileSync(CONV_FILE, 'utf8');
let lines = src.split('\n');
const existing = new Set();
for (const line of lines) { const m = line.match(/word:\s*"([^"]+)"/); if (m) existing.add(m[1]); }
let maxId = 0;
for (const line of lines) { const m = line.match(/id:\s*(\d+)/); if (m) maxId = Math.max(maxId, parseInt(m[1])); }

// 会話に適したカテゴリを優先
const convCategories = ['daily', 'communication', 'emotion', 'food', 'travel', 'health', 'family', 'hobby', 'shopping', 'culture', 'society'];

function selectForConv(eikenStages, limit) {
  return eikenEntries
    .filter(e => eikenStages.includes(e.stage))
    .filter(e => !existing.has(e.word))
    .filter((e, i, arr) => arr.findIndex(x => x.word === e.word) === i)
    // 会話カテゴリを優先ソート
    .sort((a, b) => {
      const aConv = convCategories.includes(a.category) ? 0 : 1;
      const bConv = convCategories.includes(b.category) ? 0 : 1;
      return aConv - bConv;
    })
    .slice(0, limit);
}

// Stage 4: 英検2級から100語（日常会話で使う上級語）
const s4cands = selectForConv(['2'], 100);
// Stage 5: 英検準1級から100語（ネイティブ的な語彙）
const s5cands = selectForConv(['pre1'], 100);

function insertWords(candidates, stage, difficulty) {
  let added = 0;
  for (const c of candidates) {
    maxId++;
    const exStr = c.examplesRaw || '{ en: "' + c.example + '", ja: "' + c.exampleJa + '", context: "日常" }, { en: "' + c.example + '", ja: "' + c.exampleJa + '", context: "日常" }, { en: "' + c.example + '", ja: "' + c.exampleJa + '", context: "日常" }';
    const entry = '  { id: ' + maxId + ', word: "' + c.word + '", meaning: "' + c.meaning + '", partOfSpeech: "' + c.partOfSpeech + '", course: "conversation", stage: "' + stage + '", example: "' + c.example + '", exampleJa: "' + c.exampleJa + '", examples: [' + exStr + '], difficulty: ' + difficulty + ', category: "' + c.category + '", categories: ["' + c.category + '"], frequencyRank: 2, source: "generated" },';
    // Insert before ];
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '];') {
        lines.splice(i, 0, entry);
        added++;
        existing.add(c.word);
        break;
      }
    }
  }
  return added;
}

const a4 = insertWords(s4cands, '4', 5);
const a5 = insertWords(s5cands, '5', 6);

writeFileSync(CONV_FILE, lines.join('\n'));
console.log('会話stage4: +' + a4 + ' (計' + (26 + a4) + '語)');
console.log('会話stage5: +' + a5 + ' (計' + (34 + a5) + '語)');
console.log('合計: +' + (a4 + a5));
