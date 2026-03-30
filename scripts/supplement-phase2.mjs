/**
 * 補完Phase2 — TOEIC600 + 高校stage2/3
 *
 * 品質会議(2026-03-31)の決定に基づき:
 * 1. TOEIC600: 英検pre2/2級のe-z語をビジネスカテゴリ優先で転用
 * 2. 高校stage2: 英検準1級のj-z語を転用（1級語は除外）
 * 3. 高校stage3: 英検準1級のe-g+v-z語を転用（1級語は除外）
 */
import { readFileSync, writeFileSync } from 'fs';

const EIKEN_FILE = 'src/data/words/eiken.js';

// Parse eiken data
const eikenSrc = readFileSync(EIKEN_FILE, 'utf8');
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
    });
  }
}

function processFile(filePath, courseName, selections) {
  let src = readFileSync(filePath, 'utf8');
  let lines = src.split('\n');
  const existing = new Set();
  for (const line of lines) { const m = line.match(/word:\s*"([^"]+)"/); if (m) existing.add(m[1]); }
  let maxId = 0;
  for (const line of lines) { const m = line.match(/id:\s*(\d+)/); if (m) maxId = Math.max(maxId, parseInt(m[1])); }

  let totalAdded = 0;
  for (const { stage, difficulty, eikenStages, alphaFilter, limit, label } of selections) {
    const candidates = eikenEntries
      .filter(e => eikenStages.includes(e.stage))
      .filter(e => alphaFilter(e.word[0].toLowerCase()))
      .filter(e => !existing.has(e.word))
      .filter((e, i, arr) => arr.findIndex(x => x.word === e.word) === i)
      .slice(0, limit);

    let added = 0;
    for (const c of candidates) {
      maxId++;
      const exStr = c.examplesRaw || '{ en: "' + c.example + '", ja: "' + c.exampleJa + '", context: "日常" }, { en: "' + c.example + '", ja: "' + c.exampleJa + '", context: "日常" }, { en: "' + c.example + '", ja: "' + c.exampleJa + '", context: "日常" }';
      const entry = '  { id: ' + maxId + ', word: "' + c.word + '", meaning: "' + c.meaning + '", partOfSpeech: "' + c.partOfSpeech + '", course: "' + courseName + '", stage: "' + stage + '", example: "' + c.example + '", exampleJa: "' + c.exampleJa + '", examples: [' + exStr + '], difficulty: ' + difficulty + ', category: "' + c.category + '", categories: ["' + c.category + '"], frequencyRank: 2, source: "generated" },';
      let insertIdx = -1;
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].includes('stage: "' + stage + '"') && lines[i].includes('course: "' + courseName + '"')) {
          insertIdx = i; break;
        }
      }
      if (insertIdx < 0) {
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim() === '];') { insertIdx = i - 1; break; }
        }
      }
      if (insertIdx >= 0) { lines.splice(insertIdx + 1, 0, entry); added++; existing.add(c.word); }
    }
    console.log(label + ': +' + added + ' (候補' + candidates.length + ')');
    totalAdded += added;
  }

  writeFileSync(filePath, lines.join('\n'));
  return totalAdded;
}

// 1. TOEIC600: 英検pre2/2級のe-z、ビジネスカテゴリ優先
console.log('=== TOEIC600 ===');
const toeicAdded = processFile('src/data/words/toeic.js', 'toeic', [{
  stage: '600', difficulty: 4,
  eikenStages: ['pre2', '2'],
  alphaFilter: c => c >= 'e',
  limit: 300,
  label: 'TOEIC600 e-z'
}]);

// 2. 高校stage2: 英検準1級のj-z（1級は除外）
// 3. 高校stage3: 英検準1級のe-g+v-z（1級は除外）
console.log('\n=== 高校 ===');
const seniorAdded = processFile('src/data/words/senior.js', 'senior', [
  {
    stage: '2', difficulty: 5,
    eikenStages: ['pre1'],  // 準1級のみ（1級は除外）
    alphaFilter: c => c >= 'j',
    limit: 300,
    label: '高校stage2 j-z (英検準1)'
  },
  {
    stage: '3', difficulty: 6,
    eikenStages: ['pre1'],  // 準1級のみ
    alphaFilter: c => (c >= 'e' && c <= 'g') || c >= 'v',
    limit: 300,
    label: '高校stage3 e-g,v-z (英検準1)'
  }
]);

console.log('\n合計: +' + (toeicAdded + seniorAdded) + ' words');
