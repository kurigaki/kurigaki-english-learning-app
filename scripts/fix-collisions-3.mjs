import { readFileSync, writeFileSync } from 'fs';

const FIXES = {
  accurately: '正確に',
  correctly: '的確に',
  correspond: '該当する',
  corresponding: '相当する',
  feverishly: '熱狂的に',
  enthusiastically: '熱を込めて',
  insult: '侮辱',
  indignity: '屈辱的扱い',
  internal: '内部の',
  inner: '内側の',
  regardless: 'それでも',
  nevertheless: 'それにもかかわらず',
  undertake: '引き受ける',
  underwrite: '保証する',
  'cut back': '切り詰める',
  curtail: '削減する',
  'bear responsibility': '責任を負う',
  'liable for': '〜の責任がある',
  augment: '増大する',
  'ramp up': '増強する',
  appease: 'なだめすかす',
  placate: 'なだめる',
  disparage: '見くびる',
  belittle: '過小評価する',
  adequately: '十分に',
  appropriately: 'ふさわしく',
  equipment: '装備',
  facility: '設備',
  certain: '確信した',
  convinced: '納得した',
  closely: '綿密に',
  attentively: '注意深く',
};

const files = [
  'src/data/words/eiken.js',
  'src/data/words/toeic.js',
  'src/data/words/junior.js',
  'src/data/words/senior.js',
  'src/data/words/conversation.js',
];

let totalFixed = 0;
for (const file of files) {
  let src = readFileSync(file, 'utf8');
  let fixed = 0;
  for (const [word, newMeaning] of Object.entries(FIXES)) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(word: "${escaped}", meaning: ")[^"]+(")`, 'g');
    const before = src;
    src = src.replace(re, `$1${newMeaning}$2`);
    if (src !== before) fixed++;
  }
  if (fixed > 0) {
    writeFileSync(file, src);
    console.log(`${file}: ${fixed} words fixed`);
    totalFixed += fixed;
  }
}
console.log(`\nTotal: ${totalFixed} words fixed`);
