import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/data/words/eiken.js';
let src = readFileSync(FILE, 'utf8');
let lines = src.split('\n');
const wordRe = /word:\s*"([^"]+)"/;

let maxId = 0;
for (const line of lines) {
  const m = line.match(/id:\s*(\d+)/);
  if (m) maxId = Math.max(maxId, parseInt(m[1]));
}

const phrases = [
  // ════════ Stage 4 (中学中級) ════════
  // 基本構文
  { w:'how about', m:'〜はどう？', s:'4', d:2, c:'communication', ex:'How about going to the beach this weekend?', ja:'今週末ビーチに行くのはどう？', exs:[
    {en:'How about going to the beach this weekend?',ja:'今週末ビーチに行くのはどう？',cx:'日常'},
    {en:'How about trying this new restaurant?',ja:'この新しいレストランを試してみない？',cx:'食事'},
    {en:'How about we meet at three in the afternoon?',ja:'午後3時に会うのはどう？',cx:'約束'}]},
  { w:'what about', m:'〜はどうか', s:'4', d:2, c:'communication', ex:'What about your plan for the summer?', ja:'夏の計画はどうなの？', exs:[
    {en:'What about your plan for the summer?',ja:'夏の計画はどうなの？',cx:'日常'},
    {en:'What about asking the teacher for help?',ja:'先生に助けを求めるのはどう？',cx:'学校'},
    {en:'What about the people who cannot attend?',ja:'参加できない人はどうなるの？',cx:'社会'}]},
  { w:'would like to', m:'〜したい', s:'4', d:2, c:'communication', ex:'I would like to visit London someday.', ja:'いつかロンドンを訪れたい。', exs:[
    {en:'I would like to visit London someday.',ja:'いつかロンドンを訪れたい。',cx:'旅行'},
    {en:'She would like to learn how to cook.',ja:'彼女は料理の仕方を学びたい。',cx:'家庭'},
    {en:'We would like to thank everyone for coming.',ja:'お越しの皆様に感謝申し上げます。',cx:'イベント'}]},
  { w:'used to', m:'以前は〜した', s:'4', d:2, c:'daily', ex:'She used to live in a small town.', ja:'彼女は以前小さな町に住んでいた。', exs:[
    {en:'She used to live in a small town.',ja:'彼女は以前小さな町に住んでいた。',cx:'日常'},
    {en:'He used to play soccer every day after school.',ja:'彼は以前毎日放課後にサッカーをしていた。',cx:'スポーツ'},
    {en:'This building used to be a hospital.',ja:'この建物は以前は病院だった。',cx:'社会'}]},
  { w:'had better', m:'〜した方がいい', s:'4', d:2, c:'communication', ex:'You had better leave now or you will be late.', ja:'今出ないと遅刻するよ。', exs:[
    {en:'You had better leave now or you will be late.',ja:'今出ないと遅刻するよ。',cx:'日常'},
    {en:'We had better bring an umbrella today.',ja:'今日は傘を持って行った方がいい。',cx:'天気'},
    {en:'You had better study harder for the test.',ja:'テストのためにもっと勉強した方がいい。',cx:'学校'}]},
  { w:'not only', m:'〜だけでなく', s:'4', d:2, c:'communication', ex:'She is not only smart but also very kind.', ja:'彼女は賢いだけでなくとても親切だ。', exs:[
    {en:'She is not only smart but also very kind.',ja:'彼女は賢いだけでなくとても親切だ。',cx:'学校'},
    {en:'Not only children but also adults enjoyed it.',ja:'子供だけでなく大人も楽しんだ。',cx:'娯楽'},
    {en:'He speaks not only English but also French.',ja:'彼は英語だけでなくフランス語も話す。',cx:'言語'}]},
  { w:'such as', m:'〜のような', s:'4', d:2, c:'communication', ex:'She enjoys sports such as tennis and swimming.', ja:'彼女はテニスや水泳のようなスポーツが好きだ。', exs:[
    {en:'She enjoys sports such as tennis and swimming.',ja:'彼女はテニスや水泳のようなスポーツが好きだ。',cx:'スポーツ'},
    {en:'Big cities such as Tokyo are very crowded.',ja:'東京のような大都市はとても混んでいる。',cx:'社会'},
    {en:'Fruits such as apples and oranges are healthy.',ja:'りんごやオレンジのような果物は健康的だ。',cx:'食事'}]},
  { w:'more and more', m:'ますます', s:'4', d:2, c:'daily', ex:'More and more people are using smartphones.', ja:'ますます多くの人がスマートフォンを使っている。', exs:[
    {en:'More and more people are using smartphones.',ja:'ますます多くの人がスマートフォンを使っている。',cx:'技術'},
    {en:'English is becoming more and more important.',ja:'英語はますます重要になっている。',cx:'教育'},
    {en:'More and more tourists visit Japan every year.',ja:'毎年ますます多くの観光客が日本を訪れる。',cx:'旅行'}]},
  { w:'one of', m:'〜のひとつ', s:'4', d:2, c:'daily', ex:'Tokyo is one of the largest cities in the world.', ja:'東京は世界最大の都市のひとつだ。', exs:[
    {en:'Tokyo is one of the largest cities in the world.',ja:'東京は世界最大の都市のひとつだ。',cx:'地理'},
    {en:'She is one of the best students in the class.',ja:'彼女はクラスで最も優秀な生徒の一人だ。',cx:'学校'},
    {en:'This is one of my favorite books.',ja:'これは私のお気に入りの本のひとつだ。',cx:'趣味'}]},
  { w:'kind of', m:'ちょっと', s:'4', d:2, c:'communication', ex:'The movie was kind of scary for children.', ja:'その映画は子供にはちょっと怖かった。', exs:[
    {en:'The movie was kind of scary for children.',ja:'その映画は子供にはちょっと怖かった。',cx:'娯楽'},
    {en:'He is kind of shy when meeting new people.',ja:'彼は新しい人に会うとちょっと恥ずかしがる。',cx:'日常'},
    {en:'It is kind of cold outside today.',ja:'今日は外がちょっと寒い。',cx:'天気'}]},
  { w:'a few', m:'少しの（数）', s:'4', d:2, c:'daily', ex:'She has a few good friends at her school.', ja:'彼女は学校に親しい友達が数人いる。', exs:[
    {en:'She has a few good friends at her school.',ja:'彼女は学校に親しい友達が数人いる。',cx:'学校'},
    {en:'We stayed there for a few days.',ja:'私たちはそこに数日間滞在した。',cx:'旅行'},
    {en:'A few students were absent from class today.',ja:'今日は数人の生徒が授業を欠席した。',cx:'学校'}]},
  { w:'a little', m:'少しの（量）', s:'4', d:2, c:'daily', ex:'Could you speak a little more slowly please?', ja:'もう少しゆっくり話してもらえますか？', exs:[
    {en:'Could you speak a little more slowly please?',ja:'もう少しゆっくり話してもらえますか？',cx:'会話'},
    {en:'She added a little sugar to the tea.',ja:'彼女は紅茶に少しの砂糖を加えた。',cx:'食事'},
    {en:'He felt a little tired after the long walk.',ja:'長い散歩の後、彼は少し疲れを感じた。',cx:'日常'}]},
  { w:'come back', m:'戻る', s:'4', d:2, c:'daily', ex:'She will come back home at six tonight.', ja:'彼女は今夜6時に家に戻る。', exs:[
    {en:'She will come back home at six tonight.',ja:'彼女は今夜6時に家に戻る。',cx:'家庭'},
    {en:'Please come back again next week.',ja:'来週もう一度来てください。',cx:'仕事'},
    {en:'He came back from his trip yesterday.',ja:'彼は昨日旅行から戻った。',cx:'旅行'}]},
  { w:'go back', m:'帰る、戻る', s:'4', d:2, c:'daily', ex:'We need to go back to the hotel before dark.', ja:'暗くなる前にホテルに戻る必要がある。', exs:[
    {en:'We need to go back to the hotel before dark.',ja:'暗くなる前にホテルに戻る必要がある。',cx:'旅行'},
    {en:'She went back to her hometown for the holiday.',ja:'彼女は休日に故郷に帰った。',cx:'家庭'},
    {en:'Let us go back to the main topic.',ja:'本題に戻りましょう。',cx:'会議'}]},
  { w:'go on', m:'続ける、起こる', s:'4', d:2, c:'daily', ex:'Please go on with your story.', ja:'話の続きをどうぞ。', exs:[
    {en:'Please go on with your story.',ja:'話の続きをどうぞ。',cx:'会話'},
    {en:'What is going on outside?',ja:'外で何が起きているの？',cx:'日常'},
    {en:'The concert went on until midnight.',ja:'コンサートは深夜まで続いた。',cx:'娯楽'}]},
  { w:'put on', m:'着る、つける', s:'4', d:2, c:'daily', ex:'She put on her coat and went outside.', ja:'彼女はコートを着て外に出た。', exs:[
    {en:'She put on her coat and went outside.',ja:'彼女はコートを着て外に出た。',cx:'日常'},
    {en:'Please put on your shoes before going out.',ja:'出かける前に靴を履いてください。',cx:'家庭'},
    {en:'He put on his glasses to read the letter.',ja:'彼は手紙を読むために眼鏡をかけた。',cx:'日常'}]},
  { w:'turn on', m:'つける（電源）', s:'4', d:2, c:'daily', ex:'Please turn on the light in the room.', ja:'部屋の電気をつけてください。', exs:[
    {en:'Please turn on the light in the room.',ja:'部屋の電気をつけてください。',cx:'家庭'},
    {en:'She turned on the computer to check email.',ja:'彼女はメールを確認するためにPCをつけた。',cx:'仕事'},
    {en:'Turn on the radio so we can hear the news.',ja:'ニュースが聞けるようにラジオをつけて。',cx:'日常'}]},
  { w:'turn off', m:'消す（電源）', s:'4', d:2, c:'daily', ex:'Please turn off your phone during the movie.', ja:'映画の間は携帯電話を消してください。', exs:[
    {en:'Please turn off your phone during the movie.',ja:'映画の間は携帯電話を消してください。',cx:'マナー'},
    {en:'Do not forget to turn off the lights.',ja:'電気を消すのを忘れないで。',cx:'家庭'},
    {en:'He turned off the engine and got out.',ja:'彼はエンジンを切って降りた。',cx:'交通'}]},
  { w:'come in', m:'入る', s:'4', d:2, c:'daily', ex:'Please come in and sit down.', ja:'どうぞ入って座ってください。', exs:[
    {en:'Please come in and sit down.',ja:'どうぞ入って座ってください。',cx:'接客'},
    {en:'A cold wind came in through the open window.',ja:'開いた窓から冷たい風が入ってきた。',cx:'家庭'},
    {en:'She came in with a big smile on her face.',ja:'彼女は満面の笑みで入ってきた。',cx:'日常'}]},
  { w:'go out', m:'出かける', s:'4', d:2, c:'daily', ex:'Let us go out for dinner tonight.', ja:'今夜外食に出かけよう。', exs:[
    {en:'Let us go out for dinner tonight.',ja:'今夜外食に出かけよう。',cx:'食事'},
    {en:'She goes out with her friends on weekends.',ja:'彼女は週末に友達と出かける。',cx:'日常'},
    {en:'The fire went out after a few minutes.',ja:'火は数分後に消えた。',cx:'家庭'}]},
  { w:'sit down', m:'座る', s:'4', d:2, c:'daily', ex:'Please sit down and make yourself comfortable.', ja:'どうぞ座って楽にしてください。', exs:[
    {en:'Please sit down and make yourself comfortable.',ja:'どうぞ座って楽にしてください。',cx:'接客'},
    {en:'She sat down at the table and began to eat.',ja:'彼女はテーブルに座って食べ始めた。',cx:'食事'},
    {en:'Sit down and listen to the teacher carefully.',ja:'座って先生の話をよく聞きなさい。',cx:'学校'}]},
  { w:'stand up', m:'立ち上がる', s:'4', d:2, c:'daily', ex:'Everyone stood up when the teacher entered.', ja:'先生が入ってきた時全員が立ち上がった。', exs:[
    {en:'Everyone stood up when the teacher entered.',ja:'先生が入ってきた時全員が立ち上がった。',cx:'学校'},
    {en:'She stood up to give her seat to the old man.',ja:'彼女は老人に席を譲るために立ち上がった。',cx:'マナー'},
    {en:'He stood up and walked to the front.',ja:'彼は立ち上がって前に歩いた。',cx:'日常'}]},
  { w:'all over', m:'至る所に', s:'4', d:2, c:'daily', ex:'Cherry blossoms bloom all over Japan in spring.', ja:'春には桜が日本中に咲く。', exs:[
    {en:'Cherry blossoms bloom all over Japan in spring.',ja:'春には桜が日本中に咲く。',cx:'文化'},
    {en:'News of the event spread all over the world.',ja:'そのイベントのニュースは世界中に広がった。',cx:'社会'},
    {en:'Water spilled all over the floor.',ja:'水が床一面にこぼれた。',cx:'家庭'}]},
  { w:'right now', m:'今すぐ', s:'4', d:2, c:'daily', ex:'We need to leave right now or we will be late.', ja:'今すぐ出ないと遅刻する。', exs:[
    {en:'We need to leave right now or we will be late.',ja:'今すぐ出ないと遅刻する。',cx:'日常'},
    {en:'She is busy right now but will call you later.',ja:'彼女は今忙しいが後で電話する。',cx:'仕事'},
    {en:'Right now is the best time to start studying.',ja:'今すぐが勉強を始める最高の時だ。',cx:'教育'}]},
  { w:'one day', m:'ある日、いつか', s:'4', d:2, c:'daily', ex:'One day she hopes to travel around the world.', ja:'いつか彼女は世界中を旅したいと思っている。', exs:[
    {en:'One day she hopes to travel around the world.',ja:'いつか彼女は世界中を旅したいと思っている。',cx:'旅行'},
    {en:'One day a letter arrived from a distant country.',ja:'ある日、遠い国から手紙が届いた。',cx:'日常'},
    {en:'He wants to become a doctor one day.',ja:'彼はいつか医者になりたい。',cx:'将来'}]},
  { w:'some day', m:'いつか', s:'4', d:2, c:'daily', ex:'Some day we will meet again.', ja:'いつかまた会えるだろう。', exs:[
    {en:'Some day we will meet again.',ja:'いつかまた会えるだろう。',cx:'日常'},
    {en:'She dreams of visiting Paris some day.',ja:'彼女はいつかパリを訪れることを夢見ている。',cx:'旅行'},
    {en:'Some day this technology will change the world.',ja:'いつかこの技術は世界を変えるだろう。',cx:'技術'}]},
  { w:'next to', m:'〜の隣に', s:'4', d:2, c:'daily', ex:'The bookstore is next to the post office.', ja:'本屋は郵便局の隣にある。', exs:[
    {en:'The bookstore is next to the post office.',ja:'本屋は郵便局の隣にある。',cx:'道案内'},
    {en:'She sat next to her best friend in class.',ja:'彼女は授業で親友の隣に座った。',cx:'学校'},
    {en:'Our house is right next to the park.',ja:'私たちの家は公園のすぐ隣にある。',cx:'家庭'}]},
  { w:'at first', m:'最初は', s:'4', d:2, c:'communication', ex:'At first it was difficult but it got easier.', ja:'最初は難しかったが、だんだん簡単になった。', exs:[
    {en:'At first it was difficult but it got easier.',ja:'最初は難しかったが、だんだん簡単になった。',cx:'学校'},
    {en:'At first she did not like the new school.',ja:'最初は彼女はその新しい学校が好きではなかった。',cx:'日常'},
    {en:'At first nobody believed his amazing story.',ja:'最初は誰も彼の驚くべき話を信じなかった。',cx:'会話'}]},
  { w:'at last', m:'ついに', s:'4', d:2, c:'communication', ex:'At last we reached the top of the mountain.', ja:'ついに山頂に到達した。', exs:[
    {en:'At last we reached the top of the mountain.',ja:'ついに山頂に到達した。',cx:'スポーツ'},
    {en:'At last the rain stopped and the sun came out.',ja:'ついに雨が止んで太陽が出た。',cx:'天気'},
    {en:'At last she finished writing her long report.',ja:'ついに彼女は長いレポートを書き終えた。',cx:'学校'}]},
  { w:'of course', m:'もちろん', s:'4', d:2, c:'communication', ex:'Of course you can borrow my bicycle.', ja:'もちろん私の自転車を借りていいよ。', exs:[
    {en:'Of course you can borrow my bicycle.',ja:'もちろん私の自転車を借りていいよ。',cx:'日常'},
    {en:'Of course I will help you with your homework.',ja:'もちろん宿題を手伝うよ。',cx:'学校'},
    {en:'She was tired but of course she kept going.',ja:'彼女は疲れていたが、もちろん続けた。',cx:'スポーツ'}]},
  { w:'so that', m:'〜するために', s:'4', d:2, c:'communication', ex:'She studied hard so that she could pass the test.', ja:'テストに受かるために彼女は一生懸命勉強した。', exs:[
    {en:'She studied hard so that she could pass the test.',ja:'テストに受かるために彼女は一生懸命勉強した。',cx:'学校'},
    {en:'He left early so that he would not be late.',ja:'遅れないように彼は早く出た。',cx:'日常'},
    {en:'Speak clearly so that everyone can understand.',ja:'全員が理解できるように明確に話して。',cx:'会話'}]},

  // ════════ Stage 3 (中学卒業) ════════
  { w:'be afraid of', m:'〜を恐れる', s:'3', d:3, c:'emotion', ex:'Many children are afraid of the dark.', ja:'多くの子供は暗闇を恐れる。', exs:[
    {en:'Many children are afraid of the dark.',ja:'多くの子供は暗闇を恐れる。',cx:'日常'},{en:'Do not be afraid of making mistakes.',ja:'間違えることを恐れないで。',cx:'教育'},{en:'She is afraid of speaking in front of people.',ja:'彼女は人前で話すのを恐れている。',cx:'学校'}]},
  { w:'be proud of', m:'〜を誇りに思う', s:'3', d:3, c:'emotion', ex:'Her parents are very proud of her success.', ja:'彼女の両親は彼女の成功をとても誇りに思っている。', exs:[
    {en:'Her parents are very proud of her success.',ja:'彼女の両親は彼女の成功をとても誇りに思っている。',cx:'家庭'},{en:'We are proud of our school team.',ja:'私たちは学校のチームを誇りに思っている。',cx:'スポーツ'},{en:'He is proud of his Japanese heritage.',ja:'彼は日本の伝統を誇りに思っている。',cx:'文化'}]},
  { w:'be surprised at', m:'〜に驚く', s:'3', d:3, c:'emotion', ex:'We were surprised at the beautiful view.', ja:'私たちは美しい景色に驚いた。', exs:[
    {en:'We were surprised at the beautiful view.',ja:'私たちは美しい景色に驚いた。',cx:'旅行'},{en:'She was surprised at the unexpected gift.',ja:'彼女は思いがけない贈り物に驚いた。',cx:'日常'},{en:'Everyone was surprised at the test results.',ja:'全員がテスト結果に驚いた。',cx:'学校'}]},
  { w:'be known for', m:'〜で知られる', s:'3', d:3, c:'culture', ex:'Kyoto is known for its beautiful temples.', ja:'京都は美しい寺院で知られている。', exs:[
    {en:'Kyoto is known for its beautiful temples.',ja:'京都は美しい寺院で知られている。',cx:'旅行'},{en:'Japan is known for its excellent train system.',ja:'日本は優れた鉄道システムで知られている。',cx:'交通'},{en:'She is known for her kindness to everyone.',ja:'彼女はみんなへの親切さで知られている。',cx:'日常'}]},
  { w:'be made of', m:'〜でできている', s:'3', d:3, c:'science', ex:'This table is made of solid oak wood.', ja:'このテーブルは頑丈なオーク材でできている。', exs:[
    {en:'This table is made of solid oak wood.',ja:'このテーブルは頑丈なオーク材でできている。',cx:'家庭'},{en:'The ring is made of pure gold.',ja:'その指輪は純金でできている。',cx:'買い物'},{en:'Paper is made of wood fibers.',ja:'紙は木の繊維でできている。',cx:'科学'}]},
  { w:'be made from', m:'〜から作られる', s:'3', d:3, c:'science', ex:'Wine is made from grapes grown in the valley.', ja:'ワインは谷で育ったブドウから作られる。', exs:[
    {en:'Wine is made from grapes grown in the valley.',ja:'ワインは谷で育ったブドウから作られる。',cx:'食事'},{en:'Butter is made from fresh milk.',ja:'バターは新鮮な牛乳から作られる。',cx:'料理'},{en:'Tofu is made from soybeans.',ja:'豆腐は大豆から作られる。',cx:'食文化'}]},
  { w:'be covered with', m:'〜で覆われる', s:'3', d:3, c:'nature', ex:'The mountain was covered with white snow.', ja:'山は白い雪で覆われていた。', exs:[
    {en:'The mountain was covered with white snow.',ja:'山は白い雪で覆われていた。',cx:'自然'},{en:'The walls were covered with beautiful paintings.',ja:'壁は美しい絵画で覆われていた。',cx:'芸術'},{en:'The ground was covered with fallen leaves.',ja:'地面は落ち葉で覆われていた。',cx:'季節'}]},
  { w:'be filled with', m:'〜で満たされる', s:'3', d:3, c:'emotion', ex:'The room was filled with the smell of flowers.', ja:'部屋は花の香りで満たされていた。', exs:[
    {en:'The room was filled with the smell of flowers.',ja:'部屋は花の香りで満たされていた。',cx:'日常'},{en:'Her eyes were filled with tears of joy.',ja:'彼女の目は喜びの涙で満たされていた。',cx:'感情'},{en:'The stadium was filled with excited fans.',ja:'スタジアムは興奮したファンで満たされていた。',cx:'スポーツ'}]},
  { w:'be different from', m:'〜と異なる', s:'3', d:3, c:'communication', ex:'Life in the city is different from the country.', ja:'都会の生活は田舎とは異なる。', exs:[
    {en:'Life in the city is different from the country.',ja:'都会の生活は田舎とは異なる。',cx:'社会'},{en:'Her opinion is different from mine.',ja:'彼女の意見は私のとは異なる。',cx:'会話'},{en:'Japanese culture is different from Western culture.',ja:'日本の文化は西洋の文化とは異なる。',cx:'文化'}]},
  { w:'be similar to', m:'〜に似ている', s:'3', d:3, c:'communication', ex:'This word is similar to another English word.', ja:'この語は別の英語の語に似ている。', exs:[
    {en:'This word is similar to another English word.',ja:'この語は別の英語の語に似ている。',cx:'言語'},{en:'His idea is similar to what she suggested.',ja:'彼のアイデアは彼女の提案に似ている。',cx:'仕事'},{en:'The two cities are similar to each other.',ja:'2つの都市は互いに似ている。',cx:'地理'}]},
  { w:'be based on', m:'〜に基づく', s:'3', d:3, c:'academic', ex:'This movie is based on a true story.', ja:'この映画は実話に基づいている。', exs:[
    {en:'This movie is based on a true story.',ja:'この映画は実話に基づいている。',cx:'娯楽'},{en:'Our plan is based on careful research.',ja:'私たちの計画は慎重な調査に基づいている。',cx:'仕事'},{en:'The decision was based on the latest data.',ja:'その決定は最新のデータに基づいていた。',cx:'学術'}]},
  { w:'be related to', m:'〜と関連する', s:'3', d:3, c:'academic', ex:'This problem is related to climate change.', ja:'この問題は気候変動と関連している。', exs:[
    {en:'This problem is related to climate change.',ja:'この問題は気候変動と関連している。',cx:'環境'},{en:'Are these two events related to each other?',ja:'これら2つの出来事は互いに関連している？',cx:'学術'},{en:'Good sleep is related to better health.',ja:'良い睡眠はより良い健康と関連している。',cx:'健康'}]},
  { w:'look like', m:'〜に見える', s:'3', d:3, c:'daily', ex:'That cloud looks like a big white rabbit.', ja:'あの雲は大きな白いウサギに見える。', exs:[
    {en:'That cloud looks like a big white rabbit.',ja:'あの雲は大きな白いウサギに見える。',cx:'自然'},{en:'She looks like her mother when she smiles.',ja:'彼女は微笑むと母親に似ている。',cx:'家庭'},{en:'It looks like it is going to rain soon.',ja:'もうすぐ雨が降りそうだ。',cx:'天気'}]},
  { w:'get on', m:'乗る', s:'3', d:3, c:'travel', ex:'She got on the bus to go to school.', ja:'彼女は学校に行くためにバスに乗った。', exs:[
    {en:'She got on the bus to go to school.',ja:'彼女は学校に行くためにバスに乗った。',cx:'交通'},{en:'We got on the train just before it left.',ja:'電車が出発する直前に乗り込んだ。',cx:'旅行'},{en:'Please get on the elevator and press three.',ja:'エレベーターに乗って3を押してください。',cx:'日常'}]},
  { w:'get off', m:'降りる', s:'3', d:3, c:'travel', ex:'We need to get off at the next station.', ja:'次の駅で降りる必要がある。', exs:[
    {en:'We need to get off at the next station.',ja:'次の駅で降りる必要がある。',cx:'交通'},{en:'She got off the bus and walked home.',ja:'彼女はバスを降りて歩いて帰った。',cx:'日常'},{en:'Please get off here for the museum.',ja:'美術館へはここで降りてください。',cx:'旅行'}]},
  { w:'get along with', m:'仲良くする', s:'3', d:3, c:'communication', ex:'She gets along with everyone in her class.', ja:'彼女はクラスの全員と仲が良い。', exs:[
    {en:'She gets along with everyone in her class.',ja:'彼女はクラスの全員と仲が良い。',cx:'学校'},{en:'It is important to get along with your neighbors.',ja:'近所の人と仲良くすることは大切だ。',cx:'社会'},{en:'The two brothers get along with each other well.',ja:'2人の兄弟は互いにとても仲が良い。',cx:'家庭'}]},
  { w:'come true', m:'実現する', s:'3', d:3, c:'emotion', ex:'Her dream of becoming a singer finally came true.', ja:'歌手になるという彼女の夢がついに実現した。', exs:[
    {en:'Her dream of becoming a singer finally came true.',ja:'歌手になるという彼女の夢がついに実現した。',cx:'娯楽'},{en:'Hard work can make your dreams come true.',ja:'努力は夢を実現させることができる。',cx:'教育'},{en:'His wish to visit Japan came true last summer.',ja:'日本を訪れるという彼の願いは去年の夏に実現した。',cx:'旅行'}]},
  { w:'make sure', m:'確認する', s:'3', d:3, c:'communication', ex:'Make sure you lock the door before leaving.', ja:'出かける前にドアを鍵で閉めたか確認して。', exs:[
    {en:'Make sure you lock the door before leaving.',ja:'出かける前にドアを鍵で閉めたか確認して。',cx:'家庭'},{en:'Please make sure your name is on the paper.',ja:'紙に名前が書いてあるか確認してください。',cx:'学校'},{en:'Make sure to bring your passport tomorrow.',ja:'明日パスポートを持ってくるのを忘れないで。',cx:'旅行'}]},
  { w:'pay attention to', m:'注意を払う', s:'3', d:3, c:'communication', ex:'Please pay attention to the safety instructions.', ja:'安全に関する指示に注意を払ってください。', exs:[
    {en:'Please pay attention to the safety instructions.',ja:'安全に関する指示に注意を払ってください。',cx:'安全'},{en:'Students should pay attention to the teacher.',ja:'生徒は先生に注意を払うべきだ。',cx:'学校'},{en:'Pay attention to the road when you drive.',ja:'運転する時は道路に注意を払って。',cx:'交通'}]},
  { w:'think of', m:'〜を思いつく', s:'3', d:3, c:'communication', ex:'Can you think of a good idea for the project?', ja:'プロジェクトの良いアイデアを思いつける？', exs:[
    {en:'Can you think of a good idea for the project?',ja:'プロジェクトの良いアイデアを思いつける？',cx:'仕事'},{en:'She always thinks of others before herself.',ja:'彼女はいつも自分より他人のことを考える。',cx:'道徳'},{en:'What do you think of this new design?',ja:'この新しいデザインについてどう思う？',cx:'日常'}]},
  { w:'think about', m:'〜について考える', s:'3', d:3, c:'communication', ex:'She thought about the problem for a long time.', ja:'彼女は長い間その問題について考えた。', exs:[
    {en:'She thought about the problem for a long time.',ja:'彼女は長い間その問題について考えた。',cx:'学校'},{en:'He is thinking about changing his job.',ja:'彼は仕事を変えることを考えている。',cx:'仕事'},{en:'Think about what you want to do in the future.',ja:'将来何をしたいか考えてみて。',cx:'教育'}]},
  { w:'keep up with', m:'遅れずについて行く', s:'3', d:3, c:'daily', ex:'She studies hard to keep up with her classmates.', ja:'彼女はクラスメートに遅れないよう一生懸命勉強する。', exs:[
    {en:'She studies hard to keep up with her classmates.',ja:'彼女はクラスメートに遅れないよう一生懸命勉強する。',cx:'学校'},{en:'It is hard to keep up with the latest technology.',ja:'最新技術についていくのは難しい。',cx:'技術'},{en:'He runs every day to keep up with the team.',ja:'チームに遅れないよう彼は毎日走る。',cx:'スポーツ'}]},
  { w:'catch up with', m:'追いつく', s:'3', d:3, c:'daily', ex:'She ran fast to catch up with her friends.', ja:'彼女は友達に追いつくために速く走った。', exs:[
    {en:'She ran fast to catch up with her friends.',ja:'彼女は友達に追いつくために速く走った。',cx:'日常'},{en:'He studied extra to catch up with the class.',ja:'彼は授業に追いつくために追加で勉強した。',cx:'学校'},{en:'Japan is trying to catch up with other countries.',ja:'日本は他の国に追いつこうとしている。',cx:'社会'}]},
  { w:'in the future', m:'将来', s:'3', d:3, c:'daily', ex:'She wants to be a scientist in the future.', ja:'彼女は将来科学者になりたい。', exs:[
    {en:'She wants to be a scientist in the future.',ja:'彼女は将来科学者になりたい。',cx:'将来'},{en:'In the future, robots may do most of the work.',ja:'将来、ロボットがほとんどの仕事をするかもしれない。',cx:'技術'},{en:'We should think about the environment in the future.',ja:'将来のために環境について考えるべきだ。',cx:'環境'}]},
  { w:'for the first time', m:'初めて', s:'3', d:3, c:'daily', ex:'She visited Europe for the first time last year.', ja:'彼女は去年初めてヨーロッパを訪れた。', exs:[
    {en:'She visited Europe for the first time last year.',ja:'彼女は去年初めてヨーロッパを訪れた。',cx:'旅行'},{en:'He tried sushi for the first time yesterday.',ja:'彼は昨日初めて寿司を食べた。',cx:'食事'},{en:'For the first time, she felt truly happy.',ja:'初めて、彼女は本当に幸せだと感じた。',cx:'感情'}]},
  { w:'on the way', m:'途中で', s:'3', d:3, c:'daily', ex:'We stopped at a cafe on the way to school.', ja:'学校に行く途中でカフェに寄った。', exs:[
    {en:'We stopped at a cafe on the way to school.',ja:'学校に行く途中でカフェに寄った。',cx:'日常'},{en:'She found a wallet on the way home.',ja:'彼女は帰り道で財布を見つけた。',cx:'日常'},{en:'He called me on the way to the airport.',ja:'空港に行く途中で彼が電話をくれた。',cx:'旅行'}]},
  { w:'more than', m:'〜以上の', s:'3', d:3, c:'communication', ex:'More than a hundred people joined the event.', ja:'100人以上がイベントに参加した。', exs:[
    {en:'More than a hundred people joined the event.',ja:'100人以上がイベントに参加した。',cx:'社会'},{en:'She has more than fifty books on her shelf.',ja:'彼女の棚には50冊以上の本がある。',cx:'趣味'},{en:'This is more than just a simple problem.',ja:'これは単純な問題以上のものだ。',cx:'学術'}]},
  { w:'less than', m:'〜未満の', s:'3', d:3, c:'communication', ex:'The trip takes less than two hours by train.', ja:'その旅行は電車で2時間もかからない。', exs:[
    {en:'The trip takes less than two hours by train.',ja:'その旅行は電車で2時間もかからない。',cx:'旅行'},{en:'Less than ten students were absent today.',ja:'今日欠席した生徒は10人未満だった。',cx:'学校'},{en:'She finished it in less than a week.',ja:'彼女は1週間未満でそれを終えた。',cx:'仕事'}]},
  { w:'as soon as', m:'〜するとすぐ', s:'3', d:3, c:'communication', ex:'Call me as soon as you arrive at the station.', ja:'駅に着いたらすぐ電話して。', exs:[
    {en:'Call me as soon as you arrive at the station.',ja:'駅に着いたらすぐ電話して。',cx:'交通'},{en:'She went to bed as soon as she got home.',ja:'彼女は帰宅するとすぐに寝た。',cx:'家庭'},{en:'As soon as the bell rang, students left the room.',ja:'ベルが鳴るとすぐに生徒は教室を出た。',cx:'学校'}]},
  { w:'as well as', m:'〜に加えて', s:'3', d:3, c:'communication', ex:'She speaks Chinese as well as English.', ja:'彼女は英語に加えて中国語も話す。', exs:[
    {en:'She speaks Chinese as well as English.',ja:'彼女は英語に加えて中国語も話す。',cx:'言語'},{en:'He is a singer as well as a dancer.',ja:'彼はダンサーに加えて歌手でもある。',cx:'娯楽'},{en:'We need patience as well as hard work.',ja:'努力に加えて忍耐も必要だ。',cx:'教育'}]},
  { w:'not yet', m:'まだ〜ない', s:'3', d:3, c:'communication', ex:'She has not yet finished her homework.', ja:'彼女はまだ宿題を終えていない。', exs:[
    {en:'She has not yet finished her homework.',ja:'彼女はまだ宿題を終えていない。',cx:'学校'},{en:'We have not yet decided where to go.',ja:'まだどこに行くか決めていない。',cx:'旅行'},{en:'The results have not yet been announced.',ja:'結果はまだ発表されていない。',cx:'学校'}]},
  { w:'all the time', m:'いつも', s:'3', d:3, c:'daily', ex:'She smiles all the time and makes people happy.', ja:'彼女はいつも笑顔で人を幸せにする。', exs:[
    {en:'She smiles all the time and makes people happy.',ja:'彼女はいつも笑顔で人を幸せにする。',cx:'日常'},{en:'He thinks about soccer all the time.',ja:'彼はいつもサッカーのことを考えている。',cx:'スポーツ'},{en:'Technology is changing all the time.',ja:'テクノロジーはいつも変化している。',cx:'技術'}]},
  { w:'right away', m:'すぐに', s:'3', d:3, c:'daily', ex:'Please call the doctor right away.', ja:'すぐに医者に電話してください。', exs:[
    {en:'Please call the doctor right away.',ja:'すぐに医者に電話してください。',cx:'医療'},{en:'She answered the question right away.',ja:'彼女はすぐにその質問に答えた。',cx:'学校'},{en:'We need to fix this problem right away.',ja:'すぐにこの問題を修正する必要がある。',cx:'仕事'}]},
  { w:'little by little', m:'少しずつ', s:'3', d:3, c:'daily', ex:'Little by little her English improved a lot.', ja:'少しずつ彼女の英語は大いに上達した。', exs:[
    {en:'Little by little her English improved a lot.',ja:'少しずつ彼女の英語は大いに上達した。',cx:'教育'},{en:'The snow melted little by little.',ja:'雪は少しずつ溶けた。',cx:'自然'},{en:'He is getting better little by little.',ja:'彼は少しずつ良くなっている。',cx:'健康'}]},

  // ════════ Stage pre2 (準2級) ════════
  { w:'drop out of', m:'中退する', s:'pre2', d:4, c:'school', ex:'He dropped out of college to start a business.', ja:'彼は起業するために大学を中退した。', exs:[
    {en:'He dropped out of college to start a business.',ja:'彼は起業するために大学を中退した。',cx:'ビジネス'},{en:'Many students drop out of school due to poverty.',ja:'多くの生徒が貧困のために退学する。',cx:'社会'},{en:'She almost dropped out of the race.',ja:'彼女は危うくレースを棄権するところだった。',cx:'スポーツ'}]},
  { w:'give away', m:'無料で配る', s:'pre2', d:4, c:'daily', ex:'They gave away free samples at the store.', ja:'お店で無料サンプルを配っていた。', exs:[
    {en:'They gave away free samples at the store.',ja:'お店で無料サンプルを配っていた。',cx:'買い物'},{en:'She gave away her old clothes to charity.',ja:'彼女は古い服をチャリティーに寄付した。',cx:'社会'},{en:'Do not give away the ending of the movie.',ja:'映画の結末をばらさないで。',cx:'娯楽'}]},
  { w:'as if', m:'まるで〜のように', s:'pre2', d:4, c:'communication', ex:'She talked as if she knew everything.', ja:'彼女はまるで何でも知っているかのように話した。', exs:[
    {en:'She talked as if she knew everything.',ja:'彼女はまるで何でも知っているかのように話した。',cx:'日常'},{en:'He looked as if he had seen a ghost.',ja:'彼はまるで幽霊を見たかのような顔をしていた。',cx:'感情'},{en:'The house looked as if nobody lived there.',ja:'その家はまるで誰も住んでいないかのようだった。',cx:'日常'}]},
  { w:'as though', m:'あたかも〜のように', s:'pre2', d:4, c:'communication', ex:'He acts as though nothing happened.', ja:'彼は何もなかったかのように振る舞う。', exs:[
    {en:'He acts as though nothing happened.',ja:'彼は何もなかったかのように振る舞う。',cx:'日常'},{en:'She felt as though she were dreaming.',ja:'彼女はまるで夢を見ているかのように感じた。',cx:'感情'},{en:'It seems as though the rain will never stop.',ja:'まるで雨が止まないかのようだ。',cx:'天気'}]},
  { w:'now that', m:'今や〜なので', s:'pre2', d:4, c:'communication', ex:'Now that spring has come, the flowers are blooming.', ja:'春が来たので花が咲いている。', exs:[
    {en:'Now that spring has come, the flowers are blooming.',ja:'春が来たので花が咲いている。',cx:'季節'},{en:'Now that he has graduated, he will start working.',ja:'卒業したので彼は働き始める。',cx:'仕事'},{en:'Now that we have the data, we can make a plan.',ja:'データがあるので計画を立てられる。',cx:'ビジネス'}]},
  { w:'in spite of', m:'〜にもかかわらず', s:'pre2', d:4, c:'communication', ex:'In spite of the rain, the event was a success.', ja:'雨にもかかわらず、イベントは成功だった。', exs:[
    {en:'In spite of the rain, the event was a success.',ja:'雨にもかかわらず、イベントは成功だった。',cx:'社会'},{en:'In spite of his age, he is very energetic.',ja:'年齢にもかかわらず、彼はとても元気だ。',cx:'日常'},{en:'She smiled in spite of the bad news.',ja:'悪いニュースにもかかわらず彼女は微笑んだ。',cx:'感情'}]},
  { w:'in case of', m:'〜の場合に', s:'pre2', d:4, c:'communication', ex:'In case of fire, please use the stairs.', ja:'火事の場合は、階段を使ってください。', exs:[
    {en:'In case of fire, please use the stairs.',ja:'火事の場合は、階段を使ってください。',cx:'安全'},{en:'Bring an umbrella in case of rain.',ja:'雨の場合に備えて傘を持って行って。',cx:'天気'},{en:'In case of emergency, call this number.',ja:'緊急の場合は、この番号に電話してください。',cx:'安全'}]},
  { w:'in charge of', m:'〜の担当で', s:'pre2', d:4, c:'business', ex:'She is in charge of the marketing department.', ja:'彼女はマーケティング部門の担当だ。', exs:[
    {en:'She is in charge of the marketing department.',ja:'彼女はマーケティング部門の担当だ。',cx:'ビジネス'},{en:'Who is in charge of this project?',ja:'このプロジェクトの担当は誰ですか？',cx:'仕事'},{en:'He was put in charge of the new team.',ja:'彼は新しいチームの責任者に任命された。',cx:'ビジネス'}]},
  { w:'by means of', m:'〜によって', s:'pre2', d:4, c:'communication', ex:'We communicated by means of email.', ja:'私たちはメールによって連絡を取り合った。', exs:[
    {en:'We communicated by means of email.',ja:'私たちはメールによって連絡を取り合った。',cx:'通信'},{en:'She learned English by means of online lessons.',ja:'彼女はオンライン授業によって英語を学んだ。',cx:'教育'},{en:'The problem was solved by means of teamwork.',ja:'その問題はチームワークによって解決された。',cx:'仕事'}]},
  { w:'in favor of', m:'〜に賛成して', s:'pre2', d:4, c:'communication', ex:'Most people voted in favor of the new plan.', ja:'ほとんどの人が新しい計画に賛成した。', exs:[
    {en:'Most people voted in favor of the new plan.',ja:'ほとんどの人が新しい計画に賛成した。',cx:'政治'},{en:'She spoke in favor of protecting the environment.',ja:'彼女は環境保護に賛成の発言をした。',cx:'環境'},{en:'Are you in favor of this idea or against it?',ja:'あなたはこのアイデアに賛成、それとも反対？',cx:'会話'}]},
  { w:'as a whole', m:'全体として', s:'pre2', d:4, c:'communication', ex:'The project as a whole was very successful.', ja:'プロジェクトは全体として非常に成功だった。', exs:[
    {en:'The project as a whole was very successful.',ja:'プロジェクトは全体として非常に成功だった。',cx:'ビジネス'},{en:'Society as a whole benefits from education.',ja:'社会全体が教育から恩恵を受ける。',cx:'教育'},{en:'As a whole, the results were satisfactory.',ja:'全体として、結果は満足のいくものだった。',cx:'学術'}]},
  { w:'at the same time', m:'同時に', s:'pre2', d:4, c:'daily', ex:'She cannot do two things at the same time.', ja:'彼女は同時に2つのことはできない。', exs:[
    {en:'She cannot do two things at the same time.',ja:'彼女は同時に2つのことはできない。',cx:'日常'},{en:'The two events happened at the same time.',ja:'2つの出来事が同時に起きた。',cx:'社会'},{en:'He wants to work and study at the same time.',ja:'彼は同時に働きながら勉強したい。',cx:'教育'}]},
  { w:'for instance', m:'たとえば', s:'pre2', d:4, c:'communication', ex:'Some fruits, for instance oranges, are rich in vitamins.', ja:'例えばオレンジのような果物はビタミンが豊富だ。', exs:[
    {en:'Some fruits, for instance oranges, are rich in vitamins.',ja:'例えばオレンジのような果物はビタミンが豊富だ。',cx:'健康'},{en:'For instance, you could try a different approach.',ja:'たとえば、別のアプローチを試すこともできる。',cx:'仕事'},{en:'Many cities, for instance Paris, attract tourists.',ja:'パリのように多くの都市が観光客を惹きつける。',cx:'旅行'}]},
  { w:'in general', m:'一般に', s:'pre2', d:4, c:'communication', ex:'In general, Japanese people are very polite.', ja:'一般に、日本人はとても礼儀正しい。', exs:[
    {en:'In general, Japanese people are very polite.',ja:'一般に、日本人はとても礼儀正しい。',cx:'文化'},{en:'In general, exercise is good for your health.',ja:'一般に、運動は健康に良い。',cx:'健康'},{en:'In general, the feedback has been positive.',ja:'一般に、フィードバックは好意的だった。',cx:'ビジネス'}]},
  { w:'on purpose', m:'わざと', s:'pre2', d:4, c:'daily', ex:'She did not break the glass on purpose.', ja:'彼女はわざとグラスを割ったのではない。', exs:[
    {en:'She did not break the glass on purpose.',ja:'彼女はわざとグラスを割ったのではない。',cx:'日常'},{en:'He left his phone at home on purpose.',ja:'彼はわざと携帯を家に置いてきた。',cx:'日常'},{en:'Do you think she said that on purpose?',ja:'彼女はわざとあんなことを言ったと思う？',cx:'会話'}]},
  { w:'under no circumstances', m:'どんな事があっても', s:'pre2', d:4, c:'communication', ex:'Under no circumstances should you open this door.', ja:'どんな事があってもこのドアを開けてはいけない。', exs:[
    {en:'Under no circumstances should you open this door.',ja:'どんな事があってもこのドアを開けてはいけない。',cx:'安全'},{en:'Under no circumstances will we give up.',ja:'どんな事があっても諦めない。',cx:'日常'},{en:'This information must under no circumstances be shared.',ja:'この情報は絶対に共有してはならない。',cx:'ビジネス'}]},
  { w:'sooner or later', m:'遅かれ早かれ', s:'pre2', d:4, c:'daily', ex:'Sooner or later the truth will come out.', ja:'遅かれ早かれ真実は明らかになる。', exs:[
    {en:'Sooner or later the truth will come out.',ja:'遅かれ早かれ真実は明らかになる。',cx:'社会'},{en:'Sooner or later you will have to make a choice.',ja:'遅かれ早かれ選択しなければならない。',cx:'日常'},{en:'We will solve this problem sooner or later.',ja:'この問題は遅かれ早かれ解決する。',cx:'仕事'}]},
];

// Insert
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
