/**
 * 高校コース補完 第2弾
 * まだアルファベット偏りがあるステージを追加補完
 */
import { readFileSync, writeFileSync } from 'fs';

const SENIOR_FILE = 'src/data/words/senior.js';
const EIKEN_FILE = 'src/data/words/eiken.js';

let seniorSrc = readFileSync(SENIOR_FILE, 'utf8');
let lines = seniorSrc.split('\n');

const wordRe = /word:\s*"([^"]+)"/;
const seniorExisting = new Set();
for (const line of lines) { const m = line.match(wordRe); if (m) seniorExisting.add(m[1]); }

let maxId = 0;
for (const line of lines) { const m = line.match(/id:\s*(\d+)/); if (m) maxId = Math.max(maxId, parseInt(m[1])); }

// Parse eiken entries
const eikenSrc = readFileSync(EIKEN_FILE, 'utf8');
const eikenLines = eikenSrc.split('\n');
const eikenEntries = [];
for (const line of eikenLines) {
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

function selectCandidates(stages, alphaFilter, limit) {
  return eikenEntries
    .filter(e => stages.includes(e.stage))
    .filter(e => alphaFilter(e.word[0].toLowerCase()))
    .filter(e => !seniorExisting.has(e.word))
    .filter((e, i, arr) => arr.findIndex(x => x.word === e.word) === i)
    .slice(0, limit);
}

function insertWords(candidates, stage, difficulty) {
  let added = 0;
  for (const c of candidates) {
    maxId++;
    const examplesStr = c.examplesRaw || '{ en: "Example.", ja: "例文。", context: "日常" }, { en: "Example.", ja: "例文。", context: "日常" }, { en: "Example.", ja: "例文。", context: "日常" }';
    const entry = '  { id: ' + maxId + ', word: "' + c.word + '", meaning: "' + c.meaning + '", partOfSpeech: "' + c.partOfSpeech + '", course: "senior", stage: "' + stage + '", example: "' + c.example + '", exampleJa: "' + c.exampleJa + '", examples: [' + examplesStr + '], difficulty: ' + difficulty + ', category: "' + c.category + '", categories: ["' + c.category + '"], frequencyRank: 2, source: "generated" },';
    let insertIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('stage: "' + stage + '"') && lines[i].includes('course: "senior"')) {
        insertIdx = i; break;
      }
    }
    if (insertIdx >= 0) { lines.splice(insertIdx + 1, 0, entry); added++; }
    seniorExisting.add(c.word);
  }
  return added;
}

// Stage 1: 英検pre2/3級からe-l,w-zを追加（78語候補→全部）
const s1 = selectCandidates(['pre2', '3'], c => (c >= 'e' && c <= 'l') || c >= 'w', 78);
const a1 = insertWords(s1, '1', 4);

// Stage 2: 英検2級からj-zを追加（350語）
const s2 = selectCandidates(['2'], c => c >= 'j', 350);
const a2 = insertWords(s2, '2', 5);

// Stage 3: 英検pre1級からe-g,n-zを追加（350語）
const s3 = selectCandidates(['pre1'], c => (c >= 'e' && c <= 'g') || c >= 'n', 350);
const a3 = insertWords(s3, '3', 6);

writeFileSync(SENIOR_FILE, lines.join('\n'));
console.log('Stage 1: +' + a1);
console.log('Stage 2: +' + a2);
console.log('Stage 3: +' + a3);
console.log('Total: +' + (a1 + a2 + a3));
