/**
 * 複数品詞エントリ追加 第2弾
 * 残り84語の不足品詞を英検コースに追加
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

const targets = [
  // === 動詞のみ→名詞追加（52語）===
  {w:'swim',pos:'noun',m:'泳ぎ',stg:'5',d:1,cat:'sports',ex:'Let us go for a swim.',ja:'泳ぎに行こう。',exs:[{en:'Let us go for a swim.',ja:'泳ぎに行こう。',cx:'スポーツ'},{en:'She had a quick swim before breakfast.',ja:'朝食前にひと泳ぎした。',cx:'日常'},{en:'It is a long swim to the other side.',ja:'向こう岸までは遠い泳ぎだ。',cx:'スポーツ'}]},
  {w:'cook',pos:'noun',m:'料理人',stg:'5',d:1,cat:'food',ex:'He is a good cook.',ja:'彼は料理上手だ。',exs:[{en:'He is a good cook.',ja:'彼は料理上手だ。',cx:'食事'},{en:'She works as a cook in a restaurant.',ja:'彼女はレストランで料理人として働いている。',cx:'仕事'},{en:'My mother is the best cook I know.',ja:'母は私が知る最高の料理人だ。',cx:'家庭'}]},
  {w:'look',pos:'noun',m:'見ること、外見',stg:'4',d:2,cat:'daily',ex:'She gave him a surprised look.',ja:'彼女は彼に驚いた表情を向けた。',exs:[{en:'She gave him a surprised look.',ja:'彼女は彼に驚いた表情を向けた。',cx:'日常'},{en:'Have a look at this photo.',ja:'この写真を見てごらん。',cx:'日常'},{en:'I like the look of this new design.',ja:'この新しいデザインの外見が気に入った。',cx:'デザイン'}]},
  {w:'sleep',pos:'noun',m:'睡眠',stg:'5',d:1,cat:'daily',ex:'I did not get enough sleep last night.',ja:'昨夜は十分に眠れなかった。',exs:[{en:'I did not get enough sleep last night.',ja:'昨夜は十分に眠れなかった。',cx:'日常'},{en:'A good sleep helps you study better.',ja:'よく眠ると勉強がはかどる。',cx:'健康'},{en:'She needs at least eight hours of sleep.',ja:'彼女は最低8時間の睡眠が必要だ。',cx:'健康'}]},
  {w:'dance',pos:'noun',m:'ダンス',stg:'5',d:1,cat:'daily',ex:'She performed a beautiful dance.',ja:'彼女は美しいダンスを披露した。',exs:[{en:'She performed a beautiful dance.',ja:'彼女は美しいダンスを披露した。',cx:'娯楽'},{en:'May I have this dance?',ja:'一緒に踊ってもらえますか？',cx:'社交'},{en:'The school dance is next Friday.',ja:'学校のダンスパーティーは来週金曜日だ。',cx:'学校'}]},
  {w:'finish',pos:'noun',m:'終わり',stg:'4',d:2,cat:'daily',ex:'It was a close finish to the race.',ja:'レースは僅差のゴールだった。',exs:[{en:'It was a close finish to the race.',ja:'レースは僅差のゴールだった。',cx:'スポーツ'},{en:'The project is near its finish.',ja:'プロジェクトは終わりに近い。',cx:'仕事'},{en:'From start to finish, it took two hours.',ja:'始めから終わりまで2時間かかった。',cx:'日常'}]},
  {w:'guess',pos:'noun',m:'推測',stg:'4',d:2,cat:'communication',ex:'My guess is that she will come.',ja:'私の推測では彼女は来ると思う。',exs:[{en:'My guess is that she will come.',ja:'私の推測では彼女は来ると思う。',cx:'日常'},{en:'Take a guess at the answer.',ja:'答えを推測してみて。',cx:'学校'},{en:'Your guess is as good as mine.',ja:'私にもわからない。',cx:'会話'}]},
  {w:'hope',pos:'noun',m:'希望',stg:'4',d:2,cat:'emotion',ex:'There is still hope for a solution.',ja:'解決への希望はまだある。',exs:[{en:'There is still hope for a solution.',ja:'解決への希望はまだある。',cx:'日常'},{en:'She never lost hope.',ja:'彼女は決して希望を失わなかった。',cx:'日常'},{en:'His words gave us hope.',ja:'彼の言葉は私たちに希望を与えた。',cx:'感情'}]},
  {w:'jump',pos:'noun',m:'跳躍',stg:'4',d:2,cat:'sports',ex:'The horse made a big jump over the fence.',ja:'馬は柵を大きく跳び越えた。',exs:[{en:'The horse made a big jump over the fence.',ja:'馬は柵を大きく跳び越えた。',cx:'スポーツ'},{en:'She took a jump into the pool.',ja:'彼女はプールに飛び込んだ。',cx:'スポーツ'},{en:'There was a sudden jump in prices.',ja:'価格が急上昇した。',cx:'経済'}]},
  {w:'laugh',pos:'noun',m:'笑い',stg:'4',d:2,cat:'emotion',ex:'She has a cheerful laugh.',ja:'彼女は陽気な笑い方だ。',exs:[{en:'She has a cheerful laugh.',ja:'彼女は陽気な笑い方だ。',cx:'日常'},{en:'We had a good laugh about it.',ja:'それについて大笑いした。',cx:'日常'},{en:'His joke got a big laugh.',ja:'彼の冗談は大笑いを誘った。',cx:'社交'}]},
  {w:'miss',pos:'noun',m:'失敗、ミス',stg:'4',d:2,cat:'daily',ex:'A miss is as good as a mile.',ja:'失敗は失敗だ。',exs:[{en:'A miss is as good as a mile.',ja:'失敗は失敗だ。',cx:'日常'},{en:'It was a near miss.',ja:'危うく当たるところだった。',cx:'日常'},{en:'The shot was a complete miss.',ja:'そのシュートは完全なミスだった。',cx:'スポーツ'}]},
  {w:'move',pos:'noun',m:'動き、手',stg:'3',d:3,cat:'daily',ex:'That was a smart move.',ja:'それは賢い手だった。',exs:[{en:'That was a smart move.',ja:'それは賢い手だった。',cx:'日常'},{en:'His next move surprised everyone.',ja:'彼の次の一手は皆を驚かせた。',cx:'仕事'},{en:'The company made a bold move.',ja:'会社は大胆な一手を打った。',cx:'ビジネス'}]},
  {w:'need',pos:'noun',m:'必要性',stg:'4',d:2,cat:'daily',ex:'There is a need for more teachers.',ja:'もっと多くの教師が必要だ。',exs:[{en:'There is a need for more teachers.',ja:'もっと多くの教師が必要だ。',cx:'教育'},{en:'People in need deserve our help.',ja:'困っている人は私たちの助けを受ける資格がある。',cx:'社会'},{en:'She felt the need to apologize.',ja:'彼女は謝る必要を感じた。',cx:'日常'}]},
  {w:'show',pos:'noun',m:'ショー、番組',stg:'4',d:2,cat:'daily',ex:'The TV show starts at eight.',ja:'テレビ番組は8時に始まる。',exs:[{en:'The TV show starts at eight.',ja:'テレビ番組は8時に始まる。',cx:'娯楽'},{en:'We went to see a magic show.',ja:'マジックショーを見に行った。',cx:'娯楽'},{en:'The art show was very popular.',ja:'その美術展はとても人気だった。',cx:'芸術'}]},
  {w:'smile',pos:'noun',m:'笑顔',stg:'4',d:2,cat:'emotion',ex:'She has a beautiful smile.',ja:'彼女は美しい笑顔だ。',exs:[{en:'She has a beautiful smile.',ja:'彼女は美しい笑顔だ。',cx:'日常'},{en:'He greeted us with a warm smile.',ja:'彼は温かい笑顔で出迎えた。',cx:'日常'},{en:'A smile can make someone is day.',ja:'笑顔は人の一日を良くする。',cx:'日常'}]},
  {w:'start',pos:'noun',m:'開始、出発',stg:'4',d:2,cat:'daily',ex:'Let us make a fresh start.',ja:'新しくやり直そう。',exs:[{en:'Let us make a fresh start.',ja:'新しくやり直そう。',cx:'日常'},{en:'We got off to a good start.',ja:'良いスタートを切った。',cx:'仕事'},{en:'From the start, she knew it was wrong.',ja:'最初から彼女はそれが間違いだと分かっていた。',cx:'日常'}]},
  {w:'stop',pos:'noun',m:'停留所、中止',stg:'4',d:2,cat:'daily',ex:'The bus stop is near the school.',ja:'バス停は学校の近くだ。',exs:[{en:'The bus stop is near the school.',ja:'バス停は学校の近くだ。',cx:'交通'},{en:'We made a stop at the gas station.',ja:'ガソリンスタンドに寄った。',cx:'旅行'},{en:'The rain came to a sudden stop.',ja:'雨が急にやんだ。',cx:'天気'}]},
  {w:'turn',pos:'noun',m:'順番、曲がり角',stg:'4',d:2,cat:'daily',ex:'It is your turn to speak.',ja:'あなたが話す番だ。',exs:[{en:'It is your turn to speak.',ja:'あなたが話す番だ。',cx:'学校'},{en:'Take a left turn at the corner.',ja:'角を左に曲がって。',cx:'道案内'},{en:'We took turns driving.',ja:'交代で運転した。',cx:'旅行'}]},
  {w:'visit',pos:'noun',m:'訪問',stg:'4',d:2,cat:'travel',ex:'She paid a visit to her grandmother.',ja:'彼女は祖母を訪問した。',exs:[{en:'She paid a visit to her grandmother.',ja:'彼女は祖母を訪問した。',cx:'家庭'},{en:'His visit to Japan was unforgettable.',ja:'彼の日本訪問は忘れられなかった。',cx:'旅行'},{en:'The doctor makes home visits.',ja:'医者は往診をする。',cx:'医療'}]},
  {w:'wish',pos:'noun',m:'願い',stg:'4',d:2,cat:'emotion',ex:'Make a wish before you blow out the candles.',ja:'ろうそくを消す前に願い事をして。',exs:[{en:'Make a wish before you blow out the candles.',ja:'ろうそくを消す前に願い事をして。',cx:'行事'},{en:'Best wishes for the new year.',ja:'新年のお祝いを申し上げます。',cx:'挨拶'},{en:'Her wish came true.',ja:'彼女の願いは叶った。',cx:'日常'}]},
  {w:'fight',pos:'noun',m:'戦い、けんか',stg:'3',d:3,cat:'daily',ex:'The fight for freedom is not over.',ja:'自由のための戦いは終わっていない。',exs:[{en:'The fight for freedom is not over.',ja:'自由のための戦いは終わっていない。',cx:'社会'},{en:'The two boys had a fight.',ja:'2人の男の子がけんかした。',cx:'学校'},{en:'She put up a good fight.',ja:'彼女は善戦した。',cx:'スポーツ'}]},
  {w:'offer',pos:'noun',m:'申し出、提案',stg:'3',d:3,cat:'communication',ex:'She accepted the job offer.',ja:'彼女はその仕事の申し出を受けた。',exs:[{en:'She accepted the job offer.',ja:'彼女はその仕事の申し出を受けた。',cx:'仕事'},{en:'He made an offer to help.',ja:'彼は手伝おうと申し出た。',cx:'日常'},{en:'This is a special offer for today only.',ja:'これは今日だけの特別オファーだ。',cx:'買い物'}]},
  {w:'surprise',pos:'noun',m:'驚き',stg:'3',d:3,cat:'emotion',ex:'What a lovely surprise!',ja:'なんて素敵な驚きでしょう！',exs:[{en:'What a lovely surprise!',ja:'なんて素敵な驚きでしょう！',cx:'日常'},{en:'The ending was a big surprise.',ja:'結末は大きな驚きだった。',cx:'娯楽'},{en:'She planned a surprise party.',ja:'彼女はサプライズパーティーを企画した。',cx:'イベント'}]},
  {w:'taste',pos:'noun',m:'味、好み',stg:'3',d:3,cat:'food',ex:'This soup has a nice taste.',ja:'このスープは良い味だ。',exs:[{en:'This soup has a nice taste.',ja:'このスープは良い味だ。',cx:'食事'},{en:'She has good taste in music.',ja:'彼女は音楽の趣味が良い。',cx:'趣味'},{en:'Would you like a taste?',ja:'味見してみますか？',cx:'食事'}]},
  {w:'wonder',pos:'noun',m:'驚き、不思議',stg:'3',d:3,cat:'daily',ex:'The Grand Canyon is a natural wonder.',ja:'グランドキャニオンは自然の驚異だ。',exs:[{en:'The Grand Canyon is a natural wonder.',ja:'グランドキャニオンは自然の驚異だ。',cx:'旅行'},{en:'It is no wonder she is tired.',ja:'彼女が疲れているのも当然だ。',cx:'日常'},{en:'The Seven Wonders of the World are famous.',ja:'世界の七不思議は有名だ。',cx:'文化'}]},
  {w:'travel',pos:'noun',m:'旅行',stg:'3',d:3,cat:'travel',ex:'Travel broadens the mind.',ja:'旅行は心を広げる。',exs:[{en:'Travel broadens the mind.',ja:'旅行は心を広げる。',cx:'教育'},{en:'Air travel has become cheaper.',ja:'空の旅は安くなった。',cx:'旅行'},{en:'She enjoys foreign travel.',ja:'彼女は海外旅行を楽しんでいる。',cx:'旅行'}]},
  {w:'trouble',pos:'noun',m:'困難、問題',stg:'3',d:3,cat:'daily',ex:'He is in serious trouble.',ja:'彼は深刻な困難に陥っている。',exs:[{en:'He is in serious trouble.',ja:'彼は深刻な困難に陥っている。',cx:'日常'},{en:'The trouble is we have no time.',ja:'問題は時間がないことだ。',cx:'日常'},{en:'Sorry to cause you trouble.',ja:'ご迷惑をおかけして申し訳ありません。',cx:'会話'}]},
  {w:'trust',pos:'noun',m:'信頼',stg:'3',d:3,cat:'communication',ex:'Trust is the basis of any relationship.',ja:'信頼はあらゆる関係の基盤だ。',exs:[{en:'Trust is the basis of any relationship.',ja:'信頼はあらゆる関係の基盤だ。',cx:'日常'},{en:'She earned the trust of her team.',ja:'彼女はチームの信頼を得た。',cx:'仕事'},{en:'You have my complete trust.',ja:'あなたを完全に信頼しています。',cx:'日常'}]},
  {w:'sound',pos:'noun',m:'音',stg:'4',d:2,cat:'daily',ex:'I heard a strange sound outside.',ja:'外で奇妙な音が聞こえた。',exs:[{en:'I heard a strange sound outside.',ja:'外で奇妙な音が聞こえた。',cx:'日常'},{en:'The sound of music filled the room.',ja:'音楽の音が部屋を満たした。',cx:'音楽'},{en:'Sound travels faster in water.',ja:'音は水中の方が速く伝わる。',cx:'科学'}]},
  {w:'end',pos:'noun',m:'終わり、端',stg:'4',d:2,cat:'daily',ex:'Wait for me at the end of the street.',ja:'通りの端で待っていて。',exs:[{en:'Wait for me at the end of the street.',ja:'通りの端で待っていて。',cx:'日常'},{en:'The movie has a happy end.',ja:'映画はハッピーエンドだ。',cx:'娯楽'},{en:'In the end, they won the game.',ja:'結局、彼らは試合に勝った。',cx:'スポーツ'}]},
  // === 名詞のみ→動詞追加（32語のうち主要なもの）===
  {w:'note',pos:'verb',m:'書き留める',stg:'3',d:3,cat:'communication',ex:'Please note the following points.',ja:'以下の点に注意してください。',exs:[{en:'Please note the following points.',ja:'以下の点に注意してください。',cx:'仕事'},{en:'She noted down the phone number.',ja:'彼女は電話番号を書き留めた。',cx:'日常'},{en:'It should be noted that the data is incomplete.',ja:'データが不完全であることに留意すべきだ。',cx:'学術'}]},
  {w:'question',pos:'verb',m:'質問する、疑う',stg:'3',d:3,cat:'communication',ex:'The police questioned the witness.',ja:'警察は目撃者に質問した。',exs:[{en:'The police questioned the witness.',ja:'警察は目撃者に質問した。',cx:'社会'},{en:'He questioned the accuracy of the report.',ja:'彼はレポートの正確さを疑った。',cx:'仕事'},{en:'Nobody questioned her decision.',ja:'誰も彼女の決定に異議を唱えなかった。',cx:'日常'}]},
  {w:'rain',pos:'verb',m:'雨が降る',stg:'5',d:1,cat:'nature',ex:'It rained heavily yesterday.',ja:'昨日は大雨だった。',exs:[{en:'It rained heavily yesterday.',ja:'昨日は大雨だった。',cx:'天気'},{en:'It is going to rain this afternoon.',ja:'午後に雨が降るだろう。',cx:'天気'},{en:'It has been raining all day.',ja:'一日中雨が降っている。',cx:'天気'}]},
  {w:'snow',pos:'verb',m:'雪が降る',stg:'5',d:1,cat:'nature',ex:'It snowed a lot last winter.',ja:'去年の冬は雪がたくさん降った。',exs:[{en:'It snowed a lot last winter.',ja:'去年の冬は雪がたくさん降った。',cx:'天気'},{en:'It is snowing outside right now.',ja:'今外で雪が降っている。',cx:'天気'},{en:'It rarely snows in this region.',ja:'この地域ではめったに雪が降らない。',cx:'地理'}]},
  {w:'train',pos:'verb',m:'訓練する',stg:'3',d:3,cat:'education',ex:'She trained hard for the marathon.',ja:'彼女はマラソンに向けて懸命に訓練した。',exs:[{en:'She trained hard for the marathon.',ja:'彼女はマラソンに向けて懸命に訓練した。',cx:'スポーツ'},{en:'The company trains new employees.',ja:'会社は新入社員を訓練する。',cx:'仕事'},{en:'He was trained as a doctor.',ja:'彼は医者として訓練を受けた。',cx:'医療'}]},
  {w:'dream',pos:'verb',m:'夢を見る',stg:'4',d:2,cat:'daily',ex:'I dreamed about flying last night.',ja:'昨夜空を飛ぶ夢を見た。',exs:[{en:'I dreamed about flying last night.',ja:'昨夜空を飛ぶ夢を見た。',cx:'日常'},{en:'She dreams of becoming a singer.',ja:'彼女は歌手になることを夢見ている。',cx:'将来'},{en:'He never dreamed this would happen.',ja:'こんなことが起きるとは夢にも思わなかった。',cx:'日常'}]},
  {w:'mind',pos:'verb',m:'気にする',stg:'4',d:2,cat:'communication',ex:'Do you mind if I open the window?',ja:'窓を開けても構いませんか？',exs:[{en:'Do you mind if I open the window?',ja:'窓を開けても構いませんか？',cx:'会話'},{en:'I do not mind waiting.',ja:'待つのは気にしません。',cx:'日常'},{en:'Never mind. It is not important.',ja:'気にしないで。大事じゃないから。',cx:'会話'}]},
  {w:'rest',pos:'verb',m:'休む',stg:'4',d:2,cat:'daily',ex:'You should rest after the long trip.',ja:'長旅の後は休むべきだ。',exs:[{en:'You should rest after the long trip.',ja:'長旅の後は休むべきだ。',cx:'旅行'},{en:'The doctor told him to rest for a week.',ja:'医者は1週間休むよう言った。',cx:'医療'},{en:'She rested her eyes for a moment.',ja:'彼女は少し目を休めた。',cx:'日常'}]},
  {w:'shape',pos:'verb',m:'形作る',stg:'pre2',d:4,cat:'daily',ex:'Education shapes the future of a nation.',ja:'教育が国の未来を形作る。',exs:[{en:'Education shapes the future of a nation.',ja:'教育が国の未来を形作る。',cx:'教育'},{en:'She shaped the clay into a bowl.',ja:'彼女は粘土を鉢の形にした。',cx:'芸術'},{en:'These experiences shaped who I am today.',ja:'これらの経験が今の私を形作った。',cx:'日常'}]},
  {w:'exercise',pos:'verb',m:'運動する',stg:'3',d:3,cat:'health',ex:'She exercises every morning.',ja:'彼女は毎朝運動する。',exs:[{en:'She exercises every morning.',ja:'彼女は毎朝運動する。',cx:'健康'},{en:'You should exercise regularly.',ja:'定期的に運動すべきだ。',cx:'健康'},{en:'He exercises his right to vote.',ja:'彼は投票する権利を行使する。',cx:'社会'}]},
  {w:'risk',pos:'verb',m:'危険を冒す',stg:'pre2',d:4,cat:'daily',ex:'She risked her life to save the child.',ja:'彼女は子供を救うために命を危険にさらした。',exs:[{en:'She risked her life to save the child.',ja:'彼女は子供を救うために命を危険にさらした。',cx:'日常'},{en:'He risked everything on this project.',ja:'彼はこのプロジェクトに全てを賭けた。',cx:'仕事'},{en:'Are you willing to risk failure?',ja:'失敗のリスクを冒す覚悟がありますか？',cx:'日常'}]},
  {w:'process',pos:'verb',m:'処理する',stg:'pre2',d:4,cat:'business',ex:'The bank processes applications quickly.',ja:'銀行は申請を迅速に処理する。',exs:[{en:'The bank processes applications quickly.',ja:'銀行は申請を迅速に処理する。',cx:'金融'},{en:'It takes time to process this data.',ja:'このデータの処理には時間がかかる。',cx:'技術'},{en:'Your order is being processed.',ja:'ご注文は処理中です。',cx:'買い物'}]},
  {w:'progress',pos:'verb',m:'前進する',stg:'pre2',d:4,cat:'daily',ex:'The project is progressing well.',ja:'プロジェクトは順調に進んでいる。',exs:[{en:'The project is progressing well.',ja:'プロジェクトは順調に進んでいる。',cx:'仕事'},{en:'She progressed quickly in her studies.',ja:'彼女は学業で急速に進歩した。',cx:'教育'},{en:'Technology has progressed rapidly.',ja:'技術は急速に進歩した。',cx:'技術'}]},
  {w:'interest',pos:'verb',m:'興味を持たせる',stg:'3',d:3,cat:'daily',ex:'Science interests many young people.',ja:'科学は多くの若者の興味を引く。',exs:[{en:'Science interests many young people.',ja:'科学は多くの若者の興味を引く。',cx:'教育'},{en:'This topic might interest you.',ja:'この話題はあなたの興味を引くかもしれない。',cx:'会話'},{en:'What interests you most about this job?',ja:'この仕事で一番興味があるのは何ですか？',cx:'就職'}]},
  {w:'wave',pos:'verb',m:'手を振る',stg:'3',d:3,cat:'communication',ex:'She waved goodbye to her friends.',ja:'彼女は友達に手を振って別れた。',exs:[{en:'She waved goodbye to her friends.',ja:'彼女は友達に手を振って別れた。',cx:'日常'},{en:'He waved at us from across the street.',ja:'彼は通りの向こうから手を振った。',cx:'日常'},{en:'The flag waved in the wind.',ja:'旗が風になびいた。',cx:'自然'}]},
  {w:'step',pos:'verb',m:'歩みを進める',stg:'3',d:3,cat:'daily',ex:'Please step forward.',ja:'前に進んでください。',exs:[{en:'Please step forward.',ja:'前に進んでください。',cx:'日常'},{en:'She stepped onto the stage.',ja:'彼女は舞台に上がった。',cx:'娯楽'},{en:'He stepped aside to let her pass.',ja:'彼は彼女を通すために横にどいた。',cx:'日常'}]},
  {w:'mark',pos:'verb',m:'印をつける',stg:'3',d:3,cat:'school',ex:'Mark the correct answer with a circle.',ja:'正解に丸をつけてください。',exs:[{en:'Mark the correct answer with a circle.',ja:'正解に丸をつけてください。',cx:'学校'},{en:'This event marked a turning point.',ja:'この出来事は転換点となった。',cx:'歴史'},{en:'She marked the date on her calendar.',ja:'彼女はカレンダーに日付を印をつけた。',cx:'日常'}]},
  {w:'speed',pos:'verb',m:'速度を出す',stg:'pre2',d:4,cat:'daily',ex:'The car was speeding on the highway.',ja:'車は高速道路で速度を出していた。',exs:[{en:'The car was speeding on the highway.',ja:'車は高速道路で速度を出していた。',cx:'交通'},{en:'We need to speed up the process.',ja:'プロセスを加速する必要がある。',cx:'仕事'},{en:'Time seemed to speed by.',ja:'時間が飛ぶように過ぎた。',cx:'日常'}]},
  {w:'transport',pos:'verb',m:'輸送する',stg:'pre2',d:4,cat:'business',ex:'Trucks transport goods across the country.',ja:'トラックが全国に商品を輸送する。',exs:[{en:'Trucks transport goods across the country.',ja:'トラックが全国に商品を輸送する。',cx:'物流'},{en:'The injured were transported to hospital.',ja:'負傷者は病院に搬送された。',cx:'医療'},{en:'Oil is transported by pipeline.',ja:'石油はパイプラインで輸送される。',cx:'産業'}]},
];

let added = 0;
for (const t of targets) {
  const key = t.w + '|' + t.pos;
  if (existing.has(key)) { console.log('SKIP: ' + t.w + ' ' + t.pos); continue; }

  maxId++;
  const exArr = t.exs.map(e => '{ en: "' + e.en + '", ja: "' + e.ja + '", context: "' + e.cx + '" }').join(', ');
  const entry = '  { id: ' + maxId + ', word: "' + t.w + '", meaning: "' + t.m + '", partOfSpeech: "' + t.pos + '", course: "eiken", stage: "' + t.stg + '", example: "' + t.ex + '", exampleJa: "' + t.ja + '", examples: [' + exArr + '], difficulty: ' + t.d + ', category: "' + t.cat + '", categories: ["' + t.cat + '"], frequencyRank: 1, source: "original" },';

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
console.log('Added: ' + added + ' multi-POS entries');
