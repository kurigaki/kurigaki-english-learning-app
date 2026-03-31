/**
 * 複数品詞エントリ追加 — 重要48語
 * 両品詞とも試験で頻出する語
 */
import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/data/words/eiken.js';
let src = readFileSync(FILE, 'utf8');
let lines = src.split('\n');

const existing = new Set();
const wordStage = {};
for (const line of lines) {
  const wm = line.match(/word:\s*"([^"]+)"/);
  const pm = line.match(/partOfSpeech:\s*"([^"]+)"/);
  const sm = line.match(/stage:\s*"([^"]+)"/);
  if (wm && pm) existing.add(wm[1] + '|' + pm[1]);
  if (wm && sm && !wordStage[wm[1]]) wordStage[wm[1]] = sm[1];
}

let maxId = 0;
for (const line of lines) { const m = line.match(/id:\s*(\d+)/); if (m) maxId = Math.max(maxId, parseInt(m[1])); }
const stgToDiff = {'5':1,'4':2,'3':3,'pre2':4,'2':5,'pre1':6,'1':7};

const targets = [
  // ═══ 動詞のみ→名詞追加 ═══
  {w:'bet',pos:'noun',m:'賭け',cat:'daily',ex:'I made a bet with my friend.',ja:'友達と賭けをした。',exs:[{en:'I made a bet with my friend.',ja:'友達と賭けをした。',cx:'日常'},{en:'It is a safe bet that he will win.',ja:'彼が勝つのはほぼ確実だ。',cx:'スポーツ'},{en:'Your best bet is to take the train.',ja:'電車に乗るのが一番良い選択だ。',cx:'交通'}]},
  {w:'bite',pos:'noun',m:'一口、噛むこと',cat:'daily',ex:'Can I have a bite of your sandwich?',ja:'サンドイッチを一口もらえる？',exs:[{en:'Can I have a bite of your sandwich?',ja:'サンドイッチを一口もらえる？',cx:'食事'},{en:'The dog gave him a nasty bite.',ja:'犬にひどく噛まれた。',cx:'日常'},{en:'She took a bite of the apple.',ja:'彼女はりんごを一口かじった。',cx:'食事'}]},
  {w:'blow',pos:'noun',m:'打撃',cat:'daily',ex:'The news was a terrible blow to the family.',ja:'その知らせは家族にひどい打撃だった。',exs:[{en:'The news was a terrible blow to the family.',ja:'その知らせは家族にひどい打撃だった。',cx:'日常'},{en:'He received a blow to the head.',ja:'彼は頭に一撃を受けた。',cx:'日常'},{en:'Losing the game was a blow to the team.',ja:'試合に負けたのはチームへの打撃だった。',cx:'スポーツ'}]},
  {w:'cross',pos:'noun',m:'十字、交差',cat:'daily',ex:'There was a cross at the top of the church.',ja:'教会の頂上に十字架があった。',exs:[{en:'There was a cross at the top of the church.',ja:'教会の頂上に十字架があった。',cx:'文化'},{en:'Mark the answer with a cross.',ja:'答えにバツ印をつけて。',cx:'学校'},{en:'The Red Cross helps people in need.',ja:'赤十字は困っている人を助ける。',cx:'社会'}]},
  {w:'cry',pos:'noun',m:'叫び、泣き声',cat:'emotion',ex:'She let out a cry of joy.',ja:'彼女は喜びの叫びを上げた。',exs:[{en:'She let out a cry of joy.',ja:'彼女は喜びの叫びを上げた。',cx:'感情'},{en:'The baby cry woke everyone up.',ja:'赤ちゃんの泣き声で皆が目を覚ました。',cx:'家庭'},{en:'There was a cry for help.',ja:'助けを求める叫びがあった。',cx:'日常'}]},
  {w:'draft',pos:'noun',m:'下書き、草案',cat:'education',ex:'This is just the first draft.',ja:'これはまだ最初の下書きだ。',exs:[{en:'This is just the first draft.',ja:'これはまだ最初の下書きだ。',cx:'仕事'},{en:'She wrote a rough draft of the essay.',ja:'彼女はエッセイの下書きを書いた。',cx:'学校'},{en:'The draft of the new law was published.',ja:'新法の草案が公表された。',cx:'政治'}]},
  {w:'email',pos:'noun',m:'メール',cat:'technology',ex:'I sent you an email yesterday.',ja:'昨日メールを送りました。',exs:[{en:'I sent you an email yesterday.',ja:'昨日メールを送りました。',cx:'日常'},{en:'Please check your email.',ja:'メールを確認してください。',cx:'仕事'},{en:'She gets hundreds of emails a day.',ja:'彼女は1日に何百通ものメールを受け取る。',cx:'仕事'}]},
  {w:'fit',pos:'noun',m:'発作、ぴったり',cat:'daily',ex:'The dress is a perfect fit.',ja:'そのドレスはぴったりだ。',exs:[{en:'The dress is a perfect fit.',ja:'そのドレスはぴったりだ。',cx:'服装'},{en:'He had a fit of coughing.',ja:'彼は咳の発作を起こした。',cx:'健康'},{en:'It was a good fit for the team.',ja:'チームにぴったり合っていた。',cx:'仕事'}]},
  {w:'fix',pos:'noun',m:'修正、窮地',cat:'daily',ex:'We are in a real fix.',ja:'私たちは本当に困っている。',exs:[{en:'We are in a real fix.',ja:'私たちは本当に困っている。',cx:'日常'},{en:'There is no quick fix for this problem.',ja:'この問題に即効薬はない。',cx:'仕事'},{en:'She needs her morning coffee fix.',ja:'彼女は朝のコーヒーが欠かせない。',cx:'日常'}]},
  {w:'heat',pos:'noun',m:'熱、暑さ',cat:'nature',ex:'The heat in summer is unbearable.',ja:'夏の暑さは耐えられない。',exs:[{en:'The heat in summer is unbearable.',ja:'夏の暑さは耐えられない。',cx:'天気'},{en:'Turn down the heat on the stove.',ja:'コンロの火を弱くして。',cx:'料理'},{en:'She could not stand the heat.',ja:'彼女は暑さに耐えられなかった。',cx:'日常'}]},
  {w:'hire',pos:'noun',m:'雇用、レンタル',cat:'business',ex:'She is a new hire in our department.',ja:'彼女は私たちの部署の新入社員だ。',exs:[{en:'She is a new hire in our department.',ja:'彼女は私たちの部署の新入社員だ。',cx:'仕事'},{en:'Bikes are available for hire.',ja:'自転車のレンタルが利用できる。',cx:'旅行'},{en:'The latest hire starts on Monday.',ja:'最新の採用者は月曜日に始まる。',cx:'仕事'}]},
  {w:'lift',pos:'noun',m:'持ち上げ、乗せる',cat:'daily',ex:'Can you give me a lift to the station?',ja:'駅まで乗せてもらえますか？',exs:[{en:'Can you give me a lift to the station?',ja:'駅まで乗せてもらえますか？',cx:'交通'},{en:'She gave the box a lift.',ja:'彼女は箱を持ち上げた。',cx:'日常'},{en:'The good news gave her spirits a lift.',ja:'良いニュースで彼女の気分が上がった。',cx:'日常'}]},
  {w:'post',pos:'noun',m:'投稿、役職',cat:'technology',ex:'Her blog post went viral.',ja:'彼女のブログ投稿がバズった。',exs:[{en:'Her blog post went viral.',ja:'彼女のブログ投稿がバズった。',cx:'技術'},{en:'He applied for the post of manager.',ja:'彼はマネージャーの役職に応募した。',cx:'仕事'},{en:'She read every post on the forum.',ja:'彼女はフォーラムの全投稿を読んだ。',cx:'技術'}]},
  {w:'print',pos:'noun',m:'印刷、版画',cat:'daily',ex:'The book is out of print.',ja:'その本は絶版だ。',exs:[{en:'The book is out of print.',ja:'その本は絶版だ。',cx:'文学'},{en:'The print on the page is too small.',ja:'ページの文字が小さすぎる。',cx:'日常'},{en:'She bought a beautiful print at the gallery.',ja:'ギャラリーで美しい版画を買った。',cx:'芸術'}]},
  {w:'spot',pos:'noun',m:'場所、しみ',cat:'daily',ex:'This is a great spot for a picnic.',ja:'ここはピクニックに最高の場所だ。',exs:[{en:'This is a great spot for a picnic.',ja:'ここはピクニックに最高の場所だ。',cx:'旅行'},{en:'There is a spot of ink on your shirt.',ja:'シャツにインクのしみがある。',cx:'日常'},{en:'The parking spot was taken.',ja:'駐車スペースは埋まっていた。',cx:'交通'}]},
  {w:'tie',pos:'noun',m:'ネクタイ、引分け',cat:'daily',ex:'He wore a blue tie to the meeting.',ja:'彼は会議に青いネクタイをつけた。',exs:[{en:'He wore a blue tie to the meeting.',ja:'彼は会議に青いネクタイをつけた。',cx:'仕事'},{en:'The game ended in a tie.',ja:'試合は引き分けに終わった。',cx:'スポーツ'},{en:'Family ties are very important.',ja:'家族の絆はとても大切だ。',cx:'家庭'}]},
  // ═══ 名詞のみ→動詞追加 ═══
  {w:'attempt',pos:'verb',m:'試みる',cat:'daily',ex:'She attempted to climb the mountain.',ja:'彼女は山に登ることを試みた。',exs:[{en:'She attempted to climb the mountain.',ja:'彼女は山に登ることを試みた。',cx:'スポーツ'},{en:'He attempted the exam three times.',ja:'彼は3回試験を受けた。',cx:'教育'},{en:'Do not attempt this without training.',ja:'訓練なしにこれを試みないでください。',cx:'安全'}]},
  {w:'battle',pos:'verb',m:'戦う',cat:'society',ex:'She battled against cancer for years.',ja:'彼女は何年もがんと戦った。',exs:[{en:'She battled against cancer for years.',ja:'彼女は何年もがんと戦った。',cx:'健康'},{en:'The two teams battled for the championship.',ja:'2チームが優勝を争った。',cx:'スポーツ'},{en:'He battled through the storm to get home.',ja:'彼は嵐の中を戦って家に帰った。',cx:'日常'}]},
  {w:'border',pos:'verb',m:'接する',cat:'daily',ex:'France borders Germany.',ja:'フランスはドイツに接している。',exs:[{en:'France borders Germany.',ja:'フランスはドイツに接している。',cx:'地理'},{en:'The garden borders the river.',ja:'庭は川に接している。',cx:'自然'},{en:'His behavior borders on rudeness.',ja:'彼の行動は無礼の域に達している。',cx:'日常'}]},
  {w:'brush',pos:'verb',m:'磨く、払う',cat:'daily',ex:'She brushes her teeth twice a day.',ja:'彼女は1日2回歯を磨く。',exs:[{en:'She brushes her teeth twice a day.',ja:'彼女は1日2回歯を磨く。',cx:'健康'},{en:'He brushed the dirt off his coat.',ja:'彼はコートのほこりを払った。',cx:'日常'},{en:'She brushed her hair before going out.',ja:'出かける前に髪をとかした。',cx:'日常'}]},
  {w:'crash',pos:'verb',m:'衝突する',cat:'daily',ex:'The car crashed into a tree.',ja:'車が木に衝突した。',exs:[{en:'The car crashed into a tree.',ja:'車が木に衝突した。',cx:'交通'},{en:'The computer crashed and lost all data.',ja:'コンピューターがクラッシュして全データが消えた。',cx:'技術'},{en:'Thunder crashed overhead.',ja:'頭上で雷が鳴り響いた。',cx:'天気'}]},
  {w:'crowd',pos:'verb',m:'群がる',cat:'daily',ex:'Fans crowded around the singer.',ja:'ファンが歌手の周りに群がった。',exs:[{en:'Fans crowded around the singer.',ja:'ファンが歌手の周りに群がった。',cx:'娯楽'},{en:'People crowded into the small room.',ja:'人々が小さな部屋に押し寄せた。',cx:'日常'},{en:'Children crowded around the ice cream truck.',ja:'子供たちがアイスクリームの車に群がった。',cx:'日常'}]},
  {w:'cure',pos:'verb',m:'治す',cat:'health',ex:'This medicine will cure your cold.',ja:'この薬で風邪が治る。',exs:[{en:'This medicine will cure your cold.',ja:'この薬で風邪が治る。',cx:'医療'},{en:'Scientists are trying to cure cancer.',ja:'科学者はがんを治そうとしている。',cx:'科学'},{en:'Time cures all wounds.',ja:'時が全ての傷を癒す。',cx:'日常'}]},
  {w:'debate',pos:'verb',m:'議論する',cat:'communication',ex:'They debated the issue for hours.',ja:'彼らは何時間もその問題を議論した。',exs:[{en:'They debated the issue for hours.',ja:'彼らは何時間もその問題を議論した。',cx:'仕事'},{en:'Students debated the topic in class.',ja:'生徒たちは授業でその話題を議論した。',cx:'学校'},{en:'The government is debating the new law.',ja:'政府は新法を議論している。',cx:'政治'}]},
  {w:'detail',pos:'verb',m:'詳述する',cat:'communication',ex:'She detailed the plan in her report.',ja:'彼女はレポートで計画を詳述した。',exs:[{en:'She detailed the plan in her report.',ja:'彼女はレポートで計画を詳述した。',cx:'仕事'},{en:'He detailed every step of the process.',ja:'彼は工程の全段階を詳述した。',cx:'仕事'},{en:'The book details the history of the city.',ja:'その本は市の歴史を詳述している。',cx:'文学'}]},
  {w:'diet',pos:'verb',m:'食事制限する',cat:'health',ex:'She has been dieting to lose weight.',ja:'彼女は減量のために食事制限している。',exs:[{en:'She has been dieting to lose weight.',ja:'彼女は減量のために食事制限している。',cx:'健康'},{en:'He started dieting after the doctor visit.',ja:'医者に行った後、ダイエットを始めた。',cx:'健康'},{en:'Many people diet before summer.',ja:'多くの人が夏前にダイエットする。',cx:'健康'}]},
  {w:'dump',pos:'verb',m:'捨てる',cat:'daily',ex:'Someone dumped trash in the river.',ja:'誰かが川にゴミを捨てた。',exs:[{en:'Someone dumped trash in the river.',ja:'誰かが川にゴミを捨てた。',cx:'環境'},{en:'She dumped the old clothes.',ja:'彼女は古い服を捨てた。',cx:'日常'},{en:'The company dumped waste illegally.',ja:'会社は違法に廃棄物を投棄した。',cx:'環境'}]},
  {w:'ease',pos:'verb',m:'和らげる',cat:'daily',ex:'The medicine eased the pain.',ja:'薬が痛みを和らげた。',exs:[{en:'The medicine eased the pain.',ja:'薬が痛みを和らげた。',cx:'医療'},{en:'She eased into the chair.',ja:'彼女はゆっくりと椅子に座った。',cx:'日常'},{en:'The tension in the room eased.',ja:'部屋の緊張が和らいだ。',cx:'日常'}]},
  {w:'estimate',pos:'verb',m:'見積もる',cat:'business',ex:'They estimated the cost at ten million yen.',ja:'費用を1千万円と見積もった。',exs:[{en:'They estimated the cost at ten million yen.',ja:'費用を1千万円と見積もった。',cx:'仕事'},{en:'It is estimated that the project will take a year.',ja:'プロジェクトは1年かかると見積もられている。',cx:'仕事'},{en:'She estimated the distance to be five kilometers.',ja:'距離を5キロと見積もった。',cx:'旅行'}]},
  {w:'fool',pos:'verb',m:'だます',cat:'daily',ex:'You cannot fool me.',ja:'私をだませないよ。',exs:[{en:'You cannot fool me.',ja:'私をだませないよ。',cx:'日常'},{en:'She fooled everyone with her disguise.',ja:'彼女は変装でみんなをだました。',cx:'日常'},{en:'Do not be fooled by appearances.',ja:'見かけにだまされないで。',cx:'日常'}]},
  {w:'gift',pos:'verb',m:'贈る',cat:'daily',ex:'She gifted him a watch for his birthday.',ja:'彼の誕生日に時計を贈った。',exs:[{en:'She gifted him a watch for his birthday.',ja:'彼の誕生日に時計を贈った。',cx:'行事'},{en:'The company gifted each employee a bonus.',ja:'会社は各社員にボーナスを贈った。',cx:'仕事'},{en:'He gifted the painting to the museum.',ja:'彼は美術館に絵を寄贈した。',cx:'芸術'}]},
  {w:'guarantee',pos:'verb',m:'保証する',cat:'business',ex:'We guarantee the quality of our products.',ja:'製品の品質を保証します。',exs:[{en:'We guarantee the quality of our products.',ja:'製品の品質を保証します。',cx:'ビジネス'},{en:'I cannot guarantee success.',ja:'成功は保証できない。',cx:'日常'},{en:'The company guarantees delivery within three days.',ja:'会社は3日以内の配達を保証する。',cx:'買い物'}]},
  {w:'image',pos:'verb',m:'映像化する',cat:'technology',ex:'The satellite imaged the surface of Mars.',ja:'衛星が火星の表面を映像化した。',exs:[{en:'The satellite imaged the surface of Mars.',ja:'衛星が火星の表面を映像化した。',cx:'科学'},{en:'The doctor imaged his brain with an MRI.',ja:'医者がMRIで彼の脳を撮影した。',cx:'医療'},{en:'The camera can image in low light.',ja:'そのカメラは暗い場所でも撮影できる。',cx:'技術'}]},
  {w:'lecture',pos:'verb',m:'講義する、説教する',cat:'education',ex:'She lectured on Japanese history.',ja:'彼女は日本史について講義した。',exs:[{en:'She lectured on Japanese history.',ja:'彼女は日本史について講義した。',cx:'教育'},{en:'His mother lectured him about his grades.',ja:'母親が彼に成績について説教した。',cx:'家庭'},{en:'The professor lectures twice a week.',ja:'教授は週に2回講義する。',cx:'大学'}]},
  {w:'loan',pos:'verb',m:'貸す',cat:'business',ex:'The bank loaned him the money.',ja:'銀行が彼にお金を貸した。',exs:[{en:'The bank loaned him the money.',ja:'銀行が彼にお金を貸した。',cx:'金融'},{en:'She loaned her car to a friend.',ja:'彼女は友人に車を貸した。',cx:'日常'},{en:'The museum loaned the painting for the exhibition.',ja:'美術館は展示のために絵を貸し出した。',cx:'文化'}]},
  {w:'monitor',pos:'verb',m:'監視する',cat:'technology',ex:'The doctor monitors her health closely.',ja:'医者は彼女の健康を注意深く監視している。',exs:[{en:'The doctor monitors her health closely.',ja:'医者は彼女の健康を注意深く監視している。',cx:'医療'},{en:'Cameras monitor the building entrance.',ja:'カメラが建物の入り口を監視している。',cx:'安全'},{en:'We monitor sales figures daily.',ja:'毎日売上数字を監視している。',cx:'ビジネス'}]},
  {w:'murder',pos:'verb',m:'殺害する',cat:'society',ex:'The suspect was accused of murdering the victim.',ja:'容疑者は被害者の殺害で起訴された。',exs:[{en:'The suspect was accused of murdering the victim.',ja:'容疑者は被害者の殺害で起訴された。',cx:'法律'},{en:'He was convicted of murdering his neighbor.',ja:'彼は隣人殺害で有罪となった。',cx:'社会'},{en:'The crime shocked the entire community.',ja:'その犯罪は地域全体に衝撃を与えた。',cx:'社会'}]},
  {w:'nail',pos:'verb',m:'釘で打つ',cat:'daily',ex:'He nailed the picture to the wall.',ja:'彼は絵を壁に釘で打ちつけた。',exs:[{en:'He nailed the picture to the wall.',ja:'彼は絵を壁に釘で打ちつけた。',cx:'家庭'},{en:'She nailed the interview.',ja:'彼女は面接を完璧にこなした。',cx:'仕事'},{en:'The carpenter nailed the boards together.',ja:'大工が板を釘で打ちつけた。',cx:'建設'}]},
  {w:'pause',pos:'verb',m:'一時停止する',cat:'daily',ex:'She paused before answering.',ja:'彼女は答える前に一瞬止まった。',exs:[{en:'She paused before answering.',ja:'彼女は答える前に一瞬止まった。',cx:'会話'},{en:'He paused the video to take notes.',ja:'彼はメモを取るために動画を一時停止した。',cx:'教育'},{en:'Let us pause and think about this.',ja:'一旦立ち止まって考えよう。',cx:'仕事'}]},
  {w:'pitch',pos:'verb',m:'投げる、売り込む',cat:'business',ex:'She pitched her idea to the investors.',ja:'彼女は投資家にアイデアを売り込んだ。',exs:[{en:'She pitched her idea to the investors.',ja:'彼女は投資家にアイデアを売り込んだ。',cx:'ビジネス'},{en:'He pitched the ball to the batter.',ja:'彼はバッターにボールを投げた。',cx:'スポーツ'},{en:'They pitched a tent by the lake.',ja:'湖のそばにテントを張った。',cx:'アウトドア'}]},
  {w:'poison',pos:'verb',m:'毒を盛る',cat:'daily',ex:'The chemicals poisoned the river.',ja:'化学物質が川を汚染した。',exs:[{en:'The chemicals poisoned the river.',ja:'化学物質が川を汚染した。',cx:'環境'},{en:'Bad information can poison public opinion.',ja:'悪い情報は世論を汚染する。',cx:'社会'},{en:'She was poisoned by the contaminated food.',ja:'彼女は汚染された食品で中毒になった。',cx:'健康'}]},
  {w:'prize',pos:'verb',m:'大切にする',cat:'daily',ex:'She prizes her collection of old books.',ja:'彼女は古い本のコレクションを大切にしている。',exs:[{en:'She prizes her collection of old books.',ja:'彼女は古い本のコレクションを大切にしている。',cx:'趣味'},{en:'He prizes honesty above all.',ja:'彼は何よりも正直さを大切にしている。',cx:'日常'},{en:'This painting is highly prized.',ja:'この絵は高く評価されている。',cx:'芸術'}]},
  {w:'purchase',pos:'verb',m:'購入する',cat:'business',ex:'She purchased a new laptop.',ja:'彼女は新しいノートパソコンを購入した。',exs:[{en:'She purchased a new laptop.',ja:'彼女は新しいノートパソコンを購入した。',cx:'買い物'},{en:'Tickets can be purchased online.',ja:'チケットはオンラインで購入できる。',cx:'娯楽'},{en:'The company purchased new equipment.',ja:'会社は新しい機器を購入した。',cx:'仕事'}]},
  {w:'reference',pos:'verb',m:'参照する',cat:'education',ex:'The author referenced several studies.',ja:'著者はいくつかの研究を参照した。',exs:[{en:'The author referenced several studies.',ja:'著者はいくつかの研究を参照した。',cx:'学術'},{en:'Please reference the original source.',ja:'原典を参照してください。',cx:'教育'},{en:'The report was referenced in the meeting.',ja:'報告書が会議で参照された。',cx:'仕事'}]},
  {w:'split',pos:'verb',m:'分ける、割る',cat:'daily',ex:'They split the bill equally.',ja:'彼らは勘定を等分した。',exs:[{en:'They split the bill equally.',ja:'彼らは勘定を等分した。',cx:'食事'},{en:'The road splits into two paths.',ja:'道が2つに分かれる。',cx:'旅行'},{en:'She split the wood with an axe.',ja:'彼女は斧で木を割った。',cx:'日常'}]},
  {w:'volunteer',pos:'verb',m:'志願する',cat:'society',ex:'She volunteered to help at the hospital.',ja:'彼女は病院の手伝いを志願した。',exs:[{en:'She volunteered to help at the hospital.',ja:'彼女は病院の手伝いを志願した。',cx:'社会'},{en:'Many students volunteer during summer.',ja:'多くの学生が夏にボランティアをする。',cx:'教育'},{en:'He volunteered for the project.',ja:'彼はプロジェクトに志願した。',cx:'仕事'}]},
];

let added = 0;
for (const t of targets) {
  const key = t.w + '|' + t.pos;
  if (existing.has(key)) continue;
  const stg = wordStage[t.w] || 'pre2';
  const d = stgToDiff[stg] || 4;
  maxId++;
  const exArr = t.exs.map(e => '{ en: "' + e.en + '", ja: "' + e.ja + '", context: "' + e.cx + '" }').join(', ');
  const entry = '  { id: ' + maxId + ', word: "' + t.w + '", meaning: "' + t.m + '", partOfSpeech: "' + t.pos + '", course: "eiken", stage: "' + stg + '", example: "' + t.ex + '", exampleJa: "' + t.ja + '", examples: [' + exArr + '], difficulty: ' + d + ', category: "' + t.cat + '", categories: ["' + t.cat + '"], frequencyRank: 1, source: "original" },';
  let insertIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('word: "' + t.w + '"') && lines[i].includes('course: "eiken"')) { insertIdx = i; break; }
  }
  if (insertIdx >= 0) { lines.splice(insertIdx + 1, 0, entry); added++; }
  else console.log('NOT FOUND: ' + t.w);
}

writeFileSync(FILE, lines.join('\n'));
console.log('Added: ' + added + ' important multi-POS entries');
