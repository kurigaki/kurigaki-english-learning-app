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

  // application (30021)
  [
    30021,
    {
      coreImage:
        "「特定の目的のために正式に申し込む行為・書類」がコアイメージ。就職・入学・許可証など、公式な手続きに使う。",
      usage:
        "「submit an application（申請書を提出する）」「job application（求人応募）」「application form（申請フォーム）」。スマホアプリは app と省略するのが一般的。",
      synonymDifference:
        "application vs request: application は書類や手続きを伴う公式な申し込み。request はより口頭的・非公式な依頼（Can I make a request?）。",
      englishDefinition:
        "A formal written request to be considered for a job, course, or permission; a program designed for a specific purpose on a computer or phone.",
      etymology:
        "ラテン語 applicatio（近づけること）から。apply（当てる・申し込む）＋ -tion（名詞化）。",
    },
  ],
  // available (30022)
  [
    30022,
    {
      coreImage:
        "「使える・利用できる・手に入る状態にある」がコアイメージ。物・人・時間・席など、アクセス可能な状態を表す。",
      usage:
        "「Are you available tomorrow?（明日空いていますか？）」「The product is available online.（製品はオンラインで購入可能です）」「available for download（ダウンロード可能）」のように使う。",
      synonymDifference:
        "available vs accessible: available は「手に入る・使える」状態全般。accessible は「物理的・技術的に近づける」ニュアンスが強い（accessible to all = 誰でも利用できる）。",
      englishDefinition:
        "Able to be used or obtained; free to do something or meet someone.",
      etymology:
        "中世ラテン語 availabilis から。avail（役立つ）＋ -able（可能の接尾辞）。",
    },
  ],
  // benefit (30023)
  [
    30023,
    {
      coreImage:
        "「良い影響・恩恵・利得」がコアイメージ。誰かや何かによってもたらされるプラスの効果や、職場での福利厚生など。",
      usage:
        "「employee benefits（従業員の福利厚生）」「benefit from（〜から恩恵を受ける）」「for the benefit of（〜のために）」「health benefits（健康保険）」のように使う。",
      synonymDifference:
        "benefit vs advantage vs merit: benefit は受け取る良い影響・恩恵。advantage は競争上の有利な点。merit は本質的な価値・長所（on its own merits）。",
      englishDefinition:
        "An advantage or profit gained from something; a payment or service provided by an employer, government, or insurance company.",
      etymology:
        "ラテン語 benefactum（善行・良いこと）から。bene-（良く）＋ factum（行われたこと）。",
    },
  ],
  // budget (30024)
  [
    30024,
    {
      coreImage:
        "「特定の目的のために事前に割り当てられたお金の計画と管理」がコアイメージ。限られた資金をどう使うかの枠組み。",
      usage:
        "「stay within budget（予算内に収める）」「go over budget（予算超過する）」「budget meeting（予算会議）」「budget-friendly（手頃な価格の）」のように使う。",
      synonymDifference:
        "budget vs estimate: budget は計画として割り当てた使用可能な金額の上限。estimate は実際にかかりそうな金額の予測。",
      englishDefinition:
        "A plan for how to spend money over a period of time; the total amount of money available for a purpose.",
      etymology:
        "古フランス語 bougette（小さな袋）の縮小形から。イギリス議会で財務大臣が予算書を入れた皮袋を開けたことが語源。",
    },
  ],
  // cancel (30025)
  [
    30025,
    {
      coreImage:
        "「すでに決まっていた予定・契約・注文などを取り消して無効にする」がコアイメージ。",
      usage:
        "「cancel a subscription（定期購読を解約する）」「cancel a flight（フライトをキャンセルする）」「The event was canceled due to rain.（雨天で中止になった）」のように使う。",
      synonymDifference:
        "cancel vs postpone vs abort: cancel は完全に取りやめること。postpone は将来に延期。abort はすでに始まったプロセスを途中で中断すること。",
      englishDefinition:
        "To decide that a planned or arranged event will not happen; to end an agreement or subscription.",
      etymology:
        "ラテン語 cancellare（格子状の線を引く）から。法律文書に×印や斜線を引いて「無効」にする行為から転じた。",
    },
  ],
  // colleague (30026)
  [
    30026,
    {
      coreImage:
        "「同じ職場・組織で働く仲間」がコアイメージ。特に同等の立場で働く同僚を指すフォーマルな語。",
      usage:
        "「my colleague（私の同僚）」「a colleague of mine（私の同僚の一人）」のように使う。複数形 colleagues が多用される。日本語の「コリーグ」はあまり使われない。",
      synonymDifference:
        "colleague vs coworker vs associate: colleague は専門職・プロフェッショナルな文脈で同等の立場の同僚。coworker はより一般的な「一緒に働く人」。associate はパートナーや共同経営者的なニュアンスも含む。",
      englishDefinition:
        "A person you work with, especially in a professional or skilled job.",
      etymology:
        "ラテン語 collega（共に選ばれた人）から。col-（共に）＋ legare（選ぶ・派遣する）。",
    },
  ],
  // complain (30027)
  [
    30027,
    {
      coreImage:
        "「不満・不快な状況を言葉で表現する、苦情を言う」のがコアイメージ。改善を求めて不満を訴える行為。",
      usage:
        "「complain about（〜について不満を言う）」「complain to（〜に苦情を申し立てる）」「customer complaint（顧客の苦情）」「file a complaint（苦情を申し立てる）」のように使う。",
      synonymDifference:
        "complain vs protest vs grumble: complain は公式・非公式に不満を述べる汎用語。protest はより強い反対・抗議行動。grumble はぶつぶつと小さな不満をもらす、より非公式・消極的な表現。",
      englishDefinition:
        "To say that you are dissatisfied or unhappy about something; to state that something is wrong.",
      etymology:
        "古フランス語 complaindre（嘆く）から。ラテン語 com-（完全に）＋ plangere（胸を打つ・嘆く）。",
    },
  ],
  // construction (30028)
  [
    30028,
    {
      coreImage:
        "「材料・部品を組み合わせて建物や構造物を作り上げる過程」がコアイメージ。建築工事そのものと、その結果生まれた構造物の両方を指す。",
      usage:
        "「under construction（建設中・工事中）」「construction site（工事現場）」「construction company（建設会社）」「road construction（道路工事）」のように使う。",
      synonymDifference:
        "construction vs building vs structure: construction は建設のプロセス・工事。building は完成した建物（名詞）または建てる行為（動詞）。structure は建造物・構造物全般を指す広い語。",
      englishDefinition:
        "The process or work of building or making something, especially buildings, roads, or bridges.",
      etymology:
        "ラテン語 constructio（積み上げること）から。con-（共に）＋ struere（積み重ねる・structure と同語源）。",
    },
  ],
  // contact (30029)
  [
    30029,
    {
      coreImage:
        "「人と人、または物と物が触れる・つながる」のがコアイメージ。物理的な接触も、コミュニケーションの接続も「contact」。",
      usage:
        "「contact someone（誰かに連絡する）」「Please contact us at...（...にお問い合わせください）」「in contact with（〜と連絡を取っている）」「contact information（連絡先情報）」のように使う。",
      synonymDifference:
        "contact vs reach vs touch: contact はメールや電話などで連絡を取ること。reach は相手に届く・通じることに焦点（I couldn't reach him）。touch はより感情的・比喩的なつながり（stay in touch = 連絡を保つ）。",
      englishDefinition:
        "To communicate with someone; the act of meeting or communicating with someone or touching something.",
      etymology:
        "ラテン語 contactus（触ること）から。con-（共に）＋ tangere（触れる・tangent と同語源）。",
    },
  ],
  // contract (30030)
  [
    30030,
    {
      coreImage:
        "「二者以上が義務・権利を法的に取り決めた文書・合意」がコアイメージ。「contract = 縮める」という語源から、条件を絞り込んで合意した文書。",
      usage:
        "「sign a contract（契約書にサインする）」「contract terms（契約条件）」「breach of contract（契約違反）」「contract worker（契約社員）」のように使う。",
      synonymDifference:
        "contract vs agreement vs deal: contract は法的拘束力のある正式な書面。agreement はより広い合意（口頭でも可）。deal はインフォーマルな取引・商談（close a deal = 商談をまとめる）。",
      englishDefinition:
        "A legal written agreement between two or more people or organizations; to make or become smaller.",
      etymology:
        "ラテン語 contractus（引き寄せた・縮めた）から。con-（共に）＋ trahere（引く・tract と同語源）。「条件を絞り込んで合意した」のが原義。",
    },
  ],

  // convenient (30031)
  [
    30031,
    {
      coreImage:
        "「手間なく使いやすい・都合に合う」のがコアイメージ。場所・時間・方法など、使う人の状況にフィットした「楽さ」を表す。",
      usage:
        "「Is this time convenient for you?（この時間でよろしいですか？）」「a convenient location（便利な立地）」「convenient store（コンビニ）」のように使う。",
      synonymDifference:
        "convenient vs handy: convenient は状況・時間・場所などが「ちょうど都合がいい」全般。handy は手元にある・すぐ使える・扱いやすいという実用的な便利さ（a handy tool）。",
      englishDefinition:
        "Easy to use or access, or suitable for a particular purpose; fitting in with someone's plans.",
      etymology:
        "ラテン語 convenire（集まる・一致する）から。con-（共に）＋ venire（来る）。人の都合と状況が「合う」のが原義。",
    },
  ],
  // customer (30032)
  [
    30032,
    {
      coreImage:
        "「商品やサービスを購入する人・お客様」がコアイメージ。ビジネスにおける最重要の外部ステークホルダー。",
      usage:
        "「customer service（顧客サービス）」「customer satisfaction（顧客満足度）」「attract customers（顧客を獲得する）」「regular customer（常連客）」のように使う。",
      synonymDifference:
        "customer vs client vs consumer: customer は商品・サービスを買う人（店の顧客）。client は弁護士・広告代理店など専門家サービスを継続的に使う顧客。consumer は最終的に製品を消費する人（市場調査・統計的な意味合い）。",
      englishDefinition:
        "A person who buys goods or services from a business.",
      etymology:
        "中世英語 custumer（習慣的に取引する人）から。custom（習慣・慣例）＋ -er（人）。",
    },
  ],
  // deadline (30033)
  [
    30033,
    {
      coreImage:
        "「これ以上遅らせてはいけない最終期限」がコアイメージ。もともと「これを越えたら死ぬ線（dead line）」という軍事用語から来た。",
      usage:
        "「meet a deadline（期限を守る）」「miss a deadline（期限を守れない）」「set a deadline（期限を設ける）」「deadline is approaching（締め切りが近い）」のように使う。",
      synonymDifference:
        "deadline vs due date: deadline は絶対に守るべき最終期限（厳格なニュアンス）。due date はより一般的な「提出・支払い予定日」（due date of the invoice）。",
      englishDefinition:
        "A date or time before which something must be done or completed.",
      etymology:
        "19世紀の印刷業界で、印刷機の「印刷不可能なライン（dead line）」から。転じて「これ以上遅れると無効になるライン」。",
    },
  ],
  // deliver (30034)
  [
    30034,
    {
      coreImage:
        "「目的地まで物・情報・結果を届け切る」のがコアイメージ。配達だけでなく、期待された成果を「出す」意味でも多用する。",
      usage:
        "「deliver on time（定時に納品する）」「deliver a presentation（プレゼンを行う）」「deliver results（結果を出す）」「delivery date（納品日）」のように使う。",
      synonymDifference:
        "deliver vs supply: deliver は最終目的地まで届ける完結的な動作。supply は継続的に供給・補充するニュアンス（supply chain = サプライチェーン）。",
      englishDefinition:
        "To take goods or information to a place; to produce or provide something that was expected.",
      etymology:
        "ラテン語 deliberare（解放する）から。de-（完全に）＋ liberare（自由にする）。「手放して相手に渡す」のが原義。",
    },
  ],
  // department (30035)
  [
    30035,
    {
      coreImage:
        "「大きな組織の中で機能や役割で区切られた一部門」がコアイメージ。縦割り組織の「箱」。",
      usage:
        "「HR department（人事部）」「accounting department（経理部）」「department manager（部長）」「department store（デパート：多くの売り場に分かれた店）」のように使う。",
      synonymDifference:
        "department vs section vs division: department は機能単位の部署。section は部署の下の「課・係」などのより小さな単位。division はより大きな事業部門。",
      englishDefinition:
        "A part of an organization, such as a school, business, or government, that deals with a particular area of work.",
      etymology:
        "フランス語 département から。ラテン語 de-（分離）＋ partire（分ける）。",
    },
  ],
  // deposit (30036)
  [
    30036,
    {
      coreImage:
        "「後で使うために、または担保として預けておく金や物」がコアイメージ。銀行預金・敷金・手付金などすべてを包む「預け置き」の概念。",
      usage:
        "「make a deposit（預金する・手付金を払う）」「security deposit（保証金・敷金）」「deposit slip（預金伝票）」「on deposit（預金中）」のように使う。",
      synonymDifference:
        "deposit vs down payment: deposit はサービス保証や銀行預金など広い意味の「預け金」。down payment は不動産・車などを購入する際の「頭金（ローンの最初の支払い）」。",
      englishDefinition:
        "Money paid into a bank account; an amount of money paid as a first payment or security when renting or buying something.",
      etymology:
        "ラテン語 depositum（預けられたもの）から。de-（下に）＋ ponere（置く）。",
    },
  ],
  // discount (30037)
  [
    30037,
    {
      coreImage:
        "「正規価格から差し引かれた金額・割引」がコアイメージ。買い手にとって得になる価格減額。",
      usage:
        "「offer a discount（割引を提供する）」「volume discount（数量割引）」「at a discount（割引価格で）」「discount code（割引コード）」のように使う。",
      synonymDifference:
        "discount vs rebate vs promotion: discount は即時の価格引き下げ。rebate は購入後に一部が返金されるキャッシュバック。promotion はセールや特典を含む販促活動全般。",
      englishDefinition:
        "A reduction in the usual price of something; to reduce the price of something.",
      etymology:
        "中世ラテン語 discomputare（差し引いて計算する）から。dis-（分離）＋ computare（計算する）。",
    },
  ],
  // display (30038)
  [
    30038,
    {
      coreImage:
        "「人目に付くよう広げて見せる・表示する」のがコアイメージ。商品陳列・画面表示・感情の表現まで、「見える状態にする」行為すべて。",
      usage:
        "「on display（展示中）」「display a product（製品を陳列する）」「digital display（デジタルディスプレイ）」「display of confidence（自信の表れ）」のように使う。",
      synonymDifference:
        "display vs exhibit vs show: display は日常的に並べて見せること（shop display）。exhibit はより正式な展覧会・博覧会での展示。show は広く「見せる」行為全般。",
      englishDefinition:
        "To show something publicly for people to see; a public show of something.",
      etymology:
        "古フランス語 desplier（広げる）から。ラテン語 dis-（広く）＋ plicare（折る・pleat と同語源）。",
    },
  ],
  // document (30039)
  [
    30039,
    {
      coreImage:
        "「情報を記録・証明するための公式な書類や文書」がコアイメージ。紙の書類もデジタルファイルも含む。",
      usage:
        "「official document（公式書類）」「supporting document（添付書類）」「document everything（すべて文書化する）」「document management（文書管理）」のように使う。",
      synonymDifference:
        "document vs record vs file: document は内容・情報に焦点を当てた書類（legal document）。record は記録・データ（medical record）。file は整理・保管された書類の束やデジタルファイル。",
      englishDefinition:
        "An official piece of writing that provides information or evidence; to record something in writing.",
      etymology:
        "ラテン語 documentum（証拠・教訓）から。docere（教える・doctor と同語源）＋ -ment（名詞化）。",
    },
  ],
  // employee (30040)
  [
    30040,
    {
      coreImage:
        "「雇用契約のもと、報酬を受けて組織のために働く人」がコアイメージ。雇う側（employer）と雇われる側の関係を示す正式な語。",
      usage:
        "「full-time employee（正社員）」「part-time employee（パート）」「employee handbook（社員手帳）」「employee of the month（今月の優秀社員）」のように使う。",
      synonymDifference:
        "employee vs staff vs workforce: employee は雇用契約のある個人を指す法的・正式な語。staff は組織のスタッフ全体（不可算名詞的）。workforce は組織・産業の労働力全体（the workforce = 労働者層）。",
      englishDefinition:
        "A person who works for a company or organization and is paid to do so.",
      etymology:
        "employ（雇う）＋ -ee（される側の人を示す接尾辞）。フランス語 employé から。",
    },
  ],
  // estimate (30041)
  [
    30041,
    {
      coreImage:
        "「正確な数字は出ないが、データや経験から大体の値を判断する」のがコアイメージ。完全な情報なしに「目算を立てる」行為。",
      usage:
        "「rough estimate（概算）」「cost estimate（費用見積もり）」「I estimate it will take two days.（2日かかると見積もる）」「estimate vs actual（見積もり vs 実績）」のように使う。",
      synonymDifference:
        "estimate vs quote: estimate は不確実性を含む概算（実際の金額は変わる可能性あり）。quote（見積書）はより正式で、その金額で提供することを約束するニュアンスが強い。",
      englishDefinition:
        "An approximate calculation or judgment of a value, number, or quantity; to form an approximate judgment.",
      etymology:
        "ラテン語 aestimare（価値を評価する・判断する）から。正確な測定ではなく「判断による評価」が原義。",
    },
  ],
  // exchange (30042)
  [
    30042,
    {
      coreImage:
        "「AをBに、BをAに互いに与え合う」のがコアイメージ。物・情報・通貨など、お互いに行き来する「交換」。",
      usage:
        "「exchange ideas（意見交換する）」「currency exchange（外貨両替）」「exchange rate（為替レート）」「stock exchange（証券取引所）」「exchange program（交換留学）」のように使う。",
      synonymDifference:
        "exchange vs trade vs swap: exchange は正式・中立的な語で通貨・情報・礼儀など幅広く使う。trade は主に商業的な取引・売買。swap はより口語的で「物々交換」的なニュアンス（swap seats = 席を交換する）。",
      englishDefinition:
        "An act of giving something to someone and receiving something in return; to give something in return for something else.",
      etymology:
        "古フランス語 eschangier から。ex-（外に）＋ changer（変える）。",
    },
  ],
  // expense (30043)
  [
    30043,
    {
      coreImage:
        "「何かを達成するために支払う費用・出費」がコアイメージ。特にビジネスで「経費」として申請できる支出に多用する。",
      usage:
        "「business expense（業務経費）」「travel expense（出張費）」「expense report（経費精算書）」「at the expense of（〜を犠牲にして）」のように使う。",
      synonymDifference:
        "expense vs cost vs fee: expense は特定の活動にかかる支出・経費（複数形が多い）。cost は物・サービスの価格や代償全般。fee は専門家・サービスへの報酬（admission fee = 入場料）。",
      englishDefinition:
        "Money spent on something; the cost of something, especially in business.",
      etymology:
        "ラテン語 expensa（支払われたもの）から。ex-（外に）＋ pendere（重さを量る・払う・spend と同語源）。",
    },
  ],
  // facility (30044)
  [
    30044,
    {
      coreImage:
        "「特定の活動のために整備された設備・施設」がコアイメージ。スポーツ施設・医療施設・生産設備など、機能的に整えられた場所や機器。",
      usage:
        "「sports facility（スポーツ施設）」「manufacturing facility（製造施設）」「storage facility（保管施設）」「state-of-the-art facilities（最新鋭の設備）」のように使う。",
      synonymDifference:
        "facility vs equipment: facility は建物・場所・設備システム全体を指す。equipment は作業に使う具体的な道具・機器（office equipment = オフィス機器）。",
      englishDefinition:
        "A place, building, or equipment that is provided for a particular purpose.",
      etymology:
        "ラテン語 facilitas（容易さ）から。facilis（しやすい）＋ -ity。「何かを容易にする場所・手段」というのが原義。",
    },
  ],
  // forward (30045)
  [
    30045,
    {
      coreImage:
        "「前に・先に向かって進める、または転送する」のがコアイメージ。物理的な前進も、メールの転送も「前に送る」という共通概念。",
      usage:
        "「forward an email（メールを転送する）」「look forward to（〜を楽しみにする）」「move forward（前進する）」「forward planning（先を見越した計画）」のように使う。",
      synonymDifference:
        "forward vs send: forward は受け取ったものを他の人に「回す・転送する」。send は自分が発信する「送る」。",
      englishDefinition:
        "To send a letter, email, or goods to a new address or person; toward the front or future.",
      etymology:
        "古英語 foreweard（前向きの）から。fore-（前）＋ -ward（方向）。",
    },
  ],
  // guarantee (30046)
  [
    30046,
    {
      coreImage:
        "「責任を持って確実に実現することを約束する」のがコアイメージ。品質保証・結果保証など、約束の確実性を高める誓約。",
      usage:
        "「money-back guarantee（返金保証）」「guarantee quality（品質を保証する）」「under guarantee（保証期間中）」「I can't guarantee it.（保証はできません）」のように使う。",
      synonymDifference:
        "guarantee vs warranty: guarantee は幅広い保証（品質・結果・返金など）。warranty は商品の欠陥修理・交換に限定した「製品保証書」のことが多い（2-year warranty = 2年保証）。",
      englishDefinition:
        "A promise that something will be done or that something is true; to promise that something will happen.",
      etymology:
        "古フランス語 garantie（保護・保証）から。ゲルマン語 warrant（守る）と同語源。",
    },
  ],
  // headquarter (30047)
  [
    30047,
    {
      coreImage:
        "「組織の指揮・管理が行われる中心地・本部」がコアイメージ。複数形 headquarters（HQ）が一般的。",
      usage:
        "「company headquarters（会社の本社）」「headquartered in Tokyo（東京に本社を置く）」「HQ（本社・本部の略）」のように使う。",
      synonymDifference:
        "headquarters vs head office vs main office: headquarters は軍・組織の中枢的な本部（より格式ばった語）。head office は企業の「本社」として一般的。main office は支店・支部に対する「本拠地のオフィス」。",
      englishDefinition:
        "The main office or center of operations of a company or organization.",
      etymology:
        "軍事用語 quarter（宿営地）＋ head（主要な）。「指揮官の宿営地 → 本部」に転じた。",
    },
  ],
  // hire (30048)
  [
    30048,
    {
      coreImage:
        "「報酬を払って人や物を使用する」のがコアイメージ。人を「雇う」場合も、車を「借りる（レンタル）」場合も hire。",
      usage:
        "「hire a new employee（新しい従業員を雇う）」「hire a car（車を借りる〈英〉）」「for hire（雇用可能・貸し出し可）」のように使う。アメリカ英語では car rental の方が一般的。",
      synonymDifference:
        "hire vs employ vs recruit: hire は採用の決断・行為に焦点（We hired three people）。employ は継続的な雇用状態（She is employed by the company）。recruit は積極的に探し出して採用するプロセス全体。",
      englishDefinition:
        "To employ someone; to pay to use something for a short period of time.",
      etymology:
        "古英語 hyrian（賃金を払って雇う）から。",
    },
  ],
  // inquire (30049)
  [
    30049,
    {
      coreImage:
        "「情報を得るために尋ねる・問い合わせる」のがコアイメージ。ask より格式ばった語で、ビジネス文書・公式な問い合わせに使う。",
      usage:
        "「inquire about（〜について問い合わせる）」「inquire into（〜を調査する）」「I am writing to inquire about...（〜について問い合わせるメールです）」のように使う。",
      synonymDifference:
        "inquire vs ask vs question: inquire は公式・丁寧な問い合わせ（ビジネス文書向き）。ask は日常的な質問全般。question は尋問的・深く掘り下げるニュアンスがある（question a witness = 証人を尋問する）。",
      englishDefinition:
        "To ask for information about something; to investigate or look into something.",
      etymology:
        "ラテン語 inquirere（中に探す）から。in-（中に）＋ quaerere（求める・query と同語源）。",
    },
  ],
  // inspection (30050)
  [
    30050,
    {
      coreImage:
        "「基準や規則に合っているかどうかを、専門家が詳しく調べる」のがコアイメージ。安全確認・品質チェック・視察など公式な「検査」。",
      usage:
        "「safety inspection（安全検査）」「health inspection（衛生検査）」「fail an inspection（検査に不合格になる）」「inspection report（検査報告書）」のように使う。",
      synonymDifference:
        "inspection vs examination vs audit: inspection は安全・規制基準への適合を現場で確認する検査。examination はより詳しい「調査・試験・診察」。audit は財務・業務プロセスの公式な会計監査。",
      englishDefinition:
        "An official examination to check whether something meets required standards.",
      etymology:
        "ラテン語 inspectio（見ること）から。in-（中を）＋ specere（見る・spectacle と同語源）。",
    },
  ],
  // install (30051)
  [
    30051,
    {
      coreImage:
        "「使える状態になるよう、決められた場所にきちんと設置・導入する」のがコアイメージ。機器の設置もソフトのインストールも同じ語。",
      usage:
        "「install software（ソフトをインストールする）」「install equipment（機器を設置する）」「install a new system（新システムを導入する）」のように使う。",
      synonymDifference:
        "install vs set up: install は物理的・技術的に組み込む・設置する行為。set up はより広く「準備して使えるようにする」全般（set up a meeting = 会議を設定する）。",
      englishDefinition:
        "To put a piece of equipment or software in position and make it ready to use.",
      etymology:
        "ラテン語 installare（場所に据える）から。in-（〜の中に）＋ stallum（場所・stall と同語源）。",
    },
  ],
  // insurance (30052)
  [
    30052,
    {
      coreImage:
        "「将来のリスク・損害に備えて保険料を払い、万一の時に補償を受ける仕組み」がコアイメージ。不確実性に対する「安全網」。",
      usage:
        "「health insurance（医療保険）」「car insurance（自動車保険）」「take out insurance（保険に加入する）」「insurance claim（保険請求）」のように使う。",
      synonymDifference:
        "insurance vs assurance: insurance は事故・損害など不確実なリスクへの補償（car insurance）。assurance は生命保険など確実に起きること（死）に対する保証（life assurance〈英〉）。",
      englishDefinition:
        "An arrangement in which a company provides financial protection against loss, damage, or risk in exchange for regular payments.",
      etymology:
        "insure（保証する・保険をかける）＋ -ance（名詞化）。insure は古フランス語 enseurer（確実にする）から。",
    },
  ],
  // inventory (30053)
  [
    30053,
    {
      coreImage:
        "「手元にある在庫・資産の一覧」がコアイメージ。物流・小売では「在庫」、会計では「棚卸し資産」を意味する。",
      usage:
        "「check inventory（在庫を確認する）」「inventory management（在庫管理）」「out of inventory（在庫切れ）」「conduct an inventory（棚卸しをする）」のように使う。",
      synonymDifference:
        "inventory vs stock: inventory はより正式・会計的な語（ビジネス文書・システム用語）。stock は日常的な「在庫」（in stock = 在庫あり、out of stock = 在庫切れ）。",
      englishDefinition:
        "A complete list of items such as goods in a store or property; the goods kept in a store.",
      etymology:
        "中世ラテン語 inventorium（発見したものの一覧）から。invenire（見つける・invent と同語源）＋ -ory（場所）。",
    },
  ],
  // invoice (30054)
  [
    30054,
    {
      coreImage:
        "「商品・サービス提供後に代金を請求する正式な書類」がコアイメージ。金額・品目・支払期限が記載されたB2B文書。",
      usage:
        "「send an invoice（請求書を送る）」「pay an invoice（請求書を支払う）」「invoice number（請求書番号）」「overdue invoice（期限超過の請求書）」のように使う。",
      synonymDifference:
        "invoice vs receipt vs bill: invoice は支払いを求める請求書（支払い前）。receipt は支払い完了後の領収書。bill は個人向けの請求書（電気代・レストランなど）。",
      englishDefinition:
        "A document listing goods or services provided and their cost, sent to request payment.",
      etymology:
        "フランス語 envois（送付品）の複数形から。en-（中に）＋ voie（道）。16世紀から商業用語として使用。",
    },
  ],
  // itinerary (30055)
  [
    30055,
    {
      coreImage:
        "「旅や出張の日程・経路・宿泊地などを細かく記した計画書」がコアイメージ。「どこで何をするか」が時系列にまとめられた旅程表。",
      usage:
        "「travel itinerary（旅程表）」「detailed itinerary（詳細な日程）」「follow the itinerary（日程に沿って行動する）」のように使う。",
      synonymDifference:
        "itinerary vs schedule vs agenda: itinerary は旅行・出張の経路・宿泊を含む日程表。schedule は一般的な予定表・時刻表。agenda は会議の議題リスト。",
      englishDefinition:
        "A detailed plan or route for a journey, including places to visit and times of travel.",
      etymology:
        "ラテン語 itinerarium（旅の記録）から。iter（旅・道）＋ -arium（場所・記録）。",
    },
  ],
  // luggage (30056)
  [
    30056,
    {
      coreImage:
        "「旅行時に持ち運ぶスーツケース・バッグなどの荷物全体」がコアイメージ。不可算名詞で、個々のバッグではなく「荷物」という概念を表す。",
      usage:
        "「check in luggage（荷物を預ける）」「carry-on luggage（機内持ち込み荷物）」「luggage allowance（手荷物許容量）」「lost luggage（紛失荷物）」のように使う。",
      synonymDifference:
        "luggage vs baggage: ほぼ同義で使えるが、luggage はイギリス英語でよく使われる。baggage はアメリカ英語でより一般的（baggage claim = 手荷物引取所）。baggage は比喩的に「精神的な重荷」の意味でも使う。",
      englishDefinition:
        "Bags and cases that you carry when you travel.",
      etymology:
        "lug（重いものを引きずる）＋ -age（集合名詞化）。重くて大変な「運ぶもの」のイメージ。",
    },
  ],
  // maintain (30057)
  [
    30057,
    {
      coreImage:
        "「あるレベルや状態を保ち続ける・持続させる」のがコアイメージ。機械の整備も、品質の維持も、自分の主張も「保ち続ける」点で共通。",
      usage:
        "「maintain quality（品質を維持する）」「maintain a system（システムを保守する）」「maintain contact（連絡を保つ）」「I maintain that...（〜と主張し続ける）」のように使う。",
      synonymDifference:
        "maintain vs sustain vs preserve: maintain は既存の状態・レベルを保つ。sustain は努力・資源を使って長期的に支える（sustainable）。preserve はより意識的に「保存・保護する」（preserve the environment）。",
      englishDefinition:
        "To keep something in good condition or at the same level; to insist that something is true.",
      etymology:
        "ラテン語 manutenere（手で保持する）から。manu-（手で）＋ tenere（保持する・tenure と同語源）。",
    },
  ],
  // manufacture (30058)
  [
    30058,
    {
      coreImage:
        "「工場で材料を加工して製品を大量に作る」のがコアイメージ。手工業から機械化生産まで「製造」全般を指す。",
      usage:
        "「manufacture products（製品を製造する）」「manufacturing plant（製造工場）」「manufacturer（製造業者・メーカー）」「made by the manufacturer（メーカー製）」のように使う。",
      synonymDifference:
        "manufacture vs produce vs make: manufacture は工業的・大規模な生産プロセスに使う正式な語。produce は農産物や生産物全般（produce food）。make はより日常的・小規模な「作る」（make a cake）。",
      englishDefinition:
        "To produce goods in large quantities using machinery; the process of producing goods.",
      etymology:
        "ラテン語 manu factum（手で作られたもの）から。manu（手で）＋ facere（作る・fact と同語源）。現代は機械化されても同じ語を使う。",
    },
  ],
  // merchandise (30059)
  [
    30059,
    {
      coreImage:
        "「売買の対象となる商品・品物の総称」がコアイメージ。小売店や卸売で取引される物品全般を指すやや格式ばった語。",
      usage:
        "「retail merchandise（小売商品）」「merchandise display（商品陳列）」「licensed merchandise（ライセンス商品・公式グッズ）」のように使う。動詞では「商品を販売・販促する」意味にも。",
      synonymDifference:
        "merchandise vs goods vs product: merchandise は商業的に取引される「商品」（小売文脈）。goods は物品・品物一般（consumer goods = 消費財）。product は企業が作り出す「製品」（Apple's products）。",
      englishDefinition:
        "Goods that are bought and sold; to promote and sell goods.",
      etymology:
        "古フランス語 marchandise（商品）から。marchand（商人）→ merchant と同語源。",
    },
  ],
  // negotiate (30060)
  [
    30060,
    {
      coreImage:
        "「双方が満足できる合意に向けて、条件を話し合いながら調整する」のがコアイメージ。ビジネス・外交・日常まで幅広く使う。",
      usage:
        "「negotiate a contract（契約を交渉する）」「negotiate a salary（給与交渉する）」「negotiation skills（交渉力）」「negotiate with（〜と交渉する）」のように使う。",
      synonymDifference:
        "negotiate vs discuss vs bargain: negotiate は合意を目指す正式・組織的な交渉。discuss はより広い「話し合い」（必ずしも合意を目指さない）。bargain は値段・取引条件を下げようとするやり取り（bargain for a lower price）。",
      englishDefinition:
        "To discuss something formally in order to reach an agreement.",
      etymology:
        "ラテン語 negotiari（商売をする）から。nec-（ない）＋ otium（余暇）＝「暇なし」→ 商売に転じ、交渉の意味に。",
    },
  ],

  // notify (30061)
  [
    30061,
    {
      coreImage:
        "「公式に・正式に知らせる」のがコアイメージ。単なる会話ではなく、組織的・義務的に情報を伝達する行為。",
      usage:
        "「notify someone of（〜を誰かに通知する）」「notify by email（メールで通知する）」「notification（通知・お知らせ）」「Please notify us in advance.（事前にご連絡ください）」のように使う。",
      synonymDifference:
        "notify vs inform vs tell: notify は公式・義務的な通知（notify the authorities）。inform はより丁寧に情報を提供する（Please inform us of any changes）。tell は日常的な「伝える」（tell me the result）。",
      englishDefinition:
        "To officially tell someone about something; to give someone formal notice.",
      etymology:
        "ラテン語 notificare（知らせる）から。notus（知られた）＋ facere（する）。",
    },
  ],
  // obtain (30062)
  [
    30062,
    {
      coreImage:
        "「努力・手続きを経て何かを手に入れる」のがコアイメージ。単なる get より意図的・公式なニュアンスがある。",
      usage:
        "「obtain a visa（ビザを取得する）」「obtain permission（許可を得る）」「obtain information（情報を入手する）」のように使う。",
      synonymDifference:
        "obtain vs get vs acquire: obtain は努力・手続きを経て手に入れる（やや格式ばった語）。get は日常的な「得る・もらう」全般。acquire はビジネス・法律的な「取得・買収」に使われることが多い（acquire a company）。",
      englishDefinition:
        "To get something, especially through effort or an official process.",
      etymology:
        "ラテン語 obtinere（保持する・達成する）から。ob-（に向かって）＋ tenere（保持する）。",
    },
  ],
  // operate (30063)
  [
    30063,
    {
      coreImage:
        "「機械・システム・事業を動かして機能させる」のがコアイメージ。機器の操作も、会社の運営も、手術も「operate」。",
      usage:
        "「operate a machine（機械を操作する）」「operate a business（事業を運営する）」「operate on a patient（患者を手術する）」「operating costs（運営コスト）」のように使う。",
      synonymDifference:
        "operate vs run vs manage: operate は技術的・機械的に動かす・機能させる（operate equipment）。run はより日常的に動かす・運営する（run a store）。manage は人・組織・状況を管理・統括する（manage a team）。",
      englishDefinition:
        "To control or use a machine or device; to manage or run a business; to perform surgery.",
      etymology:
        "ラテン語 operari（働く）から。opus（仕事・work）が語源。",
    },
  ],
  // opportunity (30064)
  [
    30064,
    {
      coreImage:
        "「目標達成に向けて行動できる好条件が揃った瞬間」がコアイメージ。一時的な「好機の窓」をどう活かすかが鍵。",
      usage:
        "「seize an opportunity（機会をつかむ）」「business opportunity（ビジネスチャンス）」「equal opportunity（均等な機会）」「opportunity cost（機会費用）」のように使う。",
      synonymDifference:
        "opportunity vs chance vs possibility: opportunity は具体的に行動できる好条件が整った機会。chance は偶然性・可能性も含む（there's a chance it rains）。possibility は実現の可能性そのものに焦点（possibility of promotion）。",
      englishDefinition:
        "A time or situation that makes it possible to do something you want or need to do.",
      etymology:
        "ラテン語 opportunitas（都合の良い時）から。ob portum（港に向かって）という語源で、「帆に向かって吹く好機の風」を指した。",
    },
  ],
  // order (30065)
  [
    30065,
    {
      coreImage:
        "「誰かに何かをするよう指示する・商品の購入を申し込む・物事を整然とした状態にする」という幅広いコアイメージ。",
      usage:
        "「place an order（注文する）」「order a product（製品を注文する）」「in order to（〜するために）」「keep order（秩序を保つ）」「out of order（故障中・順番が違う）」のように使う。",
      synonymDifference:
        "order vs command vs request: order は権威的に指示する（order troops）または商品注文。command はより強制的・軍事的な命令。request は丁寧な依頼・お願い（polite request）。",
      englishDefinition:
        "A request to buy or supply something; a command; the way things are arranged.",
      etymology:
        "ラテン語 ordo（列・配置）から。「整然と並んだ状態」から「指示・手配」の意味に発展。",
    },
  ],
  // participate (30066)
  [
    30066,
    {
      coreImage:
        "「活動・グループに自発的に加わって関与する」のがコアイメージ。受動的にいるのではなく、積極的に「参加」する。",
      usage:
        "「participate in a meeting（会議に参加する）」「active participation（積極的な参加）」「Everyone is welcome to participate.（誰でも参加歓迎です）」のように使う。",
      synonymDifference:
        "participate vs attend vs join: participate は活動に積極的に関与する（参加して何かする）。attend は場に出席する（attend a conference = 会議に出る）。join はグループ・組織に加わる・一緒になる（join a team）。",
      englishDefinition:
        "To take part in an activity or event.",
      etymology:
        "ラテン語 participare（共に持つ）から。pars（部分）＋ capere（取る）。「一部を取る＝関与する」のが原義。",
    },
  ],
  // permit (30067)
  [
    30067,
    {
      coreImage:
        "「権限を持つ者が正式に許可を与える」のがコアイメージ。動詞と名詞の両方で使い、名詞では物理的な許可証も指す。",
      usage:
        "「Smoking is not permitted.（喫煙は禁止されています）」「building permit（建築許可）」「work permit（就労許可証）」「weather permitting（天気が許す限り）」のように使う。",
      synonymDifference:
        "permit vs allow vs authorize: permit は公式・法的な許可を与える（permit entry）。allow はより広く「許す・可能にする」（allow someone to speak）。authorize は公式な権限・委任を与える（authorize a payment）。",
      englishDefinition:
        "To officially allow something; an official document giving permission to do something.",
      etymology:
        "ラテン語 permittere（通過させる）から。per-（完全に）＋ mittere（送る・mission と同語源）。",
    },
  ],
  // policy (30068)
  [
    30068,
    {
      coreImage:
        "「組織・政府が何かについて決めた公式な方針・ルール」がコアイメージ。判断の基準となる「枠組み」。",
      usage:
        "「company policy（会社の方針）」「return policy（返品ポリシー）」「privacy policy（プライバシーポリシー）」「insurance policy（保険証券）」のように使う。",
      synonymDifference:
        "policy vs rule vs regulation: policy は組織の行動指針・方針（broad guidelines）。rule は具体的な決まり・規則（no phones rule）。regulation は法律・政府機関による規制・法規（safety regulations）。",
      englishDefinition:
        "A set of ideas or plans that is used as a basis for making decisions; an insurance contract.",
      etymology:
        "ギリシャ語 politeia（市民のあり方）から。polis（都市・国家）→ police・politics と同語源。",
    },
  ],
  // postpone (30069)
  [
    30069,
    {
      coreImage:
        "「予定していたことを後の日時に先送りにする」のがコアイメージ。キャンセルではなく、「後回し」にすること。",
      usage:
        "「postpone a meeting（会議を延期する）」「the event was postponed（イベントが延期された）」「postpone until next week（来週まで延期する）」のように使う。",
      synonymDifference:
        "postpone vs delay vs reschedule: postpone は意図的に後の日時に移すこと（新しい日時は未定でもよい）。delay は予定より遅れること（意図的でない場合も含む）。reschedule は新しい具体的な日時を決めて変更すること。",
      englishDefinition:
        "To arrange for an event or appointment to take place at a later time.",
      etymology:
        "ラテン語 postponere（後ろに置く）から。post-（後に）＋ ponere（置く）。",
    },
  ],
  // procedure (30070)
  [
    30070,
    {
      coreImage:
        "「目的を達成するために決められた手順・ステップ」のがコアイメージ。業務手順・医療手技・法的手続きなど、正式なやり方の流れ。",
      usage:
        "「follow the procedure（手順に従う）」「standard operating procedure（標準作業手順・SOP）」「medical procedure（医療処置）」「legal procedure（法的手続き）」のように使う。",
      synonymDifference:
        "procedure vs process vs method: procedure は決まったステップを踏む特定の手順・やり方。process はより広い「進行中の流れ・プロセス」（hiring process）。method は目的達成のための「手法・方法」（scientific method）。",
      englishDefinition:
        "An established or official way of doing something; a medical treatment or operation.",
      etymology:
        "ラテン語 procedere（前に進む）から。pro-（前に）＋ cedere（行く・proceed と同語源）。",
    },
  ],
  // profit (30071)
  [
    30071,
    {
      coreImage:
        "「収入からコストを差し引いた残り・利益」がコアイメージ。ビジネスが存続するための「黒字」の概念。",
      usage:
        "「make a profit（利益を得る）」「profit margin（利益率）」「non-profit（非営利）」「profit and loss（損益）」「turn a profit（黒字になる）」のように使う。",
      synonymDifference:
        "profit vs revenue vs income: profit は収入からコストを引いた純利益（net profit）。revenue は売上総額（売上高）でコスト差し引き前。income は個人・法人の「所得・収入」全般（taxable income）。",
      englishDefinition:
        "Money gained from selling something or doing business, after costs have been paid.",
      etymology:
        "ラテン語 profectus（前進・進歩）から。pro-（前に）＋ facere（する）。「成果として得るもの」の意。",
    },
  ],
  // promote (30072)
  [
    30072,
    {
      coreImage:
        "「上の位置に押し上げる・前に押し出す」のがコアイメージ。人を「昇進」させることも、商品を「宣伝」することも、目標を「促進」することも同じ語。",
      usage:
        "「be promoted to manager（マネージャーに昇進する）」「promote a product（製品を宣伝する）」「promote health（健康を促進する）」「promotion campaign（プロモーションキャンペーン）」のように使う。",
      synonymDifference:
        "promote vs advertise vs market: promote は幅広く「前進させる・高める」。advertise は広告媒体を使って宣伝することに焦点。market は市場に向けて売り込む戦略的な活動全体。",
      englishDefinition:
        "To raise someone to a higher position; to advertise a product; to encourage the development of something.",
      etymology:
        "ラテン語 promovere（前に動かす）から。pro-（前に）＋ movere（動かす）。",
    },
  ],
  // propose (30073)
  [
    30073,
    {
      coreImage:
        "「考えや計画を前に出して相手に検討を促す」のがコアイメージ。新しいアイデアを「提案する」、または結婚を「申し込む」行為。",
      usage:
        "「propose a plan（計画を提案する）」「propose a solution（解決策を提示する）」「proposal（提案書・プロポーザル）」「I propose that we...（〜することを提案します）」のように使う。",
      synonymDifference:
        "propose vs suggest vs recommend: propose はより正式・具体的な提案（with a detailed plan）。suggest はカジュアルに「〜はどうでしょう」と提案する。recommend は経験・判断に基づいた「おすすめ」（highly recommend）。",
      englishDefinition:
        "To suggest a plan or idea for others to consider; to offer marriage to someone.",
      etymology:
        "ラテン語 proponere（前に置く）から。pro-（前に）＋ ponere（置く）。",
    },
  ],
  // purchase (30074)
  [
    30074,
    {
      coreImage:
        "「代金を払って物・サービスを正式に取得する」がコアイメージ。buy のフォーマル版でビジネス・法律文書で多用される。",
      usage:
        "「make a purchase（購入する）」「online purchase（オンライン購入）」「purchase order（発注書）」「purchase price（購入価格）」のように使う。",
      synonymDifference:
        "purchase vs buy vs acquire: purchase は正式・書面的な文脈で使う。buy は日常会話で広く使う。acquire は企業買収・資産取得など大規模・正式な場面で使われることが多い。",
      englishDefinition:
        "To buy something, especially through a formal process; something that has been bought.",
      etymology:
        "古フランス語 purchacier（追求して手に入れる）から。ラテン語 pro-（前に）＋ capere（捕まえる）。",
    },
  ],
  // receipt (30075)
  [
    30075,
    {
      coreImage:
        "「支払い完了の証明として発行される書類」がコアイメージ。「受け取った（received）」という事実を記録した文書。",
      usage:
        "「keep your receipt（レシートを保管してください）」「provide a receipt（領収書を発行する）」「receipt of payment（代金受領）」のように使う。",
      synonymDifference:
        "receipt vs invoice vs bill: receipt は支払い済みの証明書（支払い後）。invoice は支払いを求める請求書（支払い前）。bill は個人向けの請求書やレストランの勘定。",
      englishDefinition:
        "A document showing that money has been paid or goods received.",
      etymology:
        "ラテン語 recepta（受け取られたもの）の女性形から。re-（戻って）＋ capere（取る）。pの黙字は16世紀にラテン語綴りに戻した影響。",
    },
  ],
  // recommend (30076)
  [
    30076,
    {
      coreImage:
        "「良いものとして他の人に信頼をもって伝える・勧める」のがコアイメージ。自分の経験・知識に基づいた肯定的な提案。",
      usage:
        "「recommend a restaurant（レストランを勧める）」「I highly recommend it.（強くお勧めします）」「recommendation letter（推薦状）」「as recommended（推奨通りに）」のように使う。",
      synonymDifference:
        "recommend vs suggest vs advise: recommend は質・良さを保証して積極的に勧める。suggest はより中立的に「〜はどうですか」と提示する。advise は専門的立場から「こうすべき」と助言する。",
      englishDefinition:
        "To suggest that someone or something is good or suitable for a particular purpose.",
      etymology:
        "ラテン語 recommendare（再び委ねる）から。re-（再び）＋ commendare（委ねる・commend と同語源）。",
    },
  ],
  // refund (30077)
  [
    30077,
    {
      coreImage:
        "「受け取ったお金を返す・払い戻す」のがコアイメージ。商品返品・サービス未提供・過払いなど、支払いを元に戻す行為。",
      usage:
        "「get/receive a refund（返金を受ける）」「full refund（全額返金）」「refund policy（返金方針）」「request a refund（返金を求める）」のように使う。",
      synonymDifference:
        "refund vs reimbursement vs rebate: refund は購入代金の払い戻し。reimbursement は立替費用の精算・返済（expense reimbursement = 経費精算）。rebate は購入後に一部が返金されるキャッシュバック的なもの。",
      englishDefinition:
        "Money that is given back because of returning goods or paying too much; to give money back.",
      etymology:
        "re-（戻して）＋ fund（ラテン語 fundus = 底・基盤）。お金を「元の基盤に戻す」イメージ。",
    },
  ],
  // register (30078)
  [
    30078,
    {
      coreImage:
        "「公式なリスト・記録に名前や情報を登録する」のがコアイメージ。動詞「登録する」から名詞「レジ（金銭登録機）」まで幅広く使う。",
      usage:
        "「register for a course（コースに登録する）」「cash register（レジ）」「hotel register（宿泊者名簿）」「register a company（会社を設立登記する）」のように使う。",
      synonymDifference:
        "register vs enroll vs sign up: register は公式なリストに記録する正式な語。enroll は学校・プログラムに入学・登録する（enroll in school）。sign up はより口語的な「申し込む・登録する」。",
      englishDefinition:
        "To put your name or information on an official list; a machine used to record sales.",
      etymology:
        "ラテン語 regestum（記録されたもの）から。re-（戻して）＋ gerere（運ぶ・manage と関連）。",
    },
  ],
  // regulation (30079)
  [
    30079,
    {
      coreImage:
        "「政府・機関が設けた、守るべき公式のルール・法規制」がコアイメージ。個人ルールではなく、組織・社会全体を対象とした規制。",
      usage:
        "「safety regulations（安全規制）」「comply with regulations（規制を遵守する）」「government regulation（政府規制）」「deregulation（規制緩和）」のように使う。",
      synonymDifference:
        "regulation vs rule vs law: regulation は政府・機関が設ける実施規則（lawの下位・具体的な規制）。rule は組織・グループの取り決め（company rules）。law は立法機関が制定した最上位の法律。",
      englishDefinition:
        "An official rule or law that controls how something is done.",
      etymology:
        "ラテン語 regulatio（規則による制御）から。regula（定規・規則・rule と同語源）。",
    },
  ],
  // relocate (30080)
  [
    30080,
    {
      coreImage:
        "「人や組織が別の場所に移る・移転させる」のがコアイメージ。会社の引越しも、従業員の転勤も「relocate」。",
      usage:
        "「relocate to another city（他の都市に移転する）」「the office will relocate（オフィスが移転する）」「relocation package（転勤手当）」のように使う。",
      synonymDifference:
        "relocate vs move vs transfer: relocate はオフィス・住居などを別の場所に移転する公式な語。move はより日常的な「引っ越す・移動する」。transfer は人や物を別の場所・部署に「移動させる」（transfer to another branch = 他支店に異動する）。",
      englishDefinition:
        "To move to a different place, or to move a business or people to a different place.",
      etymology:
        "re-（再び）＋ locate（場所を定める）。locate はラテン語 locare（場所に置く）から。",
    },
  ],

  // repair (30081)
  [
    30081,
    {
      coreImage:
        "「壊れたり不具合のある物を元の状態に戻す・修理する」のがコアイメージ。物理的な修繕も、関係の修復も「repair」。",
      usage:
        "「repair a machine（機械を修理する）」「under repair（修理中）」「repair shop（修理店）」「repair the relationship（関係を修復する）」のように使う。",
      synonymDifference:
        "repair vs fix vs maintain: repair は壊れたものを元の状態に直す。fix はより口語的な「直す」（fix a bug）。maintain は壊れないよう状態を保つ日常的な整備（not repair after breaking）。",
      englishDefinition:
        "To fix something that is broken or damaged; work done to fix something.",
      etymology:
        "ラテン語 reparare（再び準備する）から。re-（再び）＋ parare（準備する・prepare と同語源）。",
    },
  ],
  // replace (30082)
  [
    30082,
    {
      coreImage:
        "「古い・壊れた・なくなったものの代わりに新しいものを置く」のがコアイメージ。「再配置する」から「後任になる」まで幅広く使う。",
      usage:
        "「replace the battery（バッテリーを交換する）」「replace an employee（社員の後任となる）」「replace A with B（AをBで置き換える）」「irreplaceable（かけがえのない）」のように使う。",
      synonymDifference:
        "replace vs substitute vs exchange: replace は元のものに取って代わる・後任になる。substitute は一時的に代わりに使う（substitute teacher = 代用教員）。exchange はお互いに入れ替える双方向の交換。",
      englishDefinition:
        "To take the place of something or someone; to put something new in the place of something else.",
      etymology:
        "re-（再び）＋ place（場所に置く）。フランス語 replacer から。",
    },
  ],
  // require (30083)
  [
    30083,
    {
      coreImage:
        "「必要として求める・求められる」のがコアイメージ。任意ではなく「なくてはならない」という必要性の強さが特徴。",
      usage:
        "「require a signature（署名が必要です）」「This job requires experience.（この仕事は経験が必要です）」「as required（必要に応じて）」「required documents（必要書類）」のように使う。",
      synonymDifference:
        "require vs need vs demand: require は状況・ルールが求める（条件として必須）。need はより主観的な「〜が必要だ」。demand は強制的・命令的に求める（demand a refund）。",
      englishDefinition:
        "To need something or make something necessary; to officially demand something.",
      etymology:
        "ラテン語 requirere（再び求める）から。re-（再び）＋ quaerere（求める・query と同語源）。",
    },
  ],
  // reservation (30084)
  [
    30084,
    {
      coreImage:
        "「将来の利用のために席・部屋・資源などを確保しておく」のがコアイメージ。場所・資源の「先取り」という概念。",
      usage:
        "「make a reservation（予約する）」「reservation system（予約システム）」「reservation under the name Smith（スミス名義の予約）」「without reservation（ためらいなく）」のように使う。",
      synonymDifference:
        "reservation vs appointment vs booking: reservation はホテル・レストラン・交通など場所・資源の予約。appointment は医師・美容師など人との面会の予約。booking は主にイギリス英語でホテル・チケット予約（book a hotel）。",
      englishDefinition:
        "An arrangement to have a seat, room, or table kept for your use at a future time.",
      etymology:
        "ラテン語 reservare（取っておく）から。re-（後のために）＋ servare（保存する）。",
    },
  ],
  // resign (30085)
  [
    30085,
    {
      coreImage:
        "「自分の意志で職・役職を辞める」のがコアイメージ。解雇（fire）と違い、当人が自発的に「辞表を出す」行為。",
      usage:
        "「resign from a position（職を辞する）」「submit a resignation letter（辞表を提出する）」「resignation（辞職・辞表）」「resign oneself to（〜を甘受する）」のように使う。",
      synonymDifference:
        "resign vs quit vs retire: resign は職を正式に辞職する（ビジネス・政治文脈）。quit はより口語的な「やめる」（quit a job）。retire は年齢・年数を経て引退する。",
      englishDefinition:
        "To voluntarily leave a job or position; to formally give up a role.",
      etymology:
        "ラテン語 resignare（印を消す・返還する）から。re-（戻して）＋ signare（印を付ける）。",
    },
  ],
  // retail (30086)
  [
    30086,
    {
      coreImage:
        "「最終消費者に直接商品を販売する」のがコアイメージ。卸売（wholesale）の反対で、店頭・オンラインで個人に売ること。",
      usage:
        "「retail price（小売価格）」「retail store（小売店）」「retail industry（小売業）」「retail customer（小売顧客）」「at retail（小売価格で）」のように使う。",
      synonymDifference:
        "retail vs wholesale: retail は最終消費者に1点ずつ売ること（定価に近い価格）。wholesale は業者・小売店に大量に安く売ること（unit price is lower）。",
      englishDefinition:
        "The sale of goods to the public, usually in small quantities; relating to selling goods to consumers.",
      etymology:
        "古フランス語 retailler（小さく切る）から。re-（再び）＋ tailler（切る・tailor と同語源）。「大量の商品を切り分けて少量で売る」のが原義。",
    },
  ],
  // revenue (30087)
  [
    30087,
    {
      coreImage:
        "「事業活動から入ってくる総収入・売上高」のがコアイメージ。コストを差し引く前の「入ってきたお金の総額」。",
      usage:
        "「annual revenue（年間売上高）」「revenue growth（収益成長）」「generate revenue（収益を生み出す）」「revenue stream（収益源）」のように使う。",
      synonymDifference:
        "revenue vs profit vs income: revenue は費用差し引き前の総収入（top line）。profit は収入からコストを引いた純利益（bottom line）。income は個人・法人の所得・収入（tax on income）。",
      englishDefinition:
        "The total amount of money received by a business or government from its activities.",
      etymology:
        "フランス語 revenu（戻ってきたもの）から。ラテン語 revenire（戻ってくる）。「投資から戻ってくるお金」のイメージ。",
    },
  ],
  // salary (30088)
  [
    30088,
    {
      coreImage:
        "「働いた対価として定期的（月ごと・年ごと）に受け取る固定報酬」がコアイメージ。時給（hourly wage）と違い、固定で支払われる。",
      usage:
        "「annual salary（年収）」「monthly salary（月給）」「salary negotiation（給与交渉）」「salary range（給与レンジ）」のように使う。",
      synonymDifference:
        "salary vs wage vs pay: salary は月給・年俸として定期的に払われる固定給（管理職・専門職に多い）。wage は時給・日給・週給で払われる変動給（worker's wage）。pay は給与全般の総称（pay raise = 昇給）。",
      englishDefinition:
        "A fixed regular payment made to an employee, usually monthly or yearly.",
      etymology:
        "ラテン語 salarium（塩代）から。古代ローマで兵士や官吏に「塩を買うための手当」を支給したことが語源。",
    },
  ],
  // schedule (30089)
  [
    30089,
    {
      coreImage:
        "「時系列で整理された予定・計画のリスト」がコアイメージ。個人の手帳から電車の時刻表まで「時間軸の計画」すべて。",
      usage:
        "「busy schedule（忙しいスケジュール）」「on schedule（予定通りに）」「behind schedule（予定より遅れて）」「schedule a meeting（会議を予定に入れる）」のように使う。",
      synonymDifference:
        "schedule vs timetable vs agenda: schedule は個人・組織の予定表全般。timetable は交通・授業など固定した時間割。agenda は会議の議題・進行リスト。",
      englishDefinition:
        "A plan listing activities and the times they will happen; to arrange for something to happen at a particular time.",
      etymology:
        "ラテン語 schedula（小さな紙片）から。「予定を書いたメモ」が語源。",
    },
  ],
  // shipment (30090)
  [
    30090,
    {
      coreImage:
        "「貨物・荷物を特定の場所に向けて輸送すること・その一括り」がコアイメージ。出荷の行為と、その出荷された荷物の両方を指す。",
      usage:
        "「track a shipment（荷物を追跡する）」「shipment date（出荷日）」「international shipment（国際配送）」「the shipment arrived（荷物が届いた）」のように使う。",
      synonymDifference:
        "shipment vs delivery vs cargo: shipment は出荷・輸送の行為および輸送される荷物全体。delivery は受取先に届けることの行為に焦点。cargo は主に船・飛行機で運ぶ大型の貨物。",
      englishDefinition:
        "A load of goods that is sent together; the process of sending goods.",
      etymology:
        "ship（船で送る・発送する）＋ -ment（名詞化）。ship はもともと「船」だが、現代は輸送手段を問わず使う。",
    },
  ],

  // signature (30091)
  [
    30091,
    {
      coreImage:
        "「本人であることを証明するための手書きサイン」がコアイメージ。署名は「自分だけのマーク」として法的効力を持つ。",
      usage:
        "「put your signature here（ここにサインしてください）」「digital signature（電子署名）」「require a signature（署名が必要）」「signature style（独特のスタイル）」のように使う。",
      synonymDifference:
        "signature vs sign vs autograph: signature は文書・契約書への公式な署名。sign は「サインする」動詞。autograph は有名人のサイン・直筆サイン（fan autograph）。",
      englishDefinition:
        "A person's name written by themselves, used as identification or authorization.",
      etymology:
        "ラテン語 signatura（印を付けること）から。signum（印・sign）＋ -ature（行為・結果）。",
    },
  ],
  // submit (30092)
  [
    30092,
    {
      coreImage:
        "「権限ある相手や締め切りに合わせて、書類・作品・データを提出する」のがコアイメージ。「下に送る」という語源通り、上位者への提出。",
      usage:
        "「submit a report（報告書を提出する）」「submit an application（申請書を提出する）」「submission deadline（提出締め切り）」「Click to submit.（クリックして送信）」のように使う。",
      synonymDifference:
        "submit vs hand in vs send: submit は公式・正式な提出（書類・申請・フォーム）。hand in は物理的に手渡しで提出する（手書きの課題など）。send は広く「送る」（email, package など）。",
      englishDefinition:
        "To send or present something for consideration or judgment; to formally give something to someone in authority.",
      etymology:
        "ラテン語 submittere（下に送る）から。sub-（下に）＋ mittere（送る）。",
    },
  ],
  // subscribe (30093)
  [
    30093,
    {
      coreImage:
        "「継続的にサービス・情報を受け取るために定期的に支払い・登録をする」のがコアイメージ。一回限りではなく、継続的な関係。",
      usage:
        "「subscribe to a newsletter（ニュースレターを購読する）」「monthly subscription（月額定期購読）」「unsubscribe（解約する）」「subscription fee（定期購読料）」のように使う。",
      synonymDifference:
        "subscribe vs register vs sign up: subscribe は継続的・定期的なサービス利用の申込み（課金を伴うことが多い）。register は情報を登録する（無料でも可）。sign up は口語的な「申し込む・登録する」全般。",
      englishDefinition:
        "To pay money to receive a service or publication regularly; to agree to receive something on a regular basis.",
      etymology:
        "ラテン語 subscribere（下に書く）から。sub-（下に）＋ scribere（書く）。契約書の下に署名する行為から。",
    },
  ],
  // suggest (30094)
  [
    30094,
    {
      coreImage:
        "「相手に軽く提示して考えてもらう」のがコアイメージ。propose より非公式で、相手に選択の余地を残した提案。",
      usage:
        "「suggest a plan（計画を提案する）」「I suggest you call first.（まず電話することをお勧めします）」「make a suggestion（提案する）」「as suggested（提案通りに）」のように使う。",
      synonymDifference:
        "suggest vs propose vs recommend: suggest は軽く「〜はどうでしょう」と提示する。propose は具体的な計画を正式に提案する。recommend は質・良さを保証して積極的に勧める。",
      englishDefinition:
        "To mention an idea or plan for others to consider; to indicate something indirectly.",
      etymology:
        "ラテン語 suggerere（下から運ぶ・提供する）から。sub-（下から）＋ gerere（運ぶ）。",
    },
  ],
  // supply (30095)
  [
    30095,
    {
      coreImage:
        "「必要とされているものを提供し続ける・補充する」のがコアイメージ。継続的な供給・補給の概念。",
      usage:
        "「supply and demand（需要と供給）」「supply chain（サプライチェーン）」「office supplies（オフィス用品）」「supply a product（製品を供給する）」のように使う。",
      synonymDifference:
        "supply vs provide vs deliver: supply は継続的・大量に必要なものを補充・供給する。provide は必要なものを用意して提供する。deliver は最終目的地まで届ける配達の動作に焦点。",
      englishDefinition:
        "To provide something that is needed; a stock of something available for use.",
      etymology:
        "ラテン語 supplere（補充する）から。sub-（下から）＋ plere（満たす・full と同語源）。",
    },
  ],
  // transfer (30096)
  [
    30096,
    {
      coreImage:
        "「ある場所・人・状態から別の場所・人・状態へ移す・移る」のがコアイメージ。人の転勤、資金の振込、データの移動すべてが「transfer」。",
      usage:
        "「transfer money（送金する）」「transfer to another branch（他支店に異動する）」「bank transfer（銀行振込）」「transfer data（データを転送する）」のように使う。",
      synonymDifference:
        "transfer vs move vs relocate: transfer は人・物・データを正式に別の場所・管理に移す（組織的）。move はより日常的な「動く・引っ越す」。relocate は住居・オフィスを別の場所に移転する。",
      englishDefinition:
        "To move something or someone from one place to another; to change to a different job, school, or place.",
      etymology:
        "ラテン語 transferre（向こうへ運ぶ）から。trans-（向こうへ）＋ ferre（運ぶ）。",
    },
  ],
  // update (30097)
  [
    30097,
    {
      coreImage:
        "「情報・状態・ソフトウェアを最新の状態にする」のがコアイメージ。古い情報を「今」に追いつかせる行為。",
      usage:
        "「update the system（システムを更新する）」「keep someone updated（最新情報を伝え続ける）」「software update（ソフトウェアアップデート）」「status update（進捗報告）」のように使う。",
      synonymDifference:
        "update vs upgrade vs revise: update は最新の情報・バージョンに修正する（情報・ソフトが対象）。upgrade はより良い・新しいバージョンに格上げする（upgrade your subscription）。revise は内容を見直して修正する（revise a document）。",
      englishDefinition:
        "To make something more modern or add new information; a piece of new information.",
      etymology:
        "up-（上へ・最新に）＋ date（日付・時代）。「時代に追いつかせる」のが原義。",
    },
  ],
  // vacancy (30098)
  [
    30098,
    {
      coreImage:
        "「空いている・埋まっていない状態」のがコアイメージ。ホテルの空室も、会社の欠員も「空き」という共通概念。",
      usage:
        "「job vacancy（求人・空きポジション）」「vacancy rate（空室率）」「No vacancy（満室）」「fill a vacancy（欠員を補充する）」のように使う。",
      synonymDifference:
        "vacancy vs opening vs availability: vacancy はポジションや部屋が「空いている」状態の名詞。opening は求人・新しいポジション（job opening）。availability は人や物が「利用可能な状態・空き時間」（check availability）。",
      englishDefinition:
        "An empty space or position; an unoccupied room or job.",
      etymology:
        "ラテン語 vacantia（空であること）から。vacare（空である・vacation と同語源）。",
    },
  ],
  // warranty (30099)
  [
    30099,
    {
      coreImage:
        "「製品の欠陥・故障が一定期間内に起きた場合の修理・交換を保証する」のがコアイメージ。製品に付属する「品質保証書」。",
      usage:
        "「one-year warranty（1年保証）」「under warranty（保証期間中）」「warranty card（保証書）」「warranty claim（保証請求）」「void the warranty（保証を無効にする）」のように使う。",
      synonymDifference:
        "warranty vs guarantee: warranty は製品の欠陥修理・交換を約束する正式な書面（manufacturer's warranty）。guarantee はより広い「品質・結果・返金」の保証。",
      englishDefinition:
        "A written promise from a manufacturer that a product will be repaired or replaced if it has a fault within a certain time.",
      etymology:
        "古ノルマン語 warantie（保護・保証）から。warrant（保証・権限）と同語源。",
    },
  ],
  // withdraw (30100)
  [
    30100,
    {
      coreImage:
        "「ある場所・状況から引っ張り戻す・引き出す」のがコアイメージ。ATMから現金を引き出すことも、軍が撤退することも「withdraw」。",
      usage:
        "「withdraw money from an ATM（ATMから現金を引き出す）」「withdraw from a meeting（会議から退席する）」「withdraw a complaint（苦情を取り下げる）」「withdrawal symptoms（禁断症状）」のように使う。",
      synonymDifference:
        "withdraw vs take out vs remove: withdraw は正式・公式な「引き出し・撤退・取り下げ」。take out はより日常的な「取り出す・引き出す」（take out cash）。remove は物を取り除く・外す（remove an item from the list）。",
      englishDefinition:
        "To take money from a bank account; to move back or away from a place or situation.",
      etymology:
        "with-（離れて）＋ draw（引く）。「引っ張って離れる」のが原義。",
    },
  ],

  // accompany (30101)
  [
    30101,
    {
      coreImage:
        "「誰かと一緒に行く・付き添う」のがコアイメージ。主役に「伴って一緒にある」という付随・同行の概念。",
      usage:
        "「accompany someone to the meeting（会議に同行する）」「the documents that accompany this form（このフォームに添付の書類）」「accompanied by（〜を伴って）」のように使う。",
      synonymDifference:
        "accompany vs escort vs follow: accompany は並んで一緒に行く（同行）。escort は安全や礼儀のために付き添う（escort a guest）。follow は後ろについて行く（follow the leader）。",
      englishDefinition:
        "To go somewhere with someone; to exist or happen at the same time as something else.",
      etymology:
        "古フランス語 accompagnier から。a-（〜に）＋ compagner（仲間と共に行く）＋ companion（仲間）と同語源。",
    },
  ],
  // accurate (30102)
  [
    30102,
    {
      coreImage:
        "「現実や事実と完全に一致している、誤りのない」のがコアイメージ。精度・正確性の高さを表す。",
      usage:
        "「accurate data（正確なデータ）」「accurate information（正確な情報）」「accuracy rate（正確率）」「be accurate in（〜において正確である）」のように使う。",
      synonymDifference:
        "accurate vs correct vs precise: accurate は事実・実際と一致している（accurate measurement）。correct は基準・ルール通りに正しい（correct answer）。precise は細部まで厳密で細かい（precise calculation = 精密な計算）。",
      englishDefinition:
        "Correct and exact in all details; without errors.",
      etymology:
        "ラテン語 accuratus（注意深く行われた）から。ad-（〜に向かって）＋ curare（世話をする・care と関連）。",
    },
  ],
  // additional (30103)
  [
    30103,
    {
      coreImage:
        "「すでにあるものの上にさらに加わる」のがコアイメージ。「おまけ・追加分」として存在するものを表す。",
      usage:
        "「additional cost（追加費用）」「additional information（追加情報）」「no additional charge（追加料金なし）」「additional staff（追加人員）」のように使う。",
      synonymDifference:
        "additional vs extra vs supplementary: additional は既存のものに加わる「追加の」（formal）。extra は口語的な「余分な・追加の」（extra time）。supplementary はメインを補完する「補足的な」（supplementary materials）。",
      englishDefinition:
        "Added to what already exists; extra.",
      etymology:
        "addition（追加）＋ -al（形容詞化）。addition はラテン語 addere（加える）から。",
    },
  ],
  // adjust (30104)
  [
    30104,
    {
      coreImage:
        "「目的に合うよう少し変えて合わせる・微調整する」のがコアイメージ。大きく変えるのではなく、ちょうどよくなるよう「合わせ込む」行為。",
      usage:
        "「adjust the settings（設定を調整する）」「adjust to a new environment（新しい環境に適応する）」「make adjustments（調整を加える）」「salary adjustment（給与調整）」のように使う。",
      synonymDifference:
        "adjust vs modify vs change: adjust は微細な調整・適応。modify はやや大きな変更（modify a plan = 計画を修正する）。change は全体を変える・入れ替える（change the policy）。",
      englishDefinition:
        "To make a small change to something so that it works better or fits a situation.",
      etymology:
        "フランス語 ajuster（正確に合わせる）から。a-（〜に）＋ juste（正確な・just と同語源）。",
    },
  ],
  // admission (30105)
  [
    30105,
    {
      coreImage:
        "「中に入ることを許される・認められる」のがコアイメージ。場所への入場も、学校・組織への入会も、事実を「認める」ことも同じ語。",
      usage:
        "「admission fee（入場料）」「free admission（入場無料）」「hospital admission（入院）」「admission of guilt（罪を認めること）」のように使う。",
      synonymDifference:
        "admission vs entry vs access: admission は許可を得て入ること（許可・費用の支払いが伴う場合が多い）。entry は「入ること」という行為（entry requirements）。access は情報・場所への接近・利用可能性（internet access）。",
      englishDefinition:
        "Permission to enter a place; the process of being allowed into a school or organization; the act of admitting something.",
      etymology:
        "ラテン語 admissio（受け入れること）から。ad-（〜へ）＋ mittere（送る・mission と同語源）。",
    },
  ],
  // advance (30106)
  [
    30106,
    {
      coreImage:
        "「前に進む・前に進める・前払いする」のがコアイメージ。前向きの動き・進歩・前払いすべてに使える語。",
      usage:
        "「advance booking（事前予約）」「in advance（事前に・前もって）」「advance payment（前払い）」「technological advance（技術的進歩）」のように使う。",
      synonymDifference:
        "advance vs progress vs develop: advance は一歩前に進む具体的な動き（scientific advance）。progress は継続的な前進・進歩（make progress）。develop はより広く成長・発展する（develop skills）。",
      englishDefinition:
        "To move forward; to develop or improve; a payment made before it is due.",
      etymology:
        "ラテン語 abante（前方に）から。古フランス語 avancer を経て英語に。",
    },
  ],
  // advertise (30107)
  [
    30107,
    {
      coreImage:
        "「商品・サービス・求人などを広く知らせて関心を引く」のがコアイメージ。メディア・SNS・広告板などで「周知させる」行為。",
      usage:
        "「advertise a product（製品を宣伝する）」「advertise a job（求人広告を出す）」「advertise on TV（テレビで宣伝する）」「advertisement（広告・CM）」のように使う。",
      synonymDifference:
        "advertise vs promote vs market: advertise は広告媒体を使って宣伝することに焦点（place an ad）。promote は幅広く「認知を高める・後押しする」。market は市場調査・戦略を含む総合的な販促活動。",
      englishDefinition:
        "To tell people about a product or service in order to make them buy it.",
      etymology:
        "ラテン語 advertere（向ける・注意を引く）から。ad-（〜に）＋ vertere（向ける）。",
    },
  ],
  // afford (30108)
  [
    30108,
    {
      coreImage:
        "「余裕があるので〜できる・〜する余裕がある」のがコアイメージ。お金・時間・リスクのいずれにも使える「余裕・能力」の表現。",
      usage:
        "「can afford to（〜する余裕がある）」「I can't afford it.（買える余裕がない）」「afford the risk（リスクを冒す余裕がある）」のように使う。",
      synonymDifference:
        "afford vs manage vs allow: afford は余裕があるかどうかに焦点（financial or time capacity）。manage は困難な状況でなんとかやり遂げる（manage to finish）。allow は条件・状況が可能にする（if time allows）。",
      englishDefinition:
        "To have enough money or time to be able to do or have something.",
      etymology:
        "古英語 geforðian（達成する・促進する）から。for-（前に）＋ þian（進む）。現代では「余裕がある」の意味に特化。",
    },
  ],
  // agenda (30109)
  [
    30109,
    {
      coreImage:
        "「会議・打ち合わせで扱う議題・進行予定のリスト」がコアイメージ。ラテン語「行われるべきこと」の複数形が語源。",
      usage:
        "「meeting agenda（会議の議題）」「on the agenda（議題に上がっている）」「agenda item（議題のひとつ）」「hidden agenda（裏の意図・隠れた目的）」のように使う。",
      synonymDifference:
        "agenda vs schedule vs minutes: agenda は会議の議題リスト（事前作成）。schedule は時間軸の予定表。minutes は会議が終わった後の議事録。",
      englishDefinition:
        "A list of items to be discussed at a meeting; a person's goals or plans.",
      etymology:
        "ラテン語 agenda（行われるべきこと）の複数形。agere（行う・act と同語源）。",
    },
  ],
  // alternative (30110)
  [
    30110,
    {
      coreImage:
        "「代わりに選べる別の選択肢・手段」がコアイメージ。どちらかを選ぶ二択、または複数の代替案の中の一つ。",
      usage:
        "「find an alternative（代替案を見つける）」「no alternative（選択肢なし）」「alternative energy（代替エネルギー）」「as an alternative to（〜の代わりとして）」のように使う。",
      synonymDifference:
        "alternative vs option vs choice: alternative は元の方法が使えない時の代替案（Plan B的）。option は複数ある選択肢のひとつ（我々には多くのoptions がある）。choice は選ぶ行為そのものまたは選ばれたもの（make a choice）。",
      englishDefinition:
        "One of two or more possible courses of action; a substitute for something.",
      etymology:
        "ラテン語 alternare（交互にする）から。alter（もう一方・alter と同語源）。",
    },
  ],

  // annual (30111)
  [
    30111,
    {
      coreImage:
        "「1年ごとに繰り返される・年に1回の」のがコアイメージ。定期的な年次サイクルを表す。",
      usage:
        "「annual report（年次報告書）」「annual salary（年収）」「annual meeting（年次総会）」「annual leave（年次有給休暇）」のように使う。",
      synonymDifference:
        "annual vs yearly vs per annum: annual は「年1回の・年次の」という形容詞（annual event）。yearly はほぼ同義だが、より口語的（yearly fee）。per annum はラテン語由来の格式ばった「年当たり」（$50,000 per annum）。",
      englishDefinition:
        "Happening once a year or every year; calculated over a period of one year.",
      etymology:
        "ラテン語 annualis（年ごとの）から。annus（年）が語源。",
    },
  ],
  // apologize (30112)
  [
    30112,
    {
      coreImage:
        "「自分のミスや失礼に対して、誠意を持って謝罪する」のがコアイメージ。単なる「ごめんなさい」より格式のある謝罪表現。",
      usage:
        "「apologize for（〜について謝罪する）」「I apologize for the inconvenience.（ご不便をお掛けして申し訳ありません）」「apology letter（謝罪文）」「accept an apology（謝罪を受け入れる）」のように使う。",
      synonymDifference:
        "apologize vs excuse oneself vs sorry: apologize はより正式な謝罪（ビジネス・公的な場）。excuse oneself は失礼を詫びながら退席するニュアンス。sorry は日常的な軽い謝罪から深い後悔まで幅広く使える（I'm so sorry）。",
      englishDefinition:
        "To tell someone that you are sorry for doing something wrong or causing a problem.",
      etymology:
        "ギリシャ語 apologeisthai（自己弁護する）から。apo-（離れて）＋ logos（言葉）。もともとは「弁明する」の意味で、謝罪の意味に変化した。",
    },
  ],
  // appointment (30113)
  [
    30113,
    {
      coreImage:
        "「特定の時間・場所で会う約束を事前に取り決めた状態」がコアイメージ。公式・ビジネス的な予約・面会予約。",
      usage:
        "「make an appointment（予約を入れる）」「appointment time（予約時間）」「by appointment only（予約制）」「job appointment（任命）」のように使う。",
      synonymDifference:
        "appointment vs meeting vs reservation: appointment は特定の人物（医師・美容師など）との面会予約。meeting は複数人が集まる会議・打ち合わせ。reservation はホテル・レストランなど場所・資源の予約。",
      englishDefinition:
        "An arrangement to meet someone at a particular time and place; the act of choosing someone for a job.",
      etymology:
        "appoint（指定する）＋ -ment（名詞化）。ラテン語 ad punctum（点に向かって＝時間に正確に）が語源。",
    },
  ],
  // appropriate (30114)
  [
    30114,
    {
      coreImage:
        "「その状況・目的・基準にちょうどふさわしい」のがコアイメージ。良い・悪いではなく「場に合っている」かどうかの評価。",
      usage:
        "「appropriate behavior（適切な行動）」「appropriate clothing（適切な服装）」「appropriate for the occasion（その場に合った）」「Is this appropriate?（これは適切ですか？）」のように使う。",
      synonymDifference:
        "appropriate vs suitable vs proper: appropriate は状況・文脈にふさわしい（contextual fit）。suitable は目的・要件に合っている（suitable candidate）。proper は規範・礼儀上、正しい・正式な（proper conduct）。",
      englishDefinition:
        "Suitable or right for a particular situation or purpose.",
      etymology:
        "ラテン語 appropriare（自分のものにする）から。ad-（〜に）＋ proprius（自分の・proper と同語源）。「その場に合ったもの」の意。",
    },
  ],
  // approve (30115)
  [
    30115,
    {
      coreImage:
        "「権限を持つ者が、提案・計画・要求を正式に認める」のがコアイメージ。reject（却下）の反対。",
      usage:
        "「approve a request（申請を承認する）」「approve a budget（予算を承認する）」「pending approval（承認待ち）」「approved by management（経営陣に承認された）」のように使う。",
      synonymDifference:
        "approve vs agree vs authorize: approve は公式に承認する（上位者が下位者の申請を認める）。agree は双方が同意する（agree on terms）。authorize は行動・支出などの権限を与える（authorize a payment）。",
      englishDefinition:
        "To officially agree to or accept something; to believe that something is good.",
      etymology:
        "ラテン語 approbare（良いと認める）から。ad-（〜に）＋ probare（試す・prove と同語源）。",
    },
  ],
  // arrangement (30116)
  [
    30116,
    {
      coreImage:
        "「物事を整えて・手配して準備した状態・取り決め」がコアイメージ。旅行の手配・花の生け花・合意の取り決めすべてを包む。",
      usage:
        "「make arrangements（手配する）」「travel arrangements（旅行の手配）」「floral arrangement（フラワーアレンジメント）」「arrangement for payment（支払い取り決め）」のように使う。",
      synonymDifference:
        "arrangement vs plan vs preparation: arrangement は具体的に整えた「取り決め・手配」。plan はまだ実行前の計画・構想。preparation は実行に向けた準備の過程（preparation for the event）。",
      englishDefinition:
        "Plans or preparations for something; an agreement or plan made with someone.",
      etymology:
        "arrange（整える・手配する）＋ -ment（名詞化）。古フランス語 arangier（列に並べる）から。",
    },
  ],
  // assign (30117)
  [
    30117,
    {
      coreImage:
        "「特定の人や場所に役割・仕事・資源を割り当てる」のがコアイメージ。組織的に「これはあなたの担当」と決める行為。",
      usage:
        "「assign a task（タスクを割り当てる）」「assign a seat（席を割り当てる）」「assigned to a project（プロジェクトに配属された）」「assignment（課題・任務）」のように使う。",
      synonymDifference:
        "assign vs allocate vs designate: assign は人に仕事・役割を指定して担当させる。allocate はリソース（予算・時間・スペース）を配分する。designate は特定の目的のために指定・指名する（designated area = 指定エリア）。",
      englishDefinition:
        "To give a task, role, or responsibility to someone; to designate something for a specific purpose.",
      etymology:
        "ラテン語 assignare（印を付けて渡す）から。ad-（〜に）＋ signare（印を付ける・sign と同語源）。",
    },
  ],
  // assist (30118)
  [
    30118,
    {
      coreImage:
        "「何かをしようとしている人の傍らで力を貸す・援助する」のがコアイメージ。主体はあくまで相手で、自分は「助っ人」として機能する。",
      usage:
        "「assist with a project（プロジェクトを手伝う）」「How may I assist you?（どのようにお手伝いできますか？）」「assistant manager（アシスタントマネージャー）」「customer assistance（顧客サポート）」のように使う。",
      synonymDifference:
        "assist vs help vs support: assist はより格式ばった・専門的な援助（assist with surgery）。help は日常的な「手伝う」全般。support は継続的な「支持・後援・サポート」（emotional support）。",
      englishDefinition:
        "To help someone do something; to make it easier for someone to do something.",
      etymology:
        "ラテン語 assistere（傍らに立つ）から。ad-（傍らに）＋ sistere（立つ・stand と関連）。",
    },
  ],
  // attach (30119)
  [
    30119,
    {
      coreImage:
        "「あるものに別のものをくっつける・結び付ける」のがコアイメージ。メールへのファイル添付も、書類のクリップ留めも「attach」。",
      usage:
        "「attach a file（ファイルを添付する）」「Please find the document attached.（添付書類をご参照ください）」「attach importance to（〜を重視する）」のように使う。",
      synonymDifference:
        "attach vs enclose vs connect: attach は物理的・電子的にくっつける広い語。enclose は封筒やパッケージに「同封する」（I enclose my CV）。connect はシステムや機器を「接続する」（connect to the internet）。",
      englishDefinition:
        "To fasten or join one thing to another; to add a file to an email.",
      etymology:
        "古フランス語 atachier（留める）から。a-（〜に）＋ tachier（くぎで留める）。ゲルマン語の「杭・くぎ」に由来。",
    },
  ],
  // attend (30120)
  [
    30120,
    {
      coreImage:
        "「ある場所・イベントに実際に出向いて参加する」のがコアイメージ。単に「行く」のではなく、その場に存在して関与する。",
      usage:
        "「attend a meeting（会議に出席する）」「attend school（学校に通う）」「attendance rate（出席率）」「Will you attend?（出席しますか？）」のように使う。",
      synonymDifference:
        "attend vs participate vs go: attend は場に出席すること（attendance confirmed）。participate はより積極的に関与・参加すること（participate in discussion）。go は単に「行く」行為（go to a meeting）。",
      englishDefinition:
        "To be present at an event; to go to a place regularly.",
      etymology:
        "ラテン語 attendere（〜に注意を向ける）から。ad-（〜に）＋ tendere（伸ばす・tension と同語源）。「気持ちを向けて出向く」のが原義。",
    },
  ],

  // award (30121)
  [
    30121,
    {
      coreImage:
        "「優れた業績・貢献に対して正式に贈られる賞・賞金」がコアイメージ。動詞では「授与する・与える」の意味にもなる。",
      usage:
        "「receive an award（賞を受賞する）」「award ceremony（授賞式）」「award a contract（契約を授与する）」「award-winning product（受賞製品）」のように使う。",
      synonymDifference:
        "award vs prize vs reward: award は正式な評価機関から贈られる賞。prize はコンテスト・競争で勝った賞（first prize）。reward は努力・貢献に対する見返り・報奨（reward for hard work）。",
      englishDefinition:
        "A prize or certificate given for achievement; to officially give someone a prize or money.",
      etymology:
        "古ノルマン語 awarder（注意深く見て決定する）から。a-（〜に）＋ warder（保護する・ward と同語源）。",
    },
  ],
  // baggage (30122)
  [
    30122,
    {
      coreImage:
        "「旅行時に携帯する荷物全体」がコアイメージ。主にアメリカ英語で使われ、スーツケース・バッグ類の総称。",
      usage:
        "「baggage claim（手荷物受取所）」「check baggage（荷物を預ける）」「carry-on baggage（機内持ち込み荷物）」「emotional baggage（精神的な重荷〈比喩〉）」のように使う。",
      synonymDifference:
        "baggage vs luggage: baggage はアメリカ英語でより一般的（baggage claim）。luggage はイギリス英語でより一般的（luggage rack）。どちらも不可算名詞で複数形は使わない。",
      englishDefinition:
        "Bags and suitcases that you take on a trip.",
      etymology:
        "フランス語 bagage（荷物の束）から。bague（束）に由来し、旅人が荷物をまとめた状態。",
    },
  ],
  // balance (30123)
  [
    30123,
    {
      coreImage:
        "「両側が等しい状態・釣り合い」のがコアイメージ。銀行の「残高」も、天秤の「バランス」も、仕事と生活の「均衡」も同じ語。",
      usage:
        "「account balance（口座残高）」「balance sheet（貸借対照表）」「work-life balance（仕事と生活の均衡）」「balance the budget（予算を均衡させる）」のように使う。",
      synonymDifference:
        "balance vs equilibrium: balance は日常的・実用的な「釣り合い・残高」。equilibrium はより科学的・抽象的な「平衡状態」（chemical equilibrium）。",
      englishDefinition:
        "A situation in which different things exist in equal amounts; the amount of money in a bank account.",
      etymology:
        "ラテン語 bilanx（二皿の天秤）から。bi-（二つの）＋ lanx（皿）。",
    },
  ],
  // ban (30124)
  [
    30124,
    {
      coreImage:
        "「権限のある者が特定の行為・物を正式に禁止する」のがコアイメージ。違反した場合は制裁・罰則がある公式禁止。",
      usage:
        "「ban smoking（喫煙を禁止する）」「ban a product（製品を販売禁止にする）」「trade ban（貿易禁止）」「lift a ban（禁止を解除する）」のように使う。",
      synonymDifference:
        "ban vs prohibit vs restrict: ban は完全な禁止（no exceptions）。prohibit は法律・規則による禁止（more formal）。restrict は特定の条件・範囲での制限（restrict access to certain users）。",
      englishDefinition:
        "To officially say that something is not allowed; an official rule that says something is not allowed.",
      etymology:
        "古英語 bannan（公布する・呪う）から。「法令で公布して禁じる」というのが原義。",
    },
  ],
  // banking (30125)
  [
    30125,
    {
      coreImage:
        "「銀行を通じたお金の保管・移動・貸し借りに関する活動・業界」がコアイメージ。",
      usage:
        "「online banking（オンラインバンキング）」「banking services（銀行サービス）」「banking industry（銀行業界）」「investment banking（投資銀行業務）」のように使う。",
      synonymDifference:
        "banking vs finance: banking は銀行に関連する特定の業務・サービス。finance はより広く金融・資金調達・投資全般を含む（corporate finance = 企業財務）。",
      englishDefinition:
        "The business of a bank; activities relating to managing money in a bank.",
      etymology:
        "bank（銀行）＋ -ing（業務・活動）。bank はイタリア語 banca（両替商の台）から。",
    },
  ],
  // beverage (30126)
  [
    30126,
    {
      coreImage:
        "「水・アルコール・ジュースなど、飲むことができる液体全般」がコアイメージ。drink より格式ばったビジネス・食品業界用語。",
      usage:
        "「alcoholic beverage（アルコール飲料）」「non-alcoholic beverage（ノンアルコール飲料）」「beverage company（飲料会社）」「food and beverage industry（食品飲料業界）」のように使う。",
      synonymDifference:
        "beverage vs drink: beverage は業界用語・フォーマルな文脈（menu, industry reports）で使う。drink は日常的な「飲み物」全般（Can I get you a drink?）。",
      englishDefinition:
        "A liquid for drinking, especially one that is not water.",
      etymology:
        "古フランス語 bevrage（飲むこと）から。ラテン語 bibere（飲む）が語源。",
    },
  ],
  // bill (30127)
  [
    30127,
    {
      coreImage:
        "「受け取ったサービスや商品の代金を請求する紙」がコアイメージ。レストランの「勘定」・公共料金の「請求書」・立法の「法案」まで含む。",
      usage:
        "「pay the bill（代金を支払う）」「electricity bill（電気代）」「Can I have the bill?（お会計をお願いします）」「dollar bill（1ドル紙幣）」「pass a bill（法案を可決する）」のように使う。",
      synonymDifference:
        "bill vs invoice vs receipt: bill は個人向けの請求（レストラン・公共料金）。invoice はビジネス間の正式な請求書（B2B）。receipt は支払い完了後の領収書。",
      englishDefinition:
        "A request for payment; a piece of paper money; a proposed law.",
      etymology:
        "ラテン語 bulla（印章・封印された文書）から。中世の公式文書→請求書に転じた。",
    },
  ],
  // boarding (30128)
  [
    30128,
    {
      coreImage:
        "「乗り物（飛行機・船・電車）に乗り込む行為・プロセス」がコアイメージ。",
      usage:
        "「boarding pass（搭乗券）」「boarding gate（搭乗ゲート）」「boarding time（搭乗時刻）」「now boarding（ただいま搭乗中）」のように使う。",
      synonymDifference:
        "boarding vs embarkation: boarding は日常的に飛行機・電車などに「乗り込む」行為。embarkation はより格式ばった・航海的な「乗船・乗り込み」（embarkation point）。",
      englishDefinition:
        "The process of getting onto an aircraft, ship, or other vehicle.",
      etymology:
        "board（板・船板）＋ -ing。「船の板を渡って乗り込む」行為から転じた。",
    },
  ],
  // branch (30129)
  [
    30129,
    {
      coreImage:
        "「本体から分岐した一部分」がコアイメージ。木の枝・銀行支店・学問の分野など「メインから派生したもの」すべてに使う。",
      usage:
        "「branch office（支店）」「branch manager（支店長）」「branch out（事業を拡大する）」「the Tokyo branch（東京支社）」のように使う。",
      synonymDifference:
        "branch vs subsidiary vs division: branch は本社の出先機関・支店（same legal entity）。subsidiary は法的に独立した子会社（separate company）。division は組織内の事業部門（manufacturing division）。",
      englishDefinition:
        "A part of a company or organization located in a different place; part of a tree that grows from the main trunk.",
      etymology:
        "古フランス語 branche（枝）から。ラテン語 branca（爪・手足）が語源。",
    },
  ],
  // brief (30130)
  [
    30130,
    {
      coreImage:
        "「内容が凝縮されていて短い・簡潔な」のがコアイメージ。長さより情報の密度・的確さに注目する表現。",
      usage:
        "「brief description（簡単な説明）」「brief meeting（短い会議）」「in brief（手短に言うと）」「briefing（ブリーフィング・状況説明）」「brief someone on（〜について説明する）」のように使う。",
      synonymDifference:
        "brief vs short vs concise: brief は内容が適切にまとまっている短さ（positive nuance）。short は単に「長さが短い」（neutral）。concise は無駄のない洗練された簡潔さを強調（concise report）。",
      englishDefinition:
        "Short in time or length; giving only the most important information.",
      etymology:
        "ラテン語 brevis（短い）から。brief・abbreviate・abridge はすべて同語源。",
    },
  ],

  // cargo (30131)
  [
    30131,
    {
      coreImage:
        "「船・飛行機・トラックなどで輸送される商業的な貨物」がコアイメージ。個人の荷物ではなく、ビジネス的な積み荷。",
      usage:
        "「cargo ship（貨物船）」「air cargo（航空貨物）」「cargo hold（貨物室）」「cargo insurance（貨物保険）」のように使う。",
      synonymDifference:
        "cargo vs freight vs shipment: cargo は運搬される貨物そのもの（the cargo was damaged）。freight は貨物輸送サービス・輸送費の意味が強い（freight costs）。shipment は輸送される荷物のまとまり・出荷行為。",
      englishDefinition:
        "Goods carried by a ship, aircraft, or vehicle.",
      etymology:
        "スペイン語 cargo（荷物）から。cargar（積む）＋ ラテン語 carrus（荷車）が語源。",
    },
  ],
  // celebrate (30132)
  [
    30132,
    {
      coreImage:
        "「特別な出来事・達成・記念日を喜んで皆で祝う」のがコアイメージ。個人的な喜びより、共に「祝祭」を行う社交的な行為。",
      usage:
        "「celebrate a birthday（誕生日を祝う）」「celebrate an anniversary（記念日を祝う）」「celebration party（お祝いパーティー）」「worth celebrating（祝う価値がある）」のように使う。",
      synonymDifference:
        "celebrate vs commemorate vs observe: celebrate は喜びを持って祝う（positive）。commemorate は故人の記念や歴史的出来事を「追悼・記念する」（solemn）。observe は宗教的な行事・習慣を「守り執り行う」（observe a holiday）。",
      englishDefinition:
        "To do something enjoyable because of a special occasion or achievement.",
      etymology:
        "ラテン語 celebrare（多くの人と集う・賞賛する）から。celeber（多くの人が集まる場所）に由来。",
    },
  ],
  // certificate (30133)
  [
    30133,
    {
      coreImage:
        "「資格・事実・完了を公式に証明する文書」がコアイメージ。誰かが認めて正式に発行した「証明書」。",
      usage:
        "「certificate of completion（修了証）」「medical certificate（診断書）」「certificate program（資格プログラム）」「birth certificate（出生証明書）」のように使う。",
      synonymDifference:
        "certificate vs license vs diploma: certificate は特定のスキル・資格・事実を証明する文書（training certificate）。license は活動を行うための公的許可証（driver's license）。diploma は学位・卒業資格を示す証書（college diploma）。",
      englishDefinition:
        "An official document that proves you have completed a course or that something is true.",
      etymology:
        "ラテン語 certificare（確かにする）から。certus（確かな・certain と同語源）＋ facere（する）。",
    },
  ],
  // charge (30134)
  [
    30134,
    {
      coreImage:
        "「料金を請求する・任務を課す・充電する・突進する」という「力を込めて向かわせる」のがコアイメージ。",
      usage:
        "「service charge（サービス料）」「charge a fee（料金を請求する）」「in charge of（〜を担当して）」「charge a battery（電池を充電する）」「free of charge（無料で）」のように使う。",
      synonymDifference:
        "charge vs fee vs cost: charge は特定のサービスに対して課される料金（service charge）。fee は専門家への報酬・サービス料（lawyer's fee）。cost は実際にかかる金額・コスト全般。",
      englishDefinition:
        "An amount of money asked for a service; to ask for payment; to be responsible for something.",
      etymology:
        "ラテン語 carrus（荷車）から。「荷を積む→負担を課す→料金を課す」に転じた。",
    },
  ],
  // commute (30135)
  [
    30135,
    {
      coreImage:
        "「自宅と職場・学校の間を定期的に往復する」のがコアイメージ。日本語の「通勤」とほぼ同義。",
      usage:
        "「commute to work（職場に通勤する）」「daily commute（毎日の通勤）」「commuting time（通勤時間）」「long commute（長い通勤）」「commuter（通勤者）」のように使う。",
      synonymDifference:
        "commute vs travel vs transit: commute は自宅〜職場の定期的な往復に特化。travel はより広い「移動・旅行」全般。transit は乗り換え・通過の移動（in transit = 輸送中）。",
      englishDefinition:
        "To travel regularly between your home and workplace; the journey made regularly between home and work.",
      etymology:
        "ラテン語 commutare（完全に変える）から。通期定期券（commutation ticket）の略称として「定期的に往復する」の意味になった。",
    },
  ],
  // compare (30136)
  [
    30136,
    {
      coreImage:
        "「2つ以上のものを並べてどう同じ・どう違うかを調べる」のがコアイメージ。差異・共通点を明確にするための分析行為。",
      usage:
        "「compare prices（価格を比較する）」「compare with（〜と比較する）」「compared to last year（昨年と比べて）」「comparison（比較）」「beyond compare（比類なき）」のように使う。",
      synonymDifference:
        "compare vs contrast: compare は共通点と違いを含め広く比較する。contrast は特に違いに焦点を当てる（compare and contrast = 比較対照する）。",
      englishDefinition:
        "To look at the similarities and differences between two or more things.",
      etymology:
        "ラテン語 comparare（同等に置く）から。com-（共に）＋ par（等しい・par と同語源）。",
    },
  ],
  // competition (30137)
  [
    30137,
    {
      coreImage:
        "「限られたリソース・勝利・市場シェアを複数の相手と奪い合う状況」がコアイメージ。ビジネス競争も、スポーツ大会も同じ語。",
      usage:
        "「fierce competition（激しい競争）」「competition from rivals（競合他社との競争）」「enter a competition（コンテストに参加する）」「sales competition（販売コンテスト）」のように使う。",
      synonymDifference:
        "competition vs contest vs rivalry: competition は市場・スポーツなど幅広い競争全般。contest はより限定された規則のある競技・コンテスト（essay contest）。rivalry は継続的・感情的な「ライバル関係」（business rivalry）。",
      englishDefinition:
        "The activity of competing with others; an organized event where people try to win.",
      etymology:
        "ラテン語 competere（共に求める）から。com-（共に）＋ petere（求める）。",
    },
  ],
  // concentrate (30138)
  [
    30138,
    {
      coreImage:
        "「一点に向けて意識・エネルギー・物質を集中させる」のがコアイメージ。注意を集中することも、物質を濃縮することも「concentrate」。",
      usage:
        "「concentrate on work（仕事に集中する）」「concentrate efforts（努力を集中させる）」「concentrated solution（濃縮液）」「I can't concentrate.（集中できない）」のように使う。",
      synonymDifference:
        "concentrate vs focus: concentrate は広く分散したものを一点に集める。focus はレンズでピントを合わせるように、特定の点に向きを絞る（focus on priorities）。",
      englishDefinition:
        "To give all your attention or effort to something; to bring or come together in one place.",
      etymology:
        "ラテン語 concentrare（中心に集める）から。con-（共に）＋ centrum（中心・center と同語源）。",
    },
  ],
  // concern (30139)
  [
    30139,
    {
      coreImage:
        "「ある問題・出来事が自分に関係していて、気になる・心配する」のがコアイメージ。「関係する」と「心配する」は同じ語から。",
      usage:
        "「express concern（懸念を表明する）」「concern about safety（安全への懸念）」「It concerns me.（気になる・心配だ）」「as far as...is concerned（〜に関する限り）」のように使う。",
      synonymDifference:
        "concern vs worry vs anxiety: concern は正当な理由のある心配・懸念（reasoned worry）。worry は漠然とした・継続的な不安。anxiety はより深く精神的な「不安・緊張」（anxiety disorder）。",
      englishDefinition:
        "A feeling of worry about something important; something that is important to you.",
      etymology:
        "ラテン語 concernere（ふるいにかけて混ぜる）から。con-（共に）＋ cernere（区別する）。「関わりを持つ」の意に転じた。",
    },
  ],
  // conduct (30140)
  [
    30140,
    {
      coreImage:
        "「一定のやり方・管理のもとに活動を進める・実施する」のがコアイメージ。組織的・計画的に「行う」行為。",
      usage:
        "「conduct a survey（調査を実施する）」「conduct a meeting（会議を進行する）」「code of conduct（行動規範）」「professional conduct（プロらしい行動）」のように使う。",
      synonymDifference:
        "conduct vs perform vs carry out: conduct は組織的・計画的に「実施する・運営する」（conduct research）。perform は技術・能力を発揮して「行う」（perform surgery）。carry out は決定や計画を「実行する」（carry out a plan）。",
      englishDefinition:
        "To organize and carry out an activity; the way someone behaves.",
      etymology:
        "ラテン語 conducere（共に引く）から。con-（共に）＋ ducere（引く・leader と同語源）。",
    },
  ],

  // confirm (30141)
  [
    30141,
    {
      coreImage:
        "「既存の情報・約束・予約を公式に確認して確実にする」のがコアイメージ。疑いを払拭し、実行を確定させる行為。",
      usage:
        "「confirm a reservation（予約を確認する）」「confirm an appointment（約束を確認する）」「Please confirm by email.（メールで確認してください）」のように使う。",
      synonymDifference:
        "confirm vs verify vs check: confirm は正しさ・実行を公式に認める（confirm attendance）。verify は証拠を示して「検証・証明する」（verify identity）。check はただ調べる・確認する軽い動作（check the schedule）。",
      englishDefinition:
        "To state or show that something is definitely true; to make an arrangement certain.",
      etymology:
        "ラテン語 confirmare（強固にする）から。con-（完全に）＋ firmare（固める・firm と同語源）。",
    },
  ],
  // connect (30142)
  [
    30142,
    {
      coreImage:
        "「分離していた2つ以上のものをつなぐ・接続する」のがコアイメージ。電子機器の接続から、人と人のネットワーキングまで幅広く使う。",
      usage:
        "「connect to Wi-Fi（Wi-Fiに接続する）」「connect people（人を結びつける）」「well-connected（人脈がある）」「connection（接続・つながり・乗り継ぎ）」のように使う。",
      synonymDifference:
        "connect vs link vs join: connect は電気・デジタル・人間関係のつながりに広く使う。link は特定の2点を結ぶ（hyperlink・linked together）。join は1つにまとまる・一体化する（join the team）。",
      englishDefinition:
        "To join or link two or more things together; to establish communication between devices or people.",
      etymology:
        "ラテン語 connectere（ともに結ぶ）から。con-（共に）＋ nectere（結ぶ・nexus と同語源）。",
    },
  ],
  // consequence (30143)
  [
    30143,
    {
      coreImage:
        "「ある行為・出来事の後に続いて起きる結果・影響」がコアイメージ。特に否定的・重大な結果に使われることが多い。",
      usage:
        "「face the consequences（結果を受け入れる）」「consequence of the decision（決定の影響）」「serious consequences（深刻な結果）」「as a consequence（その結果として）」のように使う。",
      synonymDifference:
        "consequence vs result vs outcome: consequence はある行為から続いて「引き起こされた」結果（因果関係が強く、ネガティブなニュアンス）。result は原因から生じた「結果」全般（neutral）。outcome は最終的にどうなったかという「成果・結末」（the project outcome）。",
      englishDefinition:
        "A result or effect of an action or condition, especially an unwanted one.",
      etymology:
        "ラテン語 consequi（後に続く）から。con-（共に）＋ sequi（続く・sequence と同語源）。",
    },
  ],
  // consider (30144)
  [
    30144,
    {
      coreImage:
        "「決断する前に、様々な角度から注意深く思い巡らす」のがコアイメージ。即決ではなく、時間をかけて「検討する」行為。",
      usage:
        "「consider a proposal（提案を検討する）」「I'm considering leaving.（退職を検討しています）」「all things considered（すべてを考慮すると）」「consideration（考慮・配慮）」のように使う。",
      synonymDifference:
        "consider vs think vs deliberate: consider は複数の側面から慎重に判断する（consider all options）。think はより一般的な「思考」全般。deliberate は意図的・慎重に「審議する」（deliberate over a decision）。",
      englishDefinition:
        "To think carefully about something before making a decision; to regard something in a particular way.",
      etymology:
        "ラテン語 considerare（星を観察する）から。con-（完全に）＋ sidus（星）。星を観察して吉凶を占うことから「注意深く調べる」の意に転じた。",
    },
  ],
  // consume (30145)
  [
    30145,
    {
      coreImage:
        "「資源・エネルギー・時間などを使い切る・食べる」のがコアイメージ。何かを「消費することで減らしていく」行為。",
      usage:
        "「consume energy（エネルギーを消費する）」「consume food（食物を消費する）」「time-consuming（時間がかかる）」「consumer behavior（消費者行動）」のように使う。",
      synonymDifference:
        "consume vs use vs spend: consume は使い切る・食べ尽くすニュアンス（finishes it up）。use は広く使う・利用する（use a resource）。spend は主にお金や時間を「費やす」（spend money）。",
      englishDefinition:
        "To use or eat something so that it is finished; to use resources or energy.",
      etymology:
        "ラテン語 consumere（使い切る）から。con-（完全に）＋ sumere（取る・assume と同語源）。",
    },
  ],
  // contribute (30146)
  [
    30146,
    {
      coreImage:
        "「共同の目的のために自分の力・時間・お金を差し出す」のがコアイメージ。全体の成果の一部として「貢献する」行為。",
      usage:
        "「contribute to a project（プロジェクトに貢献する）」「contribute financially（資金面で貢献する）」「contribution（貢献・寄付・寄稿）」「significant contribution（多大な貢献）」のように使う。",
      synonymDifference:
        "contribute vs donate vs invest: contribute は時間・知識・お金を共同目的に提供する幅広い語。donate は慈善・公共目的への「寄付」（donate to charity）。invest は将来のリターンを期待してお金を「投資する」（invest in stocks）。",
      englishDefinition:
        "To give something, especially money or effort, toward a shared goal.",
      etymology:
        "ラテン語 contribuere（一緒に運ぶ）から。con-（共に）＋ tribuere（割り当てる・tribute と同語源）。",
    },
  ],
  // cooperation (30147)
  [
    30147,
    {
      coreImage:
        "「複数の人・組織が共通の目的に向けて力を合わせて取り組む」のがコアイメージ。単純な「手伝い」ではなく「協働」の概念。",
      usage:
        "「Thank you for your cooperation.（ご協力ありがとうございます）」「international cooperation（国際協力）」「cooperation agreement（協力協定）」のように使う。",
      synonymDifference:
        "cooperation vs collaboration vs partnership: cooperation は目的に向けて互いに協力すること。collaboration はより深い共同作業・共創（co-create）。partnership は法的・ビジネス的な「提携関係」（business partnership）。",
      englishDefinition:
        "The act of working with someone else toward a shared goal.",
      etymology:
        "ラテン語 cooperari（共に働く）から。co-（共に）＋ operari（働く・operate と同語源）。",
    },
  ],
  // coupon (30148)
  [
    30148,
    {
      coreImage:
        "「提示することで割引・特典を受けられる券」がコアイメージ。購買を促進するために発行される。",
      usage:
        "「use a coupon（クーポンを使う）」「coupon code（クーポンコード）」「redeem a coupon（クーポンを使用する）」「discount coupon（割引クーポン）」のように使う。",
      synonymDifference:
        "coupon vs voucher: coupon は主に割引を受けるための券（10% off coupon）。voucher はより広く、特定サービスを受けるための「引換券・証明書」（gift voucher = 商品券）。",
      englishDefinition:
        "A ticket or piece of paper that allows you to get a discount or free item.",
      etymology:
        "フランス語 coupon（切り取り券）から。couper（切る）が語源。「切り取って使う券」が原義。",
    },
  ],
  // current (30149)
  [
    30149,
    {
      coreImage:
        "「今この瞬間に存在している・今に関連している」のがコアイメージ。名詞では「流れ（電流・海流）」の意味にもなる。",
      usage:
        "「current situation（現状）」「current employees（現在の従業員）」「current account（当座預金）」「electric current（電流）」「keep current（最新情報を保つ）」のように使う。",
      synonymDifference:
        "current vs present vs recent: current は「今まさに起きている・適用されている」（current policy）。present は「今この時に」（at present = 現在）。recent は「最近の・少し前の」（recent news）。",
      englishDefinition:
        "Happening or existing now; a flow of water, air, or electricity.",
      etymology:
        "ラテン語 currens（流れている）から。currere（走る・run）の現在分詞。「今流れているもの」が転じて「現在の」に。",
    },
  ],
  // delay (30150)
  [
    30150,
    {
      coreImage:
        "「予定より遅れる・遅らせる」のがコアイメージ。自然に遅れる場合も、意図的に延ばす場合も使える。",
      usage:
        "「flight delay（フライトの遅延）」「without delay（遅延なく）」「delay a decision（決断を先送りにする）」「due to delays（遅延のため）」のように使う。",
      synonymDifference:
        "delay vs postpone vs defer: delay は予定より遅れる一般的な語（unexpected delay）。postpone は意図的に後の日時に移す（postpone a meeting）。defer は正式・義務を「後回しにする」（defer payment = 支払いを猶予する）。",
      englishDefinition:
        "To make something happen later than planned; the time that something is late.",
      etymology:
        "古フランス語 delaiier（引き延ばす）から。de-（離れて）＋ laier（置く・leave と関連）。",
    },
  ],

  // demand (30151)
  [
    30151,
    {
      coreImage:
        "「強く・はっきりと要求する」または「市場での商品への需要」がコアイメージ。強制的なニュアンスを持つ「強い要求」。",
      usage:
        "「high demand（高需要）」「meet demand（需要を満たす）」「demand a refund（返金を要求する）」「supply and demand（需要と供給）」「in demand（需要がある・引っ張りだこ）」のように使う。",
      synonymDifference:
        "demand vs request vs require: demand は強制的・非妥協的に求める（aggressive）。request は丁寧に「お願いする」。require は状況・ルールが必要とする（formal requirement）。",
      englishDefinition:
        "A strong request for something; the desire of consumers for goods or services.",
      etymology:
        "ラテン語 demandare（完全に委ねる）から。de-（完全に）＋ mandare（命じる・mandate と同語源）。",
    },
  ],
  // demonstrate (30152)
  [
    30152,
    {
      coreImage:
        "「見せることで証明する・実演して理解させる」のがコアイメージ。口頭説明ではなく、実際に示すことで確信させる行為。",
      usage:
        "「demonstrate how to use（使い方を実演する）」「demonstrate a product（製品をデモする）」「demonstration（デモ・実演・デモ行進）」「demonstrate skills（スキルを示す）」のように使う。",
      synonymDifference:
        "demonstrate vs show vs prove: demonstrate は実演・証拠で示す（hands-on）。show は見せることの一般的な語。prove は論理・証拠によって「証明する」（prove a theory）。",
      englishDefinition:
        "To show how something works; to prove something by giving evidence.",
      etymology:
        "ラテン語 demonstrare（完全に示す）から。de-（完全に）＋ monstrare（示す・monster と同語源）。",
    },
  ],
  // departure (30153)
  [
    30153,
    {
      coreImage:
        "「ある場所から離れて出発する行為・時刻」がコアイメージ。到着（arrival）の反対。比喩的に「従来と異なること」にも使う。",
      usage:
        "「departure time（出発時刻）」「departure gate（出発ゲート）」「departure lounge（出発ロビー）」「a departure from tradition（従来からの転換）」のように使う。",
      synonymDifference:
        "departure vs exit vs takeoff: departure は公式・正式な「出発・離脱」全般。exit は「退場・出口」（emergency exit）。takeoff は飛行機が離陸することに特化した語。",
      englishDefinition:
        "The act of leaving a place; the time a journey begins.",
      etymology:
        "depart（出発する）＋ -ure（名詞化）。depart はラテン語 dispartire（分離する）から。",
    },
  ],
  // describe (30154)
  [
    30154,
    {
      coreImage:
        "「言葉で詳しく伝えて相手に理解させる」のがコアイメージ。特徴・状況・出来事を「言語化する」行為。",
      usage:
        "「describe a problem（問題を説明する）」「describe in detail（詳しく説明する）」「description（説明・記述）」「job description（職務記述書）」のように使う。",
      synonymDifference:
        "describe vs explain vs depict: describe は何かの特徴・状態を言葉で伝える（describe symptoms）。explain は原因・理由・仕組みを「説明する」（explain how it works）。depict は文章・絵・映像などで「描写する」（depict a scene）。",
      englishDefinition:
        "To say or write what someone or something is like using words.",
      etymology:
        "ラテン語 describere（書き写す）から。de-（完全に）＋ scribere（書く・script と同語源）。",
    },
  ],
  // destination (30155)
  [
    30155,
    {
      coreImage:
        "「向かっている・向かう予定の最終的な目的地」がコアイメージ。旅行・配送・人生の目標すべての「終点」。",
      usage:
        "「final destination（最終目的地）」「travel destination（旅行先）」「reach your destination（目的地に到着する）」「popular destination（人気の観光地）」のように使う。",
      synonymDifference:
        "destination vs goal vs target: destination は物理的な「到達点・目的地」。goal は達成したい「目標・目的」（business goal）。target は数値・対象を明確にした「ターゲット・目標値」（sales target）。",
      englishDefinition:
        "The place to which someone or something is traveling or being sent.",
      etymology:
        "ラテン語 destinare（確定する・固める）から。de-（完全に）＋ stanare（固定する・stand と関連）。「到達点として固めた場所」のが原義。",
    },
  ],
  // device (30156)
  [
    30156,
    {
      coreImage:
        "「特定の目的のために設計・製造された機器・装置」がコアイメージ。スマホ・センサー・医療機器など「道具立て」全般。",
      usage:
        "「mobile device（モバイル端末）」「electronic device（電子機器）」「input device（入力装置）」「device management（デバイス管理）」のように使う。",
      synonymDifference:
        "device vs equipment vs tool: device はある機能のために設計された比較的小型の機器。equipment は業務で使う設備・機器の総称（office equipment）。tool は手作業で使う道具・ツール（productivity tool）。",
      englishDefinition:
        "A piece of equipment designed for a particular purpose.",
      etymology:
        "ラテン語 divisum（分けられたもの）から。deviser（計画する）と同語源。「計画して設計したもの」が原義。",
    },
  ],
  // directory (30157)
  [
    30157,
    {
      coreImage:
        "「情報を整理して参照しやすくしたリスト・一覧」がコアイメージ。電話帳・社員名簿・コンピュータのフォルダすべてが「directory」。",
      usage:
        "「phone directory（電話帳）」「employee directory（社員名簿）」「business directory（企業情報一覧）」「root directory（ルートディレクトリ）」のように使う。",
      synonymDifference:
        "directory vs list vs index: directory は人・組織・ファイルの体系的な一覧（structured lookup）。list は単純な列挙。index は情報を探しやすいよう整理した「索引」（book index）。",
      englishDefinition:
        "A book or computer file listing names, organizations, or files in alphabetical order.",
      etymology:
        "ラテン語 directorium（案内・指示するもの）から。dirigere（導く・direct と同語源）。",
    },
  ],
  // distribute (30158)
  [
    30158,
    {
      coreImage:
        "「複数の場所・人に広く分けて配る」のがコアイメージ。1か所に集中させるのではなく、広く「配布・流通」させる行為。",
      usage:
        "「distribute flyers（チラシを配布する）」「distribute products（製品を流通させる）」「distribution channel（流通チャネル）」「evenly distributed（均等に分配された）」のように使う。",
      synonymDifference:
        "distribute vs deliver vs supply: distribute は広く多くの場所・人に分配する（wide distribution）。deliver は特定の場所へ届ける（one-to-one delivery）。supply は継続的に必要なものを補充・供給する。",
      englishDefinition:
        "To give or send something to a number of people or places; to spread something over an area.",
      etymology:
        "ラテン語 distribuere（分けて割り当てる）から。dis-（分離）＋ tribuere（割り当てる・tribute と同語源）。",
    },
  ],
  // domestic (30159)
  [
    30159,
    {
      coreImage:
        "「国の内部・家庭の内部」に関することがコアイメージ。外国（international）や外部（外食など）の反対として使う。",
      usage:
        "「domestic flight（国内線）」「domestic market（国内市場）」「domestic product（国産品）」「domestic issues（国内問題）」のように使う。",
      synonymDifference:
        "domestic vs local vs national: domestic は国内全体・家庭内を指す（domestic vs international）。local は特定の地域・地元に関する（local office）。national は国家レベル全体に関する（national policy）。",
      englishDefinition:
        "Relating to the home, family, or inside a country rather than foreign.",
      etymology:
        "ラテン語 domesticus（家の）から。domus（家・dome と同語源）。",
    },
  ],
  // earn (30160)
  [
    30160,
    {
      coreImage:
        "「労働・努力・能力の対価として報酬を得る」のがコアイメージ。棚から牡丹餅ではなく、「正当に稼ぐ・手に入れる」行為。",
      usage:
        "「earn a salary（給与を稼ぐ）」「earn points（ポイントを獲得する）」「earn a promotion（昇進に値することをする）」「earning potential（収入ポテンシャル）」のように使う。",
      synonymDifference:
        "earn vs make vs gain: earn は努力・労働の正当な対価として得る（earn trust）。make はより一般的にお金・物を得る（make money）。gain は特定の物（weight, experience）を増やす・得る（gain knowledge）。",
      englishDefinition:
        "To receive money as payment for work; to deserve something through effort.",
      etymology:
        "古英語 earnian（稼ぐ）から。もともと「収穫の季節に稼ぐ」という意味。",
    },
  ],

  // effective (30161)
  [
    30161,
    {
      coreImage:
        "「意図した効果・成果をきちんと生み出している」のがコアイメージ。努力や行動が「機能している・成果が出ている」状態。",
      usage:
        "「effective communication（効果的なコミュニケーション）」「cost-effective（費用対効果の高い）」「effective immediately（即日効力）」「highly effective（非常に効果的）」のように使う。",
      synonymDifference:
        "effective vs efficient vs productive: effective は目標・成果を達成している（doing the right things）。efficient はリソースを無駄なく使う（doing things right）。productive は多くの成果・成果物を生み出している（productive meeting）。",
      englishDefinition:
        "Producing the desired result; in operation.",
      etymology:
        "ラテン語 effectivus（実現する力のある）から。effect（結果・効果）＋ -ive（形容詞化）。",
    },
  ],
  // efficient (30162)
  [
    30162,
    {
      coreImage:
        "「無駄なリソースを使わずに目的を達成できる」のがコアイメージ。時間・コスト・エネルギーの「無駄のなさ」。",
      usage:
        "「fuel-efficient（燃費の良い）」「efficient process（効率的なプロセス）」「energy-efficient（省エネの）」「work efficiently（効率よく働く）」のように使う。",
      synonymDifference:
        "efficient vs effective vs streamlined: efficient はリソースを無駄なく使う（speed and economy）。effective は目標を達成している（results focused）。streamlined は不要なものを取り除いてシンプルにした（streamlined workflow）。",
      englishDefinition:
        "Working or operating quickly and effectively without wasting time or energy.",
      etymology:
        "ラテン語 efficiens（実現させる）から。ex-（外に）＋ facere（する・factory と同語源）の現在分詞。",
    },
  ],
  // encourage (30163)
  [
    30163,
    {
      coreImage:
        "「勇気・自信を与えて、行動・挑戦を後押しする」のがコアイメージ。心理的な「心の支え」を提供する行為。",
      usage:
        "「encourage employees（社員を励ます）」「encourage participation（参加を奨励する）」「encouraging words（励ましの言葉）」「encouraging results（心強い結果）」のように使う。",
      synonymDifference:
        "encourage vs motivate vs inspire: encourage は不安・迷いのある人に「やってみて」と後押しする（reassurance）。motivate は行動するための「動機・モチベーション」を与える。inspire は感動・例によって「創造的に奮い立たせる」（inspirational）。",
      englishDefinition:
        "To give someone support, confidence, or hope to make them want to do something.",
      etymology:
        "en-（中に）＋ courage（勇気）。「相手の中に勇気を注ぐ」のが原義。",
    },
  ],
  // entire (30164)
  [
    30164,
    {
      coreImage:
        "「欠けた部分のない・完全な全体」がコアイメージ。「全員・全部・全期間」を強調する語。",
      usage:
        "「the entire team（チーム全員）」「the entire day（一日中）」「entire company（会社全体）」「entirely（完全に・全く）」のように使う。",
      synonymDifference:
        "entire vs whole vs complete: entire は量・範囲の全部を強調（the entire budget）。whole はひとつの単位としての全体（the whole picture）。complete は必要な要素が全部揃っている（complete set）。",
      englishDefinition:
        "Including all parts; with nothing missing.",
      etymology:
        "ラテン語 integer（完全な・intact）から。in-（否定）＋ tangere（触れる）。「触れられていない・無傷の」が原義。",
    },
  ],
  // entrance (30165)
  [
    30165,
    {
      coreImage:
        "「中に入るための場所・入口」または「中に入る行為」がコアイメージ。",
      usage:
        "「main entrance（正面玄関）」「entrance fee（入場料）」「entrance exam（入学試験）」「make an entrance（颯爽と入場する）」のように使う。",
      synonymDifference:
        "entrance vs entry vs access: entrance は物理的な「入口・玄関」に焦点（the entrance to the building）。entry は入ることの行為・資格（entry requirements）。access は近づける・利用できる状態（access to information）。",
      englishDefinition:
        "The door or opening through which you enter a place; the act of going into a place.",
      etymology:
        "enter（入る）＋ -ance（名詞化）。ラテン語 intrare（中に入る）から。",
    },
  ],
  // equipment (30166)
  [
    30166,
    {
      coreImage:
        "「仕事・活動に必要な道具・機器一式」がコアイメージ。個々の道具ではなく「必要なものが揃った状態」を不可算名詞で表す。",
      usage:
        "「office equipment（オフィス機器）」「sports equipment（スポーツ用品）」「medical equipment（医療機器）」「equipment failure（機器障害）」のように使う。",
      synonymDifference:
        "equipment vs tool vs device: equipment は業務・活動に必要な大型・総合的な機器（lab equipment）。tool は手作業に使う具体的な道具（hand tool）。device は特定機能のある小型機器（electronic device）。",
      englishDefinition:
        "The tools, machines, or clothing needed for a particular activity.",
      etymology:
        "equip（装備する）＋ -ment（名詞化）。古フランス語 equiper（船を装備する）から。",
    },
  ],
  // essential (30167)
  [
    30167,
    {
      coreImage:
        "「それなしには存在・機能できない、絶対に必要な」のがコアイメージ。「あると良い」ではなく「なければならない」という強い必要性。",
      usage:
        "「essential skill（必須スキル）」「essential worker（エッセンシャルワーカー）」「essential oils（エッセンシャルオイル）」「it is essential to（〜することが不可欠だ）」のように使う。",
      synonymDifference:
        "essential vs necessary vs crucial: essential は核となる本質的な必要性（the essentials）。necessary は状況・目的のために必要（necessary documents）。crucial は重大な局面での「決定的に重要な」（crucial decision）。",
      englishDefinition:
        "Absolutely necessary; most important.",
      etymology:
        "ラテン語 essentialis（本質の）から。esse（存在する・be と同語源）。「存在の核心」というのが原義。",
    },
  ],
  // establish (30168)
  [
    30168,
    {
      coreImage:
        "「組織・制度・事実を公式にしっかりと作り上げる・確立する」のがコアイメージ。一時的ではなく、長続きする基盤を作る行為。",
      usage:
        "「establish a company（会社を設立する）」「established in 1990（1990年設立）」「establish a relationship（関係を築く）」「well-established（確立された・定評のある）」のように使う。",
      synonymDifference:
        "establish vs found vs set up: establish は公式・正式に組織・制度を構築する（formal）。found は組織・機関を初めて「創立する」（the founding father）。set up はより実務的に「準備して始める」（set up a system）。",
      englishDefinition:
        "To start or create something that is meant to last a long time; to prove something is true.",
      etymology:
        "ラテン語 stabilire（固める）から。stabilis（安定した・stable と同語源）。「揺るがない基盤を作る」のが原義。",
    },
  ],
  // exhibit (30169)
  [
    30169,
    {
      coreImage:
        "「人々が見られるよう公の場に展示・陳列する」のがコアイメージ。美術館の展示から、商品の展示会まで「公開して見せる」行為。",
      usage:
        "「exhibit art（アートを展示する）」「exhibition（展覧会・展示会）」「trade exhibit（見本市・商品展示）」「exhibit signs of（〜の兆候を見せる）」のように使う。",
      synonymDifference:
        "exhibit vs display vs show: exhibit はより正式・公式な展覧会での展示（museum exhibit）。display は日常的・商業的な「陳列・表示」（product display）。show は広く「見せる」行為全般。",
      englishDefinition:
        "To show something in public; something shown at an exhibition.",
      etymology:
        "ラテン語 exhibere（外に保持する・提示する）から。ex-（外に）＋ habere（持つ・have と同語源）。",
    },
  ],
  // expand (30170)
  [
    30170,
    {
      coreImage:
        "「大きさ・範囲・規模を広げて拡大する」のがコアイメージ。物理的な膨張も、ビジネスの拡大も、知識の広がりも「expand」。",
      usage:
        "「expand the business（事業を拡大する）」「expand overseas（海外に進出する）」「expand knowledge（知識を広げる）」「expanding market（成長市場）」のように使う。",
      synonymDifference:
        "expand vs grow vs scale: expand は現在の規模から広げる（expand operations）。grow は時間をかけて大きくなる（grow the company）。scale は比例的に規模を変える（scale up = 増強する、scale down = 縮小する）。",
      englishDefinition:
        "To become or make something larger in size, number, or range.",
      etymology:
        "ラテン語 expandere（広げる）から。ex-（外に）＋ pandere（広げる）。",
    },
  ],

  // expect (30171)
  [
    30171,
    {
      coreImage:
        "「起きるだろうと思って待つ・予期する」のがコアイメージ。hope（望む）と違い、事実として起こる可能性が高いと判断する「予測」。",
      usage:
        "「expect results（結果を期待する）」「as expected（予想通りに）」「unexpected（予想外の）」「I expect you to finish by Monday.（月曜までに終わらせると思っている）」のように使う。",
      synonymDifference:
        "expect vs hope vs anticipate: expect は根拠があって「当然起こる」と思う。hope は起きてほしいと願う（uncertain）。anticipate は楽しみにして待ちつつ、前もって準備する（anticipate demand）。",
      englishDefinition:
        "To think that something will happen; to think that someone should do something.",
      etymology:
        "ラテン語 expectare（外を見つめて待つ）から。ex-（外を）＋ spectare（見る・spectacle と同語源）。",
    },
  ],
  // expire (30172)
  [
    30172,
    {
      coreImage:
        "「有効期間が終わって使えなくなる・息が尽きる」のがコアイメージ。契約・パスポート・クーポンなどの「期限切れ」。",
      usage:
        "「the contract expires（契約が切れる）」「expiration date（有効期限）」「expired coupon（期限切れクーポン）」「passport expired（パスポートが失効した）」のように使う。",
      synonymDifference:
        "expire vs run out vs lapse: expire は公式に期限が切れる（formal）。run out は在庫・時間がなくなる（informal）。lapse は気づかないうちに失効する・中断する（subscription lapse）。",
      englishDefinition:
        "To come to an end; to be no longer valid after a certain date.",
      etymology:
        "ラテン語 expirare（息を吐き出す）から。ex-（外に）＋ spirare（息をする・spirit と同語源）。「息が尽きる」から「終わる」の意に。",
    },
  ],
  // feature (30173)
  [
    30173,
    {
      coreImage:
        "「製品・人・場所の中で特に目立つ特徴・機能」がコアイメージ。全体ではなく「特に注目すべき要素」。",
      usage:
        "「product features（製品の特長）」「key features（主要機能）」「feature-rich（機能豊富な）」「feature someone in an article（記事で誰かを特集する）」のように使う。",
      synonymDifference:
        "feature vs function vs characteristic: feature は宣伝・説明に使われる「注目すべき要素」（selling point）。function はシステム・機器が実行できる「機能・働き」（core function）。characteristic は生まれ持った・固有の「特性・性質」（characteristic of the brand）。",
      englishDefinition:
        "An important or interesting quality of something; to include someone or something as an important part.",
      etymology:
        "ラテン語 factura（作られたもの）から。facere（作る）が語源。「作り上げられた特徴」が原義。",
    },
  ],
  // feedback (30174)
  [
    30174,
    {
      coreImage:
        "「相手の行動・成果に対して、改善・強化のために返す情報・意見」がコアイメージ。評価というより「次に活かせる反応」。",
      usage:
        "「give feedback（フィードバックを与える）」「receive feedback（フィードバックを受け取る）」「constructive feedback（建設的なフィードバック）」「customer feedback（顧客の声）」のように使う。",
      synonymDifference:
        "feedback vs review vs evaluation: feedback は即時・具体的な「反応・意見」（actionable）。review は完成した製品・サービスへの評価・批評。evaluation は体系的・公式な「評価・査定」（performance evaluation）。",
      englishDefinition:
        "Advice or information about how well someone or something has performed.",
      etymology:
        "feed（供給する）＋ back（返す）。電気工学の「フィードバック回路」から転じて「情報を返す」の意味に。",
    },
  ],
  // frequent (30175)
  [
    30175,
    {
      coreImage:
        "「短い間隔で何度も繰り返し起こる」のがコアイメージ。頻度の高さを表す形容詞。",
      usage:
        "「frequent meetings（頻繁な会議）」「frequent traveler（よく旅する人）」「frequent flyer（フリークエントフライヤー）」「frequently asked questions（よくある質問・FAQ）」のように使う。",
      synonymDifference:
        "frequent vs regular vs common: frequent は間隔が短く何度も繰り返す（frequent delays）。regular は決まったパターンで規則的な（regular meetings every Monday）。common は多くの人・場所で見られる一般的な（common practice）。",
      englishDefinition:
        "Happening often; appearing or occurring many times.",
      etymology:
        "ラテン語 frequens（込み合っている・繰り返される）から。farcire（詰め込む）と関連。",
    },
  ],
  // furniture (30176)
  [
    30176,
    {
      coreImage:
        "「部屋・オフィスで使う移動可能な大型の家具類の総称」がコアイメージ。不可算名詞で使う。",
      usage:
        "「office furniture（オフィス家具）」「a piece of furniture（家具1点）」「furniture store（家具店）」「flat-pack furniture（組立式家具）」のように使う。",
      synonymDifference:
        "furniture vs fixture vs equipment: furniture は移動可能な家具（desk, chair）。fixture は壁・床に固定された設備（light fixtures = 照明器具）。equipment はオフィス業務に使う機器・備品（printing equipment）。",
      englishDefinition:
        "Large movable objects such as chairs and tables that are used in a room.",
      etymology:
        "フランス語 fournir（供給する）から。「部屋に必要なものを供給する」のが原義。",
    },
  ],
  // generous (30177)
  [
    30177,
    {
      coreImage:
        "「惜しまず気前よく与える・心が広い」のがコアイメージ。お金・時間・親切心などを豊かに提供する姿勢。",
      usage:
        "「generous donation（惜しみない寄付）」「generous offer（気前の良い申し出）」「generous with time（時間を惜しまない）」「generous benefits（充実した福利厚生）」のように使う。",
      synonymDifference:
        "generous vs kind vs liberal: generous は惜しまずに与える気前の良さ（money/time/gifts）。kind は思いやりのある・親切な態度（kind words）。liberal は政治的寛容さや量の多さ（liberal amount = 気前よく多めに）。",
      englishDefinition:
        "Willing to give more than what is usual or expected; not mean.",
      etymology:
        "ラテン語 generosus（高貴な生まれの）から。genus（家系・生まれ・genus と同語源）。「高貴な生まれは気前がいい」から転じた。",
    },
  ],
  // gradually (30178)
  [
    30178,
    {
      coreImage:
        "「一気にではなく、少しずつ段階的に変化する」のがコアイメージ。急激ではなく、ゆっくりとした変化の速度を表す。",
      usage:
        "「gradually increase（徐々に増加する）」「gradually improve（少しずつ改善される）」「progress gradually（少しずつ前進する）」「gradually becoming clearer（徐々に明らかになる）」のように使う。",
      synonymDifference:
        "gradually vs slowly vs progressively: gradually は段階を踏んで少しずつ変わっていく（step-by-step）。slowly は速度が遅いことに焦点（slow pace）。progressively はより継続的・前進的に変化する（progressively harder）。",
      englishDefinition:
        "Slowly, over a long period of time or in small stages.",
      etymology:
        "gradual（段階的な）＋ -ly（副詞化）。ラテン語 gradus（歩み・ステップ）が語源。",
    },
  ],
  // handle (30179)
  [
    30179,
    {
      coreImage:
        "「手で扱う・責任を持って処理・管理する」のがコアイメージ。物を「手で操作する」ことから、問題・業務を「うまく対処する」まで幅広い。",
      usage:
        "「handle complaints（苦情に対応する）」「handle a situation（状況に対処する）」「difficult to handle（扱いにくい）」「handle with care（取り扱い注意）」のように使う。",
      synonymDifference:
        "handle vs manage vs deal with: handle はその場の状況・物・人に「直接対処する」（hands-on）。manage は計画的・組織的に「管理する」（manage a project）。deal with はより広く「〜に対処する・取り組む」（deal with problems）。",
      englishDefinition:
        "To touch, hold, or use something; to deal with or take responsibility for something.",
      etymology:
        "古英語 handlian（手で扱う）から。hand（手）が語源。「手で直接触れて扱う」のが原義。",
    },
  ],
  // hesitate (30180)
  [
    30180,
    {
      coreImage:
        "「確信が持てず、行動・発言をためらう・ちゅうちょする」のがコアイメージ。決断できずに立ち止まる状態。",
      usage:
        "「Don't hesitate to contact us.（遠慮なくご連絡ください）」「hesitate to answer（答えをためらう）」「without hesitation（ためらわずに）」のように使う。",
      synonymDifference:
        "hesitate vs pause vs waver: hesitate は不安・迷いから行動に踏み出せない（psychological barrier）。pause は一時的に止まる（可能性あり・否定的ではない）。waver は確信が持てず揺れ動く（waver in your decision）。",
      englishDefinition:
        "To pause before doing something because you are uncertain or worried.",
      etymology:
        "ラテン語 haesitare（くっついて離れない）から。haerere（くっつく・adhere と同語源）。「どこかに引っかかって動けない」のが原義。",
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
