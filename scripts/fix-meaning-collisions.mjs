/**
 * meaning衝突一括修正スクリプト
 *
 * 同一ステージ内で同じmeaningを持つ同義語に対し、
 * ニュアンスの違いを反映した固有meaningを割り当てる。
 *
 * ルール:
 * - meaningは10文字以内
 * - 元の意味を保ちつつ微妙に違う表現にする
 * - 学習者にとって自然で覚えやすい日本語
 */
import { readFileSync, writeFileSync } from 'fs';

// word -> new meaning マッピング
// 衝突ペアの片方（またはそれ以上）のmeaningを変更
const FIXES = {
  // ═══ 恐ろしい系 ═══
  dreadful: '恐ろしい',
  fearsome: '恐るべき',
  frightening: '怖い',
  terrifying: '身の毛よだつ',

  // ═══ 魅力系 ═══
  attraction: '魅力',
  charm: '魅了する力',
  attractiveness: '人を引く力',
  allure: '妖艶な魅力',

  // ═══ 比較系 ═══
  comparative: '比較の',
  comparison: '比較',

  // ═══ 伝える系 ═══
  communicate: '伝達する',
  convey: '伝える',
  transmit: '送信する',
  impart: '授ける',

  // ═══ ばかげた系 ═══
  absurd: '不合理な',
  daft: 'ばかげた',

  // ═══ 思いやり系 ═══
  caring: '思いやりのある',
  compassionate: '同情深い',
  thoughtful: '気配りのある',

  // ═══ 一致する系 ═══
  coincide: '一致する',
  correspond: '対応する',

  // ═══ 運命系 ═══
  doom: '破滅',
  fate: '運命',
  destiny: '宿命',

  // ═══ 中傷系 ═══
  vilify: '中傷する',
  slander: '誹謗する',
  denigrate: 'けなす',
  malign: '悪口を言う',

  // ═══ 予約系 ═══
  appointment: '予約',
  booking: '予約手配',

  // ═══ 注意系 ═══
  attention: '注意',
  caution: '用心',

  // ═══ 面白い系 ═══
  amusing: '面白い',
  comic: '滑稽な',

  // ═══ 混乱系 ═══
  chaos: '混沌',
  confusion: '混乱',

  // ═══ 複雑な系 ═══
  complex: '複雑な',
  complicated: '込み入った',

  // ═══ 献身系 ═══
  devotion: '献身',
  dedication: '専念',

  // ═══ 達成可能な系 ═══
  achievable: '達成可能な',
  attainable: '手の届く',

  // ═══ 一貫した系 ═══
  coherent: '首尾一貫した',
  consistent: '一貫した',

  // ═══ 熱意系 ═══
  eagerness: '熱心さ',
  enthusiasm: '熱意',

  // ═══ 熱心に系 ═══
  eagerly: '熱心に',
  enthusiastically: '熱狂的に',
  intently: '一心に',

  // ═══ 恥ずかしい系 ═══
  embarrassed: '恥ずかしい',
  embarrassing: '気まずい',

  // ═══ 有害な系 ═══
  harmful: '有害な',
  hazardous: '危険な',
  deleterious: '害を及ぼす',
  pernicious: '悪影響の',

  // ═══ 不十分な系 ═══
  inadequate: '不十分な',
  insufficient: '足りない',
  unsatisfactory: '不満足な',

  // ═══ 苛立たせる系 ═══
  irritating: '苛立たしい',
  irritate: '苛立たせる',

  // ═══ 厳格な系 ═══
  stern: '厳格な',
  stringent: '厳しい',
  rigid: '硬直した',
  austere: '質素な',

  // ═══ 素晴らしい系 ═══
  fabulous: '素晴らしい',
  fantastic: '驚異的な',
  terrific: 'すごい',

  // ═══ さらに系 ═══
  additionally: '加えて',
  furthermore: 'その上',
  'in addition': 'さらに',
  'what is more': 'しかも',

  // ═══ 保証系 ═══
  assurance: '保証',
  guarantee: '確約',
  warranty: '保証書',

  // ═══ 熟考する系 ═══
  muse: '物思いにふける',
  ponder: '熟考する',
  contemplate: '熟慮する',

  // ═══ 統合系 ═══
  integration: '統合',
  synthesis: '総合',
  consolidation: '一本化',

  // ═══ 軽視する系 ═══
  'play down': '軽視する',
  belittle: '見くびる',
  flout: 'あざ笑う',

  // ═══ 援助系 ═══
  aid: '援助',
  assistance: '支援',

  // ═══ 反対の系 ═══
  contrary: '反対の',
  anti: '対抗の',

  // ═══ 海系 ═══
  ocean: '大洋',
  sea: '海',

  // ═══ 手伝う系 ═══
  help: '手伝う',
  assist: '援助する',

  // ═══ すばらしい系（会話） ═══
  great: 'すばらしい',
  brilliant: '輝かしい',

  // ═══ 離れて系 ═══
  away: '離れて',
  apart: '別々に',

  // ═══ 十分に系 ═══
  enough: '十分に',
  adequately: '適切に',

  // ═══ 食事系 ═══
  meal: '食事',
  diet: '食事法',

  // ═══ おなか系 ═══
  stomach: '胃',
  belly: 'おなか',

  // ═══ タクシー系 ═══
  taxi: 'タクシー',
  cab: '乗合馬車',

  // ═══ 待つ系 ═══
  wait: '待つ',
  await: '待ち受ける',

  // ═══ 確認する系 ═══
  check: '確認する',
  confirm: '確定する',

  // ═══ 主な系 ═══
  main: '主な',
  chief: '主要な',

  // ═══ 奇妙な系 ═══
  strange: '奇妙な',
  bizarre: '異様な',

  // ═══ 確かな系 ═══
  sure: '確かな',
  certain: '確信した',

  // ═══ 感謝する系 ═══
  thank: '感謝する',
  appreciate: 'ありがたく思う',

  // ═══ 驚いた系 ═══
  amazed: '驚いた',
  astonished: '仰天した',

  // ═══ バーテンダー系 ═══
  barman: 'バーテンダー',
  bartender: 'バーの店員',

  // ═══ 地下室系 ═══
  basement: '地下室',
  cellar: '地下貯蔵庫',

  // ═══ 最愛の系 ═══
  beloved: '最愛の',
  darling: '愛しい',

  // ═══ ひどく系 ═══
  badly: 'ひどく',
  bitterly: '激しく',

  // ═══ 絶望系 ═══
  despair: '絶望',
  desperation: '自暴自棄',

  // ═══ 不快感系 ═══
  discomfort: '不快感',
  displeasure: '不満',

  // ═══ 壊滅的な系 ═══
  devastating: '壊滅的な',
  catastrophic: '大惨事の',

  // ═══ 十分な系 ═══
  adequate: '十分な',
  ample: '豊富な',

  // ═══ 飾る系 ═══
  adorn: '飾り立てる',
  decorate: '飾る',

  // ═══ 驚かせる系 ═══
  amaze: '驚嘆させる',
  astonish: '驚かせる',

  // ═══ 予測する系 ═══
  anticipate: '予期する',
  predict: '予測する',

  // ═══ 驚き系 ═══
  amazement: '驚嘆',
  astonishment: '驚き',

  // ═══ 計算する系 ═══
  compute: '算出する',
  calculate: '計算する',

  // ═══ 熱心な系 ═══
  eager: '熱望する',
  enthusiastic: '熱心な',

  // ═══ 優雅な系 ═══
  elegant: '優雅な',
  graceful: 'しなやかな',

  // ═══ 基本的な系 ═══
  elemental: '根本的な',
  fundamental: '基本的な',

  // ═══ 怒って系 ═══
  angrily: '怒って',
  crossly: '不機嫌に',

  // ═══ 拍手する系 ═══
  applaud: '拍手する',
  clap: '手をたたく',

  // ═══ 禁止する系 ═══
  bar: '阻止する',
  prohibit: '禁止する',

  // ═══ 仲間系 ═══
  buddy: '仲間',
  mate: '相棒',

  // ═══ くすくす笑い系 ═══
  chuckle: '含み笑い',
  giggle: 'くすくす笑い',

  // ═══ 致命的な系 ═══
  deadly: '致命的な',
  fatal: '命取りの',

  // ═══ 捧げる系 ═══
  dedicate: '捧げる',
  devote: '専念する',

  // ═══ 炎系 ═══
  blaze: '炎',
  flame: '火炎',

  // ═══ 呼び起こす系 ═══
  arouse: '呼び起こす',
  evoke: '想起させる',

  // ═══ 非難する系 ═══
  condemn: '非難する',
  denounce: '糾弾する',

  // ═══ 小屋系 ═══
  cottage: '小屋',
  hut: 'あばら屋',

  // ═══ 浸す系 ═══
  dip: '浸す',
  immerse: '没頭させる',

  // ═══ 群れ系 ═══
  flock: '群れ',
  herd: '牛の群れ',

  // ═══ 愚か者系 ═══
  fool: '愚か者',
  idiot: 'ばか',

  // ═══ 性別系 ═══
  gender: '性別',
  sex: '性',

  // ═══ 焼いた系 ═══
  grilled: '焼いた',
  roast: 'ローストの',

  // ═══ 墓系 ═══
  grave: '墓',
  tomb: '墓所',

  // ═══ かなり系 ═══
  considerably: 'かなり',
  fairly: 'まあまあ',

  // ═══ 必死に系 ═══
  desperately: '必死に',
  frantically: '取り乱して',

  // ═══ 評価する系 ═══
  assess: '査定する',
  evaluate: '評価する',

  // ═══ 評価系 ═══
  assessment: '査定',
  evaluation: '評価',

  // ═══ 真実の系 ═══
  genuine: '本物の',
  authentic: '正真正銘の',

  // ═══ 切実な系 ═══
  earnest: '真摯な',
  sincere: '誠実な',

  // ═══ 省く系 ═══
  omit: '省く',
  exclude: '除外する',

  // ═══ 勇敢な系 ═══
  brave: '勇敢な',
  courageous: '勇気ある',
  gallant: '雄々しい',
  valiant: '勇ましい',

  // ═══ 崩壊系 ═══
  collapse: '崩壊',
  downfall: '没落',

  // ═══ 汚染する系 ═══
  contaminate: '汚染する',
  pollute: '汚す',

  // ═══ 不安系 ═══
  anxiety: '不安',
  unease: '心配',

  // ═══ 繁栄する系 ═══
  flourish: '栄える',
  prosper: '繁栄する',
  thrive: '繁盛する',

  // ═══ 衰退系 ═══
  decline: '衰退',
  deterioration: '悪化',

  // ═══ 回復する系 ═══
  recover: '回復する',
  recuperate: '快復する',

  // ═══ 落ち着かせる系 ═══
  soothe: '落ち着かせる',
  placate: 'なだめる',

  // ═══ 手がかり系 ═══
  clue: '手がかり',
  hint: 'ヒント',

  // ═══ 混乱させる系 ═══
  confuse: '混乱させる',
  bewilder: '当惑させる',
  perplex: '困惑させる',
  baffle: '面食らわせる',

  // ═══ 頑固な系 ═══
  stubborn: '頑固な',
  obstinate: '強情な',
  tenacious: '粘り強い',

  // ═══ 浸食する系 ═══
  erode: '浸食する',
  corrode: '腐食する',

  // ═══ 明らかにする系 ═══
  reveal: '明らかにする',
  disclose: '暴露する',
  divulge: '漏らす',

  // ═══ 減少系 ═══
  decrease: '減少',
  diminish: '減る',

  // ═══ 曖昧な系 ═══
  ambiguous: '曖昧な',
  vague: '漠然とした',

  // ═══ 絶滅系 ═══
  extinction: '絶滅',
  annihilation: '全滅',

  // ═══ 反抗的な系 ═══
  defiant: '反抗的な',
  rebellious: '反逆の',

  // ═══ 強化する系 ═══
  reinforce: '補強する',
  strengthen: '強化する',
  intensify: '強める',
  fortify: '要塞化する',

  // ═══ 横柄な系 ═══
  arrogant: '傲慢な',
  haughty: '横柄な',
  overbearing: '高圧的な',
  domineering: '威圧的な',

  // ═══ 無視する系 ═══
  disregard: '無視する',
  neglect: '怠る',
  overlook: '見落とす',

  // ═══ 苦しみ系 ═══
  agony: '苦悶',
  anguish: '苦悩',
  torment: '苦痛',

  // ═══ 後悔する系 ═══
  regret: '後悔する',
  repent: '悔い改める',
  remorse: '自責の念',

  // ═══ 永遠の系 ═══
  eternal: '永遠の',
  everlasting: '永続する',
  perpetual: '絶え間ない',

  // ═══ 悪意のある系 ═══
  malicious: '悪意のある',
  spiteful: '意地悪な',
  vindictive: '報復的な',

  // ═══ 敵意系 ═══
  hostility: '敵意',
  animosity: '敵愾心',

  // ═══ 軽蔑系 ═══
  scorn: '軽蔑',
  contempt: 'さげすみ',
  disdain: '蔑視',

  // ═══ 混乱した系 ═══
  frantic: '半狂乱の',
  frenzied: '狂乱した',

  // ═══ 策略系 ═══
  scheme: '策略',
  ruse: '計略',
  ploy: '戦略',

  // ═══ 撤回する系 ═══
  countermand: '取り消す',
  recant: '撤回する',
  revoke: '無効にする',
  rescind: '廃止する',
  retract: '前言を撤回する',

  // ═══ 極めて小さい系 ═══
  minuscule: '極小の',
  infinitesimal: '微小な',
  negligible: 'ごくわずかな',

  // ═══ 衰える系 ═══
  wane: '衰える',
  dwindle: '徐々に減る',
  languish: '衰弱する',

  // ═══ 残酷な系 ═══
  ruthless: '冷酷な',
  merciless: '無慈悲な',
  callous: '非情な',

  // ═══ 権威主義の系 ═══
  authoritarian: '権威主義の',
  totalitarian: '全体主義の',

  // ═══ 暴露する系 ═══
  expose: 'さらす',
  unmask: '正体を暴く',

  // ═══ 難攻不落の系 ═══
  impregnable: '難攻不落の',
  invincible: '無敵の',
  invulnerable: '傷つかない',

  // ═══ 異端の系 ═══
  heretical: '異端の',
  blasphemous: '冒涜的な',

  // ═══ 破壊する系 ═══
  demolish: '取り壊す',
  raze: '破壊する',
  obliterate: '跡形もなくす',

  // ═══ 名誉を傷つける系 ═══
  defame: '名誉毀損する',
  libel: '文書で中傷する',

  // ═══ 逆境系 ═══
  adversity: '逆境',
  tribulation: '苦難',
  ordeal: '試練',

  // ═══ 裏切り系 ═══
  treachery: '裏切り',
  betrayal: '背信',

  // ═══ 熱狂的な系 ═══
  fervent: '熱烈な',
  zealous: '熱狂的な',
  fanatical: '狂信的な',
  impassioned: '情熱的な',

  // ═══ 質素な系（austere以外） ═══
  frugal: '倹約な',
  spartan: '禁欲的な',

  // ═══ 共謀系 ═══
  collusion: '共謀',
  complicity: '加担',
  connivance: '黙認',

  // ═══ 和解系 ═══
  reconciliation: '和解',
  rapprochement: '関係改善',

  // ═══ 悲嘆系 ═══
  lament: '嘆く',
  mourn: '悲しむ',
  grieve: '悲嘆する',

  // ═══ 平静系 ═══
  composure: '平静',
  equanimity: '冷静さ',
  serenity: '静寂',
  tranquility: '平穏',

  // ═══ 嫌悪系 ═══
  revulsion: '嫌悪',
  abhorrence: '忌み嫌い',
  loathing: '憎悪',
  repugnance: '反感',

  // ═══ 追放する系 ═══
  banish: '追放する',
  exile: '亡命させる',
  expel: '追い出す',
  ostracize: '排斥する',

  // ═══ 免除する系 ═══
  exempt: '免除する',
  absolve: '放免する',
  exonerate: '無罪にする',
  acquit: '無罪放免する',

  // ═══ 衰弱させる系 ═══
  debilitate: '衰弱させる',
  enervate: '無気力にする',
  incapacitate: '行動不能にする',
  enfeeble: '弱らせる',

  // ═══ その他の衝突ペア ═══
  subordinate: '部下の',
  subservient: '従属的な',

  paramount: '最重要の',
  preeminent: '卓越した',

  indifferent: '無関心な',
  apathetic: '無感動な',

  desolate: '荒涼とした',
  barren: '不毛の',

  pinnacle: '頂点',
  zenith: '絶頂',

  nadir: 'どん底',
  abyss: '深淵',

  opulent: '豪華な',
  lavish: '贅沢な',
  sumptuous: '豪勢な',

  ephemeral: 'はかない',
  transient: '一時的な',
  fleeting: 'つかの間の',

  enigmatic: '謎めいた',
  cryptic: '不可解な',
  inscrutable: '計り知れない',

  lethargic: '無気力な',
  torpid: '不活発な',
  sluggish: '鈍い',

  meticulous: '細心の',
  scrupulous: '良心的な',
  fastidious: '気難しい',

  magnanimous: '寛大な',
  benevolent: '慈善的な',
  philanthropic: '博愛的な',

  vociferous: '騒がしい',
  clamorous: 'やかましい',
  boisterous: '大騒ぎの',

  repudiate: '拒否する',
  renounce: '放棄する',
  relinquish: '手放す',
  forsake: '見捨てる',

  duplicity: '二枚舌',
  deceit: '欺き',

  insidious: '陰険な',
  perfidious: '不誠実な',

  deride: 'あざ笑う',
  ridicule: '嘲笑する',
  mock: 'からかう',

  exacerbate: '悪化させる',
  aggravate: '深刻にする',

  mitigate: '緩和する',
  alleviate: '軽減する',
  ameliorate: '改善する',
  palliate: '一時しのぎする',

  clandestine: '秘密の',
  surreptitious: 'こっそりした',
  covert: '隠密の',
  furtive: 'ひそかな',

  insolent: '横柄な',
  impudent: '生意気な',
  brazen: '厚かましい',
  audacious: '大胆不敵な',

  quell: '鎮圧する',
  suppress: '抑圧する',
  subdue: '制圧する',
  stifle: '押さえ込む',

  opaque: '不透明な',
  murky: '暗い',
  obscure: '不明瞭な',

  lucid: '明晰な',
  pellucid: '透明な',

  prolific: '多作の',
  copious: '大量の',
  profuse: '豊富な',

  iconoclast: '偶像破壊者',
  maverick: '異端児',

  pugnacious: '好戦的な',
  bellicose: '戦闘的な',
  belligerent: '交戦中の',
  combative: '闘争的な',

  paradigm: '模範',
  archetype: '原型',
  exemplar: '模範例',
  paragon: '模範的人物',

  sophistry: '詭弁',
  casuistry: 'こじつけ',

  taciturn: '寡黙な',
  reticent: '口数少ない',
  laconic: '簡潔な',

  succinct: '簡明な',
  concise: '簡潔な',

  obsequious: 'こびへつらう',
  sycophantic: '追従する',
  servile: '卑屈な',

  recalcitrant: '手に負えない',
  intractable: '扱いにくい',
  refractory: '反抗的な',

  nefarious: '極悪な',
  heinous: '凶悪な',
  egregious: '言語道断の',

  ubiquitous: '至る所にある',
  omnipresent: '遍在する',
  pervasive: '浸透した',

  sagacious: '聡明な',
  astute: '鋭い',
  perspicacious: '洞察力ある',
  shrewd: '抜け目ない',

  sanguine: '楽観的な',
  optimistic: '楽天的な',

  despondent: '意気消沈した',
  disconsolate: '暗い気持ちの',
  forlorn: 'わびしい',
  dejected: '落胆した',

  querulous: '不平の多い',
  petulant: '短気な',
  cantankerous: '気難しい',

  circumspect: '慎重な',
  prudent: '思慮深い',
  judicious: '分別ある',
  wary: '用心深い',

  fecund: '肥沃な',
  fertile: '豊かな',

  veracity: '正確さ',
  verisimilitude: '真実らしさ',
  probity: '誠実',

  capricious: '気まぐれな',
  whimsical: '風変わりな',
  mercurial: '変わりやすい',
  fickle: '移り気な',

  ignominy: '恥辱',
  opprobrium: '非難',
  infamy: '悪名',

  ascetic: '禁欲的な',
  abstemious: '節制した',

  obfuscate: '曖昧にする',
  equivocate: 'あいまいに言う',
  prevaricate: '言い逃れる',

  munificent: '気前の良い',
  largesse: '気前よさ',
  bountiful: '寛大な',

  execrable: 'ひどく悪い',
  abominable: '忌まわしい',

  diffident: '自信のない',
  timorous: '臆病な',
  pusillanimous: '気弱な',

  specious: 'もっともらしい',
  fallacious: '虚偽の',

  intransigent: '妥協しない',
  implacable: '容赦ない',

  soporific: '眠気を催す',
  narcotic: '麻酔の',
};

// Process each file
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
    // Match: word: "WORD", meaning: "OLD_MEANING"
    // Be careful to only match exact word
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
