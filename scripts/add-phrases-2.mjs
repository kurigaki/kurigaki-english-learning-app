import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/data/words/eiken.js';
let src = readFileSync(FILE, 'utf8');
let lines = src.split('\n');

let maxId = 0;
for (const line of lines) {
  const m = line.match(/id:\s*(\d+)/);
  if (m) maxId = Math.max(maxId, parseInt(m[1]));
}

const phrases = [
  // ════════ Stage 4 (4級) ════════
  { w:'go to bed', m:'寝る', s:'4', d:2, c:'daily', ex:'She goes to bed at ten every night.', ja:'彼女は毎晩10時に寝る。', exs:[
    {en:'She goes to bed at ten every night.',ja:'彼女は毎晩10時に寝る。',cx:'家庭'},
    {en:'You should go to bed earlier on school nights.',ja:'学校がある日は早く寝た方がいい。',cx:'学校'},
    {en:'He went to bed late because of the movie.',ja:'映画のせいで遅く寝た。',cx:'娯楽'}]},
  { w:'have a good time', m:'楽しむ', s:'4', d:2, c:'daily', ex:'We had a good time at the party last night.', ja:'昨晩のパーティーで楽しんだ。', exs:[
    {en:'We had a good time at the party last night.',ja:'昨晩のパーティーで楽しんだ。',cx:'娯楽'},
    {en:'Did you have a good time on your trip?',ja:'旅行は楽しかった？',cx:'旅行'},
    {en:'I hope you have a good time at the festival.',ja:'お祭りで楽しめるといいね。',cx:'文化'}]},
  { w:'take a bath', m:'お風呂に入る', s:'4', d:2, c:'daily', ex:'She takes a bath before going to bed.', ja:'彼女は寝る前にお風呂に入る。', exs:[
    {en:'She takes a bath before going to bed.',ja:'彼女は寝る前にお風呂に入る。',cx:'家庭'},
    {en:'It is relaxing to take a bath after a long day.',ja:'長い一日の後にお風呂に入るのはリラックスできる。',cx:'日常'},
    {en:'In Japan, people usually take a bath in the evening.',ja:'日本では普通、夕方にお風呂に入る。',cx:'文化'}]},
  { w:'go shopping', m:'買い物に行く', s:'4', d:2, c:'daily', ex:'She often goes shopping on weekends.', ja:'彼女はよく週末に買い物に行く。', exs:[
    {en:'She often goes shopping on weekends.',ja:'彼女はよく週末に買い物に行く。',cx:'日常'},
    {en:'We went shopping for new clothes yesterday.',ja:'昨日新しい服を買いに行った。',cx:'買い物'},
    {en:'Let us go shopping at the new mall.',ja:'新しいモールに買い物に行こう。',cx:'日常'}]},
  { w:'take a walk', m:'散歩する', s:'4', d:2, c:'daily', ex:'Let us take a walk in the park after lunch.', ja:'昼食後に公園を散歩しよう。', exs:[
    {en:'Let us take a walk in the park after lunch.',ja:'昼食後に公園を散歩しよう。',cx:'日常'},
    {en:'She takes a walk with her dog every morning.',ja:'彼女は毎朝犬と散歩する。',cx:'家庭'},
    {en:'Taking a walk is good for your health.',ja:'散歩は健康に良い。',cx:'健康'}]},
  { w:'stay up', m:'起きている', s:'4', d:2, c:'daily', ex:'She stayed up late to finish her homework.', ja:'彼女は宿題を終わらせるために遅くまで起きていた。', exs:[
    {en:'She stayed up late to finish her homework.',ja:'彼女は宿題を終わらせるために遅くまで起きていた。',cx:'学校'},
    {en:'Do not stay up too late before the exam.',ja:'試験前に遅くまで起きていてはいけない。',cx:'学校'},
    {en:'We stayed up all night talking about our dreams.',ja:'夢について一晩中起きて話していた。',cx:'日常'}]},
  { w:'help out', m:'手伝う', s:'4', d:2, c:'daily', ex:'Can you help out with the cooking tonight?', ja:'今晩料理を手伝ってくれる？', exs:[
    {en:'Can you help out with the cooking tonight?',ja:'今晩料理を手伝ってくれる？',cx:'家庭'},
    {en:'She often helps out at the local library.',ja:'彼女はよく地域の図書館で手伝いをする。',cx:'社会'},
    {en:'He helped out his classmate with the project.',ja:'彼はクラスメートのプロジェクトを手伝った。',cx:'学校'}]},
  { w:'take out', m:'取り出す', s:'4', d:2, c:'daily', ex:'Please take out your textbook and open it.', ja:'教科書を取り出して開いてください。', exs:[
    {en:'Please take out your textbook and open it.',ja:'教科書を取り出して開いてください。',cx:'学校'},
    {en:'She took out her umbrella because it was raining.',ja:'雨が降っていたので彼女は傘を取り出した。',cx:'天気'},
    {en:'He took out his wallet to pay for the meal.',ja:'彼は食事の支払いのために財布を取り出した。',cx:'日常'}]},
  { w:'wait for', m:'〜を待つ', s:'4', d:2, c:'daily', ex:'Please wait for me at the station.', ja:'駅で待っていてください。', exs:[
    {en:'Please wait for me at the station.',ja:'駅で待っていてください。',cx:'交通'},
    {en:'We waited for the bus for thirty minutes.',ja:'私たちはバスを30分待った。',cx:'交通'},
    {en:'She is waiting for her friend in the cafeteria.',ja:'彼女は食堂で友達を待っている。',cx:'学校'}]},
  { w:'talk about', m:'〜について話す', s:'4', d:2, c:'communication', ex:'Let us talk about our plans for summer.', ja:'夏の計画について話そう。', exs:[
    {en:'Let us talk about our plans for summer.',ja:'夏の計画について話そう。',cx:'日常'},
    {en:'She talked about her trip to Australia.',ja:'彼女はオーストラリア旅行について話した。',cx:'旅行'},
    {en:'We need to talk about this problem seriously.',ja:'この問題について真剣に話す必要がある。',cx:'仕事'}]},
  { w:'write down', m:'書き留める', s:'4', d:2, c:'school', ex:'Please write down your name and address.', ja:'名前と住所を書き留めてください。', exs:[
    {en:'Please write down your name and address.',ja:'名前と住所を書き留めてください。',cx:'日常'},
    {en:'She wrote down the important points from the lesson.',ja:'彼女は授業の大事なポイントを書き留めた。',cx:'学校'},
    {en:'Write down the phone number before you forget it.',ja:'忘れる前に電話番号を書き留めて。',cx:'日常'}]},
  { w:'have fun', m:'楽しく過ごす', s:'4', d:2, c:'daily', ex:'Have fun at the concert tonight!', ja:'今晩のコンサートを楽しんで！', exs:[
    {en:'Have fun at the concert tonight!',ja:'今晩のコンサートを楽しんで！',cx:'娯楽'},
    {en:'The children had fun playing in the snow.',ja:'子供たちは雪の中で楽しく遊んだ。',cx:'日常'},
    {en:'We always have fun when we get together.',ja:'集まると私たちはいつも楽しく過ごす。',cx:'日常'}]},
  { w:'not at all', m:'全然〜ない', s:'4', d:2, c:'communication', ex:'She is not tired at all after the long walk.', ja:'長い散歩の後も彼女は全然疲れていない。', exs:[
    {en:'She is not tired at all after the long walk.',ja:'長い散歩の後も彼女は全然疲れていない。',cx:'日常'},
    {en:'I do not mind at all. Please go ahead.',ja:'全然構いません。どうぞ。',cx:'会話'},
    {en:'The test was not difficult at all.',ja:'テストは全然難しくなかった。',cx:'学校'}]},
  { w:'too much', m:'〜しすぎる', s:'4', d:2, c:'daily', ex:'He ate too much and got a stomachache.', ja:'彼は食べ過ぎて腹痛になった。', exs:[
    {en:'He ate too much and got a stomachache.',ja:'彼は食べ過ぎて腹痛になった。',cx:'食事'},
    {en:'Do not worry too much about the result.',ja:'結果をあまり心配しすぎないで。',cx:'教育'},
    {en:'She spent too much money on shopping.',ja:'彼女は買い物にお金を使いすぎた。',cx:'買い物'}]},

  // ════════ Stage 3 (3級) ════════
  { w:'take place', m:'行われる', s:'3', d:3, c:'daily', ex:'The festival takes place every August.', ja:'その祭りは毎年8月に行われる。', exs:[
    {en:'The festival takes place every August.',ja:'その祭りは毎年8月に行われる。',cx:'文化'},
    {en:'The meeting will take place in the main hall.',ja:'会議は大ホールで行われる。',cx:'仕事'},
    {en:'Great changes took place in the country.',ja:'その国で大きな変化が起きた。',cx:'社会'}]},
  { w:'make friends', m:'友達を作る', s:'3', d:3, c:'school', ex:'She quickly made friends at her new school.', ja:'彼女は新しい学校ですぐに友達を作った。', exs:[
    {en:'She quickly made friends at her new school.',ja:'彼女は新しい学校ですぐに友達を作った。',cx:'学校'},
    {en:'It is easy to make friends when you are kind.',ja:'親切だと友達を作りやすい。',cx:'日常'},
    {en:'He made friends with children from other countries.',ja:'彼は他の国の子供たちと友達になった。',cx:'国際'}]},
  { w:'make noise', m:'騒ぐ', s:'3', d:3, c:'daily', ex:'Please do not make noise in the library.', ja:'図書館で騒がないでください。', exs:[
    {en:'Please do not make noise in the library.',ja:'図書館で騒がないでください。',cx:'マナー'},
    {en:'The children were making noise in the hallway.',ja:'子供たちが廊下で騒いでいた。',cx:'学校'},
    {en:'Try not to make too much noise at night.',ja:'夜はあまり騒がないようにして。',cx:'家庭'}]},
  { w:'go abroad', m:'海外に行く', s:'3', d:3, c:'travel', ex:'She wants to go abroad to study English.', ja:'彼女は英語を勉強するために海外に行きたい。', exs:[
    {en:'She wants to go abroad to study English.',ja:'彼女は英語を勉強するために海外に行きたい。',cx:'教育'},
    {en:'Many young people go abroad for work experience.',ja:'多くの若者が仕事の経験のために海外に行く。',cx:'仕事'},
    {en:'Have you ever been abroad before?',ja:'これまでに海外に行ったことがありますか？',cx:'旅行'}]},
  { w:'spend time', m:'時間を過ごす', s:'3', d:3, c:'daily', ex:'She spends a lot of time reading books.', ja:'彼女は読書に多くの時間を費やす。', exs:[
    {en:'She spends a lot of time reading books.',ja:'彼女は読書に多くの時間を費やす。',cx:'趣味'},
    {en:'We spent time talking about our future plans.',ja:'将来の計画について話して時間を過ごした。',cx:'日常'},
    {en:'He likes to spend time with his family.',ja:'彼は家族と時間を過ごすのが好きだ。',cx:'家庭'}]},
  { w:'by oneself', m:'一人で', s:'3', d:3, c:'daily', ex:'She traveled to Kyoto by herself.', ja:'彼女は一人で京都に旅行した。', exs:[
    {en:'She traveled to Kyoto by herself.',ja:'彼女は一人で京都に旅行した。',cx:'旅行'},
    {en:'He learned to cook by himself.',ja:'彼は独学で料理を学んだ。',cx:'家庭'},
    {en:'Can you carry all of these by yourself?',ja:'これ全部一人で運べる？',cx:'日常'}]},
  { w:'be worried about', m:'〜を心配する', s:'3', d:3, c:'emotion', ex:'She is worried about the upcoming exam.', ja:'彼女は来たる試験を心配している。', exs:[
    {en:'She is worried about the upcoming exam.',ja:'彼女は来たる試験を心配している。',cx:'学校'},
    {en:'His parents are worried about his health.',ja:'彼の両親は彼の健康を心配している。',cx:'家庭'},
    {en:'Do not be worried about small mistakes.',ja:'小さな間違いを心配しないで。',cx:'教育'}]},
  { w:'be excited about', m:'わくわくする', s:'3', d:3, c:'emotion', ex:'The children are excited about the school trip.', ja:'子供たちは遠足にわくわくしている。', exs:[
    {en:'The children are excited about the school trip.',ja:'子供たちは遠足にわくわくしている。',cx:'学校'},
    {en:'She is excited about starting her new job.',ja:'彼女は新しい仕事を始めることにわくわくしている。',cx:'仕事'},
    {en:'Everyone was excited about the concert.',ja:'みんなコンサートにわくわくしていた。',cx:'娯楽'}]},
  { w:'be tired of', m:'〜に飽きる', s:'3', d:3, c:'emotion', ex:'He is tired of eating the same food every day.', ja:'彼は毎日同じ食事に飽きている。', exs:[
    {en:'He is tired of eating the same food every day.',ja:'彼は毎日同じ食事に飽きている。',cx:'食事'},
    {en:'She is tired of waiting for the bus.',ja:'彼女はバスを待つのに飽きている。',cx:'交通'},
    {en:'I am tired of this rainy weather.',ja:'この雨の天気にうんざりだ。',cx:'天気'}]},
  { w:'be late for', m:'〜に遅れる', s:'3', d:3, c:'school', ex:'He is often late for school in the morning.', ja:'彼はよく朝学校に遅れる。', exs:[
    {en:'He is often late for school in the morning.',ja:'彼はよく朝学校に遅れる。',cx:'学校'},
    {en:'She was late for the meeting because of traffic.',ja:'渋滞のせいで彼女は会議に遅れた。',cx:'仕事'},
    {en:'Do not be late for the movie tonight.',ja:'今夜の映画に遅れないで。',cx:'娯楽'}]},
  { w:'be ready to', m:'準備ができている', s:'3', d:3, c:'daily', ex:'She is ready to start her presentation.', ja:'彼女はプレゼンを始める準備ができている。', exs:[
    {en:'She is ready to start her presentation.',ja:'彼女はプレゼンを始める準備ができている。',cx:'仕事'},
    {en:'Are you ready to go to school?',ja:'学校に行く準備はできた？',cx:'家庭'},
    {en:'The team is ready to play the final game.',ja:'チームは決勝戦をプレーする準備ができている。',cx:'スポーツ'}]},
  { w:'be known as', m:'〜として知られる', s:'3', d:3, c:'culture', ex:'Tokyo is known as a city that never sleeps.', ja:'東京は眠らない街として知られている。', exs:[
    {en:'Tokyo is known as a city that never sleeps.',ja:'東京は眠らない街として知られている。',cx:'旅行'},
    {en:'She is known as one of the best teachers.',ja:'彼女は最も優秀な先生の一人として知られている。',cx:'学校'},
    {en:'This area is known as a rice producing region.',ja:'この地域は米の産地として知られている。',cx:'地理'}]},
  { w:'feel like', m:'〜したい気分', s:'3', d:3, c:'emotion', ex:'I feel like having some ice cream today.', ja:'今日はアイスクリームが食べたい気分だ。', exs:[
    {en:'I feel like having some ice cream today.',ja:'今日はアイスクリームが食べたい気分だ。',cx:'食事'},
    {en:'She did not feel like going out in the rain.',ja:'彼女は雨の中外出する気分ではなかった。',cx:'天気'},
    {en:'Do you feel like watching a movie tonight?',ja:'今夜映画を見たい気分？',cx:'娯楽'}]},
  { w:'run away', m:'逃げる', s:'3', d:3, c:'daily', ex:'The cat ran away when it heard the loud noise.', ja:'猫は大きな音を聞いて逃げた。', exs:[
    {en:'The cat ran away when it heard the loud noise.',ja:'猫は大きな音を聞いて逃げた。',cx:'日常'},
    {en:'You cannot run away from your problems.',ja:'問題から逃げることはできない。',cx:'教育'},
    {en:'The dog ran away from home but came back.',ja:'犬は家から逃げたが戻ってきた。',cx:'家庭'}]},
  { w:'these days', m:'最近', s:'3', d:3, c:'daily', ex:'These days many people work from home.', ja:'最近多くの人が在宅で働いている。', exs:[
    {en:'These days many people work from home.',ja:'最近多くの人が在宅で働いている。',cx:'仕事'},
    {en:'She has been very busy these days.',ja:'彼女は最近とても忙しい。',cx:'日常'},
    {en:'These days children use tablets for studying.',ja:'最近子供たちはタブレットで勉強する。',cx:'教育'}]},
  { w:'once in a while', m:'たまに', s:'3', d:3, c:'daily', ex:'We eat out once in a while for a treat.', ja:'たまにご褒美で外食する。', exs:[
    {en:'We eat out once in a while for a treat.',ja:'たまにご褒美で外食する。',cx:'食事'},
    {en:'She visits her grandparents once in a while.',ja:'彼女はたまに祖父母を訪ねる。',cx:'家庭'},
    {en:'It is nice to take a break once in a while.',ja:'たまに休憩を取るのは良いことだ。',cx:'日常'}]},
  { w:'in a hurry', m:'急いで', s:'3', d:3, c:'daily', ex:'He left the house in a hurry this morning.', ja:'彼は今朝急いで家を出た。', exs:[
    {en:'He left the house in a hurry this morning.',ja:'彼は今朝急いで家を出た。',cx:'日常'},
    {en:'Do not eat in a hurry. Take your time.',ja:'急いで食べないで。ゆっくりしなさい。',cx:'食事'},
    {en:'She packed her bag in a hurry for the trip.',ja:'彼女は旅行のために急いで荷物を詰めた。',cx:'旅行'}]},
  { w:'in trouble', m:'困っている', s:'3', d:3, c:'daily', ex:'He is in trouble because he lost his key.', ja:'鍵をなくして彼は困っている。', exs:[
    {en:'He is in trouble because he lost his key.',ja:'鍵をなくして彼は困っている。',cx:'日常'},
    {en:'If you are in trouble, please ask for help.',ja:'困っていたら、助けを求めてください。',cx:'学校'},
    {en:'The company is in trouble due to falling sales.',ja:'売上減少で会社は困っている。',cx:'ビジネス'}]},
  { w:'give back', m:'返す', s:'3', d:3, c:'daily', ex:'Please give back the book when you finish it.', ja:'読み終わったら本を返してください。', exs:[
    {en:'Please give back the book when you finish it.',ja:'読み終わったら本を返してください。',cx:'学校'},
    {en:'She gave back the money she had borrowed.',ja:'彼女は借りていたお金を返した。',cx:'日常'},
    {en:'He promised to give back the toy after playing.',ja:'彼は遊んだ後おもちゃを返すと約束した。',cx:'家庭'}]},

  // ════════ Stage pre2 (準2級) ════════
  { w:'get used to', m:'慣れる', s:'pre2', d:4, c:'daily', ex:'She got used to living alone in the city.', ja:'彼女は都会で一人暮らしに慣れた。', exs:[
    {en:'She got used to living alone in the city.',ja:'彼女は都会で一人暮らしに慣れた。',cx:'日常'},
    {en:'It takes time to get used to a new job.',ja:'新しい仕事に慣れるには時間がかかる。',cx:'仕事'},
    {en:'He finally got used to the cold weather.',ja:'彼はついに寒い天気に慣れた。',cx:'天気'}]},
  { w:'be used to', m:'〜に慣れている', s:'pre2', d:4, c:'daily', ex:'She is used to getting up early every morning.', ja:'彼女は毎朝早起きに慣れている。', exs:[
    {en:'She is used to getting up early every morning.',ja:'彼女は毎朝早起きに慣れている。',cx:'日常'},
    {en:'He is used to working under pressure.',ja:'彼はプレッシャーの下で働くことに慣れている。',cx:'仕事'},
    {en:'Are you used to driving on the left side?',ja:'左側通行の運転に慣れていますか？',cx:'交通'}]},
  { w:'put up', m:'建てる、泊める', s:'pre2', d:4, c:'daily', ex:'They put up a tent by the river.', ja:'彼らは川のそばにテントを建てた。', exs:[
    {en:'They put up a tent by the river.',ja:'彼らは川のそばにテントを建てた。',cx:'旅行'},
    {en:'She put up a poster on the wall.',ja:'彼女は壁にポスターを貼った。',cx:'日常'},
    {en:'Can you put me up for the night?',ja:'一晩泊めてもらえますか？',cx:'旅行'}]},
  { w:'break up', m:'別れる、解散する', s:'pre2', d:4, c:'communication', ex:'The band broke up after ten years together.', ja:'そのバンドは10年一緒にいた後に解散した。', exs:[
    {en:'The band broke up after ten years together.',ja:'そのバンドは10年一緒にいた後に解散した。',cx:'娯楽'},
    {en:'The meeting broke up at five in the afternoon.',ja:'会議は午後5時に終了した。',cx:'仕事'},
    {en:'The ice on the river is starting to break up.',ja:'川の氷が割れ始めている。',cx:'自然'}]},
  { w:'agree with', m:'同意する', s:'pre2', d:4, c:'communication', ex:'I completely agree with your opinion on this matter.', ja:'この件に関してあなたの意見に完全に同意する。', exs:[
    {en:'I completely agree with your opinion on this matter.',ja:'この件に関してあなたの意見に完全に同意する。',cx:'会話'},
    {en:'She does not agree with the new school rules.',ja:'彼女は新しい校則に同意しない。',cx:'学校'},
    {en:'Most experts agree with this finding.',ja:'ほとんどの専門家がこの発見に同意している。',cx:'学術'}]},
  { w:'ask for', m:'〜を求める', s:'pre2', d:4, c:'communication', ex:'She asked for help with the difficult problem.', ja:'彼女は難しい問題について助けを求めた。', exs:[
    {en:'She asked for help with the difficult problem.',ja:'彼女は難しい問題について助けを求めた。',cx:'学校'},
    {en:'He asked for permission to leave early.',ja:'彼は早退の許可を求めた。',cx:'仕事'},
    {en:'You should ask for directions if you get lost.',ja:'迷ったら道を聞くべきだ。',cx:'旅行'}]},
  { w:'be willing to', m:'喜んで〜する', s:'pre2', d:4, c:'communication', ex:'She is willing to help anyone who needs it.', ja:'彼女は助けが必要な人を喜んで手伝う。', exs:[
    {en:'She is willing to help anyone who needs it.',ja:'彼女は助けが必要な人を喜んで手伝う。',cx:'日常'},
    {en:'He is willing to work overtime this week.',ja:'彼は今週残業することを厭わない。',cx:'仕事'},
    {en:'Are you willing to try something new?',ja:'何か新しいことに挑戦する気はある？',cx:'教育'}]},
  { w:'be capable of', m:'〜する能力がある', s:'pre2', d:4, c:'academic', ex:'She is capable of solving complex problems.', ja:'彼女は複雑な問題を解く能力がある。', exs:[
    {en:'She is capable of solving complex problems.',ja:'彼女は複雑な問題を解く能力がある。',cx:'学術'},
    {en:'This machine is capable of printing 100 pages.',ja:'この機械は100ページ印刷する能力がある。',cx:'技術'},
    {en:'He is capable of speaking three languages.',ja:'彼は3つの言語を話す能力がある。',cx:'言語'}]},
  { w:'be aware of', m:'〜に気づいている', s:'pre2', d:4, c:'academic', ex:'Are you aware of the changes to the schedule?', ja:'スケジュールの変更に気づいていますか？', exs:[
    {en:'Are you aware of the changes to the schedule?',ja:'スケジュールの変更に気づいていますか？',cx:'仕事'},
    {en:'She was not aware of the danger.',ja:'彼女は危険に気づいていなかった。',cx:'安全'},
    {en:'Everyone should be aware of these health risks.',ja:'皆がこれらの健康リスクに気づくべきだ。',cx:'健康'}]},
  { w:'make sense', m:'意味をなす', s:'pre2', d:4, c:'communication', ex:'Your explanation makes a lot of sense to me.', ja:'あなたの説明はとても納得できる。', exs:[
    {en:'Your explanation makes a lot of sense to me.',ja:'あなたの説明はとても納得できる。',cx:'会話'},
    {en:'Does this answer make sense?',ja:'この答えは理にかなっている？',cx:'学校'},
    {en:'It makes sense to save money for the future.',ja:'将来のためにお金を貯めるのは理にかなっている。',cx:'日常'}]},
  { w:'take turns', m:'交代でする', s:'pre2', d:4, c:'daily', ex:'The students took turns reading aloud in class.', ja:'生徒たちは授業で交代で音読した。', exs:[
    {en:'The students took turns reading aloud in class.',ja:'生徒たちは授業で交代で音読した。',cx:'学校'},
    {en:'We take turns doing the dishes at home.',ja:'家では交代で皿洗いをする。',cx:'家庭'},
    {en:'They took turns driving on the long trip.',ja:'長い旅で交代で運転した。',cx:'旅行'}]},
  { w:'no matter what', m:'何があっても', s:'pre2', d:4, c:'communication', ex:'No matter what happens, I will support you.', ja:'何が起こっても、あなたを支えます。', exs:[
    {en:'No matter what happens, I will support you.',ja:'何が起こっても、あなたを支えます。',cx:'日常'},
    {en:'She never gives up no matter what.',ja:'彼女は何があっても決してあきらめない。',cx:'教育'},
    {en:'No matter what he said, nobody believed him.',ja:'彼が何を言っても、誰も信じなかった。',cx:'会話'}]},
  { w:'no matter how', m:'どんなに〜でも', s:'pre2', d:4, c:'communication', ex:'No matter how hard she tried, she could not win.', ja:'どんなに努力しても、彼女は勝てなかった。', exs:[
    {en:'No matter how hard she tried, she could not win.',ja:'どんなに努力しても、彼女は勝てなかった。',cx:'スポーツ'},
    {en:'No matter how busy he is, he always calls home.',ja:'どんなに忙しくても、彼はいつも家に電話する。',cx:'家庭'},
    {en:'No matter how cold it is, she goes jogging.',ja:'どんなに寒くても、彼女はジョギングに行く。',cx:'スポーツ'}]},
  { w:'to begin with', m:'まず初めに', s:'pre2', d:4, c:'communication', ex:'To begin with, let me explain the background.', ja:'まず初めに、背景を説明させてください。', exs:[
    {en:'To begin with, let me explain the background.',ja:'まず初めに、背景を説明させてください。',cx:'仕事'},
    {en:'To begin with, we need more information.',ja:'まず初めに、もっと情報が必要だ。',cx:'学術'},
    {en:'To begin with, I want to thank everyone here.',ja:'まず初めに、ここにいる全員に感謝したい。',cx:'イベント'}]},
  { w:'at present', m:'現在のところ', s:'pre2', d:4, c:'academic', ex:'At present, there is no cure for this disease.', ja:'現在のところ、この病気の治療法はない。', exs:[
    {en:'At present, there is no cure for this disease.',ja:'現在のところ、この病気の治療法はない。',cx:'医療'},
    {en:'At present, she is studying abroad in Canada.',ja:'現在、彼女はカナダに留学中だ。',cx:'教育'},
    {en:'At present, the company has fifty employees.',ja:'現在のところ、会社には50人の従業員がいる。',cx:'ビジネス'}]},
  { w:'all at once', m:'突然', s:'pre2', d:4, c:'daily', ex:'All at once, the room went dark.', ja:'突然、部屋が暗くなった。', exs:[
    {en:'All at once, the room went dark.',ja:'突然、部屋が暗くなった。',cx:'日常'},
    {en:'All at once, everyone started laughing.',ja:'突然、みんなが笑い始めた。',cx:'日常'},
    {en:'You cannot learn everything all at once.',ja:'一度に全部は学べない。',cx:'教育'}]},
  { w:'by chance', m:'偶然に', s:'pre2', d:4, c:'daily', ex:'I met an old friend by chance at the airport.', ja:'空港で偶然旧友に会った。', exs:[
    {en:'I met an old friend by chance at the airport.',ja:'空港で偶然旧友に会った。',cx:'旅行'},
    {en:'She discovered the truth by chance.',ja:'彼女は偶然真実を知った。',cx:'日常'},
    {en:'By chance, he found the perfect book for his study.',ja:'偶然、彼は研究に最適な本を見つけた。',cx:'学術'}]},
  { w:'what is more', m:'さらに', s:'pre2', d:4, c:'communication', ex:'She is smart. What is more, she is very kind.', ja:'彼女は賢い。さらに、とても親切だ。', exs:[
    {en:'She is smart. What is more, she is very kind.',ja:'彼女は賢い。さらに、とても親切だ。',cx:'日常'},
    {en:'The food was delicious. What is more, it was cheap.',ja:'料理は美味しかった。さらに、安かった。',cx:'食事'},
    {en:'He speaks English well. What is more, he knows French.',ja:'彼は英語が上手だ。さらに、フランス語も知っている。',cx:'言語'}]},
  { w:'in practice', m:'実際には', s:'pre2', d:4, c:'academic', ex:'The plan sounds good but is hard in practice.', ja:'計画は良さそうだが、実際には難しい。', exs:[
    {en:'The plan sounds good but is hard in practice.',ja:'計画は良さそうだが、実際には難しい。',cx:'仕事'},
    {en:'In practice, the new system works well.',ja:'実際には、新しいシステムはうまく機能する。',cx:'技術'},
    {en:'Theory and practice are often very different.',ja:'理論と実践はしばしば大きく異なる。',cx:'学術'}]},

  // ════════ Stage 2 (2級) ════════
  { w:'be involved in', m:'〜に関わる', s:'2', d:5, c:'academic', ex:'She is involved in a research project on AI.', ja:'彼女はAIの研究プロジェクトに関わっている。', exs:[
    {en:'She is involved in a research project on AI.',ja:'彼女はAIの研究プロジェクトに関わっている。',cx:'学術'},
    {en:'Many volunteers were involved in the event.',ja:'多くのボランティアがイベントに関わった。',cx:'社会'},
    {en:'He does not want to be involved in the argument.',ja:'彼はその議論に関わりたくない。',cx:'日常'}]},
  { w:'in addition to', m:'〜に加えて', s:'2', d:5, c:'academic', ex:'In addition to English, she speaks French.', ja:'英語に加えて、彼女はフランス語も話す。', exs:[
    {en:'In addition to English, she speaks French.',ja:'英語に加えて、彼女はフランス語も話す。',cx:'言語'},
    {en:'In addition to the fee, there is a tax.',ja:'料金に加えて、税金がかかる。',cx:'ビジネス'},
    {en:'In addition to studying, she plays tennis.',ja:'勉強に加えて、彼女はテニスもする。',cx:'学校'}]},
  { w:'as a result of', m:'〜の結果として', s:'2', d:5, c:'academic', ex:'As a result of the heavy rain, the game was canceled.', ja:'大雨の結果、試合は中止になった。', exs:[
    {en:'As a result of the heavy rain, the game was canceled.',ja:'大雨の結果、試合は中止になった。',cx:'スポーツ'},
    {en:'As a result of her hard work, she passed the exam.',ja:'努力の結果、彼女は試験に合格した。',cx:'学校'},
    {en:'As a result of the accident, the road was closed.',ja:'事故の結果、道路は閉鎖された。',cx:'交通'}]},
  { w:'take into account', m:'考慮に入れる', s:'2', d:5, c:'academic', ex:'You should take the weather into account.', ja:'天気を考慮に入れるべきだ。', exs:[
    {en:'You should take the weather into account.',ja:'天気を考慮に入れるべきだ。',cx:'旅行'},
    {en:'We must take all opinions into account.',ja:'全ての意見を考慮に入れなければならない。',cx:'仕事'},
    {en:'The judge took his age into account.',ja:'裁判官は彼の年齢を考慮に入れた。',cx:'法律'}]},
  { w:'keep in mind', m:'心に留める', s:'2', d:5, c:'academic', ex:'Keep in mind that the deadline is next Friday.', ja:'締め切りが来週金曜日であることを心に留めて。', exs:[
    {en:'Keep in mind that the deadline is next Friday.',ja:'締め切りが来週金曜日であることを心に留めて。',cx:'仕事'},
    {en:'Please keep in mind that the rules have changed.',ja:'ルールが変わったことを覚えておいてください。',cx:'学校'},
    {en:'Keep in mind the difference between fact and opinion.',ja:'事実と意見の違いを心に留めて。',cx:'教育'}]},
  { w:'give rise to', m:'〜を生じさせる', s:'2', d:5, c:'academic', ex:'The new policy gave rise to many complaints.', ja:'新しい方針は多くの苦情を生じさせた。', exs:[
    {en:'The new policy gave rise to many complaints.',ja:'新しい方針は多くの苦情を生じさせた。',cx:'政治'},
    {en:'Climate change gives rise to extreme weather.',ja:'気候変動は異常気象を引き起こす。',cx:'環境'},
    {en:'His speech gave rise to a heated discussion.',ja:'彼のスピーチは激しい議論を引き起こした。',cx:'社会'}]},
  { w:'put forward', m:'提案する', s:'2', d:5, c:'academic', ex:'She put forward a new idea at the meeting.', ja:'彼女は会議で新しいアイデアを提案した。', exs:[
    {en:'She put forward a new idea at the meeting.',ja:'彼女は会議で新しいアイデアを提案した。',cx:'仕事'},
    {en:'Several theories have been put forward.',ja:'いくつかの理論が提唱されている。',cx:'学術'},
    {en:'He put forward a plan to improve efficiency.',ja:'彼は効率改善の計画を提案した。',cx:'ビジネス'}]},
  { w:'set out', m:'出発する、始める', s:'2', d:5, c:'daily', ex:'They set out on a journey across the country.', ja:'彼らは国中を旅する旅に出発した。', exs:[
    {en:'They set out on a journey across the country.',ja:'彼らは国中を旅する旅に出発した。',cx:'旅行'},
    {en:'She set out to write her first novel.',ja:'彼女は最初の小説を書き始めた。',cx:'趣味'},
    {en:'We set out early in the morning to avoid traffic.',ja:'渋滞を避けるために朝早く出発した。',cx:'交通'}]},
  { w:'at a loss', m:'途方に暮れて', s:'2', d:5, c:'emotion', ex:'She was at a loss for words after hearing the news.', ja:'その知らせを聞いて彼女は言葉に詰まった。', exs:[
    {en:'She was at a loss for words after hearing the news.',ja:'その知らせを聞いて彼女は言葉に詰まった。',cx:'感情'},
    {en:'He was at a loss about what to do next.',ja:'次に何をすべきか途方に暮れていた。',cx:'日常'},
    {en:'We were at a loss when the computer crashed.',ja:'コンピューターが壊れた時、途方に暮れた。',cx:'仕事'}]},
  { w:'be bound to', m:'きっと〜する', s:'2', d:5, c:'daily', ex:'If you keep trying, you are bound to succeed.', ja:'挑戦し続ければ、きっと成功する。', exs:[
    {en:'If you keep trying, you are bound to succeed.',ja:'挑戦し続ければ、きっと成功する。',cx:'教育'},
    {en:'Mistakes are bound to happen sometimes.',ja:'間違いは時として起きるものだ。',cx:'日常'},
    {en:'The news is bound to surprise everyone.',ja:'そのニュースはきっと皆を驚かせる。',cx:'社会'}]},
  { w:'be concerned with', m:'〜に関係する', s:'2', d:5, c:'academic', ex:'This book is concerned with environmental issues.', ja:'この本は環境問題に関するものだ。', exs:[
    {en:'This book is concerned with environmental issues.',ja:'この本は環境問題に関するものだ。',cx:'環境'},
    {en:'The study is mainly concerned with child education.',ja:'その研究は主に児童教育に関するものだ。',cx:'教育'},
    {en:'She is concerned with improving public health.',ja:'彼女は公衆衛生の改善に関わっている。',cx:'健康'}]},
  { w:'be forced to', m:'〜を余儀なくされる', s:'2', d:5, c:'academic', ex:'They were forced to cancel the event due to rain.', ja:'雨のためイベントの中止を余儀なくされた。', exs:[
    {en:'They were forced to cancel the event due to rain.',ja:'雨のためイベントの中止を余儀なくされた。',cx:'社会'},
    {en:'She was forced to change her plans suddenly.',ja:'彼女は突然計画の変更を余儀なくされた。',cx:'日常'},
    {en:'The company was forced to reduce its workforce.',ja:'会社は従業員削減を余儀なくされた。',cx:'ビジネス'}]},
  { w:'be limited to', m:'〜に限られる', s:'2', d:5, c:'academic', ex:'Parking is limited to hotel guests only.', ja:'駐車はホテルの宿泊客に限られる。', exs:[
    {en:'Parking is limited to hotel guests only.',ja:'駐車はホテルの宿泊客に限られる。',cx:'旅行'},
    {en:'The offer is limited to the first hundred people.',ja:'このオファーは先着100名に限られる。',cx:'買い物'},
    {en:'Her knowledge is not limited to one subject.',ja:'彼女の知識は一つの分野に限られない。',cx:'学術'}]},
  { w:'with respect to', m:'〜に関して', s:'2', d:5, c:'academic', ex:'With respect to your question, here is the answer.', ja:'ご質問に関して、こちらが回答です。', exs:[
    {en:'With respect to your question, here is the answer.',ja:'ご質問に関して、こちらが回答です。',cx:'仕事'},
    {en:'With respect to safety, we follow strict rules.',ja:'安全に関して、厳格なルールに従っている。',cx:'安全'},
    {en:'The law is clear with respect to this matter.',ja:'この件に関して法律は明確だ。',cx:'法律'}]},
  { w:'to make matters worse', m:'さらに悪いことに', s:'2', d:5, c:'communication', ex:'To make matters worse, it started raining heavily.', ja:'さらに悪いことに、大雨が降り始めた。', exs:[
    {en:'To make matters worse, it started raining heavily.',ja:'さらに悪いことに、大雨が降り始めた。',cx:'天気'},
    {en:'To make matters worse, the train was canceled.',ja:'さらに悪いことに、電車が運休になった。',cx:'交通'},
    {en:'To make matters worse, he lost his wallet too.',ja:'さらに悪いことに、彼は財布もなくした。',cx:'日常'}]},
];

const wordRe = /word:\s*"([^"]+)"/;

let added = 0;
for (const p of phrases) {
  maxId++;
  const exArr = p.exs.map(e => '{ en: "' + e.en + '", ja: "' + e.ja + '", context: "' + e.cx + '" }').join(', ');
  const entry = '  { id: ' + maxId + ', word: "' + p.w + '", meaning: "' + p.m + '", partOfSpeech: "other", course: "eiken", stage: "' + p.s + '", example: "' + p.ex + '", exampleJa: "' + p.ja + '", examples: [' + exArr + '], difficulty: ' + p.d + ', category: "' + p.c + '", categories: ["' + p.c + '"], frequencyRank: 1, source: "original" },';

  let insertIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes('stage: "' + p.s + '"') && lines[i].includes('difficulty: ' + p.d)) {
      insertIdx = i; break;
    }
  }
  if (insertIdx >= 0) { lines.splice(insertIdx + 1, 0, entry); added++; }
  else { console.log('SKIP: no insert point for', p.w, 'stage:', p.s); }
}

// Update header
const stageRe = /stage:\s*"([^"]+)"/;
const counts = {};
for (const line of lines) {
  const wm = line.match(wordRe); const sm = line.match(stageRe);
  if (wm && sm) counts[sm[1]] = (counts[sm[1]] || 0) + 1;
}
const header = '// 5級:' + counts['5'] + ' | 4級:' + counts['4'] + ' | 3級:' + counts['3'] + ' | 準2級:' + counts['pre2'] + ' | 2級:' + counts['2'] + ' | 準1級:' + counts['pre1'] + ' | 1級:' + counts['1'];
for (let i = 0; i < 10; i++) {
  if (lines[i].includes('5級:') && lines[i].includes('1級:')) { lines[i] = header; break; }
}

writeFileSync(FILE, lines.join('\n'));
console.log('Added: ' + added + ' phrases');
console.log(header);
console.log('Total: ' + Object.values(counts).reduce((a,b) => a+b, 0));
