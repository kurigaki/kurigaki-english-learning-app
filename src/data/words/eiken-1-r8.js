// 英検1級 同義語グループ・高度な動詞（44語）
// ID: 48380〜48423
// difficulty: 7, frequencyRank: 5, source: "original", course: "eiken", stage: "1"
// 品質基準: meaning 10文字以内, examples 3件, 例文 5〜12語, "I"始まり15%以下

export const eiken1R8 = [
  // ===== 無効化・取消グループ (annul, revoke, rescind) =====
  {
    id: 48380, word: "annul", meaning: "無効にする", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The court annulled the marriage after fraud was proven.", exampleJa: "詐欺が証明された後、裁判所は婚姻を無効にした。",
    examples: [
      { en: "The court annulled the marriage after fraud was proven.", ja: "詐欺が証明された後、裁判所は婚姻を無効にした。", context: "法律" },
      { en: "Parliament voted to annul the controversial regulation.", ja: "議会は物議を醸す規制を無効にする議決をした。", context: "政治" },
      { en: "The judge annulled the contract due to coercion.", ja: "裁判官は強制を理由に契約を無効にした。", context: "法律" },
    ],
    difficulty: 7, category: "society", categories: ["society"], frequencyRank: 5, source: "original",
  },
  {
    id: 48381, word: "revoke", meaning: "撤回する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The agency revoked his license for repeated violations.", exampleJa: "当局は度重なる違反で彼の免許を取り消した。",
    examples: [
      { en: "The agency revoked his license for repeated violations.", ja: "当局は度重なる違反で彼の免許を取り消した。", context: "行政" },
      { en: "Authorities may revoke permits without prior notice.", ja: "当局は事前通知なしに許可を取り消す場合がある。", context: "法律" },
      { en: "The university revoked the honorary degree immediately.", ja: "大学はその名誉学位を直ちに取り消した。", context: "教育" },
    ],
    difficulty: 7, category: "society", categories: ["society"], frequencyRank: 5, source: "original",
  },
  {
    id: 48382, word: "rescind", meaning: "撤廃する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The governor rescinded the emergency order last week.", exampleJa: "知事は先週、緊急命令を撤廃した。",
    examples: [
      { en: "The governor rescinded the emergency order last week.", ja: "知事は先週、緊急命令を撤廃した。", context: "政治" },
      { en: "The company rescinded its offer after background checks.", ja: "会社は経歴調査の後、内定を撤回した。", context: "ビジネス" },
      { en: "Congress voted to rescind the outdated policy.", ja: "議会は時代遅れの政策を撤廃する議決をした。", context: "政治" },
    ],
    difficulty: 7, category: "society", categories: ["society"], frequencyRank: 5, source: "original",
  },

  // ===== 蓄積グループ (accrue, amass, aggregate, compile) =====
  {
    id: 48383, word: "accrue", meaning: "生じる", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Benefits accrue to those who invest early.", exampleJa: "早期に投資する人に利益が生じる。",
    examples: [
      { en: "Benefits accrue to those who invest early.", ja: "早期に投資する人に利益が生じる。", context: "金融" },
      { en: "Unpaid interest continues to accrue over time.", ja: "未払い利息は時間の経過とともに生じ続ける。", context: "金融" },
      { en: "Experience accrued during the internship proved invaluable.", ja: "インターン中に蓄積された経験は非常に貴重だった。", context: "キャリア" },
    ],
    difficulty: 7, category: "finance", categories: ["finance"], frequencyRank: 5, source: "original",
  },
  {
    id: 48384, word: "amass", meaning: "蓄積する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "She amassed a fortune through decades of hard work.", exampleJa: "彼女は数十年の努力で財産を蓄積した。",
    examples: [
      { en: "She amassed a fortune through decades of hard work.", ja: "彼女は数十年の努力で財産を蓄積した。", context: "金融" },
      { en: "The museum amassed an impressive art collection.", ja: "その美術館は見事な美術品を蓄積した。", context: "文化" },
      { en: "Researchers amassed data from thousands of participants.", ja: "研究者たちは数千人の参加者からデータを蓄積した。", context: "研究" },
    ],
    difficulty: 7, category: "finance", categories: ["finance","academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 48385, word: "aggregate", meaning: "集約する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The platform aggregates news from multiple sources.", exampleJa: "そのプラットフォームは複数の情報源からニュースを集約する。",
    examples: [
      { en: "The platform aggregates news from multiple sources.", ja: "そのプラットフォームは複数の情報源からニュースを集約する。", context: "技術" },
      { en: "Scientists aggregated results from independent studies.", ja: "科学者たちは独立した研究結果を集約した。", context: "研究" },
      { en: "The software aggregates customer feedback automatically.", ja: "そのソフトウェアは顧客の声を自動で集約する。", context: "ビジネス" },
    ],
    difficulty: 7, category: "technology", categories: ["technology","academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 48386, word: "compile", meaning: "編纂する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Scholars compiled a comprehensive dictionary of dialects.", exampleJa: "学者たちは方言の包括的な辞書を編纂した。",
    examples: [
      { en: "Scholars compiled a comprehensive dictionary of dialects.", ja: "学者たちは方言の包括的な辞書を編纂した。", context: "学術" },
      { en: "The committee compiled testimonies from all witnesses.", ja: "委員会は全証人の証言を編纂した。", context: "法律" },
      { en: "Archivists compiled records spanning three centuries.", ja: "記録保管者たちは3世紀にわたる記録を編纂した。", context: "歴史" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },

  // ===== 暗示グループ (allude, insinuate, intimate) =====
  {
    id: 48387, word: "allude", meaning: "ほのめかす", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The speaker alluded to upcoming policy changes.", exampleJa: "講演者は今後の政策変更をほのめかした。",
    examples: [
      { en: "The speaker alluded to upcoming policy changes.", ja: "講演者は今後の政策変更をほのめかした。", context: "政治" },
      { en: "The novel alludes to Greek mythology throughout.", ja: "その小説は全編を通じてギリシャ神話をほのめかす。", context: "文学" },
      { en: "She alluded to problems without naming anyone.", ja: "彼女は誰の名前も挙げず問題をほのめかした。", context: "コミュニケーション" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48388, word: "insinuate", meaning: "暗にほのめかす", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "He insinuated that the results were fabricated.", exampleJa: "彼は結果が捏造されたと暗にほのめかした。",
    examples: [
      { en: "He insinuated that the results were fabricated.", ja: "彼は結果が捏造されたと暗にほのめかした。", context: "学術" },
      { en: "The article insinuated corruption among officials.", ja: "その記事は役人の汚職を暗にほのめかした。", context: "メディア" },
      { en: "She insinuated doubt without making direct accusations.", ja: "彼女は直接非難せず疑念を暗にほのめかした。", context: "コミュニケーション" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48389, word: "intimate", meaning: "それとなく示す", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The CEO intimated that layoffs were inevitable.", exampleJa: "CEOはリストラが不可避だとそれとなく示した。",
    examples: [
      { en: "The CEO intimated that layoffs were inevitable.", ja: "CEOはリストラが不可避だとそれとなく示した。", context: "ビジネス" },
      { en: "Officials intimated a shift in foreign policy.", ja: "当局者たちは外交政策の転換をそれとなく示した。", context: "政治" },
      { en: "The report intimated deeper structural problems.", ja: "その報告書はより深い構造的問題をそれとなく示した。", context: "学術" },
    ],
    difficulty: 7, category: "communication", categories: ["communication","business"], frequencyRank: 5, source: "original",
  },

  // ===== 宥和グループ (appease, mollify, pacify, placate, conciliate) =====
  {
    id: 48390, word: "appease", meaning: "なだめる", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The government tried to appease the angry protesters.", exampleJa: "政府は怒る抗議者たちをなだめようとした。",
    examples: [
      { en: "The government tried to appease the angry protesters.", ja: "政府は怒る抗議者たちをなだめようとした。", context: "政治" },
      { en: "Concessions were made to appease the opposition.", ja: "反対派をなだめるために譲歩がなされた。", context: "外交" },
      { en: "Nothing could appease the frustrated customers.", ja: "不満を抱く顧客をなだめるものは何もなかった。", context: "ビジネス" },
    ],
    difficulty: 7, category: "society", categories: ["society","communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48391, word: "mollify", meaning: "和らげる", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "His sincere apology mollified the offended client.", exampleJa: "彼の誠実な謝罪が気分を害した顧客を和らげた。",
    examples: [
      { en: "His sincere apology mollified the offended client.", ja: "彼の誠実な謝罪が気分を害した顧客を和らげた。", context: "ビジネス" },
      { en: "The manager's explanation failed to mollify employees.", ja: "管理者の説明は従業員を和らげられなかった。", context: "職場" },
      { en: "Diplomatic efforts eventually mollified the hostile nation.", ja: "外交努力がついに敵対国を和らげた。", context: "外交" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48392, word: "pacify", meaning: "鎮める", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Troops were deployed to pacify the troubled region.", exampleJa: "混乱した地域を鎮めるために軍が配備された。",
    examples: [
      { en: "Troops were deployed to pacify the troubled region.", ja: "混乱した地域を鎮めるために軍が配備された。", context: "軍事" },
      { en: "The mother sang softly to pacify her crying child.", ja: "母は泣く子を鎮めるために静かに歌った。", context: "日常" },
      { en: "Authorities struggled to pacify the rioting crowd.", ja: "当局は暴動する群衆を鎮めるのに苦労した。", context: "社会" },
    ],
    difficulty: 7, category: "society", categories: ["society"], frequencyRank: 5, source: "original",
  },
  {
    id: 48393, word: "placate", meaning: "懐柔する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The company offered refunds to placate dissatisfied buyers.", exampleJa: "会社は不満な購入者を懐柔するために返金を申し出た。",
    examples: [
      { en: "The company offered refunds to placate dissatisfied buyers.", ja: "会社は不満な購入者を懐柔するために返金を申し出た。", context: "ビジネス" },
      { en: "Politicians often placate voters with empty promises.", ja: "政治家はしばしば空約束で有権者を懐柔する。", context: "政治" },
      { en: "No amount of flattery could placate the critic.", ja: "どんなにお世辞を言っても批評家を懐柔できなかった。", context: "メディア" },
    ],
    difficulty: 7, category: "communication", categories: ["communication","society"], frequencyRank: 5, source: "original",
  },
  {
    id: 48394, word: "conciliate", meaning: "調停する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The mediator worked hard to conciliate both parties.", exampleJa: "調停者は双方を和解させるために尽力した。",
    examples: [
      { en: "The mediator worked hard to conciliate both parties.", ja: "調停者は双方を和解させるために尽力した。", context: "法律" },
      { en: "Efforts to conciliate the rival factions proved futile.", ja: "対立派閥を調停する努力は無駄だった。", context: "政治" },
      { en: "The ambassador sought to conciliate the warring nations.", ja: "大使は交戦国を調停しようとした。", context: "外交" },
    ],
    difficulty: 7, category: "society", categories: ["society","communication"], frequencyRank: 5, source: "original",
  },

  // ===== 強化グループ (buttress, fortify) =====
  {
    id: 48395, word: "buttress", meaning: "補強する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "New evidence buttressed the researcher's original hypothesis.", exampleJa: "新たな証拠が研究者の当初の仮説を補強した。",
    examples: [
      { en: "New evidence buttressed the researcher's original hypothesis.", ja: "新たな証拠が研究者の当初の仮説を補強した。", context: "研究" },
      { en: "The ruling party buttressed its position with alliances.", ja: "与党は同盟で自らの立場を補強した。", context: "政治" },
      { en: "Statistics buttress the argument for policy reform.", ja: "統計がその政策改革の論拠を補強する。", context: "学術" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 48396, word: "fortify", meaning: "強化する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Engineers fortified the dam against future flooding.", exampleJa: "技術者たちは今後の洪水に備えてダムを強化した。",
    examples: [
      { en: "Engineers fortified the dam against future flooding.", ja: "技術者たちは今後の洪水に備えてダムを強化した。", context: "工学" },
      { en: "Vitamins are added to fortify breakfast cereals.", ja: "朝食用シリアルを強化するためにビタミンが添加される。", context: "健康" },
      { en: "The general fortified the borders with extra troops.", ja: "将軍は追加の兵力で国境を強化した。", context: "軍事" },
    ],
    difficulty: 7, category: "society", categories: ["society","health"], frequencyRank: 5, source: "original",
  },

  // ===== 叱責グループ (castigate, chastise, rebuke, reprimand, admonish) =====
  {
    id: 48397, word: "castigate", meaning: "厳しく批判する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Critics castigated the government for its slow response.", exampleJa: "批評家たちは政府の遅い対応を厳しく批判した。",
    examples: [
      { en: "Critics castigated the government for its slow response.", ja: "批評家たちは政府の遅い対応を厳しく批判した。", context: "政治" },
      { en: "The editorial castigated corporate greed and negligence.", ja: "社説は企業の強欲と怠慢を厳しく批判した。", context: "メディア" },
      { en: "Activists castigated the policy as fundamentally flawed.", ja: "活動家たちは政策を根本的に欠陥があると批判した。", context: "社会" },
    ],
    difficulty: 7, category: "communication", categories: ["communication","society"], frequencyRank: 5, source: "original",
  },
  {
    id: 48398, word: "chastise", meaning: "叱責する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The teacher chastised the students for their carelessness.", exampleJa: "教師は生徒たちの不注意を叱責した。",
    examples: [
      { en: "The teacher chastised the students for their carelessness.", ja: "教師は生徒たちの不注意を叱責した。", context: "教育" },
      { en: "Media outlets chastised the politician for lying.", ja: "メディアは政治家の嘘を叱責した。", context: "メディア" },
      { en: "The coach chastised the team after a poor performance.", ja: "コーチはチームの不振を叱責した。", context: "スポーツ" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48399, word: "rebuke", meaning: "非難する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The senator publicly rebuked his colleague's remarks.", exampleJa: "上院議員は同僚の発言を公に非難した。",
    examples: [
      { en: "The senator publicly rebuked his colleague's remarks.", ja: "上院議員は同僚の発言を公に非難した。", context: "政治" },
      { en: "She rebuked the assistant for the repeated errors.", ja: "彼女はアシスタントの度重なるミスを非難した。", context: "職場" },
      { en: "The judge rebuked the lawyer for unprofessional conduct.", ja: "裁判官は弁護士の非専門的な行為を非難した。", context: "法律" },
    ],
    difficulty: 7, category: "communication", categories: ["communication","society"], frequencyRank: 5, source: "original",
  },
  {
    id: 48400, word: "reprimand", meaning: "譴責する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The officer was reprimanded for breaching protocol.", exampleJa: "その職員は規約違反で譴責された。",
    examples: [
      { en: "The officer was reprimanded for breaching protocol.", ja: "その職員は規約違反で譴責された。", context: "軍事" },
      { en: "The board formally reprimanded the chief executive.", ja: "取締役会は最高責任者を正式に譴責した。", context: "ビジネス" },
      { en: "Students who cheat will be reprimanded severely.", ja: "不正をした生徒は厳しく譴責される。", context: "教育" },
    ],
    difficulty: 7, category: "society", categories: ["society"], frequencyRank: 5, source: "original",
  },
  {
    id: 48401, word: "admonish", meaning: "戒める", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The principal admonished students about campus safety.", exampleJa: "校長は生徒たちにキャンパスの安全について戒めた。",
    examples: [
      { en: "The principal admonished students about campus safety.", ja: "校長は生徒たちにキャンパスの安全について戒めた。", context: "教育" },
      { en: "Doctors admonish patients to reduce sugar intake.", ja: "医師は患者に糖分摂取を減らすよう戒める。", context: "健康" },
      { en: "The referee admonished the player for rough play.", ja: "審判はその選手を荒いプレーについて戒めた。", context: "スポーツ" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },

  // ===== 駆り立てる (impel) =====
  {
    id: 48402, word: "impel", meaning: "駆り立てる", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Curiosity impelled her to explore the abandoned ruins.", exampleJa: "好奇心が彼女を廃墟の探索へと駆り立てた。",
    examples: [
      { en: "Curiosity impelled her to explore the abandoned ruins.", ja: "好奇心が彼女を廃墟の探索へと駆り立てた。", context: "冒険" },
      { en: "Economic hardship impelled thousands to seek refuge abroad.", ja: "経済的困窮が何千人もの人々を海外に避難させた。", context: "社会" },
      { en: "A sense of duty impelled him to volunteer.", ja: "義務感が彼をボランティアへと駆り立てた。", context: "道徳" },
    ],
    difficulty: 7, category: "communication", categories: ["communication","society"], frequencyRank: 5, source: "original",
  },

  // ===== 隠蔽グループ (cloak, shroud, veil) =====
  {
    id: 48403, word: "cloak", meaning: "覆い隠す", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The organization cloaked its true intentions carefully.", exampleJa: "その組織は真の意図を慎重に覆い隠した。",
    examples: [
      { en: "The organization cloaked its true intentions carefully.", ja: "その組織は真の意図を慎重に覆い隠した。", context: "政治" },
      { en: "Dense fog cloaked the entire valley at dawn.", ja: "濃い霧が夜明けに谷全体を覆い隠した。", context: "自然" },
      { en: "The spy cloaked his identity with a disguise.", ja: "スパイは変装で自分の正体を覆い隠した。", context: "物語" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48404, word: "shroud", meaning: "包み隠す", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Mystery still shrouds the origin of the manuscript.", exampleJa: "その原稿の起源は今なお謎に包まれている。",
    examples: [
      { en: "Mystery still shrouds the origin of the manuscript.", ja: "その原稿の起源は今なお謎に包まれている。", context: "歴史" },
      { en: "Heavy clouds shrouded the mountain peak from view.", ja: "厚い雲が山頂を視界から包み隠した。", context: "自然" },
      { en: "Secrecy shrouded the negotiations between both governments.", ja: "秘密主義が両国政府間の交渉を包み隠した。", context: "外交" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48405, word: "veil", meaning: "隠す", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The corporation veiled its financial troubles from investors.", exampleJa: "企業は投資家から財務上の問題を隠した。",
    examples: [
      { en: "The corporation veiled its financial troubles from investors.", ja: "企業は投資家から財務上の問題を隠した。", context: "金融" },
      { en: "Polite language can veil underlying hostility effectively.", ja: "丁寧な言葉は根底にある敵意を効果的に隠せる。", context: "コミュニケーション" },
      { en: "Smoke veiled the skyline of the burning city.", ja: "煙が燃える都市のスカイラインを隠した。", context: "災害" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },

  // ===== 中傷グループ (denigrate, disparage, belittle, deprecate, malign) =====
  {
    id: 48406, word: "denigrate", meaning: "中傷する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Rivals attempted to denigrate her academic achievements.", exampleJa: "ライバルたちは彼女の学業成績を中傷しようとした。",
    examples: [
      { en: "Rivals attempted to denigrate her academic achievements.", ja: "ライバルたちは彼女の学業成績を中傷しようとした。", context: "学術" },
      { en: "The campaign denigrated the opponent's character ruthlessly.", ja: "その選挙運動は対立候補の人格を容赦なく中傷した。", context: "政治" },
      { en: "Critics denigrated the film as shallow entertainment.", ja: "批評家はその映画を浅い娯楽だと中傷した。", context: "メディア" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48407, word: "disparage", meaning: "見くびる", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The manager disparaged the proposal during the meeting.", exampleJa: "管理者は会議中にその提案を見くびった。",
    examples: [
      { en: "The manager disparaged the proposal during the meeting.", ja: "管理者は会議中にその提案を見くびった。", context: "ビジネス" },
      { en: "Experts warned against disparaging traditional remedies.", ja: "専門家は伝統的な治療法を見くびらないよう警告した。", context: "医療" },
      { en: "He disparaged his competitor's work at every opportunity.", ja: "彼は機会あるごとに競合者の仕事を見くびった。", context: "ビジネス" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48408, word: "belittle", meaning: "軽視する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Supervisors should never belittle a subordinate's efforts.", exampleJa: "上司は部下の努力を決して軽視すべきではない。",
    examples: [
      { en: "Supervisors should never belittle a subordinate's efforts.", ja: "上司は部下の努力を決して軽視すべきではない。", context: "職場" },
      { en: "The article belittled the significance of the discovery.", ja: "その記事はその発見の重要性を軽視した。", context: "メディア" },
      { en: "She refused to let anyone belittle her ambitions.", ja: "彼女は誰にも自分の志を軽視させなかった。", context: "自己啓発" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48409, word: "deprecate", meaning: "反対する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Many scholars deprecate the use of informal language.", exampleJa: "多くの学者が非公式な言葉遣いに反対する。",
    examples: [
      { en: "Many scholars deprecate the use of informal language.", ja: "多くの学者が非公式な言葉遣いに反対する。", context: "学術" },
      { en: "Traditionalists deprecate modern approaches to education.", ja: "伝統主義者は現代の教育手法に反対する。", context: "教育" },
      { en: "The committee deprecated hasty decisions on budget cuts.", ja: "委員会は予算削減に関する性急な決定に反対した。", context: "政治" },
    ],
    difficulty: 7, category: "academic", categories: ["academic","communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48410, word: "malign", meaning: "悪口を言う", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Tabloids frequently malign public figures for profit.", exampleJa: "タブロイド紙は利益のために著名人の悪口を言う。",
    examples: [
      { en: "Tabloids frequently malign public figures for profit.", ja: "タブロイド紙は利益のために著名人の悪口を言う。", context: "メディア" },
      { en: "Former allies maligned the leader after his resignation.", ja: "かつての同盟者は辞任後にその指導者の悪口を言った。", context: "政治" },
      { en: "The defendant claimed witnesses had maligned his reputation.", ja: "被告は証人が自分の名声を傷つけたと主張した。", context: "法律" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },

  // ===== 暴露・伝達グループ (divulge, impart, unveil) =====
  {
    id: 48411, word: "divulge", meaning: "漏らす", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The whistleblower divulged classified information to reporters.", exampleJa: "内部告発者は記者に機密情報を漏らした。",
    examples: [
      { en: "The whistleblower divulged classified information to reporters.", ja: "内部告発者は記者に機密情報を漏らした。", context: "メディア" },
      { en: "Employees are prohibited from divulging trade secrets.", ja: "従業員は企業秘密を漏らすことを禁じられている。", context: "ビジネス" },
      { en: "The witness reluctantly divulged details about the crime.", ja: "証人は渋々犯罪の詳細を漏らした。", context: "法律" },
    ],
    difficulty: 7, category: "communication", categories: ["communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48412, word: "impart", meaning: "伝える", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Mentors impart valuable knowledge to young professionals.", exampleJa: "指導者は若い専門家に貴重な知識を伝える。",
    examples: [
      { en: "Mentors impart valuable knowledge to young professionals.", ja: "指導者は若い専門家に貴重な知識を伝える。", context: "キャリア" },
      { en: "The spice imparts a distinctive flavor to the dish.", ja: "その香辛料は料理に独特の風味を伝える。", context: "料理" },
      { en: "Teachers strive to impart critical thinking skills.", ja: "教師は批判的思考力を伝えようと努める。", context: "教育" },
    ],
    difficulty: 7, category: "communication", categories: ["communication","academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 48413, word: "unveil", meaning: "明かす", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The company unveiled its latest product at the expo.", exampleJa: "会社は博覧会で最新製品を明かした。",
    examples: [
      { en: "The company unveiled its latest product at the expo.", ja: "会社は博覧会で最新製品を明かした。", context: "ビジネス" },
      { en: "Scientists unveiled a breakthrough in cancer research.", ja: "科学者たちは癌研究の画期的成果を明かした。", context: "研究" },
      { en: "The mayor unveiled plans for a new public library.", ja: "市長は新しい公立図書館の計画を明かした。", context: "行政" },
    ],
    difficulty: 7, category: "communication", categories: ["communication","business"], frequencyRank: 5, source: "original",
  },

  // ===== 個別動詞 (solicit, subsume, espouse, impede) =====
  {
    id: 48414, word: "solicit", meaning: "求める", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The charity solicited donations from local businesses.", exampleJa: "慈善団体は地元企業に寄付を求めた。",
    examples: [
      { en: "The charity solicited donations from local businesses.", ja: "慈善団体は地元企業に寄付を求めた。", context: "慈善" },
      { en: "Researchers solicited feedback from trial participants.", ja: "研究者たちは試験参加者からフィードバックを求めた。", context: "研究" },
      { en: "The firm solicited bids from multiple contractors.", ja: "企業は複数の請負業者から入札を求めた。", context: "ビジネス" },
    ],
    difficulty: 7, category: "business", categories: ["business","communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48415, word: "subsume", meaning: "包含する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The broader theory subsumes several earlier hypotheses.", exampleJa: "その広範な理論はいくつかの先行仮説を包含する。",
    examples: [
      { en: "The broader theory subsumes several earlier hypotheses.", ja: "その広範な理論はいくつかの先行仮説を包含する。", context: "学術" },
      { en: "Corporate mergers often subsume smaller firms entirely.", ja: "企業合併はしばしば小規模企業を完全に包含する。", context: "ビジネス" },
      { en: "The new category subsumes all previous classifications.", ja: "新しいカテゴリはすべての先行分類を包含する。", context: "学術" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 48416, word: "espouse", meaning: "支持する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The professor espoused a radical approach to reform.", exampleJa: "教授は改革への急進的なアプローチを支持した。",
    examples: [
      { en: "The professor espoused a radical approach to reform.", ja: "教授は改革への急進的なアプローチを支持した。", context: "学術" },
      { en: "Many activists espouse nonviolent methods of protest.", ja: "多くの活動家が非暴力の抗議手段を支持する。", context: "社会" },
      { en: "The party espouses equal rights for all citizens.", ja: "その政党は全市民の平等な権利を支持する。", context: "政治" },
    ],
    difficulty: 7, category: "society", categories: ["society","communication"], frequencyRank: 5, source: "original",
  },
  {
    id: 48417, word: "impede", meaning: "妨げる", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Bureaucratic red tape can impede economic growth significantly.", exampleJa: "官僚的な手続きは経済成長を著しく妨げうる。",
    examples: [
      { en: "Bureaucratic red tape can impede economic growth significantly.", ja: "官僚的な手続きは経済成長を著しく妨げうる。", context: "経済" },
      { en: "Poor infrastructure impedes relief efforts after disasters.", ja: "貧弱なインフラが災害後の救援活動を妨げる。", context: "社会" },
      { en: "Language barriers can impede international collaboration.", ja: "言語の壁は国際的な協力を妨げうる。", context: "グローバル" },
    ],
    difficulty: 7, category: "society", categories: ["society"], frequencyRank: 5, source: "original",
  },

  // ===== 放棄グループ (abdicate, cede, forfeit) =====
  {
    id: 48418, word: "abdicate", meaning: "退位する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The emperor abdicated the throne in favor of reform.", exampleJa: "皇帝は改革のために退位した。",
    examples: [
      { en: "The emperor abdicated the throne in favor of reform.", ja: "皇帝は改革のために退位した。", context: "歴史" },
      { en: "Leaders who abdicate responsibility damage public trust.", ja: "責任を放棄する指導者は公共の信頼を損なう。", context: "政治" },
      { en: "The king abdicated after decades of unstable rule.", ja: "王は数十年の不安定な統治の後に退位した。", context: "歴史" },
    ],
    difficulty: 7, category: "society", categories: ["society"], frequencyRank: 5, source: "original",
  },
  {
    id: 48419, word: "cede", meaning: "譲渡する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The defeated nation was forced to cede territory.", exampleJa: "敗戦国は領土を譲渡することを強いられた。",
    examples: [
      { en: "The defeated nation was forced to cede territory.", ja: "敗戦国は領土を譲渡することを強いられた。", context: "歴史" },
      { en: "The company ceded market share to aggressive competitors.", ja: "会社は攻勢をかける競合にシェアを譲渡した。", context: "ビジネス" },
      { en: "Governments rarely cede power without external pressure.", ja: "政府は外圧なしに権力を譲渡することはまれだ。", context: "政治" },
    ],
    difficulty: 7, category: "society", categories: ["society"], frequencyRank: 5, source: "original",
  },
  {
    id: 48420, word: "forfeit", meaning: "喪失する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "Players who cheat forfeit their right to compete.", exampleJa: "不正をする選手は競技する権利を喪失する。",
    examples: [
      { en: "Players who cheat forfeit their right to compete.", ja: "不正をする選手は競技する権利を喪失する。", context: "スポーツ" },
      { en: "Late payments may cause tenants to forfeit deposits.", ja: "支払い遅延で入居者は敷金を喪失する場合がある。", context: "不動産" },
      { en: "The team forfeited the match due to insufficient players.", ja: "チームは選手不足で試合を喪失した。", context: "スポーツ" },
    ],
    difficulty: 7, category: "society", categories: ["society","sports"], frequencyRank: 5, source: "original",
  },

  // ===== 精査グループ (peruse, survey, dissect) =====
  {
    id: 48421, word: "peruse", meaning: "精読する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The lawyer perused the contract before signing it.", exampleJa: "弁護士は署名する前に契約書を精読した。",
    examples: [
      { en: "The lawyer perused the contract before signing it.", ja: "弁護士は署名する前に契約書を精読した。", context: "法律" },
      { en: "She perused the menu carefully at the restaurant.", ja: "彼女はレストランでメニューを念入りに精読した。", context: "日常" },
      { en: "Editors peruse manuscripts for errors before publication.", ja: "編集者は出版前に原稿を精読して誤りを探す。", context: "出版" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
  {
    id: 48422, word: "survey", meaning: "概観する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The professor surveyed recent developments in the field.", exampleJa: "教授はその分野の最近の動向を概観した。",
    examples: [
      { en: "The professor surveyed recent developments in the field.", ja: "教授はその分野の最近の動向を概観した。", context: "学術" },
      { en: "Engineers surveyed the land before construction began.", ja: "技術者たちは建設前に土地を概観した。", context: "工学" },
      { en: "Analysts surveyed market trends across five continents.", ja: "アナリストは5大陸の市場動向を概観した。", context: "ビジネス" },
    ],
    difficulty: 7, category: "academic", categories: ["academic","business"], frequencyRank: 5, source: "original",
  },
  {
    id: 48423, word: "dissect", meaning: "詳細に分析する", partOfSpeech: "verb",
    course: "eiken", stage: "1",
    example: "The panel dissected every aspect of the proposed plan.", exampleJa: "委員会は提案された計画のあらゆる側面を分析した。",
    examples: [
      { en: "The panel dissected every aspect of the proposed plan.", ja: "委員会は提案された計画のあらゆる側面を分析した。", context: "ビジネス" },
      { en: "Students dissected the poem's themes and symbolism.", ja: "学生たちはその詩の主題と象徴を詳細に分析した。", context: "教育" },
      { en: "Commentators dissected the election results on television.", ja: "評論家たちはテレビで選挙結果を詳細に分析した。", context: "メディア" },
    ],
    difficulty: 7, category: "academic", categories: ["academic"], frequencyRank: 5, source: "original",
  },
];
