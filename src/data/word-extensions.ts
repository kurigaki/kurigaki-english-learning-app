/**
 * 単語拡張データ
 *
 * 単語詳細画面の「コアイメージ」「使い方」「類義語との違い」「英英定義」「語源」
 * セクションに表示するコンテンツを管理する。
 * 単語データ本体（words/）とは分離し、ID をキーとした Map で管理する。
 */

import type { WordExtension } from "@/types";

export const wordExtensions: Map<number, WordExtension> = new Map([
  // ── TOEIC 500 ──────────────────────────────────────────────────────────────

  // appointment (30001)
  [
    30001,
    {
      coreImage:
        "「特定の時間・場所で誰かと会う」という約束を取り決めた状態がコアイメージ。医師の診察予約や会議予約など、公式・ビジネス的なニュアンスがある。",
      usage:
        "「make an appointment（予約を取る）」「have an appointment（予約がある）」「cancel an appointment（予約をキャンセルする）」の形でよく使われる。日本語の「アポ」はこの単語から。",
      synonymDifference:
        "appointment vs reservation: appointment は主に人との面会（医師・美容師・弁護士など）の予約。reservation は席・部屋・テーブルなど場所や資源の予約に使う。例：doctor's appointment（医師の予約）/ hotel reservation（ホテルの予約）",
      englishDefinition:
        "An arrangement to meet someone at a particular time and place, especially for a professional or official purpose.",
      etymology:
        "15世紀フランス語 appointement（合意・取り決め）から。appoint（指定する）＋ -ment（名詞化）。",
    },
  ],
  // confirm (30002)
  [
    30002,
    {
      coreImage:
        "すでにある情報・約束・事実を「はっきり確かめる・確認する」行為がコアイメージ。疑いを払拭し、確実にする。",
      usage:
        "「confirm a reservation（予約を確認する）」「confirm that...（〜であることを確認する）」「Please confirm by email.（メールで確認してください）」のように使う。",
      synonymDifference:
        "confirm vs check: confirm は正しさを公式に認める・裏付けるニュアンス。check はただ調べるという軽いニュアンス。「confirm your booking」は予約を正式に確定させること、「check your booking」は予約内容を見ること。",
      englishDefinition:
        "To state or show that something is definitely true or correct; to make an arrangement or appointment certain.",
      etymology:
        "ラテン語 confirmare（強固にする）から。con-（完全に）＋ firmare（強固にする・firm と同語源）。",
    },
  ],
  // department (30003)
  [
    30003,
    {
      coreImage:
        "「組織や機能を分割した一区画・部門」がコアイメージ。会社の部署（営業部・開発部など）や、デパートの売り場（食品売り場など）を指す。",
      usage:
        "「sales department（営業部）」「IT department（IT部門）」「department store（デパート）」など。\"Which department are you in?\"（どちらの部署ですか？）はビジネスでよく使う表現。",
      synonymDifference:
        "department vs division: department は比較的小さな機能単位（人事部・経理部など）に使う。division はより大きな事業部門（国際事業部・消費者事業部など）に使われることが多い。",
      englishDefinition:
        "A section of a large organization or building, such as a government, business, or store.",
      etymology:
        "ラテン語 departire（分ける）から。de-（離れて）＋ partire（分ける・part と同語源）。フランス語 département を経て英語に入った。",
    },
  ],
  // employee (30004)
  [
    30004,
    {
      coreImage:
        "「他者（employer=雇用主）に雇われて働く人」がコアイメージ。雇用契約のある会社員・従業員を指す正式な語。",
      usage:
        "「full-time employee（正社員）」「part-time employee（パート社員）」「300 employees（300名の従業員）」のように使う。複数形 employees が多く使われる。",
      synonymDifference:
        "employee vs worker vs staff: employee は雇用契約のある人を指す正式な語。worker は仕事をする人全般（フリーランス含む）。staff は組織のスタッフ全体を集合的に指す不可算名詞として使われることが多い（the staff is / staff are）。",
      englishDefinition:
        "A person who is paid to work for a company or organization.",
      etymology:
        "employ（雇う）＋ -ee（される側の人）。フランス語 employé から。-ee は法的・正式な文書でよく使われる接尾辞（trainee, interviewee など）。",
    },
  ],
  // invoice (30005)
  [
    30005,
    {
      coreImage:
        "「商品・サービスの提供後、代金を請求するための正式な書類」がコアイメージ。金額・品目・支払条件などが記載されたビジネス文書。",
      usage:
        "「issue/send an invoice（請求書を発行する）」「pay an invoice（請求書を支払う）」「invoice number（請求書番号）」の形で使う。",
      synonymDifference:
        "invoice vs bill vs receipt: invoice はビジネス間（B2B）の正式な請求書。bill は一般的な請求書（電気代・レストランの勘定など）。receipt は支払い完了後の領収書。",
      englishDefinition:
        "A document sent by a seller to a buyer that lists goods or services provided and the amount of money owed.",
      etymology:
        "フランス語 envois（送付品）の複数形から。en-（中に）＋ voie（道・方法）が語源。16世紀から商業用語として使われてきた。",
    },
  ],
  // manage (30006)
  [
    30006,
    {
      coreImage:
        "困難な状況や複数のことをうまくコントロールして「なんとか切り盛りする」イメージ。人やリソースを管理する場合も、「何とかやり遂げる」場合にも使える。",
      usage:
        "「manage to do（〜をなんとかやり遂げる）」「manage a team（チームを管理する）」「manage stress（ストレスをうまく処理する）」のように使う。",
      synonymDifference:
        "manage vs control: manage は人・状況・リソースを適切にコーディネートするニュアンス。control はより強制力を持って支配・制御するニュアンス。「manage people」はリーダーシップ的、「control people」は命令的に聞こえる。",
      englishDefinition:
        "To be in charge of an organization or group of people; to succeed in doing something despite difficulties.",
      etymology:
        "イタリア語 maneggiare（手で扱う・馬を操る）から。ラテン語 manus（手）が語源。",
    },
  ],
  // opportunity (30007)
  [
    30007,
    {
      coreImage:
        "「何かを達成するための好ましい状況・チャンス」がコアイメージ。その時に行動しなければ失われる、一時的な好機。",
      usage:
        "「have an opportunity to do（〜する機会がある）」「take the opportunity（機会を活かす）」「miss an opportunity（機会を逃す）」のように使う。",
      synonymDifference:
        "opportunity vs chance: 両語とも「機会」の意味だが、opportunity はより計画的・ポジティブなチャンスに使われる傾向がある。chance は偶然性・可能性（40% chance）の意味でも使われる。ビジネスでは opportunity がより格調高い。",
      englishDefinition:
        "A time or situation that makes it possible for you to do something you want to do.",
      etymology:
        "ラテン語 opportunitas から。ob portum venire（港に向かって吹く風）が語源で、「帆に向かって吹く好機の風」というイメージ。",
    },
  ],
  // purchase (30008)
  [
    30008,
    {
      coreImage:
        "「代金を支払って物やサービスを手に入れる」行為がコアイメージ。buy よりフォーマルなビジネス・法律用語。",
      usage:
        "名詞「make a purchase（購入する）」「online purchase（オンライン購入）」、動詞「purchase a product（製品を購入する）」と両用。ビジネス文書では buy の代わりに使われる。",
      synonymDifference:
        "purchase vs buy: 意味はほぼ同じだが、purchase はより正式・書面的なニュアンス。\"buy a coffee\" は自然だが \"purchase a coffee\" は大げさに聞こえる。ビジネス・法律文書では purchase が標準的。",
      englishDefinition:
        "To buy something, especially something significant; something that has been bought.",
      etymology:
        "古フランス語 purchacier（追求する・手に入れようとする）から。ラテン語 pro-（前に）＋ capere（捕まえる）の意。",
    },
  ],
  // reservation (30009)
  [
    30009,
    {
      coreImage:
        "「席・部屋・テーブルなど場所や資源を、特定の時間のために確保する」ことがコアイメージ。資源の「確保・予約」に焦点を当てた語。",
      usage:
        "「make a reservation（予約する）」「have a reservation（予約がある）」「reservation under the name of...（...名義の予約）」のように使う。",
      synonymDifference:
        "reservation vs appointment: reservation はホテル・レストラン・航空など「場所・席・資源」の予約。appointment は医師・弁護士など「人との面会」の予約。日本語ではどちらも「予約」だが英語では使い分ける。",
      englishDefinition:
        "An arrangement to have something such as a seat, room, or table kept for your use at a future time.",
      etymology:
        "ラテン語 reservare（取っておく）から。re-（後のために）＋ servare（保存する）。フランス語 réservation を経て英語に。",
    },
  ],
  // schedule (30010)
  [
    30010,
    {
      coreImage:
        "「何かを行う時間・順序を事前に計画したリスト」がコアイメージ。予定表・時刻表・工程表など、時間軸に沿った計画を表す。",
      usage:
        "名詞「I have a busy schedule.（忙しいスケジュールだ）」、動詞「The meeting is scheduled for Monday.（会議は月曜に予定されている）」と両方で使える。",
      synonymDifference:
        "schedule vs timetable: schedule は個人や組織の予定全般に使う広い語。timetable は電車・授業など固定した時間割に使うことが多い。",
      englishDefinition:
        "A plan that lists the times when activities or events will happen; to arrange for something to happen at a particular time.",
      etymology:
        "ラテン語 schedula（小さなメモ・紙片）から。中世英語を経て現代の「予定表」の意味に発展。",
    },
  ],
  // apply (30011)
  [
    30011,
    {
      coreImage:
        "「ある目的のために自分を差し出す・当てはめる」のがコアイメージ。job apply なら自己を「差し出す」、rule を apply するなら規則を「当てはめる」。",
      usage:
        "「apply for a job（仕事に応募する）」「apply to a school（学校に出願する）」「apply a discount（割引を適用する）」「This rule applies to all.（この規則は全員に適用される）」のように多用途。",
      synonymDifference:
        "apply for vs apply to: apply for は何か（職・奨学金）を求めて申し込む意。apply to は対象（学校・組織・規則）に当てはめる意。「apply for a visa to work in Japan」のように組み合わせることも。",
      englishDefinition:
        "To make a formal request for something; to use or put something into effect in a situation.",
      etymology:
        "ラテン語 applicare（くっつける）から。ad-（〜に）＋ plicare（折る・接触させる）。もともと「近づける・当てる」の意。",
    },
  ],
  // attach (30012)
  [
    30012,
    {
      coreImage:
        "「あるものに別のものを固定・くっつける」のがコアイメージ。メールへのファイル添付も、書類をクリップ留めするのも、感情的なつながりも「attach」。",
      usage:
        "「attach a file（ファイルを添付する）」「Please find the attached document.（添付書類をご参照ください）」は最頻出表現。「be attached to 〜（〜に愛着がある）」という感情的な使い方も。",
      synonymDifference:
        "attach vs enclose: attach はデジタル添付（メールファイル）や物理的固定に使う広い語。enclose は封筒・パッケージなどに「同封する」場合の正式な表現。ビジネスレターでは \"I enclose my CV.\" と使う。",
      englishDefinition:
        "To fasten or connect one thing to another; to add a file to an email or document.",
      etymology:
        "古フランス語 atachier（留める・拘束する）から。a-（〜に）＋ tachier（くぎで留める）。ゲルマン語の「杭・くぎ」に由来。",
    },
  ],
  // avoid (30013)
  [
    30013,
    {
      coreImage:
        "「不都合なものや状況から意図的に距離を置く、回避する」のがコアイメージ。物理的な回避も、状況・話題の回避も包む。",
      usage:
        "「avoid + 動名詞（avoid doing〜）」が基本。「avoid making mistakes（ミスを避ける）」「avoid the rush hour（ラッシュアワーを避ける）」「avoid the topic（その話題を避ける）」など。",
      synonymDifference:
        "avoid vs escape vs evade: avoid は事前に意図的に近づかない。escape は既に迫ったものから逃れる。evade は不正・ずる賢い手段で回避するニュアンス（evade taxes = 脱税）。",
      englishDefinition:
        "To stay away from someone or something, or to prevent something from happening.",
      etymology:
        "古フランス語 esvuidier（空にする・退く）から。ラテン語 ex-（外に）＋ viduare（空にする）が語源。",
    },
  ],
  // budget (30014)
  [
    30014,
    {
      coreImage:
        "「特定の期間・目的のために割り当てられた金額の計画」がコアイメージ。お金の使い方を事前に計画した「財布の中身」。",
      usage:
        "名詞「annual budget（年間予算）」「tight budget（厳しい予算）」、動詞「budget for travel expenses（旅費を予算に組む）」。「within budget（予算内で）」「over budget（予算超過）」もよく使う。",
      synonymDifference:
        "budget vs cost vs expense: budget は計画された許容金額。cost は実際にかかる金額。expense は出費・経費（business expense = 経費）。",
      englishDefinition:
        "A plan for how to spend money over a period of time; the amount of money available for spending.",
      etymology:
        "古フランス語 bougette（小さな袋）の縮小形から。ラテン語 bulga（皮の袋）が語源。かつてイギリス大蔵大臣が予算書類を入れた「袋」から転じた。",
    },
  ],
  // cancel (30015)
  [
    30015,
    {
      coreImage:
        "「決まっていた予定・契約・注文を取り消す」のがコアイメージ。効力をなくして「無効にする」行為。",
      usage:
        "「cancel a meeting（会議をキャンセルする）」「cancel an order（注文をキャンセルする）」「cancel a subscription（定期購読を解約する）」。イギリス英語では cancelled、アメリカ英語では canceled とスペルが異なる。",
      synonymDifference:
        "cancel vs postpone vs reschedule: cancel は完全に取りやめること。postpone は後日に延期すること（日時未定）。reschedule は新しい日時に変更すること。",
      englishDefinition:
        "To decide that something that was planned or arranged will not happen.",
      etymology:
        "ラテン語 cancellare（格子状に引く・横線で消す）から。法律文書に×印を付けて「無効」にすることから。",
    },
  ],
  // deliver (30016)
  [
    30016,
    {
      coreImage:
        "「ある場所から別の場所へ物・サービス・情報を届ける」のがコアイメージ。物理的な配達だけでなく、プレゼンで「内容を伝える」意味でも使う。",
      usage:
        "「deliver a package（荷物を配達する）」「deliver a speech（スピーチをする）」「deliver results（結果を出す）」「delivery time（配達時間）」。",
      synonymDifference:
        "deliver vs ship vs send: deliver は最終的に目的地に届けること。ship は船便・運送便で送ること。send は送る動作に焦点（メール・手紙にも使う）。",
      englishDefinition:
        "To take goods, letters, or packages to a person or place; to speak or present something formally.",
      etymology:
        "ラテン語 deliberare（解放する・手放す）から。de-（完全に）＋ liberare（自由にする・liber と同語源）。「手から解放して渡す」のが原義。",
    },
  ],
  // discount (30017)
  [
    30017,
    {
      coreImage:
        "「本来の価格から差し引かれた金額」がコアイメージ。値引きによってより安く購入できる状態。",
      usage:
        "「get a discount（割引を受ける）」「offer a 10% discount（10%割引を提供する）」「discount price（割引価格）」「student discount（学生割引）」のように使う。",
      synonymDifference:
        "discount vs sale vs reduction: discount は特定の価格から引く率・額に焦点（10% discount）。sale はセール全体のイベント的な意味合いが強い（on sale = セール中）。reduction は価格の引き下げ全般。",
      englishDefinition:
        "A reduction in the usual price of something; to reduce the price of something.",
      etymology:
        "中世ラテン語 discomputare（差し引いて計算する）から。dis-（分離）＋ computare（計算する・compute と同語源）。",
    },
  ],
  // extend (30018)
  [
    30018,
    {
      coreImage:
        "「時間・空間・範囲を引き伸ばす・広げる」のがコアイメージ。期限の延長も、手を「伸ばす」のも、サービスを「拡張する」のも同じ語。",
      usage:
        "「extend the deadline（締め切りを延長する）」「extend a contract（契約を延長する）」「extend our services（サービスを拡充する）」「extend a hand（手を差し伸べる）」。",
      synonymDifference:
        "extend vs prolong vs lengthen: extend は時間・空間・範囲を広げる汎用語。prolong は長すぎるネガティブなニュアンスがある（prolong suffering = 苦しみを長引かせる）。lengthen は物の長さを長くする意味が強い。",
      englishDefinition:
        "To make something longer or larger; to increase the period of time during which something continues.",
      etymology:
        "ラテン語 extendere（外に伸ばす）から。ex-（外に）＋ tendere（伸ばす・tension と同語源）。",
    },
  ],
  // payment (30019)
  [
    30019,
    {
      coreImage:
        "「お金を相手に渡す行為・その金額」がコアイメージ。pay（払う）の名詞形で、支払いの動作・その支払われた金額の両方を指す。",
      usage:
        "「make a payment（支払いをする）」「payment method（支払い方法）」「monthly payment（月払い）」「down payment（頭金）」「payment due（支払い期限）」のように使う。",
      synonymDifference:
        "payment vs fee vs charge: payment は支払い行為・金額全般。fee は専門家（医師・弁護士）への報酬、サービス料、入会費など。charge は請求される金額・コスト全般（service charge = サービス料）。",
      englishDefinition:
        "An amount of money paid; the act of paying money for something.",
      etymology:
        "pay（払う）＋ -ment（名詞化接尾辞）。pay はラテン語 pacare（落ち着かせる・借りを返して満足させる）から。",
    },
  ],
  // receipt (30020)
  [
    30020,
    {
      coreImage:
        "「支払い完了の証明として受け取る書類」がコアイメージ。\"received\"（受け取った）ことを示す文書。",
      usage:
        "「keep/save the receipt（領収書を保存する）」「issue a receipt（領収書を発行する）」「expense receipt（経費の領収書）」。発音注意: p は黙字で「レシート」と読む。",
      synonymDifference:
        "receipt vs invoice: receipt は支払い完了後に発行される「領収書」。invoice は支払いを求める「請求書」。レストランなら食後の bill が invoice 的で、払った後の receipt が領収書。",
      englishDefinition:
        "A piece of paper that you receive when you pay for something, showing what you have paid for.",
      etymology:
        "ラテン語 recepta（受け取られたもの）から。re-（元に）＋ capere（取る）。p の黙字は16世紀ラテン語へ「遡った」スペルの影響。",
    },
  ],

  // ── junior ──────────────────────────────────────────────────────────────────

  // happy (10008)
  [
    10008,
    {
      coreImage:
        "望んでいた状態が実現されたことへの満足感・喜びがコアイメージ。外部の出来事によってもたらされる感情。",
      usage:
        "「I'm happy to help.（喜んでお手伝いします）」「happy with the result（結果に満足している）」「happy birthday（お誕生日おめでとう）」と幅広く使える。",
      synonymDifference:
        "happy vs glad vs pleased: happy は全般的な幸福感・喜び。glad は特定の出来事を「よかった」と思う一時的な安堵・喜び（I'm glad it worked out）。pleased はやや格式ばった言い方で、満足・喜ばしい（I'm pleased to meet you）。",
      englishDefinition:
        "Feeling or showing pleasure, satisfaction, or contentment.",
      etymology:
        "中期英語 hap（幸運・偶然の出来事）から派生した happy。もともと「幸運に恵まれた」という意味だった。",
    },
  ],
  // make (10012)
  [
    10012,
    {
      coreImage:
        "素材や要素を組み合わせて「新しいものを生み出す・存在させる」というのがコアイメージ。料理・製造・原因・強制など非常に広い意味を持つ。",
      usage:
        "「make a cake（ケーキを作る）」「make a decision（決断する）」「make an effort（努力する）」「make someone happy（誰かを幸せにする）」など複合語が非常に多い。",
      synonymDifference:
        "make vs create: make は日常的・具体的なものを作る場合に広く使う。create はより独創的・芸術的・大規模なものを生み出すニュアンス。「make a sandwich」は自然だが「create a sandwich」は大げさに聞こえる。",
      englishDefinition:
        "To produce or create something; to cause something to happen; to force someone to do something.",
      etymology:
        "古英語 macian（作る・建てる）から。ゲルマン語族共通の語で、ドイツ語 machen と同語源。",
    },
  ],
]);
