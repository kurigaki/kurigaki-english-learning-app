
// 英検5級 パイロットバッチ（50語）— Rev.2
// Project Clean Vocabulary — 全データ新規作成
// データソース: CEFR-J Wordlist v1.5 (A1レベル) + 英検5級出題範囲
// 例文・意味・和訳: 全て自作（AI生成 + 全社レビュー）
// ライセンス: 単語選定は CEFR-J (引用), 例文・意味は自社著作物
//
// ■ 構造:
//   Word型: example/exampleJa = メイン例文1つ（クイズ・リスニング用）
//   examples[] = 3件の例文（詳細ページ用。examples[0] = メイン例文と同じ）
//   examples[].context = 使用場面（"学校" / "家庭" / "買い物" 等）

export const eiken5Pilot = [
  // ── 動詞 (15語) ──
  {
    id: 40001, word: "go", meaning: "行く", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "She goes to school by bus.", exampleJa: "彼女はバスで学校に行きます。",
    examples: [
      { en: "She goes to school by bus.", ja: "彼女はバスで学校に行きます。", context: "学校" },
      { en: "Let's go to the park after lunch.", ja: "昼食のあと公園に行きましょう。", context: "日常" },
      { en: "He goes swimming on Saturdays.", ja: "彼は土曜日に泳ぎに行きます。", context: "趣味" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "school"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40002, word: "come", meaning: "来る", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "Please come to my house tomorrow.", exampleJa: "明日、私の家に来てください。",
    examples: [
      { en: "Please come to my house tomorrow.", ja: "明日、私の家に来てください。", context: "日常" },
      { en: "Spring comes after winter.", ja: "冬のあとに春が来ます。", context: "季節" },
      { en: "Can you come to the party?", ja: "パーティーに来られますか？", context: "招待" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "communication"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40003, word: "eat", meaning: "食べる", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "We eat lunch at noon.", exampleJa: "私たちは正午に昼食を食べます。",
    examples: [
      { en: "We eat lunch at noon.", ja: "私たちは正午に昼食を食べます。", context: "学校" },
      { en: "Do you eat rice every day?", ja: "毎日ご飯を食べますか？", context: "家庭" },
      { en: "The children eat fruit after dinner.", ja: "子供たちは夕食のあとに果物を食べます。", context: "家庭" },
    ],
    difficulty: 1, category: "food", categories: ["food", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40004, word: "drink", meaning: "飲む", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "He drinks milk every morning.", exampleJa: "彼は毎朝牛乳を飲みます。",
    examples: [
      { en: "He drinks milk every morning.", ja: "彼は毎朝牛乳を飲みます。", context: "家庭" },
      { en: "Would you like something to drink?", ja: "何か飲み物はいかがですか？", context: "接客" },
      { en: "She drinks water after running.", ja: "彼女は走ったあとに水を飲みます。", context: "スポーツ" },
    ],
    difficulty: 1, category: "food", categories: ["food", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40005, word: "like", meaning: "好き", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "They like playing soccer after school.", exampleJa: "彼らは放課後にサッカーをするのが好きです。",
    examples: [
      { en: "They like playing soccer after school.", ja: "彼らは放課後にサッカーをするのが好きです。", context: "学校" },
      { en: "Do you like cats or dogs?", ja: "猫と犬、どちらが好きですか？", context: "日常" },
      { en: "My sister likes drawing pictures.", ja: "私の姉は絵を描くのが好きです。", context: "趣味" },
    ],
    difficulty: 1, category: "emotion", categories: ["emotion", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40006, word: "play", meaning: "する、遊ぶ", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "My brother plays the piano well.", exampleJa: "私の兄はピアノを上手に弾きます。",
    examples: [
      { en: "My brother plays the piano well.", ja: "私の兄はピアノを上手に弾きます。", context: "音楽" },
      { en: "The boys play basketball on Sundays.", ja: "男の子たちは日曜日にバスケットボールをします。", context: "スポーツ" },
      { en: "She plays with her dog in the yard.", ja: "彼女は庭で犬と遊びます。", context: "家庭" },
    ],
    difficulty: 1, category: "hobby", categories: ["hobby", "sports"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40007, word: "read", meaning: "読む", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "She reads books in the library.", exampleJa: "彼女は図書館で本を読みます。",
    examples: [
      { en: "She reads books in the library.", ja: "彼女は図書館で本を読みます。", context: "学校" },
      { en: "Can you read this letter for me?", ja: "この手紙を読んでくれますか？", context: "日常" },
      { en: "He reads the newspaper every morning.", ja: "彼は毎朝新聞を読みます。", context: "家庭" },
    ],
    difficulty: 1, category: "school", categories: ["school", "hobby"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40008, word: "write", meaning: "書く", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "Please write your name here.", exampleJa: "ここにあなたの名前を書いてください。",
    examples: [
      { en: "Please write your name here.", ja: "ここにあなたの名前を書いてください。", context: "学校" },
      { en: "She writes a diary every night.", ja: "彼女は毎晩日記を書きます。", context: "家庭" },
      { en: "We write letters to our pen pals.", ja: "私たちはペンパルに手紙を書きます。", context: "交流" },
    ],
    difficulty: 1, category: "school", categories: ["school", "communication"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40009, word: "study", meaning: "勉強する", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "He studies English every day.", exampleJa: "彼は毎日英語を勉強します。",
    examples: [
      { en: "He studies English every day.", ja: "彼は毎日英語を勉強します。", context: "学校" },
      { en: "They study math together after school.", ja: "彼らは放課後に一緒に数学を勉強します。", context: "学校" },
      { en: "My sister studies at the library.", ja: "私の姉は図書館で勉強します。", context: "日常" },
    ],
    difficulty: 1, category: "school", categories: ["school"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40010, word: "run", meaning: "走る", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "The children run in the park.", exampleJa: "子供たちは公園で走ります。",
    examples: [
      { en: "The children run in the park.", ja: "子供たちは公園で走ります。", context: "日常" },
      { en: "He runs very fast.", ja: "彼はとても速く走ります。", context: "スポーツ" },
      { en: "Don't run in the hallway.", ja: "廊下で走らないでください。", context: "学校" },
    ],
    difficulty: 1, category: "sports", categories: ["sports", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40011, word: "walk", meaning: "歩く", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "We walk to school together.", exampleJa: "私たちは一緒に学校まで歩きます。",
    examples: [
      { en: "We walk to school together.", ja: "私たちは一緒に学校まで歩きます。", context: "学校" },
      { en: "She walks her dog every evening.", ja: "彼女は毎晩犬を散歩させます。", context: "日常" },
      { en: "Let's walk along the river.", ja: "川沿いを歩きましょう。", context: "自然" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "school"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40012, word: "swim", meaning: "泳ぐ", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "She can swim very fast.", exampleJa: "彼女はとても速く泳ぐことができます。",
    examples: [
      { en: "She can swim very fast.", ja: "彼女はとても速く泳ぐことができます。", context: "スポーツ" },
      { en: "We swim in the pool on hot days.", ja: "暑い日にプールで泳ぎます。", context: "学校" },
      { en: "Can your brother swim?", ja: "あなたのお兄さんは泳げますか？", context: "会話" },
    ],
    difficulty: 1, category: "sports", categories: ["sports"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40013, word: "cook", meaning: "料理する", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "My mother cooks dinner for us.", exampleJa: "母は私たちのために夕食を作ります。",
    examples: [
      { en: "My mother cooks dinner for us.", ja: "母は私たちのために夕食を作ります。", context: "家庭" },
      { en: "He can cook curry very well.", ja: "彼はカレーをとても上手に作れます。", context: "家庭" },
      { en: "Who cooks breakfast in your family?", ja: "あなたの家族では誰が朝食を作りますか？", context: "会話" },
    ],
    difficulty: 1, category: "food", categories: ["food", "family"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40014, word: "help", meaning: "手伝う", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "Can you help me with my homework?", exampleJa: "宿題を手伝ってくれますか？",
    examples: [
      { en: "Can you help me with my homework?", ja: "宿題を手伝ってくれますか？", context: "学校" },
      { en: "She always helps her mother in the kitchen.", ja: "彼女はいつも台所で母を手伝います。", context: "家庭" },
      { en: "Thank you for helping me.", ja: "手伝ってくれてありがとう。", context: "会話" },
    ],
    difficulty: 1, category: "communication", categories: ["communication", "school"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40015, word: "want", meaning: "欲しい", partOfSpeech: "verb",
    course: "eiken", stage: "5",
    example: "I want a new bag for my birthday.", exampleJa: "誕生日に新しいかばんが欲しいです。",
    examples: [
      { en: "I want a new bag for my birthday.", ja: "誕生日に新しいかばんが欲しいです。", context: "買い物" },
      { en: "Do you want some tea?", ja: "お茶はいかがですか？", context: "家庭" },
      { en: "She wants to be a doctor.", ja: "彼女は医者になりたいです。", context: "将来" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "shopping"], frequencyRank: 1, source: "CEFR-J",
  },

  // ── 名詞 (20語) ──
  {
    id: 40016, word: "school", meaning: "学校", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "Our school has a big library.", exampleJa: "私たちの学校には大きな図書館があります。",
    examples: [
      { en: "Our school has a big library.", ja: "私たちの学校には大きな図書館があります。", context: "学校" },
      { en: "How do you go to school?", ja: "どうやって学校に行きますか？", context: "会話" },
      { en: "There are 500 students in this school.", ja: "この学校には500人の生徒がいます。", context: "紹介" },
    ],
    difficulty: 1, category: "school", categories: ["school"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40017, word: "book", meaning: "本", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "This book is very interesting.", exampleJa: "この本はとてもおもしろいです。",
    examples: [
      { en: "This book is very interesting.", ja: "この本はとてもおもしろいです。", context: "趣味" },
      { en: "She has many English books.", ja: "彼女は英語の本をたくさん持っています。", context: "学校" },
      { en: "Where is my math book?", ja: "私の数学の本はどこですか？", context: "学校" },
    ],
    difficulty: 1, category: "school", categories: ["school", "hobby"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40018, word: "friend", meaning: "友達", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "He has many friends at school.", exampleJa: "彼は学校にたくさんの友達がいます。",
    examples: [
      { en: "He has many friends at school.", ja: "彼は学校にたくさんの友達がいます。", context: "学校" },
      { en: "My best friend lives near my house.", ja: "親友は私の家の近くに住んでいます。", context: "日常" },
      { en: "She made new friends at camp.", ja: "彼女はキャンプで新しい友達を作りました。", context: "旅行" },
    ],
    difficulty: 1, category: "school", categories: ["school", "communication"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40019, word: "teacher", meaning: "先生", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "Our teacher speaks English very well.", exampleJa: "私たちの先生はとても上手に英語を話します。",
    examples: [
      { en: "Our teacher speaks English very well.", ja: "私たちの先生はとても上手に英語を話します。", context: "学校" },
      { en: "The music teacher plays the guitar.", ja: "音楽の先生はギターを弾きます。", context: "学校" },
      { en: "Mr. Brown is a popular teacher.", ja: "ブラウン先生は人気のある先生です。", context: "学校" },
    ],
    difficulty: 1, category: "school", categories: ["school"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40020, word: "family", meaning: "家族", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "My family lives near the station.", exampleJa: "私の家族は駅の近くに住んでいます。",
    examples: [
      { en: "My family lives near the station.", ja: "私の家族は駅の近くに住んでいます。", context: "日常" },
      { en: "There are five people in my family.", ja: "私の家族は5人です。", context: "自己紹介" },
      { en: "Her family goes camping every summer.", ja: "彼女の家族は毎年夏にキャンプに行きます。", context: "旅行" },
    ],
    difficulty: 1, category: "family", categories: ["family"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40021, word: "mother", meaning: "母", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "My mother works at a hospital.", exampleJa: "母は病院で働いています。",
    examples: [
      { en: "My mother works at a hospital.", ja: "母は病院で働いています。", context: "家庭" },
      { en: "His mother is a very good cook.", ja: "彼のお母さんはとても料理が上手です。", context: "家庭" },
      { en: "Where is your mother now?", ja: "あなたのお母さんは今どこにいますか？", context: "会話" },
    ],
    difficulty: 1, category: "family", categories: ["family"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40022, word: "father", meaning: "父", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "His father is a bus driver.", exampleJa: "彼のお父さんはバスの運転手です。",
    examples: [
      { en: "His father is a bus driver.", ja: "彼のお父さんはバスの運転手です。", context: "家庭" },
      { en: "My father reads the newspaper every morning.", ja: "父は毎朝新聞を読みます。", context: "家庭" },
      { en: "Her father teaches science at a high school.", ja: "彼女の父は高校で理科を教えています。", context: "学校" },
    ],
    difficulty: 1, category: "family", categories: ["family"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40023, word: "dog", meaning: "犬", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "Their dog is brown and white.", exampleJa: "彼らの犬は茶色と白色です。",
    examples: [
      { en: "Their dog is brown and white.", ja: "彼らの犬は茶色と白色です。", context: "日常" },
      { en: "The dog is sleeping under the table.", ja: "犬はテーブルの下で眠っています。", context: "家庭" },
      { en: "She walks her dog before school.", ja: "彼女は学校の前に犬を散歩させます。", context: "日常" },
    ],
    difficulty: 1, category: "nature", categories: ["nature", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40024, word: "cat", meaning: "猫", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "A small cat is sleeping on the chair.", exampleJa: "小さな猫がいすの上で眠っています。",
    examples: [
      { en: "A small cat is sleeping on the chair.", ja: "小さな猫がいすの上で眠っています。", context: "家庭" },
      { en: "We have two cats at home.", ja: "私たちの家には猫が2匹います。", context: "家庭" },
      { en: "That black cat is very cute.", ja: "あの黒い猫はとてもかわいいです。", context: "日常" },
    ],
    difficulty: 1, category: "nature", categories: ["nature", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40025, word: "water", meaning: "水", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "Would you like some water?", exampleJa: "お水はいかがですか？",
    examples: [
      { en: "Would you like some water?", ja: "お水はいかがですか？", context: "接客" },
      { en: "Please drink a lot of water in summer.", ja: "夏にはたくさん水を飲んでください。", context: "健康" },
      { en: "The water in this river is very clean.", ja: "この川の水はとてもきれいです。", context: "自然" },
    ],
    difficulty: 1, category: "food", categories: ["food", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40026, word: "morning", meaning: "朝", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "Good morning, everyone.", exampleJa: "皆さん、おはようございます。",
    examples: [
      { en: "Good morning, everyone.", ja: "皆さん、おはようございます。", context: "挨拶" },
      { en: "She jogs every morning before breakfast.", ja: "彼女は毎朝、朝食の前にジョギングをします。", context: "日常" },
      { en: "We have math class on Monday morning.", ja: "月曜の朝に数学の授業があります。", context: "学校" },
    ],
    difficulty: 1, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40027, word: "music", meaning: "音楽", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "Do you like this music?", exampleJa: "この音楽は好きですか？",
    examples: [
      { en: "Do you like this music?", ja: "この音楽は好きですか？", context: "会話" },
      { en: "She listens to music on the train.", ja: "彼女は電車の中で音楽を聴きます。", context: "日常" },
      { en: "Our music class is on Friday.", ja: "音楽の授業は金曜日です。", context: "学校" },
    ],
    difficulty: 1, category: "hobby", categories: ["hobby", "culture"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40028, word: "park", meaning: "公園", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "There are many trees in the park.", exampleJa: "その公園にはたくさんの木があります。",
    examples: [
      { en: "There are many trees in the park.", ja: "その公園にはたくさんの木があります。", context: "自然" },
      { en: "We play soccer in the park.", ja: "私たちは公園でサッカーをします。", context: "スポーツ" },
      { en: "The park is beautiful in spring.", ja: "その公園は春にきれいです。", context: "季節" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "nature"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40029, word: "lunch", meaning: "昼食", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "Let's have lunch together today.", exampleJa: "今日は一緒に昼食を食べましょう。",
    examples: [
      { en: "Let's have lunch together today.", ja: "今日は一緒に昼食を食べましょう。", context: "学校" },
      { en: "What do you usually have for lunch?", ja: "お昼は普段何を食べますか？", context: "会話" },
      { en: "Lunch time is from twelve to one.", ja: "昼食の時間は12時から1時までです。", context: "学校" },
    ],
    difficulty: 1, category: "food", categories: ["food", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40030, word: "apple", meaning: "りんご", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "She bought three apples at the store.", exampleJa: "彼女はお店でりんごを3つ買いました。",
    examples: [
      { en: "She bought three apples at the store.", ja: "彼女はお店でりんごを3つ買いました。", context: "買い物" },
      { en: "This apple is very sweet.", ja: "このりんごはとても甘いです。", context: "食事" },
      { en: "Would you like an apple or an orange?", ja: "りんごとオレンジ、どちらがいいですか？", context: "会話" },
    ],
    difficulty: 1, category: "food", categories: ["food", "shopping"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40031, word: "station", meaning: "駅", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "The station is near my house.", exampleJa: "駅は私の家の近くにあります。",
    examples: [
      { en: "The station is near my house.", ja: "駅は私の家の近くにあります。", context: "日常" },
      { en: "How many minutes to the station?", ja: "駅まで何分ですか？", context: "道案内" },
      { en: "We meet at the station every day.", ja: "私たちは毎日駅で会います。", context: "日常" },
    ],
    difficulty: 1, category: "travel", categories: ["travel", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40032, word: "hospital", meaning: "病院", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "My grandmother is in the hospital.", exampleJa: "祖母は病院にいます。",
    examples: [
      { en: "My grandmother is in the hospital.", ja: "祖母は病院にいます。", context: "家庭" },
      { en: "There is a big hospital near the park.", ja: "公園の近くに大きな病院があります。", context: "日常" },
      { en: "His father works at a hospital.", ja: "彼のお父さんは病院で働いています。", context: "家庭" },
    ],
    difficulty: 1, category: "health", categories: ["health", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40033, word: "breakfast", meaning: "朝食", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "What did you have for breakfast?", exampleJa: "朝食に何を食べましたか？",
    examples: [
      { en: "What did you have for breakfast?", ja: "朝食に何を食べましたか？", context: "会話" },
      { en: "We eat breakfast at seven.", ja: "私たちは7時に朝食を食べます。", context: "家庭" },
      { en: "Breakfast is ready.", ja: "朝食ができました。", context: "家庭" },
    ],
    difficulty: 1, category: "food", categories: ["food", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40034, word: "birthday", meaning: "誕生日", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "When is your birthday?", exampleJa: "あなたの誕生日はいつですか？",
    examples: [
      { en: "When is your birthday?", ja: "あなたの誕生日はいつですか？", context: "会話" },
      { en: "Happy birthday, Tom!", ja: "お誕生日おめでとう、トム！", context: "お祝い" },
      { en: "Her birthday is in March.", ja: "彼女の誕生日は3月です。", context: "日常" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "family"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40035, word: "summer", meaning: "夏", partOfSpeech: "noun",
    course: "eiken", stage: "5",
    example: "We go to the beach every summer.", exampleJa: "私たちは毎年夏にビーチに行きます。",
    examples: [
      { en: "We go to the beach every summer.", ja: "私たちは毎年夏にビーチに行きます。", context: "旅行" },
      { en: "Summer vacation starts next week.", ja: "来週から夏休みが始まります。", context: "学校" },
      { en: "It is very hot in summer.", ja: "夏はとても暑いです。", context: "天気" },
    ],
    difficulty: 1, category: "nature", categories: ["nature", "daily"], frequencyRank: 1, source: "CEFR-J",
  },

  // ── 形容詞 (10語) ──
  {
    id: 40036, word: "big", meaning: "大きい", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "That is a very big building.", exampleJa: "あれはとても大きな建物です。",
    examples: [
      { en: "That is a very big building.", ja: "あれはとても大きな建物です。", context: "日常" },
      { en: "He has a big dog.", ja: "彼は大きな犬を飼っています。", context: "家庭" },
      { en: "This box is too big for me.", ja: "この箱は私には大きすぎます。", context: "日常" },
    ],
    difficulty: 1, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40037, word: "small", meaning: "小さい", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "She has a small garden behind her house.", exampleJa: "彼女の家の裏には小さな庭があります。",
    examples: [
      { en: "She has a small garden behind her house.", ja: "彼女の家の裏には小さな庭があります。", context: "家庭" },
      { en: "This bag is too small.", ja: "このかばんは小さすぎます。", context: "買い物" },
      { en: "There is a small cat in the box.", ja: "箱の中に小さな猫がいます。", context: "日常" },
    ],
    difficulty: 1, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40038, word: "new", meaning: "新しい", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "He bought a new bicycle last week.", exampleJa: "彼は先週新しい自転車を買いました。",
    examples: [
      { en: "He bought a new bicycle last week.", ja: "彼は先週新しい自転車を買いました。", context: "買い物" },
      { en: "Is there a new student in your class?", ja: "あなたのクラスに新しい生徒はいますか？", context: "学校" },
      { en: "She got a new phone for her birthday.", ja: "彼女は誕生日に新しい電話をもらいました。", context: "家庭" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "shopping"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40039, word: "old", meaning: "古い、年とった", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "This is a very old temple.", exampleJa: "これはとても古い寺です。",
    examples: [
      { en: "This is a very old temple.", ja: "これはとても古い寺です。", context: "文化" },
      { en: "How old are you?", ja: "あなたは何歳ですか？", context: "会話" },
      { en: "My grandfather is 80 years old.", ja: "祖父は80歳です。", context: "家庭" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "culture"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40040, word: "good", meaning: "良い、上手な", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "You are a good singer.", exampleJa: "あなたは歌が上手です。",
    examples: [
      { en: "You are a good singer.", ja: "あなたは歌が上手です。", context: "音楽" },
      { en: "Have a good day!", ja: "良い一日を！", context: "挨拶" },
      { en: "This book is very good.", ja: "この本はとても良いです。", context: "趣味" },
    ],
    difficulty: 1, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40041, word: "happy", meaning: "うれしい", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "The children look very happy today.", exampleJa: "子供たちは今日とてもうれしそうに見えます。",
    examples: [
      { en: "The children look very happy today.", ja: "子供たちは今日とてもうれしそうに見えます。", context: "日常" },
      { en: "I am happy to meet you.", ja: "あなたに会えてうれしいです。", context: "挨拶" },
      { en: "She was happy with her test results.", ja: "彼女はテストの結果に満足していました。", context: "学校" },
    ],
    difficulty: 1, category: "emotion", categories: ["emotion"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40042, word: "busy", meaning: "忙しい", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "My father is always busy on weekdays.", exampleJa: "父は平日はいつも忙しいです。",
    examples: [
      { en: "My father is always busy on weekdays.", ja: "父は平日はいつも忙しいです。", context: "家庭" },
      { en: "Are you busy this afternoon?", ja: "今日の午後は忙しいですか？", context: "会話" },
      { en: "The store is very busy on weekends.", ja: "その店は週末にとても混んでいます。", context: "買い物" },
    ],
    difficulty: 1, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40043, word: "cold", meaning: "寒い、冷たい", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "It is very cold today.", exampleJa: "今日はとても寒いです。",
    examples: [
      { en: "It is very cold today.", ja: "今日はとても寒いです。", context: "天気" },
      { en: "This water is too cold to drink.", ja: "この水は冷たすぎて飲めません。", context: "日常" },
      { en: "Wear a coat. It's cold outside.", ja: "コートを着てください。外は寒いです。", context: "家庭" },
    ],
    difficulty: 1, category: "nature", categories: ["nature", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40044, word: "hot", meaning: "暑い、熱い", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "Be careful. This soup is very hot.", exampleJa: "気をつけて。このスープはとても熱いです。",
    examples: [
      { en: "Be careful. This soup is very hot.", ja: "気をつけて。このスープはとても熱いです。", context: "食事" },
      { en: "It is very hot in August.", ja: "8月はとても暑いです。", context: "天気" },
      { en: "Do you like hot coffee?", ja: "熱いコーヒーは好きですか？", context: "会話" },
    ],
    difficulty: 1, category: "food", categories: ["food", "daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40045, word: "long", meaning: "長い", partOfSpeech: "adjective",
    course: "eiken", stage: "5",
    example: "The river is very long.", exampleJa: "その川はとても長いです。",
    examples: [
      { en: "The river is very long.", ja: "その川はとても長いです。", context: "自然" },
      { en: "She has long black hair.", ja: "彼女は長い黒髪です。", context: "日常" },
      { en: "It was a long day.", ja: "長い一日でした。", context: "日常" },
    ],
    difficulty: 1, category: "nature", categories: ["nature", "daily"], frequencyRank: 1, source: "CEFR-J",
  },

  // ── 副詞 (5語) ──
  {
    id: 40046, word: "always", meaning: "いつも", partOfSpeech: "adverb",
    course: "eiken", stage: "5",
    example: "She always walks to school.", exampleJa: "彼女はいつも学校まで歩きます。",
    examples: [
      { en: "She always walks to school.", ja: "彼女はいつも学校まで歩きます。", context: "学校" },
      { en: "He is always kind to everyone.", ja: "彼はいつもみんなに優しいです。", context: "日常" },
      { en: "We always eat dinner at seven.", ja: "私たちはいつも7時に夕食を食べます。", context: "家庭" },
    ],
    difficulty: 1, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40047, word: "usually", meaning: "たいてい", partOfSpeech: "adverb",
    course: "eiken", stage: "5",
    example: "We usually have rice for dinner.", exampleJa: "私たちはたいてい夕食にご飯を食べます。",
    examples: [
      { en: "We usually have rice for dinner.", ja: "私たちはたいてい夕食にご飯を食べます。", context: "家庭" },
      { en: "He usually gets up at six.", ja: "彼はたいてい6時に起きます。", context: "日常" },
      { en: "She usually takes the bus to work.", ja: "彼女はたいていバスで仕事に行きます。", context: "日常" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "food"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40048, word: "sometimes", meaning: "時々", partOfSpeech: "adverb",
    course: "eiken", stage: "5",
    example: "He sometimes plays tennis on Sundays.", exampleJa: "彼は日曜日に時々テニスをします。",
    examples: [
      { en: "He sometimes plays tennis on Sundays.", ja: "彼は日曜日に時々テニスをします。", context: "スポーツ" },
      { en: "We sometimes go to the movies.", ja: "私たちは時々映画を見に行きます。", context: "趣味" },
      { en: "It sometimes rains in the afternoon.", ja: "午後に時々雨が降ります。", context: "天気" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "sports"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40049, word: "often", meaning: "よく", partOfSpeech: "adverb",
    course: "eiken", stage: "5",
    example: "They often visit their grandparents.", exampleJa: "彼らはよく祖父母を訪ねます。",
    examples: [
      { en: "They often visit their grandparents.", ja: "彼らはよく祖父母を訪ねます。", context: "家庭" },
      { en: "She often reads before bed.", ja: "彼女はよく寝る前に本を読みます。", context: "趣味" },
      { en: "Do you often go shopping?", ja: "よく買い物に行きますか？", context: "会話" },
    ],
    difficulty: 1, category: "daily", categories: ["daily", "family"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 40050, word: "never", meaning: "一度も〜ない", partOfSpeech: "adverb",
    course: "eiken", stage: "5",
    example: "She never eats breakfast.", exampleJa: "彼女は朝食を一度も食べません。",
    examples: [
      { en: "She never eats breakfast.", ja: "彼女は朝食を一度も食べません。", context: "家庭" },
      { en: "He is never late for school.", ja: "彼は学校に遅刻したことがありません。", context: "学校" },
      { en: "I have never been to Canada.", ja: "私はカナダに行ったことがありません。", context: "旅行" },
    ],
    difficulty: 1, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
];
