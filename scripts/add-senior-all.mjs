/**
 * 高校コース補完スクリプト
 *
 * 英検データから高校レベルの語を選び、不足しているアルファベット範囲を補完する。
 * stage 1 (高1, difficulty 4): 英検pre2(準2級)からe-zを追加
 * stage 2 (高2, difficulty 5): 英検2級からa-c+j-zを追加
 * stage 3 (高3, difficulty 6): 英検2級/準1級からa-g+n-zを追加
 */
import { readFileSync, writeFileSync } from 'fs';

const SENIOR_FILE = 'src/data/words/senior.js';
const EIKEN_FILE = 'src/data/words/eiken.js';

// Load eiken data to find candidates
const eikenSrc = readFileSync(EIKEN_FILE, 'utf8');
const eikenMatch = eikenSrc.match(/export const eikenWords = \[([\s\S]*)\];/);

// Parse existing senior words
let seniorSrc = readFileSync(SENIOR_FILE, 'utf8');
let lines = seniorSrc.split('\n');

const wordRe = /word:\s*"([^"]+)"/;
const seniorExisting = new Set();
for (const line of lines) {
  const m = line.match(wordRe);
  if (m) seniorExisting.add(m[1]);
}

let maxId = 0;
for (const line of lines) {
  const m = line.match(/id:\s*(\d+)/);
  if (m) maxId = Math.max(maxId, parseInt(m[1]));
}
console.log('Senior existing:', seniorExisting.size, 'maxId:', maxId);

// Parse eiken words from source (extracting word entries)
const eikenEntries = [];
for (const line of eikenSrc.split('\n')) {
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
      line: line,
    });
  }
}
console.log('Eiken entries parsed:', eikenEntries.length);

// Select candidates for each stage
function selectCandidates(eikenStages, alphaFilter, limit) {
  return eikenEntries
    .filter(e => eikenStages.includes(e.stage))
    .filter(e => alphaFilter(e.word[0].toLowerCase()))
    .filter(e => !seniorExisting.has(e.word))
    // Remove duplicates
    .filter((e, i, arr) => arr.findIndex(x => x.word === e.word) === i)
    .slice(0, limit);
}

// Stage 1 (高1): 英検pre2のe-z → 350語
const s1Candidates = selectCandidates(['pre2'], c => c >= 'e', 350);
console.log('Stage 1 candidates:', s1Candidates.length);

// Stage 2 (高2): 英検2級のa-c + j-z → 350語
const s2Candidates = selectCandidates(['2'], c => c < 'd' || c > 'i', 350);
console.log('Stage 2 candidates:', s2Candidates.length);

// Stage 3 (高3): 英検2級/準1級のa-g + n-z → 350語
// Prefer pre1 words that aren't already in s2
const s2Words = new Set(s2Candidates.map(c => c.word));
const s3Candidates = selectCandidates(['pre1', '2'], c => c < 'h' || c > 'm', 350)
  .filter(e => !s2Words.has(e.word));
console.log('Stage 3 candidates:', s3Candidates.length);

// Insert into senior.js
function insertWords(candidates, stage, difficulty) {
  let added = 0;
  for (const c of candidates) {
    maxId++;
    // Reuse the eiken entry's examples
    const examplesStr = c.examplesRaw || '{ en: "' + c.example + '", ja: "' + c.exampleJa + '", context: "日常" }, { en: "' + c.example + '", ja: "' + c.exampleJa + '", context: "日常" }, { en: "' + c.example + '", ja: "' + c.exampleJa + '", context: "日常" }';
    const entry = '  { id: ' + maxId + ', word: "' + c.word + '", meaning: "' + c.meaning + '", partOfSpeech: "' + c.partOfSpeech + '", course: "senior", stage: "' + stage + '", example: "' + c.example + '", exampleJa: "' + c.exampleJa + '", examples: [' + examplesStr + '], difficulty: ' + difficulty + ', category: "' + c.category + '", categories: ["' + c.category + '"], frequencyRank: 2, source: "generated" },';

    // Insert after last entry of this stage, or before ];
    let insertIdx = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('stage: "' + stage + '"') && lines[i].includes('course: "senior"')) {
        insertIdx = i;
        break;
      }
    }
    if (insertIdx < 0) {
      // No existing entries for this stage, insert before ];
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() === '];') { insertIdx = i - 1; break; }
      }
    }
    if (insertIdx >= 0) {
      lines.splice(insertIdx + 1, 0, entry);
      added++;
    }
  }
  return added;
}

const added1 = insertWords(s1Candidates, '1', 4);
const added2 = insertWords(s2Candidates, '2', 5);
const added3 = insertWords(s3Candidates, '3', 6);

writeFileSync(SENIOR_FILE, lines.join('\n'));
console.log('\nResults:');
console.log('Stage 1 (高1): +' + added1 + ' words');
console.log('Stage 2 (高2): +' + added2 + ' words');
console.log('Stage 3 (高3): +' + added3 + ' words');
console.log('Total: +' + (added1 + added2 + added3) + ' words');
