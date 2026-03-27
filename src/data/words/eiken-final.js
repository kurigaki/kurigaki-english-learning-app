// 英検最終バッチ 準1級7語・4級7語・1級6語（合計20語）
// ID: 52138〜52157
// 準1級: difficulty: 6, frequencyRank: 4, source: "original", course: "eiken", stage: "pre1"
// 4級: difficulty: 2, frequencyRank: 1, source: "CEFR-J", course: "eiken", stage: "4"
// 1級: difficulty: 7, frequencyRank: 5, source: "original", course: "eiken", stage: "1"
// 品質基準: meaning 10文字以内, examples 3件, 例文 5〜12語, "I"始まり15%以下

export const eikenFinal = [
  // === 英検準1級 名詞（7語） ===
  {
    id: 52138, word: "entity", meaning: "実体", partOfSpeech: "noun",
    course: "eiken", stage: "pre1",
    example: "The company became a separate legal entity.", exampleJa: "その会社は独立した法的実体となった。",
    examples: [
      { en: "The company became a separate legal entity.", ja: "その会社は独立した法的実体となった。", context: "ビジネス" },
      { en: "Each entity must file its own taxes.", ja: "各実体は独自に納税しなければならない。", context: "ビジネス" },
      { en: "The two merged into a single entity.", ja: "二つは一つの実体に統合された。", context: "ビジネス" },
    ],
    difficulty: 6, category: "academic", categories: ["academic"], frequencyRank: 4, source: "original",
  },
  {
    id: 52139, word: "faction", meaning: "派閥", partOfSpeech: "noun",
    course: "eiken", stage: "pre1",
    example: "A rival faction challenged the party leader.", exampleJa: "対立する派閥が党首に挑んだ。",
    examples: [
      { en: "A rival faction challenged the party leader.", ja: "対立する派閥が党首に挑んだ。", context: "政治" },
      { en: "The faction gained support from younger members.", ja: "その派閥は若い党員の支持を得た。", context: "政治" },
      { en: "Two factions clashed over the new policy.", ja: "二つの派閥が新政策を巡り対立した。", context: "政治" },
    ],
    difficulty: 6, category: "academic", categories: ["academic"], frequencyRank: 4, source: "original",
  },
  {
    id: 52140, word: "friction", meaning: "摩擦", partOfSpeech: "noun",
    course: "eiken", stage: "pre1",
    example: "Friction between the teams slowed progress.", exampleJa: "チーム間の摩擦が進捗を遅らせた。",
    examples: [
      { en: "Friction between the teams slowed progress.", ja: "チーム間の摩擦が進捗を遅らせた。", context: "ビジネス" },
      { en: "Rubber creates more friction on wet roads.", ja: "ゴムは濡れた道で摩擦を増やす。", context: "科学" },
      { en: "Trade friction arose between the two nations.", ja: "二国間で貿易摩擦が生じた。", context: "政治" },
    ],
    difficulty: 6, category: "academic", categories: ["academic"], frequencyRank: 4, source: "original",
  },
  {
    id: 52141, word: "paradigm", meaning: "枠組み", partOfSpeech: "noun",
    course: "eiken", stage: "pre1",
    example: "The discovery created a new scientific paradigm.", exampleJa: "その発見は新しい科学的枠組みを作った。",
    examples: [
      { en: "The discovery created a new scientific paradigm.", ja: "その発見は新しい科学的枠組みを作った。", context: "科学" },
      { en: "A paradigm shift transformed the whole industry.", ja: "枠組みの転換が業界全体を変えた。", context: "ビジネス" },
      { en: "Old paradigms often resist change from within.", ja: "古い枠組みは内部からの変化に抵抗する。", context: "学術" },
    ],
    difficulty: 6, category: "academic", categories: ["academic"], frequencyRank: 4, source: "original",
  },
  {
    id: 52142, word: "scenario", meaning: "想定", partOfSpeech: "noun",
    course: "eiken", stage: "pre1",
    example: "The worst-case scenario would cost millions.", exampleJa: "最悪の想定は数百万の損失になる。",
    examples: [
      { en: "The worst-case scenario would cost millions.", ja: "最悪の想定は数百万の損失になる。", context: "ビジネス" },
      { en: "We prepared for every possible scenario.", ja: "私たちはあらゆる想定に備えた。", context: "ビジネス" },
      { en: "This scenario assumes steady economic growth.", ja: "この想定は安定した経済成長を前提とする。", context: "経済" },
    ],
    difficulty: 6, category: "academic", categories: ["academic"], frequencyRank: 4, source: "original",
  },
  {
    id: 52143, word: "spectrum", meaning: "範囲", partOfSpeech: "noun",
    course: "eiken", stage: "pre1",
    example: "The book covers a broad spectrum of topics.", exampleJa: "その本は幅広い範囲の話題を扱う。",
    examples: [
      { en: "The book covers a broad spectrum of topics.", ja: "その本は幅広い範囲の話題を扱う。", context: "学術" },
      { en: "Light splits into a spectrum of colors.", ja: "光は色の範囲に分かれる。", context: "科学" },
      { en: "Opinions exist across the political spectrum.", ja: "意見は政治的範囲の全域に存在する。", context: "政治" },
    ],
    difficulty: 6, category: "academic", categories: ["academic"], frequencyRank: 4, source: "original",
  },
  {
    id: 52144, word: "strategy", meaning: "戦略", partOfSpeech: "noun",
    course: "eiken", stage: "pre1",
    example: "The team developed a new marketing strategy.", exampleJa: "チームは新しいマーケティング戦略を策定した。",
    examples: [
      { en: "The team developed a new marketing strategy.", ja: "チームは新しいマーケティング戦略を策定した。", context: "ビジネス" },
      { en: "A clear strategy helped them win the game.", ja: "明確な戦略が試合の勝利に繋がった。", context: "スポーツ" },
      { en: "Her strategy focused on long-term growth.", ja: "彼女の戦略は長期的成長に焦点を当てた。", context: "ビジネス" },
    ],
    difficulty: 6, category: "academic", categories: ["academic"], frequencyRank: 4, source: "original",
  },

  // === 英検4級 名詞（7語） ===
  {
    id: 52145, word: "corn", meaning: "とうもろこし", partOfSpeech: "noun",
    course: "eiken", stage: "4",
    example: "We bought fresh corn at the market.", exampleJa: "市場で新鮮なとうもろこしを買った。",
    examples: [
      { en: "We bought fresh corn at the market.", ja: "市場で新鮮なとうもろこしを買った。", context: "日常" },
      { en: "She grilled corn for the summer party.", ja: "彼女は夏のパーティーにとうもろこしを焼いた。", context: "日常" },
      { en: "Farmers grow corn in large fields.", ja: "農家は広い畑でとうもろこしを育てる。", context: "農業" },
    ],
    difficulty: 2, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 52146, word: "grape", meaning: "ぶどう", partOfSpeech: "noun",
    course: "eiken", stage: "4",
    example: "These grapes taste sweet and juicy.", exampleJa: "このぶどうは甘くてみずみずしい。",
    examples: [
      { en: "These grapes taste sweet and juicy.", ja: "このぶどうは甘くてみずみずしい。", context: "日常" },
      { en: "She packed grapes in her lunch box.", ja: "彼女はお弁当にぶどうを入れた。", context: "日常" },
      { en: "Red grapes are used to make wine.", ja: "赤いぶどうはワイン作りに使われる。", context: "食文化" },
    ],
    difficulty: 2, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 52147, word: "lens", meaning: "レンズ", partOfSpeech: "noun",
    course: "eiken", stage: "4",
    example: "He cleaned the camera lens carefully.", exampleJa: "彼はカメラのレンズを丁寧に拭いた。",
    examples: [
      { en: "He cleaned the camera lens carefully.", ja: "彼はカメラのレンズを丁寧に拭いた。", context: "日常" },
      { en: "The lens can zoom in very far.", ja: "そのレンズはとても遠くまで拡大できる。", context: "技術" },
      { en: "She wears contact lenses every day.", ja: "彼女は毎日コンタクトレンズをつける。", context: "日常" },
    ],
    difficulty: 2, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 52148, word: "marsh", meaning: "湿地", partOfSpeech: "noun",
    course: "eiken", stage: "4",
    example: "Many birds live near the marsh.", exampleJa: "多くの鳥が湿地の近くに住んでいる。",
    examples: [
      { en: "Many birds live near the marsh.", ja: "多くの鳥が湿地の近くに住んでいる。", context: "自然" },
      { en: "The marsh flooded after heavy rain.", ja: "大雨の後、湿地が浸水した。", context: "自然" },
      { en: "We walked carefully through the marsh.", ja: "私たちは湿地を注意深く歩いた。", context: "日常" },
    ],
    difficulty: 2, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 52149, word: "mat", meaning: "マット", partOfSpeech: "noun",
    course: "eiken", stage: "4",
    example: "Please wipe your shoes on the mat.", exampleJa: "マットで靴を拭いてください。",
    examples: [
      { en: "Please wipe your shoes on the mat.", ja: "マットで靴を拭いてください。", context: "日常" },
      { en: "She does yoga on a soft mat.", ja: "彼女は柔らかいマットでヨガをする。", context: "日常" },
      { en: "The cat always sleeps on the mat.", ja: "猫はいつもマットの上で寝る。", context: "日常" },
    ],
    difficulty: 2, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 52150, word: "oar", meaning: "オール", partOfSpeech: "noun",
    course: "eiken", stage: "4",
    example: "He pulled the oar through the water.", exampleJa: "彼は水の中でオールを引いた。",
    examples: [
      { en: "He pulled the oar through the water.", ja: "彼は水の中でオールを引いた。", context: "日常" },
      { en: "One oar broke during the boat race.", ja: "ボートレース中にオールが一本折れた。", context: "スポーツ" },
      { en: "She held the oar tightly with both hands.", ja: "彼女は両手でオールをしっかり握った。", context: "日常" },
    ],
    difficulty: 2, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },
  {
    id: 52151, word: "paste", meaning: "のり", partOfSpeech: "noun",
    course: "eiken", stage: "4",
    example: "Use paste to stick the paper together.", exampleJa: "のりを使って紙を貼り合わせて。",
    examples: [
      { en: "Use paste to stick the paper together.", ja: "のりを使って紙を貼り合わせて。", context: "日常" },
      { en: "The child spread paste on the cardboard.", ja: "その子はダンボールにのりを塗った。", context: "日常" },
      { en: "Mix flour and water to make paste.", ja: "小麦粉と水を混ぜてのりを作る。", context: "日常" },
    ],
    difficulty: 2, category: "daily", categories: ["daily"], frequencyRank: 1, source: "CEFR-J",
  },

  // === 英検1級 名詞（6語） ===
  {
    id: 52152, word: "axle", meaning: "車軸", partOfSpeech: "noun",
    course: "eiken", stage: "1",
    example: "The truck's rear axle cracked under pressure.", exampleJa: "トラックの後部車軸が圧力で割れた。",
    examples: [
      { en: "The truck's rear axle cracked under pressure.", ja: "トラックの後部車軸が圧力で割れた。", context: "技術" },
      { en: "A broken axle stopped the train completely.", ja: "車軸の破損が列車を完全に止めた。", context: "交通" },
      { en: "The mechanic replaced the worn axle yesterday.", ja: "整備士は昨日摩耗した車軸を交換した。", context: "技術" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 52153, word: "boulder", meaning: "巨岩", partOfSpeech: "noun",
    course: "eiken", stage: "1",
    example: "A massive boulder blocked the mountain path.", exampleJa: "巨大な巨岩が山道を塞いだ。",
    examples: [
      { en: "A massive boulder blocked the mountain path.", ja: "巨大な巨岩が山道を塞いだ。", context: "自然" },
      { en: "Climbers rested beside a shaded boulder.", ja: "登山者たちは日陰の巨岩のそばで休んだ。", context: "自然" },
      { en: "The boulder rolled down the steep hillside.", ja: "巨岩が急斜面を転がり落ちた。", context: "自然" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 52154, word: "elm", meaning: "楡の木", partOfSpeech: "noun",
    course: "eiken", stage: "1",
    example: "A tall elm stood at the park entrance.", exampleJa: "公園の入口に高い楡の木が立っていた。",
    examples: [
      { en: "A tall elm stood at the park entrance.", ja: "公園の入口に高い楡の木が立っていた。", context: "自然" },
      { en: "The elm provides shade during hot summers.", ja: "楡の木は暑い夏に日陰を提供する。", context: "自然" },
      { en: "Dutch elm disease destroyed many old trees.", ja: "ニレ立枯病が多くの古木を枯らした。", context: "科学" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 52155, word: "flask", meaning: "フラスコ", partOfSpeech: "noun",
    course: "eiken", stage: "1",
    example: "She heated the liquid in a glass flask.", exampleJa: "彼女はガラスのフラスコで液体を温めた。",
    examples: [
      { en: "She heated the liquid in a glass flask.", ja: "彼女はガラスのフラスコで液体を温めた。", context: "科学" },
      { en: "The flask cracked from sudden temperature change.", ja: "フラスコが急な温度変化でひび割れた。", context: "科学" },
      { en: "He carried a flask of hot coffee.", ja: "彼は熱いコーヒーの入ったフラスコを持っていた。", context: "日常" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 52156, word: "prism", meaning: "プリズム", partOfSpeech: "noun",
    course: "eiken", stage: "1",
    example: "Light passed through the prism and split.", exampleJa: "光がプリズムを通って分散した。",
    examples: [
      { en: "Light passed through the prism and split.", ja: "光がプリズムを通って分散した。", context: "科学" },
      { en: "The prism created a rainbow on the wall.", ja: "プリズムが壁に虹を作った。", context: "科学" },
      { en: "Students studied refraction using a glass prism.", ja: "生徒たちはガラスのプリズムで屈折を学んだ。", context: "教育" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 52157, word: "wharf", meaning: "波止場", partOfSpeech: "noun",
    course: "eiken", stage: "1",
    example: "Fishermen unloaded their catch at the wharf.", exampleJa: "漁師たちは波止場で水揚げした。",
    examples: [
      { en: "Fishermen unloaded their catch at the wharf.", ja: "漁師たちは波止場で水揚げした。", context: "日常" },
      { en: "The old wharf was rebuilt for tourism.", ja: "古い波止場は観光用に再建された。", context: "旅行" },
      { en: "Boats lined up along the wooden wharf.", ja: "木造の波止場に沿ってボートが並んだ。", context: "日常" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
];
