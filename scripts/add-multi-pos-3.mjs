/**
 * 複数品詞エントリ追加 第3弾（最終）
 * 残り37語の不足品詞を英検コースに追加
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/data/words/eiken.js';
let src = readFileSync(FILE, 'utf8');
let lines = src.split('\n');

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

// 英検の既存エントリから各語のstageを取得
const wordStage = {};
for (const line of lines) {
  const wm = line.match(/word:\s*"([^"]+)"/);
  const sm = line.match(/stage:\s*"([^"]+)"/);
  if (wm && sm && !wordStage[wm[1]]) wordStage[wm[1]] = sm[1];
}

const stgToDiff = {'5':1,'4':2,'3':3,'pre2':4,'2':5,'pre1':6,'1':7};

const targets = [
  // 動詞のみ→名詞追加
  {w:'design',pos:'noun',m:'設計、デザイン',cat:'daily',ex:'The design of this building is modern.',ja:'この建物のデザインは近代的だ。',exs:[{en:'The design of this building is modern.',ja:'この建物のデザインは近代的だ。',cx:'建設'},{en:'She studied graphic design.',ja:'彼女はグラフィックデザインを学んだ。',cx:'芸術'},{en:'The dress has a beautiful design.',ja:'そのドレスは美しいデザインだ。',cx:'服装'}]},
  {w:'increase',pos:'noun',m:'増加',cat:'daily',ex:'There was a sharp increase in sales.',ja:'売上が急増した。',exs:[{en:'There was a sharp increase in sales.',ja:'売上が急増した。',cx:'ビジネス'},{en:'The increase in temperature is alarming.',ja:'気温の上昇は心配だ。',cx:'環境'},{en:'A pay increase was announced.',ja:'賃上げが発表された。',cx:'仕事'}]},
  {w:'joke',pos:'noun',m:'冗談',cat:'communication',ex:'He told a funny joke.',ja:'彼は面白い冗談を言った。',exs:[{en:'He told a funny joke.',ja:'彼は面白い冗談を言った。',cx:'日常'},{en:'It was just a joke.',ja:'ただの冗談だよ。',cx:'会話'},{en:'She did not get the joke.',ja:'彼女は冗談が分からなかった。',cx:'日常'}]},
  {w:'kiss',pos:'noun',m:'キス',cat:'daily',ex:'She gave him a kiss on the cheek.',ja:'彼女は彼のほおにキスをした。',exs:[{en:'She gave him a kiss on the cheek.',ja:'彼女は彼のほおにキスをした。',cx:'日常'},{en:'A goodnight kiss is a family tradition.',ja:'おやすみのキスは家族の習慣だ。',cx:'家庭'},{en:'He blew her a kiss.',ja:'彼は彼女に投げキスをした。',cx:'日常'}]},
  {w:'notice',pos:'noun',m:'通知、掲示',cat:'communication',ex:'She put up a notice on the board.',ja:'彼女は掲示板に通知を貼った。',exs:[{en:'She put up a notice on the board.',ja:'彼女は掲示板に通知を貼った。',cx:'学校'},{en:'He received a notice from the landlord.',ja:'彼は大家から通知を受け取った。',cx:'住居'},{en:'The notice said the office will be closed.',ja:'掲示にはオフィスが閉まると書いてあった。',cx:'仕事'}]},
  {w:'paint',pos:'noun',m:'ペンキ、塗料',cat:'daily',ex:'The wall needs a fresh coat of paint.',ja:'壁に新しいペンキが必要だ。',exs:[{en:'The wall needs a fresh coat of paint.',ja:'壁に新しいペンキが必要だ。',cx:'家庭'},{en:'She bought red paint for the door.',ja:'彼女はドア用に赤いペンキを買った。',cx:'買い物'},{en:'The paint is still wet.',ja:'ペンキはまだ乾いていない。',cx:'日常'}]},
  {w:'pass',pos:'noun',m:'合格、通行証',cat:'daily',ex:'She got a pass on her driving test.',ja:'彼女は運転免許の試験に合格した。',exs:[{en:'She got a pass on her driving test.',ja:'彼女は運転免許の試験に合格した。',cx:'交通'},{en:'You need a pass to enter the building.',ja:'ビルに入るには通行証が必要だ。',cx:'仕事'},{en:'The mountain pass was blocked by snow.',ja:'峠は雪で通行できなかった。',cx:'旅行'}]},
  {w:'point',pos:'noun',m:'点、要点',cat:'daily',ex:'The main point of his speech was clear.',ja:'彼のスピーチの要点は明確だった。',exs:[{en:'The main point of his speech was clear.',ja:'彼のスピーチの要点は明確だった。',cx:'学校'},{en:'She scored three points in the game.',ja:'彼女は試合で3点取った。',cx:'スポーツ'},{en:'There is no point in arguing.',ja:'議論しても意味がない。',cx:'日常'}]},
  {w:'promise',pos:'noun',m:'約束',cat:'communication',ex:'He always keeps his promises.',ja:'彼はいつも約束を守る。',exs:[{en:'He always keeps his promises.',ja:'彼はいつも約束を守る。',cx:'日常'},{en:'She made a promise to study harder.',ja:'もっと勉強すると約束した。',cx:'学校'},{en:'The young player shows great promise.',ja:'その若手選手は大いに有望だ。',cx:'スポーツ'}]},
  {w:'protest',pos:'noun',m:'抗議',cat:'society',ex:'The students held a peaceful protest.',ja:'学生たちは平和的な抗議を行った。',exs:[{en:'The students held a peaceful protest.',ja:'学生たちは平和的な抗議を行った。',cx:'社会'},{en:'He resigned in protest.',ja:'彼は抗議して辞任した。',cx:'政治'},{en:'There were protests against the new law.',ja:'新しい法律に対する抗議があった。',cx:'社会'}]},
  {w:'pull',pos:'noun',m:'引くこと、引力',cat:'daily',ex:'Give the door a good pull.',ja:'ドアをぐっと引いて。',exs:[{en:'Give the door a good pull.',ja:'ドアをぐっと引いて。',cx:'日常'},{en:'The moon has a gravitational pull.',ja:'月には引力がある。',cx:'科学'},{en:'He felt the pull of his hometown.',ja:'彼は故郷の引力を感じた。',cx:'日常'}]},
  {w:'push',pos:'noun',m:'押すこと、努力',cat:'daily',ex:'The door opens with a push.',ja:'ドアは押すと開く。',exs:[{en:'The door opens with a push.',ja:'ドアは押すと開く。',cx:'日常'},{en:'The team needs a final push.',ja:'チームには最後のひと押しが必要だ。',cx:'スポーツ'},{en:'There was a push for reform.',ja:'改革への動きがあった。',cx:'社会'}]},
  {w:'race',pos:'noun',m:'レース、競争',cat:'sports',ex:'She won the race easily.',ja:'彼女は楽々とレースに勝った。',exs:[{en:'She won the race easily.',ja:'彼女は楽々とレースに勝った。',cx:'スポーツ'},{en:'The race for the presidency is close.',ja:'大統領選は接戦だ。',cx:'政治'},{en:'It was a race against time.',ja:'時間との競争だった。',cx:'日常'}]},
  {w:'release',pos:'noun',m:'公開、解放',cat:'daily',ex:'The movie had its release last week.',ja:'その映画は先週公開された。',exs:[{en:'The movie had its release last week.',ja:'その映画は先週公開された。',cx:'娯楽'},{en:'The release of the hostages was a relief.',ja:'人質の解放は安堵だった。',cx:'社会'},{en:'The new release sold millions of copies.',ja:'新作は数百万部売れた。',cx:'娯楽'}]},
  {w:'repair',pos:'noun',m:'修理',cat:'daily',ex:'The car is in the shop for repairs.',ja:'車は修理のために店に出ている。',exs:[{en:'The car is in the shop for repairs.',ja:'車は修理のために店に出ている。',cx:'交通'},{en:'The bridge is under repair.',ja:'橋は修理中だ。',cx:'社会'},{en:'Repair costs were higher than expected.',ja:'修理費は予想より高かった。',cx:'日常'}]},
  {w:'request',pos:'noun',m:'依頼、要請',cat:'communication',ex:'She made a request for more information.',ja:'彼女はより多くの情報を求めた。',exs:[{en:'She made a request for more information.',ja:'彼女はより多くの情報を求めた。',cx:'仕事'},{en:'Your request has been approved.',ja:'あなたの依頼は承認されました。',cx:'仕事'},{en:'At the request of the teacher, we stayed late.',ja:'先生の要請で、遅くまで残った。',cx:'学校'}]},
  {w:'rescue',pos:'noun',m:'救助',cat:'society',ex:'The rescue team arrived quickly.',ja:'救助チームはすぐに到着した。',exs:[{en:'The rescue team arrived quickly.',ja:'救助チームはすぐに到着した。',cx:'社会'},{en:'The dog came to the rescue.',ja:'犬が助けに来た。',cx:'日常'},{en:'A dramatic rescue was carried out.',ja:'劇的な救助が行われた。',cx:'社会'}]},
  {w:'result',pos:'noun',m:'結果',cat:'education',ex:'The test results will come out tomorrow.',ja:'テスト結果は明日出る。',exs:[{en:'The test results will come out tomorrow.',ja:'テスト結果は明日出る。',cx:'学校'},{en:'As a result, the project was delayed.',ja:'その結果、プロジェクトは遅れた。',cx:'仕事'},{en:'We are pleased with the results.',ja:'結果に満足しています。',cx:'仕事'}]},
  {w:'review',pos:'noun',m:'レビュー、評論',cat:'daily',ex:'The book got excellent reviews.',ja:'その本は素晴らしい評論を得た。',exs:[{en:'The book got excellent reviews.',ja:'その本は素晴らしい評論を得た。',cx:'文学'},{en:'We need to do a review of the project.',ja:'プロジェクトの見直しが必要だ。',cx:'仕事'},{en:'She read the restaurant reviews online.',ja:'彼女はオンラインでレストランの評価を読んだ。',cx:'食事'}]},
  {w:'ride',pos:'noun',m:'乗ること',cat:'travel',ex:'It was a long ride to the airport.',ja:'空港まで長い乗車だった。',exs:[{en:'It was a long ride to the airport.',ja:'空港まで長い乗車だった。',cx:'交通'},{en:'Can I give you a ride home?',ja:'家まで乗せていきましょうか？',cx:'日常'},{en:'The roller coaster ride was thrilling.',ja:'ジェットコースターはスリリングだった。',cx:'娯楽'}]},
  {w:'roll',pos:'noun',m:'巻くこと、パン',cat:'food',ex:'She bought a bread roll at the bakery.',ja:'彼女はパン屋でロールパンを買った。',exs:[{en:'She bought a bread roll at the bakery.',ja:'彼女はパン屋でロールパンを買った。',cx:'食事'},{en:'The teacher called the roll.',ja:'先生が出席を取った。',cx:'学校'},{en:'A roll of paper towels is on the counter.',ja:'ペーパータオルのロールがカウンターにある。',cx:'家庭'}]},
  {w:'rush',pos:'noun',m:'急ぎ、ラッシュ',cat:'daily',ex:'There is no rush. Take your time.',ja:'急ぐ必要はない。ゆっくりして。',exs:[{en:'There is no rush. Take your time.',ja:'急ぐ必要はない。ゆっくりして。',cx:'日常'},{en:'The morning rush hour is terrible.',ja:'朝のラッシュアワーはひどい。',cx:'交通'},{en:'She felt a rush of excitement.',ja:'彼女は興奮の高まりを感じた。',cx:'感情'}]},
  {w:'search',pos:'noun',m:'捜索、検索',cat:'daily',ex:'The search for the missing child continued.',ja:'行方不明の子供の捜索が続いた。',exs:[{en:'The search for the missing child continued.',ja:'行方不明の子供の捜索が続いた。',cx:'社会'},{en:'She did an internet search.',ja:'彼女はインターネット検索をした。',cx:'技術'},{en:'The search for truth is never-ending.',ja:'真実の探求は終わりがない。',cx:'日常'}]},
  {w:'share',pos:'noun',m:'分け前、株',cat:'business',ex:'Everyone got an equal share.',ja:'全員が等しい分け前を得た。',exs:[{en:'Everyone got an equal share.',ja:'全員が等しい分け前を得た。',cx:'日常'},{en:'She bought shares in the company.',ja:'彼女はその会社の株を買った。',cx:'金融'},{en:'He had a large share of the blame.',ja:'彼には大きな責任の分担があった。',cx:'日常'}]},
  {w:'shock',pos:'noun',m:'衝撃',cat:'emotion',ex:'The news came as a complete shock.',ja:'そのニュースは完全な衝撃だった。',exs:[{en:'The news came as a complete shock.',ja:'そのニュースは完全な衝撃だった。',cx:'日常'},{en:'She was still in shock after the accident.',ja:'彼女は事故後まだショック状態だった。',cx:'医療'},{en:'The electric shock was mild.',ja:'その電気ショックは軽かった。',cx:'科学'}]},
  {w:'signal',pos:'noun',m:'信号',cat:'daily',ex:'Wait for the traffic signal to change.',ja:'交通信号が変わるのを待って。',exs:[{en:'Wait for the traffic signal to change.',ja:'交通信号が変わるのを待って。',cx:'交通'},{en:'The phone has a weak signal here.',ja:'ここは電話の電波が弱い。',cx:'日常'},{en:'Her smile was a signal of approval.',ja:'彼女の笑顔は承認のサインだった。',cx:'日常'}]},
  {w:'smoke',pos:'noun',m:'煙',cat:'nature',ex:'Smoke was rising from the chimney.',ja:'煙突から煙が上がっていた。',exs:[{en:'Smoke was rising from the chimney.',ja:'煙突から煙が上がっていた。',cx:'日常'},{en:'The room was full of smoke.',ja:'部屋は煙で満ちていた。',cx:'日常'},{en:'Where there is smoke, there is fire.',ja:'煙のあるところに火がある。',cx:'日常'}]},
  {w:'sort',pos:'noun',m:'種類',cat:'daily',ex:'What sort of music do you like?',ja:'どんな種類の音楽が好きですか？',exs:[{en:'What sort of music do you like?',ja:'どんな種類の音楽が好きですか？',cx:'趣味'},{en:'All sorts of people came to the party.',ja:'あらゆる種類の人がパーティーに来た。',cx:'社交'},{en:'This sort of thing happens all the time.',ja:'こういうことはよくある。',cx:'日常'}]},
  {w:'spread',pos:'noun',m:'広がり',cat:'daily',ex:'The spread of the disease was rapid.',ja:'病気の広がりは急速だった。',exs:[{en:'The spread of the disease was rapid.',ja:'病気の広がりは急速だった。',cx:'健康'},{en:'The spread of information is faster than ever.',ja:'情報の拡散はかつてないほど速い。',cx:'技術'},{en:'She prepared a delicious spread for the party.',ja:'彼女はパーティーのために素晴らしい食事を用意した。',cx:'食事'}]},
  {w:'stay',pos:'noun',m:'滞在',cat:'travel',ex:'We enjoyed our stay at the hotel.',ja:'ホテルでの滞在を楽しんだ。',exs:[{en:'We enjoyed our stay at the hotel.',ja:'ホテルでの滞在を楽しんだ。',cx:'旅行'},{en:'It was a short stay but very pleasant.',ja:'短い滞在だったがとても楽しかった。',cx:'旅行'},{en:'His hospital stay lasted two weeks.',ja:'彼の入院期間は2週間だった。',cx:'医療'}]},
  {w:'struggle',pos:'noun',m:'苦闘',cat:'daily',ex:'Life is a constant struggle.',ja:'人生は絶え間ない苦闘だ。',exs:[{en:'Life is a constant struggle.',ja:'人生は絶え間ない苦闘だ。',cx:'日常'},{en:'The struggle for equality continues.',ja:'平等のための闘いは続いている。',cx:'社会'},{en:'It was a struggle to stay awake.',ja:'起きているのは苦労だった。',cx:'日常'}]},
  {w:'touch',pos:'noun',m:'触れること、感触',cat:'daily',ex:'The fabric has a soft touch.',ja:'その生地は柔らかい感触だ。',exs:[{en:'The fabric has a soft touch.',ja:'その生地は柔らかい感触だ。',cx:'買い物'},{en:'She added a personal touch to the gift.',ja:'彼女はプレゼントに個人的な工夫を加えた。',cx:'日常'},{en:'Keep in touch with your old friends.',ja:'昔の友達と連絡を取り続けて。',cx:'日常'}]},
  {w:'vote',pos:'noun',m:'投票',cat:'society',ex:'Every vote counts in an election.',ja:'選挙では一票一票が大切だ。',exs:[{en:'Every vote counts in an election.',ja:'選挙では一票一票が大切だ。',cx:'政治'},{en:'The vote was held last Sunday.',ja:'投票は先週日曜日に行われた。',cx:'社会'},{en:'She cast her vote early in the morning.',ja:'彼女は朝早く投票した。',cx:'政治'}]},
  {w:'worry',pos:'noun',m:'心配',cat:'emotion',ex:'Money is a constant worry for many people.',ja:'お金は多くの人にとって絶え間ない心配だ。',exs:[{en:'Money is a constant worry for many people.',ja:'お金は多くの人にとって絶え間ない心配だ。',cx:'日常'},{en:'Do not worry. It is not a big worry.',ja:'心配しないで。大した心配じゃないから。',cx:'日常'},{en:'Health worries kept her awake.',ja:'健康の心配で眠れなかった。',cx:'健康'}]},
  // 名詞のみ→動詞追加（残り）
  {w:'mix',pos:'verb',m:'混ぜる',cat:'daily',ex:'Mix the ingredients well.',ja:'材料をよく混ぜてください。',exs:[{en:'Mix the ingredients well.',ja:'材料をよく混ぜてください。',cx:'料理'},{en:'She mixed the colors to make green.',ja:'彼女は色を混ぜて緑を作った。',cx:'芸術'},{en:'Do not mix work and personal life.',ja:'仕事と私生活を混ぜないで。',cx:'日常'}]},
  {w:'produce',pos:'noun',m:'農産物',cat:'food',ex:'Fresh produce is sold at the market.',ja:'新鮮な農産物が市場で売られている。',exs:[{en:'Fresh produce is sold at the market.',ja:'新鮮な農産物が市場で売られている。',cx:'食事'},{en:'Organic produce is more expensive.',ja:'有機農産物はより高価だ。',cx:'買い物'},{en:'Local produce tastes the best.',ja:'地元の農産物が一番美味しい。',cx:'食事'}]},
  {w:'hunt',pos:'noun',m:'狩り、捜索',cat:'nature',ex:'The hunt for the treasure continued.',ja:'宝探しは続いた。',exs:[{en:'The hunt for the treasure continued.',ja:'宝探しは続いた。',cx:'娯楽'},{en:'Fox hunting was banned in England.',ja:'キツネ狩りはイングランドで禁止された。',cx:'社会'},{en:'The job hunt can be stressful.',ja:'就職活動はストレスが溜まる。',cx:'仕事'}]},
];

let added = 0;
for (const t of targets) {
  const key = t.w + '|' + t.pos;
  if (existing.has(key)) { console.log('SKIP: ' + t.w + ' ' + t.pos); continue; }

  // ステージは既存エントリと同じ
  const stg = wordStage[t.w] || '3';
  const d = stgToDiff[stg] || 3;

  maxId++;
  const exArr = t.exs.map(e => '{ en: "' + e.en + '", ja: "' + e.ja + '", context: "' + e.cx + '" }').join(', ');
  const entry = '  { id: ' + maxId + ', word: "' + t.w + '", meaning: "' + t.m + '", partOfSpeech: "' + t.pos + '", course: "eiken", stage: "' + stg + '", example: "' + t.ex + '", exampleJa: "' + t.ja + '", examples: [' + exArr + '], difficulty: ' + d + ', category: "' + t.cat + '", categories: ["' + t.cat + '"], frequencyRank: 1, source: "original" },';

  let insertIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('word: "' + t.w + '"') && lines[i].includes('course: "eiken"')) {
      insertIdx = i; break;
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
console.log('Added: ' + added + ' multi-POS entries (batch 3)');
