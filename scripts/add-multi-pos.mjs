/**
 * 複数品詞エントリ追加スクリプト
 * 頻出語の不足品詞をeiken.jsに追加
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/data/words/eiken.js';
let src = readFileSync(FILE, 'utf8');
let lines = src.split('\n');

// 既存wordチェック
const existing = new Set();
for (const line of lines) {
  const wm = line.match(/word:\s*"([^"]+)"/);
  const pm = line.match(/partOfSpeech:\s*"([^"]+)"/);
  if (wm && pm) existing.add(wm[1] + '|' + pm[1]);
}

let maxId = 0;
for (const line of lines) {
  const m = line.match(/id:\s*(\d+)/);
  if (m) maxId = Math.max(maxId, parseInt(m[1]));
}

const targets = [
  // === 名詞のみ → 動詞追加 ===
  {w:'love',pos:'verb',m:'愛する',stg:'5',d:1,cat:'emotion',ex:'I love my family very much.',ja:'家族をとても愛しています。',exs:[{en:'I love my family very much.',ja:'家族をとても愛しています。',cx:'家庭'},{en:'She loves reading books.',ja:'彼女は読書が大好きだ。',cx:'趣味'},{en:'He loves playing soccer.',ja:'彼はサッカーが大好きだ。',cx:'スポーツ'}]},
  {w:'place',pos:'verb',m:'置く',stg:'3',d:3,cat:'daily',ex:'She placed the book on the table.',ja:'彼女は本をテーブルに置いた。',exs:[{en:'She placed the book on the table.',ja:'彼女は本をテーブルに置いた。',cx:'日常'},{en:'He placed an order for new equipment.',ja:'彼は新しい機器を注文した。',cx:'仕事'},{en:'The teacher placed the students in groups.',ja:'先生は生徒をグループに分けた。',cx:'学校'}]},
  {w:'report',pos:'verb',m:'報告する',stg:'3',d:3,cat:'communication',ex:'She reported the accident to the police.',ja:'彼女は事故を警察に報告した。',exs:[{en:'She reported the accident to the police.',ja:'彼女は事故を警察に報告した。',cx:'社会'},{en:'The news reporter reported on the event.',ja:'記者がその出来事を報じた。',cx:'メディア'},{en:'Students must report their results.',ja:'生徒は結果を報告しなければならない。',cx:'学校'}]},
  {w:'control',pos:'verb',m:'制御する',stg:'pre2',d:4,cat:'daily',ex:'She controlled her emotions during the speech.',ja:'彼女はスピーチ中に感情を制御した。',exs:[{en:'She controlled her emotions during the speech.',ja:'彼女はスピーチ中に感情を制御した。',cx:'日常'},{en:'The pilot controlled the plane safely.',ja:'パイロットは安全に飛行機を操縦した。',cx:'交通'},{en:'We need to control spending.',ja:'支出を管理する必要がある。',cx:'仕事'}]},
  {w:'damage',pos:'verb',m:'損害を与える',stg:'pre2',d:4,cat:'daily',ex:'The storm damaged many buildings.',ja:'嵐が多くの建物に損害を与えた。',exs:[{en:'The storm damaged many buildings.',ja:'嵐が多くの建物に損害を与えた。',cx:'自然'},{en:'Smoking damages your health.',ja:'喫煙は健康に害を与える。',cx:'健康'},{en:'The flood damaged the road.',ja:'洪水が道路に損害を与えた。',cx:'自然'}]},
  {w:'challenge',pos:'verb',m:'挑む',stg:'pre2',d:4,cat:'daily',ex:'She challenged herself to run a marathon.',ja:'彼女はマラソンに挑んだ。',exs:[{en:'She challenged herself to run a marathon.',ja:'彼女はマラソンに挑んだ。',cx:'スポーツ'},{en:'He challenged the decision in court.',ja:'彼は法廷でその決定に異議を唱えた。',cx:'法律'},{en:'The teacher challenged students to think deeper.',ja:'先生は生徒にもっと深く考えるよう促した。',cx:'教育'}]},
  {w:'demand',pos:'verb',m:'要求する',stg:'pre2',d:4,cat:'communication',ex:'Workers demanded higher wages.',ja:'労働者は賃上げを要求した。',exs:[{en:'Workers demanded higher wages.',ja:'労働者は賃上げを要求した。',cx:'仕事'},{en:'The job demands long hours.',ja:'その仕事は長時間を要求する。',cx:'仕事'},{en:'She demanded an explanation.',ja:'彼女は説明を要求した。',cx:'日常'}]},
  {w:'test',pos:'verb',m:'検査する',stg:'4',d:2,cat:'school',ex:'The doctor tested his blood pressure.',ja:'医者は彼の血圧を検査した。',exs:[{en:'The doctor tested his blood pressure.',ja:'医者は彼の血圧を検査した。',cx:'医療'},{en:'They tested the new software.',ja:'新しいソフトウェアをテストした。',cx:'技術'},{en:'The teacher tested the students on grammar.',ja:'先生は生徒の文法をテストした。',cx:'学校'}]},
  {w:'trade',pos:'verb',m:'取引する',stg:'pre2',d:4,cat:'business',ex:'The two countries trade with each other.',ja:'2つの国は互いに貿易している。',exs:[{en:'The two countries trade with each other.',ja:'2つの国は互いに貿易している。',cx:'経済'},{en:'He traded his old car for a new one.',ja:'彼は古い車を新しいのと交換した。',cx:'日常'},{en:'She trades stocks online.',ja:'彼女はオンラインで株を取引している。',cx:'金融'}]},
  {w:'watch',pos:'verb',m:'見る、観る',stg:'5',d:1,cat:'daily',ex:'She watched TV after dinner.',ja:'彼女は夕食後にテレビを見た。',exs:[{en:'She watched TV after dinner.',ja:'彼女は夕食後にテレビを見た。',cx:'家庭'},{en:'He watched the soccer game.',ja:'彼はサッカーの試合を観た。',cx:'スポーツ'},{en:'Watch out for cars when crossing.',ja:'横断する時は車に気をつけて。',cx:'交通'}]},
  {w:'park',pos:'verb',m:'駐車する',stg:'4',d:2,cat:'daily',ex:'She parked her car near the station.',ja:'彼女は駅の近くに車を駐車した。',exs:[{en:'She parked her car near the station.',ja:'彼女は駅の近くに車を駐車した。',cx:'交通'},{en:'You cannot park here.',ja:'ここに駐車はできません。',cx:'交通'},{en:'He parked in the underground garage.',ja:'彼は地下駐車場に停めた。',cx:'交通'}]},
  {w:'object',pos:'verb',m:'反対する',stg:'pre2',d:4,cat:'communication',ex:'Several members objected to the proposal.',ja:'何人かのメンバーがその提案に反対した。',exs:[{en:'Several members objected to the proposal.',ja:'何人かのメンバーがその提案に反対した。',cx:'会議'},{en:'Nobody objected to the plan.',ja:'誰もその計画に反対しなかった。',cx:'仕事'},{en:'She objected strongly to the new rule.',ja:'彼女は新しいルールに強く反対した。',cx:'社会'}]},
  {w:'plant',pos:'verb',m:'植える',stg:'3',d:3,cat:'nature',ex:'We planted flowers in the garden.',ja:'庭に花を植えた。',exs:[{en:'We planted flowers in the garden.',ja:'庭に花を植えた。',cx:'家庭'},{en:'She planted trees along the street.',ja:'彼女は通り沿いに木を植えた。',cx:'環境'},{en:'They planted rice in the field.',ja:'彼らは田んぼに米を植えた。',cx:'農業'}]},
  // === 動詞のみ → 名詞追加 ===
  {w:'run',pos:'noun',m:'走ること、連続',stg:'3',d:3,cat:'daily',ex:'She went for a run in the morning.',ja:'彼女は朝ランニングに行った。',exs:[{en:'She went for a run in the morning.',ja:'彼女は朝ランニングに行った。',cx:'スポーツ'},{en:'In the long run, hard work pays off.',ja:'長い目で見ると努力は報われる。',cx:'日常'},{en:'The play had a successful run.',ja:'その劇は好評のロングランだった。',cx:'娯楽'}]},
  {w:'play',pos:'noun',m:'劇、遊び',stg:'3',d:3,cat:'daily',ex:'We went to see a play at the theater.',ja:'劇場に芝居を見に行った。',exs:[{en:'We went to see a play at the theater.',ja:'劇場に芝居を見に行った。',cx:'娯楽'},{en:'Children learn through play.',ja:'子供は遊びを通じて学ぶ。',cx:'教育'},{en:'Shakespeare wrote many famous plays.',ja:'シェイクスピアは多くの有名な戯曲を書いた。',cx:'文学'}]},
  {w:'work',pos:'noun',m:'仕事、作品',stg:'4',d:2,cat:'business',ex:'Hard work leads to success.',ja:'努力は成功につながる。',exs:[{en:'Hard work leads to success.',ja:'努力は成功につながる。',cx:'教育'},{en:'This painting is a famous work of art.',ja:'この絵は有名な芸術作品だ。',cx:'芸術'},{en:'She found work near her home.',ja:'彼女は家の近くに仕事を見つけた。',cx:'仕事'}]},
  {w:'change',pos:'noun',m:'変化、おつり',stg:'4',d:2,cat:'daily',ex:'There has been a big change in the weather.',ja:'天気に大きな変化があった。',exs:[{en:'There has been a big change in the weather.',ja:'天気に大きな変化があった。',cx:'天気'},{en:'Do you have change for a thousand yen?',ja:'千円のおつりはありますか？',cx:'買い物'},{en:'Climate change affects the whole world.',ja:'気候変動は世界全体に影響する。',cx:'環境'}]},
  {w:'study',pos:'noun',m:'研究、書斎',stg:'3',d:3,cat:'education',ex:'A recent study shows that sleep is important.',ja:'最近の研究では睡眠が重要だと示されている。',exs:[{en:'A recent study shows that sleep is important.',ja:'最近の研究では睡眠が重要だと示されている。',cx:'健康'},{en:'She is doing a study on climate change.',ja:'彼女は気候変動の研究をしている。',cx:'科学'},{en:'He reads in his study every evening.',ja:'彼は毎晩書斎で読書する。',cx:'家庭'}]},
  {w:'call',pos:'noun',m:'電話、呼びかけ',stg:'4',d:2,cat:'communication',ex:'I got a phone call from my mother.',ja:'母から電話があった。',exs:[{en:'I got a phone call from my mother.',ja:'母から電話があった。',cx:'家庭'},{en:'The doctor is on call tonight.',ja:'医者は今夜待機中だ。',cx:'医療'},{en:'There is a call for volunteers.',ja:'ボランティアの呼びかけがある。',cx:'社会'}]},
  {w:'help',pos:'noun',m:'助け',stg:'5',d:1,cat:'daily',ex:'Thank you for your help.',ja:'助けてくれてありがとう。',exs:[{en:'Thank you for your help.',ja:'助けてくれてありがとう。',cx:'日常'},{en:'She asked for help with her homework.',ja:'彼女は宿題の手伝いを頼んだ。',cx:'学校'},{en:'The map was a great help.',ja:'地図はとても助けになった。',cx:'旅行'}]},
  {w:'walk',pos:'noun',m:'散歩',stg:'4',d:2,cat:'daily',ex:'Let us go for a walk in the park.',ja:'公園を散歩しよう。',exs:[{en:'Let us go for a walk in the park.',ja:'公園を散歩しよう。',cx:'日常'},{en:'It is a ten-minute walk to the station.',ja:'駅まで歩いて10分だ。',cx:'交通'},{en:'She takes a walk every morning.',ja:'彼女は毎朝散歩する。',cx:'健康'}]},
  {w:'talk',pos:'noun',m:'話、講演',stg:'4',d:2,cat:'communication',ex:'She gave a talk about her research.',ja:'彼女は自分の研究について講演した。',exs:[{en:'She gave a talk about her research.',ja:'彼女は自分の研究について講演した。',cx:'学術'},{en:'We had a long talk about the future.',ja:'将来について長い話をした。',cx:'日常'},{en:'He is all talk and no action.',ja:'彼は口先だけで行動しない。',cx:'日常'}]},
  {w:'drive',pos:'noun',m:'ドライブ、意欲',stg:'3',d:3,cat:'daily',ex:'Let us go for a drive this weekend.',ja:'今週末ドライブに行こう。',exs:[{en:'Let us go for a drive this weekend.',ja:'今週末ドライブに行こう。',cx:'旅行'},{en:'She has a strong drive to succeed.',ja:'彼女には成功への強い意欲がある。',cx:'仕事'},{en:'It is a two-hour drive to the airport.',ja:'空港まで車で2時間だ。',cx:'交通'}]},
  {w:'drink',pos:'noun',m:'飲み物',stg:'5',d:1,cat:'food',ex:'Would you like a cold drink?',ja:'冷たい飲み物はいかがですか？',exs:[{en:'Would you like a cold drink?',ja:'冷たい飲み物はいかがですか？',cx:'食事'},{en:'She bought a drink at the shop.',ja:'彼女は店で飲み物を買った。',cx:'買い物'},{en:'What is your favorite drink?',ja:'好きな飲み物は何ですか？',cx:'会話'}]},
  {w:'answer',pos:'noun',m:'答え',stg:'5',d:1,cat:'school',ex:'Do you know the answer to this question?',ja:'この質問の答えを知っていますか？',exs:[{en:'Do you know the answer to this question?',ja:'この質問の答えを知っていますか？',cx:'学校'},{en:'The answer was surprisingly simple.',ja:'答えは驚くほど簡単だった。',cx:'学校'},{en:'I did not get an answer to my email.',ja:'メールの返事が来なかった。',cx:'仕事'}]},
  {w:'order',pos:'noun',m:'注文、順序',stg:'3',d:3,cat:'daily',ex:'She placed an order for a new computer.',ja:'彼女は新しいコンピューターを注文した。',exs:[{en:'She placed an order for a new computer.',ja:'彼女は新しいコンピューターを注文した。',cx:'買い物'},{en:'Please put the books in alphabetical order.',ja:'本をアルファベット順に並べてください。',cx:'学校'},{en:'The waiter took our order.',ja:'ウェイターが注文を取った。',cx:'食事'}]},
  {w:'plan',pos:'noun',m:'計画',stg:'3',d:3,cat:'daily',ex:'What are your plans for the weekend?',ja:'週末の計画は何ですか？',exs:[{en:'What are your plans for the weekend?',ja:'週末の計画は何ですか？',cx:'日常'},{en:'We need a plan to solve this problem.',ja:'この問題を解決する計画が必要だ。',cx:'仕事'},{en:'The plan was approved by the committee.',ja:'計画は委員会に承認された。',cx:'仕事'}]},
  {w:'store',pos:'noun',m:'店',stg:'4',d:2,cat:'shopping',ex:'She went to the store to buy groceries.',ja:'彼女は食料品を買いに店に行った。',exs:[{en:'She went to the store to buy groceries.',ja:'彼女は食料品を買いに店に行った。',cx:'買い物'},{en:'The store opens at nine in the morning.',ja:'その店は朝9時に開く。',cx:'日常'},{en:'There is a new store near the station.',ja:'駅の近くに新しい店がある。',cx:'日常'}]},
  {w:'record',pos:'noun',m:'記録',stg:'3',d:3,cat:'daily',ex:'She broke the world record in swimming.',ja:'彼女は水泳で世界記録を破った。',exs:[{en:'She broke the world record in swimming.',ja:'彼女は水泳で世界記録を破った。',cx:'スポーツ'},{en:'Keep a record of your daily expenses.',ja:'毎日の支出を記録しておこう。',cx:'生活'},{en:'The medical records are confidential.',ja:'医療記録は機密だ。',cx:'医療'}]},
  {w:'match',pos:'noun',m:'試合',stg:'3',d:3,cat:'sports',ex:'We watched an exciting soccer match.',ja:'興奮するサッカーの試合を見た。',exs:[{en:'We watched an exciting soccer match.',ja:'興奮するサッカーの試合を見た。',cx:'スポーツ'},{en:'The tennis match lasted three hours.',ja:'テニスの試合は3時間続いた。',cx:'スポーツ'},{en:'It was a close match.',ja:'接戦だった。',cx:'スポーツ'}]},
  {w:'fall',pos:'noun',m:'秋、落下',stg:'3',d:3,cat:'nature',ex:'Fall is my favorite season.',ja:'秋は私の一番好きな季節だ。',exs:[{en:'Fall is my favorite season.',ja:'秋は私の一番好きな季節だ。',cx:'季節'},{en:'He had a bad fall from his bicycle.',ja:'彼は自転車からひどく転んだ。',cx:'日常'},{en:'The fall of the Roman Empire was gradual.',ja:'ローマ帝国の衰退は緩やかだった。',cx:'歴史'}]},
  {w:'cover',pos:'noun',m:'表紙、カバー',stg:'3',d:3,cat:'daily',ex:'The book has a beautiful cover.',ja:'その本は美しい表紙だ。',exs:[{en:'The book has a beautiful cover.',ja:'その本は美しい表紙だ。',cx:'趣味'},{en:'She put a cover on the sofa.',ja:'彼女はソファにカバーをかけた。',cx:'家庭'},{en:'Do not judge a book by its cover.',ja:'見た目で判断してはいけない。',cx:'日常'}]},
  {w:'practice',pos:'noun',m:'練習、慣行',stg:'3',d:3,cat:'education',ex:'Practice makes perfect.',ja:'練習すれば上達する。',exs:[{en:'Practice makes perfect.',ja:'練習すれば上達する。',cx:'教育'},{en:'She needs more practice at the piano.',ja:'彼女はピアノの練習がもっと必要だ。',cx:'音楽'},{en:'It is common practice in Japan.',ja:'それは日本では一般的な慣行だ。',cx:'文化'}]},
  {w:'support',pos:'noun',m:'支援',stg:'pre2',d:4,cat:'society',ex:'Thank you for your support.',ja:'ご支援ありがとうございます。',exs:[{en:'Thank you for your support.',ja:'ご支援ありがとうございます。',cx:'日常'},{en:'The project needs financial support.',ja:'プロジェクトには資金的支援が必要だ。',cx:'仕事'},{en:'She gave emotional support to her friend.',ja:'彼女は友人に精神的な支えを提供した。',cx:'日常'}]},
  {w:'experience',pos:'noun',m:'経験',stg:'3',d:3,cat:'daily',ex:'She has a lot of teaching experience.',ja:'彼女には豊富な教育経験がある。',exs:[{en:'She has a lot of teaching experience.',ja:'彼女には豊富な教育経験がある。',cx:'仕事'},{en:'It was an unforgettable experience.',ja:'忘れられない経験だった。',cx:'旅行'},{en:'You need more experience for this job.',ja:'この仕事にはもっと経験が必要だ。',cx:'仕事'}]},
  // === 名詞 → 形容詞/動詞追加（light, present）===
  {w:'light',pos:'adjective',m:'軽い、明るい',stg:'4',d:2,cat:'daily',ex:'This bag is very light.',ja:'このかばんはとても軽い。',exs:[{en:'This bag is very light.',ja:'このかばんはとても軽い。',cx:'日常'},{en:'The room was light and airy.',ja:'部屋は明るく風通しが良かった。',cx:'家庭'},{en:'She wore a light jacket.',ja:'彼女は軽いジャケットを着た。',cx:'服装'}]},
  {w:'light',pos:'verb',m:'照らす、点ける',stg:'3',d:3,cat:'daily',ex:'He lit a candle in the dark room.',ja:'彼は暗い部屋でろうそくに火を点けた。',exs:[{en:'He lit a candle in the dark room.',ja:'彼は暗い部屋でろうそくに火を点けた。',cx:'日常'},{en:'The fireworks lit up the night sky.',ja:'花火が夜空を照らした。',cx:'イベント'},{en:'She lit the fireplace to warm the room.',ja:'彼女は部屋を暖めるために暖炉に火を点けた。',cx:'家庭'}]},
  {w:'present',pos:'adjective',m:'現在の、出席の',stg:'pre2',d:4,cat:'daily',ex:'All students were present at the meeting.',ja:'全生徒が会議に出席していた。',exs:[{en:'All students were present at the meeting.',ja:'全生徒が会議に出席していた。',cx:'学校'},{en:'The present situation is very difficult.',ja:'現在の状況はとても難しい。',cx:'社会'},{en:'At the present time, we have no plans.',ja:'現時点では計画はない。',cx:'仕事'}]},
  {w:'present',pos:'verb',m:'発表する、贈る',stg:'pre2',d:4,cat:'communication',ex:'She presented her research to the class.',ja:'彼女はクラスに研究を発表した。',exs:[{en:'She presented her research to the class.',ja:'彼女はクラスに研究を発表した。',cx:'学校'},{en:'The award was presented by the mayor.',ja:'賞は市長により贈呈された。',cx:'イベント'},{en:'He presented his ideas clearly.',ja:'彼は自分のアイデアを明確に発表した。',cx:'仕事'}]},
  // === 名詞 → 名詞追加（land）===
  {w:'land',pos:'noun',m:'土地',stg:'3',d:3,cat:'nature',ex:'They bought a piece of land in the country.',ja:'彼らは田舎に土地を買った。',exs:[{en:'They bought a piece of land in the country.',ja:'彼らは田舎に土地を買った。',cx:'不動産'},{en:'The land was covered with snow.',ja:'土地は雪で覆われていた。',cx:'自然'},{en:'He owns a large area of land.',ja:'彼は広大な土地を所有している。',cx:'社会'}]},
];

let added = 0;
for (const t of targets) {
  const key = t.w + '|' + t.pos;
  if (existing.has(key)) { console.log('SKIP: ' + t.w + ' ' + t.pos); continue; }

  maxId++;
  const exArr = t.exs.map(e => '{ en: "' + e.en + '", ja: "' + e.ja + '", context: "' + e.cx + '" }').join(', ');
  const entry = '  { id: ' + maxId + ', word: "' + t.w + '", meaning: "' + t.m + '", partOfSpeech: "' + t.pos + '", course: "eiken", stage: "' + t.stg + '", example: "' + t.ex + '", exampleJa: "' + t.ja + '", examples: [' + exArr + '], difficulty: ' + t.d + ', category: "' + t.cat + '", categories: ["' + t.cat + '"], frequencyRank: 1, source: "original" },';

  // Insert after the existing entry for the same word
  let insertIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('word: "' + t.w + '"') && lines[i].includes('course: "eiken"')) {
      insertIdx = i;
      break;
    }
  }
  if (insertIdx >= 0) {
    lines.splice(insertIdx + 1, 0, entry);
    added++;
  } else {
    console.log('NOT FOUND: ' + t.w);
  }
}

writeFileSync(FILE, lines.join('\n'));
console.log('Added: ' + added + ' multi-POS entries');
