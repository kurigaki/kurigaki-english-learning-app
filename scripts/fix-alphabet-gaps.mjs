/**
 * アルファベット欠落を修正
 * 各コースで欠落している文字の頻出語を追加
 * 英検データから例文を再利用（品質原則に基づき頻出語のみ）
 */
import { readFileSync, writeFileSync } from 'fs';

const EIKEN_FILE = 'src/data/words/eiken.js';

// 英検データをパース
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

function processFile(filePath, courseName, additions) {
  let src = readFileSync(filePath, 'utf8');
  let lines = src.split('\n');
  const existing = new Set();
  for (const line of lines) { const m = line.match(/word:\s*"([^"]+)"/); if (m) existing.add(m[1]); }
  let maxId = 0;
  for (const line of lines) { const m = line.match(/id:\s*(\d+)/); if (m) maxId = Math.max(maxId, parseInt(m[1])); }

  let totalAdded = 0;
  for (const { stage, difficulty, targetWords, label } of additions) {
    let added = 0;
    for (const tw of targetWords) {
      if (existing.has(tw)) continue;
      // 英検データから情報を取得
      const eiken = eikenEntries.find(e => e.word === tw);
      if (!eiken) continue; // 英検にない語はスキップ

      maxId++;
      const exStr = eiken.examplesRaw || '{ en: "' + eiken.example + '", ja: "' + eiken.exampleJa + '", context: "日常" }, { en: "' + eiken.example + '", ja: "' + eiken.exampleJa + '", context: "日常" }, { en: "' + eiken.example + '", ja: "' + eiken.exampleJa + '", context: "日常" }';
      const entry = '  { id: ' + maxId + ', word: "' + eiken.word + '", meaning: "' + eiken.meaning + '", partOfSpeech: "' + eiken.partOfSpeech + '", course: "' + courseName + '", stage: "' + stage + '", example: "' + eiken.example + '", exampleJa: "' + eiken.exampleJa + '", examples: [' + exStr + '], difficulty: ' + difficulty + ', category: "' + eiken.category + '", categories: ["' + eiken.category + '"], frequencyRank: 2, source: "generated" },';

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
      if (insertIdx >= 0) { lines.splice(insertIdx + 1, 0, entry); added++; existing.add(tw); }
    }
    console.log(label + ': +' + added);
    totalAdded += added;
  }

  writeFileSync(filePath, lines.join('\n'));
  return totalAdded;
}

// === 高校stage2: a,b,c追加 ===
const seniorS2abc = [
  'absorb','abstract','accompany','acquire','agriculture',
  'ancestor','annual','appeal','appreciate','atmosphere','attach',
  'authority','aware','biology','brief','capacity',
  'ceremony','circumstance','civilization','colony',
  'commerce','companion','compose',
  'concentrate','conflict','congress','conscious','consequence',
  'conservation','consist','constitution','construct','consult',
  'consumer','context','contribute','convention',
  'cooperate','corporation','courage','creature',
  'crisis','cultivate','curiosity','currency','custom',
];

// === 高校stage3: a,b,c,d追加 ===
const seniorS3abcd = [
  'accommodate','accumulate','acknowledge','adolescent',
  'ambassador','analogy','artificial','assert',
  'autonomous','bureaucracy','capability','catastrophe',
  'chronic','cognitive','commodity','competent','compulsory',
  'conceive','contradict','convey','criteria',
  'demographic','deteriorate','diagnose','dimension','diplomatic',
  'discourse','discrimination','disposal','distribution','diversity',
  'doctrine','domestic','dramatic',
];

console.log('=== 高校 ===');
processFile('src/data/words/senior.js', 'senior', [
  { stage: '2', difficulty: 5, targetWords: seniorS2abc, label: 'stage2 a,b,c' },
  { stage: '3', difficulty: 6, targetWords: seniorS3abcd, label: 'stage3 a,b,c,d' },
]);

// === 会話stage4: u,v,w追加 ===
const convS4uvw = [
  'ultimately','undergo','undermine','undertake','unexpected',
  'unfamiliar','upbeat','urge','utilize',
  'vague','valid','vastly','venture','virtue',
  'visible','vital','voluntary','vulnerable',
  'widespread','willing','wisdom','withdraw','witness',
  'worthwhile',
];

console.log('\n=== 会話 ===');
processFile('src/data/words/conversation.js', 'conversation', [
  { stage: '4', difficulty: 5, targetWords: convS4uvw, label: 'stage4 u,v,w' },
]);

// === TOEIC600: 欠落文字追加 ===
const toeicS600 = [
  'journal','justify',
  'landlord','lease','legislation','liable',
  'margin','merchandise','merger','mortgage',
  'negotiate','notify',
  'obligation','occupy','offset','operational','option','outline','oversee',
  'receipt','recruit','refund','register','regulation','reimburse',
  'relocate','renovation','representative','resign','resolution','retail',
  'seminar','session','shareholder','shipment','specification','subsidiary','supplement','surplus',
  'utility','vacancy','vendor','warehouse','wholesale','workforce',
];

console.log('\n=== TOEIC ===');
processFile('src/data/words/toeic.js', 'toeic', [
  { stage: '600', difficulty: 4, targetWords: toeicS600, label: 'stage600 欠落文字' },
]);
