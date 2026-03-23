/**
 * 単語拡張データ
 *
 * 単語詳細画面の「コアイメージ」「使い方」「類義語との違い」「英英定義」「語源」
 * セクションに表示するコンテンツを管理する。
 * 単語データ本体（words/）とは分離し、ID をキーとした Map で管理する。
 */

import type { WordExtension } from "@/types";
import type { Word as BaseWord } from "./words/types";
import { allWords } from "./words";
import { exampleJaOverrides } from "./example-ja-overrides";
import { motitownExtensions } from "./word-extensions-motitown";

const _handwrittenExtensions: [number, WordExtension][] = [
  // ── TOEIC 500 ──────────────────────────────────────────────────────────────

  // appointment (30001)
  [
    30001,
    {
      pronunciation: { us: "/əˈpɔɪntmənt/", uk: "/əˈpɔɪntmənt/" },
      coreImage:
        "「特定の時間・場所で誰かと会う」という約束を取り決めた状態がコアイメージ。医師の診察予約や会議予約など、公式・ビジネス的なニュアンスがある。",
      usage:
        "「make an appointment（予約を取る）」「have an appointment（予約がある）」「cancel an appointment（予約をキャンセルする）」の形でよく使われる。日本語の「アポ」はこの単語から。",
      synonymDifference:
        "appointment vs reservation: appointment は主に人との面会（医師・美容師・弁護士など）の予約。reservation は席・部屋・テーブルなど場所や資源の予約に使う。例：doctor's appointment（医師の予約）/ hotel reservation（ホテルの予約）",
      englishDefinition:
        "An arrangement to meet someone at a particular time and place, especially for a professional or official purpose.",
      etymology:
        "15世紀フランス語 appointement（合意・取り決め）から。appoint（指定する）＋ -ment（名詞化）。ラテン語 ad punctum（ある点に向かって）も関連。",
      relatedWords: ["meeting", "booking", "reservation", "schedule"],
      relatedWordEntries: [
        { word: "meeting", partOfSpeech: "名", meaning: "会議・集まり" },
        { word: "booking", partOfSpeech: "名", meaning: "予約（場所・サービス）" },
        { word: "reservation", partOfSpeech: "名", meaning: "席・部屋の予約" },
        { word: "schedule", partOfSpeech: "名/動", meaning: "予定・スケジュール" },
        { word: "cancellation", partOfSpeech: "名", meaning: "キャンセル・取り消し", isAntonym: true },
      ],
      synonyms: ["meeting", "engagement", "booking"],
      synonymDifferenceEntries: [
        { word: "meeting", description: "会議・打ち合わせ全般に使う広い語。appointment より informal なニュアンス。" },
        { word: "engagement", description: "改まった公式の約束・予定。appointment よりフォーマルで、スケジュール上の「コミットメント」。" },
        { word: "booking", description: "主に施設・席・サービスの予約。appointment は人との面会、booking は場所・資源の確保。" },
      ],
      antonyms: ["cancellation"],
      column: {
        title: "「アポ」の正体と appointment vs appoint の混同に注意",
        content:
          `日本語の「アポを取る」は appointment の略から来ています。ただし、似た単語 appoint（任命する・指定する）とは別語なので注意。"I appointed him manager."（彼をマネージャーに任命した）の appoint と appointment は形は似ていますが、日常会話で「予約」として使う appointment は "make/have/cancel an appointment" のフレーズごと覚えるのが最短です。`,
      },
      examples: [
        {
          en: "I have a doctor's appointment at 3 p.m. today.",
          ja: "今日の午後3時に医師の予約があります。",
          context: "医療",
        },
        {
          en: "She made an appointment to see the financial advisor next week.",
          ja: "彼女は来週、ファイナンシャルアドバイザーとの面談を予約した。",
          context: "ビジネス",
        },
        {
          en: "Could you reschedule my appointment to Friday afternoon?",
          ja: "予約を金曜の午後に変更していただけますか？",
          context: "日常",
        },
      ],
    },
  ],
  // confirm (30002)
  [
    30002,
    {
      pronunciation: { us: "/kənˈfɜːrm/", uk: "/kənˈfɜːm/" },
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
      relatedWords: ["verify", "check", "approve", "validate"],
      relatedWordEntries: [
        { word: "verify", partOfSpeech: "動", meaning: "証拠で正確さを検証する" },
        { word: "check", partOfSpeech: "動", meaning: "調べる・確認する（軽めのニュアンス）" },
        { word: "approve", partOfSpeech: "動", meaning: "公式に承認する" },
        { word: "validate", partOfSpeech: "動", meaning: "有効性・正当性を確認する" },
        { word: "cancel", partOfSpeech: "動", meaning: "キャンセルする・取り消す", isAntonym: true },
        { word: "deny", partOfSpeech: "動", meaning: "否定する・否認する", isAntonym: true },
      ],
      synonyms: ["verify", "approve", "validate"],
      synonymDifferenceEntries: [
        { word: "verify", description: "証拠や比較によって正確さを客観的に証明する。より技術的・公式な場面で使う。" },
        { word: "approve", description: "権限を持つ立場が公式に認める・許可する。confirm より「許可」のニュアンスが強い。" },
        { word: "validate", description: "フォームの入力値・許可証・チケットなどの有効性を確認する場面で多い。" },
      ],
      antonyms: ["cancel", "deny", "reject"],
      column: {
        title: "\"Please confirm receipt.\" — メール定番フレーズの意味",
        content:
          "\"Please confirm receipt of this email.\"（このメールを受け取ったことをご確認ください）は、ビジネスメールで頻出の定型表現です。confirm は単に「確かめる」だけでなく、「相手にも確認させる」という相互確認のニュアンスを持ちます。check（調べる）より公式で強い意味なので、重要な書類や契約の確認には confirm を使いましょう。",
      },
      examples: [
        {
          en: "Please confirm your reservation at least 24 hours in advance.",
          ja: "少なくとも24時間前に予約を確認してください。",
          context: "旅行・サービス",
        },
        {
          en: "The manager confirmed that the project would start next month.",
          ja: "マネージャーは、プロジェクトが来月開始されることを確認した。",
          context: "ビジネス",
        },
        {
          en: "Can you confirm receipt of the documents I sent yesterday?",
          ja: "昨日送った書類を受け取ったことを確認していただけますか？",
          context: "オフィス",
        },
      ],
    },
  ],
  // department (30003)
  [
    30003,
    {
      pronunciation: { us: "/dɪˈpɑːrtmənt/", uk: "/dɪˈpɑːtmənt/" },
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
      relatedWords: ["division", "section", "team", "unit"],
      relatedWordEntries: [
        { word: "division", partOfSpeech: "名", meaning: "（より大きな）事業部門" },
        { word: "section", partOfSpeech: "名", meaning: "課・セクション（比較的小さな単位）" },
        { word: "team", partOfSpeech: "名", meaning: "チーム" },
        { word: "unit", partOfSpeech: "名", meaning: "ユニット・機能単位" },
      ],
      synonyms: ["division", "section", "unit", "branch"],
      synonymDifferenceEntries: [
        { word: "division", description: "department より大きい組織単位。国際事業部・消費者事業部など。" },
        { word: "section", description: "department より小さい単位。部の中の「課」や「係」に相当。" },
        { word: "unit", description: "機能的なまとまり全般を指す柔軟な語。部署・部隊・単位など幅広く使える。" },
      ],
      column: {
        title: "department store の「dept.」はここから",
        content:
          "デパート（department store）の「department」は「売り場」の意味です。食品売り場・衣料売り場など、機能ごとに分かれた区画が department。会社の「部署（営業部・人事部）」と店舗の「売り場」で同じ単語を使います。また、よく \"Which department are you in?\"（どちらのご部署ですか？）と聞かれるので、自分の部署名を英語で言えるようにしておくと便利です。",
      },
      examples: [
        {
          en: "She transferred to the marketing department last April.",
          ja: "彼女は昨年4月にマーケティング部へ異動した。",
          context: "職場",
        },
        {
          en: "The IT department handles all technical issues in the company.",
          ja: "IT部門は会社内の技術的な問題をすべて担当する。",
          context: "ビジネス",
        },
        {
          en: "Please direct all inquiries to the customer service department.",
          ja: "お問い合わせはすべてカスタマーサービス部門にお願いします。",
          context: "顧客対応",
        },
      ],
    },
  ],
  // employee (30004)
  [
    30004,
    {
      pronunciation: { us: "/ɪmˈplɔɪiː/", uk: "/ɪmˈplɔɪiː/" },
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
      relatedWords: ["employer", "staff", "worker", "colleague"],
      relatedWordEntries: [
        { word: "employer", partOfSpeech: "名", meaning: "雇用主・使用者", isAntonym: true },
        { word: "staff", partOfSpeech: "名", meaning: "スタッフ（組織全体を集合的に指す）" },
        { word: "worker", partOfSpeech: "名", meaning: "働く人（フリーランス含む広い語）" },
        { word: "colleague", partOfSpeech: "名", meaning: "同僚" },
        { word: "employ", partOfSpeech: "動", meaning: "雇う" },
        { word: "employment", partOfSpeech: "名", meaning: "雇用・就業" },
        { word: "unemployed", partOfSpeech: "形", meaning: "失業した", isAntonym: true },
      ],
      synonyms: ["staff", "worker", "personnel"],
      synonymDifferenceEntries: [
        { word: "worker", description: "雇用契約の有無を問わず「仕事をする人」全般。フリーランスや請負業者も含む。" },
        { word: "staff", description: "組織のメンバーを集合的に指す語。\"The staff is helpful.\" のように不可算名詞扱いも多い。" },
        { word: "personnel", description: "人事・人材管理の文脈で使う。HR（人事部）や軍隊の「人員」など。" },
      ],
      antonyms: ["employer", "boss", "manager"],
      column: {
        title: "employee と employer — -ee/-er で「される側」「する側」",
        content:
          "employ（雇う）に接尾辞をつけると意味が変わります。-ee はそのアクションを「される人」（employee = 雇われる人）、-er/-or は「する人」（employer = 雇う人）を表します。同じパターンが interview → interviewee（面接される人）/ interviewer（面接する人）にも使われます。TOEIC では employer（雇用主）も頻出なので、ペアで覚えましょう。",
      },
      examples: [
        {
          en: "All employees are required to attend the safety training.",
          ja: "全従業員が安全研修への参加を求められています。",
          context: "職場",
        },
        {
          en: "The company offers health insurance to all full-time employees.",
          ja: "この会社はすべての正社員に健康保険を提供している。",
          context: "福利厚生",
        },
        {
          en: "Employee satisfaction is closely linked to company productivity.",
          ja: "従業員満足度は会社の生産性と密接に関係している。",
          context: "マネジメント",
        },
      ],
    },
  ],
  // invoice (30005)
  [
    30005,
    {
      pronunciation: { us: "/ˈɪnvɔɪs/", uk: "/ˈɪnvɔɪs/" },
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
      relatedWords: ["receipt", "bill", "payment", "statement"],
      relatedWordEntries: [
        { word: "receipt", partOfSpeech: "名", meaning: "領収書（支払い後に発行）", isAntonym: true },
        { word: "bill", partOfSpeech: "名", meaning: "請求書（日常的・一般的な語）" },
        { word: "payment", partOfSpeech: "名", meaning: "支払い・代金", isAntonym: true },
        { word: "statement", partOfSpeech: "名", meaning: "取引明細書" },
        { word: "issue", partOfSpeech: "動", meaning: "発行する（請求書を発行する）" },
      ],
      synonyms: ["bill", "statement", "charge"],
      synonymDifferenceEntries: [
        { word: "bill", description: "電気代・レストランの勘定など、日常的な場面にも使う一般的な請求書。invoice より informal。" },
        { word: "statement", description: "一定期間内の取引をまとめた明細書。銀行・クレジットカードの明細がこれ。" },
        { word: "receipt", description: "支払い完了後の領収書。invoice（支払い前）と方向が逆なので注意。" },
      ],
      antonyms: ["receipt", "payment"],
      column: {
        title: "invoice（請求書）vs receipt（領収書）— 方向が逆！",
        content:
          "invoice と receipt はよく混同されますが、お金の流れの方向が真逆です。invoice は「これを払ってください」という請求書（支払い前）、receipt は「受け取りました」という領収書（支払い後）。TOEIC のメール問題で \"attach the invoice\"（請求書を添付する）と \"issue a receipt\"（領収書を発行する）が頻出です。会計部門（accounting department）とやり取りする場面でほぼ必ず登場します。",
      },
      examples: [
        {
          en: "Please send the invoice to our accounting department.",
          ja: "請求書を経理部門に送付してください。",
          context: "経理",
        },
        {
          en: "The invoice must be paid within 30 days of the issue date.",
          ja: "請求書は発行日から30日以内に支払う必要があります。",
          context: "経理・支払い",
        },
        {
          en: "I noticed an error on the invoice — the quantity is incorrect.",
          ja: "請求書に誤りを見つけました—数量が間違っています。",
          context: "ビジネスコミュニケーション",
        },
      ],
    },
  ],
  // manage (30006)
  [
    30006,
    {
      pronunciation: { us: "/ˈmænɪdʒ/", uk: "/ˈmænɪdʒ/" },
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
      relatedWords: ["supervise", "lead", "direct", "oversee"],
      relatedWordEntries: [
        { word: "supervise", partOfSpeech: "動", meaning: "直接監督・指導する" },
        { word: "lead", partOfSpeech: "動", meaning: "率いる・リードする" },
        { word: "direct", partOfSpeech: "動", meaning: "指揮する・指示する" },
        { word: "oversee", partOfSpeech: "動", meaning: "全体を高い視点で監督する" },
        { word: "management", partOfSpeech: "名", meaning: "管理・経営" },
        { word: "manager", partOfSpeech: "名", meaning: "管理者・マネージャー" },
      ],
      synonyms: ["handle", "oversee", "supervise"],
      synonymDifferenceEntries: [
        { word: "handle", description: "問題や状況に対処する。manage より限定的・一時的なニュアンス。" },
        { word: "oversee", description: "全体の進捗を高い視点から監督する。manage より「見守る」感覚が強い。" },
        { word: "supervise", description: "部下の仕事を直接監督・指導する。manage より密接な監督関係を含む。" },
      ],
      column: {
        title: "\"manage to do\" — 「なんとか〜できた」が重要用法",
        content:
          "manage は「管理する」だけではありません。\"manage to do\"（なんとか〜することができた）という表現は TOEIC でも日常英会話でも頻出です。「I managed to finish it on time.」（なんとか時間内に終えられた）のように、困難を乗り越えた達成感を表します。\"could\"（できた）より苦労した感じが出るので、使い分けを意識してみましょう。",
      },
      examples: [
        {
          en: "She has been managing the sales team for three years.",
          ja: "彼女は3年間、営業チームを管理してきた。",
          context: "マネジメント",
        },
        {
          en: "He managed to finish the report before the deadline.",
          ja: "彼は締め切り前になんとかレポートを仕上げた。",
          context: "達成・業務",
        },
        {
          en: "It's hard to manage multiple projects at the same time.",
          ja: "複数のプロジェクトを同時に管理するのは大変だ。",
          context: "プロジェクト管理",
        },
      ],
    },
  ],
  // opportunity (30007)
  [
    30007,
    {
      pronunciation: { us: "/ˌɑːpərˈtuːnɪti/", uk: "/ˌɒpəˈtjuːnɪti/" },
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
      relatedWords: ["chance", "possibility", "occasion", "prospect"],
      relatedWordEntries: [
        { word: "chance", partOfSpeech: "名", meaning: "機会・可能性（より口語的）" },
        { word: "possibility", partOfSpeech: "名", meaning: "可能性・見込み" },
        { word: "occasion", partOfSpeech: "名", meaning: "特定の場・機会" },
        { word: "prospect", partOfSpeech: "名", meaning: "見込み・将来の展望" },
        { word: "obstacle", partOfSpeech: "名", meaning: "障害・妨げ", isAntonym: true },
        { word: "threat", partOfSpeech: "名", meaning: "脅威・リスク", isAntonym: true },
      ],
      synonyms: ["chance", "occasion", "opening"],
      synonymDifferenceEntries: [
        { word: "chance", description: "偶然のチャンスや確率（40% chance）の意味も持つ。opportunity より口語的で広い語。" },
        { word: "occasion", description: "特定の出来事・場・状況を指す。「機会」より「場」の意味に近い場合が多い。" },
        { word: "opening", description: "就職の空きポジション、または何かを始められる隙間・機会。\" job opening\"（求人）でよく使う。" },
      ],
      antonyms: ["obstacle", "threat", "setback"],
      column: {
        title: "\"once-in-a-lifetime opportunity\" — 定番フレーズを丸ごと覚える",
        content:
          "opportunity は単独よりも決まり文句で使われることが多い単語です。\"take the opportunity to do\"（〜する機会を利用する）、\"miss an opportunity\"（機会を逃す）、\"once-in-a-lifetime opportunity\"（一生に一度のチャンス）は TOEIC のメール・広告文でよく見かけます。job opportunity（求人）というひとかたまりで求人広告にも登場するので、opportunity が出たらまず「何のための機会？」を押さえましょう。",
      },
      examples: [
        {
          en: "This internship is a great opportunity to gain real work experience.",
          ja: "このインターンシップは実際の職業経験を積む素晴らしい機会だ。",
          context: "キャリア",
        },
        {
          en: "We should take this opportunity to expand into the Asian market.",
          ja: "この機会を利用してアジア市場へ進出すべきだ。",
          context: "ビジネス戦略",
        },
        {
          en: "Don't miss the opportunity — it won't come around again.",
          ja: "チャンスを逃すな—もう二度と来ないかもしれない。",
          context: "日常",
        },
      ],
    },
  ],
  // purchase (30008)
  [
    30008,
    {
      pronunciation: { us: "/ˈpɜːrtʃəs/", uk: "/ˈpɜːtʃəs/" },
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
      relatedWords: ["buy", "acquire", "obtain", "payment"],
      relatedWordEntries: [
        { word: "buy", partOfSpeech: "動", meaning: "買う（より口語的）" },
        { word: "acquire", partOfSpeech: "動", meaning: "取得する・獲得する（大規模・正式）" },
        { word: "obtain", partOfSpeech: "動", meaning: "入手する・手に入れる（努力・手続きを経て）" },
        { word: "sell", partOfSpeech: "動", meaning: "売る", isAntonym: true },
        { word: "return", partOfSpeech: "動/名", meaning: "返品する・返品", isAntonym: true },
        { word: "purchaser", partOfSpeech: "名", meaning: "購入者・買い手" },
      ],
      synonyms: ["buy", "acquire", "obtain"],
      synonymDifferenceEntries: [
        { word: "buy", description: "日常的な「買う」。purchase はより正式・書面的な表現。\"buy a coffee\" は自然だが \"purchase a coffee\" は大げさ。" },
        { word: "acquire", description: "会社の買収・資産の取得など、より大規模・正式な場面で使う。" },
        { word: "obtain", description: "努力・手続きを経て手に入れる。物・情報・許可証など幅広く使える。" },
      ],
      antonyms: ["sell", "return", "refund"],
      column: {
        title: "purchase は buy の格上げ版 — TOEIC では purchase order が頻出",
        content:
          "purchase と buy はほぼ同義ですが、purchase の方がフォーマルです。\"buy a coffee\"（コーヒーを買う）は自然ですが、\"purchase a coffee\" は大げさに聞こえます。一方、ビジネス文書では purchase が標準。特に \"purchase order\"（発注書・PO）は TOEIC の書類問題で頻出なので、略語 \"PO\" と合わせて覚えておきましょう。",
      },
      examples: [
        {
          en: "You can purchase tickets online or at the box office.",
          ja: "チケットはオンラインまたはチケット売り場で購入できます。",
          context: "イベント・サービス",
        },
        {
          en: "All purchases over $100 are eligible for free shipping.",
          ja: "100ドルを超えるすべての購入品は送料無料の対象です。",
          context: "eコマース",
        },
        {
          en: "The company made a major purchase of new manufacturing equipment.",
          ja: "その会社は新しい製造設備を大規模に購入した。",
          context: "ビジネス",
        },
      ],
    },
  ],
  // reservation (30009)
  [
    30009,
    {
      pronunciation: { us: "/ˌrezərˈveɪʃən/", uk: "/ˌrezəˈveɪʃən/" },
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
      relatedWords: ["booking", "appointment", "confirm", "cancel"],
      relatedWordEntries: [
        { word: "booking", partOfSpeech: "名/動", meaning: "予約（英国英語でよく使う）" },
        { word: "appointment", partOfSpeech: "名", meaning: "人との面会の予約（医師・美容師など）" },
        { word: "confirm", partOfSpeech: "動", meaning: "予約を確認・確定する" },
        { word: "reserve", partOfSpeech: "動", meaning: "事前に確保する・予約する" },
        { word: "cancellation", partOfSpeech: "名", meaning: "キャンセル・取り消し", isAntonym: true },
        { word: "walk-in", partOfSpeech: "名", meaning: "予約なし（飛び込み）", isAntonym: true },
      ],
      synonyms: ["booking", "appointment"],
      synonymDifferenceEntries: [
        { word: "booking", description: "reservation の同義語。主に英国英語でよく使われる。\"hotel booking\"（ホテル予約）など。" },
        { word: "appointment", description: "医師・弁護士・美容師など「人との面会」に使う。reservation は場所・席の確保。" },
      ],
      antonyms: ["cancellation", "walk-in"],
      column: {
        title: "reservation vs appointment — 「場所の予約」か「人との面会予約」かで使い分け",
        content:
          "日本語では両方「予約」ですが、英語では使い分けが必要です。reservation はホテル・レストラン・飛行機など「席・部屋・資源」を確保するとき。appointment は医師・弁護士・美容師など「人との面会」を取り決めるとき。\"restaurant reservation\"（レストラン予約）と \"doctor's appointment\"（医師の予約）はセットで覚えましょう。",
      },
      examples: [
        {
          en: "I'd like to make a reservation for two at 7 p.m.",
          ja: "午後7時に2名の予約をしたいのですが。",
          context: "レストラン",
        },
        {
          en: "The hotel reservation was made three months in advance.",
          ja: "ホテルの予約は3か月前に取られた。",
          context: "旅行",
        },
        {
          en: "Do you have a reservation under the name of Smith?",
          ja: "スミスという名義の予約はありますか？",
          context: "チェックイン",
        },
      ],
    },
  ],
  // schedule (30010)
  [
    30010,
    {
      pronunciation: { us: "/ˈskedʒuːl/", uk: "/ˈʃedjuːl/" },
      coreImage:
        "「何かを行う時間・順序を事前に計画したリスト」がコアイメージ。予定表・時刻表・工程表など、時間軸に沿った計画を表す。",
      usage:
        "名詞「I have a busy schedule.（忙しいスケジュールだ）」、動詞「The meeting is scheduled for Monday.（会議は月曜に予定されている）」と両方で使える。",
      synonymDifference:
        "schedule vs timetable: schedule は個人や組織の予定全般に使う広い語。timetable は電車・授業など固定した時間割に使うことが多い。",
      englishDefinition:
        "A plan that lists the times when activities or events will happen; to arrange for something to happen at a particular time.",
      etymology: [
        "ラテン語 schedula（小さなメモ・紙片）から。中世英語を経て現代の「予定表」の意味に発展。",
        "UK発音 /ˈʃedjuːl/ はラテン語→古フランス語→中英語の経路を踏む。US発音 /ˈskedʒuːl/ はギリシア語 skhedē を経由したより古い形から。",
      ],
      relatedWords: ["timetable", "plan", "agenda", "calendar"],
      relatedWordEntries: [
        { word: "plan", partOfSpeech: "名/動", meaning: "計画（より広い概念）" },
        { word: "timetable", partOfSpeech: "名", meaning: "時刻表・授業時間割（固定的な時間表）" },
        { word: "agenda", partOfSpeech: "名", meaning: "会議の議題リスト・行動計画" },
        { word: "calendar", partOfSpeech: "名", meaning: "カレンダー・日程表" },
        { word: "reschedule", partOfSpeech: "動", meaning: "予定を変更する" },
        { word: "scheduled", partOfSpeech: "形", meaning: "予定された・定期的な" },
      ],
      synonyms: ["timetable", "plan", "agenda"],
      synonymDifferenceEntries: [
        { word: "plan", description: "schedule より広い概念。時間軸がなくてもよい。schedule は特に時間配分を伴う計画。" },
        { word: "timetable", description: "電車・授業など固定した時間表。schedule は更新・調整可能だが timetable はより固定的。" },
        { word: "agenda", description: "会議の議題・行動リスト。schedule は「いつ」、agenda は「何を」の内容に焦点がある。" },
      ],
      column: {
        title: "UK と US で発音が違う！ schedule の読み方",
        content:
          "schedule は英米で発音が大きく異なります。アメリカ英語では /ˈskedʒuːl/（スケジュール）、イギリス英語では /ˈʃedjuːl/（シェジュール）。どちらも正しく、TOEIC のリスニングでは両方の発音が出るので、UK 音声に慣れておくと有利です。動詞として \"The meeting is scheduled for Friday.\"（会議は金曜日に予定されている）のように使うことも多いので、名詞・動詞の両方を練習しましょう。",
      },
      examples: [
        {
          en: "The project schedule has been updated due to unexpected delays.",
          ja: "予期せぬ遅延のため、プロジェクトのスケジュールが更新された。",
          context: "プロジェクト管理",
        },
        {
          en: "Please schedule a meeting with the client for next Tuesday.",
          ja: "来週の火曜日にクライアントとの会議を設定してください。",
          context: "ビジネス",
        },
        {
          en: "I have a very tight schedule this week — no free time at all.",
          ja: "今週はスケジュールが非常にタイトで、全く自由な時間がない。",
          context: "日常",
        },
      ],
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

  // ── TOEIC 600 ───────────────────────────────────────────────────────────────

  // comply (30181)
  [30181, { coreImage: "「規則・要求・命令に従って行動する」のがコアイメージ。自発的というより、外部の基準に合わせる義務的な行為。", usage: "「comply with regulations（規制を遵守する）」「comply with a request（要求に応じる）」「non-compliance（違反・不遵守）」のように使う。", synonymDifference: "comply vs obey vs follow: comply は規則・要求に正式に応じる。obey は命令・権威に従う（obey orders）。follow は指示・手順を追う（follow instructions）。", englishDefinition: "To act in accordance with a rule, request, or command.", etymology: "ラテン語 complere（完全に満たす）から。com-（完全に）＋ plere（満たす）。" }],
  // delegate (30182)
  [30182, { coreImage: "「自分の権限・仕事を他の人に任せる」のがコアイメージ。名詞では「代表者・委任された人」。", usage: "「delegate tasks（タスクを委任する）」「delegate authority（権限を委譲する）」「conference delegate（会議の代表者）」のように使う。", synonymDifference: "delegate vs assign vs entrust: delegate は権限ごと任せる。assign は特定の業務を割り当てる。entrust はより信頼に基づいて「委ねる」。", englishDefinition: "To give someone authority to do something on your behalf; a representative.", etymology: "ラテン語 delegare（遣わす）から。de-（離れて）＋ legare（送る）。" }],
  // headquarters (30184)
  [30184, { coreImage: "「組織の中枢・指令所」がコアイメージ。常に複数形 headquarters（HQ）として使われる。", usage: "「global headquarters（グローバル本社）」「move headquarters（本社を移転する）」「HQ（本部の略称）」のように使う。", synonymDifference: "headquarters vs head office: headquarters は組織全体を統括する公式な本部（軍・大企業に多い）。head office はビジネス文脈での「本社」。", englishDefinition: "The main office or center of control of an organization.", etymology: "quarter（陣地・宿営地）＋ head（主要な）。軍の「指揮官本部」から転じた。" }],
  // incentive (30185)
  [30185, { coreImage: "「行動・努力を促すための報奨・動機付け」のがコアイメージ。「行動したくなるように外から与えるもの」。", usage: "「financial incentive（金銭的インセンティブ）」「sales incentive（販売奨励金）」「incentive program（インセンティブプログラム）」のように使う。", synonymDifference: "incentive vs reward vs bonus: incentive は行動を起こさせる事前の動機付け。reward は行動後に与える報酬。bonus は業績に応じた特別手当。", englishDefinition: "Something that encourages a person to do something; a financial reward.", etymology: "ラテン語 incentivum（刺激するもの）から。incinere（歌って奮起させる）が語源。" }],
  // preliminary (30189)
  [30189, { coreImage: "「本番・最終版の前に来る準備段階の」のがコアイメージ。最終的な結論を出す前の「暫定的な」ステップ。", usage: "「preliminary results（速報値）」「preliminary meeting（事前協議）」「preliminary investigation（予備調査）」のように使う。", synonymDifference: "preliminary vs provisional vs tentative: preliminary は本番前の準備的な段階。provisional は確定するまでの暫定的なもの（provisional budget）。tentative は確定していない・変更の可能性がある。", englishDefinition: "Done or happening before the main event as preparation.", etymology: "ラテン語 praeliminar（門の前）から。prae-（前に）＋ limen（敷居）。" }],
  // promptly (30190)
  [30190, { coreImage: "「遅れなく、すぐに・迅速に」のがコアイメージ。時間的な即応性を強調する副詞。", usage: "「respond promptly（迅速に対応する）」「arrive promptly at 9（9時きっかりに到着する）」「promptly addressed（速やかに対処された）」のように使う。", synonymDifference: "promptly vs quickly vs immediately: promptly は遅滞なく決まった時間に行う（professional nuance）。quickly は速さに焦点。immediately は「今すぐ・直ちに」という緊急性。", englishDefinition: "Quickly and without delay; at the correct time.", etymology: "prompt（即座の）＋ -ly。ラテン語 promptus（準備できた）から。" }],
  // quarterly (30191)
  [30191, { coreImage: "「3か月ごとの・四半期の」のがコアイメージ。1年を4等分した3か月ごとのサイクル。", usage: "「quarterly report（四半期報告書）」「quarterly earnings（四半期収益）」「on a quarterly basis（四半期ベースで）」のように使う。", synonymDifference: "quarterly vs annual vs monthly: quarterly は3か月ごと（Q1〜Q4）。annual は年1回。monthly は月1回。", englishDefinition: "Happening four times a year, once every three months.", etymology: "quarter（4分の1）＋ -ly（〜ごとの）。1年の4分の1＝3か月が quarter。" }],
  // reimburse (30193)
  [30193, { coreImage: "「誰かが立て替えた費用を後から返す・弁済する」のがコアイメージ。経費精算のビジネス場面で頻出。", usage: "「reimburse travel expenses（出張費を精算する）」「reimbursement form（経費精算書）」「reimburse employees（社員に立替費用を返す）」のように使う。", synonymDifference: "reimburse vs refund vs repay: reimburse は他者が立て替えた費用を返す（expense-focused）。refund は商品・サービスに対する払い戻し。repay はローン・借金を返済する。", englishDefinition: "To pay back money to someone who has spent it on your behalf.", etymology: "re-（再び）＋ im-（中に）＋ burse（財布）。「財布に戻し入れる」のが原義。" }],
  // supervisor (30195)
  [30195, { coreImage: "「部下の仕事を監督・指導する立場の人・上司」がコアイメージ。直属の上司を指すことが多い。", usage: "「report to a supervisor（上司に報告する）」「direct supervisor（直属の上司）」「supervisory role（監督職）」のように使う。", synonymDifference: "supervisor vs manager vs director: supervisor は現場レベルで直接監督する人。manager は部門・チームを管理する責任者。director は上位の役職・取締役クラス。", englishDefinition: "A person who watches over and directs the work of others.", etymology: "ラテン語 supervidere（上から見る）から。super-（上から）＋ videre（見る）。" }],
  // tentative (30196)
  [30196, { coreImage: "「まだ確定していない・変更の可能性がある仮の」のがコアイメージ。状況次第で変わる「仮決め」の状態。", usage: "「tentative schedule（仮スケジュール）」「tentative agreement（仮合意）」「tentative plan（暫定計画）」のように使う。", synonymDifference: "tentative vs provisional vs preliminary: tentative は確定していない・変更があり得る（subject to change）。provisional は公式に仮として設定された。preliminary は本番前の準備段階の。", englishDefinition: "Not definite or certain; done as a trial.", etymology: "ラテン語 tentativus（試みの）から。tentare（試みる）。" }],
  // valid (30197)
  [30197, { coreImage: "「法的・公式に認められていて使用・適用が可能な状態」のがコアイメージ。", usage: "「valid passport（有効なパスポート）」「valid until（〜まで有効）」「valid argument（正当な議論）」「validate（有効化する）」のように使う。", synonymDifference: "valid vs legitimate vs effective: valid は法的・公式に有効（valid ID）。legitimate は正当・合法的な。effective は機能して成果を出している。", englishDefinition: "Legally acceptable; based on good reasoning.", etymology: "ラテン語 validus（強い・健全な）から。valere（強い・value と同語源）。" }],
  // adjacent (30199)
  [30199, { coreImage: "「すぐ隣に位置している・隣接した」のがコアイメージ。物理的に近い・接している位置関係。", usage: "「adjacent to the station（駅に隣接した）」「adjacent room（隣の部屋）」「adjacent offices（隣接するオフィス）」のように使う。", synonymDifference: "adjacent vs nearby vs neighboring: adjacent は直接隣接している（touching or very close）。nearby は「近くの」（not necessarily touching）。neighboring は隣接する地域・国。", englishDefinition: "Very close or next to something.", etymology: "ラテン語 adjacere（近くに横たわる）から。ad-（〜に）＋ jacere（横たわる）。" }],
  // affordable (30200)
  [30200, { coreImage: "「一般の人が無理なく買える・費用対効果が高い」のがコアイメージ。", usage: "「affordable price（手頃な価格）」「affordable housing（手頃な住宅）」「affordable option（リーズナブルな選択肢）」のように使う。", synonymDifference: "affordable vs cheap vs reasonable: affordable は収入・予算の範囲内で無理なく買える（positive）。cheap は価格が安い・質が低いニュアンスを含む場合も。reasonable は妥当・納得できる価格。", englishDefinition: "Priced so that most people can afford to buy it.", etymology: "afford（余裕がある）＋ -able。" }],
  // accomplish (30201)
  [30201, { coreImage: "「努力の末に目標・課題を完全に達成し遂げる」のがコアイメージ。", usage: "「accomplish a goal（目標を達成する）」「accomplish a task（タスクを成し遂げる）」「sense of accomplishment（達成感）」のように使う。", synonymDifference: "accomplish vs achieve vs complete: accomplish は困難なことを成し遂げる。achieve は努力で目標を達成する（achieve success）。complete は全部終わらせる完了に焦点。", englishDefinition: "To succeed in doing or completing something.", etymology: "ラテン語 accomplere（完全に満たす）から。ad-（〜に）＋ complere（満たす）。" }],
  // accumulate (30202)
  [30202, { coreImage: "「少しずつ集まって積み重なる・蓄積する」のがコアイメージ。一度に大量にではなく、時間をかけて増えていく過程。", usage: "「accumulate wealth（富を蓄積する）」「accumulate points（ポイントをためる）」「accumulated data（蓄積されたデータ）」のように使う。", synonymDifference: "accumulate vs collect vs gather: accumulate は時間とともに徐々に増える（gradual buildup）。collect は意図的に集める。gather は一か所に集める。", englishDefinition: "To gradually collect or increase in amount over time.", etymology: "ラテン語 accumulare（山積みにする）から。ad-（〜に）＋ cumulare（積み重ねる）。" }],
  // acknowledge (30203)
  [30203, { coreImage: "「事実・受け取り・功績を正式に認める・承認の意を示す」のがコアイメージ。", usage: "「acknowledge receipt（受領を確認する）」「acknowledge a mistake（ミスを認める）」「acknowledge someone's contribution（貢献を認める）」のように使う。", synonymDifference: "acknowledge vs admit vs recognize: acknowledge は受け取り・事実・功績を公式に認める（neutral）。admit は不都合な事実を認める・白状する（negative nuance）。recognize は正式に認識・認定する。", englishDefinition: "To accept or admit the existence of something; to confirm receipt.", etymology: "ac-（〜に）＋ knowledge（知識）。「知っていることを認める」のが原義。" }],
  // acquire (30204)
  [30204, { coreImage: "「努力・交渉・購入を経て手に入れる・取得する」のがコアイメージ。ビジネスでは企業買収にも使う。", usage: "「acquire a company（企業を買収する）」「acquire skills（スキルを習得する）」「acquisition cost（取得コスト）」のように使う。", synonymDifference: "acquire vs obtain vs get: acquire はビジネス・法律的な取得に使われる格式ばった語（acquire assets）。obtain は努力・手続きを経て得る。get は日常的な「得る」。", englishDefinition: "To get something through effort or purchase; to buy a company.", etymology: "ラテン語 acquirere（追加して得る）から。ad-（〜に加えて）＋ quaerere（求める）。" }],
  // adequate (30205)
  [30205, { coreImage: "「必要な量・質に達している・十分な」のがコアイメージ。優れているわけではないが最低限の要件を満たしている。", usage: "「adequate resources（十分なリソース）」「adequate preparation（十分な準備）」「not adequate（不十分な）」のように使う。", synonymDifference: "adequate vs sufficient vs enough: adequate はぎりぎり十分・最低限OK（barely meets the standard）。sufficient は必要量を満たしている（neutral）。enough は口語的な「足りている」。", englishDefinition: "Enough in quantity or quality for a particular purpose.", etymology: "ラテン語 adaequatus（等しくする）から。ad-（〜に）＋ aequus（等しい）。" }],
  // allocate (30206)
  [30206, { coreImage: "「限られたリソース（予算・時間・人員など）を目的別に割り振る」のがコアイメージ。", usage: "「allocate budget（予算を配分する）」「allocate resources（リソースを割り当てる）」「resource allocation（資源配分）」のように使う。", synonymDifference: "allocate vs assign vs distribute: allocate はリソースを目的・部門に配分する（budgeting context）。assign は人に仕事・役割を与える。distribute は広く複数に分配する。", englishDefinition: "To set aside or give something for a specific purpose.", etymology: "ラテン語 allocare（場所を割り当てる）から。ad-（〜に）＋ locare（置く）。" }],
  // amendment (30207)
  [30207, { coreImage: "「法律・契約・文書を正式に修正・改正する行為またはその修正内容」がコアイメージ。", usage: "「contract amendment（契約変更）」「constitutional amendment（憲法改正）」「propose an amendment（修正案を提案する）」のように使う。", synonymDifference: "amendment vs revision vs modification: amendment は法律・契約の正式な改正（legal/official）。revision は全体的な見直し・改訂。modification は部分的な変更・調整。", englishDefinition: "A change or addition to a law, contract, or document.", etymology: "amend（修正する）＋ -ment。amend はラテン語 emendare（欠点を直す）から。" }],
  // anticipate (30208)
  [30208, { coreImage: "「起こりそうなことを前もって予測し、準備して待つ」のがコアイメージ。単なる予想ではなく、準備も含む能動的な予期。", usage: "「anticipate demand（需要を見込む）」「anticipate problems（問題を予測する）」「anticipate a result（結果を期待する）」のように使う。", synonymDifference: "anticipate vs expect vs predict: anticipate は前もって準備しながら待つ（proactive）。expect は根拠があって起こると思う（passive）。predict はデータ・論理で将来を予測する（scientific）。", englishDefinition: "To expect or prepare for something before it happens.", etymology: "ラテン語 anticipare（前もって取る）から。ante-（前に）＋ capere（取る）。" }],
  // apprentice (30209)
  [30209, { coreImage: "「職人・専門家のもとで技術を学ぶ見習い」のがコアイメージ。労働を提供しながら技術を習得するシステム。", usage: "「apprentice electrician（電気工見習い）」「start as an apprentice（見習いとして始める）」「apprenticeship program（見習い制度）」のように使う。", synonymDifference: "apprentice vs intern vs trainee: apprentice は特定の職人技術を習得する正式な見習い。intern は学生・新卒のインターンシップ。trainee は研修中の社員・学習者全般。", englishDefinition: "A person learning a skilled job by working with an expert.", etymology: "古フランス語 apprendre（学ぶ）から。ラテン語 apprehendere（つかんで学ぶ）が語源。" }],
  // assess (30210)
  [30210, { coreImage: "「状況・価値・リスクを体系的に評価・査定する」のがコアイメージ。基準に照らして判断する分析行為。", usage: "「assess risks（リスクを評価する）」「assess performance（業績を査定する）」「needs assessment（ニーズ評価）」「tax assessment（課税査定）」のように使う。", synonymDifference: "assess vs evaluate vs appraise: assess は税・リスク・必要性の公式な査定・評価（formal context）。evaluate は価値・有効性を判断する総合的な評価。appraise は資産・業績を金銭的に鑑定する。", englishDefinition: "To evaluate or estimate the value, quality, or importance of something.", etymology: "ラテン語 assidere（傍らに座って評価する）から。ad-（〜に）＋ sedere（座る）。" }],

  // asset (30211)
  [30211, { coreImage: "「組織・個人が持つ価値ある資産・強み」のがコアイメージ。貸借対照表の「資産」から、人や能力の「強み・長所」まで。", usage: "「company assets（会社の資産）」「fixed assets（固定資産）」「current assets（流動資産）」「She is an asset to the team.（彼女はチームの強みだ）」のように使う。", synonymDifference: "asset vs resource vs strength: asset は金銭・物的・人的価値のある財産（assets on balance sheet）。resource は使用可能な資源・リソース（human resources）。strength は能力・性格の強み（personal strength）。", englishDefinition: "Something valuable that a person or organization owns; a useful quality.", etymology: "古フランス語 asez（十分な）から。ラテン語 ad satis（十分に）が語源。" }],
  // authorize (30212)
  [30212, { coreImage: "「権限を持つ者が公式に許可を与える・権限を付与する」のがコアイメージ。", usage: "「authorize a payment（支払いを承認する）」「authorize access（アクセスを許可する）」「authorized dealer（正規ディーラー）」のように使う。", synonymDifference: "authorize vs permit vs approve: authorize は特定の行動を行う公式な権限を与える。permit は許可を与える（allow to do）。approve は提案・申請を正式に認める。", englishDefinition: "To give official permission for something to happen.", etymology: "ラテン語 auctorizare（権威を与える）から。auctor（著者・創始者・authority と同語源）。" }],
  // bilateral (30213)
  [30213, { coreImage: "「二つの側・二国間に関わる」のがコアイメージ。一方的（unilateral）でも多国間（multilateral）でもなく「双方向」。", usage: "「bilateral agreement（二国間協定）」「bilateral trade（二国間貿易）」「bilateral talks（二国間会談）」のように使う。", synonymDifference: "bilateral vs unilateral vs multilateral: bilateral は二者間の。unilateral は一方的な（unilateral decision）。multilateral は多者間の（multilateral treaty）。", englishDefinition: "Involving two countries, groups, or people.", etymology: "bi-（二つの）＋ lateral（側・ラテン語 latus から）。" }],
  // brochure (30214)
  [30214, { coreImage: "「製品・サービス・イベントの情報を写真つきでまとめた小冊子・パンフレット」がコアイメージ。", usage: "「product brochure（製品パンフレット）」「travel brochure（旅行パンフレット）」「download a brochure（パンフレットをダウンロードする）」のように使う。", synonymDifference: "brochure vs pamphlet vs leaflet: brochure は複数ページでカラー印刷の格調ある小冊子（marketing material）。pamphlet はより簡素な小冊子（informational）。leaflet は1枚刷りのチラシ。", englishDefinition: "A small booklet containing information about a product, place, or service.", etymology: "フランス語 brochure（ホチキス留めしたもの）から。brocher（縫い合わせる）が語源。" }],
  // capacity (30215)
  [30215, { coreImage: "「収容・処理・生産できる最大量・能力」がコアイメージ。物理的な容量から、組織的・個人的な能力まで幅広く使う。", usage: "「full capacity（最大容量・フル稼働）」「production capacity（生産能力）」「seating capacity（収容人数）」「in my capacity as（〜の立場として）」のように使う。", synonymDifference: "capacity vs ability vs capability: capacity は最大限度・容量（how much it can hold/do）。ability は実際に持っている能力・技能（have the ability to）。capability は潜在的な能力（full capability）。", englishDefinition: "The maximum amount something can contain or produce; the ability to do something.", etymology: "ラテン語 capacitas（受け入れる力）から。capere（取る・contain と同語源）。" }],
  // clause (30216)
  [30216, { coreImage: "「契約書・法律文書の中の特定の条件・条項」がコアイメージ。文書全体ではなく「特定の一節」を指す。", usage: "「penalty clause（違約条項）」「escape clause（免責条項）」「clause in a contract（契約書の条項）」のように使う。", synonymDifference: "clause vs provision vs term: clause は契約・法律文書の特定の条文・条項。provision は条件・規定（legal provision）。term は契約条件・用語全般（terms and conditions）。", englishDefinition: "A specific section in a legal document or contract.", etymology: "ラテン語 clausa（締めくくり）から。claudere（閉じる・close と同語源）。" }],
  // collaborate (30217)
  [30217, { coreImage: "「共通の目的に向けて共同で作業する・コラボレーションする」のがコアイメージ。単純な協力より深い共同創造のニュアンス。", usage: "「collaborate with partners（パートナーと協働する）」「collaborate on a project（プロジェクトで共同作業する）」「collaboration tool（コラボレーションツール）」のように使う。", synonymDifference: "collaborate vs cooperate vs partner: collaborate は共同でより良いものを作り上げる創造的な協働。cooperate は共通の目的に向けて協力する（cooperative）。partner は正式なパートナーシップ関係を結ぶ。", englishDefinition: "To work together with someone to achieve something.", etymology: "ラテン語 collaborare（共に働く）から。com-（共に）＋ laborare（働く・labor と同語源）。" }],
  // compensate (30218)
  [30218, { coreImage: "「損害・損失・不足を金銭や別の手段で補う・補償する」のがコアイメージ。「バランスを取り戻す」行為。", usage: "「compensate for the loss（損失を補う）」「compensate employees fairly（社員に公正に報酬を支払う）」「compensation package（報酬パッケージ）」のように使う。", synonymDifference: "compensate vs reimburse vs pay: compensate は損害・不足を補う（broader scope）。reimburse は立替費用の返済（specific expense）。pay は労働の対価を支払う。", englishDefinition: "To give someone something in return for loss, injury, or work done.", etymology: "ラテン語 compensare（重さを量って釣り合わせる）から。com-（共に）＋ pensare（重さを量る・pension と同語源）。" }],
  // comprehensive (30219)
  [30219, { coreImage: "「何一つ抜けがない・すべてを網羅した」のがコアイメージ。部分的ではなく「全体を包含する」広さと深さ。", usage: "「comprehensive plan（包括的な計画）」「comprehensive report（総合的な報告書）」「comprehensive insurance（総合保険）」のように使う。", synonymDifference: "comprehensive vs complete vs thorough: comprehensive は範囲が広く全てを網羅している（wide coverage）。complete は全ての要素が揃っている（nothing missing）。thorough は細部まで念入りに行き届いた（detailed）。", englishDefinition: "Including all or nearly all aspects of something.", etymology: "ラテン語 comprehendere（すべてをつかむ）から。com-（完全に）＋ prehendere（つかむ）。" }],
  // consecutive (30220)
  [30220, { coreImage: "「途切れることなく連続して続く」のがコアイメージ。間に休みや中断がない「連続」。", usage: "「five consecutive days（5日連続）」「consecutive quarters（連続した四半期）」「consecutive wins（連勝）」のように使う。", synonymDifference: "consecutive vs successive vs continuous: consecutive は順番に切れ目なく続く（consecutive numbers: 1,2,3,4）。successive はある後に次が続く（successive governments）。continuous は常に途切れなく続いている（continuous operation）。", englishDefinition: "Following one after another without interruption.", etymology: "ラテン語 consecutivus（続く）から。con-（共に）＋ sequi（続く・sequence と同語源）。" }],
  // consolidate (30221)
  [30221, { coreImage: "「バラバラなものを一つにまとめる・基盤を強固にする」のがコアイメージ。合併・統合・強化すべてを包む語。", usage: "「consolidate offices（オフィスを統合する）」「consolidate debt（借金を一本化する）」「consolidate market position（市場地位を強固にする）」のように使う。", synonymDifference: "consolidate vs merge vs integrate: consolidate は散在するものを一つに集約し強固にする。merge は二つの組織・データを合体させる（merge companies）。integrate はシステム・文化などを一つに取り込む（integrate new hires）。", englishDefinition: "To combine things into a single more effective unit; to make something stronger.", etymology: "ラテン語 consolidare（固める）から。con-（完全に）＋ solidare（固める・solid と同語源）。" }],
  // constraint (30222)
  [30222, { coreImage: "「行動・選択肢を縛る制限・制約」のがコアイメージ。「これ以上はできない」という外部から課される限界。", usage: "「budget constraint（予算制約）」「time constraint（時間的制約）」「constraints on our options（選択肢への制約）」のように使う。", synonymDifference: "constraint vs restriction vs limitation: constraint は状況・構造的な制約（budget constraint）。restriction は意図的に課された制限・規制（travel restriction）。limitation は能力・量の限界（limitations of the system）。", englishDefinition: "A limitation that restricts what you can do.", etymology: "ラテン語 constringere（縛りつける）から。con-（完全に）＋ stringere（締め付ける・strict と同語源）。" }],
  // consult (30223)
  [30223, { coreImage: "「専門知識を持つ人に意見・助言を求める」のがコアイメージ。自分だけで判断せず「専門家に相談する」行為。", usage: "「consult a doctor（医師に相談する）」「consult a lawyer（弁護士に相談する）」「consulting firm（コンサルティング会社）」のように使う。", synonymDifference: "consult vs advise vs inquire: consult は専門家の意見を求める（client consults）。advise は専門家が意見を「与える」（advisor advises）。inquire は情報を得るために尋ねる（inquire about options）。", englishDefinition: "To seek advice or information from someone with expertise.", etymology: "ラテン語 consultare（熟慮する・意見を求める）から。consul（共に考える人）に由来。" }],
  // correspondence (30224)
  [30224, { coreImage: "「文書・メールによる正式なやり取り・通信」のがコアイメージ。「対応・一致」の意味もある。", usage: "「business correspondence（ビジネス通信文）」「correspondence with clients（顧客との書簡のやり取り）」「correspondence address（連絡先住所）」のように使う。", synonymDifference: "correspondence vs communication vs mail: correspondence は書面・メールによる正式な往復のやり取り（formal written exchange）。communication は会話・書面を含む全般的な情報伝達。mail は郵便・メール（the medium）。", englishDefinition: "Letters or emails exchanged between people; the relationship between two things that match.", etymology: "correspond（対応する・一致する）＋ -ence。ラテン語 correspondere（共に応じる）から。" }],
  // credentials (30225)
  [30225, { coreImage: "「その人が信頼・資格を持つことを証明するもの一式」がコアイメージ。学歴・資格・実績など「証明の束」。", usage: "「present credentials（資格証明を提示する）」「professional credentials（職業的資格）」「check credentials（資格を確認する）」のように使う。", synonymDifference: "credentials vs qualification vs certification: credentials はその人の信頼性・能力を示す一式（degrees, experience）。qualification は特定の仕事・活動の資格・要件（qualifications for the job）。certification は公式に認定された資格証（certificate）。", englishDefinition: "Documents or qualifications showing that someone is suitable for a job.", etymology: "ラテン語 credentialis（信頼に関する）から。credere（信じる・credit と同語源）。" }],
  // deduct (30226)
  [30226, { coreImage: "「合計から一定額を差し引く・控除する」のがコアイメージ。税金・費用などを「引いて」残りを出す計算行為。", usage: "「deduct tax（税金を差し引く）」「deduct expenses（経費を控除する）」「tax deduction（税額控除）」「deductible（控除できる・免責額）」のように使う。", synonymDifference: "deduct vs subtract vs withhold: deduct は税・費用などを正式に差し引く（tax/expense context）。subtract は数学的に引き算する（subtract numbers）。withhold は支払いを「差し控える・源泉徴収する」（withhold taxes）。", englishDefinition: "To take away an amount from a total.", etymology: "ラテン語 deducere（引き離す）から。de-（離れて）＋ ducere（引く・duct と同語源）。" }],
  // deficit (30227)
  [30227, { coreImage: "「必要量・期待量に対して不足している状態・赤字」のがコアイメージ。surplus（黒字・余剰）の反対。", usage: "「budget deficit（財政赤字）」「trade deficit（貿易赤字）」「run a deficit（赤字になる）」「deficit spending（赤字支出）」のように使う。", synonymDifference: "deficit vs shortage vs debt: deficit は支出が収入を上回る「赤字状態」（financial gap）。shortage は必要量に対する「不足・欠乏」（shortage of supplies）。debt は借りているお金・負債（national debt）。", englishDefinition: "The amount by which spending exceeds income; a shortage.", etymology: "ラテン語 deficit（欠けている・3人称単数）から。de-（離れて）＋ facere（する）。" }],
  // deliberate (30228)
  [30228, { coreImage: "「慎重に考えてから意図的に行う・よく考えた末の」のがコアイメージ。動詞では「熟慮する」意味になる。", usage: "「a deliberate choice（意図的な選択）」「deliberate action（計画的な行動）」「deliberate about（〜について熟慮する）」のように使う。", synonymDifference: "deliberate vs intentional vs purposeful: deliberate は事前に慎重に考えた末の行為（careful planning）。intentional は意図的・わざとの（intentional act）。purposeful は明確な目的を持った（purposeful effort）。", englishDefinition: "Done intentionally and carefully; to think carefully about something.", etymology: "ラテン語 deliberare（天秤にかけて考える）から。de-（完全に）＋ librare（天秤にかける・balance と関連）。" }],
  // designate (30229)
  [30229, { coreImage: "「特定の目的・役割のために指定する・任命する」のがコアイメージ。特別な目的のために「指名する・割り当てる」行為。", usage: "「designated area（指定エリア）」「designate a representative（代表を指名する）」「designated driver（指定ドライバー）」のように使う。", synonymDifference: "designate vs appoint vs assign: designate は特定目的・役割に指定する（designate a room for）。appoint はポジション・職務に公式に任命する（appoint a CEO）。assign は仕事・タスクを人に割り当てる（assign a task）。", englishDefinition: "To officially choose something or someone for a purpose.", etymology: "ラテン語 designare（印をつけて示す）から。de-（完全に）＋ signare（印をつける）。" }],
  // diploma (30230)
  [30230, { coreImage: "「学校・教育機関が発行する卒業・修了の公式証明書」がコアイメージ。", usage: "「high school diploma（高校卒業証書）」「receive a diploma（卒業証書を受け取る）」「diploma program（ディプロマプログラム）」のように使う。", synonymDifference: "diploma vs degree vs certificate: diploma は学校教育の修了証書（high school/vocational）。degree は大学が授与する学位（bachelor's degree）。certificate は特定スキル・研修の修了証（training certificate）。", englishDefinition: "An official document showing someone has successfully completed a course of study.", etymology: "ギリシャ語 diploma（二つ折りにされた書類）から。diploun（二重にする）に由来。" }],
  // disclose (30231)
  [30231, { coreImage: "「秘密にされていた情報を公式に開示する・明らかにする」のがコアイメージ。", usage: "「disclose financial information（財務情報を開示する）」「disclose a conflict of interest（利益相反を開示する）」「non-disclosure agreement（秘密保持契約）」のように使う。", synonymDifference: "disclose vs reveal vs expose: disclose は公式・義務的に情報を開示する（formal/legal）。reveal は驚きを持って「明らかにする」（dramatic reveal）。expose は隠されていた不都合な事実を「暴露する」（expose a scandal）。", englishDefinition: "To make previously secret information known.", etymology: "dis-（反対）＋ close（閉じる）。「閉じていたものを開く」のが原義。" }],
  // disruption (30232)
  [30232, { coreImage: "「通常の流れや秩序を壊す・中断させる大きな乱れ」がコアイメージ。デジタル革命のような「業界破壊」にも使う。", usage: "「service disruption（サービス障害）」「supply chain disruption（サプライチェーン混乱）」「disruptive technology（破壊的技術）」のように使う。", synonymDifference: "disruption vs interruption vs disturbance: disruption は大きく秩序・流れを壊す（major break）。interruption は一時的な中断（brief stop）。disturbance はより軽い「乱れ・迷惑」（noise disturbance）。", englishDefinition: "A major interruption to the normal activity or process.", etymology: "ラテン語 disruptio（引き裂くこと）から。dis-（分離）＋ rumpere（破る・rupture と同語源）。" }],
  // dividend (30233)
  [30233, { coreImage: "「会社の利益を株主に分配する配当金」がコアイメージ。努力に対する「利益の分け前」という広い意味も持つ。", usage: "「pay dividends（配当金を支払う）」「dividend yield（配当利回り）」「declare a dividend（配当を宣言する）」「pay dividends〈比喩〉（実を結ぶ・効果をあげる）」のように使う。", synonymDifference: "dividend vs interest vs profit: dividend は株主への利益配分（equity investors）。interest は債権者への利子（debt holders）。profit は収入からコストを引いた純利益（company perspective）。", englishDefinition: "A sum of money paid to shareholders from company profits.", etymology: "ラテン語 dividendum（分けられるもの）から。dividere（分ける）の動名詞。" }],
  // duration (30234)
  [30234, { coreImage: "「何かが続く時間の長さ・持続期間」がコアイメージ。開始から終了までの「時間の幅」。", usage: "「contract duration（契約期間）」「for the duration of（〜の期間中ずっと）」「call duration（通話時間）」「short duration（短期間）」のように使う。", synonymDifference: "duration vs period vs term: duration は持続する時間の長さに焦点（how long it lasts）。period は特定の時間的区切り（a period of time）。term は契約・学期などの正式な期間（contract term）。", englishDefinition: "The length of time that something lasts.", etymology: "ラテン語 duratio（持続すること）から。durare（続く・durable と同語源）。" }],
  // eligible (30235)
  [30235, { coreImage: "「特定の条件・基準を満たして対象になる・資格がある」のがコアイメージ。恩恵・参加・採用の「資格を満たしている」状態。", usage: "「eligible for a bonus（ボーナスの対象となる）」「eligible to vote（投票する資格がある）」「eligibility criteria（資格条件）」のように使う。", synonymDifference: "eligible vs qualified vs entitled: eligible は特定の条件を満たして対象になる（meet the criteria）。qualified は必要なスキル・資格を持っている（have the qualifications）。entitled は権利として受け取れる（legally entitled to benefits）。", englishDefinition: "Having the right qualifications or satisfying the conditions required.", etymology: "ラテン語 eligere（選ぶ・elect と同語源）＋ -ible（可能の接尾辞）。「選ばれる資格がある」のが原義。" }],
  // endorse (30236)
  [30236, { coreImage: "「公に支持・推薦する・裏書きする」のがコアイメージ。信頼性を担保して「お墨付きを与える」行為。", usage: "「endorse a candidate（候補者を支持する）」「celebrity endorsement（著名人の推薦）」「endorse a check（小切手を裏書きする）」のように使う。", synonymDifference: "endorse vs support vs approve: endorse は公式・公に支持を表明する（public declaration）。support は支持・援助する広い語。approve は提案・申請を正式に認める（authorize）。", englishDefinition: "To publicly support or recommend something; to sign the back of a check.", etymology: "ラテン語 indorsare（裏に書く）から。in-（上に）＋ dorsum（背中）。「小切手の裏に署名する」から「支持する」に転じた。" }],
  // enterprise (30237)
  [30237, { coreImage: "「リスクをとって新しいことに挑む事業・企業精神」のがコアイメージ。大胆な「進取の気性」を持つ事業体。", usage: "「small enterprise（中小企業）」「free enterprise（自由企業制度）」「enterprise software（企業向けソフトウェア）」「show enterprise（進取の精神を見せる）」のように使う。", synonymDifference: "enterprise vs company vs business: enterprise は事業・企業（特に大規模・意欲的な活動）を指す格調ある語。company は法的な「会社」（a limited company）。business は商業活動・事業全般（run a business）。", englishDefinition: "A business or company; willingness to undertake new projects.", etymology: "古フランス語 entreprendre（着手する）から。entre（間に）＋ prendre（取る・prize と同語源）。" }],
  // evaluate (30238)
  [30238, { coreImage: "「価値・有効性・成果を体系的に分析して判断する」のがコアイメージ。数値化・基準化して客観的に「評価する」行為。", usage: "「evaluate performance（パフォーマンスを評価する）」「evaluate options（選択肢を評価する）」「evaluation criteria（評価基準）」のように使う。", synonymDifference: "evaluate vs assess vs measure: evaluate は価値・有効性を総合的に判断する。assess は特定の基準に照らして査定する（tax assessment）。measure は数値で測定・計量する（measure results）。", englishDefinition: "To assess the value, quality, or importance of something.", etymology: "フランス語 évaluer から。e-（外に）＋ valuer（value＝価値を出す）。" }],
  // exceed (30239)
  [30239, { coreImage: "「基準・期待・限界を超える・上回る」のがコアイメージ。良い意味でも悪い意味でも「越境する」行為。", usage: "「exceed expectations（期待を超える）」「exceed the budget（予算を超過する）」「exceed the speed limit（制限速度を超える）」のように使う。", synonymDifference: "exceed vs surpass vs go beyond: exceed は設定された基準・限界を超える（exceed a limit）。surpass は他者・過去の記録を「上回る・超える」（surpass the competition）。go beyond は比喩的に「枠を越える」（go beyond expectations）。", englishDefinition: "To go beyond the limit or to be greater than something.", etymology: "ラテン語 excedere（外に行く）から。ex-（外に）＋ cedere（行く）。" }],
  // expedition (30240)
  [30240, { coreImage: "「特定の目的のために組まれた遠方への旅・探検隊」のがコアイメージ。また「迅速さ」の意味でも使われる。", usage: "「scientific expedition（科学探検）」「expedition team（探検隊）」「sales expedition（販売強化活動〈比喩〉）」「with expedition（迅速に）」のように使う。", synonymDifference: "expedition vs exploration vs journey: expedition は組織された目的のある遠征（formal, organized）。exploration はより広く「探索・調査」する行為（explore a new market）。journey は特定の目的地への「旅」（long journey）。", englishDefinition: "An organized journey for a specific purpose; speed in doing something.", etymology: "ラテン語 expedire（足を解放する・impediment の反対）から。「障害なく進む」→「遠征」の意に転じた。" }],

  // expertise (30241)
  [30241, { coreImage: "「特定の分野における深い専門知識・熟練した技術」がコアイメージ。長年の経験で磨かれた「プロの実力」。", usage: "「technical expertise（技術的専門知識）」「marketing expertise（マーケティングの専門知識）」「draw on expertise（専門知識を活かす）」のように使う。", synonymDifference: "expertise vs knowledge vs skill: expertise は深い専門性・熟練度（expert-level）。knowledge は習得した知識・情報。skill は実践的な「技能・技術」（technical skill）。", englishDefinition: "Expert knowledge or skill in a particular area.", etymology: "expert（専門家）＋ -ise（フランス語の名詞化）。フランス語 expertise から。" }],
  // extension (30242)
  [30242, { coreImage: "「時間・空間・機能を伸ばす・広げること」のがコアイメージ。電話の内線（extension）も、期限の延長も同じ語。", usage: "「deadline extension（締め切り延長）」「phone extension（電話内線番号）」「hair extension（ヘアエクステ）」「extension cord（延長コード）」のように使う。", synonymDifference: "extension vs expansion vs prolongation: extension は既存のものを伸ばす・追加する（extend a deadline）。expansion は規模・範囲を広げる（business expansion）。prolongation はより格式ばった「期間の延長」（prolongation of a contract）。", englishDefinition: "An addition to something that makes it longer; a telephone line on a shared system.", etymology: "ラテン語 extensio（伸ばすこと）から。ex-（外に）＋ tendere（伸ばす）。" }],
  // fluctuate (30243)
  [30243, { coreImage: "「上下・増減を繰り返しながら不安定に変動する」のがコアイメージ。波のように行き来する変動。", usage: "「prices fluctuate（価格が変動する）」「fluctuating demand（変動する需要）」「exchange rates fluctuate（為替レートが変動する）」のように使う。", synonymDifference: "fluctuate vs vary vs oscillate: fluctuate は予測しにくい不規則な上下変動（markets fluctuate）。vary は変化する・様々に異なる（prices vary by region）。oscillate はより規則的に「振動・往復する」（oscillate between two values）。", englishDefinition: "To change continually between high and low levels.", etymology: "ラテン語 fluctuare（波に揺れる）から。fluctus（波）が語源。" }],
  // forecast (30244)
  [30244, { coreImage: "「データ・トレンドを分析して将来の状況を予測する」のがコアイメージ。天気予報も売上予測も「forecast」。", usage: "「sales forecast（売上予測）」「weather forecast（天気予報）」「economic forecast（経済見通し）」「forecast growth（成長を予測する）」のように使う。", synonymDifference: "forecast vs predict vs estimate: forecast はデータに基づく将来の数値・状況の予測（professional/technical）。predict はより広く将来を「予言する・予測する」。estimate は不完全な情報からの概算。", englishDefinition: "A statement about what is likely to happen in the future.", etymology: "fore-（前もって）＋ cast（投げる・予測する）。「前もって投げかける」のが原義。" }],
  // fulfillment (30245)
  [30245, { coreImage: "「約束・注文・目標を完全に満たす・達成する行為・状態」のがコアイメージ。注文の発送処理（order fulfillment）にもよく使う。", usage: "「order fulfillment（注文処理・出荷）」「fulfillment center（フルフィルメントセンター）」「sense of fulfillment（充実感・達成感）」のように使う。", synonymDifference: "fulfillment vs completion vs satisfaction: fulfillment は約束・目標を完全に達成する（meeting obligations）。completion は仕事・プロジェクトを終わらせること。satisfaction は満足感・充足感（customer satisfaction）。", englishDefinition: "The act of fulfilling a promise or requirement; the feeling of satisfaction from doing something worthwhile.", etymology: "fulfill（満たす）＋ -ment（名詞化）。fulfill は古英語 fulfyllan（完全に満たす）から。" }],
  // implement (30246)
  [30246, { coreImage: "「計画・方針・システムを実際に動かして実施に移す」のがコアイメージ。計画段階から実行段階へのアクション。", usage: "「implement a strategy（戦略を実施する）」「implement changes（変更を実施する）」「implementation plan（実施計画）」のように使う。", synonymDifference: "implement vs execute vs carry out: implement は計画・システム・方針を正式に実施する（more formal）。execute はより速く・意志を持って実行する（execute a plan）。carry out は決定・任務を「遂行する」（carry out instructions）。", englishDefinition: "To put a plan or decision into effect.", etymology: "ラテン語 implementum（充填するもの）から。im-（中に）＋ plere（満たす）。「計画を現実で満たす」のが原義。" }],
  // incur (30247)
  [30247, { coreImage: "「費用・損失・罰則などを負うことになる・被る」のがコアイメージ。意図せず「かぶってしまう」ニュアンスが強い。", usage: "「incur costs（費用を負う）」「incur a penalty（罰則を受ける）」「incur debt（借金を背負う）」「without incurring charges（追加料金なしで）」のように使う。", synonymDifference: "incur vs suffer vs bear: incur は費用・負債・罰則を「招く・被る」（incur consequences）。suffer は苦しみ・損害を受ける（suffer a loss）。bear は重荷を「担う・耐える」（bear the cost）。", englishDefinition: "To experience something unpleasant, especially a cost or penalty, as a result of something you do.", etymology: "ラテン語 incurrere（〜の中に走り込む）から。in-（中に）＋ currere（走る）。" }],
  // initiative (30248)
  [30248, { coreImage: "「他者の指示を待たず、自ら最初の一歩を踏み出す力・構想」のがコアイメージ。「イニシアチブをとる」日本語でもおなじみ。", usage: "「take the initiative（主導権を取る）」「show initiative（積極性を示す）」「strategic initiative（戦略的取り組み）」「on one's own initiative（自分の判断で）」のように使う。", synonymDifference: "initiative vs leadership vs drive: initiative は自ら先に行動を起こす力・最初のアクション。leadership は人を引っ張る統率力。drive は前進する強い意志・やる気（inner drive）。", englishDefinition: "The ability to take action without being told; a new plan or action.", etymology: "ラテン語 initium（始まり）から。inire（中に入る）。「最初の行動を起こす人」が原義。" }],
  // insight (30249)
  [30249, { coreImage: "「表面の下にある本質・真実を見抜く深い理解・洞察」のがコアイメージ。「内側を見る」という語源通り、深い視点。", usage: "「gain insights（洞察を得る）」「valuable insight（貴重な見識）」「market insights（市場の洞察）」「provide insight into（〜についての洞察を提供する）」のように使う。", synonymDifference: "insight vs understanding vs knowledge: insight は表面の下にある深い本質への洞察（aha moment）。understanding は理解・把握（general understanding）。knowledge は習得された情報・知識（theoretical knowledge）。", englishDefinition: "A deep understanding of the true nature of something.", etymology: "in-（中を）＋ sight（見ること）。「内側を見る」のが原義。" }],
  // interpersonal (30250)
  [30250, { coreImage: "「人と人の間の関係・コミュニケーションに関する」のがコアイメージ。", usage: "「interpersonal skills（対人スキル）」「interpersonal relationship（対人関係）」「interpersonal communication（対人コミュニケーション）」のように使う。", synonymDifference: "interpersonal vs social vs personal: interpersonal は特定の「人と人の間」に焦点（interpersonal conflict）。social は社会的・集団的な（social skills）。personal は個人的・私的な（personal matter）。", englishDefinition: "Relating to relationships or communication between people.", etymology: "inter-（間に）＋ personal（個人の）。「人々の間の」のが原義。" }],
  // keynote (30251)
  [30251, { coreImage: "「会議・イベントのテーマ・方向性を定める最重要スピーチ・中心思想」のがコアイメージ。", usage: "「keynote speech（基調講演）」「keynote speaker（基調講演者）」「deliver the keynote（基調講演を行う）」のように使う。", synonymDifference: "keynote vs opening vs main: keynote は会議・イベントのテーマを示す最重要スピーチ（sets the tone）。opening は単に「開幕の」（opening remarks）。main はメインの・主要な（main speaker）。", englishDefinition: "The most important speech or theme of a conference or event.", etymology: "key（鍵）＋ note（音符）。音楽の「基本音」から転じて「根本的な主題」の意に。" }],
  // lease (30252)
  [30252, { coreImage: "「一定期間、代金を払って物・不動産を使用する契約・リース」のがコアイメージ。所有ではなく「使用権を借りる」こと。", usage: "「sign a lease（賃貸借契約を結ぶ）」「office lease（オフィスの賃貸借）」「lease a car（車をリースする）」「lease term（賃貸期間）」のように使う。", synonymDifference: "lease vs rent vs hire: lease は長期的な賃貸借契約（usually 1+ year）。rent は短期的・継続的な賃料支払い（rent an apartment monthly）。hire は人や機器を一時的に「雇う・借りる」（hire a van）。", englishDefinition: "A legal agreement to use property or equipment for a set period in exchange for payment.", etymology: "古フランス語 laisser（残す・置く）から。ラテン語 laxare（緩める）が語源。" }],
  // legitimate (30253)
  [30253, { coreImage: "「法律・規則・道理に基づいた正当・合法的な」のがコアイメージ。不正・不法の反対。", usage: "「legitimate business（正当なビジネス）」「legitimate concern（正当な懸念）」「legitimate claim（正当な主張）」「Is this legitimate?（これは合法ですか？）」のように使う。", synonymDifference: "legitimate vs legal vs valid: legitimate は法律・道理・慣例から正当と認められる（broader sense）。legal は法律に適合している（strictly law-based）。valid は公式に有効である（valid ID）。", englishDefinition: "Conforming to the law or rules; reasonable and justifiable.", etymology: "ラテン語 legitimus（法律に従った）から。lex（法律・legal と同語源）。" }],
  // liability (30254)
  [30254, { coreImage: "「負担・責任・負債を負っている状態」のがコアイメージ。asset（資産）の反対語として貸借対照表でも頻出。", usage: "「limited liability（有限責任）」「current liabilities（流動負債）」「product liability（製造物責任）」「be a liability（お荷物になる〈比喩〉）」のように使う。", synonymDifference: "liability vs debt vs obligation: liability は財務・法律的な責任・負債（broader legal term）。debt は借入金・借金（specific amount owed）。obligation は履行すべき義務・責任（moral/contractual obligation）。", englishDefinition: "A legal responsibility or financial debt; a disadvantage.", etymology: "liable（責任がある）＋ -ity（名詞化）。フランス語 liable（縛られた）から。" }],
  // logistics (30255)
  [30255, { coreImage: "「物・人・情報を必要な場所・時間に届けるための計画・管理システム」のがコアイメージ。サプライチェーン管理の核心。", usage: "「supply chain logistics（サプライチェーン物流）」「logistics company（物流会社）」「logistics management（ロジスティクス管理）」「handle the logistics（段取りをする）」のように使う。", synonymDifference: "logistics vs supply chain vs distribution: logistics は物の移動・保管・配送の実務的な管理。supply chain はサプライヤーから消費者までの全工程。distribution は商品を顧客に届ける流通プロセス。", englishDefinition: "The detailed organization of a complex operation; the management of goods and services.", etymology: "フランス語 logistique（兵站）から。ギリシャ語 logistikos（計算の・実用的な）が語源。" }],
  // mandatory (30256)
  [30256, { coreImage: "「法律・規則によって必ず行わなければならない義務的な」のがコアイメージ。optional（任意）の反対。", usage: "「mandatory training（必須研修）」「mandatory disclosure（義務的開示）」「mandatory attendance（参加必須）」「make something mandatory（義務化する）」のように使う。", synonymDifference: "mandatory vs compulsory vs required: mandatory は法律・規則による義務（non-compliance leads to penalty）。compulsory はより強制的・命令的（compulsory education）。required は条件・基準として「必要とされる」（required skills）。", englishDefinition: "Required by law or rules; obligatory.", etymology: "ラテン語 mandatum（命令）から。mandare（命じる・command と同語源）＋ -ory（形容詞化）。" }],
  // merger (30257)
  [30257, { coreImage: "「二つ以上の企業・組織が一つに合体する合併」のがコアイメージ。M&A（Mergers and Acquisitions）の M。", usage: "「company merger（会社合併）」「merger and acquisition（M&A）」「proposed merger（合併案）」「merger talks（合併交渉）」のように使う。", synonymDifference: "merger vs acquisition vs consolidation: merger は対等に近い合体（two become one）。acquisition は一方が他方を買収する（one buys the other）。consolidation は複数の組織を統合して一つにまとめる（broader term）。", englishDefinition: "The combining of two or more companies into one.", etymology: "ラテン語 mergere（沈める・混ぜ合わせる）から。emerge（浮かび上がる）の反対語と同語源。" }],
  // milestone (30258)
  [30258, { coreImage: "「プロジェクト・人生における重要な節目・画期的な出来事」のがコアイメージ。道標として「ここまで来た」を示す。", usage: "「project milestone（プロジェクトのマイルストーン）」「reach a milestone（節目を迎える）」「milestone event（節目のイベント）」のように使う。", synonymDifference: "milestone vs deadline vs goal: milestone はプロセスの重要な通過点（check-in point）。deadline は完了の期限（time limit）。goal は到達したい最終目標（end point）。", englishDefinition: "An important event or point in the development of something.", etymology: "mile（距離単位）＋ stone（石）。道路の「1マイルごとに置かれた距離標石」から転じた。" }],
  // moderate (30259)
  [30259, { coreImage: "「極端でなく中間・穏当な程度・量」のがコアイメージ。過度でも不足でもない「適度な・穏やかな」状態。", usage: "「moderate growth（穏やかな成長）」「at a moderate pace（適度なペースで）」「moderate temperature（穏やかな気温）」「moderate a discussion（議論を司会進行する）」のように使う。", synonymDifference: "moderate vs reasonable vs modest: moderate は程度・量が中間・適度な（not extreme）。reasonable は理性的・納得できる（reasonable price）。modest は謙虚な・控えめな（modest salary）。", englishDefinition: "Not extreme; of average amount or degree; to control a discussion.", etymology: "ラテン語 moderatus（程よく抑えられた）から。modus（度・measure と関連）。" }],
  // mortgage (30260)
  [30260, { coreImage: "「不動産を担保にしてお金を借りる・住宅ローン」のがコアイメージ。「死の誓い」という語源が示す通り、長期の重い契約。", usage: "「take out a mortgage（住宅ローンを組む）」「mortgage payment（住宅ローンの返済）」「mortgage rate（住宅ローン金利）」「pay off a mortgage（ローンを完済する）」のように使う。", synonymDifference: "mortgage vs loan vs lease: mortgage は不動産を担保にした長期ローン（property-secured）。loan は担保あり・なしの借入金全般。lease は物件の使用権を借りること（不動産は所有しない）。", englishDefinition: "A loan secured on a property, used to buy real estate.", etymology: "古フランス語 mort gage（死の誓い）から。mort（死）＋ gage（誓い）。「ローンが完済されるか借り手が死ぬまで続く」誓いから。" }],

  // numerous (30261)
  [30261, { coreImage: "「非常に多い・数多くの」のがコアイメージ。「数え切れないほど多い」という量の多さを強調する形容詞。", usage: "「numerous times（何度も）」「numerous complaints（多数の苦情）」「on numerous occasions（多くの機会に）」「numerous examples（多数の例）」のように使う。", synonymDifference: "numerous vs many vs multiple: numerous は「数え切れないほど多い」という強調表現（more formal）。many は日常的に使う「多い」。multiple は「複数の・多様な」（multiple options）。", englishDefinition: "Very many; existing in large numbers.", etymology: "ラテン語 numerosus（数が多い）から。numerus（数・number と同語源）＋ -ous。" }],
  // obligation (30262)
  [30262, { coreImage: "「道義的・法的に果たさなければならない義務・責任」のがコアイメージ。「縛られている」という感覚。", usage: "「fulfill an obligation（義務を果たす）」「contractual obligation（契約上の義務）」「feel an obligation to（〜する義務を感じる）」「under no obligation（義務はない）」のように使う。", synonymDifference: "obligation vs duty vs responsibility: obligation は外部から課せられた義務（contractual/legal）。duty は役割や立場から生じる義務（duty of care）。responsibility は自分が担うべき責任（責任感）。", englishDefinition: "Something you are required to do because of a law, rule, or promise.", etymology: "ラテン語 obligatio（縛ること）から。ob-（向かって）＋ ligare（縛る・ligate と同語源）。" }],
  // ongoing (30263)
  [30263, { coreImage: "「現在進行中で継続している」のがコアイメージ。「止まっていない・まだ続いている」状態。", usage: "「ongoing project（進行中のプロジェクト）」「ongoing investigation（継続中の調査）」「ongoing support（継続的なサポート）」「ongoing process（継続的なプロセス）」のように使う。", synonymDifference: "ongoing vs current vs continuous: ongoing は「今も進行中でまだ終わっていない」（unresolved/in progress）。current は「現在の時点での」（current situation）。continuous は「途切れなく続く」（continuous improvement）。", englishDefinition: "Continuing to exist or develop; currently in progress.", etymology: "on-（続いて）＋ going（進んでいる）。「前進し続けている」のが原義。" }],
  // outstanding (30264)
  [30264, { coreImage: "「群を抜いて優れている」と「まだ処理・支払いが完了していない」の二つのコアイメージ。「際立って飛び出している」という語源から。", usage: "「outstanding performance（素晴らしい業績）」「outstanding balance（未払い残高）」「outstanding invoice（未払い請求書）」「outstanding issue（未解決の課題）」のように使う。", synonymDifference: "outstanding vs excellent vs pending: outstanding は「群を抜いた優秀さ」または「未処理・未払い」。excellent は純粋に「優れた・素晴らしい」。pending は「保留中・処理待ち」（pending approval）。", englishDefinition: "Exceptionally good; not yet paid or resolved.", etymology: "out-（外に）＋ stand（立つ）。「目立って突き出ている」のが原義。" }],
  // oversight (30265)
  [30265, { coreImage: "「管理・監督する」という意味と「見落とす・不注意で見逃す」という二つのコアイメージ。「上から見る」という語源から両方の意味が生まれた。", usage: "「regulatory oversight（規制当局の監督）」「due to an oversight（見落としにより）」「oversight committee（監督委員会）」「lack of oversight（監督不足）」のように使う。", synonymDifference: "oversight vs supervision vs mistake: oversight は「監督」または「不注意による見落とし」。supervision は専ら「監督・管理」（supervision of staff）。mistake は意図的でないが広い誤り（I made a mistake）。", englishDefinition: "Supervision and management; a mistake caused by not noticing something.", etymology: "over-（上を）＋ sight（見ること）。「上から見渡す＝監督・見落とし」。" }],
  // patron (30266)
  [30266, { coreImage: "「お店・施設を定期的に利用する常連客」と「芸術家・組織を財政的に支援する後援者」のがコアイメージ。「保護者」という語源から。", usage: "「regular patrons（常連客）」「corporate patron（企業スポンサー）」「patron of the arts（芸術の後援者）」「patron saint（守護聖人）」のように使う。", synonymDifference: "patron vs customer vs sponsor: patron は贔屓にする常連客または支援者（loyalty/ongoing relationship）。customer は一般的な顧客（one-time OK）。sponsor は資金提供して宣伝効果を得るスポンサー（commercial）。", englishDefinition: "A regular customer of a store; a person who supports an artist or organization.", etymology: "ラテン語 patronus（保護者）から。pater（父）と同語源。「父のように守る者」が原義。" }],
  // pedestrian (30267)
  [30267, { coreImage: "「道路を歩いている人・歩行者」のがコアイメージ。車両に対する歩いている人。形容詞では「単調でつまらない」の意にも。", usage: "「pedestrian crossing（横断歩道）」「pedestrian zone（歩行者専用区域）」「yield to pedestrians（歩行者に道を譲る）」「pedestrian traffic（歩行者の往来）」のように使う。", synonymDifference: "pedestrian vs walker vs commuter: pedestrian は「徒歩で移動している人」（特に道路・交通文脈）。walker は「歩いている人」の一般的な表現（健康のために歩く人も含む）。commuter は「通勤・通学者」（交通手段問わず）。", englishDefinition: "A person walking along a road; ordinary and unimaginative (adjective).", etymology: "ラテン語 pedester（足による）から。pes（足・pedal と同語源）。" }],
  // pharmaceutical (30268)
  [30268, { coreImage: "「薬学・製薬に関する」のがコアイメージ。製薬業界（pharma industry）の形容詞形として頻出。", usage: "「pharmaceutical company（製薬会社）」「pharmaceutical industry（製薬業界）」「pharmaceutical products（医薬品）」「pharmaceutical research（薬学研究）」のように使う。", synonymDifference: "pharmaceutical vs medical vs medicinal: pharmaceutical は「製薬・薬学に関する」（industry/company focus）。medical は「医療全般に関する」（medical care/device）。medicinal は「薬効のある・薬として使われる」（medicinal herb）。", englishDefinition: "Relating to the production or sale of medicines.", etymology: "ギリシャ語 pharmakeutikos（薬剤師の）から。pharmakon（薬・毒）が語源。" }],
  // premises (30269)
  [30269, { coreImage: "「建物を含む敷地・構内全体」のがコアイメージ。複数形で使うのが基本。「建物とその周辺」を一体として指す。", usage: "「on the premises（構内で）」「off the premises（敷地外で）」「business premises（事業所）」「no smoking on the premises（構内禁煙）」のように使う。", synonymDifference: "premises vs property vs facility: premises は「特定の用途に使われる建物と敷地」（法的・ビジネス文脈で頻出）。property は「所有地・資産」全般（real property）。facility は「設備・施設」（manufacturing facility）。", englishDefinition: "A building and the land around it, used for a particular purpose.", etymology: "ラテン語 praemissa（前もって述べたもの）から。法律文書で「前述の建物・土地」が premises に。" }],
  // procurement (30270)
  [30270, { coreImage: "「組織が必要な物品・サービスを外部から調達・購買するプロセス」のがコアイメージ。ビジネス・政府機関で頻出の専門用語。", usage: "「procurement department（購買部門）」「procurement process（調達プロセス）」「strategic procurement（戦略的調達）」「government procurement（政府調達）」のように使う。", synonymDifference: "procurement vs purchasing vs sourcing: procurement は調達の計画から支払いまでの全プロセス（broad term）。purchasing は実際に物を買う行為（narrower, transactional）。sourcing はサプライヤーを探す・選ぶ活動（finding suppliers）。", englishDefinition: "The process of obtaining goods or services for an organization.", etymology: "ラテン語 procurare（代理で手配する）から。pro-（代わりに）＋ curare（手配する・care と関連）。" }],
  // proponent (30271)
  [30271, { coreImage: "「ある意見・計画・考えを積極的に支持・提唱する人」のがコアイメージ。「前に出して提案する人」。", usage: "「proponent of change（変革の支持者）」「proponent of renewable energy（再生可能エネルギーの提唱者）」「leading proponent（主要な支持者）」のように使う。", synonymDifference: "proponent vs advocate vs supporter: proponent は「積極的に推進・提唱する人」（最も強い推進者）。advocate は「主義・立場を擁護・弁護する人」（legal/formal）。supporter は「支持する人」一般（broader, less active）。", englishDefinition: "A person who supports or promotes a theory, proposal, or action.", etymology: "ラテン語 proponere（前に置く）から。pro-（前に）＋ ponere（置く・position と同語源）。" }],
  // prospective (30272)
  [30272, { coreImage: "「将来そうなる見込みがある・候補の」のがコアイメージ。「前を見ている」という語源から「未来志向の」。", usage: "「prospective clients（見込み客）」「prospective employees（採用候補者）」「prospective buyer（購入見込み者）」「prospective market（将来の市場）」のように使う。", synonymDifference: "prospective vs potential vs future: prospective は「なりそうな見込みがある」（likely, expected）。potential は「可能性を持つ」（could become）。future は単に「将来の・未来の」（future plans）。", englishDefinition: "Expected or likely to be in the future; likely to become something.", etymology: "ラテン語 prospectus（前を見ること）から。pro-（前に）＋ specere（見る・inspect と同語源）。" }],
  // provision (30273)
  [30273, { coreImage: "「将来の必要のために事前に準備・供給する」のがコアイメージ。また「契約・法律の条項・規定」という意味でも頻出。", usage: "「make provision for（〜に備える）」「provision of services（サービスの提供）」「a provision in the contract（契約の条項）」「social provisions（社会保障）」のように使う。", synonymDifference: "provision vs supply vs clause: provision は「準備した供給」または「契約・法律の条項」（dual meaning）。supply は「物資・供給」（narrower, physical）。clause は専ら「条文・条項」（legal document）。", englishDefinition: "The act of supplying something; a condition or requirement in a law or agreement.", etymology: "ラテン語 provisio（前もって見ること・準備）から。pro-（前に）＋ videre（見る・vision と同語源）。" }],
  // receptionist (30274)
  [30274, { coreImage: "「ホテル・オフィス・医療機関などで来客・電話の最初の窓口になる受付係」のがコアイメージ。", usage: "「front desk receptionist（フロントデスク受付）」「hotel receptionist（ホテルの受付係）」「contact the receptionist（受付に問い合わせる）」のように使う。", synonymDifference: "receptionist vs secretary vs front desk clerk: receptionist は来客・電話応対が主業務（first point of contact）。secretary は上司のスケジュール管理や事務全般（administrative support）。front desk clerk は特にホテルのフロント係（hotel-specific）。", englishDefinition: "A person who works at the front desk of a business, welcoming visitors.", etymology: "reception（受け取り・応接）＋ -ist（人）。ラテン語 receptio（受け入れること）から。" }],
  // retrieve (30275)
  [30275, { coreImage: "「失われたもの・遠くにあるものを取り戻す・取り出す」のがコアイメージ。データ検索の文脈でも頻出。", usage: "「retrieve data（データを取得する）」「retrieve a file（ファイルを取り出す）」「retrieve information（情報を検索する）」「retrieve a message（メッセージを取り出す）」のように使う。", synonymDifference: "retrieve vs recover vs fetch: retrieve は「保管場所や記憶から取り出す」（storage/database context）。recover は「失ったものを回復する」（recover from data loss）。fetch は「行って持ってくる」（口語的・動物のフェッチも）。", englishDefinition: "To get something back, especially stored information.", etymology: "古フランス語 retrouver（再び見つける）から。re-（再び）＋ trouver（見つける）。" }],
  // subsidiary (30276)
  [30276, { coreImage: "「親会社に支配・所有される子会社」のがコアイメージ。「補助的な・従属的な」という形容詞としても使われる。", usage: "「wholly owned subsidiary（完全子会社）」「subsidiary company（子会社）」「foreign subsidiary（海外子会社）」「establish a subsidiary（子会社を設立する）」のように使う。", synonymDifference: "subsidiary vs affiliate vs branch: subsidiary は親会社が過半数の株式を持つ子会社（majority control）。affiliate は提携関係にある関連会社（minority stake or partnership）。branch は本社の一部門・支社（not a separate legal entity）。", englishDefinition: "A company controlled by a parent company; secondary or subordinate.", etymology: "ラテン語 subsidiarius（予備の・補助の）から。subsidium（予備軍・援助）＋ -ary（形容詞化）。" }],
  // surplus (30277)
  [30277, { coreImage: "「必要量・使用量を超えた余剰・超過分」のがコアイメージ。財政では「黒字」、対義語は deficit（赤字）。", usage: "「budget surplus（財政黒字）」「trade surplus（貿易黒字）」「surplus inventory（余剰在庫）」「surplus funds（余剰資金）」のように使う。", synonymDifference: "surplus vs excess vs profit: surplus は「需要・必要を超えた余り」（trade surplus/budget surplus）。excess は「許容量を超えた過剰」（excess baggage）。profit は「売上から費用を引いた利益」（net profit）。", englishDefinition: "An amount left over; more than what is needed.", etymology: "ラテン語 superplus（超過分）から。super-（超えて）＋ plus（より多く）。" }],
  // transaction (30278)
  [30278, { coreImage: "「金融・商業上の取引・やり取り」のがコアイメージ。ビジネス・IT両方で頻出の重要語。", usage: "「financial transaction（金融取引）」「complete a transaction（取引を完了する）」「transaction fee（取引手数料）」「record all transactions（全取引を記録する）」のように使う。", synonymDifference: "transaction vs deal vs trade: transaction は「個々の金融・商業上のやり取り」（formal/specific）。deal は「取引・合意」一般（business deal/informal）。trade は「継続的な商売・交易・業種」（trade relations）。", englishDefinition: "An instance of buying, selling, or exchanging something.", etymology: "ラテン語 transactio（完了した取引）から。trans-（超えて・通じて）＋ agere（動かす・act と同語源）。" }],
  // vendor (30279)
  [30279, { coreImage: "「商品・サービスを提供・販売する業者・ベンダー」のがコアイメージ。調達先・サプライヤーとしての業者。", usage: "「select a vendor（業者を選定する）」「vendor management（ベンダー管理）」「third-party vendor（第三者業者）」「preferred vendor（優先業者）」のように使う。", synonymDifference: "vendor vs supplier vs distributor: vendor は商品・サービスを直接販売する業者（B2B/B2C）。supplier はメーカー・生産者への原材料・部品供給者（supply chain上流）。distributor は製品を流通させる中間業者（wholesaler）。", englishDefinition: "A company or person that sells goods or services.", etymology: "ラテン語 vendere（売る）から。venum（売り物）＋ dare（与える）。" }],
  // workforce (30280)
  [30280, { coreImage: "「組織・産業・社会全体が持つ労働力・就労者の集団」のがコアイメージ。人的資源としての「働く人全員」。", usage: "「workforce development（人材育成）」「diverse workforce（多様な人材）」「skilled workforce（熟練した労働力）」「reduce the workforce（人員を削減する）」のように使う。", synonymDifference: "workforce vs staff vs employees: workforce は組織全体・産業全体の「労働力・就労者集団」（macro view）。staff は「スタッフ・職員」（internal, more personal）。employees は雇用契約がある「従業員」（legal/HR term）。", englishDefinition: "All the people who work for a company or in an industry.", etymology: "work（仕事）＋ force（力・勢力）。「労働する人たちの勢力・集団」から。" }],
  // abrupt (30281)
  [30281, { coreImage: "「突然で予告なく起きる」と「無愛想・ぶっきらぼう」の二つのコアイメージ。「折り取られた」という語源から「唐突さ」。", usage: "「abrupt change（急な変更）」「abrupt end（唐突な終わり）」「abrupt manner（ぶっきらぼうな態度）」「come to an abrupt halt（突然止まる）」のように使う。", synonymDifference: "abrupt vs sudden vs unexpected: abrupt は「前触れなく唐突・ぶっきらぼう」（stronger connotation of rudeness）。sudden は「急な・突然の」（sudden rain）。unexpected は「予期しない」（unexpected results）。", englishDefinition: "Sudden and unexpected; rude and unfriendly.", etymology: "ラテン語 abruptus（断ち切られた）から。ab-（離れて）＋ rumpere（破る・rupture と同語源）。" }],
  // accommodate (30282)
  [30282, { coreImage: "「スペース・条件・ニーズに合わせて受け入れる・収容する」のがコアイメージ。「合わせる」「対応する」という柔軟性が核心。", usage: "「accommodate guests（宿泊客を収容する）」「accommodate requests（要望に応じる）」「accommodate differences（違いに対応する）」「seating capacity to accommodate 100（100名収容可能）」のように使う。", synonymDifference: "accommodate vs adjust vs adapt: accommodate は「他者のニーズ・状況に合わせて対応する」（external focus）。adjust は「自分自身を調整する」（minor changes）。adapt は「新しい環境に適応する」（larger, longer-term change）。", englishDefinition: "To provide space for; to adapt to the needs of someone.", etymology: "ラテン語 accommodare（適合させる）から。ad-（向かって）＋ commodare（便宜を図る・commodity と関連）。" }],
  // accrue (30283)
  [30283, { coreImage: "「時間とともに少しずつ積み上がって生じる・蓄積する」のがコアイメージ。利息・費用・権益が自然に増えていく。", usage: "「interest accrues（利息が積み上がる）」「accrued expenses（未払費用）」「accrual basis（発生主義）」「benefits accrue to（〜に利益が生じる）」のように使う。", synonymDifference: "accrue vs accumulate vs build up: accrue は「時間経過で自然に生じる・発生する」（特に財務）。accumulate は「意図的に蓄積する・たまる」（accumulate wealth）。build up は「段階的に増える・増やす」（口語的）。", englishDefinition: "To increase gradually; to be added as a benefit or right over time.", etymology: "ラテン語 accrescere（成長する）から。ac-（向かって）＋ crescere（成長する・crescent と同語源）。" }],
  // administer (30284)
  [30284, { coreImage: "「組織・プログラム・薬などを管理・運営・投与する」のがコアイメージ。「世話をする」という語源から「管理・実施」に発展。", usage: "「administer a test（試験を実施する）」「administer medication（薬を投与する）」「administer the program（プログラムを運営する）」「administer an oath（宣誓させる）」のように使う。", synonymDifference: "administer vs manage vs govern: administer は「具体的な手続き・運営・投与を実施する」（hands-on execution）。manage は「マネジメント・管理全般」（broader）。govern は「国・組織を統治・支配する」（higher level）。", englishDefinition: "To manage or direct; to give or apply officially.", etymology: "ラテン語 administrare（仕える・支援する）から。ad-（向かって）＋ ministrare（仕える・minister と同語源）。" }],
  // adverse (30285)
  [30285, { coreImage: "「不利・有害・逆方向の」のがコアイメージ。期待・目標に反する悪い影響。adverse と averse（嫌いな）は混同しやすいので注意。", usage: "「adverse conditions（不利な状況）」「adverse effects（悪影響）」「adverse weather（悪天候）」「adverse reaction（副作用・有害反応）」のように使う。", synonymDifference: "adverse vs negative vs unfavorable: adverse は「有害・不利・危険な状況や影響」（stronger negative impact）。negative は「否定的・消極的」（broader term）。unfavorable は「好ましくない・不利な」（unfavorable review）。", englishDefinition: "Harmful or unfavorable; preventing progress.", etymology: "ラテン語 adversus（向かい合った）から。ad-（向かって）＋ vertere（回す・convert と同語源）。" }],
  // aggregate (30286)
  [30286, { coreImage: "「個々の要素を集めた合計・総体」のがコアイメージ。統計や財務で「集計された全体」を指す。", usage: "「aggregate data（集計データ）」「aggregate demand（総需要）」「in the aggregate（全体として）」「aggregate sales（総売上）」のように使う。", synonymDifference: "aggregate vs total vs sum: aggregate は「個々の構成要素を集めた全体」（macro/statistical view）。total は「足し算した合計額」（total cost）。sum は「数値の合計」（sum of all values）。", englishDefinition: "A total formed by combining several elements; collected together.", etymology: "ラテン語 aggregatus（群れにした）から。ag-（向かって）＋ gregare（群れにする・gregarious と同語源）。" }],
  // ample (30288)
  [30288, { coreImage: "「十分すぎるほど豊富にある」のがコアイメージ。「ちょうど十分」ではなく「余裕をもって十分」という量の豊かさ。", usage: "「ample time（十分な時間）」「ample space（十分なスペース）」「ample opportunity（十分な機会）」「ample evidence（十分な証拠）」のように使う。", synonymDifference: "ample vs sufficient vs enough: ample は「必要以上に豊富で余裕がある」（more than enough）。sufficient は「必要を満たす十分量」（just enough）。enough は日常語で「足りている」（enough food）。", englishDefinition: "More than enough; in large quantity or space.", etymology: "ラテン語 amplus（広い・大きい）から。「広々とした→豊富な」のイメージ。" }],
  // anonymous (30289)
  [30289, { coreImage: "「名前が明かされていない・匿名の」のがコアイメージ。「名前なし」という語源通り、身元不明・匿名の状態。", usage: "「anonymous survey（匿名アンケート）」「remain anonymous（匿名のままにする）」「anonymous donor（匿名の寄付者）」「anonymous tip（匿名の情報提供）」のように使う。", synonymDifference: "anonymous vs unknown vs confidential: anonymous は「意図的に名前を伏せた」（by choice）。unknown は「誰なのか分からない」（author unknown）。confidential は「秘密扱いで開示されていない」（confidential source）。", englishDefinition: "Not identified by name; having no known name.", etymology: "ギリシャ語 anonymos（名なし）から。an-（なし）＋ onyma（名前・synonym と同語源）。" }],
  // appliance (30290)
  [30290, { coreImage: "「特定の目的のために使う電気機器・器具・装置」のがコアイメージ。家庭用電気機器（家電）が典型。", usage: "「kitchen appliances（キッチン家電）」「household appliances（家庭用電化製品）」「home appliance store（家電量販店）」「energy-efficient appliances（省エネ家電）」のように使う。", synonymDifference: "appliance vs device vs equipment: appliance は「家庭・業務用の電気器具」（refrigerator, washer）。device は「特定の目的のための小型機器」（smartphone, USB device）。equipment は「業務・活動に必要な機材・設備の総称」（sports equipment）。", englishDefinition: "A device or machine designed to perform a specific task, especially in the home.", etymology: "apply（適用する）＋ -ance（名詞化）。「目的に適用される道具」のが原義。" }],

  // apprenticeship (30291)
  [30291, { coreImage: "「職人・専門職の技術を師匠のもとで学ぶ見習い期間・制度」のがコアイメージ。実地訓練を通じて技術を習得する。", usage: "「complete an apprenticeship（見習いを修了する）」「apprenticeship program（実習プログラム）」「apprenticeship in carpentry（大工の見習い）」「paid apprenticeship（有給実習）」のように使う。", synonymDifference: "apprenticeship vs internship vs training: apprenticeship は「職人・専門職の技術を実地で学ぶ長期制度」（trade skill focused）。internship は「会社・組織での職業体験・インターンシップ」（white collar, shorter）。training は「スキル習得の訓練」全般（broader）。", englishDefinition: "A period of working under supervision to learn a trade or profession.", etymology: "apprentice（見習い）＋ -ship（状態・資格）。古フランス語 apprendre（学ぶ）から。" }],
  // attribute (30292)
  [30292, { coreImage: "「ある結果・性質の原因を〜のせいにする・〜に帰属させる」と「特性・属性」の二つのコアイメージ。", usage: "「attribute success to hard work（成功を努力のおかげとする）」「attributed to（〜に起因する）」「key attributes（主要な特性）」「personal attributes（個人の特性）」のように使う。", synonymDifference: "attribute vs credit vs assign: attribute は「原因・所有を〜に帰する」（neutral or evaluative）。credit は「功績を〜に帰する」（positive connotation）。assign は「役割・タスクを割り当てる」（deliberate action）。", englishDefinition: "To regard as caused by or belonging to; a characteristic or quality.", etymology: "ラテン語 attributum（割り当てられたもの）から。ad-（向かって）＋ tribuere（割り当てる・contribute と同語源）。" }],
  // audit (30293)
  [30293, { coreImage: "「財務・業務・コンプライアンスを公式に検査・監査する」のがコアイメージ。「聞く・調べる」という語源から。", usage: "「financial audit（財務監査）」「internal audit（内部監査）」「audit the accounts（会計を監査する）」「tax audit（税務調査）」のように使う。", synonymDifference: "audit vs inspection vs review: audit は「財務・コンプライアンスの公式な検査」（formal, systematic）。inspection は「物理的な現場確認・点検」（physical check）。review は「内容・品質を評価・検討する」（broader, less formal）。", englishDefinition: "An official examination of financial records or processes.", etymology: "ラテン語 audire（聞く）から。「会計報告を聞いて確認する」のが原義。" }],
  // banquet (30294)
  [30294, { coreImage: "「多くの人を招いた豪華な宴会・晩餐会」のがコアイメージ。公式な祝宴や表彰式での食事会。", usage: "「annual banquet（年次晩餐会）」「banquet hall（宴会場）」「farewell banquet（送別宴会）」「banquet for 200 guests（200名のための宴会）」のように使う。", synonymDifference: "banquet vs dinner vs reception: banquet は「格式ある大規模な宴会」（formal, ceremonial）。dinner は「夕食会」一般（casual to formal）。reception は「パーティー・歓迎会」（cocktail reception, wedding reception）。", englishDefinition: "A large formal meal for many people, often with speeches.", etymology: "古フランス語 banquet（小さな台・ベンチ）から。「テーブルを囲んで食事する」のが原義。" }],
  // benchmark (30295)
  [30295, { coreImage: "「比較・評価の基準となる指標・標準」のがコアイメージ。「ここを測量の基点とした」という測量用語から転じた。", usage: "「industry benchmark（業界標準）」「set a benchmark（基準を設定する）」「benchmark test（ベンチマークテスト）」「performance benchmark（パフォーマンスの指標）」のように使う。", synonymDifference: "benchmark vs standard vs criterion: benchmark は「他と比較するための具体的な指標・参照点」（quantifiable）。standard は「守るべき基準・水準」（quality standard）。criterion は「判断・評価の基準」（selection criterion）。", englishDefinition: "A standard or reference point used for comparison.", etymology: "bench（作業台）＋ mark（印）。測量で「基準点を台に刻む」のが原義。" }],
  // bulk (30296)
  [30296, { coreImage: "「大量・大部分・かさばる大きさ」のがコアイメージ。「まとまった大きな量」という感覚。", usage: "「buy in bulk（大量購入する）」「bulk order（まとめ注文）」「the bulk of（〜の大部分）」「bulk discount（まとめ買い割引）」のように使う。", synonymDifference: "bulk vs volume vs quantity: bulk は「大量にまとまった量・かさ」（large undivided mass）。volume は「容積・量・音量」（volume of sales）。quantity は「数量・分量」（quantity discount）。", englishDefinition: "A large quantity or mass; the main part of something.", etymology: "古ノルド語 bulki（積荷・船倉）から。「船に積まれた大量の荷物」のが原義。" }],
  // bureaucratic (30297)
  [30297, { coreImage: "「官僚制度に典型的な・お役所的な・手続きが煩雑な」のがコアイメージ。ネガティブなニュアンスで使われることが多い。", usage: "「bureaucratic process（官僚的な手続き）」「bureaucratic red tape（お役所の繁文縟礼）」「bureaucratic system（官僚制度）」「too bureaucratic（お役所的すぎる）」のように使う。", synonymDifference: "bureaucratic vs administrative vs procedural: bureaucratic は「官僚的で非効率・形式主義的な」（negative connotation）。administrative は「管理・行政の」（neutral）。procedural は「手順・手続きに関する」（following procedures）。", englishDefinition: "Following official rules and procedures, often in a slow or inflexible way.", etymology: "フランス語 bureau（事務机・オフィス）＋ -cratic（支配する）。「机の上で支配する者」のが原義。" }],
  // captivate (30298)
  [30298, { coreImage: "「人の心・注意をすっかり捉えて離さない・魅了する」のがコアイメージ。「捕虜にする」という語源から「心を捕らえる」に転じた。", usage: "「captivate the audience（聴衆を魅了する）」「captivating performance（魅力的なパフォーマンス）」「captivated by（〜に魅了された）」「captivate attention（注意を惹きつける）」のように使う。", synonymDifference: "captivate vs fascinate vs charm: captivate は「完全に引き込んで離さない」（strongest, full attention）。fascinate は「不思議な力で惹きつける」（mysterious appeal）。charm は「魅力・愛嬌で惹きつける」（warmth/personality）。", englishDefinition: "To attract and hold the attention of someone; to fascinate.", etymology: "ラテン語 captivare（捕まえる）から。captivus（捕虜）＋ -ate。capture と同語源。" }],
  // certify (30299)
  [30299, { coreImage: "「公式機関が基準を満たすことを認定・証明する」のがコアイメージ。「確かにそうだと証明する」という確実性。", usage: "「certified accountant（認定会計士）」「certify a document（書類を認証する）」「ISO certified（ISO認定を受けた）」「certify compliance（コンプライアンスを証明する）」のように使う。", synonymDifference: "certify vs verify vs confirm: certify は「公式機関が正式に認定・証明する」（official certification）。verify は「正確さ・真実性を確認する」（check accuracy）。confirm は「すでにある情報を確かめる」（confirm reservation）。", englishDefinition: "To officially declare or confirm something, especially by issuing a certificate.", etymology: "ラテン語 certificare（確実にする）から。certus（確かな・certain と同語源）＋ facere（作る）。" }],
  // chronic (30300)
  [30300, { coreImage: "「長期間にわたって続く・慢性的な」のがコアイメージ。acute（急性・一時的）の反対。改善が難しく継続する状態。", usage: "「chronic illness（慢性疾患）」「chronic shortage（慢性的な不足）」「chronic pain（慢性的な痛み）」「chronic understaffing（慢性的な人員不足）」のように使う。", synonymDifference: "chronic vs persistent vs recurring: chronic は「長期間改善されない継続的な状態」（ongoing condition）。persistent は「粘り強く続く・なかなか消えない」（persistent cough）。recurring は「繰り返し起きる」（recurring problem）。", englishDefinition: "Lasting for a long time; recurring frequently.", etymology: "ギリシャ語 chronikos（時間の）から。chronos（時間・chronology と同語源）。" }],
  // clarify (30301)
  [30301, { coreImage: "「不明瞭な点・誤解を取り除いて明確にする・説明する」のがコアイメージ。「澄んだ・クリアな」という語源から。", usage: "「clarify a point（要点を明確にする）」「could you clarify?（明確にしてもらえますか？）」「clarify the process（プロセスを説明する）」「clarify misunderstandings（誤解を解く）」のように使う。", synonymDifference: "clarify vs explain vs specify: clarify は「あいまいな点を明確にする」（removing ambiguity）。explain は「理解できるように詳しく説明する」（giving details）。specify は「具体的に特定・指定する」（specify requirements）。", englishDefinition: "To make something clearer or easier to understand.", etymology: "ラテン語 clarificare（明るくする）から。clarus（明るい・clear と同語源）＋ facere（する）。" }],
  // cater (30302)
  [30302, { coreImage: "「食事・ニーズを提供して満足させる」のがコアイメージ。ケータリング（cater）が代表的な使い方。", usage: "「cater for events（イベントに仕出しをする）」「cater to needs（ニーズに応える）」「catering service（ケータリングサービス）」「cater to all tastes（あらゆる好みに対応する）」のように使う。", synonymDifference: "cater vs provide vs supply: cater は「特定のニーズ・好みに応じたサービスを提供する」（tailored service）。provide は「必要なものを供給・提供する」（general）。supply は「物資・材料を供給する」（physical goods）。", englishDefinition: "To provide food and services; to satisfy the needs of.", etymology: "中期英語 catour（仕入れ人）から。古フランス語 acater（買う）が語源。" }],
  // compatible (30303)
  [30303, { coreImage: "「システム・機器・人同士が問題なく一緒に機能できる・相性が良い」のがコアイメージ。「共に苦しめることができる」という語源から「共存可能」の意に。", usage: "「compatible software（互換性のあるソフトウェア）」「backward compatible（後方互換性がある）」「compatible devices（互換デバイス）」「compatible with our system（自社システムと互換）」のように使う。", synonymDifference: "compatible vs interoperable vs consistent: compatible は「一緒に機能できる・相性が合う」（general compatibility）。interoperable は「異なるシステム間で連携できる」（technical systems）。consistent は「矛盾がなく一貫した」（consistent results）。", englishDefinition: "Able to exist or work together without conflict.", etymology: "ラテン語 compatibilis（共に苦しめる）から。com-（共に）＋ pati（耐える・patient と同語源）。" }],
  // compile (30304)
  [30304, { coreImage: "「複数の情報・データをまとめて一つにする・編集する」のがコアイメージ。プログラミングでは「ソースコードを実行可能形式に変換する」意でも使われる。", usage: "「compile a report（報告書をまとめる）」「compile data（データを集計する）」「compile a list（リストを作成する）」「compile the code（コードをコンパイルする）」のように使う。", synonymDifference: "compile vs collect vs assemble: compile は「複数の素材を整理・編集してまとめる」（organized collection）。collect は「集める」（gathering）。assemble は「部品・人を一箇所に集める」（put together physically）。", englishDefinition: "To produce by assembling information; to convert source code.", etymology: "ラテン語 compilare（略奪する・集める）から。com-（共に）＋ pilare（押しつぶす）。" }],
  // complement (30305)
  [30305, { coreImage: "「不足を補って完全にする・補完する」のがコアイメージ。complement（補完）と compliment（称賛）はスペルが似ているが全く意味が異なる。", usage: "「complement each other（互いを補完する）」「complement the team（チームを補完する）」「a good complement to（〜の良い補完）」「complementary skills（補完的なスキル）」のように使う。", synonymDifference: "complement vs supplement vs enhance: complement は「不足を埋めて全体を完成させる」（makes complete）。supplement は「追加して補強する」（add to）。enhance は「品質・価値を高める」（improve quality）。", englishDefinition: "To add to something in a way that makes it better or complete.", etymology: "ラテン語 complementum（完全にするもの）から。com-（完全に）＋ plere（満たす・complete と同語源）。" }],
  // concur (30307)
  [30307, { coreImage: "「意見が一致する・同意する」のがコアイメージ。「共に走る・合流する」という語源から「意見が交わる」の意に。", usage: "「I concur（同意します）」「concur with the decision（決定に同意する）」「concur on the findings（調査結果に一致する）」「concurring opinion（同意意見）」のように使う。", synonymDifference: "concur vs agree vs consent: concur はより格式ばった「意見・判断が一致する」（formal/legal contexts）。agree は日常的な「同意・合意」（I agree）。consent は「許可・承認を与える」（give consent）。", englishDefinition: "To agree with an opinion or decision; to happen at the same time.", etymology: "ラテン語 concurrere（共に走る）から。con-（共に）＋ currere（走る・current と同語源）。" }],
  // confidential (30308)
  [30308, { coreImage: "「信頼して秘密にされる・機密扱いの」のがコアイメージ。「信頼を与えられた」という語源から「秘密を守る義務がある」。", usage: "「strictly confidential（極秘）」「confidential information（機密情報）」「keep it confidential（秘密にしておく）」「confidential document（機密文書）」のように使う。", synonymDifference: "confidential vs secret vs private: confidential は「信頼関係に基づき秘密扱い」（shared with selected people in confidence）。secret は「誰にも知られていない」（completely hidden）。private は「個人的・プライベートな」（personal matters）。", englishDefinition: "Intended to be kept secret; not to be shared publicly.", etymology: "ラテン語 confidens（信頼する）から。con-（完全に）＋ fidere（信頼する・confidence と同語源）。" }],
  // constitute (30309)
  [30309, { coreImage: "「全体を構成する・成立させる」のがコアイメージ。「一緒に置く・組み立てる」という語源から。また法的に「設立する」意でも使われる。", usage: "「constitute a majority（過半数を構成する）」「constitute a violation（違反を構成する）」「legally constituted（合法的に設立された）」「constitute the board（取締役会を構成する）」のように使う。", synonymDifference: "constitute vs compose vs form: constitute は「要素として全体を構成する」（the parts that make up the whole）。compose は「複数要素から構成される」（the whole is composed of parts）。form は「形・組織を作る」（form a committee）。", englishDefinition: "To make up or form; to be equivalent to; to establish legally.", etymology: "ラテン語 constituere（置く・確立する）から。con-（共に）＋ statuere（置く・status と同語源）。" }],
  // contingent (30310)
  [30310, { coreImage: "「特定の条件が満たされた場合にのみ成立する・条件付きの」のがコアイメージ。「たまたま触れる・偶然の」という語源から「条件次第」の意に。", usage: "「contingent on approval（承認次第の）」「contingent offer（条件付きオファー）」「contingent liability（偶発債務）」「contingency plan（緊急時対応計画）」のように使う。", synonymDifference: "contingent vs conditional vs dependent: contingent は「特定の条件・偶発的な出来事に左右される」（formal/legal）。conditional は「条件が満たされた場合の」（conditional approval）。dependent は「〜に依存している」（dependent on funding）。", englishDefinition: "Dependent on a condition; uncertain; a group sent as representatives.", etymology: "ラテン語 contingere（触れる・起きる）から。con-（共に）＋ tangere（触れる・tangent と同語源）。" }],
  // credential (30312)
  [30312, { coreImage: "「資格・能力・信頼性を証明するもの」のがコアイメージ。複数形 credentials でよく使われる。「信頼を付与するもの」という語源から。", usage: "「academic credentials（学歴・資格）」「check credentials（資格を確認する）」「impressive credentials（輝かしい実績）」「login credentials（ログイン情報）」のように使う。", synonymDifference: "credential vs qualification vs certificate: credential は「信頼性・能力を証明するもの全般」（broad term）。qualification は「特定の仕事・役割に必要な資格・能力」（job qualifications）。certificate は「修了・認定を証明する書類」（physical document）。", englishDefinition: "Qualifications or achievements used to establish trustworthiness or ability.", etymology: "ラテン語 credentia（信頼・信念）から。credere（信じる・credit と同語源）。" }],
  // curtail (30313)
  [30313, { coreImage: "「費用・活動・自由を削減する・短くする」のがコアイメージ。「尻尾を切る」という語源から「縮小する」の意に。", usage: "「curtail spending（支出を削減する）」「curtail operations（業務を縮小する）」「curtail rights（権利を制限する）」「curtail the program（プログラムを縮小する）」のように使う。", synonymDifference: "curtail vs reduce vs cut: curtail は「制限・縮小して通常より少なくする」（restrict/limit）。reduce は「量・程度を下げる」（reduce cost）。cut は「大幅に削除・削減する」（cut the budget）。", englishDefinition: "To reduce or limit something; to cut short.", etymology: "中期英語 curtal（尾を切られた馬）から。ラテン語 curtus（短い・curtate と関連）。" }],
  // customary (30314)
  [30314, { coreImage: "「慣習・習慣に基づいた・通例の」のがコアイメージ。特定のコミュニティや状況で「普通そうするもの」という規範。", usage: "「customary practice（慣習的な慣行）」「it is customary to（〜するのが慣例だ）」「customary law（慣習法）」「as is customary（慣例どおり）」のように使う。", synonymDifference: "customary vs traditional vs conventional: customary は「特定のグループ・状況での慣習的な行動」（what people usually do）。traditional は「長い歴史のある伝統的な」（passed down through generations）。conventional は「一般的に広く認められた標準的な」（conforming to norms）。", englishDefinition: "In accordance with custom; usual or expected.", etymology: "custom（慣習）＋ -ary（形容詞化）。ラテン語 consuetudo（習慣）から。" }],
  // dedicate (30315)
  [30315, { coreImage: "「時間・労力・人生を〜のために捧げる・専念する」のがコアイメージ。「神に奉納する」という宗教的語源から「完全に捧げる」の意に。", usage: "「dedicate oneself to（〜に専念する）」「dedicated employee（献身的な従業員）」「dedicated server（専用サーバー）」「dedicated to improving（改善に取り組む）」のように使う。", synonymDifference: "dedicate vs devote vs commit: dedicate は「〜のために全力を捧げる」（strong personal commitment）。devote は「時間・労力を費やす」（devote time to）。commit は「約束・コミットメントをする」（commit to a plan）。", englishDefinition: "To give fully to a purpose; to inscribe a book to someone.", etymology: "ラテン語 dedicare（神に捧げる）から。de-（完全に）＋ dicare（宣言する・indicate と関連）。" }],
  // demolish (30316)
  [30316, { coreImage: "「建物・構造物を完全に取り壊す・解体する」のがコアイメージ。また「議論・反論を完全に打ち破る」比喩にも使う。", usage: "「demolish a building（建物を取り壊す）」「demolish the old factory（古い工場を解体する）」「demolition work（解体工事）」「demolish an argument（議論を完全に論破する）」のように使う。", synonymDifference: "demolish vs destroy vs tear down: demolish は「計画的に建造物を解体する」（deliberate, structural）。destroy は「破壊する」全般（broader, violence ok）。tear down は「引き倒す・取り壊す」の口語表現（less formal）。", englishDefinition: "To pull down or completely destroy a building or structure.", etymology: "ラテン語 demoliri（取り壊す）から。de-（逆に・取り除く）＋ moliri（建設する・mole と関連）。" }],
  // deplete (30317)
  [30317, { coreImage: "「資源・蓄えを使い果たして枯渇させる」のがコアイメージ。「満タンから空に」という語源から。", usage: "「deplete resources（資源を枯渇させる）」「depleted inventory（在庫が底をつく）」「ozone depletion（オゾン層の枯渇）」「deplete funds（資金を使い果たす）」のように使う。", synonymDifference: "deplete vs exhaust vs drain: deplete は「資源・貯蓄が徐々に減って尽きる」（gradual reduction）。exhaust は「完全に使い尽くす」（exhaust all options）。drain は「液体・エネルギーが流れ出て減る」（drain the battery）。", englishDefinition: "To use up or reduce severely; to empty of resources.", etymology: "ラテン語 deplere（空にする）から。de-（反対・取り除く）＋ plere（満たす・complete と同語源）。" }],
  // detour (30318)
  [30318, { coreImage: "「本来のルートを避けて迂回する・回り道」のがコアイメージ。工事や事故による迂回路。比喩的に「寄り道」も。", usage: "「take a detour（迂回する）」「road detour（道路の迂回路）」「detour sign（迂回路の標識）」「make a detour through（〜を経由して迂回する）」のように使う。", synonymDifference: "detour vs bypass vs diversion: detour は「一時的な迂回路・回り道」（temporary route）。bypass は「本道を避けて直接つなぐ幹線バイパス」（permanent alternative route）。diversion は「交通を別の方向に誘導する」（traffic management）。", englishDefinition: "A route that avoids a main road; a roundabout way.", etymology: "フランス語 détour（回り道）から。dé-（逆に）＋ tourner（回る・tour と同語源）。" }],
  // devise (30319)
  [30319, { coreImage: "「アイデア・計画・方法を工夫・考案する」のがコアイメージ。「分けて考える→工夫する」という語源から。", usage: "「devise a plan（計画を考案する）」「devise a strategy（戦略を立てる）」「devise a solution（解決策を工夫する）」「devise a new method（新しい方法を考案する）」のように使う。", synonymDifference: "devise vs design vs invent: devise は「問題解決のための計画・方法を工夫して考える」（problem-solving focus）。design は「目的に合った形・システムを作る」（visual/structural design）。invent は「世界初の新しいものを発明する」（creating something new）。", englishDefinition: "To plan or invent a method or strategy.", etymology: "ラテン語 divisus（分けられた）から。de-（離れて）＋ videre（見る・divide と同語源）。「細かく分けて考える→工夫する」のが原義。" }],
  // diminish (30320)
  [30320, { coreImage: "「価値・重要性・量が徐々に減少する・小さくなる」のがコアイメージ。「価値を下げる・見くびる」という比喩にも使われる。", usage: "「diminishing returns（収穫逓減）」「diminish in value（価値が下がる）」「diminish the importance of（〜の重要性を下げる）」「diminished capacity（能力低下）」のように使う。", synonymDifference: "diminish vs decrease vs reduce: diminish は「重要性・影響力が小さくなる」（often gradual, qualitative）。decrease は「数量が減る」（quantitative: decrease in sales）。reduce は「意図的に減らす」（reduce costs）。", englishDefinition: "To make or become smaller, weaker, or less important.", etymology: "ラテン語 diminuere（小さくする）から。di-（離れて）＋ minuere（小さくする・minus と同語源）。" }],

  // discard (30321)
  [30321, { coreImage: "「不要なものを捨てる・廃棄する」のがコアイメージ。「カードを捨てる」という語源から転じた。ゲームのカードを捨てることからビジネスの廃棄へ。", usage: "「discard old files（古いファイルを廃棄する）」「discard packaging（梱包材を捨てる）」「discard an idea（アイデアを捨てる）」「discard safely（安全に廃棄する）」のように使う。", synonymDifference: "discard vs dispose vs throw away: discard は「不要と判断して捨てる」（intentional rejection）。dispose は「適切な方法で処分する」（dispose of waste）。throw away は「捨てる」の口語表現（less formal）。", englishDefinition: "To throw away or get rid of something unwanted.", etymology: "dis-（離して）＋ card（カード）。トランプで「手札を捨てる」から転じた。" }],
  // dispatch (30322)
  [30322, { coreImage: "「迅速に発送する・派遣する」のがコアイメージ。「終わらせる→送り出す」という語源から「素早く送る」の意に。", usage: "「dispatch an order（注文を発送する）」「dispatch a team（チームを派遣する）」「dispatch center（配送センター）」「dispatch with speed（迅速に発送する）」のように使う。", synonymDifference: "dispatch vs send vs ship: dispatch は「素早く・公式に送り出す」（official/urgent）。send は「送る」の一般表現（send a message）。ship は「輸送機関で配送する」（ship the package）。", englishDefinition: "To send off quickly for a purpose; the sending of goods or people.", etymology: "スペイン語 despachar（急いで送る）から。des-（離れて）＋ pachar（解決する）。" }],
  // dispose (30323)
  [30323, { coreImage: "「廃棄物・不要物を適切な方法で処分する」のがコアイメージ。また「〜する気にさせる」の意でも使われる。", usage: "「dispose of waste（廃棄物を処分する）」「properly disposed（適切に処分された）」「well-disposed（好意的な）」「dispose of old equipment（古い機器を処分する）」のように使う。", synonymDifference: "dispose vs discard vs eliminate: dispose は「廃棄物を適切な手順で処分する」（proper disposal process）。discard は「不要と判断して捨てる」（simple rejection）。eliminate は「完全に取り除く・排除する」（eliminate a problem）。", englishDefinition: "To get rid of by throwing away or selling; to arrange or settle.", etymology: "ラテン語 disponere（配置する）から。dis-（分けて）＋ ponere（置く・position と同語源）。" }],
  // elaborate (30324)
  [30324, { coreImage: "「詳細に作り込まれた・精巧な」（形容詞）と「詳しく説明する・詳細を述べる」（動詞）のがコアイメージ。「手間をかけて作った」という語源から。", usage: "「elaborate plan（精巧な計画）」「elaborate on the point（その点を詳しく説明する）」「elaborate design（精巧なデザイン）」「could you elaborate?（詳しく説明してもらえますか？）」のように使う。", synonymDifference: "elaborate vs detailed vs complex: elaborate は「精巧に細部まで作り込まれた・手が込んだ」（painstakingly detailed）。detailed は「詳細な」（detailed report）。complex は「複雑な・構造が入り組んだ」（complex system）。", englishDefinition: "Detailed and complicated; to explain in more detail.", etymology: "ラテン語 elaboratus（労作した）から。e-（外に）＋ laborare（働く・labor と同語源）。" }],
  // embrace (30325)
  [30325, { coreImage: "「新しいアイデア・変化・機会を積極的に受け入れる」のがコアイメージ。「抱擁する」という身体的な動作から「心で受け入れる」比喩へ。", usage: "「embrace change（変化を受け入れる）」「embrace new technology（新技術を取り入れる）」「embrace diversity（多様性を尊重する）」「embrace the opportunity（機会を活かす）」のように使う。", synonymDifference: "embrace vs accept vs adopt: embrace は「熱意を持って積極的に受け入れる」（enthusiastically）。accept は「抵抗せずに受け入れる」（neutral）。adopt は「正式に採用・導入する」（adopt a policy）。", englishDefinition: "To accept something eagerly; to hold someone closely in your arms.", etymology: "古フランス語 embrasser（抱きしめる）から。em-（中に）＋ bras（腕・brace と関連）。" }],
  // empower (30326)
  [30326, { coreImage: "「人・組織に権限・能力・自信を与えて自律的に行動できるようにする」のがコアイメージ。エンパワーメント（empowerment）の動詞形。", usage: "「empower employees（従業員に権限を与える）」「empower communities（地域を力づける）」「feel empowered（エンパワーされた感覚）」「empower to make decisions（意思決定権を付与する）」のように使う。", synonymDifference: "empower vs authorize vs enable: empower は「内側から力を引き出して自律的にする」（builds capacity）。authorize は「公式な権限を与える」（grant official permission）。enable は「可能にする・条件を整える」（enable access）。", englishDefinition: "To give power, authority, or confidence to someone.", etymology: "em-（与える）＋ power（力）。「力を与える」のが原義。" }],
  // enclose (30327)
  [30327, { coreImage: "「書類・物を封筒・パッケージに同封する」のがコアイメージ。また「囲む・包む」という物理的意味でも使う。", usage: "「please find enclosed（同封をご確認ください）」「enclose a check（小切手を同封する）」「enclosed area（囲まれた区域）」「enclose a document（書類を同封する）」のように使う。", synonymDifference: "enclose vs include vs attach: enclose は「封筒・パッケージに物を入れる」（physical enclosure）。include は「含める」（broader scope）。attach は「ファイルを添付する」（digital: email attachment）。", englishDefinition: "To place something inside an envelope or package; to surround.", etymology: "en-（中に）＋ close（閉じる）。「中に入れて閉じる」のが原義。" }],
  // enforce (30328)
  [30328, { coreImage: "「法律・規則・決定を強制的に守らせる・施行する」のがコアイメージ。「力を加えて実行させる」という語源から。", usage: "「enforce a law（法律を施行する）」「enforce regulations（規則を遵守させる）」「enforce the policy（方針を徹底する）」「law enforcement（法執行）」のように使う。", synonymDifference: "enforce vs implement vs apply: enforce は「力・権威を使って守らせる」（compliance through authority）。implement は「計画・政策を実施する」（put into action）。apply は「原則・ルールを適用する」（apply a rule）。", englishDefinition: "To make sure a law or rule is obeyed.", etymology: "en-（強化）＋ force（力）。ラテン語 fortis（強い）と同語源。" }],
  // enhance (30329)
  [30329, { coreImage: "「品質・価値・能力をさらに高める・向上させる」のがコアイメージ。現状から「プラスアルファ」する意。", usage: "「enhance performance（性能を向上させる）」「enhance the user experience（ユーザー体験を向上させる）」「enhance skills（スキルを高める）」「enhance productivity（生産性を向上させる）」のように使う。", synonymDifference: "enhance vs improve vs upgrade: enhance は「現状の良さをさらに引き出す・高める」（emphasizing added value）。improve は「問題点を直してより良くする」（fix + improve）。upgrade は「より新しい・高い水準のものに更新する」（upgrade software）。", englishDefinition: "To improve the quality, value, or extent of something.", etymology: "古フランス語 enhaucier（高くする）から。en-（高める）＋ haut（高い・altitude と関連）。" }],
  // ensure (30330)
  [30330, { coreImage: "「確実に〜が起きるように・そうなるように保証する」のがコアイメージ。「安全にする」という語源から「確実性を担保する」の意に。", usage: "「ensure quality（品質を確保する）」「ensure compliance（コンプライアンスを確保する）」「ensure that...（〜であることを確保する）」「ensure safety（安全を確保する）」のように使う。", synonymDifference: "ensure vs assure vs insure: ensure は「〜が確実に起きるよう行動する」（make certain）。assure は「人に安心感を与える・保証する」（reassure people）。insure は「保険をかける」（insurance）。", englishDefinition: "To make certain that something happens or is the case.", etymology: "en-（強化）＋ sure（確かな）。ラテン語 securus（安全な）と同語源。" }],
  // equivalent (30331)
  [30331, { coreImage: "「価値・意味・効果が等しい・同等の」のがコアイメージ。「等しい力・価値」という語源から。", usage: "「equivalent to（〜に相当する）」「full-time equivalent（フルタイム換算）」「the equivalent of（〜に相当するもの）」「equivalent salary（同等の給与）」のように使う。", synonymDifference: "equivalent vs equal vs comparable: equivalent は「異なる形で同じ価値・意味を持つ」（may look different but same value）。equal は「全く同じ」（equal pay）。comparable は「比較できるほど似ている」（comparable results）。", englishDefinition: "Equal in value, meaning, or effect; something having equal value.", etymology: "ラテン語 aequivalere（等しい価値を持つ）から。aequi-（等しい・equal と同語源）＋ valere（価値がある・value と同語源）。" }],
  // exempt (30332)
  [30332, { coreImage: "「義務・規則・税金などから免除された・適用外の」のがコアイメージ。「取り外されて自由な」という語源から。", usage: "「tax-exempt（免税の）」「exempt from duty（義務を免除された）」「exempt employees（免除対象の従業員）」「be exempt from regulations（規制から除外される）」のように使う。", synonymDifference: "exempt vs exclude vs waive: exempt は「義務・規則の適用を免除される」（not required to comply）。exclude は「グループ・対象から除外する」（not included）。waive は「権利・要件を意図的に放棄する」（waive a fee）。", englishDefinition: "Free from an obligation or liability; to release from a requirement.", etymology: "ラテン語 exemptus（取り外された）から。ex-（外に）＋ emere（取る・redeem と同語源）。" }],
  // expedite (30333)
  [30333, { coreImage: "「プロセス・手続きを通常より速く処理する・促進する」のがコアイメージ。「足かせを外して速くする」という語源から。", usage: "「expedite the process（プロセスを促進する）」「expedite your order（注文を急ぎ処理する）」「expedite delivery（配送を早める）」「expedited shipping（速達配送）」のように使う。", synonymDifference: "expedite vs accelerate vs speed up: expedite は「手続き・処理を迅速化する」（formal/official process）。accelerate は「速度・進行を速める」（broader: accelerate growth）。speed up は「スピードを上げる」の口語表現（less formal）。", englishDefinition: "To make a process happen more quickly.", etymology: "ラテン語 expedire（足かせを外す）から。ex-（外に）＋ pes（足・pedal と同語源）。「足かせから解放して速くする」のが原義。" }],
  // explicit (30334)
  [30334, { coreImage: "「あいまいさなく明確に・はっきりと述べられた」のがコアイメージ。「折りたたまれたものを広げた」という語源から「明らかにされた」の意に。", usage: "「explicit instructions（明確な指示）」「explicit consent（明示的な同意）」「be explicit about（〜について明確にする）」「explicit content（露骨なコンテンツ）」のように使う。", synonymDifference: "explicit vs implicit vs clear: explicit は「言葉で明確に述べられた」（stated directly）。implicit は「言葉では述べられていないが暗に含まれた」（implied）。clear は「分かりやすい・明確な」（broader）。", englishDefinition: "Clearly and directly stated; not implied.", etymology: "ラテン語 explicatus（折りほぐされた）から。ex-（外に）＋ plicare（折る・implicate と同語源）。" }],
  // extract (30335)
  [30335, { coreImage: "「必要な部分を引き出す・取り出す」のがコアイメージ。物理的な抽出からデータ抽出まで幅広く使われる。", usage: "「extract data（データを抽出する）」「extract information（情報を取り出す）」「tooth extraction（抜歯）」「extract key points（要点を抜き出す）」のように使う。", synonymDifference: "extract vs retrieve vs obtain: extract は「全体から必要な部分を引き出す」（selective removal）。retrieve は「保管されたものを取り出す」（stored data）。obtain は「努力して手に入れる」（formal: obtain permission）。", englishDefinition: "To take something out from a larger whole; a concentrated substance.", etymology: "ラテン語 extrahere（引き出す）から。ex-（外に）＋ trahere（引く・attract と同語源）。" }],
  // feasible (30336)
  [30336, { coreImage: "「実際に実行できる・現実的に可能な」のがコアイメージ。「できる・実現できる」という語源から。feasibility study（実現可能性調査）が頻出。", usage: "「feasible plan（実行可能な計画）」「feasibility study（フィジビリティ・スタディ）」「technically feasible（技術的に実現可能）」「financially feasible（財務的に実現可能）」のように使う。", synonymDifference: "feasible vs possible vs practical: feasible は「実際に実行できる現実的な可能性」（likely to succeed）。possible は「起こりうる・可能性がある」（might happen）。practical は「実用的で実際に使える」（practical solution）。", englishDefinition: "Possible to do easily or conveniently; likely to succeed.", etymology: "ラテン語 facere（する）から。faisable（できる）のフランス語形を経て英語に。" }],
  // fiscal (30337)
  [30337, { coreImage: "「政府・組織の財政・会計に関する」のがコアイメージ。fiscal year（会計年度）が最頻出の表現。", usage: "「fiscal year（会計年度）」「fiscal policy（財政政策）」「fiscal report（財務報告）」「fiscal quarter（四半期）」のように使う。", synonymDifference: "fiscal vs financial vs monetary: fiscal は「政府・組織の予算・税・歳出に関する」（government/organizational finance）。financial は「お金・資産・投資に関する」（broader financial matters）。monetary は「通貨・金融政策に関する」（monetary policy）。", englishDefinition: "Relating to government finances or the management of money.", etymology: "ラテン語 fiscus（財務省の金庫・かご）から。「国家財政を管理する金庫」が原義。" }],
  // flaw (30338)
  [30338, { coreImage: "「製品・計画・人格の欠点・欠陥・傷」のがコアイメージ。完璧を損なう「傷」の感覚。", usage: "「a flaw in the design（設計上の欠陥）」「flawed reasoning（欠点のある論理）」「fatal flaw（致命的な欠点）」「identify flaws（欠陥を見つける）」のように使う。", synonymDifference: "flaw vs defect vs weakness: flaw は「完全性を損なう欠点・傷」（subtle but important）。defect は「機能・品質の欠陥」（product defect/manufacturing）。weakness は「強みの反対・弱点」（personal weakness）。", englishDefinition: "A mark, fault, or weakness that makes something imperfect.", etymology: "古ノルド語 flaga（石の割れ目）から。「表面の傷・亀裂」のが原義。" }],
  // forfeit (30339)
  [30339, { coreImage: "「規則違反・契約不履行により財産・権利・機会を没収される・失う」のがコアイメージ。ペナルティとして失うこと。", usage: "「forfeit a deposit（保証金を没収される）」「forfeit the game（試合を没収負けになる）」「forfeit the right to（〜する権利を失う）」「forfeit clause（没収条項）」のように使う。", synonymDifference: "forfeit vs lose vs waive: forfeit は「違反・ペナルティにより失う」（penalty-based loss）。lose は「失う」一般（lose money）。waive は「自発的に権利を放棄する」（voluntary surrender）。", englishDefinition: "To lose or give up something as a penalty; a penalty or fine.", etymology: "古フランス語 forfaire（違反する）から。fors-（外で）＋ faire（する）。「規則の外で行動して没収される」のが原義。" }],
  // fraction (30340)
  [30340, { coreImage: "「全体のほんの一部分・わずかな量」のがコアイメージ。数学の「分数」も同じ語。「壊れた・割れた部分」という語源から。", usage: "「a fraction of the cost（費用のほんの一部）」「a small fraction（ごくわずか）」「fraction of the time（わずかな時間）」「mathematical fraction（数学の分数）」のように使う。", synonymDifference: "fraction vs portion vs part: fraction は「非常に少ない割合・部分」（implies small amount）。portion は「全体のある程度の割合」（a reasonable portion）。part は「部分」の最も一般的な表現（a part of）。", englishDefinition: "A small part or amount; a numerical division.", etymology: "ラテン語 fractio（分割・割ること）から。frangere（壊す・fragment と同語源）。" }],
  // garment (30341)
  [30341, { coreImage: "「衣服・衣類・着るもの」のがコアイメージ。衣料品業界（garment industry）では頻出の専門語。", usage: "「garment industry（衣料品業界）」「garment factory（縫製工場）」「formal garments（フォーマルウェア）」「garment care（衣類のケア）」のように使う。", synonymDifference: "garment vs clothing vs apparel: garment は「個々の衣服・衣類」（one specific item of clothing）。clothing は「衣類の総称」（clothing store）。apparel は「ビジネス・業界用語での衣料品」（apparel brand）。", englishDefinition: "A piece of clothing.", etymology: "古フランス語 garnement（装備品）から。garnir（装備する・garnish と関連）。" }],
  // grasp (30342)
  [30342, { coreImage: "「物をしっかりつかむ」と「概念・状況を理解する」の二つのコアイメージ。「しっかりつかむ→理解する」の比喩が美しい。", usage: "「grasp the concept（概念を把握する）」「grasp an opportunity（機会をつかむ）」「a firm grasp of（〜をしっかり理解している）」「within grasp（手の届く範囲に）」のように使う。", synonymDifference: "grasp vs understand vs comprehend: grasp は「すっと理解する・つかむ」（sudden clarity）。understand は「理解する」の一般的な表現。comprehend は「複雑なものを完全に理解する」（formal/deep understanding）。", englishDefinition: "To seize and hold firmly; to understand fully.", etymology: "中期英語 graspen（つかむ）から。ゲルマン語系の「つかむ」という動作を表す語。" }],
  // hinder (30343)
  [30343, { coreImage: "「進行・達成・発展を妨げる・邪魔する」のがコアイメージ。「後ろに引き留める」という語源から。", usage: "「hinder progress（進行を妨げる）」「hinder growth（成長を阻害する）」「hindered by（〜によって妨げられた）」「hinder the investigation（調査を妨害する）」のように使う。", synonymDifference: "hinder vs obstruct vs impede: hinder は「前進を遅らせる・妨げる」（slow down progress）。obstruct は「通路・視界を物理的にふさぐ」（block completely）。impede は「特定の活動・機能を妨げる」（formal: impede development）。", englishDefinition: "To delay or prevent the progress of something.", etymology: "古英語 hindrian（後ろに引き留める）から。hinder（後ろの・behind と関連）。" }],
  // impose (30344)
  [30344, { coreImage: "「税・罰則・制限などを強制的に課す・押し付ける」のがコアイメージ。「上に置く＝負担をかける」という語源から。", usage: "「impose a tax（税を課す）」「impose sanctions（制裁を課す）」「impose restrictions（制限を設ける）」「impose a fine（罰金を科す）」のように使う。", synonymDifference: "impose vs enforce vs levy: impose は「義務・負担・制限を強制的に課す」（place a burden on）。enforce は「既存のルール・法律を守らせる」（compliance）。levy は「税・料金を正式に徴収する」（levy a tax）。", englishDefinition: "To require someone to accept something; to place a burden on.", etymology: "ラテン語 imponere（上に置く）から。im-（上に）＋ ponere（置く・position と同語源）。" }],
  // inaugural (30345)
  [30345, { coreImage: "「就任・開業・開幕の最初の・記念すべき始まりの」のがコアイメージ。「予兆を読んで就任を祝福する」という語源から。", usage: "「inaugural speech（就任演説）」「inaugural ceremony（就任式・開業式）」「inaugural flight（就航初便）」「inaugural meeting（第1回総会）」のように使う。", synonymDifference: "inaugural vs opening vs first: inaugural は「就任・開業などの最初の式典・正式な開始」（formal, ceremonial）。opening は「開幕・開店・開会の」（opening ceremony）。first は「最初の」（first meeting）。", englishDefinition: "Marking the beginning of something; relating to a formal start.", etymology: "ラテン語 inaugurare（前兆を占う）から。augur（占い師）と同語源。「就任の前兆を占う儀式」から。" }],
  // incidental (30346)
  [30346, { coreImage: "「主要な活動に付随して生じる・偶発的な」のがコアイメージ。「主目的には入っていないが必然的に生じる」というニュアンス。", usage: "「incidental expenses（付随費用・雑費）」「incidental to（〜に付随する）」「incidental costs（偶発費用）」「incidental music（劇伴音楽）」のように使う。", synonymDifference: "incidental vs accidental vs minor: incidental は「主要なものに付随して生じる」（secondary but expected）。accidental は「全く意図せず偶然起きる」（unintended）。minor は「重要性・規模が小さい」（minor issue）。", englishDefinition: "Happening as a minor result of something else; not important.", etymology: "ラテン語 incidens（起きること）から。in-（上に）＋ cadere（落ちる・accident と同語源）。" }],
  // incorporate (30347)
  [30347, { coreImage: "「要素・フィードバックを既存のものに組み入れる」のがコアイメージ。また「会社を法人化する」という法的意味でも頻出。", usage: "「incorporate feedback（フィードバックを組み込む）」「incorporate into the design（デザインに取り入れる）」「incorporated company（法人）」「Inc.（Incorporated の略）」のように使う。", synonymDifference: "incorporate vs integrate vs include: incorporate は「新しい要素を既存の構造に組み込む」（embed into existing）。integrate は「別々の要素を統合して一体化する」（combine into one）。include は「範囲・リストに含める」（broader）。", englishDefinition: "To include or combine; to form a corporation.", etymology: "ラテン語 incorporare（体に組み込む）から。in-（中に）＋ corpus（体・corporation と同語源）。" }],
  // induce (30348)
  [30348, { coreImage: "「行動・状態・反応を引き起こす・誘発する」のがコアイメージ。「引き込む・導く」という語源から。", usage: "「induce a sale（購入を促す）」「induce sleep（眠気を誘う）」「price reduction to induce demand（需要を誘発するための値下げ）」「labor induction（分娩誘発）」のように使う。", synonymDifference: "induce vs cause vs prompt: induce は「特定の行動・反応を引き起こす・説得して促す」（persuasive or causal）。cause は「原因となって生じさせる」（direct causation）。prompt は「即座に行動させる・促す」（trigger quick action）。", englishDefinition: "To cause or bring about; to persuade someone to do something.", etymology: "ラテン語 inducere（中に導く）から。in-（中に）＋ ducere（導く・conduct と同語源）。" }],
  // inherent (30349)
  [30349, { coreImage: "「もともとその性質・存在に固有に備わっている・本来の」のがコアイメージ。後から付け加えられたのではなく「元々持っている」性質。", usage: "「inherent risk（固有のリスク）」「inherent in the process（プロセスに本来備わった）」「inherent challenges（固有の課題）」「inherent value（本来の価値）」のように使う。", synonymDifference: "inherent vs intrinsic vs innate: inherent は「特定のものに本来備わっている」（naturally part of something）。intrinsic は「物事の本質的・内在的な価値」（intrinsic value）。innate は「生まれつき持っている」（innate ability）。", englishDefinition: "Existing as a natural part of something; not learned.", etymology: "ラテン語 inhaerere（くっついている）から。in-（中に）＋ haerere（固着する・hesitate と関連）。" }],
  // innovate (30350)
  [30350, { coreImage: "「既存のものに新しいアイデア・方法を取り入れて革新する・刷新する」のがコアイメージ。innovation（革新）の動詞形。", usage: "「innovate constantly（常に革新し続ける）」「innovate in technology（技術で革新する）」「innovate to stay competitive（競争力を保つために革新する）」「drive innovation（イノベーションを推進する）」のように使う。", synonymDifference: "innovate vs invent vs create: innovate は「既存のものを革新・改善する」（improve existing）。invent は「世界初の新しいものを発明する」（create something new）。create は「作り出す」の一般的な表現（create a product）。", englishDefinition: "To introduce new ideas or methods.", etymology: "ラテン語 innovare（刷新する）から。in-（中に）＋ novare（新しくする・novel と同語源）。" }],
  // installment (30351)
  [30351, { coreImage: "「合計金額を分割した1回分の支払い」のがコアイメージ。分割払い（installment plan）でよく使われる。", usage: "「pay in installments（分割払いで支払う）」「monthly installment（月賦・月々の支払い）」「installment plan（分割払いプラン）」「final installment（最終回の支払い）」のように使う。", synonymDifference: "installment vs payment vs down payment: installment は「分割された1回分の支払い」（one of several payments）。payment は「支払い」全般（single or total）。down payment は「頭金・頭払い」（initial payment upfront）。", englishDefinition: "A regular payment of part of a total amount owed.", etymology: "install（設置する）＋ -ment。「設置・確立の一段階」のが原義。割賦販売で「一度に払わず段階的に払う」から。" }],
  // intact (30352)
  [30352, { coreImage: "「損傷・変更・破損なしにそのままの状態を保っている・無傷の」のがコアイメージ。「触れられていない」という語源から。", usage: "「remain intact（そのままの状態を保つ）」「arrive intact（無傷で届く）」「keep the structure intact（構造を維持する）」「the original intact（元のまま保存された）」のように使う。", synonymDifference: "intact vs undamaged vs preserved: intact は「手をつけられず完全な状態」（not touched or damaged）。undamaged は「傷や損傷のない」（physical condition）。preserved は「意図的に保存・維持された」（deliberate preservation）。", englishDefinition: "Not damaged or changed; complete and whole.", etymology: "ラテン語 intactus（触れられていない）から。in-（非）＋ tangere（触れる・tangent と同語源）。" }],
  // intermediary (30353)
  [30353, { coreImage: "「二者の間を取り持つ仲介者・媒介役」のがコアイメージ。間に入って双方の利益調整をする役割。", usage: "「act as an intermediary（仲介役を務める）」「financial intermediary（金融仲介機関）」「third-party intermediary（第三者仲介者）」「without intermediaries（仲介者なしで）」のように使う。", synonymDifference: "intermediary vs mediator vs broker: intermediary は「二者の間に立つ仲介役」（general, neutral）。mediator は「紛争解決のための調停者」（conflict resolution）。broker は「売買・交渉を取り次ぐ専門業者」（real estate broker, stock broker）。", englishDefinition: "A person or organization that helps negotiate between parties.", etymology: "ラテン語 intermediarius（中間の）から。inter-（間に）＋ medius（中間の・medium と同語源）。" }],
  // jeopardize (30354)
  [30354, { coreImage: "「大切なものを危険にさらす・損なう恐れがある」のがコアイメージ。「二分された試合」という語源から「不確かな危険」の意に。", usage: "「jeopardize the deal（取引を危険にさらす）」「jeopardize safety（安全を脅かす）」「jeopardize the relationship（関係を損なう）」「jeopardize one's career（キャリアを危険にさらす）」のように使う。", synonymDifference: "jeopardize vs endanger vs risk: jeopardize は「大切なものを危険にさらす」（put at risk）。endanger は「生命・存続を危機にさらす」（threaten survival）。risk は「危険を冒す・リスクを取る」（risk taking）。", englishDefinition: "To put something valuable in danger.", etymology: "古フランス語 jeu parti（二分された試合）から。jeu（試合）＋ parti（分割された）。結果が五分五分の「危うい状態」が原義。" }],
  // knowledgeable (30355)
  [30355, { coreImage: "「特定分野について深い知識・情報を持っている・精通した」のがコアイメージ。expert ほどの専門家でなくても幅広く知識を持つ状態。", usage: "「knowledgeable staff（博識なスタッフ）」「highly knowledgeable（非常に博識な）」「knowledgeable about regulations（規制に精通した）」「seek a knowledgeable advisor（博識な顧問を求める）」のように使う。", synonymDifference: "knowledgeable vs expert vs well-informed: knowledgeable は「幅広く多くのことを知っている」（broad knowledge）。expert は「特定分野の専門家」（specialist/deep expertise）。well-informed は「最新情報・事情を把握している」（up-to-date）。", englishDefinition: "Having or showing a lot of knowledge or information.", etymology: "knowledge（知識）＋ -able（できる形容詞化）。古英語 cnawan（知る・know と同語源）から。" }],
  // lucrative (30356)
  [30356, { coreImage: "「多くの利益・お金をもたらす・収益性が高い」のがコアイメージ。「利益を生む」という語源から。", usage: "「lucrative business（収益性の高いビジネス）」「lucrative contract（儲かる契約）」「lucrative market（利益を生む市場）」「prove lucrative（儲かることが証明される）」のように使う。", synonymDifference: "lucrative vs profitable vs rewarding: lucrative は「大きな金銭的利益をもたらす」（emphasis on high profit）。profitable は「利益が出る」（positive profit margin）。rewarding は「金銭以外に精神的・感情的に満足できる」（fulfilling）。", englishDefinition: "Producing a lot of money; highly profitable.", etymology: "ラテン語 lucrativus（利益になる）から。lucrum（利益・利得）が語源。" }],
  // meticulous (30357)
  [30357, { coreImage: "「細部にまで細心の注意を払う・綿密な」のがコアイメージ。「小さなことを恐れる」という語源から「細かいことに気を使う」の意に転じた。", usage: "「meticulous attention（細心の注意）」「meticulous planning（綿密な計画）」「meticulous record-keeping（丁寧な記録管理）」「be meticulous about（〜に細心の注意を払う）」のように使う。", synonymDifference: "meticulous vs thorough vs precise: meticulous は「細部への細心の注意・完璧主義的」（almost excessive attention to detail）。thorough は「抜けなく完全に行う」（thorough investigation）。precise は「正確さ・精度に注力する」（precise measurement）。", englishDefinition: "Showing great attention to detail; very careful and precise.", etymology: "ラテン語 meticulosus（恐れる・臆病な）から。metus（恐れ）が語源。「細かいことを怖れるほど注意深い」から転じた。" }],
  // nominal (30359)
  [30359, { coreImage: "「名目上の・実質的な意味をあまり持たない」のがコアイメージ。また「ごくわずかな・名ばかりの」費用・金額にも使われる。", usage: "「nominal fee（名目上のわずかな料金）」「nominal value（名目価値）」「nominal leader（名ばかりのリーダー）」「at a nominal cost（ほぼ無料で）」のように使う。", synonymDifference: "nominal vs token vs symbolic: nominal は「名目上の・実質を持たないごくわずかな」（name only/minimal）。token は「形だけの・象徴的な」（token gesture）。symbolic は「象徴的な意味を持つ」（symbolic act）。", englishDefinition: "In name only; very small in comparison to real value.", etymology: "ラテン語 nominalis（名前に関する）から。nomen（名前・name と同語源）。" }],
  // offset (30360)
  [30360, { coreImage: "「一方の影響・損失・費用を別のプラス要素で相殺・埋め合わせる」のがコアイメージ。「ずらして置く→バランスを取る」の感覚。", usage: "「offset losses（損失を相殺する）」「carbon offset（カーボンオフセット）」「offset costs（費用を埋め合わせる）」「offset the impact（影響を相殺する）」のように使う。", synonymDifference: "offset vs compensate vs balance: offset は「マイナスをプラスで打ち消す・相殺する」（neutralize negative）。compensate は「損失・不足を補償する」（make up for a loss）。balance は「バランスを取る・均衡させる」（balance the budget）。", englishDefinition: "To counteract or compensate for something.", etymology: "off-（離れて・ずれて）＋ set（置く）。「位置をずらして釣り合わせる」のが原義。" }],

  // ── TOEIC 700 ───────────────────────────────────────────────────────────────

  // acquisition (30361)
  [30361, { coreImage: "「企業・資産・スキルを手に入れる・買収する」のがコアイメージ。M&A の「A」。「獲得する」という語源から。", usage: "「merger and acquisition（M&A）」「hostile acquisition（敵対的買収）」「talent acquisition（人材獲得）」「data acquisition（データ収集）」のように使う。", synonymDifference: "acquisition vs purchase vs merger: acquisition は「企業・大規模資産の正式な取得・買収」（formal/corporate）。purchase は「物を買う」一般的な表現。merger は「二社が合体する合併」（acquisition は一方が他方を取得）。", englishDefinition: "The act of obtaining something; a company or asset obtained.", etymology: "ラテン語 acquisitio（取得）から。ad-（向かって）＋ quaerere（求める・query と同語源）。" }],
  // diligent (30365)
  [30365, { coreImage: "「目標に向かって一生懸命・丁寧に取り組む・勤勉な」のがコアイメージ。「価値を見いだして努力する」という語源から。", usage: "「diligent worker（勤勉な働き手）」「diligent research（丹念な調査）」「diligently checked（丁寧に確認された）」「diligent in one's duties（職務に勤勉な）」のように使う。", synonymDifference: "diligent vs hardworking vs industrious: diligent は「注意深く丁寧に継続的に努力する」（careful + persistent）。hardworking は「懸命に働く」（effort/energy focused）。industrious は「活動的で勤勉な」（active/energetic）。", englishDefinition: "Showing careful and persistent effort.", etymology: "ラテン語 diligens（注意深い）から。diligere（価値を見いだす）。dis-（分けて）＋ legere（選ぶ）。" }],
  // discretion (30366)
  [30366, { coreImage: "「状況を判断して自分で決める裁量・判断力」のがコアイメージ。「分別・思慮深さ」という意味でも頻出。", usage: "「at your discretion（あなたの裁量で）」「use discretion（裁量を使う）」「discretionary spending（裁量支出）」「exercise discretion（慎重に判断する）」のように使う。", synonymDifference: "discretion vs judgment vs tact: discretion は「プライバシー・秘密を守る分別」または「自由な裁量」（authority to decide）。judgment は「善悪・優劣を判断する能力」（good judgment）。tact は「人の感情を傷つけない気遣い・機転」（social sensitivity）。", englishDefinition: "Freedom to decide; care in avoiding disclosure.", etymology: "ラテン語 discretio（分離・区別）から。discernere（分ける・discreet と同語源）。" }],
  // modification (30372)
  [30372, { coreImage: "「既存のものを少し変更・修正する」のがコアイメージ。大幅な変更ではなく「調整・改変」という感覚。", usage: "「make modifications（変更を加える）」「product modification（製品の改良）」「design modification（設計変更）」「minor modifications（軽微な変更）」のように使う。", synonymDifference: "modification vs revision vs amendment: modification は「既存のものに変更を加える」（changes to design/product）。revision は「内容を見直して改訂する」（revision of text/plan）。amendment は「法律・文書への正式な修正」（constitutional amendment）。", englishDefinition: "A small change or adjustment to something.", etymology: "ラテン語 modificatio（節度をつけること）から。modus（度・mode と同語源）＋ facere（する）。" }],
  // negligible (30373)
  [30373, { coreImage: "「影響・量・差が非常に小さくて無視できるほどの」のがコアイメージ。「見捨てられるほど小さい」という語源から。", usage: "「negligible impact（無視できるほどの影響）」「negligible cost（ごくわずかなコスト）」「negligible risk（取るに足りないリスク）」「negligible difference（ほぼ差がない）」のように使う。", synonymDifference: "negligible vs insignificant vs minimal: negligible は「無視してよいほど小さい・取るに足りない」（too small to matter）。insignificant は「重要性がない・些細な」（not significant）。minimal は「最小限の」（minimal effort）。", englishDefinition: "So small as to be not worth considering.", etymology: "ラテン語 neglegere（無視する）から。neg-（非）＋ legere（選ぶ・neglect と同語源）。" }],
  // personnel (30374)
  [30374, { coreImage: "「組織の人事部門・職員全体」のがコアイメージ。ビジネスでは「人材・社員」を指す重要語。personal（個人的な）と混同しやすいので注意。", usage: "「personnel department（人事部）」「personnel management（人事管理）」「qualified personnel（有資格者）」「hire additional personnel（追加人員を採用する）」のように使う。", synonymDifference: "personnel vs staff vs employees: personnel は「組織の人事・職員全体」（formal/HR term）。staff は「スタッフ・職員」（operational team）。employees は「雇用されている従業員」（legal/contractual term）。", englishDefinition: "The people employed in an organization; a human resources department.", etymology: "フランス語 personnel（個人的な→人員）から。ラテン語 personalis（個人の）が語源。" }],
  // prerequisite (30375)
  [30375, { coreImage: "「ある行動・状態を始める前に満たされていなければならない前提条件」のがコアイメージ。「前もって必要とされるもの」。", usage: "「a prerequisite for（〜の前提条件）」「prerequisite skills（前提スキル）」「meet the prerequisites（前提条件を満たす）」「English is a prerequisite（英語力が必要条件だ）」のように使う。", synonymDifference: "prerequisite vs requirement vs condition: prerequisite は「行動・状態に先立って必要な前提条件」（must be met before starting）。requirement は「必要とされる条件・要件」（what is needed）。condition は「何かが成立するための条件」（condition for approval）。", englishDefinition: "Something required as a prior condition for something else.", etymology: "pre-（前に）＋ requisite（必要なもの）。ラテン語 requirere（要求する）から。" }],
  // proficiency (30376)
  [30376, { coreImage: "「特定の分野・スキルで高い水準の能力・熟練度を持つ」のがコアイメージ。「前に進んで成果を出す」という語源から。", usage: "「language proficiency（語学力）」「English proficiency test（英語能力試験）」「high proficiency（高い熟練度）」「demonstrate proficiency（能力を示す）」のように使う。", synonymDifference: "proficiency vs skill vs competence: proficiency は「特定分野で高い水準に達した熟練度」（measured level of skill）。skill は「スキル・技能」（general ability）。competence は「十分な能力・資質」（adequate ability to perform）。", englishDefinition: "A high degree of skill or competence.", etymology: "ラテン語 proficere（前に進む）から。pro-（前に）＋ facere（する・profit と同語源）。" }],
  // unanimous (30380)
  [30380, { coreImage: "「全員の意見・投票が一致している・満場一致の」のがコアイメージ。「全員が同じ心を持つ」という語源から。", usage: "「unanimous decision（全会一致の決定）」「unanimous vote（満場一致の投票）」「unanimous agreement（全員の合意）」「reach a unanimous verdict（全員一致の評決に達する）」のように使う。", synonymDifference: "unanimous vs consensus vs united: unanimous は「全員が賛成・反対の全会一致」（complete agreement）。consensus は「おおむねの合意・過半数の意見の一致」（general agreement）。united は「共通の目的に向けて団結した」（working together）。", englishDefinition: "With full agreement from everyone involved.", etymology: "ラテン語 unanimus（同じ心を持つ）から。unus（一つ）＋ animus（心・animate と同語源）。" }],
  // abide (30381)
  [30381, { coreImage: "「規則・決定に従う・守る」と「〜を耐え忍ぶ」の二つのコアイメージ。「そこに留まる・従い続ける」という語源から。", usage: "「abide by the rules（規則に従う）」「abide by the decision（決定に従う）」「can't abide（〜に耐えられない）」「abide by the law（法律を守る）」のように使う。", synonymDifference: "abide vs comply vs obey: abide by は「規則・決定に従い続ける」（ongoing compliance）。comply は「要求・規則に従って行動する」（meet requirements）。obey は「命令・権威に従う」（follow orders）。", englishDefinition: "To accept and act in accordance with a rule; to tolerate.", etymology: "古英語 abidan（待つ・留まる）から。a-（そこに）＋ bidan（待つ）。「留まり続ける→従い続ける」のが原義。" }],
  // abolish (30382)
  [30382, { coreImage: "「法律・制度・慣行を完全に廃止する・撤廃する」のがコアイメージ。「消し去る・取り除く」という語源から。", usage: "「abolish the policy（方針を廃止する）」「abolish slavery（奴隷制を廃止する）」「abolish the fee（手数料を廃止する）」「abolish old regulations（古い規制を撤廃する）」のように使う。", synonymDifference: "abolish vs eliminate vs repeal: abolish は「制度・慣行を公式に完全廃止する」（usually institutional）。eliminate は「存在を取り除く・排除する」（eliminate waste）。repeal は「法律・法令を正式に廃止する」（legal term: repeal a law）。", englishDefinition: "To formally end a practice, law, or institution.", etymology: "ラテン語 abolere（消す・破壊する）から。ab-（離れて）＋ olere（育つ）の逆。" }],
  // accreditation (30383)
  [30383, { coreImage: "「公的機関が基準を満たすことを正式に認定・認可する」のがコアイメージ。大学・病院・企業が取得する公式認定。", usage: "「receive accreditation（認定を受ける）」「ISO accreditation（ISO認定）」「accreditation body（認定機関）」「lose accreditation（認定を失う）」のように使う。", synonymDifference: "accreditation vs certification vs approval: accreditation は「機関・プログラムが基準を満たすことの公式認定」（institutional level）。certification は「個人・製品が基準を満たすことの証明」（individual/product level）。approval は「承認・許可」（general approval）。", englishDefinition: "Official recognition that an organization meets required standards.", etymology: "accredit（資格を認める）＋ -ation。ラテン語 credere（信じる）から。" }],
  // adhere (30384)
  [30384, { coreImage: "「規則・信念・計画に固く従い続ける」と「表面にくっつく・付着する」の二つのコアイメージ。「くっつく」という語源から「離れない→従い続ける」の比喩。", usage: "「adhere to guidelines（ガイドラインを守る）」「adhere to a schedule（スケジュールを守る）」「adhere to the policy（方針に従う）」「adhesive（接着剤）」のように使う。", synonymDifference: "adhere vs comply vs stick: adhere to は「原則・方針・約束に忠実に従い続ける」（principled adherence）。comply は「要求・規則に従って行動する」（meeting requirements）。stick to は「計画・決定から離れない」（口語的）。", englishDefinition: "To stick to a surface; to follow or support a rule or belief.", etymology: "ラテン語 adhaerere（くっつく）から。ad-（向かって）＋ haerere（固着する・hesitate と関連）。" }],
  // adversely (30385)
  [30385, { coreImage: "「不利に・有害な方向に・悪影響を与える形で」のがコアイメージ。adverse（不利な）の副詞形。", usage: "「adversely affect（悪影響を与える）」「adversely impacted（悪影響を受けた）」「adversely influence（悪い影響を及ぼす）」のように使う。", synonymDifference: "adversely vs negatively vs unfavorably: adversely は「有害・不利な影響を及ぼす形で」（formal, stronger）。negatively は「否定的に・消極的に」（broader）。unfavorably は「好ましくない形で」（unfavorably reviewed）。", englishDefinition: "In a way that is harmful or unfavorable.", etymology: "adverse（不利な）＋ -ly（副詞化）。ラテン語 adversus（向かい合った）から。" }],
  // affiliate (30386)
  [30386, { coreImage: "「会社・組織が別の会社と提携・関連している」のがコアイメージ。「子として採用する」という語源から「仲間に入れる・提携する」の意に。", usage: "「affiliated company（関連会社）」「affiliated with（〜と提携した）」「network of affiliates（提携ネットワーク）」「affiliate marketing（アフィリエイトマーケティング）」のように使う。", synonymDifference: "affiliate vs subsidiary vs partner: affiliate は「緩やかな提携関係にある関連組織」（loose association）。subsidiary は「親会社が過半数を持つ子会社」（tight control）。partner は「対等な協力関係のパートナー」（equal partnership）。", englishDefinition: "An organization formally connected to another; to connect officially.", etymology: "ラテン語 affiliare（息子として採用する）から。ad-（向かって）＋ filius（息子）。" }],
  // alleviate (30387)
  [30387, { coreImage: "「苦しみ・問題・負担を軽くする・和らげる」のがコアイメージ。「軽くする・持ち上げる」という語源から。eliminate（排除する）より穏やかに「楽にする」。", usage: "「alleviate pain（痛みを和らげる）」「alleviate the workload（業務負担を軽減する）」「alleviate concerns（懸念を和らげる）」「measures to alleviate（〜を緩和する措置）」のように使う。", synonymDifference: "alleviate vs mitigate vs relieve: alleviate は「苦しみ・問題をある程度軽くする」（make less severe）。mitigate は「リスク・影響を軽減する」（reduce negative impact）。relieve は「苦しみ・緊張を取り除く」（remove the burden）。", englishDefinition: "To make suffering or problems less severe.", etymology: "ラテン語 alleviare（軽くする）から。al-（向かって）＋ levis（軽い・levitate と同語源）。" }],
  // amend (30388)
  [30388, { coreImage: "「法律・文書・規則の欠点を修正・改善する」のがコアイメージ。「欠点を取り除く」という語源から。amendment（修正条項）も同語源。", usage: "「amend the contract（契約を修正する）」「amend the law（法律を改正する）」「amend a proposal（提案を修正する）」「constitutional amendment（憲法修正）」のように使う。", synonymDifference: "amend vs revise vs modify: amend は「法律・文書の欠点を修正する」（often formal/legal）。revise は「内容を見直して改訂する」（revise a manuscript）。modify は「設計・仕様を変更する」（modify the design）。", englishDefinition: "To make changes to correct or improve something.", etymology: "ラテン語 emendare（欠点を取り除く）から。e-（外に）＋ mendum（欠点・blame と関連）。" }],
  // appraisal (30389)
  [30389, { coreImage: "「価値・業績・品質を評価・査定する」のがコアイメージ。「価格をつける」という語源から「評価全般」に発展。", usage: "「performance appraisal（業績評価）」「annual appraisal（年次評価）」「property appraisal（不動産査定）」「appraisal process（評価プロセス）」のように使う。", synonymDifference: "appraisal vs evaluation vs assessment: appraisal は「個人の業績・不動産の価値を公式に評価」（formal valuation）。evaluation は「有効性・品質を評価・判断する」（assess effectiveness）。assessment は「状況・リスクを調べて評価する」（broader assessment）。", englishDefinition: "A formal assessment of value, quality, or performance.", etymology: "appraise（価値を査定する）＋ -al。古フランス語 aprisier（価格をつける）から。" }],
  // arbitration (30390)
  [30390, { coreImage: "「中立的な第三者が両者の紛争を解決する仲裁・調停プロセス」のがコアイメージ。裁判の代わりに使われることが多い。", usage: "「submit to arbitration（仲裁に委ねる）」「arbitration clause（仲裁条項）」「binding arbitration（拘束力のある仲裁）」「dispute resolution through arbitration（仲裁による紛争解決）」のように使う。", synonymDifference: "arbitration vs mediation vs litigation: arbitration は「第三者が判断を下す法的拘束力のある仲裁」（binding decision）。mediation は「調停者が両者の合意を促す調停」（facilitated negotiation）。litigation は「裁判所での訴訟」（court proceedings）。", englishDefinition: "The use of an independent person to settle a dispute outside court.", etymology: "ラテン語 arbitratio（裁定）から。arbiter（審判者）＋ -ation。" }],

  // breach (30393)
  [30393, { coreImage: "「契約・規則・信頼関係を破る・違反する」のがコアイメージ。「壁を突き破る」という物理的語源から「信頼・約束を破る」比喩へ。", usage: "「breach of contract（契約違反）」「security breach（セキュリティ侵害）」「breach of trust（信頼の裏切り）」「a breach of protocol（プロトコル違反）」のように使う。", synonymDifference: "breach vs violation vs infringement: breach は「契約・信頼の重大な違反」（serious breaking of agreement）。violation は「規則・権利の侵害」（violate a rule）。infringement は「著作権・特許の侵害」（IP focused）。", englishDefinition: "A failure to follow a law or agreement; a gap made by breaking through.", etymology: "古英語 bryce（壊れた状態）から。break と同語源。「壁の突破口・破れ目」のが原義。" }],
  // bureaucracy (30394)
  [30394, { coreImage: "「官僚制度・複雑な行政手続き」のがコアイメージ。bureaucratic（30297）の名詞形。ネガティブなニュアンスで使われることが多い。", usage: "「excessive bureaucracy（過度な官僚主義）」「cut through bureaucracy（お役所的な手続きを簡略化する）」「government bureaucracy（政府の官僚機構）」「trapped in bureaucracy（手続きに縛られる）」のように使う。", synonymDifference: "bureaucracy vs red tape vs administration: bureaucracy は「官僚制度そのもの」（the system）。red tape は「煩わしい官僚的手続き」（the hassle）。administration は「管理・運営」（neutral）。", englishDefinition: "A system of government or management with complex rules and procedures.", etymology: "フランス語 bureau（事務机）＋ ギリシャ語 kratos（支配）。「机が支配する→官僚制」。" }],
  // collateral (30395)
  [30395, { coreImage: "「融資を受けるために提供する担保・抵当」のがコアイメージ。また「付随的な・間接的な」という形容詞としても使われる。", usage: "「require collateral（担保を要求する）」「collateral damage（副次的被害）」「post collateral（担保を差し入れる）」「collateral asset（担保資産）」のように使う。", synonymDifference: "collateral vs security vs guarantee: collateral は「借入の担保として差し入れる資産」（specific asset pledged）。security は「担保・保証」の広義（security deposit）。guarantee は「第三者が支払いを保証する」（personal guarantee）。", englishDefinition: "Property pledged as security for a loan; incidental or secondary.", etymology: "ラテン語 collateralis（並列の）から。col-（共に）＋ latus（側・lateral と同語源）。" }],
  // commence (30396)
  [30396, { coreImage: "「公式なプロセス・作業を正式に開始する」のがコアイメージ。begin/start より格式ばった表現。", usage: "「commence construction（工事を開始する）」「commence operations（業務を開始する）」「upon commencement（開始とともに）」「commence proceedings（手続きを開始する）」のように使う。", synonymDifference: "commence vs begin vs start: commence は「公式・正式に開始する」（formal: legal/business）。begin は「始める」の標準的表現（more neutral）。start は「動き出す」（practical/informal）。", englishDefinition: "To begin or start, especially in a formal way.", etymology: "ラテン語 cominitiare（共に始める）から。com-（共に）＋ initiare（始める・initiate と同語源）。" }],
  // commodity (30397)
  [30397, { coreImage: "「市場で取引される原材料・農産物などの基礎商品」のがコアイメージ。価格が市場で決まる「同質化された商品」。", usage: "「commodity market（商品市場）」「commodity prices（一次産品の価格）」「agricultural commodity（農産物）」「commodity trading（商品取引）」のように使う。", synonymDifference: "commodity vs product vs goods: commodity は「市場で取引される標準化された一次産品」（oil, wheat, metals）。product は「製造・加工された製品」（differentiated）。goods は「商品・物品」の総称（broader）。", englishDefinition: "A basic good or raw material traded in large quantities.", etymology: "ラテン語 commoditas（利便・好都合）から。commodus（便利な・commode と関連）。" }],
  // comparable (30398)
  [30398, { coreImage: "「比較できるほど似ている・同等の」のがコアイメージ。「〜と比べることができる」という語源から。", usage: "「comparable price（同等の価格）」「comparable performance（同等の性能）」「comparable to industry standards（業界標準に匹敵する）」「comparable experience（同等の経験）」のように使う。", synonymDifference: "comparable vs equivalent vs similar: comparable は「比較できるほど似た・同水準の」（worth comparing）。equivalent は「等価・同等の」（equal value/function）。similar は「似た・類似の」（general similarity）。", englishDefinition: "Similar enough to be compared; of the same standard.", etymology: "compare（比較する）＋ -able（できる）。ラテン語 comparare（同等にする）から。" }],
  // compliance (30399)
  [30399, { coreImage: "「法律・規則・要求に従って行動すること・遵守」のがコアイメージ。comply（遵守する）の名詞形。企業活動で最重要語の一つ。", usage: "「regulatory compliance（法令遵守）」「compliance officer（コンプライアンス担当者）」「in compliance with（〜を遵守して）」「non-compliance（違反・不遵守）」のように使う。", synonymDifference: "compliance vs conformity vs adherence: compliance は「法律・規則への遵守」（law/regulation focus）。conformity は「社会規範・基準への適合」（social norms）。adherence は「方針・原則・約束への固い遵守」（principles/guidelines）。", englishDefinition: "The act of following a rule, standard, or law.", etymology: "comply（従う）＋ -ance。ラテン語 complere（満たす）から。" }],
  // concession (30400)
  [30400, { coreImage: "「交渉・紛争で自分の立場から譲歩する」のがコアイメージ。また「土地・権利の利権」や「施設内の売店」という意味でも使われる。", usage: "「make concessions（譲歩する）」「mutual concessions（相互の譲歩）」「trade concession（貿易上の利権）」「concession stand（売店・キオスク）」のように使う。", synonymDifference: "concession vs compromise vs trade-off: concession は「一方が自分の立場を譲る」（one party gives up）。compromise は「両者が歩み寄って妥協点を見つける」（both sides give）。trade-off は「何かを得るために何かを犠牲にする」（exchange）。", englishDefinition: "A grant of rights or privilege; a point given up in negotiation.", etymology: "ラテン語 concessio（許可・譲歩）から。con-（共に）＋ cedere（譲る・accede と同語源）。" }],
  // contingency (30401)
  [30401, { coreImage: "「予測不能・偶発的に起きる可能性がある事態」のがコアイメージ。contingent（30310）の名詞形。リスク管理で頻出。", usage: "「contingency plan（緊急時対応計画）」「contingency fund（不測事態のための積立金）」「plan for contingencies（不測事態に備える）」「unforeseen contingency（予期しない緊急事態）」のように使う。", synonymDifference: "contingency vs emergency vs risk: contingency は「起きるかもしれない不測の事態」（possible future event）。emergency は「実際に起きた緊急事態」（actual crisis）。risk は「損失・危険の可能性」（probability of harm）。", englishDefinition: "A possible future event that might require action; a plan for such an event.", etymology: "ラテン語 contingere（触れる・起きる）から。con-（共に）＋ tangere（触れる）。" }],
  // convene (30402)
  [30402, { coreImage: "「会議・委員会を招集する・開催する」のがコアイメージ。「共に集まる」という語源から。convention（大会）と同語源。", usage: "「convene a meeting（会議を招集する）」「convene a committee（委員会を召集する）」「convene urgently（緊急に召集する）」「the board convened（取締役会が招集された）」のように使う。", synonymDifference: "convene vs convoke vs assemble: convene は「公式な目的のために会議・委員会を招集する」（formal/official）。convoke は「より正式・命令的な召集」（less common）。assemble は「人・部品を集める・組み立てる」（broader）。", englishDefinition: "To bring together for a meeting; to arrange a formal gathering.", etymology: "ラテン語 convenire（共に来る）から。con-（共に）＋ venire（来る・venue と同語源）。" }],
  // deem (30404)
  [30404, { coreImage: "「公式・法的に〜とみなす・考える・判断する」のがコアイメージ。judgment を伴う「判定」の感覚。", usage: "「deemed necessary（必要とみなされた）」「deem it appropriate（適切と判断する）」「deemed a success（成功とみなされた）」「as deemed fit（適切と判断した場合に）」のように使う。", synonymDifference: "deem vs consider vs regard: deem は「公式・法的・権威的な判断として〜とみなす」（formal judgment）。consider は「〜だと思う・考える」（general consideration）。regard は「〜とみなす・扱う」（view as）。", englishDefinition: "To consider or judge in a particular way; to officially regard.", etymology: "古英語 deman（判断する）から。doom（運命・判決）と同語源。" }],
  // depreciation (30405)
  [30405, { coreImage: "「資産・設備の価値が時間とともに減少する・減価償却」のがコアイメージ。財務・会計の重要用語。", usage: "「depreciation of assets（資産の減価償却）」「annual depreciation（年間償却費）」「accumulated depreciation（減価償却累計額）」「currency depreciation（通貨の価値低下）」のように使う。", synonymDifference: "depreciation vs amortization vs devaluation: depreciation は「有形資産（設備・建物）の価値低下・減価償却」。amortization は「無形資産（特許・のれん）の償却」（intangible assets）。devaluation は「通貨の公式な切り下げ」（currency policy）。", englishDefinition: "A reduction in the value of an asset over time.", etymology: "depreciate（価値が下がる）＋ -ion。de-（下に）＋ pretium（価格・price と同語源）。" }],
  // deteriorate (30406)
  [30406, { coreImage: "「品質・状況・関係が徐々に悪化する・劣化する」のがコアイメージ。「より悪くなる」という語源から。", usage: "「conditions deteriorate（状況が悪化する）」「health deteriorated（健康が悪化した）」「deteriorating relationship（悪化する関係）」「allow to deteriorate（悪化させる）」のように使う。", synonymDifference: "deteriorate vs worsen vs degrade: deteriorate は「質・状態が徐々に悪化する」（gradual decline）。worsen は「悪くなる」の一般表現（worsen the situation）。degrade は「品質・地位が下がる・侮辱する」（also: environmental degradation）。", englishDefinition: "To become progressively worse in quality or condition.", etymology: "ラテン語 deteriorare（より悪くする）から。deterior（より悪い）が語源。" }],
  // disburse (30408)
  [30408, { coreImage: "「公式な手続きで資金・給付を支払う・支出する」のがコアイメージ。「財布から出す」という語源から。disbursement（支払い額）も頻出。", usage: "「disburse funds（資金を支払う）」「disburse grants（助成金を支出する）」「disburse salaries（給与を支払う）」「upon disbursement（支払い時に）」のように使う。", synonymDifference: "disburse vs pay vs distribute: disburse は「資金・給付を公式プロセスで支払う」（formal financial payment）。pay は「支払う」の一般表現。distribute は「複数に分配する」（distribute funds to multiple）。", englishDefinition: "To pay out money from a fund.", etymology: "de-（外に）＋ bursare（財布に入れる）。ラテン語 bursa（財布）から。" }],
  // diversify (30409)
  [30409, { coreImage: "「事業・投資・製品ラインを多様化・多角化する」のがコアイメージ。「一つに集中するリスクを分散する」戦略。", usage: "「diversify the business（事業を多角化する）」「diversify investments（投資を分散する）」「diversify the workforce（職場の多様性を高める）」「product diversification（製品の多様化）」のように使う。", synonymDifference: "diversify vs expand vs broaden: diversify は「異なる種類・方向に多様化してリスク分散する」（spread risk）。expand は「規模・範囲を拡大する」（grow bigger）。broaden は「視野・対象を広げる」（wider scope）。", englishDefinition: "To vary or spread into different types to reduce risk.", etymology: "diverse（多様な）＋ -ify（動詞化）。ラテン語 diversus（様々な）から。" }],
  // downsize (30410)
  [30410, { coreImage: "「人員・規模を削減する・縮小する」のがコアイメージ。特に企業のリストラ・人員削減で使われる。", usage: "「downsize the company（会社を縮小する）」「downsize by 10%（10%人員削減する）」「forced to downsize（縮小を余儀なくされた）」「downsizing initiative（人員削減施策）」のように使う。", synonymDifference: "downsize vs reduce vs lay off: downsize は「組織全体の規模を縮小する」（organizational restructuring）。reduce は「量・数を減らす」（reduce headcount）。lay off は「具体的に従業員を解雇する」（specific terminations）。", englishDefinition: "To reduce the number of employees; to make smaller in size.", etymology: "down-（下に）＋ size（規模）。「規模を縮小する」のが原義。" }],
  // encompass (30411)
  [30411, { coreImage: "「範囲・対象の全てを含む・包含する・網羅する」のがコアイメージ。「周りを囲んで中に含む」という語源から。", usage: "「encompass all departments（全部門を網羅する）」「encompass a wide range（幅広い範囲を包含する）」「the plan encompasses（計画は〜を含む）」「broadly encompassing（幅広くカバーする）」のように使う。", synonymDifference: "encompass vs include vs cover: encompass は「全体を完全に包含する」（comprehensive inclusion）。include は「リスト・グループに含める」（listed as part of）。cover は「対象範囲に含む・カバーする」（cover a topic）。", englishDefinition: "To include or contain completely; to surround.", etymology: "en-（中に）＋ compass（囲い・範囲）。「コンパスで囲む→包含する」のが原義。" }],
  // endeavor (30412)
  [30412, { coreImage: "「困難な目標に向けた真剣な努力・試み」のがコアイメージ。「義務から」という語源から「真剣な取り組み」の意に。", usage: "「endeavor to improve（改善しようと努める）」「in all our endeavors（全ての取り組みにおいて）」「human endeavor（人間の努力・試み）」「best endeavors（最大限の努力）」のように使う。", synonymDifference: "endeavor vs effort vs attempt: endeavor は「困難な目標への継続的・真剣な取り組み」（sustained serious effort）。effort は「費やされたエネルギー・労力」（amount of energy）。attempt は「成否に関わらず試みること」（trying once）。", englishDefinition: "A serious attempt or effort to do something.", etymology: "en-（中に）＋ devoir（義務・duty と同語源）。「義務の中に入る→真剣に取り組む」のが原義。" }],
  // entail (30413)
  [30413, { coreImage: "「〜を必然的に伴う・必要とする」のがコアイメージ。「何かをするには〜が必要」という論理的な含意。", usage: "「entail risk（リスクを伴う）」「the role entails（その役割には〜が伴う）」「what this entails（これが何を意味するか）」「entail significant cost（多大なコストを伴う）」のように使う。", synonymDifference: "entail vs involve vs require: entail は「自動的・必然的に伴う・含意する」（logically implies）。involve は「〜に関わる・含む」（includes as part）。require は「外部から〜が必要とされる」（external requirement）。", englishDefinition: "To make something necessary; to involve as a consequence.", etymology: "en-（中に）＋ tail（限定）。古フランス語 taille（切り口・限定）から。「遺産継承を限定する→必然的に伴う」のが原義。" }],
  // equity (30414)
  [30414, { coreImage: "「公正・公平」と「企業の株式・純資産」の二つのコアイメージ。「等しい・公平な」という語源から「公正さ」と「株主に帰属する資産」の両義を持つ。", usage: "「equity financing（株式による資金調達）」「shareholders' equity（株主資本）」「brand equity（ブランド価値）」「diversity and equity（多様性と公正）」のように使う。", synonymDifference: "equity vs fairness vs stock: equity は「公正さ」（fairness/justice）または「株式・純資産」（financial claim）。fairness は「公平さ」の一般表現。stock は「株式・在庫・原材料」（多義語）。", englishDefinition: "Fairness and justice; the value of shares in a company.", etymology: "ラテン語 aequitas（公平さ）から。aequus（等しい・equal と同語源）。" }],
  // erroneous (30415)
  [30415, { coreImage: "「間違い・誤りが含まれている・正確でない」のがコアイメージ。「さまよう→間違いを犯す」という語源から。error（誤り）と同語源。", usage: "「erroneous information（誤った情報）」「erroneous assumption（誤った仮定）」「erroneous data（不正確なデータ）」「erroneous conclusion（誤った結論）」のように使う。", synonymDifference: "erroneous vs wrong vs incorrect: erroneous は「誤りを含む・正確でない」（formal/written）。wrong は「間違いの」の一般表現（wrong answer）。incorrect は「正確・正確でない」（incorrect data）。", englishDefinition: "Containing errors; not correct or true.", etymology: "ラテン語 erroneus（さまよう）から。errare（さまよう・error と同語源）。" }],
  // forthcoming (30418)
  [30418, { coreImage: "「近い将来に起きる・公開される・近づいてくる」のがコアイメージ。また「率直な・協力的な」という意味でも使われる。", usage: "「forthcoming event（近く予定のイベント）」「forthcoming report（近刊の報告書）」「not forthcoming（情報を出そうとしない）」「be forthcoming about（〜について率直に話す）」のように使う。", synonymDifference: "forthcoming vs upcoming vs imminent: forthcoming は「近日公開・起こる予定の」または「率直な」（two meanings）。upcoming は「近く予定の・来たるべき」（upcoming meeting）。imminent は「今にも起きそうな・差し迫った」（imminent danger）。", englishDefinition: "About to happen or appear; willing to give information.", etymology: "forth-（前に）＋ coming（来る）。「前に向かって来る→近日公開」のが原義。" }],
  // grievance (30419)
  [30419, { coreImage: "「不公正な扱いへの正式な不満・苦情」のがコアイメージ。職場での苦情申し立て（grievance procedure）で頻出。", usage: "「file a grievance（苦情を申し立てる）」「grievance procedure（苦情申し立て手順）」「address grievances（不満に対処する）」「workplace grievance（職場の苦情）」のように使う。", synonymDifference: "grievance vs complaint vs dissatisfaction: grievance は「不公正な扱いへの正式な申し立て」（formal, often written）。complaint は「不満・苦情」一般（broader, informal ok）。dissatisfaction は「満足できない状態・不満感」（feeling）。", englishDefinition: "A formal complaint about something believed to be unfair.", etymology: "古フランス語 grevance（重荷・苦しみ）から。grever（重くする・grave と関連）。" }],
  // inaugurate (30420)
  [30420, { coreImage: "「新しい施設・制度・職位を正式に開始する・就任させる」のがコアイメージ。inaugural（30345）の動詞形。", usage: "「inaugurate a president（大統領を就任させる）」「inaugurate a new branch（新支店を開業する）」「inaugurate a policy（政策を施行する）」「inauguration ceremony（就任式・開業式）」のように使う。", synonymDifference: "inaugurate vs open vs launch: inaugurate は「公式な式典で正式に開始する」（formal, ceremonial）。open は「店・施設を開ける・開業する」（open a store）。launch は「製品・プログラムを市場・世界に打ち出す」（launch a product）。", englishDefinition: "To formally begin or open something; to induct into office.", etymology: "ラテン語 inaugurare（前兆を占う）から。augur（前兆を読む占い師）と同語源。" }],

  // incline (30421)
  [30421, { coreImage: "「〜する気持ちになる・傾く」と「坂・傾斜」の二つのコアイメージ。「傾く」という語源から「意向・態度の傾き」の比喩へ。", usage: "「inclined to agree（同意する気がある）」「be inclined toward（〜に傾いている）」「steep incline（急な坂道）」「natural inclination（自然な傾向）」のように使う。", synonymDifference: "incline vs tend vs lean: incline は「意向・態度が〜の方向に傾く」（formal: inclined to think）。tend は「習慣的に〜する傾向がある」（tend to be late）。lean は「体・意見を〜側に傾ける」（lean toward the option）。", englishDefinition: "To feel a tendency toward something; a slope.", etymology: "ラテン語 inclinare（傾ける）から。in-（向かって）＋ clinare（傾ける・recline と同語源）。" }],
  // indispensable (30422)
  [30422, { coreImage: "「なくてはならない・絶対に必要な」のがコアイメージ。「免除できない」という語源から「なしでは済まない」の意に。", usage: "「indispensable role（不可欠な役割）」「indispensable to the team（チームに不可欠な）」「indispensable tool（必須のツール）」「make oneself indispensable（なくてはならない存在になる）」のように使う。", synonymDifference: "indispensable vs essential vs necessary: indispensable は「なしでは成り立たない・絶対に必要な」（cannot do without）。essential は「最も重要な・本質的な」（core/fundamental）。necessary は「必要とされる」（broader, less strong）。", englishDefinition: "Too important to be without; absolutely necessary.", etymology: "in-（否定）＋ dispense（免除する）＋ -able。ラテン語 dispensare（配分する）から。" }],
  // infrastructure (30423)
  [30423, { coreImage: "「社会・組織が機能するための基盤となる設備・システム」のがコアイメージ。「構造物の下にある」という語源から「基礎的な仕組み」を指す。", usage: "「infrastructure investment（インフラ投資）」「digital infrastructure（デジタルインフラ）」「infrastructure maintenance（インフラ維持管理）」「critical infrastructure（重要インフラ）」のように使う。", synonymDifference: "infrastructure vs foundation vs system: infrastructure は「社会・組織が機能するための基盤的な設備・仕組み」（roads, networks, utilities）。foundation は「建物の基礎・組織の基盤」（basis/fundamentals）。system は「仕組み・制度・システム」（broader）。", englishDefinition: "The basic physical and organizational structures needed for operations.", etymology: "ラテン語 infra-（下に）＋ structura（構造物）。「構造物の下にある基盤」のが原義。" }],
  // innovative (30424)
  [30424, { coreImage: "「新しいアイデア・方法を取り入れた・革新的な」のがコアイメージ。innovate（30350）の形容詞形。", usage: "「innovative product（革新的な製品）」「innovative approach（斬新なアプローチ）」「innovative solution（革新的な解決策）」「innovative thinking（革新的な思考）」のように使う。", synonymDifference: "innovative vs creative vs original: innovative は「既存を革新・改善した新しい」（improvement on existing）。creative は「独創的・創造的な」（imaginary/artistic）。original は「他に模倣されない独自の」（unique/first）。", englishDefinition: "Featuring new methods or ideas; creative and forward-thinking.", etymology: "innovate（革新する）＋ -ive（形容詞化）。ラテン語 novus（新しい・novel と同語源）。" }],
  // integral (30425)
  [30425, { coreImage: "「全体の一部として不可欠・欠かせない」のがコアイメージ。「完全・全体」という語源から「それなしでは全体にならない」の意。", usage: "「integral part（不可欠な部分）」「integral to success（成功に不可欠な）」「integral component（重要なコンポーネント）」「play an integral role（重要な役割を果たす）」のように使う。", synonymDifference: "integral vs essential vs fundamental: integral は「全体を構成する上で欠かせない要素」（part of the whole）。essential は「最も重要な・本質的な」（core importance）。fundamental は「基本的・根本的な」（basic foundation）。", englishDefinition: "Necessary to make something complete; essential.", etymology: "ラテン語 integralis（全体の）から。integer（完全な数・整数）と同語源。" }],
  // interim (30426)
  [30426, { coreImage: "「永続的な解決・人材が決まるまでの暫定的・中間的な」のがコアイメージ。「その間に」という語源から「一時的・暫定」の意。", usage: "「interim manager（暫定マネージャー）」「interim report（中間報告）」「interim solution（暫定的な解決策）」「in the interim（その間に）」のように使う。", synonymDifference: "interim vs temporary vs provisional: interim は「永続的な状態が決まるまでの中間期」（gap period）。temporary は「限られた期間のみ続く」（temporary job）。provisional は「最終的な承認・決定が出るまでの仮の」（provisional license）。", englishDefinition: "Temporary or in between; relating to an intermediate period.", etymology: "ラテン語 interim（その間に）から。inter-（間に）＋ -im（時間を示す接尾辞）。" }],
  // jurisdiction (30427)
  [30427, { coreImage: "「法律・権威が及ぶ管轄範囲・裁判権」のがコアイメージ。「法を語る・宣言する」という語源から「権限が及ぶ範囲」の意に。", usage: "「under our jurisdiction（我々の管轄下で）」「outside their jurisdiction（管轄外で）」「tax jurisdiction（税務管轄）」「jurisdictional issue（管轄の問題）」のように使う。", synonymDifference: "jurisdiction vs authority vs territory: jurisdiction は「法的・行政的に権限が及ぶ範囲」（legal/official scope）。authority は「権力・権限」（the right to act）。territory は「物理的な地理的範囲」（geographical area）。", englishDefinition: "The official power to make legal decisions in a particular area.", etymology: "ラテン語 jurisdictio（法の宣言）から。jus（法律）＋ dicere（言う・dictate と同語源）。" }],
  // leverage (30428)
  [30428, { coreImage: "「てこの原理のように小さな力で大きな効果を得る・影響力を活用する」のがコアイメージ。ビジネスでは「資産・ネットワーク・立場を最大活用する」こと。", usage: "「leverage our expertise（専門知識を活かす）」「leverage technology（技術を活用する）」「financial leverage（財務レバレッジ）」「leverage a partnership（提携関係を活用する）」のように使う。", synonymDifference: "leverage vs utilize vs exploit: leverage は「既にある資産・能力を最大活用する」（maximize advantage）。utilize は「有効に使う・活用する」（formal: utilize resources）。exploit は「最大限に使う」（neutral）または「不当に利用する」（negative connotation）。", englishDefinition: "Power or influence to achieve an objective; using borrowed capital.", etymology: "lever（てこ）＋ -age（名詞化）。古フランス語 levier（持ち上げる道具）から。" }],
  // mitigate (30431)
  [30431, { coreImage: "「悪影響・リスク・被害を和らげる・軽減する」のがコアイメージ。「穏やかにする・柔らかくする」という語源から。eliminate より穏やか。", usage: "「mitigate risk（リスクを軽減する）」「mitigate damage（被害を緩和する）」「mitigate the impact（影響を和らげる）」「risk mitigation（リスク軽減策）」のように使う。", synonymDifference: "mitigate vs alleviate vs reduce: mitigate は「悪影響・リスクを部分的に和らげる」（reduce severity）。alleviate は「苦しみ・問題を軽くする」（make less severe）。reduce は「量・程度を減らす」（quantitative reduction）。", englishDefinition: "To reduce the severity of something harmful.", etymology: "ラテン語 mitigare（和らげる）から。mitis（穏やか・mild と同語源）＋ agere（する）。" }],
  // monopoly (30432)
  [30432, { coreImage: "「一社・一者が市場を独占する状態」のがコアイメージ。「一人で売る」という語源から。競争がなく支配的な立場。", usage: "「monopoly on the market（市場の独占）」「hold a monopoly（独占権を持つ）」「natural monopoly（自然独占）」「anti-monopoly law（独占禁止法）」のように使う。", synonymDifference: "monopoly vs oligopoly vs duopoly: monopoly は「1社による完全独占」（single seller）。oligopoly は「少数の企業が市場を支配する寡占」（few sellers）。duopoly は「2社による市場支配」（two sellers）。", englishDefinition: "Exclusive control of a market by a single entity.", etymology: "ギリシャ語 monopolion（単独販売）から。mono-（一つ）＋ polein（売る・monoploist と同語源）。" }],
  // obsolete (30435)
  [30435, { coreImage: "「時代遅れになって使われなくなった・廃れた」のがコアイメージ。「成長して離れていく」という語源から「時代が追い越した」の意に。", usage: "「obsolete technology（時代遅れの技術）」「become obsolete（廃れる・時代遅れになる）」「render obsolete（時代遅れにする）」「obsolete equipment（廃棄予定の設備）」のように使う。", synonymDifference: "obsolete vs outdated vs deprecated: obsolete は「完全に時代遅れで使われなくなった」（no longer used）。outdated は「最新ではなくなった」（needs updating）。deprecated は「推奨されなくなった」（software: avoid using）。", englishDefinition: "No longer in use; out of date.", etymology: "ラテン語 obsoletus（使い古された）から。ob-（向かって）＋ solere（習慣になる）の否定。" }],
  // opt (30436)
  [30436, { coreImage: "「複数の選択肢の中から積極的に一つを選ぶ」のがコアイメージ。「望む・選ぶ」という語源から。opt in/opt out の形でよく使われる。", usage: "「opt for a plan（プランを選ぶ）」「opt in to the program（プログラムに参加する）」「opt out（参加しないことを選ぶ）」「opt for the premium（プレミアムを選択する）」のように使う。", synonymDifference: "opt vs choose vs select: opt は「意識的・自発的に選ぶ」（willful choice, opt in/out）。choose は「選ぶ」の一般的な表現（choose a career）。select は「複数から慎重に選ぶ」（select a candidate）。", englishDefinition: "To make a choice; to decide in favor of.", etymology: "ラテン語 optare（望む・選ぶ）から。option（選択肢）と同語源。" }],
  // overhaul (30437)
  [30437, { coreImage: "「システム・機械・組織を徹底的に見直して改修・刷新する」のがコアイメージ。「追い越して引っ張り直す」という語源から「根本的な修理・刷新」の意に。", usage: "「overhaul the system（システムを刷新する）」「complete overhaul（完全な見直し）」「engine overhaul（エンジンのオーバーホール）」「policy overhaul（政策の抜本的改革）」のように使う。", synonymDifference: "overhaul vs revamp vs reform: overhaul は「機械・システムを分解して徹底修理・刷新する」（thorough repair/renewal）。revamp は「外観・スタイルを更新・改装する」（update appearance）。reform は「制度・組織を改善・改革する」（systemic change）。", englishDefinition: "To thoroughly examine and repair or update something.", etymology: "over-（超えて）＋ haul（引き寄せる）。「追い越して引き直す」のが原義。" }],
  // pertinent (30438)
  [30438, { coreImage: "「議論・問題・状況に直接関連している・適切な」のがコアイメージ。「到達する→関係する」という語源から。", usage: "「pertinent information（関連情報）」「pertinent to the case（そのケースに関連する）」「pertinent questions（的を射た質問）」「all pertinent documents（全ての関連書類）」のように使う。", synonymDifference: "pertinent vs relevant vs applicable: pertinent は「特定の状況・問題に直接関連する」（directly related）。relevant は「関連性がある」（related in some way）。applicable は「適用できる・当てはまる」（can be applied）。", englishDefinition: "Relevant or applicable to a particular situation.", etymology: "ラテン語 pertinere（到達する・関わる）から。per-（通して）＋ tenere（保つ・retain と同語源）。" }],
  // plausible (30439)
  [30439, { coreImage: "「証拠・論理に照らして十分にあり得る・もっともらしい」のがコアイメージ。「拍手喝采に値する」という語源から「承認できる・妥当」の意に。", usage: "「plausible explanation（もっともらしい説明）」「plausible scenario（あり得るシナリオ）」「sounds plausible（もっともらしく聞こえる）」「not entirely plausible（完全には納得できない）」のように使う。", synonymDifference: "plausible vs credible vs convincing: plausible は「あり得る・妥当性がある」（reasonable probability）。credible は「信頼できる・信憑性がある」（trustworthy source）。convincing は「説得力がある・信じさせる」（effective persuasion）。", englishDefinition: "Seeming reasonable or probable; believable.", etymology: "ラテン語 plausibilis（拍手に値する）から。plaudere（拍手する・applaud と同語源）。" }],
  // portfolio (30440)
  [30440, { coreImage: "「投資・作品・製品の多様な組み合わせ・一覧」のがコアイメージ。「書類を入れた鞄」という語源から「保有物の一覧」の意に転じた。", usage: "「investment portfolio（投資ポートフォリオ）」「product portfolio（製品ポートフォリオ）」「portfolio management（ポートフォリオ管理）」「diverse portfolio（多様なポートフォリオ）」のように使う。", synonymDifference: "portfolio vs collection vs holding: portfolio は「多様な資産・作品・製品の組み合わせ全体」（structured collection for management）。collection は「集めたもの・コレクション」（general gathering）。holding は「保有する資産・株式」（assets owned）。", englishDefinition: "A set of investments, products, or work samples.", etymology: "イタリア語 portafoglio（書類入れ）から。portare（運ぶ）＋ foglio（紙・folio と同語源）。" }],
  // precede (30441)
  [30441, { coreImage: "「時間・順序で前に来る・先行する」のがコアイメージ。「前を行く」という語源から。precedent（前例）と同語源。", usage: "「precede the meeting（会議に先立つ）」「preceded by（〜に先行された）」「as mentioned in the preceding section（前のセクションで述べたように）」「no precedent（前例がない）」のように使う。", synonymDifference: "precede vs anticipate vs lead up to: precede は「時間・順序で前に来る」（come before）。anticipate は「〜に先立って予想・対応する」（prepare in advance）。lead up to は「〜につながる・前触れになる」（build toward）。", englishDefinition: "To come before in time, order, or importance.", etymology: "ラテン語 praecedere（前を行く）から。prae-（前に）＋ cedere（行く・proceed と同語源）。" }],
  // prohibit (30443)
  [30443, { coreImage: "「法律・規則で行動を禁止する」のがコアイメージ。「前に立ちはだかって阻む」という語源から。", usage: "「prohibit smoking（喫煙を禁止する）」「prohibited from entering（入場を禁じられた）」「strictly prohibited（厳禁）」「prohibition（禁止・禁酒法）」のように使う。", synonymDifference: "prohibit vs forbid vs ban: prohibit は「法律・規則によって正式に禁止する」（formal/legal）。forbid は「禁じる」のやや格式ばった表現（I forbid you）。ban は「公式に禁止する・禁止措置を取る」（government ban）。", englishDefinition: "To formally forbid something by law or rule.", etymology: "ラテン語 prohibere（前に立って止める）から。pro-（前に）＋ habere（持つ・prohibit の反）。" }],
  // proprietor (30444)
  [30444, { coreImage: "「店・事業の所有者・経営者」のがコアイメージ。「自分のものを所有する」という語源から「所有者・業主」の意。", usage: "「sole proprietor（個人事業主）」「proprietor of a restaurant（レストランの経営者）」「proprietorship（個人経営・所有権）」「proprietor's liability（経営者の責任）」のように使う。", synonymDifference: "proprietor vs owner vs manager: proprietor は「法的所有者として事業を経営する」（owns and runs）。owner は「所有者」（could hire someone else to manage）。manager は「経営・管理する人」（may not own）。", englishDefinition: "The owner of a business or property.", etymology: "ラテン語 proprietarius（所有者）から。proprius（自分自身の・proper と同語源）。" }],
  // ratify (30445)
  [30445, { coreImage: "「条約・合意・決定を正式に承認・批准する」のがコアイメージ。「固める・確認する」という語源から。", usage: "「ratify an agreement（協定を批准する）」「ratify the treaty（条約を批准する）」「ratify a decision（決定を承認する）」「ratification vote（批准投票）」のように使う。", synonymDifference: "ratify vs approve vs endorse: ratify は「条約・協定・法律を正式に批准・承認する」（official/formal legal approval）。approve は「承認する」（general approval）。endorse は「支持・推薦する」（recommend/support）。", englishDefinition: "To give formal consent to make something officially valid.", etymology: "ラテン語 ratificare（確認して固める）から。ratus（決定された）＋ facere（する）。" }],
  // reconcile (30446)
  [30446, { coreImage: "「対立・不一致を解消して和解・一致させる」のがコアイメージ。会計では「帳簿・数字を照合して一致させる」意でも頻出。", usage: "「reconcile differences（相違を調整する）」「reconcile the accounts（帳簿を照合する）」「hard to reconcile（折り合いをつけるのが難しい）」「bank reconciliation（銀行勘定照合）」のように使う。", synonymDifference: "reconcile vs resolve vs settle: reconcile は「対立・不一致を和解させる・一致させる」（bring into harmony）。resolve は「問題・紛争を解決する」（find a solution）。settle は「争い・支払いを決着させる」（settle a dispute）。", englishDefinition: "To restore friendly relations; to make accounts consistent.", etymology: "ラテン語 reconciliare（再び親しくする）から。re-（再び）＋ conciliare（まとめる・council と同語源）。" }],
  // redundant (30447)
  [30447, { coreImage: "「余剰の・不要な・冗長な」のがコアイメージ。英国では「会社都合で解雇された」という意味でよく使われる。", usage: "「redundant positions（余剰ポスト）」「made redundant（会社都合で解雇された）」「redundant information（冗長な情報）」「eliminate redundancies（冗長性を排除する）」のように使う。", synonymDifference: "redundant vs unnecessary vs superfluous: redundant は「余剰・重複して不要な」（surplus to requirements）。unnecessary は「必要でない」（not needed）。superfluous は「以上に過剰な・余計な」（more than needed）。", englishDefinition: "No longer needed; repeating what has already been said.", etymology: "ラテン語 redundare（溢れる）から。re-（再び）＋ unda（波・undulate と同語源）。" }],
  // remittance (30448)
  [30448, { coreImage: "「海外・遠方への送金・振り込み額」のがコアイメージ。国際取引・海外送金で頻出のビジネス用語。", usage: "「send a remittance（送金する）」「remittance advice（送金通知書）」「wire remittance（電信送金）」「international remittance（海外送金）」のように使う。", synonymDifference: "remittance vs transfer vs wire: remittance は「支払い義務のある送金・振り込み」（payment sent）。transfer は「お金・所有権を移動させる」（general transfer）。wire は「電信・電子送金」（electronic transfer method）。", englishDefinition: "A sum of money sent as payment, especially abroad.", etymology: "remit（送る・免除する）＋ -ance。ラテン語 remittere（送り返す・緩める）から。" }],
  // renowned (30449)
  [30449, { coreImage: "「広く知られ高く評価されている・名高い・著名な」のがコアイメージ。「再び名前が挙げられる」という語源から「名声が広まる」の意。", usage: "「world-renowned（世界的に有名な）」「renowned expert（著名な専門家）」「renowned for quality（品質で名高い）」「internationally renowned（国際的に著名な）」のように使う。", synonymDifference: "renowned vs famous vs prestigious: renowned は「特定の優れた点で広く認められ尊敬される」（respected for excellence）。famous は「多くの人に知られている」（widely known）。prestigious は「高い評価・地位がある格式高い」（high status）。", englishDefinition: "Known and respected by many people; famous.", etymology: "re-（再び）＋ nommer（名づける）。古フランス語。「繰り返し名が挙げられる→名声がある」のが原義。" }],
  // retaliate (30450)
  [30450, { coreImage: "「不当な扱い・攻撃に対して同じように仕返しをする・報復する」のがコアイメージ。「同じ代価を返す」という語源から。", usage: "「retaliate against（〜に報復する）」「retaliate with sanctions（制裁で応じる）」「retaliatory measure（報復措置）」「threat of retaliation（報復の脅威）」のように使う。", synonymDifference: "retaliate vs counter vs revenge: retaliate は「受けた行動に対して同様の行動で応じる」（respond in kind）。counter は「対抗措置を取る」（counter an argument）。revenge は「個人的な恨みで仕返しをする」（more emotional/personal）。", englishDefinition: "To take action against someone in response to harm done.", etymology: "ラテン語 retaliare（同等の代価を返す）から。re-（返す）＋ talis（同等の）。" }],

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

  // ── conversation stage1 ───────────────────────────────────────────────────

  // hello (70001)
  [
    70001,
    {
      coreImage:
        "会話を始めるときに相手との距離を一気に縮める「呼びかけ」がコアイメージ。意味内容よりも、コミュニケーション開始の合図として機能する。",
      usage:
        "単独で「Hello!」のほか、「Hello, everyone.（みなさんこんにちは）」「Hello, how are you?（こんにちは、元気ですか）」のように続けて使える。丁寧さは中立で、ビジネス・日常どちらでも使いやすい。",
      synonymDifference:
        "hello vs hi vs hey: hello は中立で最も汎用。hi はややカジュアル。hey は親しい間柄や注意喚起で使うため、場面によってはぶしつけに聞こえることがある。",
      englishDefinition:
        "A common greeting used when meeting someone or starting a conversation.",
      etymology:
        "19世紀に英語の呼びかけ表現として定着。電話応対の普及で広まったとされる。語源には諸説あるが、呼びかけ音に由来する。",
    },
  ],
  // goodbye (70002)
  [
    70002,
    {
      coreImage:
        "会話や対面を「区切って終える」ための別れの挨拶がコアイメージ。次の再会を前提に丁寧に離脱するニュアンスを持つ。",
      usage:
        "「Goodbye.」「Goodbye, see you later.」のように使う。やや丁寧・正式寄りなので、友人同士では「Bye」「See you」がより自然なことも多い。",
      synonymDifference:
        "goodbye vs bye vs see you: goodbye は標準的でやや改まった別れ。bye はカジュアル。see you は「また会おう」の再会前提を強調する。",
      englishDefinition:
        "A word used when leaving someone or ending a conversation.",
      etymology:
        "God be with ye（神があなたと共にありますように）が短縮・音変化してできた語。",
    },
  ],
  // please (70003)
  [
    70003,
    {
      coreImage:
        "依頼・要望を相手に柔らかく伝える「丁寧さのクッション」がコアイメージ。文の命令感を和らげる働きがある。",
      usage:
        "依頼で「Please help me.」、受け答えで「Yes, please. / No, thank you.」の形が基本。文頭・文末どちらにも置けるが、文頭はやや丁寧で明確。",
      synonymDifference:
        "please vs kindly: please は日常からビジネスまで自然。kindly はより書き言葉・事務文書寄りで、口語では硬く聞こえることがある。",
      englishDefinition:
        "A polite word used when asking for something or making a request.",
      etymology:
        "動詞 please（喜ばせる・満足させる）から派生し、丁寧表現として文法化した。",
    },
  ],
  // thanks (70004)
  [
    70004,
    {
      coreImage:
        "相手の行為に対して「感謝を示す」短い反応語がコアイメージ。会話の流れを良くし、関係を保つための基本表現。",
      usage:
        "単独で「Thanks!」、理由を添えて「Thanks for your help.」が定型。より丁寧に言うなら「Thank you.」、強調するなら「Thanks a lot.」が使える。",
      synonymDifference:
        "thanks vs thank you vs appreciate it: thanks はカジュアル。thank you は中立〜丁寧。I appreciate it は感謝の中身をより明確に伝える表現。",
      englishDefinition:
        "An informal expression of gratitude.",
      etymology:
        "thank の複数形由来で、感謝の言葉を慣用的に表す定型表現として定着した。",
    },
  ],
  // sorry (70005)
  [
    70005,
    {
      coreImage:
        "相手への迷惑・遅れ・失敗に対して「遺憾の気持ちを示す」ことがコアイメージ。謝罪と共感の両方に使える。",
      usage:
        "謝罪で「I'm sorry I'm late.」、軽い聞き返しで「Sorry?」のようにも使う。フォーマルに謝罪する場合は「I apologize.」が適切。",
      synonymDifference:
        "sorry vs excuse me vs apologize: sorry は謝罪・共感の広い表現。excuse me は呼びかけ・軽い詫び。apologize はより公式で責任を明示する謝罪。",
      englishDefinition:
        "Feeling regret about something; used to apologize.",
      etymology:
        "古英語 sarig（悲しんだ・心を痛めた）から。悲しみ・遺憾の感情を示す語として発達した。",
    },
  ],
  // yes (70006)
  [
    70006,
    {
      coreImage:
        "質問・提案・依頼に対して「肯定・同意」を即座に示す応答語がコアイメージ。会話の意思決定を前に進める。",
      usage:
        "単独の「Yes.」のほか、「Yes, I understand.」「Yes, please.」の形が頻出。カジュアルには「Yeah.」、より丁寧には「Certainly.」も使える。",
      synonymDifference:
        "yes vs yeah vs certainly: yes は標準。yeah は口語的で親しい間柄向け。certainly は丁寧で、依頼に前向きに応じるニュアンスが強い。",
      englishDefinition:
        "A word used to give an affirmative answer.",
      etymology:
        "古英語 gese（そうである）に遡る古い肯定応答語。",
    },
  ],
  // no (70007)
  [
    70007,
    {
      coreImage:
        "依頼・提案・質問に対して「否定・拒否」を明確に示す応答語がコアイメージ。曖昧さを避ける機能を持つ。",
      usage:
        "単独の「No.」に加え、「No, thank you.」で丁寧に断れる。強く否定する場合でも、語調を和らげる副詞や理由を添えると自然。",
      synonymDifference:
        "no vs not really vs afraid not: no は明確な否定。not really はやや婉曲。I'm afraid not は丁寧に断るフォーマル寄り表現。",
      englishDefinition:
        "A word used to give a negative answer or refusal.",
      etymology:
        "古英語 no（not any）由来。ゲルマン諸語に広く見られる否定語根。",
    },
  ],
  // help (70008)
  [
    70008,
    {
      coreImage:
        "困っている相手を「支えて状況を改善する」行為がコアイメージ。動詞・名詞の両方で使える高頻度語。",
      usage:
        "「Can you help me?」「help + 人 + (to) do」「help with ...」が基本。名詞では「Thank you for your help.」の形で使う。",
      synonymDifference:
        "help vs assist vs support: help は最も広く日常的。assist はややフォーマルで補助的。support は継続的に支えるニュアンスが強い。",
      englishDefinition:
        "To make it easier for someone to do something; assistance.",
      etymology:
        "古英語 helpan（助ける）から。古いゲルマン語根由来の基礎語彙。",
    },
  ],
  // wait (70009)
  [
    70009,
    {
      coreImage:
        "行動を急がず「その場で時間を置く」ことがコアイメージ。相手への配慮や手続き上の必要を伝える基本動詞。",
      usage:
        "「Please wait a moment.」「wait for ...（〜を待つ）」「wait until ...（〜まで待つ）」の形で使う。for の有無（wait for 人/物）に注意。",
      synonymDifference:
        "wait vs hold on vs stay: wait は標準。hold on は口語で「ちょっと待って」。stay は「その場所にとどまる」意味で、待機と重なるが焦点が異なる。",
      englishDefinition:
        "To stay where you are or delay action until something happens.",
      etymology:
        "古フランス語 waitier（見張る・注意して待つ）由来。",
    },
  ],
  // stop (70010)
  [
    70010,
    {
      coreImage:
        "動いている行為・流れを「そこで止める」ことがコアイメージ。自動詞・他動詞の両方で使える。",
      usage:
        "「Please stop here.」「stop doing（〜するのをやめる）」「stop to do（〜するために立ち止まる）」は意味差が大きいのでセットで覚える。",
      synonymDifference:
        "stop vs quit vs cease: stop は最も一般的。quit は習慣・仕事をやめる文脈で頻出。cease は書き言葉寄りでよりフォーマル。",
      englishDefinition:
        "To end an action or movement; to cause something to end.",
      etymology:
        "中英語 stoppen（詰める・止める）由来。物理的停止から行為停止へ意味拡張した。",
    },
  ],
  // understand (70011)
  [
    70011,
    {
      coreImage:
        "情報・意図・状況を「頭の中でつかむ」ことがコアイメージ。単なる聞き取りだけでなく、意味理解全般に使う。",
      usage:
        "「Do you understand?」「understand that ...」「I understand your point.」のように使う。進行形（I'm understanding）は通常使わない。",
      synonymDifference:
        "understand vs know vs realize: understand は内容を理解する。know は知識として知っている。realize は新たに気づく瞬間を表す。",
      englishDefinition:
        "To know the meaning of something or what someone intends.",
      etymology:
        "under + stand の複合だが、語源的には「下に立つ」ではなく「間近で捉える」に近い意味発展をしている。",
    },
  ],
  // repeat (70012)
  [
    70012,
    {
      coreImage:
        "同じ内容を「もう一度繰り返す」ことがコアイメージ。聞き取り確認や学習定着の場面で非常に有用。",
      usage:
        "「Could you repeat that, please?」は聞き返しの定番。名詞では「repeat of the show（再放送）」のようにも使える。",
      synonymDifference:
        "repeat vs say again vs review: repeat は同じ内容をそのまま繰り返す。say again は口語的な聞き返し。review は振り返って再確認する。",
      englishDefinition:
        "To say or do something again.",
      etymology:
        "ラテン語 repetere（再び求める・取り戻す）に由来。re-（再び）+ petere（求める）。",
    },
  ],
  // nice (70013)
  [
    70013,
    {
      coreImage:
        "対象を「感じがよい・好ましい」と評価する柔らかい形容詞がコアイメージ。ポジティブ評価の汎用語。",
      usage:
        "「Nice to meet you.」「a nice day」「That's nice.」のように幅広く使える。意味が広い分、具体的に褒めたいときは別語（kind, beautiful など）も併用する。",
      synonymDifference:
        "nice vs kind vs pleasant: nice は広い好意的評価。kind は人柄の親切さ。pleasant は感覚的に心地よい印象（pleasant weather）。",
      englishDefinition:
        "Pleasant, kind, or enjoyable.",
      etymology:
        "ラテン語 nescius（無知な）から意味変化を重ね、現代英語では「感じの良い」の肯定語義で定着した。",
    },
  ],
  // good (70014)
  [
    70014,
    {
      coreImage:
        "基準に照らして「望ましい・質が高い」と評価する最重要形容詞。道徳的に良い、人にとって有益など幅広い。",
      usage:
        "「good morning」「be good at ...（〜が得意）」「for your health（健康によい）」など定型表現が多い。比較級は better、最上級は best。",
      synonymDifference:
        "good vs great vs fine: good は標準的に良い。great はより強い賞賛。fine は「十分よい・問題ない」という控えめ評価。",
      englishDefinition:
        "Of high quality; satisfactory; morally right.",
      etymology:
        "古英語 god 由来。ゲルマン語族の非常に基本的な評価語。",
    },
  ],
  // bad (70015)
  [
    70015,
    {
      coreImage:
        "基準を下回る・望ましくない状態を示す否定評価語がコアイメージ。品質・状況・道徳のいずれにも使える。",
      usage:
        "「too bad（残念だ）」「bad at ...（〜が苦手）」「feel bad（気分が悪い／申し訳ない）」など多義的なので文脈で判断する。",
      synonymDifference:
        "bad vs poor vs awful: bad は一般的な否定評価。poor は質・程度が低い。awful は感情的に強い「ひどい」。",
      englishDefinition:
        "Not good; of low quality; unpleasant or harmful.",
      etymology:
        "古英語 bæddel など諸説あるが、中英語期以降に現在の「悪い」語義が一般化した。",
    },
  ],
  // how (70016)
  [
    70016,
    {
      coreImage:
        "方法・程度・状態を「どのように」と問う疑問副詞がコアイメージ。情報の種類を指定して質問できる。",
      usage:
        "「How are you?」「How do you ...?」「How much / How many ...?」など、後続語とセットで質問意図が決まる。",
      synonymDifference:
        "how vs what: how は方法・状態・程度を問う。what は内容・物事そのものを問う。例：How do you do this? / What is this?",
      englishDefinition:
        "A question word used to ask about manner, degree, or condition.",
      etymology:
        "古英語 hu（どのように）から。ゲルマン語系の基本疑問語。",
    },
  ],
  // where (70017)
  [
    70017,
    {
      coreImage:
        "場所・位置を「どこで／どこへ」と問う疑問副詞がコアイメージ。空間情報を特定するための基礎語。",
      usage:
        "「Where is the station?」「Where are you from?」「Where to?（どこへ？）」のように使う。前置詞との組み合わせでも頻出。",
      synonymDifference:
        "where vs which place: where は自然な疑問語。which place は強調や限定が必要な場合を除き不自然になりやすい。",
      englishDefinition:
        "A question word used to ask about place or location.",
      etymology:
        "古英語 hwær（どこ）由来。what, when などと同じ疑問語グループに属する。",
    },
  ],
  // what (70018)
  [
    70018,
    {
      coreImage:
        "対象・内容・正体を「何か」と問う最も基本的な疑問語がコアイメージ。会話の情報取得の中心となる。",
      usage:
        "「What is this?」「What do you mean?」「What time ...?」など、名詞・節のどちらにも広く使える。",
      synonymDifference:
        "what vs which: what は選択肢が不特定のときに使う。which は選択肢がある程度限定されているときに使う。",
      englishDefinition:
        "A question word used to ask for information about something.",
      etymology:
        "古英語 hwæt（何）から。印欧祖語由来の非常に古い疑問語。",
    },
  ],
  // when (70019)
  [
    70019,
    {
      coreImage:
        "時間・時点を「いつ」と問う疑問副詞がコアイメージ。予定確認や時系列整理で必須となる。",
      usage:
        "「When does it start?」「When will you arrive?」「since/when ...」など未来・過去どちらの文脈にも使える。",
      synonymDifference:
        "when vs what time: when は時点を広く問う（日時・時期）。what time は時計時刻に限定して問う。",
      englishDefinition:
        "A question word used to ask about time.",
      etymology:
        "古英語 hwanne（いつ）から発達した疑問副詞。",
    },
  ],
  // why (70020)
  [
    70020,
    {
      coreImage:
        "理由・原因を「なぜ」と問う疑問副詞がコアイメージ。相手の判断根拠を引き出すための語。",
      usage:
        "「Why not?」「Why did you do that?」「That's why ...（だから〜だ）」のように、疑問と説明の両方で使える。",
      synonymDifference:
        "why vs how come: why は標準的でフォーマルにも対応。how come は口語的で、カジュアル会話向き。",
      englishDefinition:
        "A question word used to ask for a reason or cause.",
      etymology:
        "古英語 hwi（なぜ）由来。疑問語の中でも因果関係を問う機能に特化した語。",
    },
  ],
  // excuse me (70101)
  [
    70101,
    {
      coreImage:
        "相手の注意を丁寧に引く・軽く謝意を示すための前置き表現がコアイメージ。依頼・呼びかけ・通行時の配慮など多用途。",
      usage:
        "「Excuse me, where is ...?」で道を尋ねる定型。「Excuse me.」単独でも呼びかけとして機能する。謝罪の強さは軽めで、強い謝罪は「I'm sorry」が自然。",
      synonymDifference:
        "excuse me vs sorry vs pardon me: excuse me は呼びかけ・軽い詫び。sorry はより感情的な謝罪。pardon me は丁寧でややフォーマル。",
      englishDefinition:
        "A polite phrase used to get attention, ask a question, or apologize lightly.",
      etymology:
        "excuse（許す・弁明する）＋ me から成る定型句。ラテン語 excusare（責めを免れさせる）が語源。",
    },
  ],
  // good morning (70102)
  [
    70102,
    {
      coreImage:
        "朝の時間帯に相手へ好意を示して関係を開始する定型挨拶がコアイメージ。内容より社会的機能が重要。",
      usage:
        "通常は午前中に使用。「Good morning! Did you sleep well?」のように続けると自然。初対面・ビジネスでも無難。",
      synonymDifference:
        "good morning vs morning: good morning は標準・丁寧。morning は口語でカジュアル。hey はさらに砕けた呼びかけ。",
      englishDefinition:
        "A greeting used in the morning.",
      etymology:
        "good + morning の複合。時間帯別挨拶（good afternoon / good evening）の基本形。",
    },
  ],
  // good evening (70103)
  [
    70103,
    {
      coreImage:
        "夕方〜夜の始まりに相手へ丁寧に挨拶する表現がコアイメージ。場のトーンを落ち着かせる機能を持つ。",
      usage:
        "会話開始時の挨拶として使う（別れ際は通常「Good night」）。「Good evening, everyone.」は発表・司会でも定番。",
      synonymDifference:
        "good evening vs good night: good evening は会ったとき。good night は別れるとき・就寝前。",
      englishDefinition:
        "A greeting used in the evening when meeting someone.",
      etymology:
        "good + evening の複合。時刻に応じた慣用挨拶表現。",
    },
  ],
  // see you (70104)
  [
    70104,
    {
      coreImage:
        "別れ際に「再会を前提に離れる」ニュアンスを伝える定型句がコアイメージ。関係を切らずにつなぐ働きがある。",
      usage:
        "「See you tomorrow.」「See you at school.」のように時期・場所を続ける。単独でも自然だが、文脈で再会可能性が暗黙に共有される。",
      synonymDifference:
        "see you vs goodbye vs bye: see you は再会前提で柔らかい。goodbye はより区切りが明確。bye はカジュアルな別れ。",
      englishDefinition:
        "A casual expression used when parting, implying you will meet again.",
      etymology:
        "動詞 see の未来再会用法から定着した口語的定型。",
    },
  ],
  // take care (70105)
  [
    70105,
    {
      coreImage:
        "別れ際に相手の安全・健康を気遣う配慮表現がコアイメージ。温かさを添えて会話を終える。",
      usage:
        "「Take care on your way home.」「Take care!」のように使う。メール末尾の結びとしても自然。",
      synonymDifference:
        "take care vs be careful: take care は別れの挨拶としても使える包括的な気遣い。be careful は具体的危険への注意喚起。",
      englishDefinition:
        "A phrase used to express concern for someone's well-being, often when saying goodbye.",
      etymology:
        "take care（注意を払う）という句動詞的連語が定型挨拶化したもの。",
    },
  ],
  // welcome (70106)
  [
    70106,
    {
      coreImage:
        "相手を場に受け入れ「来訪を歓迎する」姿勢を示す語がコアイメージ。挨拶・応答の両方で使える。",
      usage:
        "「Welcome to our class.」は導入の定型。「You're welcome.」で感謝への返答としても使う（語用は異なるため分けて覚える）。",
      synonymDifference:
        "welcome vs greet: welcome は受け入れ・歓迎の意味を含む。greet は挨拶行為そのものを指す動詞。",
      englishDefinition:
        "To receive someone gladly; a greeting to show acceptance.",
      etymology:
        "古英語 wilcuma（望ましい来訪者）由来。will（望む）+ cuma（来る人）。",
    },
  ],
  // nice to see you (70107)
  [
    70107,
    {
      coreImage:
        "再会時に相手との接触を前向きに評価する「関係維持の一言」がコアイメージ。丁寧で温かい印象を与える。",
      usage:
        "「Nice to see you again.」が定番。初対面は通常「Nice to meet you.」、再会は see を使う。",
      synonymDifference:
        "nice to see you vs nice to meet you: see you は再会。meet you は初対面。使い分けを誤ると不自然さが出る。",
      englishDefinition:
        "A polite phrase used when meeting someone again.",
      etymology:
        "nice + infinitive 構文（形容詞 + to do）から成る慣用的挨拶。",
    },
  ],
  // how much (70108)
  [
    70108,
    {
      coreImage:
        "数量・金額を「どれくらいか」尋ねる疑問句がコアイメージ。買い物・予算確認で最重要。",
      usage:
        "不可算名詞に使うのが原則（How much is this shirt?）。可算名詞には「How many」を使う。",
      synonymDifference:
        "how much vs how many: how much は不可算（money, water）。how many は可算（books, people）。",
      englishDefinition:
        "A question phrase used to ask about amount or price.",
      etymology:
        "how（程度）+ much（量）からなる疑問表現。",
    },
  ],
  // one more time (70109)
  [
    70109,
    {
      coreImage:
        "理解確認のために「もう一度」を求める再実行表現がコアイメージ。聞き返しの定番フレーズ。",
      usage:
        "「Please say that one more time.」の形で丁寧に依頼できる。速度調整を頼む場合は「Please speak slowly.」と併用。",
      synonymDifference:
        "one more time vs again: one more time は回数を明示して丁寧。again はより短く一般的。",
      englishDefinition:
        "A phrase meaning one additional repetition.",
      etymology:
        "one + more + time の語義通りの組み合わせが慣用化した表現。",
    },
  ],
  // slowly (70110)
  [
    70110,
    {
      coreImage:
        "動作・発話の速度を落として「ゆっくり」の様子を加える副詞がコアイメージ。聞き取り支援で実用性が高い。",
      usage:
        "「Please speak slowly.」「Walk slowly.」など動詞を修飾する。語学学習では very / a little を足して程度調整できる。",
      synonymDifference:
        "slowly vs gently: slowly は速度に焦点。gently は力加減・やさしさに焦点。",
      englishDefinition:
        "At a low speed; not quickly.",
      etymology:
        "slow（遅い）+ -ly（副詞化）。",
    },
  ],
  // right now (70111)
  [
    70111,
    {
      coreImage:
        "「まさに今この瞬間」の緊急性を示す時間表現がコアイメージ。優先度を上げる効果がある。",
      usage:
        "「I need your help right now.」のように文末・文中どちらにも置ける。急ぎすぎる印象を避けたい場面では now を使うと柔らかい。",
      synonymDifference:
        "right now vs now vs immediately: right now は強い即時性。now は中立。immediately は命令・手続き文でより強く正式。",
      englishDefinition:
        "At this exact moment; immediately.",
      etymology:
        "right（まさに）+ now（今）による強調構文。",
    },
  ],
  // over there (70112)
  [
    70112,
    {
      coreImage:
        "話し手から離れた位置を「向こうに」と指示する場所句がコアイメージ。指差しと併用されやすい。",
      usage:
        "「My bag is over there.」のように場所を示す。近くは here、中距離は there、遠めの強調で over there。",
      synonymDifference:
        "there vs over there: there は一般的な「そこ」。over there は距離感をより強調した「向こうのあそこ」。",
      englishDefinition:
        "In that place at some distance from the speaker.",
      etymology:
        "over（向こう側）+ there（そこ）の連語。",
    },
  ],
  // take this one (70113)
  [
    70113,
    {
      coreImage:
        "複数候補から「これを選ぶ」という選択完了の意思表示がコアイメージ。買い物場面で即応できる定型。",
      usage:
        "「I'll take this one.」で購入意思を自然に示せる。店員への返答として短く強い。",
      synonymDifference:
        "take vs buy: take は選択・受け取りの会話表現。buy は購入行為そのものを明示する語。",
      englishDefinition:
        "A phrase used to indicate your choice, especially when shopping.",
      etymology:
        "take（取る・選ぶ）+ this one（これ）からなる実用句。",
    },
  ],
  // better (70114)
  [
    70114,
    {
      coreImage:
        "2つ以上を比較して「より良い方」を示す比較級がコアイメージ。選好・判断を簡潔に伝えられる。",
      usage:
        "「I like that one better.」のように使う。better は good の比較級で、than を伴う比較文にも頻出。",
      synonymDifference:
        "better vs best: better は2者比較・相対比較。best は最上級で「最も良い」。",
      englishDefinition:
        "Comparative form of good; of higher quality or preference.",
      etymology:
        "good の比較級として古英語 betera 由来。",
    },
  ],
  // here you are (70115)
  [
    70115,
    {
      coreImage:
        "相手に物を渡す瞬間に「はい、どうぞ」と示す受け渡し定型がコアイメージ。丁寧で実用性が高い。",
      usage:
        "飲み物・書類・釣り銭などを渡すときに使う。「Here you are. Your coffee.」のように品目を続けると明確。",
      synonymDifference:
        "here you are vs here it is: here you are は相手への手渡しで自然。here it is は物の所在提示に寄る。",
      englishDefinition:
        "A polite phrase used when giving something to someone.",
      etymology:
        "here（ここに）+ you are（あなたです）から発達した英語の定型応答句。",
    },
  ],
  // how are you doing (70176)
  [
    70176,
    {
      coreImage:
        "相手の近況・体調をカジュアルに確認する挨拶フレーズがコアイメージ。情報取得よりも関係維持の機能が強い。",
      usage:
        "「Hi, how are you doing?」のように冒頭で使う。返答は「I'm good.」「Not bad.」など短く返すのが自然。",
      synonymDifference:
        "how are you doing vs how are you: 前者はより口語的で親しみがある。後者は中立で幅広い場面に使える。",
      englishDefinition:
        "A casual greeting used to ask about someone's condition or day.",
      etymology:
        "How are you + doing の進行形化で、現代口語で定着した挨拶表現。",
    },
  ],
  // long time no see (70177)
  [
    70177,
    {
      coreImage:
        "久しぶりの再会を短く強調する定型句がコアイメージ。文法的には口語慣用で、自然な挨拶として定着している。",
      usage:
        "再会直後に単独で「Long time no see!」と使う。ややカジュアルなので、フォーマルには「It's been a long time.」が無難。",
      synonymDifference:
        "long time no see vs it's been a while: 前者はより砕けた定型。後者は中立で幅広く使える。",
      englishDefinition:
        "An informal phrase said when meeting someone after a long period.",
      etymology:
        "19世紀以降の英語口語で広まった慣用句。ピジン英語由来説などがある。",
    },
  ],
  // after you (70178)
  [
    70178,
    {
      coreImage:
        "順番を譲るときに「どうぞお先に」という礼儀を示す短い配慮表現がコアイメージ。",
      usage:
        "ドア・エレベーター・列の場面で「After you.」と単独使用。丁寧で自然なマナー表現として高頻度。",
      synonymDifference:
        "after you vs you first: どちらも譲る表現だが、after you の方が丁寧で定型的。",
      englishDefinition:
        "A polite phrase used to let someone go first.",
      etymology:
        "前置詞 after + 代名詞 you の句が礼儀表現として固定化したもの。",
    },
  ],
  // this way (70179)
  [
    70179,
    {
      coreImage:
        "相手を目的地へ導くときに「こちらへ」と方向を提示する案内表現がコアイメージ。",
      usage:
        "「Please come this way.」の形で接客・案内で頻出。ジェスチャーと併用すると伝達力が高い。",
      synonymDifference:
        "this way vs over here: this way は移動方向の案内。over here は位置の指示に比重がある。",
      englishDefinition:
        "A phrase used to guide someone in a direction.",
      etymology:
        "指示詞 this + 名詞 way（方向）による基礎句。",
    },
  ],
  // just a moment (70180)
  [
    70180,
    {
      coreImage:
        "相手に短時間の待機を丁寧に依頼する緩衝表現がコアイメージ。会話を止めずに時間を確保できる。",
      usage:
        "「Just a moment, please.」が定番。電話・受付・接客で広く使う。",
      synonymDifference:
        "just a moment vs hold on vs one second: just a moment は丁寧。hold on は口語。one second はやや直接的。",
      englishDefinition:
        "A polite phrase asking someone to wait briefly.",
      etymology:
        "just（ほんの）+ a moment（短い時間）の組み合わせ。",
    },
  ],
  // I am fine (70181)
  [
    70181,
    {
      coreImage:
        "体調・気分の確認に対し「問題ない状態」を返す応答表現がコアイメージ。会話の安定した返しとして機能する。",
      usage:
        "「I'm fine, thank you.」が基本。深掘りされたくないときの中立返答としても使われる。",
      synonymDifference:
        "I'm fine vs I'm good: 前者は標準的返答。後者は口語で自然。地域・世代で好みが分かれる。",
      englishDefinition:
        "A common response meaning one's condition is okay.",
      etymology:
        "be 動詞 + fine（良好な）による基本述語構文。",
    },
  ],
  // not bad (70182)
  [
    70182,
    {
      coreImage:
        "強い賞賛ではなく「悪くない」と控えめに肯定する評価表現がコアイメージ。気軽な返答で使いやすい。",
      usage:
        "近況返答「Not bad.」や評価「That's not bad.」で使う。語調次第で前向きにも皮肉にもなり得る。",
      synonymDifference:
        "not bad vs pretty good: not bad は控えめ肯定。pretty good はより積極的な肯定。",
      englishDefinition:
        "An expression meaning fairly good or acceptable.",
      etymology:
        "否定語 not + bad による控えめ肯定（緩和表現）の典型。",
    },
  ],
  // have a seat (70183)
  [
    70183,
    {
      coreImage:
        "相手に着席を促す丁寧な指示表現がコアイメージ。命令形でも柔らかく聞こえる。",
      usage:
        "「Please have a seat.」「Have a seat over here.」の形で面談・接客で頻出。",
      synonymDifference:
        "have a seat vs sit down: have a seat は丁寧。sit down は直接的で場面によっては強く聞こえる。",
      englishDefinition:
        "A polite way to ask someone to sit down.",
      etymology:
        "have + 名詞句（a seat）で「席を取る」の意味を表す慣用句。",
    },
  ],
  // good luck (70184)
  [
    70184,
    {
      coreImage:
        "相手の挑戦に対して「成功を祈る」短い激励表現がコアイメージ。感情的支援として機能する。",
      usage:
        "「Good luck on your test.」のように行為を続ける形が自然。親しい相手には「You got this.」も併用される。",
      synonymDifference:
        "good luck vs break a leg: 前者は一般的。後者は主に舞台文脈の慣用的激励。",
      englishDefinition:
        "A phrase used to wish someone success.",
      etymology:
        "good（良い）+ luck（運）による基本的な祈願表現。",
    },
  ],
  // well done (70185)
  [
    70185,
    {
      coreImage:
        "結果に対して「よくできた」と成果を認める評価表現がコアイメージ。短くても達成感を強く伝えられる。",
      usage:
        "宿題・試験・発表の後に「Well done!」で使う。ややフォーマル寄りの賞賛として教育場面で使いやすい。",
      synonymDifference:
        "well done vs good job: どちらも称賛だが、well done は結果評価、good job は行為全体の努力評価にも使いやすい。",
      englishDefinition:
        "An expression used to praise someone's achievement.",
      etymology:
        "well（うまく）+ done（なされた）からなる評価句。",
    },
  ],
  // be careful (70186)
  [
    70186,
    {
      coreImage:
        "危険を避けるために「注意して行動して」と促す安全喚起表現がコアイメージ。",
      usage:
        "「Be careful on the stairs.」のように具体場所を続けると明確。別れ際の一言としても使える。",
      synonymDifference:
        "be careful vs take care: be careful は具体的注意。take care はより広い気遣い表現。",
      englishDefinition:
        "A phrase used to warn someone to avoid danger.",
      etymology:
        "be + careful（注意深い）による命令文。",
    },
  ],
  // right away (70187)
  [
    70187,
    {
      coreImage:
        "依頼に対して「すぐに・即座に」対応することを示す時間副詞句がコアイメージ。",
      usage:
        "「I'll do it right away.」で即時対応を約束できる。口語では「right now」「immediately」と近いが語調が異なる。",
      synonymDifference:
        "right away vs immediately vs right now: right away は口語で自然。immediately はよりフォーマル。right now は即時性を強く押し出す。",
      englishDefinition:
        "Immediately; without delay.",
      etymology:
        "right（まさに）+ away（すぐに離れて行動へ）による副詞句。",
    },
  ],
  // all right (70188)
  [
    70188,
    {
      coreImage:
        "了承・同意・問題なしを示す多機能応答語がコアイメージ。会話の合意形成をスムーズに進める。",
      usage:
        "「All right, let's go.」「Are you all right?」など品詞・機能が広い。綴りは all right が正式、alright は口語で使われることがある。",
      synonymDifference:
        "all right vs okay: ほぼ同義だが、all right の方がやや丁寧に響くことがある。",
      englishDefinition:
        "A phrase used to show agreement, acceptance, or that something is okay.",
      etymology:
        "all（完全に）+ right（正しい）からなる句が応答語化したもの。",
    },
  ],
  // sounds fun (70189)
  [
    70189,
    {
      coreImage:
        "提案を受けて「楽しそう」と前向き評価を返す反応表現がコアイメージ。参加意思を柔らかく示せる。",
      usage:
        "「That sounds fun.」で提案への肯定反応。より強く賛成するなら「That sounds great.」を使う。",
      synonymDifference:
        "sounds fun vs sounds good: sounds fun は楽しさ重視。sounds good は一般的な了承。",
      englishDefinition:
        "A response meaning an idea or plan seems enjoyable.",
      etymology:
        "sound（〜のように思える）+ fun（楽しい）による評価構文。",
    },
  ],
  // no thanks (70190)
  [
    70190,
    {
      coreImage:
        "相手の申し出を丁寧に断る否定応答がコアイメージ。関係を壊さず拒否を伝える定型。",
      usage:
        "「No thanks, I'm full.」「No, thank you.」の形で使う。笑顔・語調を柔らかくすると自然。",
      synonymDifference:
        "no thanks vs no: no thanks は丁寧な拒否。no は直接的で、場面によって強く響く。",
      englishDefinition:
        "A polite way to decline an offer.",
      etymology:
        "no（否定）+ thanks（感謝）で「ありがたいが不要」を表す慣用句。",
    },
  ],
  // good night (70251)
  [
    70251,
    {
      coreImage:
        "別れ際や就寝前に会話を締める夜の挨拶がコアイメージ。会話開始ではなく終了側で使うのが基本。",
      usage:
        "「Good night. See you tomorrow.」のように締めの一言として使う。会った直後の挨拶は通常「Good evening」。",
      synonymDifference:
        "good night vs good evening: good night は別れ・就寝前。good evening は会ったときの挨拶。",
      englishDefinition:
        "A phrase used when leaving at night or before going to sleep.",
      etymology:
        "good + night の定型挨拶。時間帯挨拶の中でも終了機能が強い。",
    },
  ],
  // you too (70252)
  [
    70252,
    {
      coreImage:
        "相手の祈念・挨拶をそのまま返す「相互応答」の短縮表現がコアイメージ。",
      usage:
        "「Have a nice day.」「You too!」のように、相手の言葉を簡潔に返礼する場面で使う。",
      synonymDifference:
        "you too vs same to you: どちらも返礼だが、you too の方が日常会話で自然。",
      englishDefinition:
        "A short reply meaning the same wish is returned to the other person.",
      etymology:
        "you + too（あなたにも）からなる省略応答。",
    },
  ],
  // I am sorry (70253)
  [
    70253,
    {
      coreImage:
        "自分の遅れ・失敗に対して謝罪を明示する基本文がコアイメージ。責任を受け止める姿勢を示す。",
      usage:
        "「I'm sorry for the delay.」「I'm sorry I'm late.」のように理由を続けると誠意が伝わる。",
      synonymDifference:
        "I'm sorry vs sorry: 前者は主語付きでより明確。後者は口語で軽い場面にも使える。",
      englishDefinition:
        "A sentence used to apologize and express regret.",
      etymology:
        "be 動詞 + sorry による謝罪の基本構文。",
    },
  ],
  // no way (70254)
  [
    70254,
    {
      coreImage:
        "驚き・強い否定を瞬時に示す口語反応がコアイメージ。事実の受け入れがたい気持ちを表す。",
      usage:
        "「No way! Really?」のように驚きとセットで使われる。フォーマル場面では避けるのが無難。",
      synonymDifference:
        "no way vs impossible: no way は会話的で感情が強い。impossible は内容判断としてより中立。",
      englishDefinition:
        "An informal exclamation meaning strong disbelief or refusal.",
      etymology:
        "否定 no + way（道筋）から派生した口語強調表現。",
    },
  ],
  // right here (70255)
  [
    70255,
    {
      coreImage:
        "位置を「まさにここ」と強く示す副詞句がコアイメージ。待機場所の明示に有効。",
      usage:
        "「Wait right here.」のように命令・依頼文で使う。here より限定性が高い。",
      synonymDifference:
        "right here vs here: right here は位置強調。here は一般的な場所提示。",
      englishDefinition:
        "Exactly at this place.",
      etymology:
        "right（まさに）+ here（ここ）の強調句。",
    },
  ],
  // not yet (70256)
  [
    70256,
    {
      coreImage:
        "完了していない状態を「まだ〜ない」で示す時間否定がコアイメージ。",
      usage:
        "「I'm not ready yet.」のように現在時点で未完了を表す。動作継続の見込みを含むことが多い。",
      synonymDifference:
        "not yet vs never: not yet は将来可能性あり。never は恒常的否定。",
      englishDefinition:
        "Used to say that something has not happened up to now.",
      etymology:
        "not（否定）+ yet（今までに）の組み合わせ。",
    },
  ],
  // just kidding (70257)
  [
    70257,
    {
      coreImage:
        "直前の発言が本気ではないと明示する冗談解除フレーズがコアイメージ。誤解回避に使う。",
      usage:
        "発言後に「Just kidding!」を添えて場を和らげる。書き言葉では「I'm joking.」がより明確。",
      synonymDifference:
        "just kidding vs I'm joking: どちらも同義だが、just kidding の方が会話的で軽い。",
      englishDefinition:
        "An informal phrase meaning what was said was a joke.",
      etymology:
        "kid（からかう）から派生した口語表現。",
    },
  ],
  // sounds great (70258)
  [
    70258,
    {
      coreImage:
        "提案に対して強い肯定を返す評価表現がコアイメージ。参加意欲を明るく示せる。",
      usage:
        "「That sounds great.」で計画への賛同を示す。より控えめなら sounds good。",
      synonymDifference:
        "sounds great vs sounds good: great はより強いポジティブ評価。",
      englishDefinition:
        "A response meaning a plan or idea sounds very good.",
      etymology:
        "sound + 形容詞による評価構文。",
    },
  ],
  // try again (70259)
  [
    70259,
    {
      coreImage:
        "失敗後に再挑戦を促す励まし命令がコアイメージ。学習・操作指示で頻出。",
      usage:
        "「Please try again.」で丁寧に再試行を促す。システムメッセージにも多用される。",
      synonymDifference:
        "try again vs retry: 前者は自然な会話・表示文。retry は技術的・UI語として簡潔。",
      englishDefinition:
        "A phrase asking someone to make another attempt.",
      etymology:
        "try（試す）+ again（再び）の基本連語。",
    },
  ],
  // I am ready (70260)
  [
    70260,
    {
      coreImage:
        "行動開始に必要な準備が整った状態を宣言する文がコアイメージ。開始合図として機能する。",
      usage:
        "「I'm ready to go.」「I'm ready now.」のように使い、to 不定詞で目的行動を明示できる。",
      synonymDifference:
        "I'm ready vs I'm set: どちらも準備完了だが、I'm set はより口語的で軽い。",
      englishDefinition:
        "A sentence meaning one is prepared to start or proceed.",
      etymology:
        "be 動詞 + ready（準備ができた）の基本述語。",
    },
  ],
  // see you soon (70301)
  [
    70301,
    {
      coreImage:
        "再会時期が近いことを示しつつ別れる表現がコアイメージ。関係継続を前向きに示す。",
      usage:
        "別れ際に「See you soon.」と使う。時期を具体化するなら「See you tomorrow.」などへ置換。",
      synonymDifference:
        "see you soon vs see you later: soon は比較的近い再会を示唆。later はより広い時間幅。",
      englishDefinition:
        "A parting phrase meaning you expect to meet again soon.",
      etymology:
        "see you + soon の時間副詞付き定型句。",
    },
  ],
  // how's it going (70302)
  [
    70302,
    {
      coreImage:
        "近況を気軽に尋ねる口語挨拶がコアイメージ。厳密な報告より軽い社交的やり取りに向く。",
      usage:
        "返答は「Good.」「Not bad.」など短くて十分。初対面よりは既知関係で自然。",
      synonymDifference:
        "how's it going vs how are you: 前者はよりカジュアル。後者は中立で場面を選びにくい。",
      englishDefinition:
        "An informal greeting asking how someone is doing.",
      etymology:
        "How is it going? の縮約形（how's）として口語定着。",
    },
  ],
  // my name is (70303)
  [
    70303,
    {
      coreImage:
        "自己紹介で名前を提示する基本構文がコアイメージ。初対面の最初に使う最重要フレーズ。",
      usage:
        "「My name is Mika.」が標準。口語では「I'm Mika.」の方が自然な場面も多い。",
      synonymDifference:
        "my name is vs I'm: 前者は教科書的で丁寧。後者は日常会話で自然。",
      englishDefinition:
        "A phrase used to introduce yourself by name.",
      etymology:
        "所有構文 my name + be による自己提示の基本文。",
    },
  ],
  // I am here (70304)
  [
    70304,
    {
      coreImage:
        "現在位置を明確に伝える存在表現がコアイメージ。待ち合わせ連絡で高頻度。",
      usage:
        "「I'm here at the station.」のように場所句を続けると実用的。到着通知にも使える。",
      synonymDifference:
        "I'm here vs I've arrived: 前者は現在位置の提示。後者は到着完了をより強く示す。",
      englishDefinition:
        "A sentence used to indicate your present location.",
      etymology:
        "be 動詞 + here による位置提示の基本構文。",
    },
  ],
  // wait for me (70305)
  [
    70305,
    {
      coreImage:
        "相手に自分を待ってもらう依頼表現がコアイメージ。合流タイミング調整で使う。",
      usage:
        "「Please wait for me.」のように丁寧語を添えると自然。for me を落とすと意味が曖昧になりやすい。",
      synonymDifference:
        "wait for me vs hold on: 前者は「私を待つ」対象明示。hold on は一般的な一時停止依頼。",
      englishDefinition:
        "A request asking someone not to leave until you arrive.",
      etymology:
        "wait for + 人 の基本文型。",
    },
  ],
  // good job (70306)
  [
    70306,
    {
      coreImage:
        "努力や成果を短く認める称賛表現がコアイメージ。相手のモチベーション維持に効果的。",
      usage:
        "「Good job on your test.」のように対象を続けると具体的になる。教育・職場で幅広く使える。",
      synonymDifference:
        "good job vs well done: good job は口語で広く使える。well done はややフォーマルで結果評価寄り。",
      englishDefinition:
        "A phrase used to praise someone's work or performance.",
      etymology:
        "good + job の評価句として定着。",
    },
  ],
  // no clue (70307)
  [
    70307,
    {
      coreImage:
        "情報・手掛かりがまったくない状態を強く示す口語名詞句がコアイメージ。",
      usage:
        "「I have no clue.」で「全然分からない」を自然に表せる。カジュアル会話で頻出。",
      synonymDifference:
        "no clue vs no idea: ほぼ同義。no clue の方がやや口語的でくだけた響き。",
      englishDefinition:
        "An informal expression meaning no knowledge or idea.",
      etymology:
        "clue（手掛かり）を否定する形で意味を強調した口語句。",
    },
  ],
  // come in (70308)
  [
    70308,
    {
      coreImage:
        "外から内へ入る移動を促す句動詞がコアイメージ。招き入れるときの最短指示。",
      usage:
        "「Come in, please.」の形で使う。状況によっては「enter」より自然で柔らかい。",
      synonymDifference:
        "come in vs enter: come in は口語で自然。enter は書き言葉・案内表示でフォーマル。",
      englishDefinition:
        "To enter a room or building.",
      etymology:
        "come（来る）+ in（内側へ）の句動詞。",
    },
  ],
  // sit down (70309)
  [
    70309,
    {
      coreImage:
        "立位から座位へ移行する動作を直接示す句動詞がコアイメージ。",
      usage:
        "「Sit down here.」で場所指定を追加できる。丁寧にするなら「Please sit down.」。",
      synonymDifference:
        "sit down vs have a seat: 前者は直接指示。後者はより丁寧で柔らかい依頼。",
      englishDefinition:
        "To move into a sitting position.",
      etymology:
        "sit + down の方向副詞付加で動作完了を示す。",
    },
  ],
  // stand up (70310)
  [
    70310,
    {
      coreImage:
        "座位から立位へ移る動作を示す句動詞がコアイメージ。授業・指示場面で頻出。",
      usage:
        "「Please stand up.」が基本。比喩で「stand up for ...（〜を擁護する）」の別義もある。",
      synonymDifference:
        "stand up vs get up: stand up は姿勢変化。get up は起床・席を立つなどより広い。",
      englishDefinition:
        "To rise to a standing position.",
      etymology:
        "stand + up の句動詞化。",
    },
  ],
  // how about you (70351)
  [70351, { coreImage: "相手の返答を受けて話題を相手側へ返す「逆質問」フレーズがコアイメージ。会話の往復を自然に作る。", usage: "「I'm good. How about you?」のように自分の返答の後に続ける。短いやり取りで非常に頻出。", synonymDifference: "how about you vs and you: どちらも自然だが、how about you の方が標準的で丁寧寄り。", englishDefinition: "A phrase used to ask for the other person's answer in return.", etymology: "how about + you の疑問構文が会話定型として固定化した表現。" }],
  // I am okay (70352)
  [70352, { coreImage: "体調・状況が「問題ない範囲」であると伝える中立返答がコアイメージ。", usage: "「I'm okay now.」のように使い、深刻ではないが万全でもない状態を表せる。", synonymDifference: "I'm okay vs I'm fine: okay はやや口語で軽い。fine は標準的で中立。", englishDefinition: "A sentence meaning one is alright or not in trouble.", etymology: "be 動詞 + okay（許容可能）による口語的基本構文。" }],
  // nice day (70353)
  [70353, { coreImage: "天候や日全体を前向きに評価する短い名詞句がコアイメージ。", usage: "「It's a nice day today.」で天気の話題を始める定番。small talk の導入に最適。", synonymDifference: "nice day vs beautiful day: beautiful day の方がより強い賞賛。", englishDefinition: "A phrase describing the day as pleasant.", etymology: "nice + day の基礎連語。" }],
  // I am full (70354)
  [70354, { coreImage: "食事量が十分で「これ以上食べられない」状態を表すのがコアイメージ。", usage: "断りで「Thanks, I'm full.」が定番。満腹を理由に丁寧に断れる。", synonymDifference: "I'm full vs I'm stuffed: stuffed はより口語で強い満腹感。", englishDefinition: "A sentence meaning one has eaten enough and is no longer hungry.", etymology: "be 動詞 + full（満たされた）の比喩的使用。" }],
  // look here (70355)
  [70355, { coreImage: "注意を一点へ向ける「ここを見て」の指示がコアイメージ。", usage: "「Look here, please.」で視線誘導に使う。場面によっては強く聞こえるため please 併用が安全。", synonymDifference: "look here vs look at this: 前者は位置指示、後者は対象物指示が中心。", englishDefinition: "A phrase used to direct someone's attention to a place or point.", etymology: "look + 副詞 here の基本命令構文。" }],
  // over here (70356)
  [70356, { coreImage: "話し手の近くの位置へ相手を導く場所副詞句がコアイメージ。", usage: "「Come over here.」の形で移動を促す。呼びかけだけで「Over here!」も可能。", synonymDifference: "over here vs here: over here は位置をより明示・強調する。", englishDefinition: "At or to this place near the speaker.", etymology: "over + here の位置強調連語。" }],
  // right there (70357)
  [70357, { coreImage: "位置を「ちょうどそこ」と細かく指定する副詞句がコアイメージ。", usage: "「Put it right there.」で置き場所を正確に指示できる。", synonymDifference: "right there vs there: right を入れると位置特定が強くなる。", englishDefinition: "Exactly at that place.", etymology: "right（まさに）+ there（そこ）による強調句。" }],
  // come with me (70358)
  [70358, { coreImage: "相手に同行を促す招きのフレーズがコアイメージ。", usage: "「Come with me to the store.」のように目的地を続けると自然。命令口調になるため語調調整が重要。", synonymDifference: "come with me vs follow me: 前者は同行提案、後者は先導して後をついて来てもらうニュアンス。", englishDefinition: "A phrase inviting someone to go together with the speaker.", etymology: "come + with + me の基本移動構文。" }],
  // follow me (70359)
  [70359, { coreImage: "話し手を先頭として相手に追従を求める先導表現がコアイメージ。", usage: "案内で「Follow me, please.」が定番。空港・店内・受付などで頻出。", synonymDifference: "follow me vs come with me: follow me は「後について来る」関係が明確。", englishDefinition: "A phrase asking someone to come after the speaker.", etymology: "follow（後に続く）+ me の命令構文。" }],
  // take this (70360)
  [70360, { coreImage: "相手に物を手渡して受け取らせる直接指示がコアイメージ。", usage: "「Take this with you.」で持参依頼まで含められる。丁寧化するなら「Please take this.」。", synonymDifference: "take this vs have this: take this は受け取り行為を直接指示。have this は提案・提供寄り。", englishDefinition: "A phrase used when giving something to someone.", etymology: "take + 指示代名詞 this による受け渡し構文。" }],
  // this is it (70401)
  [70401, { coreImage: "探していた対象や決定点に到達した瞬間を示す強調表現がコアイメージ。", usage: "「This is it!」で「これだ」と発見・決意を示す。場面依存で意味幅が広い。", synonymDifference: "this is it vs that's it: 前者は発見・到達、後者は終了・十分の意味でも使われる。", englishDefinition: "An exclamation meaning this is the one or the moment.", etymology: "指示文 this is + 代名詞 it が感嘆表現化したもの。" }],
  // here we go (70402)
  [70402, { coreImage: "行動開始の合図として場のテンポを上げる掛け声がコアイメージ。", usage: "「Here we go.」で開始を宣言できる。文脈によっては困った状況の再開を示す皮肉にもなる。", synonymDifference: "here we go vs let's go: 前者は開始アナウンス、後者は移動・行動への直接提案。", englishDefinition: "An expression used when starting something.", etymology: "here（ここで）+ we go（行く）による開始の定型句。" }],
  // look at this (70403)
  [70403, { coreImage: "対象物へ視線を集める即時注意喚起がコアイメージ。", usage: "「Look at this photo.」のように対象名詞を続ける。共有・驚きの導入で多用。", synonymDifference: "look at this vs check this out: 後者はよりカジュアルで強い興味喚起。", englishDefinition: "A phrase used to ask someone to look at something.", etymology: "look at + 指示代名詞 this の基本命令構文。" }],
  // all set (70404)
  [70404, { coreImage: "準備が完全に整った状態を短く示す完了表現がコアイメージ。", usage: "「Are you all set?」で準備確認。「I'm all set.」で準備完了返答に使える。", synonymDifference: "all set vs ready: ほぼ同義だが、all set はより口語で「全部整った」感が強い。", englishDefinition: "Fully prepared; ready to start.", etymology: "all（すべて）+ set（整った）からなる口語連語。" }],
  // I am done (70405)
  [70405, { coreImage: "作業・課題の完了を明確に宣言する文がコアイメージ。", usage: "「I'm done with homework.」のように with + 名詞で完了対象を示す。", synonymDifference: "I'm done vs I finished: 前者は状態、後者は完了動作そのものを述べる。", englishDefinition: "A sentence meaning one has finished an activity.", etymology: "be 動詞 + done（完了状態）による状態表現。" }],
  // what's this (70406)
  [70406, { coreImage: "目の前の対象の正体を尋ねる基礎疑問がコアイメージ。", usage: "「What's this button for?」のように用途を続けると実用的。", synonymDifference: "what's this vs what is that: this は近い対象、that は距離や心理的距離のある対象。", englishDefinition: "A question asking what a nearby thing is.", etymology: "what is this の縮約疑問形。" }],
  // whose is this (70407)
  [70407, { coreImage: "所有者を特定する疑問構文がコアイメージ。", usage: "「Whose is this bag?」のように落とし物確認で頻出。所有格 whose の使い方が鍵。", synonymDifference: "whose is this vs who owns this: 前者が短く自然、後者は説明的。", englishDefinition: "A question asking who owns a particular object.", etymology: "疑問代名詞 whose（誰の）を用いた所有確認構文。" }],
  // speak up (70408)
  [70408, { coreImage: "声量を上げるよう促す句動詞がコアイメージ。聞き取り改善のための指示。", usage: "「Please speak up.」で丁寧に依頼できる。怒っている印象を避けるには please が有効。", synonymDifference: "speak up vs speak louder: 前者は慣用的で自然、後者はより直接的。", englishDefinition: "To speak more loudly so others can hear.", etymology: "speak + up（上へ）で音量上昇を示す句動詞。" }],
  // calm down (70409)
  [70409, { coreImage: "高ぶった感情を落ち着かせるよう促す句動詞がコアイメージ。緊張緩和に使う。", usage: "「Calm down and breathe.」のように具体行動を続けると実践的。場面によっては命令的に聞こえるため語調に注意。", synonymDifference: "calm down vs relax: calm down は興奮・怒りの沈静化。relax は一般的な緊張緩和。", englishDefinition: "To become or make someone less upset or excited.", etymology: "calm（落ち着いた）+ down（下げる）で感情低下を示す。" }],
  // wake up (70410)
  [70410, { coreImage: "睡眠状態から覚醒状態へ移ることを促す句動詞がコアイメージ。", usage: "「Wake up, it's late.」のように理由を続けると自然。比喩で「現実に気づけ」の意味にもなる。", synonymDifference: "wake up vs get up: wake up は目覚める、get up はベッドから起き上がる。", englishDefinition: "To stop sleeping and become awake.", etymology: "wake + up の句動詞化。" }],
  // all good (70451)
  [70451, { coreImage: "状況に問題がないことを簡潔に伝える口語返答がコアイメージ。", usage: "「All good here.」のように状態報告で使う。短く前向きな返答として便利。", synonymDifference: "all good vs no problem: 前者は状態確認返答、後者は依頼受諾・問題否定で使うことが多い。", englishDefinition: "An informal expression meaning everything is fine.", etymology: "all + good の省略的口語表現。" }],
  // my turn (70452)
  [70452, { coreImage: "順番が自分に来たことを示すターン管理表現がコアイメージ。", usage: "「It's my turn now.」の形でゲーム・会話・作業順で使う。", synonymDifference: "my turn vs your turn: 交互進行の対になる基本表現。", englishDefinition: "A phrase indicating it is now one's turn.", etymology: "所有格 my + 名詞 turn の基本構文。" }],
  // your turn (70453)
  [70453, { coreImage: "順番が相手に移ったことを示す指示表現がコアイメージ。", usage: "「It's your turn.」で次の行動者を明確化できる。", synonymDifference: "your turn vs go ahead: your turn は順番明示、go ahead は許可・開始促し。", englishDefinition: "A phrase indicating it is now the other person's turn.", etymology: "所有格 your + 名詞 turn の基本構文。" }],
  // this instant (70454)
  [70454, { coreImage: "遅延を許さない「今この瞬間」の強い即時性がコアイメージ。", usage: "「I need help this instant.」は緊急度が高い。柔らかくするなら right now。", synonymDifference: "this instant vs right now vs immediately: this instant は最も強い緊急性を帯びやすい。", englishDefinition: "At this very moment; immediately.", etymology: "指示詞 this + instant（瞬間）の強調句。" }],
  // just now (70455)
  [70455, { coreImage: "ごく直前の時点「たった今」を示す時間副詞句がコアイメージ。", usage: "「I saw him just now.」で直近過去を表す。英語圏差で現在完了との相性が異なる点に注意。", synonymDifference: "just now vs recently: just now は直前、recently は比較的最近の広い範囲。", englishDefinition: "A moment ago; very recently.", etymology: "just（ちょうど）+ now（今）による時間強調句。" }],
  // watch this (70456)
  [70456, { coreImage: "これから起こることへの注意を引く予告表現がコアイメージ。", usage: "「Watch this trick.」のように見せたい対象を続ける。驚き演出と相性が良い。", synonymDifference: "watch this vs look at this: watch は動き・過程、look は静的対象への視線誘導。", englishDefinition: "A phrase asking someone to pay attention to what will be shown.", etymology: "watch（注視する）+ this の命令表現。" }],
  // help out (70457)
  [70457, { coreImage: "通常の help より「手が足りない場面で助力する」ニュアンスがコアイメージ。", usage: "「Can you help out?」のように臨時協力を頼む場面で使う。", synonymDifference: "help out vs help: help out は補助的・一時的支援の響きが強い。", englishDefinition: "To give practical assistance, often temporarily.", etymology: "help + out（外へ）で「困難から助け出す」感覚が加わる句動詞。" }],
  // move on (70458)
  [70458, { coreImage: "現在の話題・作業を終えて次へ進む推進表現がコアイメージ。", usage: "会議で「Let's move on.」が定番。過去を引きずらず進む比喩でも使う。", synonymDifference: "move on vs continue: move on は切替を伴う前進、continue は同じ対象の継続。", englishDefinition: "To proceed to the next thing or stage.", etymology: "move + on による前進を表す句動詞。" }],
  // try it (70459)
  [70459, { coreImage: "相手に実行を促す「まず試してみて」の実践誘導がコアイメージ。", usage: "「Try it yourself.」で自力実践を促せる。学習・操作説明で有用。", synonymDifference: "try it vs do it: try は試行、do は実行完了寄り。", englishDefinition: "A phrase encouraging someone to attempt something.", etymology: "try + 目的語 it の基本命令構文。" }],
  // good enough (70460)
  [70460, { coreImage: "完璧ではないが要件を満たす「十分に良い」基準判断がコアイメージ。", usage: "「This is good enough.」のように使い、過度な修正を止める判断に使える。", synonymDifference: "good enough vs perfect: good enough は実用基準で十分、perfect は理想的完全性。", englishDefinition: "Adequate for the purpose, though not perfect.", etymology: "good + enough（十分に）の評価連語。" }],
  // oops (70501)
  [70501, { coreImage: "小さなミスやうっかりを軽く認める間投詞がコアイメージ。", usage: "「Oops, I forgot.」のように失敗直後に使う。軽いトーンで場を和らげる。", synonymDifference: "oops vs sorry: oops は自己ミスの軽い反応。sorry は相手への謝意を示す。", englishDefinition: "An exclamation used after a small mistake.", etymology: "感嘆音から発達した口語間投詞。" }],
  // no big deal (70502)
  [70502, { coreImage: "問題の重大性を下げて相手を安心させる緩和表現がコアイメージ。", usage: "「It's no big deal.」で「気にしないで」を自然に伝える。", synonymDifference: "no big deal vs it's fine: 前者は重要性の低さを強調、後者は受容を示す。", englishDefinition: "An expression meaning something is not important or serious.", etymology: "big deal（重大事）を否定して軽微さを示す口語句。" }],
  // that's fine (70503)
  [70503, { coreImage: "相手案を受け入れる許容返答がコアイメージ。穏やかな同意に使える。", usage: "「That's fine with me.」で同意を明確化。条件付き同意にも応用可能。", synonymDifference: "that's fine vs that's okay: ほぼ同義。fine の方がやや丁寧に響くことがある。", englishDefinition: "A phrase meaning something is acceptable.", etymology: "that is + fine の評価構文。" }],
  // immediately (70504)
  [70504, { coreImage: "遅延なく実行する「即時性」を明示する副詞がコアイメージ。", usage: "「I'll do it immediately.」で迅速対応を約束できる。書き言葉・業務連絡でも自然。", synonymDifference: "immediately vs right away: immediately はよりフォーマル。right away は口語で自然。", englishDefinition: "Without any delay; at once.", etymology: "im- + mediate（間に入る）で「間を置かず」が原義。" }],
  // just wait (70505)
  [70505, { coreImage: "短時間の待機を直接求める命令表現がコアイメージ。", usage: "「Just wait here.」のように場所指定を続けると明確。語調次第で強く聞こえる。", synonymDifference: "just wait vs wait a moment: 後者の方が丁寧で柔らかい。", englishDefinition: "A direct phrase telling someone to wait.", etymology: "just（ほんの）+ wait（待つ）の命令句。" }],
  // come along (70506)
  [70506, { coreImage: "相手を同行へ軽く誘う句動詞がコアイメージ。命令より招待に近い響き。", usage: "「Come along with us.」でグループ同行を促せる。", synonymDifference: "come along vs come with: come along は軽い誘い、come with はより直接的な同行要請。", englishDefinition: "To accompany someone; to go with.", etymology: "come + along（一緒に進む）による句動詞。" }],
  // sit tight (70507)
  [
    70507,
    {
      coreImage:
        "「その場を動かず待つ」をやや口語的に表す句動詞がコアイメージ。",
      usage:
        "「Sit tight for a minute.」で待機依頼ができる。比喩的に「状況が整うまで待つ」意味にも使う。",
      synonymDifference:
        "sit tight vs wait: sit tight の方が口語的で「動かず待つ」含意が強い。",
      englishDefinition:
        "To stay where you are and wait patiently.",
      etymology:
        "sit（座る）+ tight（しっかり）の慣用句。",
    },
  ],
  // hang back (70508)
  [
    70508,
    {
      coreImage:
        "前へ出ず後方で控える動きを示す句動詞がコアイメージ。",
      usage:
        "「Please hang back here.」で位置を保った待機を依頼できる。慎重に距離を取るニュアンスもある。",
      synonymDifference:
        "hang back vs stay: hang back は後方で控える含意が強い。stay は一般的な滞在。",
      englishDefinition:
        "To stay behind or remain at a distance.",
      etymology:
        "hang（とどまる）+ back（後ろへ）で位置後退を表す句動詞。",
    },
  ],
  // all clear (70509)
  [
    70509,
    {
      coreImage:
        "危険・問題が解消した状態を「安全・異常なし」と示す報告表現がコアイメージ。",
      usage:
        "「It's all clear now.」で確認完了を伝えられる。軍事・避難文脈でも一般会話でも使われる。",
      synonymDifference:
        "all clear vs no problem: all clear は安全確認の完了、no problem は一般的問題否定。",
      englishDefinition:
        "A phrase indicating that there is no danger or issue.",
      etymology:
        "all（すべて）+ clear（問題なし）からなる報告句。",
    },
  ],
  // take care now (70510)
  [
    70510,
    {
      coreImage:
        "別れ際に相手の安全を念押しする気遣い表現がコアイメージ。take care の温かい派生形。",
      usage:
        "「Take care now.」は口語で親しみある締め。文脈により now は語調調整の役割。", 
      synonymDifference:
        "take care now vs take care: 意味はほぼ同じだが、now 付きは口語的で柔らかい終止感が出る。",
      englishDefinition:
        "A friendly parting phrase expressing concern for someone's safety.",
      etymology:
        "take care に副詞 now が添えられた会話終止表現。",
    },
  ],
  // you got it (70552)
  [
    70552,
    {
      coreImage:
        "依頼・確認に対して「了解・任せて」を即答する口語応答がコアイメージ。",
      usage:
        "「Can you do it?」「You got it.」のように使い、前向きな受諾を示す。",
      synonymDifference:
        "you got it vs sure vs no problem: いずれも受諾だが、you got it は勢いがあり協力姿勢が強く伝わる。",
      englishDefinition:
        "An informal response meaning 'I understand' or 'I can do it.'",
      etymology:
        "get it（理解する）の完了形が応答句化した口語表現。",
    },
  ],
  // gotcha (70553)
  [
    70553,
    {
      coreImage:
        "「分かった」「了解した」を短く示す非常に口語的な応答がコアイメージ。",
      usage:
        "友人間で「Gotcha.」と使う。フォーマル場面では「I understand.」が安全。",
      synonymDifference:
        "gotcha vs got it: gotcha の方がさらに砕けており、場面選択が必要。",
      englishDefinition:
        "A very informal way to say 'I understand.'",
      etymology:
        "got you の音変化・口語短縮形。",
    },
  ],
  // all right then (70557)
  [
    70557,
    {
      coreImage:
        "会話の節目で「それでは」と次行動へ移る接続的フレーズがコアイメージ。",
      usage:
        "「All right then, let's go.」のように切替合図として使う。議論終了・移動開始で便利。",
      synonymDifference:
        "all right then vs okay then: ほぼ同義。前者はやや丁寧で落ち着いた響き。",
      englishDefinition:
        "A phrase used to transition to the next action or conclusion.",
      etymology:
        "all right に接続副詞 then を加えた談話標識。",
    },
  ],
  // hold tight (70558)
  [
    70558,
    {
      coreImage:
        "短時間「しっかり待つ」よう促す口語句がコアイメージ。物理的にも比喩的にも使える。",
      usage:
        "「Hold tight a minute.」で待機依頼。交通・案内・サポート文脈で頻出。",
      synonymDifference:
        "hold tight vs hold on: どちらも待機依頼だが、hold tight はやや口語で勢いがある。",
      englishDefinition:
        "An informal phrase meaning wait and stay calm.",
      etymology:
        "hold（保持する）+ tight（しっかり）からなる慣用句。",
    },
  ],
  // come through (70559)
  [
    70559,
    {
      coreImage:
        "文脈に応じて「通って来る」「期待に応える」など結果到達を示す句動詞がコアイメージ。",
      usage:
        "この教材例文では「来られる」の意味（Can you come through later?）。文脈で意味が変わるため句全体で覚える。",
      synonymDifference:
        "come through vs come over: 前者は通過・達成ニュアンスを含み得る。come over は訪問に焦点。",
      englishDefinition:
        "To arrive, pass through, or succeed in delivering what is needed, depending on context.",
      etymology:
        "come + through（通過して）に由来する多義的句動詞。",
    },
  ],
  // suit yourself (70560)
  [
    70560,
    {
      coreImage:
        "相手の自由選択を許容する「好きにして」の定型句がコアイメージ。語調で肯定にも突き放しにもなる。",
      usage:
        "意見不一致時に「Suit yourself.」と使う。冷たく聞こえることがあるため注意。",
      synonymDifference:
        "suit yourself vs up to you: 前者は突き放し感が出やすい。up to you は中立的。",
      englishDefinition:
        "A phrase meaning the other person may do as they wish.",
      etymology:
        "suit（都合が合う）+ yourself の再帰構文。",
    },
  ],
  // heads up (70561)
  [
    70561,
    {
      coreImage:
        "注意喚起や事前通知を短く伝える口語フレーズがコアイメージ。",
      usage:
        "警告で「Heads up!」、予告で「Just a heads-up ...」の形が定番。",
      synonymDifference:
        "heads up vs watch out: watch out は危険回避の警告が強い。heads up は予告・注意喚起にも広く使う。",
      englishDefinition:
        "An informal warning or advance notice.",
      etymology:
        "頭を上げて注意せよ、という身体動作指示から慣用化。",
    },
  ],
  // sounds fair (70564)
  [
    70564,
    {
      coreImage:
        "提案内容を「公平・妥当」と評価して受け入れる応答がコアイメージ。",
      usage:
        "「That sounds fair.」で条件交渉の合意を示せる。金額・役割分担の場面で有効。",
      synonymDifference:
        "sounds fair vs sounds good: fair は公平性評価、good は全般的肯定。",
      englishDefinition:
        "A response meaning the proposal seems fair.",
      etymology:
        "sound + fair の評価構文。",
    },
  ],
  // no problem at all (70565)
  [
    70565,
    {
      coreImage:
        "問題が本当にないことを強調して安心させる返答がコアイメージ。",
      usage:
        "依頼受諾・謝罪受けに「No problem at all.」が使える。at all が強調の働き。", 
      synonymDifference:
        "no problem at all vs no worries: 前者はより明示的、後者はややカジュアルで柔らかい。",
      englishDefinition:
        "An emphatic way to say there is absolutely no problem.",
      etymology:
        "no problem に強調句 at all を追加した形。",
    },
  ],
  // give me a sec (70566)
  [
    70566,
    {
      coreImage:
        "短時間の待機をカジュアルに求める省略表現がコアイメージ（sec = second）。",
      usage:
        "「Give me a sec.」は友人間で自然。ビジネスでは「One moment, please.」が安全。",
      synonymDifference:
        "give me a sec vs just a moment: 前者は口語、省略的。後者は丁寧で中立。",
      englishDefinition:
        "An informal request for a very short wait.",
      etymology:
        "second の短縮 sec を用いた口語句。",
    },
  ],
  // my bad there (70567)
  [
    70567,
    {
      coreImage:
        "自分のミスを軽く認める口語謝罪がコアイメージ。責任受容を短く示せる。",
      usage:
        "「My bad.」単独で使える。フォーマルには「That was my mistake.」へ置換。", 
      synonymDifference:
        "my bad vs I'm sorry: my bad は軽い口語謝罪。I'm sorry は汎用でより丁寧。",
      englishDefinition:
        "An informal expression admitting one's mistake.",
      etymology:
        "my（私の）+ bad（悪い点）からなる米口語表現。",
    },
  ],
  // take your pick (70568)
  [
    70568,
    {
      coreImage:
        "複数選択肢から自由に選んでもらう促し表現がコアイメージ。",
      usage:
        "「Take your pick.」で相手に選択権を渡せる。メニュー・商品提示で便利。",
      synonymDifference:
        "take your pick vs choose one: 前者は慣用的で柔らかい。後者は直接的。",
      englishDefinition:
        "A phrase inviting someone to choose whichever they like.",
      etymology:
        "pick（選ぶ）を用いた慣用命令句。",
    },
  ],
  // nice one (70569)
  [
    70569,
    {
      coreImage:
        "相手の行動・発言を軽快に褒める短い称賛がコアイメージ。",
      usage:
        "主に英口語で「Nice one!」を使う。友人間・スポーツ場面で頻出。",
      synonymDifference:
        "nice one vs good job: nice one はより口語的で短い称賛。",
      englishDefinition:
        "An informal phrase used to praise someone briefly.",
      etymology:
        "nice + one（やったこと）からなる口語評価句。",
    },
  ],
  // way to go (70570)
  [
    70570,
    {
      coreImage:
        "成果達成を勢いよく称える励まし表現がコアイメージ。",
      usage:
        "成功直後に「Way to go!」で使う。モチベーションを上げる場面で有効。",
      synonymDifference:
        "way to go vs well done: 前者はより口語的で勢いがある称賛。",
      englishDefinition:
        "An enthusiastic expression of praise.",
      etymology:
        "go（進む）を称賛に転用した米口語表現。",
    },
  ],
  // just in case (70571)
  [
    70571,
    {
      coreImage:
        "万一に備える予防的意図を示す接続句がコアイメージ。",
      usage:
        "「Bring cash just in case.」のように予備行動を促す。文頭・文末どちらでも使える。",
      synonymDifference:
        "just in case vs in case: 前者は副詞的に「念のため」。後者は接続詞的に条件節を導くことが多い。",
      englishDefinition:
        "A phrase meaning as a precaution in case something happens.",
      etymology:
        "case（場合）を用いた予防表現の定型。",
    },
  ],
  // hang in there (70572)
  [
    70572,
    {
      coreImage:
        "困難な状況で「持ちこたえて」と励ます支援表現がコアイメージ。",
      usage:
        "落ち込んだ相手に「Hang in there.」と使う。具体的助言前の心理的サポートに有効。",
      synonymDifference:
        "hang in there vs keep going: 前者は苦しい局面を耐える含意が強い。",
      englishDefinition:
        "An encouraging phrase meaning don't give up.",
      etymology:
        "hang（しがみつく）に比喩的継続の意味が加わった口語句。",
    },
  ],
  // good for you (70573)
  [
    70573,
    {
      coreImage:
        "相手の成果・選択を肯定する短い評価表現がコアイメージ。語調で賞賛にも皮肉にもなり得る。",
      usage:
        "文脈が前向きなら純粋な称賛として機能。誤解回避のため表情・声色が重要。",
      synonymDifference:
        "good for you vs nice work: 前者は相手にとって良いことへの評価、後者は作業成果への称賛。",
      englishDefinition:
        "A phrase used to acknowledge or praise someone's achievement.",
      etymology:
        "good + for you の評価句として慣用化。",
    },
  ],
  // my pleasure too (70574)
  [
    70574,
    {
      coreImage:
        "感謝への返答として「こちらこそ」を示す礼儀表現がコアイメージ。",
      usage:
        "「My pleasure.」が基本形。too を足すと相互感謝を強調できる。",
      synonymDifference:
        "my pleasure vs you're welcome: 前者はより丁寧で温かい印象。", 
      englishDefinition:
        "A polite response meaning you were happy to help.",
      etymology:
        "my + pleasure（喜び）で「喜んで」を表す定型応答。",
    },
  ],
  // I got this (70575)
  [
    70575,
    {
      coreImage:
        "自分が対応可能であることを力強く示す自己引受表現がコアイメージ。",
      usage:
        "「I got this.」で「任せて」を簡潔に伝える。協働場面で安心感を与える。",
      synonymDifference:
        "I got this vs I can do it: 前者は口語で自信表明、後者は一般的な能力表明。",
      englishDefinition:
        "An informal phrase meaning I can handle this.",
      etymology:
        "get の口語的「対処する」用法から発達した表現。",
    },
  ],
  // let's do this (70576)
  [
    70576,
    {
      coreImage:
        "行動開始への意欲を共有する掛け声がコアイメージ。チームの士気を上げる。",
      usage:
        "開始前に「Let's do this.」で使う。フォーマルには「Let's begin.」が無難。",
      synonymDifference:
        "let's do this vs let's start: 前者は熱量が高い。後者は中立。", 
      englishDefinition:
        "An enthusiastic phrase used to start an action together.",
      etymology:
        "let us + do this の短縮形が口語的定型となった。",
    },
  ],
  // all set now (70577)
  [
    70577,
    {
      coreImage:
        "直前の準備が完了したことを示す状態報告がコアイメージ。",
      usage:
        "「I'm all set now.」で「今は準備完了」を明確化。now が更新情報として機能。", 
      synonymDifference:
        "all set now vs ready now: ほぼ同義だが、all set の方が準備項目全体の完了感が強い。",
      englishDefinition:
        "A phrase indicating everything is now ready.",
      etymology:
        "all set に時間副詞 now を添えた完了報告形。",
    },
  ],
  // you first (70578)
  [
    70578,
    {
      coreImage:
        "順番を相手に譲る最短の礼儀表現がコアイメージ。",
      usage:
        "ドア・列・食事などで「You first.」を使う。丁寧化するなら「After you.」。", 
      synonymDifference:
        "you first vs after you: 後者の方が丁寧で柔らかい。", 
      englishDefinition:
        "A short phrase meaning the other person should go first.",
      etymology:
        "代名詞 you + first（最初に）による省略命令表現。",
    },
  ],
  // after you then (70579)
  [
    70579,
    {
      coreImage:
        "相手に先行を譲る after you を会話接続的に強めた表現がコアイメージ。",
      usage:
        "「After you then.」は直前文脈を受けて譲るときに自然。then が談話のつながりを示す。",
      synonymDifference:
        "after you then vs after you: 後者が基本、前者は文脈継続のニュアンスを足す。",
      englishDefinition:
        "A polite phrase meaning go ahead first, with a conversational transition.",
      etymology:
        "after you に then を加えた談話的拡張形。",
    },
  ],
  // catch you later (70580)
  [
    70580,
    {
      coreImage:
        "再会予定を軽く示して別れるカジュアル句がコアイメージ。",
      usage:
        "友人間で「Catch you later.」が自然。フォーマルには「See you later.」。",
      synonymDifference:
        "catch you later vs see you later: 前者はより砕けた口語。",
      englishDefinition:
        "An informal parting phrase meaning see you later.",
      etymology:
        "catch（捕まえる）を比喩的に再会へ転用した口語表現。",
    },
  ],
  // good afternoon (70701)
  [
    70701,
    {
      coreImage:
        "午後の時間帯で用いる標準挨拶がコアイメージ。相手との接触を丁寧に開始する。",
      usage:
        "主に正午〜夕方までに使用。「Good afternoon, everyone.」は会議冒頭で定番。",
      synonymDifference:
        "good afternoon vs hello: 前者は時間帯を明示して丁寧。hello は時間帯非依存。", 
      englishDefinition:
        "A greeting used in the afternoon.",
      etymology:
        "good + afternoon の時間帯挨拶構文。",
    },
  ],
  // one moment (70706)
  [
    70706,
    {
      coreImage:
        "短時間の待機を丁寧に依頼するフォーマル寄り定型がコアイメージ。",
      usage:
        "「One moment, please.」は電話・受付・接客で高頻度。短くても丁寧さを保てる。",
      synonymDifference:
        "one moment vs just a second: 前者は丁寧、後者は口語で砕けた印象。",
      englishDefinition:
        "A polite phrase asking someone to wait briefly.",
      etymology:
        "one + moment（短時間）による定型依頼句。",
    },
  ],
  // hello (70001)
  [70001, { coreImage: "相手との接触を穏やかに開始する基本挨拶がコアイメージ。", usage: "対面・電話どちらでも使える万能の冒頭表現。明るい語調で関係性を作る。", synonymDifference: "hello vs hi: hello は中立で汎用、hi はよりカジュアル。", englishDefinition: "A common greeting used when meeting or speaking to someone.", etymology: "感嘆詞 holla / hallo 系から発達した英語の基本挨拶。" }],
  // goodbye (70002)
  [70002, { coreImage: "会話や面会を終える際に関係を丁寧に閉じる別れの挨拶がコアイメージ。", usage: "別れ際の基本形。友人には「bye」、丁寧さを保つなら「goodbye」が安全。", synonymDifference: "goodbye vs bye: 意味は同じだが、goodbye の方が丁寧で改まる。", englishDefinition: "A polite expression used when leaving or ending a conversation.", etymology: "God be with ye（神のご加護を）由来の短縮形として定着。" }],
  // please (70003)
  [70003, { coreImage: "依頼・申し出に丁寧さを加える礼儀標識語がコアイメージ。", usage: "命令文や依頼文に添えて圧を下げる。単独で「どうぞ」の意味でも使える。", synonymDifference: "please vs kindly: kindly は書き言葉寄りで硬め。please は会話で自然。", englishDefinition: "A word used to make a request polite or to offer something courteously.", etymology: "please（喜ばせる）が「相手の意向を尊重する」機能語へ発達。" }],
  // thanks (70004)
  [70004, { coreImage: "相手の行為に対する感謝を簡潔に示す返礼表現がコアイメージ。", usage: "カジュアル会話では最頻出。より丁寧にするなら「Thank you.」。", synonymDifference: "thanks vs thank you: thanks は口語的、thank you は中立〜丁寧。", englishDefinition: "An informal expression of gratitude.", etymology: "thank の複数形由来で、感謝表現として固定化。" }],
  // sorry (70005)
  [70005, { coreImage: "迷惑・不利益に対する謝意や遺憾を示す基本語がコアイメージ。", usage: "謝罪だけでなく、聞き返し「Sorry?」や共感「I'm sorry to hear that.」にも使う。", synonymDifference: "sorry vs excuse me: sorry は謝意中心、excuse me は注意喚起・割り込みに多い。", englishDefinition: "Used to apologize, show regret, or politely ask for repetition.", etymology: "古英語 sarig（悲しい）由来で「遺憾」の意味へ拡張。" }],
  // yes (70006)
  [70006, { coreImage: "相手の問い・提案に肯定で応答する最小単位がコアイメージ。", usage: "丁寧にするなら「Yes, please.」「Yes, I do.」のように補うと自然。", synonymDifference: "yes vs yeah: yes は中立、yeah は口語で砕けた肯定。", englishDefinition: "A word used to express agreement or affirmation.", etymology: "古英語 gese（その通り）に由来する肯定語。" }],
  // no (70007)
  [70007, { coreImage: "依頼・提案・質問に否定で応じる最小応答語がコアイメージ。", usage: "単独の no は強く聞こえることがあるため、丁寧には「No, thank you.」を使う。", synonymDifference: "no vs not: no は応答語・限定詞、not は文中否定副詞。", englishDefinition: "A word used to express refusal, denial, or negation.", etymology: "古英語 na（決して〜ない）由来の基本否定語。" }],
  // help (70008)
  [70008, { coreImage: "困っている相手の負担を減らす支援行為がコアイメージ。", usage: "「help + 人」「help with + 名詞」「help to do」で形が広い。会話では依頼形が頻出。", synonymDifference: "help vs assist: assist はよりフォーマル、help は日常で自然。", englishDefinition: "To make it easier for someone by giving support or assistance.", etymology: "古英語 helpan（助ける）に由来する基礎動詞。" }],
  // wait (70009)
  [70009, { coreImage: "行動を止めて時間経過を受け入れる待機行為がコアイメージ。", usage: "「wait a moment」「wait for + 人/物」が基本。for の有無で意味が変わる。", synonymDifference: "wait vs hold on: hold on は会話での短時間待機依頼に多い。", englishDefinition: "To stay where you are or delay action until something happens.", etymology: "古フランス語 waiter（見張る）が語源。" }],
  // stop (70010)
  [70010, { coreImage: "進行中の動作を中断・終了させる制止行為がコアイメージ。", usage: "自動詞「stop」他動詞「stop + 名詞/動名詞」の両方で使える。", synonymDifference: "stop vs quit: stop は一時停止も可、quit は完全にやめる含意が強い。", englishDefinition: "To end an action or prevent something from continuing.", etymology: "ゲルマン系語源を持つ基礎停止動詞。" }],
  // understand (70011)
  [70011, { coreImage: "情報の意味・意図を頭の中で把握する認知行為がコアイメージ。", usage: "「I understand.」は丁寧で便利な返答。「understand + wh節」も頻出。", synonymDifference: "understand vs know: understand は意味把握、know は知識保持。", englishDefinition: "To know the meaning of something or grasp what is meant.", etymology: "under + stand で「下で支える」から「把握する」へ意味発展。" }],
  // repeat (70012)
  [70012, { coreImage: "同じ内容をもう一度言う・行う再実行がコアイメージ。", usage: "聞き返しでは「Could you repeat that?」が自然で丁寧。", synonymDifference: "repeat vs say again: repeat はやや丁寧・明確、say again は口語。", englishDefinition: "To say or do something again.", etymology: "ラテン語 repetere（再び求める・繰り返す）由来。" }],
  // nice (70013)
  [70013, { coreImage: "相手や物事を感じよく肯定評価する柔らかい形容がコアイメージ。", usage: "「Nice to meet you.」「That's nice.」のように短く好意を示せる。", synonymDifference: "nice vs kind: nice は印象全般、kind は親切という性質。", englishDefinition: "Pleasant, agreeable, or kind in manner.", etymology: "ラテン語 nescius（無知な）から意味変遷し現代では肯定評価語に。" }],
  // good (70014)
  [70014, { coreImage: "質・状態・行為が望ましい基準を満たす基本評価語がコアイメージ。", usage: "挨拶（Good morning）や評価（good idea）など用途が非常に広い。", synonymDifference: "good vs well: good は形容詞、well は主に副詞。", englishDefinition: "Of high quality, satisfactory, or favorable.", etymology: "古英語 god（良い）に由来する最重要基礎語。" }],
  // bad (70015)
  [70015, { coreImage: "質・状態が望ましくないことを示す基本否定評価語がコアイメージ。", usage: "「too bad」は遺憾の定型。「bad at + 名詞/動名詞」で苦手表現になる。", synonymDifference: "bad vs poor: bad は広い否定、poor は質の低さを比較的穏やかに示す。", englishDefinition: "Not good; unpleasant or of low quality.", etymology: "古英語 baeddel 系を含む語源史を経て現代英語で一般化。" }],
  // how (70016)
  [70016, { coreImage: "方法・状態・程度を尋ねる疑問副詞がコアイメージ。", usage: "「How are you?」「How do you... ?」で会話の入口を作る重要語。", synonymDifference: "how vs what: how は方法・状態、what は内容そのもの。", englishDefinition: "Used to ask about manner, condition, or degree.", etymology: "古英語 hu（どのように）由来の疑問副詞。" }],
  // where (70017)
  [70017, { coreImage: "場所・位置の情報を引き出す疑問副詞がコアイメージ。", usage: "「Where is ... ?」「Where are you from?」の形で高頻度。", synonymDifference: "where vs which place: 前者が自然で一般的、後者は説明的。", englishDefinition: "Used to ask in or to what place.", etymology: "古英語 hwar（どこに）由来。" }],
  // what (70018)
  [70018, { coreImage: "対象・内容・正体を尋ねる中心疑問語がコアイメージ。", usage: "「What is this?」「What do you mean?」など用途が最も広い。", synonymDifference: "what vs which: what は非限定、which は選択肢がある場合に使う。", englishDefinition: "Used to ask for information about something.", etymology: "古英語 hwat（何）由来の基礎疑問代名詞。" }],
  // when (70019)
  [70019, { coreImage: "時点・期間など時間情報を尋ねる疑問副詞がコアイメージ。", usage: "「When does it start?」「Since when?」など予定確認で頻出。", synonymDifference: "when vs what time: when は幅広い時間、what time は時刻に限定。", englishDefinition: "Used to ask at what time or on what occasion.", etymology: "古英語 hwanne（いつ）由来。" }],
  // why (70020)
  [70020, { coreImage: "理由・目的を問い、背景説明を引き出す疑問副詞がコアイメージ。", usage: "「Why not?」は提案受容にも使える定型。答えは because で導く。", synonymDifference: "why vs how come: how come は口語的でやや柔らかい。", englishDefinition: "Used to ask for the reason or purpose of something.", etymology: "古英語 hwi（なぜ）由来の理由疑問語。" }],
  // excuse me (70101)
  [70101, { coreImage: "相手の注意を丁寧に引く、または軽く謝意を示す多機能礼儀表現がコアイメージ。", usage: "道を尋ねる導入、通路でのすれ違い、聞き返しの前置きなどで高頻度。", synonymDifference: "excuse me vs sorry: 前者は呼びかけ・割り込みに強く、後者は謝罪中心。", englishDefinition: "A polite expression used to get attention, apologize slightly, or ask for repetition.", etymology: "excuse（許す）+ me で「失礼をお許しください」の意から定着。" }],
  // good morning (70102)
  [70102, { coreImage: "朝の時間帯を指定して丁寧に関係を始める挨拶がコアイメージ。", usage: "初対面・職場・学校で安全に使える標準挨拶。昼以降は使わない。", synonymDifference: "good morning vs morning: 後者はくだけた省略形。", englishDefinition: "A greeting used in the morning.", etymology: "good + morning の時間帯挨拶構文。" }],
  // good evening (70103)
  [70103, { coreImage: "夕方以降に会う相手へ丁寧さを保って開始する挨拶がコアイメージ。", usage: "会うときの挨拶で、別れ際には通常 goodbye を使う。", synonymDifference: "good evening vs good night: 前者は出会い、後者は就寝前や別れ際。", englishDefinition: "A greeting used in the evening.", etymology: "good + evening の時間帯挨拶。" }],
  // see you (70104)
  [70104, { coreImage: "再会を前提に会話を軽く閉じるカジュアル別れ表現がコアイメージ。", usage: "「See you tomorrow.」のように時を添えると自然。近しい関係で多用。", synonymDifference: "see you vs goodbye: see you は再会前提で親しみが強い。", englishDefinition: "An informal way to say goodbye, expecting to meet again.", etymology: "I will see you の省略が定型化した表現。" }],
  // take care (70105)
  [70105, { coreImage: "別れ際に相手の安全・健康を気遣う配慮表現がコアイメージ。", usage: "メール末尾や会話終盤で自然。温かいトーンを作れる。", synonymDifference: "take care vs bye: take care は気遣いを含み、bye は中立。", englishDefinition: "A phrase used when parting to wish someone well and safety.", etymology: "take care（注意を払う）が別れの挨拶機能を持つようになった。" }],
  // welcome (70106)
  [70106, { coreImage: "相手を受け入れる姿勢を示す歓迎表現がコアイメージ。", usage: "「Welcome to ...」で受け入れ先を示す。返答「You're welcome」とは機能が異なる。", synonymDifference: "welcome vs you're welcome: 前者は歓迎、後者は感謝への返答。", englishDefinition: "An expression used to greet someone pleasantly on arrival.", etymology: "古英語 wilcuma（望ましい来訪者）由来。" }],
  // nice to see you (70107)
  [70107, { coreImage: "再会時の好意を直接伝える社交定型がコアイメージ。", usage: "初対面なら「Nice to meet you」、再会なら「Nice to see you」が自然。", synonymDifference: "nice to see you vs nice to meet you: 前者は再会、後者は初対面。", englishDefinition: "A polite phrase used when meeting someone again.", etymology: "nice + to see you の不定詞構文が挨拶定型化。" }],
  // how much (70108)
  [70108, { coreImage: "金額・量など不可算的な量を尋ねる疑問句がコアイメージ。", usage: "買い物では「How much is this?」が定番。可算名詞なら how many を使う。", synonymDifference: "how much vs how many: much は不可算、many は可算複数。", englishDefinition: "Used to ask about price or amount.", etymology: "how + much（どれほど多く）から成る疑問構文。" }],
  // one more time (70109)
  [70109, { coreImage: "同じ内容の再提示を丁寧に求める反復依頼がコアイメージ。", usage: "聞き取れない場面で「Could you say that one more time?」が実用的。", synonymDifference: "one more time vs again: 前者は依頼として明示的、again はより短く一般的。", englishDefinition: "An expression meaning one additional repetition.", etymology: "one + more + time の数量表現が依頼定型化。" }],
  // slowly (70110)
  [70110, { coreImage: "動作・発話速度を下げる様子を示す副詞がコアイメージ。", usage: "学習初級では「Speak slowly, please.」が非常に有用。", synonymDifference: "slowly vs gently: slowly は速度、gently は力加減・態度。", englishDefinition: "At a low speed; not quickly.", etymology: "slow + -ly（副詞化）で形成。" }],
  // right now (70111)
  [70111, { coreImage: "遅延なしの現在時点を強調する時間句がコアイメージ。", usage: "緊急性を出せるが、命令調では強く響くため語調調整が必要。", synonymDifference: "right now vs now: right now の方が即時性の強調が強い。", englishDefinition: "At this exact moment; immediately.", etymology: "right（まさに）+ now による時点強調。" }],
  // over there (70112)
  [70112, { coreImage: "話し手・聞き手から離れた位置を指す場所副詞句がコアイメージ。", usage: "物や場所の案内で多用。「It's over there.」が基本。", synonymDifference: "over there vs there: over を入れると距離感・指示性が強まる。", englishDefinition: "In or at that place away from both speaker and listener.", etymology: "over + there の位置指示連語。" }],
  // this one (70113)
  [70113, { coreImage: "複数候補から話し手に近い対象を一つ選ぶ指示句がコアイメージ。", usage: "買い物や選択で「I'll take this one.」が実用的。", synonymDifference: "this one vs it: this one は選択対象を明示、it は文脈依存。", englishDefinition: "A phrase referring to one thing near the speaker.", etymology: "指示詞 this + one の選択構文。" }],
  // that one (70114)
  [70114, { coreImage: "複数候補から距離のある対象を一つ選ぶ指示句がコアイメージ。", usage: "比較文脈で this one と対にして使うと明確。", synonymDifference: "that one vs this one: that は遠い対象、this は近い対象。", englishDefinition: "A phrase referring to one thing farther from the speaker.", etymology: "指示詞 that + one の選択構文。" }],
  // here you are (70115)
  [70115, { coreImage: "相手に物を渡す際の受け渡し定型がコアイメージ。", usage: "接客・日常どちらでも使える。「Here you go」と近い。", synonymDifference: "here you are vs here you go: 後者の方が口語で幅広く使われる。", englishDefinition: "A phrase used when giving something to someone.", etymology: "here + you are（ここにあります）が受け渡し定型化。" }],
  // actually (70021)
  [70021, { coreImage: "先行発言を修正・補足して実際の内容へ寄せる談話副詞がコアイメージ。", usage: "文頭で「Actually, ...」と置くと自然に軌道修正できる。", synonymDifference: "actually vs in fact: 後者はやや書き言葉寄りで強調が強い。", englishDefinition: "Used to introduce a correction, clarification, or surprising fact.", etymology: "actual（実際の）+ -ly の副詞化。" }],
  // basically (70022)
  [70022, { coreImage: "細部を省いて要点だけ示す要約マーカーがコアイメージ。", usage: "「Basically, ...」で説明を短く整理できる。", synonymDifference: "basically vs generally: basically は本質要約、generally は一般論。", englishDefinition: "In the most important ways; used to summarize.", etymology: "basic（基本）+ -ally 由来。" }],
  // exactly (70023)
  [70023, { coreImage: "一致・正確性を強く示す同意/程度副詞がコアイメージ。", usage: "相づち「Exactly.」として単独使用も頻出。", synonymDifference: "exactly vs precisely: precisely はややフォーマル。", englishDefinition: "Used to mean completely correct or in an exact manner.", etymology: "exact（正確な）+ -ly。" }],
  // probably (70024)
  [70024, { coreImage: "高い可能性を断定せず示す推量副詞がコアイメージ。", usage: "未来予測「I'll probably ...」で自然。", synonymDifference: "probably vs maybe: probably の方が確度が高い。", englishDefinition: "Likely to happen or be true.", etymology: "probable（ありそうな）+ -ly。" }],
  // definitely (70025)
  [70025, { coreImage: "不確実性を排して確信を示す強い断定副詞がコアイメージ。", usage: "「I'll definitely come.」で強い約束を表せる。", synonymDifference: "definitely vs certainly: 両者近いが definitely は会話で頻出。", englishDefinition: "Without doubt; certainly.", etymology: "definite（明確な）+ -ly。" }],
  // anyway (70026)
  [70026, { coreImage: "脱線を切り上げ本筋へ戻す話題転換マーカーがコアイメージ。", usage: "「Anyway, ...」で会話の流れを回収できる。", synonymDifference: "anyway vs by the way: 前者は本題回帰、後者は話題追加。", englishDefinition: "Used to change topic, return to the main point, or mean in any case.", etymology: "any + way が談話標識として固定化。" }],
  // obviously (70027)
  [70027, { coreImage: "共有されるべき明白さを前提化する評価副詞がコアイメージ。", usage: "主観が強く出るため、断定し過ぎない配慮が必要。", synonymDifference: "obviously vs clearly: obviously の方が「自明」含意が強い。", englishDefinition: "In a way that is easy to see, understand, or recognize.", etymology: "obvious（明白な）+ -ly。" }],
  // unfortunately (70028)
  [70028, { coreImage: "不都合な事実に遺憾の枠付けを与える談話副詞がコアイメージ。", usage: "断り・悪い知らせの緩衝材として文頭で使う。", synonymDifference: "unfortunately vs sadly: 前者は事実評価、後者は感情寄り。", englishDefinition: "Used to express regret that a situation is unpleasant.", etymology: "fortunate（幸運な）に否定接頭辞 un- を付加。" }],
  // awesome (70029)
  [70029, { coreImage: "強い好意・賞賛をカジュアルに示す高評価語がコアイメージ。", usage: "若年層会話で「That's awesome!」が頻出。", synonymDifference: "awesome vs great: awesome の方が感情強度が高い。", englishDefinition: "Extremely good or impressive (informal).", etymology: "awe（畏敬）由来だが現代会話では「最高」の口語義が主流。" }],
  // amazing (70030)
  [70030, { coreImage: "驚きと高評価を同時に示す感情形容がコアイメージ。", usage: "人・物・出来事いずれにも広く使える。", synonymDifference: "amazing vs awesome: amazing は驚き成分、awesome は口語賞賛色が強い。", englishDefinition: "Very surprising and very good.", etymology: "amaze（驚かせる）+ -ing。" }],
  // terrible (70031)
  [70031, { coreImage: "質・状況が非常に悪いと強く評価する否定形容がコアイメージ。", usage: "体調・天気・出来事の不満表現で頻出。", synonymDifference: "terrible vs bad: terrible の方が程度が強い。", englishDefinition: "Very bad or unpleasant.", etymology: "terror（恐れ）系語源から強い否定評価へ。" }],
  // stuff (70032)
  [70032, { coreImage: "具体名を挙げない「もの・こと」の総称として使う口語名詞がコアイメージ。", usage: "不可算扱いが基本で「a lot of stuff」が自然。", synonymDifference: "stuff vs things: stuff はより口語で雑多な集合感がある。", englishDefinition: "Informal word for things, materials, or matters.", etymology: "古フランス語 estoffe（材料）由来。" }],
  // guess (70033)
  [70033, { coreImage: "確証なしに妥当そうな答えを出す推測行為がコアイメージ。", usage: "「I guess ...」は断定を和らげる会話マーカーとして有用。", synonymDifference: "guess vs suppose: suppose の方がやや思考的で丁寧。", englishDefinition: "To form an opinion without complete information.", etymology: "中英語 gessen（推測する）由来。" }],
  // figure (70034)
  [70034, { coreImage: "情報を整理して理解・解決に到達する認知プロセスがコアイメージ。", usage: "「figure out」で「理解する・解決する」の句動詞として高頻度。", synonymDifference: "figure out vs understand: 前者は試行錯誤の過程を含む。", englishDefinition: "To understand or solve, especially after thinking.", etymology: "ラテン語 figura（形）由来。句動詞 figure out で意味拡張。" }],
  // kidding (70035)
  [70035, { coreImage: "発言を冗談枠で提示する軽い遊びの談話機能がコアイメージ。", usage: "「I'm kidding.」「Are you kidding me?」が定型。", synonymDifference: "kidding vs joking: 両者近いが kidding の方が会話で軽く砕ける。", englishDefinition: "Speaking playfully and not seriously.", etymology: "kid（からかう）由来の進行形表現。" }],
  // no problem (70116)
  [70116, { coreImage: "依頼受諾や謝罪受け入れを負担なしとして返す安心表現がコアイメージ。", usage: "「No problem.」単独で自然。カジュアルだが実用範囲が広い。", synonymDifference: "no problem vs you're welcome: 前者は口語、後者はより丁寧で中立。", englishDefinition: "An informal response meaning it is okay or not difficult.", etymology: "problem を否定する平易構文が会話定型化。" }],
  // sounds good (70117)
  [70117, { coreImage: "相手提案を前向きに受け入れる同意定型がコアイメージ。", usage: "予定調整で非常に有用。「Sounds good to me.」も自然。", synonymDifference: "sounds good vs okay: 前者はより積極的同意の響き。", englishDefinition: "A phrase meaning a suggestion seems good or acceptable.", etymology: "it sounds good の主語省略型として定着。" }],
  // of course (70118)
  [70118, { coreImage: "当然性や快諾を示す高頻度副詞句がコアイメージ。", usage: "許可・同意返答で便利だが、語調次第で「当然でしょ」に聞こえる点に注意。", synonymDifference: "of course vs certainly: certainly の方が丁寧で業務向き。", englishDefinition: "Certainly; used to show agreement or that something is obvious.", etymology: "of + course（流れ・当然の帰結）からの慣用句。" }],
  // I mean (70119)
  [70119, { coreImage: "発話を言い換え・補正する自己修正マーカーがコアイメージ。", usage: "「I mean, ...」で説明を補う。多用しすぎると冗長になる。", synonymDifference: "I mean vs that is: I mean は会話的、that is は説明文的。", englishDefinition: "Used to clarify, correct, or explain what was just said.", etymology: "mean（意味する）の一人称現在形が談話標識化。" }],
  // by the way (70120)
  [70120, { coreImage: "本筋を保ったまま関連話題を追加する転換句がコアイメージ。", usage: "雑談・連絡で自然な差し込みに使える。", synonymDifference: "by the way vs anyway: 前者は追加、後者は本題回帰。", englishDefinition: "Used when introducing a new but related topic.", etymology: "by the way（道すがら）が比喩的に話題転換機能を獲得。" }],
  // for sure (70121)
  [70121, { coreImage: "確信の高さをカジュアルに示す強調副詞句がコアイメージ。", usage: "約束や同意の返答で「for sure.」単独でも自然。", synonymDifference: "for sure vs definitely: 前者はより口語、後者は中立。", englishDefinition: "Certainly; definitely (informal).", etymology: "for + sure（確実）による口語強調句。" }],
  // no worries (70122)
  [70122, { coreImage: "相手の謝罪や心配を受け止め、問題化しない安心返答がコアイメージ。", usage: "豪州英語由来で英語圏全体に普及した口語返答。", synonymDifference: "no worries vs no problem: ほぼ同義。no worries はより柔らかい。", englishDefinition: "An informal expression meaning there is no need to worry.", etymology: "worry の複数形を否定して不安不要を示す定型。" }],
  // my bad (70123)
  [70123, { coreImage: "自分のミスを短く認めるカジュアル謝罪がコアイメージ。", usage: "友人間で自然。業務文脈では「My mistake.」が無難。", synonymDifference: "my bad vs I'm sorry: my bad は軽い自己責任表明、I'm sorry はより一般的謝罪。", englishDefinition: "An informal way to admit one’s mistake.", etymology: "my + bad（自分の悪い点）から生まれた口語表現。" }],
  // hang on (70124)
  [70124, { coreImage: "ごく短時間の待機を求める口語句がコアイメージ。", usage: "電話・会話の切れ目で「Hang on.」が高頻度。", synonymDifference: "hang on vs hold on: ほぼ同義で地域差・個人差が大きい。", englishDefinition: "To wait for a short time.", etymology: "hang（ぶら下がる）+ on（続ける）から待機義へ発展。" }],
  // come on (70125)
  [70125, { coreImage: "相手を促す/不満を示すなど文脈で機能が変わる多義口語句がコアイメージ。", usage: "励まし「Come on!」にも、 disbelief「Come on...」にも使う。", synonymDifference: "come on vs hurry up: hurry up は急がせる意味がより直接的。", englishDefinition: "An expression used to encourage, urge, or show disbelief.", etymology: "come + on の句動詞が感嘆的に機能拡張。" }],
  // check out (70126)
  [70126, { coreImage: "対象へ注意を向けて確認・閲覧する行為を促す句動詞がコアイメージ。", usage: "「Check out this video.」で推薦・紹介に使える。", synonymDifference: "check out vs look at: check out は興味喚起や確認の含意が強い。", englishDefinition: "To look at, examine, or try something (informal).", etymology: "check + out（外へ）で確認行為を広げる句動詞。" }],
  // give up (70127)
  [70127, { coreImage: "継続中の試みを中止して断念する転換がコアイメージ。", usage: "「give up + 名詞/動名詞」で対象を示せる。", synonymDifference: "give up vs quit: give up は断念ニュアンス、quit は終了事実に焦点。", englishDefinition: "To stop trying or stop doing something.", etymology: "give + up（手放す）から「断念」の意味へ。" }],
  // pick up (70128)
  [70128, { coreImage: "下から持ち上げる/人を迎えに行くなど「回収」系の核意味がコアイメージ。", usage: "文脈で意味が変わる多義句動詞。目的語で判断する。", synonymDifference: "pick up vs take: pick up は回収・迎えのニュアンスが強い。", englishDefinition: "To lift, collect, or go to meet someone by vehicle.", etymology: "pick（選び取る）+ up（上へ）による句動詞。" }],
  // let me know (70129)
  [70129, { coreImage: "情報共有を依頼する柔らかい要請定型がコアイメージ。", usage: "予定・判断が決まったら知らせてほしい場面で実用的。", synonymDifference: "let me know vs tell me: 前者の方が依頼として柔らかい。", englishDefinition: "A phrase requesting someone to inform you.", etymology: "let + 人 + know の使役構文が依頼定型化。" }],
  // take it easy (70130)
  [70130, { coreImage: "無理をせず落ち着いて過ごすよう促す配慮表現がコアイメージ。", usage: "別れ際・励ましで自然。文脈次第で「落ち着いて」の指示にもなる。", synonymDifference: "take it easy vs relax: 前者は挨拶的にも使える。", englishDefinition: "To relax and avoid stress; also a friendly farewell.", etymology: "take it easy（それを易しく扱う）の慣用化。" }],
  // that works (70191)
  [70191, { coreImage: "提案内容が条件を満たして受け入れ可能であることを示す合意表現がコアイメージ。", usage: "日程調整で「That works for me.」が定番。", synonymDifference: "that works vs sounds good: 前者は実務的適合、後者は感情的賛同寄り。", englishDefinition: "A phrase meaning a plan is acceptable.", etymology: "work（機能する）が評価返答として定型化。" }],
  // I got it (70192)
  [70192, { coreImage: "理解完了または対応引受けを短く示す会話定型がコアイメージ。", usage: "文脈で「わかった」「任せて」の両義。誤解を避けるなら補足を加える。", synonymDifference: "I got it vs I understand: 前者は口語で即応感が強い。", englishDefinition: "An expression meaning I understand or I will handle it.", etymology: "get（得る）から「把握する」義への拡張。" }],
  // you bet (70193)
  [70193, { coreImage: "強い肯定を親しみある調子で返す口語応答がコアイメージ。", usage: "依頼受諾や感謝返答に使えるが、カジュアル度は高い。", synonymDifference: "you bet vs sure: you bet の方が勢いがある。", englishDefinition: "An informal expression meaning certainly or you’re welcome.", etymology: "賭けてもいいほど確実だ、という比喩から定着。" }],
  // my pleasure (70194)
  [70194, { coreImage: "相手への助力を喜んで行ったと示す丁寧返答がコアイメージ。", usage: "感謝への返答として接客・ビジネスでも使いやすい。", synonymDifference: "my pleasure vs you're welcome: 前者はより温かく積極的。", englishDefinition: "A polite response to thanks, meaning I was happy to help.", etymology: "pleasure（喜び）を主語化した定型返答。" }],
  // makes no sense (70195)
  [70195, { coreImage: "論理整合が取れないことを明示する評価句がコアイメージ。", usage: "「This makes no sense.」で説明や規則への違和感を示せる。", synonymDifference: "makes no sense vs I don't get it: 前者は内容側の不合理、後者は話者側の理解不足。", englishDefinition: "A phrase meaning something is illogical or unclear.", etymology: "make sense（意味をなす）の否定形。" }],
  // hold on (70196)
  [70196, { coreImage: "相手に短時間待機を求める会話用句動詞がコアイメージ。", usage: "電話対応や作業中断時で高頻度。「Hold on a second.」が自然。", synonymDifference: "hold on vs wait: hold on の方が会話的で柔らかい。", englishDefinition: "To wait briefly.", etymology: "hold + on（保持し続ける）から待機義へ。" }],
  // go ahead (70197)
  [70197, { coreImage: "相手に実行許可を与える前進承認表現がコアイメージ。", usage: "発言・開始・実施の許可に使える万能表現。", synonymDifference: "go ahead vs be my guest: 後者はやや砕けた言い方。", englishDefinition: "A phrase giving permission to proceed.", etymology: "go + ahead（前へ）による許可表現。" }],
  // step by step (70198)
  [70198, { coreImage: "工程を小分けにして順序立てる学習・作業方針がコアイメージ。", usage: "説明・指導で焦りを抑える定型として有効。", synonymDifference: "step by step vs gradually: 前者は手順性、後者は変化の緩やかさ。", englishDefinition: "In a gradual and ordered sequence.", etymology: "step（段階）反復で順序性を強調。" }],
  // in person (70199)
  [70199, { coreImage: "オンラインや代理でなく本人が対面で行うことを示す句がコアイメージ。", usage: "面談・確認を「in person」で指定すると誤解が少ない。", synonymDifference: "in person vs face-to-face: 近いが in person は本人性の強調がある。", englishDefinition: "Physically present rather than remote or through another person.", etymology: "person（本人）を前置詞句化した表現。" }],
  // on time (70200)
  [70200, { coreImage: "予定時刻ちょうどに到達する時間厳守の状態がコアイメージ。", usage: "学校・職場で頻出。遅刻防止文脈と相性が良い。", synonymDifference: "on time vs in time: on time は定刻、in time は締切前。", englishDefinition: "At the scheduled time; punctual.", etymology: "on + time による時点一致表現。" }],
  // as usual (70201)
  [70201, { coreImage: "普段どおりの反復パターンを示す慣用句がコアイメージ。", usage: "良い習慣にも悪い癖にも中立的に使える。", synonymDifference: "as usual vs usually: 前者は文脈依存の「いつもどおり」、後者は一般頻度副詞。", englishDefinition: "In the normal or expected way.", etymology: "as + usual（いつもの）による比較構文。" }],
  // far away (70202)
  [70202, { coreImage: "距離の大きさを感覚的に示す位置副詞句がコアイメージ。", usage: "物理距離だけでなく比喩的距離にも使える。", synonymDifference: "far away vs far: far away の方が空間イメージが明確。", englishDefinition: "At a great distance.", etymology: "far + away で距離感を強めた表現。" }],
  // come back (70203)
  [70203, { coreImage: "離れた場所から元の場所へ戻る復帰移動がコアイメージ。", usage: "人にも状態にも使える。命令「Come back soon.」が定番。", synonymDifference: "come back vs go back: come は話し手側へ、go は話し手から離れる方向。", englishDefinition: "To return to a place or situation.", etymology: "come + back の方向句動詞。" }],
  // turn off (70204)
  [70204, { coreImage: "機器・灯りなどの作動を停止させる操作句動詞がコアイメージ。", usage: "「turn off the light」「turn it off」で高頻度。代名詞は中間に置く。", synonymDifference: "turn off vs switch off: 英米差はあるが多くの場面でほぼ同義。", englishDefinition: "To stop a device, light, or flow from operating.", etymology: "turn + off（外へ）で停止操作を表す。" }],
  // turn on (70205)
  [70205, { coreImage: "機器・灯りなどを作動状態にする起動操作句動詞がコアイメージ。", usage: "「turn on the TV」「turn it on」で基本運用。", synonymDifference: "turn on vs switch on: 多くの場面で同義だが地域・好み差がある。", englishDefinition: "To start a device, light, or flow operating.", etymology: "turn + on（接続・作動）による句動詞。" }],
  // for the time being (70261)
  [70261, { coreImage: "恒久決定ではなく暫定運用を示す期間限定マーカーがコアイメージ。", usage: "方針や対応の「当面」を示すのに有効。", synonymDifference: "for the time being vs for now: 後者の方がより口語で短い。", englishDefinition: "For now; temporarily.", etymology: "time + being（現在の状態）による慣用句。" }],
  // I am serious (70262)
  [70262, { coreImage: "冗談枠を排除して本気であることを明示する宣言がコアイメージ。", usage: "相手が軽く受け取ったときの修正に使う。", synonymDifference: "I am serious vs I'm not kidding: 前者は中立、後者は口語強調。", englishDefinition: "A sentence used to state that one is not joking.", etymology: "serious（真剣な）を be 動詞で状態化。" }],
  // my treat (70263)
  [70263, { coreImage: "支払いを自分が引き受ける申し出定型がコアイメージ。", usage: "会計前後で短く言える便利表現。", synonymDifference: "my treat vs it's on me: ほぼ同義。後者はより口語的。", englishDefinition: "A phrase meaning I will pay for it.", etymology: "treat（もてなし）を所有表現化した口語句。" }],
  // I am starving (70264)
  [70264, { coreImage: "強い空腹感を誇張して伝える感情表現がコアイメージ。", usage: "日常会話では比喩的に「お腹ぺこぺこ」の意味で使う。", synonymDifference: "I'm starving vs I'm hungry: 前者は程度が強い。", englishDefinition: "A sentence meaning one is extremely hungry.", etymology: "starve（飢える）進行状態の強調使用。" }],
  // good point (70265)
  [70265, { coreImage: "相手発言の妥当な論点を認める短い評価句がコアイメージ。", usage: "議論の雰囲気を良く保つ同意表現として有効。", synonymDifference: "good point vs exactly: good point は論点評価、exactly は全面同意。", englishDefinition: "An expression acknowledging that someone made a valid point.", etymology: "good + point の評価連語。" }],
  // same here (70266)
  [70266, { coreImage: "相手と同じ状態・意見であることを簡潔に示す同調句がコアイメージ。", usage: "感情・希望の共有返答で自然。", synonymDifference: "same here vs me too: ほぼ同義だが same here はより会話的。", englishDefinition: "An informal expression meaning I feel or think the same.", etymology: "same + here（こちらも同じ）から定型化。" }],
  // count me in (70267)
  [70267, { coreImage: "参加意思を前向きに表明する加入定型がコアイメージ。", usage: "提案への即答参加に使える。", synonymDifference: "count me in vs I'm in: 前者は参加者として数に入れて、の含意。", englishDefinition: "A phrase meaning include me as a participant.", etymology: "count + me + in の使役的構文。" }],
  // give it a shot (70268)
  [70268, { coreImage: "成功保証はないが一度試す姿勢を示す挑戦表現がコアイメージ。", usage: "新しいことへの軽いチャレンジを促す場面で有効。", synonymDifference: "give it a shot vs try it: 前者の方が口語的で勢いがある。", englishDefinition: "An informal expression meaning to try something.", etymology: "shot（試み）の比喩義から。" }],
  // take your time (70269)
  [70269, { coreImage: "急がず自分のペースで進めてよいと伝える配慮表現がコアイメージ。", usage: "相手の心理的圧を下げる丁寧な一言として有用。", synonymDifference: "take your time vs no rush: 近いが前者の方が直接的配慮。", englishDefinition: "A phrase telling someone not to hurry.", etymology: "take + your time（自分の時間を使う）慣用句。" }],
  // no rush (70270)
  [70270, { coreImage: "緊急性が低いことを伝えて相手を安心させる短句がコアイメージ。", usage: "返信催促を緩めるときなどに使いやすい。", synonymDifference: "no rush vs take your time: 前者は状況説明、後者は相手への指示。", englishDefinition: "An expression meaning there is no need to hurry.", etymology: "rush（急ぎ）を否定した口語定型。" }],
  // I am in (70311)
  [70311, { coreImage: "提案への参加意思を明確に示す短い合意表現がコアイメージ。", usage: "計画確認で即答しやすい。", synonymDifference: "I'm in vs count me in: 前者は短く直接、後者はやや強調。", englishDefinition: "A phrase meaning I agree to join.", etymology: "in（中に入る）を参加比喩で使用。" }],
  // I am out (70312)
  [70312, { coreImage: "参加しない意思を簡潔に示す辞退表現がコアイメージ。", usage: "断りを短く伝える際に使う。丁寧化するなら理由を添える。", synonymDifference: "I'm out vs I can't make it: 後者の方が事情説明寄りで柔らかい。", englishDefinition: "A phrase meaning I will not participate.", etymology: "out（外にいる）を不参加比喩で使用。" }],
  // works for me (70313)
  [70313, { coreImage: "提案が自分の条件に適合することを示す実務的同意がコアイメージ。", usage: "日程・条件調整で頻出。", synonymDifference: "works for me vs sounds good: 前者は適合性、後者は好感。", englishDefinition: "A phrase meaning a suggestion is acceptable to me.", etymology: "work for + 人（人にとって機能する）構文。" }],
  // my mistake (70314)
  [70314, { coreImage: "自分の誤りを認める中立的謝罪表現がコアイメージ。", usage: "my bad より丁寧で業務会話にも使いやすい。", synonymDifference: "my mistake vs my bad: 前者の方が中立でフォーマル寄り。", englishDefinition: "An expression admitting one’s error.", etymology: "mistake（誤り）を所有化した謝罪定型。" }],
  // never mind (70315)
  [70315, { coreImage: "先行依頼・話題を取り下げて気にしなくてよいと示す緩和句がコアイメージ。", usage: "会話の撤回や相手配慮に使える。", synonymDifference: "never mind vs forget it: 前者の方が柔らかく丁寧。", englishDefinition: "A phrase meaning do not worry about it or ignore what was said.", etymology: "mind（気にする）を否定した慣用句。" }],
  // how come (70316)
  [70316, { coreImage: "理由を口語的に尋ねる疑問句がコアイメージ。", usage: "「How come...?」はカジュアル会話で自然。倒置しない点が特徴。", synonymDifference: "how come vs why: 前者は口語でやや柔らかい。", englishDefinition: "An informal way to ask why.", etymology: "how + come（どうしてそうなる）から定着。" }],
  // I am broke (70317)
  [70317, { coreImage: "手元資金が乏しい状態をくだけて伝える口語表現がコアイメージ。", usage: "友人間での出費辞退理由としてよく使う。", synonymDifference: "I'm broke vs I have no money: 前者は口語的で軽い。", englishDefinition: "An informal expression meaning I have very little or no money.", etymology: "broke（壊れた）から経済的に破綻した状態へ比喩拡張。" }],
  // no kidding (70318)
  [70318, { coreImage: "驚き・共感を示す相づち、または「冗談でしょ」を示す反応句がコアイメージ。", usage: "語調で意味が変わるため文脈依存。", synonymDifference: "no kidding vs really: 前者はより感情的で口語。", englishDefinition: "An expression of surprise, agreement, or disbelief.", etymology: "kidding（冗談）を否定して真実性を強調。" }],
  // watch out (70319)
  [70319, { coreImage: "危険回避のため即時注意を促す警告句がコアイメージ。", usage: "緊急時には短く強く発話される。", synonymDifference: "watch out vs be careful: 前者は瞬間警告、後者は一般的注意。", englishDefinition: "A warning to be careful of danger.", etymology: "watch + out で外部危険への注意を示す。" }],
  // check it (70320)
  [70320, { coreImage: "対象確認をカジュアルに促す短縮命令がコアイメージ。", usage: "若者会話では「check it out」の短縮として使われることがある。", synonymDifference: "check it vs check it out: 後者の方が一般的で自然。", englishDefinition: "An informal phrase meaning look at or verify it.", etymology: "check + it の口語短縮使用。" }],
  // I am game (70361)
  [70361, { coreImage: "提案に前向きに乗る参加意思の口語表現がコアイメージ。", usage: "誘いへの快諾で使う。ややカジュアル。", synonymDifference: "I'm game vs I'm in: 前者は乗り気のニュアンスが強い。", englishDefinition: "An informal phrase meaning willing to take part.", etymology: "game（挑戦的）から参加意欲義へ。" }],
  // can't complain (70362)
  [70362, { coreImage: "大きな不満はないと控えめに近況を返す定型がコアイメージ。", usage: "How are you? への自然な中庸返答。", synonymDifference: "can't complain vs I'm fine: 前者は含みのある口語返答。", englishDefinition: "An expression meaning things are fairly good.", etymology: "complain を否定して満足度を婉曲表現。" }],
  // what's up (70363)
  [70363, { coreImage: "相手の近況や要件を軽く尋ねるカジュアル挨拶がコアイメージ。", usage: "親しい相手向け。返答は短くてよい。", synonymDifference: "what's up vs how are you: 前者はより砕けた挨拶。", englishDefinition: "An informal greeting asking what is happening.", etymology: "what is up の縮約形。" }],
  // you wish (70364)
  [70364, { coreImage: "相手の願望を皮肉混じりに退ける反応句がコアイメージ。", usage: "冗談文脈で使う。強く聞こえるため相手選びが重要。", synonymDifference: "you wish vs no way: 前者は皮肉、後者は単純拒否。", englishDefinition: "An expression used to mock an unrealistic hope.", etymology: "wish（願う）への反語的応答。" }],
  // my bad again (70365)
  [70365, { coreImage: "再度のミスを軽く認める謝罪句がコアイメージ。", usage: "親しい間柄向け。正式場面では避ける。", synonymDifference: "my bad again vs I'm sorry again: 後者がより丁寧。", englishDefinition: "An informal way to admit another mistake.", etymology: "my bad の反復表現。" }],
  // hang tight (70366)
  [70366, { coreImage: "その場でしばらく待つよう促す口語句がコアイメージ。", usage: "状況改善まで待機してほしい場面で使う。", synonymDifference: "hang tight vs hold on: hang tight は「もう少し」の含意が強い。", englishDefinition: "To wait patiently for a short time.", etymology: "hang + tight の慣用化。" }],
  // I am beat (70367)
  [70367, { coreImage: "疲労困憊をくだけて伝える口語形容がコアイメージ。", usage: "仕事後・運動後の会話で頻出。", synonymDifference: "I'm beat vs I'm tired: 前者はより口語で強い疲労。", englishDefinition: "An informal expression meaning very tired.", etymology: "beat（打ちのめされた）の比喩用法。" }],
  // call me (70368)
  [70368, { coreImage: "電話連絡を促す直接依頼がコアイメージ。", usage: "「Call me later.」のように時点指定が有効。", synonymDifference: "call me vs text me: 前者は通話、後者はメッセージ。", englishDefinition: "A phrase asking someone to phone you.", etymology: "call + me の基本依頼構文。" }],
  // text me (70369)
  [70369, { coreImage: "テキスト連絡を求める短い依頼句がコアイメージ。", usage: "連絡手段を明確化できる。", synonymDifference: "text me vs message me: text はSMS寄り、message は媒体が広い。", englishDefinition: "A phrase asking someone to send you a text message.", etymology: "text（短信を送る）+ me。" }],
  // keep going (70370)
  [70370, { coreImage: "継続を励ます前進指示がコアイメージ。", usage: "作業・学習のモチベーション維持で有効。", synonymDifference: "keep going vs go on: 前者は継続励ましの響きが強い。", englishDefinition: "Continue what you are doing.", etymology: "keep + going の継続命令。" }],
  // I am sold (70411)
  [70411, { coreImage: "説明を受けて賛同・購入意欲が固まった状態表明がコアイメージ。", usage: "提案受諾で「いいね、乗るよ」の意味。", synonymDifference: "I'm sold vs I'm in: 前者は説得された結果の同意。", englishDefinition: "An expression meaning convinced and ready to agree.", etymology: "sold（売れた）を比喩で確信状態に転用。" }],
  // that's wild (70412)
  [70412, { coreImage: "驚きの強さを口語的に示す評価句がコアイメージ。", usage: "想定外の話に対するリアクションで使う。", synonymDifference: "that's wild vs that's crazy: ほぼ同義だが wild はやや軽い。", englishDefinition: "An informal reaction meaning very surprising.", etymology: "wild（制御不能）から驚き評価へ。" }],
  // no chance (70413)
  [70413, { coreImage: "可能性や許可を強く否定する短句がコアイメージ。", usage: "拒否として強めなので語調に注意。", synonymDifference: "no chance vs probably not: 前者は断定的、後者は緩い。", englishDefinition: "An expression meaning no possibility.", etymology: "chance（可能性）を否定した定型。" }],
  // my pleasure indeed (70414)
  [70414, { coreImage: "感謝返答をさらに丁寧に強調する表現がコアイメージ。", usage: "通常は my pleasure で十分。indeed は強調。", synonymDifference: "my pleasure indeed vs my pleasure: 後者の方が一般的。", englishDefinition: "A strongly polite response to thanks.", etymology: "indeed（確かに）で強調した返答句。" }],
  // I am on it (70415)
  [70415, { coreImage: "依頼事項に即着手する意思を示す実務表現がコアイメージ。", usage: "職場連絡でも使いやすい。", synonymDifference: "I'm on it vs I'll do it: 前者は「今着手中」の含意が強い。", englishDefinition: "A phrase meaning I will handle it right away.", etymology: "on + it（その案件に乗っている）比喩。" }],
  // got it covered (70416)
  [70416, { coreImage: "必要事項を自分が対応済み・対応可能と示す保証表現がコアイメージ。", usage: "分担確認で安心を与える返答。", synonymDifference: "got it covered vs I got it: 前者は網羅性・安心感が強い。", englishDefinition: "An expression meaning the matter is taken care of.", etymology: "cover（カバーする）比喩の完了形。" }],
  // easy does it (70417)
  [70417, { coreImage: "慎重にゆっくり進めるよう促す警句がコアイメージ。", usage: "壊れ物・緊張場面で有効。", synonymDifference: "easy does it vs take it easy: 前者は作業時の慎重指示。", englishDefinition: "A phrase meaning do it slowly and carefully.", etymology: "easy + does it の慣用句。" }],
  // chill out (70418)
  [70418, { coreImage: "緊張や怒りを下げるよう促す口語句がコアイメージ。", usage: "相手によっては失礼に響くため関係性に注意。", synonymDifference: "chill out vs calm down: 前者の方が口語で軽い。", englishDefinition: "To relax or become less upset (informal).", etymology: "chill（冷える）から感情沈静化義へ。" }],
  // head out (70419)
  [70419, { coreImage: "その場を出発する行為を軽く示す句動詞がコアイメージ。", usage: "「I have to head out.」で退席理由と相性が良い。", synonymDifference: "head out vs leave: head out は口語で移動開始の感じ。", englishDefinition: "To leave a place, usually to go somewhere.", etymology: "head（向かう）+ out。" }],
  // wrap up (70420)
  [70420, { coreImage: "作業・会話をまとめて終える終結句がコアイメージ。", usage: "会議終了や締めで頻出。", synonymDifference: "wrap up vs finish: wrap up は「まとめて終える」含意。", englishDefinition: "To complete and bring to an end.", etymology: "wrap（包む）から「締めくくる」比喩へ。" }],
  // no pressure (70461)
  [70461, { coreImage: "相手に心理的負担をかけないと明示する緩和句がコアイメージ。", usage: "依頼後の配慮として有効。", synonymDifference: "no pressure vs take your time: 前者は負担軽減、後者は時間配慮。", englishDefinition: "An expression meaning there is no obligation or urgency.", etymology: "pressure（圧力）否定の口語句。" }],
  // I can do that (70462)
  [70462, { coreImage: "依頼遂行が可能であることを明示する受諾表現がコアイメージ。", usage: "業務・日常のどちらでも使える。", synonymDifference: "I can do that vs sure: 前者は実行可能性を明確化。", englishDefinition: "A phrase indicating ability and willingness to do something.", etymology: "can（可能）構文の基本形。" }],
  // say less (70463)
  [70463, { coreImage: "説明不要で理解・同意したことを示す新しめ口語がコアイメージ。", usage: "非常にカジュアル。学習者向けには文脈説明が必要。", synonymDifference: "say less vs got it: 前者は若者口語色が強い。", englishDefinition: "Slang expression meaning I understand and agree.", etymology: "say less（それ以上言わなくていい）から。" }],
  // all yours (70464)
  [70464, { coreImage: "主導権・所有を相手へ渡す譲渡表現がコアイメージ。", usage: "順番交代・質疑移行で便利。", synonymDifference: "all yours vs your turn: 前者は権限委譲まで含む。", englishDefinition: "A phrase meaning it now belongs to or is up to you.", etymology: "all + yours（全部あなたのもの）。" }],
  // smart move (70465)
  [70465, { coreImage: "相手判断を賢明だと評価する短評がコアイメージ。", usage: "助言承認・意思決定評価に使える。", synonymDifference: "smart move vs good idea: 前者は判断行為を評価。", englishDefinition: "A phrase praising a wise decision.", etymology: "smart + move の評価句。" }],
  // works out (70466)
  [70466, { coreImage: "結果として都合よく収まることを示す句動詞がコアイメージ。", usage: "予定・条件の調整結果でよく使う。", synonymDifference: "works out vs works: works out は最終的整合の含意。", englishDefinition: "To end successfully or satisfactorily.", etymology: "work out（解決する・うまくいく）から。" }],
  // figure out (70467)
  [70467, { coreImage: "思考して答えに到達する問題解決句動詞がコアイメージ。", usage: "学習・実務で頻出の重要表現。", synonymDifference: "figure out vs find out: 前者は自力推論、後者は情報入手。", englishDefinition: "To understand or solve something after thinking.", etymology: "figure + out の句動詞化。" }],
  // check back (70468)
  [70468, { coreImage: "後で再確認する再訪問行為がコアイメージ。", usage: "未確定事項へのフォローに使う。", synonymDifference: "check back vs check in: 前者は再確認、後者は到着/報告。", englishDefinition: "To return later to verify or get updated information.", etymology: "check + back（戻って確認）。" }],
  // hold up (70469)
  [70469, { coreImage: "一時停止や遅延を示す多義句動詞がコアイメージ。", usage: "「Hold up!」は停止要求、「what's the hold-up?」は遅延。", synonymDifference: "hold up vs hold on: hold up は停止・遅延含意が強い。", englishDefinition: "To delay, stop, or pause.", etymology: "hold + up の句動詞拡張。" }],
  // back me up (70470)
  [70470, { coreImage: "発言・行動を支援してくれるよう求める後方支援表現がコアイメージ。", usage: "議論・作業で協力依頼に有効。", synonymDifference: "back me up vs help me: 前者は支持・裏付けの意味が強い。", englishDefinition: "To support or defend me.", etymology: "back（後ろ）+ up（支える）比喩。" }],
  // works for us (70511)
  [70511, { coreImage: "条件がチーム全体に適合することを示す合意句がコアイメージ。", usage: "複数人調整の最終確認で使える。", synonymDifference: "works for us vs works for me: 対象が個人か集団かの違い。", englishDefinition: "A phrase meaning a plan is acceptable to our group.", etymology: "work for + us 構文。" }],
  // exactly right (70512)
  [70512, { coreImage: "内容が完全に正しいと強く肯定する評価句がコアイメージ。", usage: "回答確認・同意で使える。", synonymDifference: "exactly right vs right: 前者は一致度の強調。", englishDefinition: "Completely correct.", etymology: "exactly + right の強調連語。" }],
  // I'm all ears (70513)
  [70513, { coreImage: "注意を向けて聞く準備があることを示す慣用句がコアイメージ。", usage: "相談を促す前向き反応として自然。", synonymDifference: "I'm all ears vs I'm listening: 前者はより積極的。", englishDefinition: "An idiom meaning I am listening carefully.", etymology: "耳だけになる比喩表現。" }],
  // no hard feelings (70514)
  [70514, { coreImage: "対立後に遺恨を残さない意思を示す関係修復句がコアイメージ。", usage: "断り・競争後の関係維持に有効。", synonymDifference: "no hard feelings vs sorry: 前者は関係整理、後者は謝罪。", englishDefinition: "An expression meaning no resentment remains.", etymology: "hard feelings（わだかまり）の否定。" }],
  // it happens (70515)
  [70515, { coreImage: "ミスや不運を一般化して受け流す緩和句がコアイメージ。", usage: "相手の失敗を責めない返答として便利。", synonymDifference: "it happens vs that's okay: 前者は不可避性の含意。", englishDefinition: "A phrase meaning such things happen naturally.", etymology: "it happens の省略的慰め表現。" }],
  // check in (70516)
  [70516, { coreImage: "到着報告・状況確認を行う句動詞がコアイメージ。", usage: "ホテル手続き、進捗確認の両方で使う。", synonymDifference: "check in vs check back: 前者は報告・到着、後者は再確認。", englishDefinition: "To report arrival or make contact for updates.", etymology: "check + in（内側で確認）。" }],
  // fill in (70517)
  [70517, { coreImage: "空所を埋める、または代役で補完する句動詞がコアイメージ。", usage: "フォーム記入・代行対応で高頻度。", synonymDifference: "fill in vs fill out: 後者はフォーム全体記入の含意が強い。", englishDefinition: "To complete missing information or substitute for someone.", etymology: "fill + in の補完概念。" }],
  // look over (70518)
  [70518, { coreImage: "内容をざっと点検する確認行為がコアイメージ。", usage: "文書レビュー依頼で自然。", synonymDifference: "look over vs review: review の方が正式で精査的。", englishDefinition: "To examine quickly.", etymology: "look + over（上から見る）比喩。" }],
  // sign off (70519)
  [70519, { coreImage: "連絡・放送・作業を正式に締める終結行為がコアイメージ。", usage: "メールの結び、業務終了連絡で使う。", synonymDifference: "sign off vs log off: 前者は締めくくり、後者はシステム退出。", englishDefinition: "To end communication formally.", etymology: "sign（署名）+ off（終える）。" }],
  // turn in (70520)
  [70520, { coreImage: "課題などを提出する、または就寝する多義句動詞がコアイメージ。", usage: "学習文脈では「提出する」義が重要。", synonymDifference: "turn in vs hand in: 多くの場面で同義。", englishDefinition: "To submit work; also, to go to bed.", etymology: "turn + in の方向比喩。" }],
  // no doubt (70586)
  [70586, { coreImage: "疑いの余地がないことを示す確信副詞句がコアイメージ。", usage: "同意・推量の強化に使える。", synonymDifference: "no doubt vs definitely: no doubt は文脈で推量にもなる。", englishDefinition: "Certainly; without doubt.", etymology: "doubt を否定した強調句。" }],
  // all in (70587)
  [70587, { coreImage: "完全参加・全投入を示す強いコミット表現がコアイメージ。", usage: "計画への本気度を示す場面で使う。", synonymDifference: "all in vs in: 前者は強度が高い。", englishDefinition: "Fully committed or fully involved.", etymology: "all + in の強調構文。" }],
  // back on track (70588)
  [70588, { coreImage: "逸脱後に計画軌道へ戻った状態を示す回復句がコアイメージ。", usage: "進捗報告で有用。", synonymDifference: "back on track vs recovered: 前者は計画文脈に特化。", englishDefinition: "Returned to the intended course.", etymology: "track（軌道）への復帰比喩。" }],
  // call it (70589)
  [70589, { coreImage: "判断を下して終了・決定する口語句がコアイメージ。", usage: "「Let's call it a day」などで終業判断に使う。", synonymDifference: "call it vs decide: 前者は会話的・即断的。", englishDefinition: "To decide or to end something.", etymology: "call（宣言する）の口語拡張。" }],
  // keep it up (70590)
  [70590, { coreImage: "現在の良い行動を継続するよう励ます定型がコアイメージ。", usage: "学習継続の称賛に適する。", synonymDifference: "keep it up vs keep going: 前者は称賛を伴いやすい。", englishDefinition: "Continue the good work.", etymology: "keep + it + up の継続慣用句。" }],
  // make sense (70591)
  [70591, { coreImage: "内容が論理的に理解可能である状態がコアイメージ。", usage: "説明理解確認で「Does that make sense?」が定番。", synonymDifference: "make sense vs be right: 前者は論理整合、後者は正誤。", englishDefinition: "To be understandable or logical.", etymology: "sense（意味）を作る構文。" }],
  // my take (70592)
  [70592, { coreImage: "自分の見解を控えめに提示する意見導入句がコアイメージ。", usage: "議論で主張を柔らかく出せる。", synonymDifference: "my take vs my opinion: 前者は口語で簡潔。", englishDefinition: "My perspective or interpretation.", etymology: "take（見方）名詞化の口語用法。" }],
  // on me (70593)
  [70593, { coreImage: "費用負担や責任を自分が持つと示す短句がコアイメージ。", usage: "会計時「It's on me.」が自然。", synonymDifference: "on me vs my treat: ほぼ同義。on me の方が短い。", englishDefinition: "Paid by me; my responsibility.", etymology: "on（負担が乗る）比喩。" }],
  // right call (70595)
  [70595, { coreImage: "判断が適切だったと評価する短評がコアイメージ。", usage: "意思決定後の承認コメントで使う。", synonymDifference: "right call vs good call: 前者は正しさ、後者は巧さ寄り。", englishDefinition: "A correct decision.", etymology: "call（判断）名詞用法。" }],
  // sit on it (70596)
  [70596, { coreImage: "即断せず時間を置いて判断する保留表現がコアイメージ。", usage: "提案検討時の返答として有効。", synonymDifference: "sit on it vs think about it: 前者は保留ニュアンスが強い。", englishDefinition: "To delay a decision and think about it.", etymology: "sit on（上に留まる）比喩。" }],
  // sounds solid (70597)
  [70597, { coreImage: "提案の信頼性・妥当性を評価する口語同意がコアイメージ。", usage: "計画レビューで前向き評価に使える。", synonymDifference: "sounds solid vs sounds good: 前者は堅実性評価が強い。", englishDefinition: "A phrase meaning the plan seems reliable.", etymology: "solid（堅実）評価語の会話定型。" }],
  // works fine (70600)
  [70600, { coreImage: "十分に機能することを穏やかに示す評価句がコアイメージ。", usage: "完璧ではないが問題ない状況に適する。", synonymDifference: "works fine vs works great: 前者は控えめ評価。", englishDefinition: "A phrase meaning it functions acceptably well.", etymology: "fine（十分良い）を伴う機能評価。" }],
  // you sure (70601)
  [70601, { coreImage: "相手判断の確信度を確認する短縮疑問がコアイメージ。", usage: "口語では「Are you sure?」の省略で使われる。", synonymDifference: "you sure vs are you sure: 後者が文法的に標準。", englishDefinition: "An informal way to ask if someone is certain.", etymology: "are you sure の口語省略。" }],
  // my thoughts exactly (70602)
  [70602, { coreImage: "相手意見と完全一致することを示す同意定型がコアイメージ。", usage: "議論で賛同を強く示せる。", synonymDifference: "my thoughts exactly vs exactly: 前者は主観一致を明示。", englishDefinition: "A phrase meaning I was thinking the same thing.", etymology: "thoughts + exactly の一致表現。" }],
  // you know it (70605)
  [70605, { coreImage: "相手の期待どおりであると勢いよく肯定する口語応答がコアイメージ。", usage: "親しい間柄向け。フォーマル場面は不向き。", synonymDifference: "you know it vs absolutely: 前者は砕けたノリが強い。", englishDefinition: "An informal emphatic yes.", etymology: "you know it（分かってるだろ）由来。" }],
  // all yours now (70606)
  [70606, { coreImage: "今この時点で主導権を相手に渡す移譲表現がコアイメージ。", usage: "発表・作業交代の橋渡しに使える。", synonymDifference: "all yours now vs your turn: 前者は移譲の丁寧さがある。", englishDefinition: "A phrase handing control over to someone now.", etymology: "all yours + now の時間指定。" }],
  // I'm in (70607)
  [70607, { coreImage: "参加意志を即答で示す短い同意表現がコアイメージ。", usage: "誘いへの快諾で非常に高頻度。", synonymDifference: "I'm in vs count me in: 後者はやや強調。", englishDefinition: "I agree to join.", etymology: "in（参加側）比喩。" }],
  // I'm out (70608)
  [70608, { coreImage: "参加辞退を短く示す不参加表現がコアイメージ。", usage: "断る際は理由を添えると丁寧。", synonymDifference: "I'm out vs I can't: 前者は決定表明、後者は能力/都合理由。", englishDefinition: "I am not participating.", etymology: "out（外側）比喩。" }],
  // good call there (70609)
  [70609, { coreImage: "その場の判断を評価する会話的賞賛がコアイメージ。", usage: "チーム作業で判断承認に有効。", synonymDifference: "good call there vs smart move: 近いが前者は判断一点を評価。", englishDefinition: "A phrase praising a decision just made.", etymology: "good call の派生会話形。" }],
  // let's roll (70610)
  [70610, { coreImage: "準備完了後に行動開始を宣言する掛け声がコアイメージ。", usage: "移動・作業開始でテンポを作る。", synonymDifference: "let's roll vs let's go: 前者は口語的で勢いがある。", englishDefinition: "An informal phrase meaning let's start or leave now.", etymology: "roll（転がる）から行動開始比喩。" }],
  // sounds right (70712)
  [70712, { coreImage: "内容が妥当に聞こえることを示す控えめ同意がコアイメージ。", usage: "断定を避けた同意に使える。", synonymDifference: "sounds right vs is right: 前者は判断保留を含む。", englishDefinition: "A phrase meaning that seems correct.", etymology: "sound + right の知覚評価。" }],
  // I get it (70713)
  [70713, { coreImage: "説明内容を理解したことを示す高頻度返答がコアイメージ。", usage: "学習場面で理解確認に有効。", synonymDifference: "I get it vs I know: 前者は今理解したニュアンス。", englishDefinition: "I understand it.", etymology: "get（得る）から理解義への拡張。" }],
  // you got this (70718)
  [70718, { coreImage: "相手の達成可能性を信じて励ます応援定型がコアイメージ。", usage: "試験・発表前の声かけで効果的。", synonymDifference: "you got this vs good luck: 前者は能力への確信を強調。", englishDefinition: "An encouraging phrase meaning you can do it.", etymology: "have got（持っている）から能力所有比喩。" }],
  // works great (70720)
  [70720, { coreImage: "対象が非常にうまく機能することを示す強め評価がコアイメージ。", usage: "提案採用後の結果報告に使える。", synonymDifference: "works great vs works fine: 前者は評価が高い。", englishDefinition: "A phrase meaning it works very well.", etymology: "great を添えた機能評価表現。" }],
  // apparently (70041)
  [70041, { coreImage: "伝聞情報を断定せず導入する副詞がコアイメージ。", usage: "情報源が間接的なときに使う。", synonymDifference: "apparently vs obviously: 前者は伝聞、後者は自明性。", englishDefinition: "As far as one knows or has heard.", etymology: "apparent（明らかな）+ -ly。" }],
  // supposedly (70042)
  [70042, { coreImage: "真偽未確定の伝聞を距離を置いて示す副詞がコアイメージ。", usage: "噂・未確認情報に使う。", synonymDifference: "supposedly vs apparently: supposedly の方が懐疑含み。", englishDefinition: "According to what is generally believed or said.", etymology: "suppose 由来の副詞。" }],
  // literally (70043)
  [70043, { coreImage: "比喩でなく文字通りを示す副詞がコアイメージ。", usage: "口語では強調語としても使われるが誤解に注意。", synonymDifference: "literally vs actually: 前者は字義、後者は事実。", englishDefinition: "In a literal or exact sense.", etymology: "literal + -ly。" }],
  // honestly (70044)
  [70044, { coreImage: "率直さを前置きして本音を示す談話副詞がコアイメージ。", usage: "意見表明前の緩衝として有効。", synonymDifference: "honestly vs frankly: 近いが frankly の方が硬め。", englishDefinition: "In an honest way; used to introduce a truthful opinion.", etymology: "honest + -ly。" }],
  // ridiculous (70045)
  [70045, { coreImage: "合理性を欠くほど馬鹿げている評価がコアイメージ。", usage: "感情が強く出るため語調に注意。", synonymDifference: "ridiculous vs silly: ridiculous の方が強い非難。", englishDefinition: "Absurd or deserving mockery.", etymology: "ラテン語 ridere（笑う）系。" }],
  // absolutely (70046)
  [70046, { coreImage: "完全一致・全面肯定を示す強調副詞がコアイメージ。", usage: "同意返答「Absolutely.」で高頻度。", synonymDifference: "absolutely vs definitely: absolutely は全面性が強い。", englishDefinition: "Completely; certainly.", etymology: "absolute + -ly。" }],
  // totally (70047)
  [70047, { coreImage: "程度の高さを口語的に強調する副詞がコアイメージ。", usage: "カジュアル同意「Totally.」で使える。", synonymDifference: "totally vs completely: totally の方が口語的。", englishDefinition: "Completely (informal in many uses).", etymology: "total + -ly。" }],
  // frustrating (70048)
  [70048, { coreImage: "思い通りにならずいら立ちを生む性質がコアイメージ。", usage: "状況・作業の難しさ評価に使う。", synonymDifference: "frustrating vs annoying: 前者は目的阻害の含意が強い。", englishDefinition: "Causing feelings of annoyance due to inability to progress.", etymology: "frustrate + -ing。" }],
  // awkward (70049)
  [70049, { coreImage: "場面が気まずい・ぎこちない状態を示す形容がコアイメージ。", usage: "人間関係の空気描写で頻出。", synonymDifference: "awkward vs uncomfortable: awkward は社会的気まずさ寄り。", englishDefinition: "Causing embarrassment or difficulty in social situations.", etymology: "語源不詳だが中英語期から「ぎこちない」義。" }],
  // exhausted (70050)
  [70050, { coreImage: "エネルギーを使い切った疲労状態がコアイメージ。", usage: "非常に疲れた状態を強く示す。", synonymDifference: "exhausted vs tired: exhausted の方が程度が強い。", englishDefinition: "Extremely tired.", etymology: "exhaust（使い果たす）の過去分詞形。" }],
  // overwhelmed (70051)
  [70051, { coreImage: "量や感情に圧倒され処理しきれない状態がコアイメージ。", usage: "仕事量・感情の両方で使える。", synonymDifference: "overwhelmed vs stressed: 前者は圧倒感、後者はストレス全般。", englishDefinition: "Feeling unable to cope because too much is happening.", etymology: "overwhelm（圧倒する）由来。" }],
  // meanwhile (70052)
  [70052, { coreImage: "同時進行の別事象をつなぐ時間副詞がコアイメージ。", usage: "文頭接続で流れを整理できる。", synonymDifference: "meanwhile vs in the meantime: ほぼ同義。", englishDefinition: "At the same time; during the same period.", etymology: "mean + while（その間）。" }],
  // regardless (70053)
  [70053, { coreImage: "条件差を無視して方針を維持する副詞がコアイメージ。", usage: "「regardless of ...」形が高頻度。", synonymDifference: "regardless vs anyway: 前者は条件非依存を明示。", englishDefinition: "Without being affected by something.", etymology: "regard + -less。" }],
  // whatsoever (70054)
  [70054, { coreImage: "否定文で「少しも〜ない」を強調する語がコアイメージ。", usage: "no/none/not と組み合わせる。", synonymDifference: "whatsoever vs at all: 前者はやや強調が強く硬め。", englishDefinition: "At all (used for emphasis, especially in negatives).", etymology: "what + so + ever の強調形。" }],
  // chill (70056)
  [70056, { coreImage: "緊張を下げて落ち着くことを表す口語語がコアイメージ。", usage: "動詞・形容詞で柔軟に使われる。", synonymDifference: "chill vs relax: chill の方がカジュアル。", englishDefinition: "To relax; calm.", etymology: "chill（冷える）から感情比喩へ。" }],
  // hassle (70058)
  [70058, { coreImage: "手間や面倒がかかる負担感がコアイメージ。", usage: "「It's a hassle.」で不便さを簡潔に示せる。", synonymDifference: "hassle vs trouble: hassle は日常的な面倒感。", englishDefinition: "An inconvenience or annoying difficulty.", etymology: "米口語起源語。" }],
  // presumably (70060)
  [70060, { coreImage: "合理的推定に基づく控えめ断定がコアイメージ。", usage: "客観寄りの推測導入に向く。", synonymDifference: "presumably vs probably: presumably は根拠前提が強い。", englishDefinition: "Used to convey what is assumed to be true.", etymology: "presume + -ably。" }],
  // fair enough (70131)
  [70131, { coreImage: "相手の言い分に妥当性を認める受容表現がコアイメージ。", usage: "完全同意でなくても受け入れを示せる。", synonymDifference: "fair enough vs exactly: 前者は限定的同意。", englishDefinition: "An expression accepting that something is reasonable.", etymology: "fair + enough の評価句。" }],
  // at least (70132)
  [70132, { coreImage: "最低限の肯定点を確保する限定副詞句がコアイメージ。", usage: "不満緩和や比較に便利。", synonymDifference: "at least vs anyway: 前者は下限提示、後者は話題処理。", englishDefinition: "Not less than; in any case at minimum.", etymology: "least（最小）由来。" }],
  // in that case (70133)
  [70133, { coreImage: "前提条件を受けて結論を切り替える接続句がコアイメージ。", usage: "条件反応の会話展開で使える。", synonymDifference: "in that case vs then: 前者は条件依存を明示。", englishDefinition: "If that is true, then...", etymology: "in + that case の条件接続。" }],
  // on second thought (70134)
  [70134, { coreImage: "再考後に判断を修正する転換句がコアイメージ。", usage: "意見変更を自然に示せる。", synonymDifference: "on second thought vs actually: 前者は再考の明示。", englishDefinition: "After reconsidering.", etymology: "second thought（再考）慣用句。" }],
  // to be honest (70135)
  [70135, { coreImage: "率直な本音を導入する前置き句がコアイメージ。", usage: "否定的意見を柔らかく出すのに有効。", synonymDifference: "to be honest vs honestly: 前者は句、後者は副詞。", englishDefinition: "Used before stating a truthful personal opinion.", etymology: "be honest 不定詞句。" }],
  // to be fair (70136)
  [70136, { coreImage: "一方的評価を避け公平観点を補う前置き句がコアイメージ。", usage: "反対意見への配慮を示せる。", synonymDifference: "to be fair vs actually: 前者は公平性の枠付け。", englishDefinition: "Used to introduce a balanced consideration.", etymology: "fair（公平）を強調する定型。" }],
  // no offense (70137)
  [70137, { coreImage: "相手を傷つける意図がないと先に示す緩衝句がコアイメージ。", usage: "実際には強く聞こえることもあり慎重運用が必要。", synonymDifference: "no offense vs sorry: 前者は事前緩衝、後者は事後謝罪。", englishDefinition: "A phrase used before a potentially offensive remark.", etymology: "offense（侮辱）否定の慣用句。" }],
  // my fault (70138)
  [70138, { coreImage: "責任帰属を自分に置く明確な謝罪表現がコアイメージ。", usage: "my bad よりやや中立で明確。", synonymDifference: "my fault vs my bad: 前者は責任認知が強い。", englishDefinition: "An expression admitting responsibility for a mistake.", etymology: "fault（過失）所有表現。" }],
  // it depends (70139)
  [70139, { coreImage: "単一答えでなく条件依存だと示す返答がコアイメージ。", usage: "続けて条件を具体化すると親切。", synonymDifference: "it depends vs maybe: 前者は条件提示を伴う。", englishDefinition: "The answer varies according to conditions.", etymology: "depend（依存する）構文。" }],
  // I doubt it (70140)
  [70140, { coreImage: "可能性が低いという懐疑を示す短文がコアイメージ。", usage: "直接否定よりやや婉曲。", synonymDifference: "I doubt it vs no way: 前者は控えめ懐疑。", englishDefinition: "I do not think that is likely.", etymology: "doubt（疑う）動詞句。" }],
  // makes sense (70141)
  [70141, { coreImage: "論理的に理解できることを承認する評価句がコアイメージ。", usage: "説明理解の相づちとして有用。", synonymDifference: "makes sense vs sounds good: 前者は論理評価。", englishDefinition: "Is understandable or logical.", etymology: "make sense 構文。" }],
  // whatever works (70142)
  [70142, { coreImage: "方法にこだわらず有効なら受け入れる柔軟姿勢がコアイメージ。", usage: "実務的妥協を示す返答として便利。", synonymDifference: "whatever works vs anything is fine: 前者は実効性重視。", englishDefinition: "Any method is acceptable if it works.", etymology: "whatever + works の許容構文。" }],
  // I am down (70143)
  [70143, { coreImage: "提案に乗る意思を示す口語同意がコアイメージ。", usage: "若めのカジュアル会話で自然。", synonymDifference: "I'm down vs I'm in: 前者は口語色がより強い。", englishDefinition: "An informal phrase meaning willing to join.", etymology: "down（同意する）の米口語用法。" }],
  // not really (70144)
  [70144, { coreImage: "完全否定を避けるやわらかい否定返答がコアイメージ。", usage: "相手を立てつつ否定したい時に有効。", synonymDifference: "not really vs no: 前者は緩い否定。", englishDefinition: "Not exactly; not particularly.", etymology: "really を否定した婉曲形。" }],
  // you know what (70145)
  [70145, { coreImage: "話題転換や決意表明の導入に使う会話マーカーがコアイメージ。", usage: "続く内容を聞かせる前置きとして機能。", synonymDifference: "you know what vs by the way: 前者は感情的導入になりやすい。", englishDefinition: "A phrase used to introduce a thought or decision.", etymology: "you know + what の談話化。" }],
  // I see your point (70206)
  [70206, { coreImage: "相手論点の妥当性理解を示す対話維持表現がコアイメージ。", usage: "反対意見を続ける前のクッションに最適。", synonymDifference: "I see your point vs I agree: 前者は理解、後者は同意。", englishDefinition: "I understand the point you are making.", etymology: "see + point の理解比喩。" }],
  // that reminds me (70207)
  [70207, { coreImage: "関連記憶の想起をきっかけに話題をつなぐ句がコアイメージ。", usage: "自然な話題遷移を作れる。", synonymDifference: "that reminds me vs by the way: 前者は連想ベース。", englishDefinition: "A phrase used when something makes you remember another thing.", etymology: "remind（思い出させる）構文。" }],
  // at the moment (70208)
  [70208, { coreImage: "現在時点での暫定状態を示す時間句がコアイメージ。", usage: "恒久でない現状説明に向く。", synonymDifference: "at the moment vs now: 前者は「現時点では」の含意。", englishDefinition: "Now; at this time.", etymology: "moment（瞬間）前置詞句。" }],
  // for now (70209)
  [70209, { coreImage: "将来変更の余地を残した暫定判断を示す句がコアイメージ。", usage: "方針の一時決定に使いやすい。", synonymDifference: "for now vs for good: 前者は一時的、後者は恒久的。", englishDefinition: "Temporarily; at present.", etymology: "for + now の暫定表現。" }],
  // to be precise (70210)
  [70210, { coreImage: "数値や内容を正確化して補正する前置き句がコアイメージ。", usage: "具体値提示の直前で有効。", synonymDifference: "to be precise vs exactly: 前者は補足導入、後者は同意/強調。", englishDefinition: "Used to introduce exact details.", etymology: "precise（正確）不定詞句。" }],
  // to make matters worse (70211)
  [70211, { coreImage: "悪条件がさらに重なることを示す接続句がコアイメージ。", usage: "悪化の段階を説明するのに適切。", synonymDifference: "to make matters worse vs moreover: 前者は悪化方向限定。", englishDefinition: "Used to introduce an additional negative factor.", etymology: "matter（事態）+ worse 比較級。" }],
  // as a result (70212)
  [70212, { coreImage: "原因から結果への因果関係を明示する接続句がコアイメージ。", usage: "説明文・会話どちらでも高頻度。", synonymDifference: "as a result vs so: 前者はより明示的でややフォーマル。", englishDefinition: "Consequently; therefore.", etymology: "result（結果）句。" }],
  // in the meantime (70213)
  [70213, { coreImage: "主イベントまでの間に行う行動を示す時間句がコアイメージ。", usage: "並行作業の指示で使える。", synonymDifference: "in the meantime vs meanwhile: ほぼ同義で置換可能。", englishDefinition: "During the intervening time.", etymology: "mean time（その間の時間）由来。" }],
  // at first (70214)
  [70214, { coreImage: "時間の起点段階を示す副詞句がコアイメージ。", usage: "後続の変化と対で使うと自然。", synonymDifference: "at first vs first: 前者は時間経過対比に強い。", englishDefinition: "In the beginning; initially.", etymology: "at + first の時間句。" }],
  // in advance (70215)
  [70215, { coreImage: "事前準備・事前実施を示す副詞句がコアイメージ。", usage: "依頼文で「Thanks in advance」が定番。", synonymDifference: "in advance vs beforehand: ほぼ同義。", englishDefinition: "Before a particular time or event.", etymology: "advance（前進）由来。" }],
  // for real (70216)
  [70216, { coreImage: "冗談でなく本当だと強調する口語句がコアイメージ。", usage: "驚き確認にも使う。", synonymDifference: "for real vs seriously: 前者の方が口語的。", englishDefinition: "Really; seriously (informal).", etymology: "for + real の強調句。" }],
  // you nailed it (70217)
  [70217, { coreImage: "答えや行為が的確だったと賞賛する表現がコアイメージ。", usage: "正答時のポジティブフィードバックに最適。", synonymDifference: "you nailed it vs exactly: 前者は達成評価を含む。", englishDefinition: "You did it exactly right.", etymology: "nail（打ち当てる）比喩。" }],
  // give me a break (70218)
  [70218, { coreImage: "不満や disbelief を強く示す反応句がコアイメージ。", usage: "強く聞こえるので場面注意。", synonymDifference: "give me a break vs come on: 前者の方がいら立ちが強い。", englishDefinition: "An expression of annoyance or disbelief.", etymology: "break（休み）要求から反語化。" }],
  // I hear you (70219)
  [70219, { coreImage: "相手感情・主張を理解していると示す共感句がコアイメージ。", usage: "同意しない場合でも関係維持に有効。", synonymDifference: "I hear you vs I agree: 前者は理解、後者は同意。", englishDefinition: "I understand what you are saying or feeling.", etymology: "hear の理解拡張用法。" }],
  // that's fair (70220)
  [70220, { coreImage: "主張や条件が妥当だと認める評価句がコアイメージ。", usage: "議論の摩擦を下げる返答として使える。", synonymDifference: "that's fair vs that's right: 前者は公平性評価。", englishDefinition: "That is reasonable.", etymology: "fair（公平）評価語。" }],
  // that being the case (70271)
  [70271, { coreImage: "前提を受けて結論へ進む論理接続句がコアイメージ。", usage: "会話でもややフォーマル。", synonymDifference: "that being the case vs in that case: 前者の方が硬い。", englishDefinition: "If that is so; therefore.", etymology: "be 動詞分詞構文。" }],
  // as expected (70272)
  [70272, { coreImage: "予想どおりであることを示す評価句がコアイメージ。", usage: "結果報告で簡潔に使える。", synonymDifference: "as expected vs unsurprisingly: 前者が中立。", englishDefinition: "In the way that was predicted.", etymology: "expect の過去分詞句。" }],
  // to be exact (70273)
  [70273, { coreImage: "曖昧さを減らし正確値を提示する補正句がコアイメージ。", usage: "数値・時刻の詳細化に使う。", synonymDifference: "to be exact vs to be precise: ほぼ同義。", englishDefinition: "Used to give precise details.", etymology: "exact（正確）不定詞句。" }],
  // if possible (70274)
  [70274, { coreImage: "条件付き依頼として柔らかさを加える句がコアイメージ。", usage: "命令を和らげる丁寧化に有効。", synonymDifference: "if possible vs if you can: 前者はより中立。", englishDefinition: "If it can be done.", etymology: "possible 条件節。" }],
  // for instance (70275)
  [70275, { coreImage: "具体例導入で抽象説明を補う接続句がコアイメージ。", usage: "論旨を分かりやすくする。", synonymDifference: "for instance vs for example: ほぼ同義。", englishDefinition: "For example.", etymology: "instance（実例）由来。" }],
  // as far as (70276)
  [70276, { coreImage: "範囲・程度・知識限界を示す枠付け句がコアイメージ。", usage: "as far as I know の形が高頻度。", synonymDifference: "as far as vs regarding: 前者は範囲限定が強い。", englishDefinition: "To the extent that; with regard to.", etymology: "far（範囲）比較構文。" }],
  // either way (70277)
  [70277, { coreImage: "どちらの場合でも結論が変わらないことを示す句がコアイメージ。", usage: "選択肢整理後の締めに使いやすい。", synonymDifference: "either way vs anyway: 前者は二択前提が明確。", englishDefinition: "In either case.", etymology: "either + way 構文。" }],
  // good call (70278)
  [70278, { coreImage: "判断が良かったと評価する短評がコアイメージ。", usage: "意思決定承認で頻出。", synonymDifference: "good call vs smart move: 近いが前者は判断行為中心。", englishDefinition: "A good decision.", etymology: "call（判断）名詞用法。" }],
  // I can relate (70279)
  [70279, { coreImage: "自分にも同様経験があると示す共感表現がコアイメージ。", usage: "相手の負担感を軽減する会話で有効。", synonymDifference: "I can relate vs I understand: 前者は経験共有含意。", englishDefinition: "I understand because I have had similar experience.", etymology: "relate（関連づける）由来。" }],
  // that's on me (70280)
  [70280, { coreImage: "責任を自分で引き受ける表現がコアイメージ。", usage: "問題発生時の信頼回復に有効。", synonymDifference: "that's on me vs my bad: 前者は責任明示が強い。", englishDefinition: "That is my responsibility.", etymology: "on me（負担が自分にある）比喩。" }],
  // from now on (70321)
  [70321, { coreImage: "現在以降の継続方針を示す時間句がコアイメージ。", usage: "ルール変更や習慣化宣言で使う。", synonymDifference: "from now on vs from now: 前者が定型。", englishDefinition: "Starting now and continuing into the future.", etymology: "from + now + on 構文。" }],
  // if not (70322)
  [70322, { coreImage: "最低限条件を示す控えめ修正句がコアイメージ。", usage: "A, if not B の形で使う。", synonymDifference: "if not vs at least: 前者は比較・修正構文。", englishDefinition: "Used to introduce an alternative or minimum claim.", etymology: "if + not 条件句。" }],
  // that makes sense (70323)
  [70323, { coreImage: "説明が論理的に納得できると示す返答がコアイメージ。", usage: "理解確認の終点として便利。", synonymDifference: "that makes sense vs I get it: 前者は論理、後者は理解行為。", englishDefinition: "That is understandable and logical.", etymology: "make sense 構文。" }],
  // you've got a point (70324)
  [70324, { coreImage: "相手主張の一部妥当性を認める表現がコアイメージ。", usage: "反論前のクッションに有効。", synonymDifference: "you've got a point vs you're right: 前者は部分同意。", englishDefinition: "You make a valid point.", etymology: "point（論点）評価句。" }],
  // at any rate (70325)
  [70325, { coreImage: "細部を離れて本筋を進める接続句がコアイメージ。", usage: "話題整理で useful。", synonymDifference: "at any rate vs anyway: 前者がやや硬い。", englishDefinition: "In any case; anyway.", etymology: "rate（観点）由来の慣用句。" }],
  // for one thing (70326)
  [70326, { coreImage: "複数理由のうち一つを提示する導入句がコアイメージ。", usage: "for one thing ... for another ... で使う。", synonymDifference: "for one thing vs first: 前者は理由列挙特化。", englishDefinition: "Used to introduce one reason among several.", etymology: "one thing（一事項）提示。" }],
  // on reflection (70327)
  [70327, { coreImage: "熟考後の見直し結果を示す句がコアイメージ。", usage: "意見修正を丁寧に導ける。", synonymDifference: "on reflection vs on second thought: 前者はやや書き言葉。", englishDefinition: "After thinking carefully.", etymology: "reflection（熟考）前置詞句。" }],
  // to be frank (70328)
  [70328, { coreImage: "率直な意見を述べる前置き句がコアイメージ。", usage: "厳しい内容前の緩衝として使う。", synonymDifference: "to be frank vs to be honest: 前者がやや硬い。", englishDefinition: "Used before speaking very openly.", etymology: "frank（率直）不定詞句。" }],
  // it rings a bell (70329)
  [70329, { coreImage: "完全ではないが聞き覚えがある感覚を示す慣用句がコアイメージ。", usage: "記憶喚起の会話で自然。", synonymDifference: "it rings a bell vs I remember: 前者は曖昧記憶。", englishDefinition: "It sounds familiar.", etymology: "bell が鳴る比喩で記憶喚起を表現。" }],
  // I get your drift (70330)
  [70330, { coreImage: "相手の意図・大意を把握したと示す口語句がコアイメージ。", usage: "逐語ではなく趣旨理解を示す。", synonymDifference: "I get your drift vs I understand: 前者はニュアンス理解寄り。", englishDefinition: "I understand what you mean.", etymology: "drift（趣旨・流れ）由来。" }],
  // for better (70371)
  [70371, { coreImage: "改善方向への変化を示す比較句がコアイメージ。", usage: "for better or worse の一部として使われることが多い。", synonymDifference: "for better vs better: 前者は変化方向を示す。", englishDefinition: "Toward a better condition.", etymology: "better 比較級表現。" }],
  // to be safe (70372)
  [70372, { coreImage: "リスク回避のため慎重策を選ぶ目的句がコアイメージ。", usage: "「Just to be safe」で予防行動を正当化。", synonymDifference: "to be safe vs just in case: 近いが前者は安全目的を明示。", englishDefinition: "In order to avoid risk.", etymology: "safe 目的不定詞。" }],
  // in reality (70373)
  [70373, { coreImage: "見かけと対比して実際面を示す句がコアイメージ。", usage: "誤解修正や現実提示で使う。", synonymDifference: "in reality vs actually: 前者は対比構図が強い。", englishDefinition: "In fact; in real life.", etymology: "reality（現実）前置詞句。" }],
  // as it stands (70374)
  [70374, { coreImage: "現状ベースで判断する枠付け句がコアイメージ。", usage: "条件が変わり得る前提を残せる。", synonymDifference: "as it stands vs currently: 前者は現状評価の含意。", englishDefinition: "In the current situation.", etymology: "stand（状態にある）構文。" }],
  // if needed (70375)
  [70375, { coreImage: "必要が生じた場合のみ実施する条件句がコアイメージ。", usage: "手順を柔軟化できる。", synonymDifference: "if needed vs if necessary: ほぼ同義。", englishDefinition: "If it becomes necessary.", etymology: "need の受動分詞句。" }],
  // point taken (70376)
  [70376, { coreImage: "相手の指摘を受け止めたことを示す短句がコアイメージ。", usage: "議論の熱を下げる効果がある。", synonymDifference: "point taken vs you're right: 前者は受領表現。", englishDefinition: "I understand and accept your point.", etymology: "take a point の受動化。" }],
  // fair point (70377)
  [70377, { coreImage: "主張が妥当であると認める評価句がコアイメージ。", usage: "部分同意の返答として使いやすい。", synonymDifference: "fair point vs good point: 前者は公平性含意。", englishDefinition: "A valid and reasonable point.", etymology: "fair + point。" }],
  // that figures (70378)
  [70378, { coreImage: "事情から見て予想どおりだと示す口語句がコアイメージ。", usage: "皮肉や諦めのニュアンスも出る。", synonymDifference: "that figures vs as expected: 前者は口語色が強い。", englishDefinition: "That is understandable or predictable.", etymology: "figure（合う）口語用法。" }],
  // I see (70379)
  [70379, { coreImage: "理解・納得の最小返答として機能する句がコアイメージ。", usage: "説明を受けた直後の相づちに最適。", synonymDifference: "I see vs I get it: 前者はやや中立。", englishDefinition: "I understand.", etymology: "see の理解比喩。" }],
  // I hear that (70380)
  [70380, { coreImage: "相手の感情・経験への共感を軽く示す句がコアイメージ。", usage: "カジュアル共感として有効。", synonymDifference: "I hear that vs I hear you: 後者の方が相手主張への受容が強い。", englishDefinition: "An informal expression of empathy or agreement.", etymology: "hear の共感用法。" }],
  // in my view (70421)
  [70421, { coreImage: "主観的見解であることを明示する意見導入句がコアイメージ。", usage: "断定を和らげる効果がある。", synonymDifference: "in my view vs I think: 前者がやや硬い。", englishDefinition: "In my opinion.", etymology: "view（見解）前置詞句。" }],
  // at this point (70422)
  [70422, { coreImage: "議論や時間の現在段階を示す句がコアイメージ。", usage: "進行状況の中間整理に使う。", synonymDifference: "at this point vs now: 前者は文脈段階を示す。", englishDefinition: "At this stage or moment.", etymology: "point（時点）句。" }],
  // to clarify (70423)
  [70423, { coreImage: "誤解防止のため説明を明確化する導入句がコアイメージ。", usage: "補足説明の冒頭で使う。", synonymDifference: "to clarify vs in other words: 前者は明確化目的。", englishDefinition: "Used to make something clearer.", etymology: "clarify 不定詞句。" }],
  // for now at least (70424)
  [70424, { coreImage: "暫定判断を最小保証として示す句がコアイメージ。", usage: "将来変更余地を残せる。", synonymDifference: "for now at least vs for now: 前者は限定感が強い。", englishDefinition: "At least for the present time.", etymology: "for now + at least の複合。" }],
  // if anything else (70425)
  [70425, { coreImage: "追加事項の有無を確認する条件句がコアイメージ。", usage: "連絡の締めや確認で使える。", synonymDifference: "if anything else vs anything else?: 前者は条件節。", englishDefinition: "If there is any additional matter.", etymology: "anything else 条件句。" }],
  // that checks out (70426)
  [70426, { coreImage: "情報検証の結果、整合していると示す口語句がコアイメージ。", usage: "確認後の承認返答で便利。", synonymDifference: "that checks out vs that's right: 前者は検証感がある。", englishDefinition: "That appears correct after checking.", etymology: "check out の派生評価。" }],
  // can't argue with that (70427)
  [70427, { coreImage: "反論余地が少ないと認める受容句がコアイメージ。", usage: "部分同意や議論収束に使える。", synonymDifference: "can't argue with that vs exactly: 前者は反論困難の認知。", englishDefinition: "I cannot reasonably disagree with that.", etymology: "argue with の否定構文。" }],
  // now that you mention it (70428)
  [70428, { coreImage: "相手発言を契機に記憶・気づきが生じたことを示す句がコアイメージ。", usage: "連想による話題追加で自然。", synonymDifference: "now that you mention it vs that reminds me: 前者は相手起点が明確。", englishDefinition: "A phrase used when something comes to mind after being mentioned.", etymology: "now that 節構文。" }],
  // by all means (70429)
  [70429, { coreImage: "積極的許可や賛成を示す丁寧表現がコアイメージ。", usage: "「どうぞぜひ」のニュアンス。", synonymDifference: "by all means vs go ahead: 前者はより丁寧。", englishDefinition: "Certainly; please do.", etymology: "all means（あらゆる手段）比喩的強調。" }],
  // good to know (70430)
  [70430, { coreImage: "得た情報の有用性を軽く評価する相づちがコアイメージ。", usage: "会話の流れを止めずに反応できる。", synonymDifference: "good to know vs I see: 前者は情報価値評価を含む。", englishDefinition: "Useful information; thanks for telling me.", etymology: "good + to know の定型句。" }],
  // if I were you (70471)
  [70471, { coreImage: "仮定立場から助言を述べる条件句がコアイメージ。", usage: "助言を柔らかく提示できる。", synonymDifference: "if I were you vs you should: 前者の方が押しつけが弱い。", englishDefinition: "Used to give advice from a hypothetical standpoint.", etymology: "仮定法 were 構文。" }],
  // from what I gather (70472)
  [70472, { coreImage: "断片情報を集めた推定だと示す導入句がコアイメージ。", usage: "確証を避けたい報告で有効。", synonymDifference: "from what I gather vs apparently: 前者は自分の収集過程を示す。", englishDefinition: "Based on what I have understood from available information.", etymology: "gather（集める）比喩。" }],
  // to be clear (70473)
  [70473, { coreImage: "誤解防止のため主張を明示化する前置き句がコアイメージ。", usage: "境界条件の確認で高頻度。", synonymDifference: "to be clear vs to clarify: 前者は強調、後者は補足。", englishDefinition: "Used to make a point explicit.", etymology: "clear 不定詞句。" }],
  // for that reason (70474)
  [70474, { coreImage: "先行理由を受けて帰結を示す因果句がコアイメージ。", usage: "論理展開を明示できる。", synonymDifference: "for that reason vs therefore: 前者は理由参照が明確。", englishDefinition: "Because of that reason.", etymology: "reason 参照句。" }],
  // on that note (70475)
  [70475, { coreImage: "直前話題を受けて締め・転換を行う接続句がコアイメージ。", usage: "会話終了や次話題移行に使える。", synonymDifference: "on that note vs by the way: 前者は直前内容に接続。", englishDefinition: "With that point in mind; as a transition.", etymology: "note（点）前置詞句。" }],
  // as planned (70476)
  [70476, { coreImage: "計画どおりに進行している状態を示す句がコアイメージ。", usage: "進捗報告で簡潔に使える。", synonymDifference: "as planned vs as expected: 前者は計画一致、後者は予想一致。", englishDefinition: "According to the plan.", etymology: "plan の過去分詞句。" }],
  // face to face (70477)
  [70477, { coreImage: "対面で直接やり取りする状態がコアイメージ。", usage: "重要話題での対話手段指定に有効。", synonymDifference: "face to face vs in person: 近いが前者は対面性を強調。", englishDefinition: "In direct personal contact.", etymology: "face の反復句。" }],
  // my understanding is (70478)
  [70478, { coreImage: "自分の理解範囲を前置きして主張する句がコアイメージ。", usage: "断定を和らげつつ情報提示できる。", synonymDifference: "my understanding is vs I think: 前者は情報理解ベース。", englishDefinition: "As I understand it...", etymology: "understanding 名詞句。" }],
  // that explains it (70479)
  [70479, { coreImage: "疑問の原因が判明したことを示す反応句がコアイメージ。", usage: "理由提示を受けた納得反応で自然。", synonymDifference: "that explains it vs I see: 前者は因果理解を明示。", englishDefinition: "Now I understand the reason.", etymology: "explain 構文。" }],
  // sounds about right (70480)
  [70480, { coreImage: "厳密ではないが概ね妥当と判断する句がコアイメージ。", usage: "概算・推定確認で使いやすい。", synonymDifference: "sounds about right vs sounds right: 前者は概ね感を含む。", englishDefinition: "Seems approximately correct.", etymology: "about の近似用法。" }],
  // to be honest with you (70521)
  [70521, { coreImage: "相手への率直性を強調する前置き句がコアイメージ。", usage: "率直意見前の丁寧な導入。", synonymDifference: "to be honest with you vs to be honest: 前者は対人性を強調。", englishDefinition: "Used to introduce a candid opinion.", etymology: "with you 付加で対象明示。" }],
  // in this case (70522)
  [70522, { coreImage: "一般論ではなく当該事例に限定する句がコアイメージ。", usage: "例外処理の説明で有効。", synonymDifference: "in this case vs generally: 前者は個別限定。", englishDefinition: "In this specific situation.", etymology: "case（事例）句。" }],
  // even so (70523)
  [70523, { coreImage: "逆条件があっても結論を維持する逆接句がコアイメージ。", usage: "論理接続でややフォーマル。", synonymDifference: "even so vs still: 前者が文語寄り。", englishDefinition: "Despite that; nevertheless.", etymology: "even + so の逆接慣用。" }],
  // by the same token (70524)
  [70524, { coreImage: "同じ論理で別結論へ拡張する接続句がコアイメージ。", usage: "論証会話でやや上級。", synonymDifference: "by the same token vs similarly: 前者は論理対応が強い。", englishDefinition: "For the same reason; similarly.", etymology: "token（しるし）由来慣用。" }],
  // if that makes sense (70525)
  [70525, { coreImage: "説明が伝わっているかを確認する緩和句がコアイメージ。", usage: "長い説明の終端で有効。", synonymDifference: "if that makes sense vs do you understand?: 前者が柔らかい。", englishDefinition: "Used to check whether an explanation is understandable.", etymology: "make sense 条件節。" }],
  // taking everything into account (70526)
  [70526, { coreImage: "全要素を考慮した総合判断を示す句がコアイメージ。", usage: "結論前の整理表現として使える。", synonymDifference: "taking everything into account vs overall: 前者は考慮過程を明示。", englishDefinition: "Considering all factors.", etymology: "take ... into account 構文。" }],
  // as anticipated (70527)
  [70527, { coreImage: "予測どおりの結果だと示す句がコアイメージ。", usage: "ややフォーマルな報告向き。", synonymDifference: "as anticipated vs as expected: 前者がやや硬い。", englishDefinition: "As expected beforehand.", etymology: "anticipate 過去分詞句。" }],
  // from my side (70528)
  [70528, { coreImage: "自分側の事情・立場から述べる枠付け句がコアイメージ。", usage: "調整連絡で視点を明確化できる。", synonymDifference: "from my side vs on my end: 近いが前者はやや非ネイティブ寄り。", englishDefinition: "From my perspective or responsibility area.", etymology: "side（側）視点表現。" }],
  // for the moment (70529)
  [70529, { coreImage: "短期的な現時点に限定する時間句がコアイメージ。", usage: "暫定運用の明示に使う。", synonymDifference: "for the moment vs for now: ほぼ同義。", englishDefinition: "For now; temporarily.", etymology: "moment 句。" }],
  // this checks out (70530)
  [70530, { coreImage: "目前の情報が検証上問題ないと示す句がコアイメージ。", usage: "レビュー・監査会話で有用。", synonymDifference: "this checks out vs this is right: 前者は確認済み含意。", englishDefinition: "This appears valid after checking.", etymology: "check out 派生評価。" }],
  // as far as I can tell (70611)
  [70611, { coreImage: "観測範囲内での判断だと限定する句がコアイメージ。", usage: "断定回避に有効。", synonymDifference: "as far as I can tell vs I think: 前者は観測根拠を示す。", englishDefinition: "As far as I can judge from what I know.", etymology: "as far as 範囲構文。" }],
  // in that sense (70613)
  [70613, { coreImage: "特定観点に限定して妥当性を示す接続句がコアイメージ。", usage: "概念整理で便利。", synonymDifference: "in that sense vs therefore: 前者は観点限定、後者は因果。", englishDefinition: "From that perspective.", etymology: "sense（意味・観点）句。" }],
  // to my mind (70614)
  [70614, { coreImage: "主観的判断であることを示す意見句がコアイメージ。", usage: "やや文語寄り。", synonymDifference: "to my mind vs in my view: ほぼ同義。", englishDefinition: "In my opinion.", etymology: "mind（考え）句。" }],
  // at least for now (70616)
  [70616, { coreImage: "現時点限定の最低保証を示す句がコアイメージ。", usage: "将来変更余地を残す表現。", synonymDifference: "at least for now vs for now: 前者は限定強調。", englishDefinition: "At least at the present time.", etymology: "at least + for now。" }],
  // in brief (70618)
  [70618, { coreImage: "要点のみを短く述べる導入句がコアイメージ。", usage: "長文説明の要約提示に使える。", synonymDifference: "in brief vs briefly: 前者は句、後者は副詞。", englishDefinition: "In summary; briefly.", etymology: "brief（短い）句。" }],
  // in other words (70619)
  [70619, { coreImage: "言い換えで理解を補助する接続句がコアイメージ。", usage: "難しい説明の平易化に有効。", synonymDifference: "in other words vs that is: 前者の方が会話的。", englishDefinition: "To put it differently.", etymology: "other words 言い換え句。" }],
  // more or less (70620)
  [70620, { coreImage: "完全一致ではない近似状態を示す副詞句がコアイメージ。", usage: "概算・概況説明に適する。", synonymDifference: "more or less vs almost: 前者は幅を残す。", englishDefinition: "Approximately; to some extent.", etymology: "比較級反復による近似表現。" }],
  // on my end (70621)
  [70621, { coreImage: "自分担当範囲の状況を示す実務句がコアイメージ。", usage: "進捗共有で高頻度。", synonymDifference: "on my end vs from my side: 前者がより自然な口語実務表現。", englishDefinition: "From my side of the work or situation.", etymology: "end（担当端）比喩。" }],
  // to put it mildly (70622)
  [70622, { coreImage: "控えめ表現であることを先に示す緩和句がコアイメージ。", usage: "実際は強い評価を含むことが多い。", synonymDifference: "to put it mildly vs frankly: 前者は控えめ宣言。", englishDefinition: "To say it in an understated way.", etymology: "put it + mildly 慣用句。" }],
  // as such (70624)
  [70624, { coreImage: "前述の性質に基づく帰結を示す接続句がコアイメージ。", usage: "ややフォーマルで論理文脈向き。", synonymDifference: "as such vs therefore: 前者は属性起点。", englishDefinition: "In itself; therefore in that capacity.", etymology: "such（そのようなもの）句。" }],
  // that tracks (70627)
  [70627, { coreImage: "情報が整合していて納得できると示す口語句がコアイメージ。", usage: "若めの会話で「筋が通る」の意。", synonymDifference: "that tracks vs makes sense: 前者の方が口語。", englishDefinition: "That makes sense; that fits.", etymology: "track（軌道）比喩。" }],
  // fair point there (70628)
  [70628, { coreImage: "特定の指摘を妥当と認める応答句がコアイメージ。", usage: "反論前の受容として使える。", synonymDifference: "fair point there vs fair point: there で当該点を指示。", englishDefinition: "That particular point is valid.", etymology: "fair point 派生形。" }],
  // in this light (70629)
  [70629, { coreImage: "新情報を踏まえた見方の転換を示す句がコアイメージ。", usage: "再評価の導入に適する。", synonymDifference: "in this light vs in that sense: 前者は情報更新に基づく。", englishDefinition: "From this perspective.", etymology: "light（見方）比喩。" }],
  // under those circumstances (70630)
  [70630, { coreImage: "特定条件下での判断を示す句がコアイメージ。", usage: "事情説明の帰結文で使う。", synonymDifference: "under those circumstances vs then: 前者は条件明示。", englishDefinition: "Given those conditions.", etymology: "circumstance（状況）句。" }],
  // for now though (70631)
  [70631, { coreImage: "暫定結論に逆接ニュアンスを添える句がコアイメージ。", usage: "継続議論の余地を残す。", synonymDifference: "for now though vs for now: though が含みを追加。", englishDefinition: "For now, however.", etymology: "for now + though。" }],
  // if memory serves (70632)
  [70632, { coreImage: "記憶依存であることを示す断定回避句がコアイメージ。", usage: "曖昧記憶の共有に便利。", synonymDifference: "if memory serves vs I think: 前者は記憶由来を明示。", englishDefinition: "If I remember correctly.", etymology: "serve（役立つ）構文。" }],
  // come to think of it (70633)
  [70633, { coreImage: "思考の途中で新たに気づいたことを導く句がコアイメージ。", usage: "自然な補足追加に使える。", synonymDifference: "come to think of it vs now that you mention it: 前者は自発想起。", englishDefinition: "On further thought.", etymology: "come to + think の過程表現。" }],
  // that rings true (70634)
  [70634, { coreImage: "内容が真実味を持って響くと評価する句がコアイメージ。", usage: "証拠不足でも妥当性を感じる場面で使う。", synonymDifference: "that rings true vs that's true: 前者は印象評価。", englishDefinition: "That sounds truthful.", etymology: "ring の比喩的知覚用法。" }],
  // to be fair though (70635)
  [70635, { coreImage: "公平補足を逆接つきで挿入する句がコアイメージ。", usage: "批判一辺倒を避けるのに有効。", synonymDifference: "to be fair though vs to be fair: though が逆接ニュアンス。", englishDefinition: "However, to be fair...", etymology: "to be fair + though。" }],
  // by all accounts (70636)
  [70636, { coreImage: "複数情報源の一致を示す伝聞句がコアイメージ。", usage: "客観性を高める報告に使う。", synonymDifference: "by all accounts vs apparently: 前者は複数証言含意。", englishDefinition: "According to all reports.", etymology: "account（報告）句。" }],
  // as I see it (70640)
  [70640, { coreImage: "自分の解釈枠を明示する意見導入句がコアイメージ。", usage: "主観であることを明確化できる。", synonymDifference: "as I see it vs in my view: ほぼ同義。", englishDefinition: "In my opinion; as I understand the situation.", etymology: "see の認識比喩。" }],
  // as it turns out (70722)
  [70722, { coreImage: "最終的に判明した意外な事実を導入する句がコアイメージ。", usage: "予想とのズレを示す語りに有効。", synonymDifference: "as it turns out vs actually: 前者は結果判明の流れを含む。", englishDefinition: "In the end, it was found that...", etymology: "turn out（判明する）構文。" }],
  // when it comes to (70723)
  [70723, { coreImage: "話題領域を限定して評価・意見を述べる句がコアイメージ。", usage: "得意不得意や方針を領域別に述べる時に有効。", synonymDifference: "when it comes to vs regarding: 前者は会話的。", englishDefinition: "Regarding; in matters related to.", etymology: "come to（〜に至る）慣用句。" }],
  // nonetheless (70061)
  [70061, { coreImage: "逆条件を認めつつ結論を維持する逆接副詞がコアイメージ。", usage: "ややフォーマルな会話・文章で使う。", synonymDifference: "nonetheless vs however: 近いが nonetheless は譲歩感が強い。", englishDefinition: "In spite of that; nevertheless.", etymology: "none + the + less の融合形。" }],
  // frankly (70062)
  [70062, { coreImage: "率直な評価を前置きする副詞がコアイメージ。", usage: "厳しい意見前の導入に使う。", synonymDifference: "frankly vs honestly: frankly の方が直言的。", englishDefinition: "In an open and direct way.", etymology: "frank + -ly。" }],
  // consequently (70063)
  [70063, { coreImage: "原因からの結果を論理的に導く接続副詞がコアイメージ。", usage: "説明文での因果明示に有効。", synonymDifference: "consequently vs therefore: ほぼ同義だが consequently は経過感がある。", englishDefinition: "As a result.", etymology: "consequence 由来。" }],
  // incidentally (70064)
  [70064, { coreImage: "本筋に付随する情報を差し込む副詞がコアイメージ。", usage: "「ちなみに」を丁寧に述べる時に使う。", synonymDifference: "incidentally vs by the way: 前者がやや硬い。", englishDefinition: "By the way; in a related but not central way.", etymology: "incident + -ally。" }],
  // admittedly (70065)
  [70065, { coreImage: "不利な点を認めた上で主張を続ける譲歩副詞がコアイメージ。", usage: "議論でバランスを取るのに有効。", synonymDifference: "admittedly vs to be fair: 前者は自己譲歩が強い。", englishDefinition: "Used to concede a point before giving another view.", etymology: "admit の副詞形。" }],
  // bizarre (70066)
  [70066, { coreImage: "通常感覚から外れた奇妙さを示す形容がコアイメージ。", usage: "出来事や振る舞いの違和感描写に使う。", synonymDifference: "bizarre vs strange: bizarre の方が強い異様さ。", englishDefinition: "Very strange or unusual.", etymology: "フランス語 bizarre 由来。" }],
  // outrageous (70067)
  [70067, { coreImage: "常識を超えるほど過剰・不当だと評価する語がコアイメージ。", usage: "価格・行為への強い非難に使う。", synonymDifference: "outrageous vs unacceptable: 前者は感情強度が高い。", englishDefinition: "Shockingly bad or excessive.", etymology: "outrage 由来。" }],
  // phenomenal (70068)
  [70068, { coreImage: "並外れて優れていることを示す高評価語がコアイメージ。", usage: "成果や才能への強い賞賛で使う。", synonymDifference: "phenomenal vs excellent: phenomenal の方が驚きが強い。", englishDefinition: "Extraordinarily good; remarkable.", etymology: "phenomenon 由来。" }],
  // devastating (70069)
  [70069, { coreImage: "精神的・物理的に大きな打撃を与える性質がコアイメージ。", usage: "ニュース・結果の衝撃を表現できる。", synonymDifference: "devastating vs upsetting: 前者の方が破壊性が強い。", englishDefinition: "Causing severe shock or damage.", etymology: "devastate + -ing。" }],
  // excruciating (70070)
  [70070, { coreImage: "耐えがたいほどの痛み・苦痛を示す強意語がコアイメージ。", usage: "痛みだけでなく待ち時間の苦しさにも比喩使用。", synonymDifference: "excruciating vs painful: 前者は程度が極めて強い。", englishDefinition: "Extremely painful or intense.", etymology: "ラテン語 cruciare（拷問する）系。" }],
  // intriguing (70071)
  [70071, { coreImage: "好奇心を刺激してもっと知りたくさせる性質がコアイメージ。", usage: "アイデア評価で前向きに使える。", synonymDifference: "intriguing vs interesting: intriguing の方が引き込みが強い。", englishDefinition: "Arousing curiosity.", etymology: "intrigue 由来。" }],
  // mediocre (70072)
  [70072, { coreImage: "平均的で特に優れていない評価がコアイメージ。", usage: "やや否定的な中間評価として使う。", synonymDifference: "mediocre vs average: mediocre は価値判断がより低め。", englishDefinition: "Only moderate in quality; not very good.", etymology: "ラテン語 mediocris（中程度）。" }],
  // salty (70077)
  [70077, { coreImage: "不満で機嫌が悪い様子を示すスラング形容がコアイメージ。", usage: "若者口語。相手によっては失礼に響く。", synonymDifference: "salty vs annoyed: salty は口語で皮肉感を含む。", englishDefinition: "Irritated or resentful (slang).", etymology: "塩辛い印象から気難しさへ比喩化。" }],
  // sketchy (70078)
  [70078, { coreImage: "情報不足や怪しさで信用しづらい状態がコアイメージ。", usage: "場所・計画・人物の信頼性評価で使う。", synonymDifference: "sketchy vs suspicious: sketchy は根拠不足感を含む。", englishDefinition: "Shady or not trustworthy.", etymology: "sketch（粗い）から転義。" }],
  // vibe (70079)
  [70079, { coreImage: "言語化しにくい雰囲気・感じを示す口語名詞がコアイメージ。", usage: "場所や人の印象共有で頻出。", synonymDifference: "vibe vs atmosphere: vibe の方が口語で主観的。", englishDefinition: "The emotional feel or atmosphere of a place/person.", etymology: "vibration の短縮語。" }],
  // cringe (70080)
  [70080, { coreImage: "恥ずかしさで身が縮む感覚を示す語がコアイメージ。", usage: "若者口語で「痛い」感を表す。", synonymDifference: "cringe vs embarrassing: cringe は反応としての感覚が強い。", englishDefinition: "Causing embarrassment or secondhand awkwardness.", etymology: "cringe（身をすくめる）由来。" }],
  // in the long run (70146)
  [70146, { coreImage: "短期でなく長期的帰結を重視する時間句がコアイメージ。", usage: "戦略判断の説明で有効。", synonymDifference: "in the long run vs eventually: 前者は長期視点を明示。", englishDefinition: "Over a long period of time.", etymology: "long run（長い走行）比喩。" }],
  // as far as I know (70147)
  [70147, { coreImage: "知識範囲に限定して断定を避ける句がコアイメージ。", usage: "情報の確度を適切に示せる。", synonymDifference: "as far as I know vs I think: 前者は知識範囲の限定。", englishDefinition: "To the best of my knowledge.", etymology: "as far as 範囲構文。" }],
  // from my perspective (70148)
  [70148, { coreImage: "視点依存の意見であることを明示する句がコアイメージ。", usage: "立場差のある議論で有効。", synonymDifference: "from my perspective vs in my opinion: 前者は立場性を強調。", englishDefinition: "From my point of view.", etymology: "perspective（視座）句。" }],
  // for what it's worth (70149)
  [70149, { coreImage: "価値は限定的だが参考意見として提示する緩和句がコアイメージ。", usage: "押し付けを避けた助言に使える。", synonymDifference: "for what it's worth vs in my opinion: 前者は控えめさが強い。", englishDefinition: "Used to offer an opinion modestly.", etymology: "worth（価値）参照句。" }],
  // on the contrary (70150)
  [70150, { coreImage: "直前主張を明確に反転させる反論句がコアイメージ。", usage: "強い否定転換なので丁寧さ配慮が必要。", synonymDifference: "on the contrary vs however: 前者は真正面から逆を述べる。", englishDefinition: "Used to introduce the opposite of what was just said.", etymology: "contrary（反対）句。" }],
  // that being said (70151)
  [70151, { coreImage: "前述を認めつつ別視点を追加する譲歩接続句がコアイメージ。", usage: "議論のバランス取りに最適。", synonymDifference: "that being said vs however: 前者は譲歩ニュアンスが明確。", englishDefinition: "Even so; despite what was just said.", etymology: "分詞構文 that being said。" }],
  // to some extent (70152)
  [70152, { coreImage: "全面ではない部分的妥当性を示す程度句がコアイメージ。", usage: "断定回避と妥当性維持を両立できる。", synonymDifference: "to some extent vs partly: 前者は評価句として自然。", englishDefinition: "To a certain degree.", etymology: "extent（程度）句。" }],
  // in my opinion (70153)
  [70153, { coreImage: "主観的見解であることを明示する基本句がコアイメージ。", usage: "議論で断定を和らげる。", synonymDifference: "in my opinion vs I think: 前者がやや丁寧。", englishDefinition: "As far as I am concerned; personally.", etymology: "opinion 名詞句。" }],
  // I would rather (70154)
  [70154, { coreImage: "比較選好を丁寧に示す仮定法的構文がコアイメージ。", usage: "would rather A than B の形で使う。", synonymDifference: "would rather vs prefer: 前者は口語で選好が柔らかい。", englishDefinition: "Used to express preference.", etymology: "rather（むしろ）由来構文。" }],
  // it turns out (70155)
  [70155, { coreImage: "最終的に判明した結果を導入する句がコアイメージ。", usage: "予想外の結果叙述に適する。", synonymDifference: "it turns out vs as it turns out: 後者は接続的。", englishDefinition: "It is discovered in the end that...", etymology: "turn out（判明する）句動詞。" }],
  // at your convenience (70156)
  [70156, { coreImage: "相手都合を尊重して時期を委ねる丁寧句がコアイメージ。", usage: "ビジネス連絡で有効。", synonymDifference: "at your convenience vs when you can: 前者がより丁寧。", englishDefinition: "At a time suitable for you.", etymology: "convenience（都合）句。" }],
  // keep me posted (70157)
  [70157, { coreImage: "進捗共有を継続してほしい依頼句がコアイメージ。", usage: "案件管理・調整連絡で頻出。", synonymDifference: "keep me posted vs let me know: 前者は継続更新を含む。", englishDefinition: "Keep me informed of updates.", etymology: "post（掲示する）比喩。" }],
  // I couldn't agree more (70158)
  [70158, { coreImage: "これ以上ない同意を示す強い賛同表現がコアイメージ。", usage: "丁寧かつ強い同意を示せる。", synonymDifference: "I couldn't agree more vs exactly: 前者は強度が高い。", englishDefinition: "I completely agree.", etymology: "比較不能の否定構文による強調。" }],
  // that's not the point (70159)
  [70159, { coreImage: "論点逸脱を正して焦点を戻す句がコアイメージ。", usage: "議論管理に有効だが強く聞こえるため配慮。", synonymDifference: "that's not the point vs anyway: 前者は論点修正を明示。", englishDefinition: "That is not the main issue being discussed.", etymology: "point（論点）句。" }],
  // to put it simply (70160)
  [70160, { coreImage: "内容を平易化して要約する導入句がコアイメージ。", usage: "難しい説明前の予告として有効。", synonymDifference: "to put it simply vs in short: 前者は言い換え過程を示す。", englishDefinition: "To explain in simple terms.", etymology: "put it + simply 構文。" }],
  // all things considered (70221)
  [70221, { coreImage: "全要素を踏まえた総合判断を示す句がコアイメージ。", usage: "最終評価を落ち着いて述べる時に使う。", synonymDifference: "all things considered vs overall: 前者は考慮過程を強調。", englishDefinition: "Taking everything into account.", etymology: "consider の過去分詞句。" }],
  // for the record (70222)
  [70222, { coreImage: "公式記録として明確化したい内容を示す句がコアイメージ。", usage: "誤解防止の明確化に有効。", synonymDifference: "for the record vs by the way: 前者は明記目的が強い。", englishDefinition: "Used to state something clearly for accuracy.", etymology: "record（記録）参照句。" }],
  // if anything (70223)
  [70223, { coreImage: "むしろ逆方向だと補正する限定句がコアイメージ。", usage: "控えめ反論で使いやすい。", synonymDifference: "if anything vs rather: 前者は文脈修正の機能が強い。", englishDefinition: "Used to suggest the opposite is more true.", etymology: "anything 条件構文。" }],
  // to the best of my knowledge (70224)
  [70224, { coreImage: "知識範囲内での最大限の確度を示す句がコアイメージ。", usage: "断定を避けつつ信頼性を示せる。", synonymDifference: "to the best of my knowledge vs as far as I know: 前者がやや硬い。", englishDefinition: "As far as I know.", etymology: "best + knowledge 構文。" }],
  // under no circumstances (70225)
  [70225, { coreImage: "いかなる条件でも許容しない強い禁止がコアイメージ。", usage: "規則・安全文脈で強い制限を示す。", synonymDifference: "under no circumstances vs never: 前者は条件全否定を明示。", englishDefinition: "In no situation; never.", etymology: "circumstance の全否定句。" }],
  // for better or worse (70226)
  [70226, { coreImage: "良否の両面を受け入れる包括的態度がコアイメージ。", usage: "不可逆な現実受容を示す時に使う。", synonymDifference: "for better or worse vs anyway: 前者は両価値受容を明示。", englishDefinition: "Whether the outcome is good or bad.", etymology: "比較級対句。" }],
  // that said (70227)
  [70227, { coreImage: "前述を認めた上で別視点へ移る接続句がコアイメージ。", usage: "バランスのある議論展開で有効。", synonymDifference: "that said vs however: 前者は譲歩の流れが自然。", englishDefinition: "Even so; having said that.", etymology: "that being said の短縮的用法。" }],
  // strictly speaking (70228)
  [70228, { coreImage: "厳密基準での判断に限定する句がコアイメージ。", usage: "日常感覚との差を示す時に便利。", synonymDifference: "strictly speaking vs technically: 前者は一般的厳密性、後者は技術的厳密性。", englishDefinition: "In a strict or exact sense.", etymology: "strictly + speaking 分詞構文。" }],
  // needless to say (70229)
  [70229, { coreImage: "自明性を前提に強調する導入句がコアイメージ。", usage: "強調に有効だが多用するとくどい。", synonymDifference: "needless to say vs of course: 前者は文語寄り。", englishDefinition: "It is obvious and does not need to be said.", etymology: "needless（不要）不定詞句。" }],
  // in principle (70230)
  [70230, { coreImage: "原則レベルでの可否を示す句がコアイメージ。", usage: "実務上の例外余地を残せる。", synonymDifference: "in principle vs in practice: 前者は理念、後者は実際。", englishDefinition: "As a general rule or theory.", etymology: "principle（原則）句。" }],
  // at face value (70231)
  [70231, { coreImage: "表面的情報をそのまま受け取る姿勢がコアイメージ。", usage: "批判的検討の必要性を示す文脈で使う。", synonymDifference: "at face value vs literally: 前者は解釈姿勢、後者は字義。", englishDefinition: "As it appears, without deeper analysis.", etymology: "face（表面）価値比喩。" }],
  // for all I know (70232)
  [70232, { coreImage: "情報不足による不確実性を示す句がコアイメージ。", usage: "可能性を開いたまま断定回避できる。", synonymDifference: "for all I know vs maybe: 前者は知識不足の明示がある。", englishDefinition: "As far as I know; possibly.", etymology: "for all + know 構文。" }],
  // to put it bluntly (70233)
  [70233, { coreImage: "遠回しを避けて率直に言う宣言句がコアイメージ。", usage: "厳しい内容前に置いて受け止めを準備させる。", synonymDifference: "to put it bluntly vs frankly: 前者は直截さがより強い。", englishDefinition: "To say it very directly.", etymology: "blunt（率直な）句。" }],
  // without a doubt (70234)
  [70234, { coreImage: "疑いを完全に排除する確信表現がコアイメージ。", usage: "断定強度が高いため根拠ある場面で使う。", synonymDifference: "without a doubt vs probably: 前者は断定、後者は推量。", englishDefinition: "Certainly; unquestionably.", etymology: "doubt の否定句。" }],
  // in short (70235)
  [70235, { coreImage: "長い説明を要点に圧縮する要約句がコアイメージ。", usage: "結論提示の前振りとして有効。", synonymDifference: "in short vs to sum up: 前者は簡潔、後者はやや形式的。", englishDefinition: "Briefly; in summary.", etymology: "short（短く）前置詞句。" }],
  // in any event (70281)
  [70281, { coreImage: "詳細差を脇に置いて結論を進める句がコアイメージ。", usage: "議論の収束に使いやすい。", synonymDifference: "in any event vs anyway: 前者がややフォーマル。", englishDefinition: "In any case.", etymology: "event（場合）句。" }],
  // all the same (70282)
  [70282, { coreImage: "逆条件があっても結論維持を示す譲歩句がコアイメージ。", usage: "丁寧な逆接として使える。", synonymDifference: "all the same vs nevertheless: ほぼ同義。", englishDefinition: "Despite that; nevertheless.", etymology: "same（同じ）強調句。" }],
  // in all likelihood (70283)
  [70283, { coreImage: "高確率の推定をやや丁寧に述べる句がコアイメージ。", usage: "見込みを慎重に述べる場面に適する。", synonymDifference: "in all likelihood vs probably: 前者がやや硬い。", englishDefinition: "Very probably.", etymology: "likelihood（蓋然性）句。" }],
  // to that end (70284)
  [70284, { coreImage: "目的達成に向けた手段導入を示す句がコアイメージ。", usage: "計画説明で手段節に接続しやすい。", synonymDifference: "to that end vs for that reason: 前者は目的志向、後者は因果。", englishDefinition: "For that purpose.", etymology: "end（目的）句。" }],
  // be that as it may (70285)
  [70285, { coreImage: "前提を認めつつ本題を進める譲歩句がコアイメージ。", usage: "やや文語的で上級会話向け。", synonymDifference: "be that as it may vs that said: 前者がより硬い。", englishDefinition: "Even so; however that may be.", etymology: "仮定法的慣用構文。" }],
  // in practical terms (70286)
  [70286, { coreImage: "抽象論を実務レベルへ落とす変換句がコアイメージ。", usage: "計画を具体化する説明で有効。", synonymDifference: "in practical terms vs practically speaking: 近いが前者は名詞句接続しやすい。", englishDefinition: "In terms of real-world application.", etymology: "practical + terms 句。" }],
  // for the most part (70287)
  [70287, { coreImage: "大部分はそうだと示す限定句がコアイメージ。", usage: "例外を残した評価に使える。", synonymDifference: "for the most part vs mostly: 前者がやや丁寧。", englishDefinition: "Mainly; largely.", etymology: "most part（大部分）句。" }],
  // it follows that (70288)
  [70288, { coreImage: "前提から論理的に帰結することを示す句がコアイメージ。", usage: "論証の結論提示で使う。", synonymDifference: "it follows that vs therefore: 前者は推論過程を明示。", englishDefinition: "It can be logically concluded that.", etymology: "follow（帰結する）構文。" }],
  // at first glance (70289)
  [70289, { coreImage: "初見印象での暫定判断を示す句がコアイメージ。", usage: "後続で再評価を述べると自然。", synonymDifference: "at first glance vs initially: 前者は視覚的初印象含意。", englishDefinition: "When first seen or considered.", etymology: "glance（ちら見）句。" }],
  // speaking of which (70290)
  [70290, { coreImage: "関連トピックへ自然に接続する句がコアイメージ。", usage: "会話転換を滑らかにできる。", synonymDifference: "speaking of which vs by the way: 前者は直前話題との関連が強い。", englishDefinition: "That reminds me of a related point.", etymology: "speak of which の分詞構文。" }],
  // in retrospect (70331)
  [70331, { coreImage: "事後視点から振り返って評価する句がコアイメージ。", usage: "反省・学びの共有に適する。", synonymDifference: "in retrospect vs in hindsight: ほぼ同義。", englishDefinition: "Looking back on past events.", etymology: "retrospect（回顧）句。" }],
  // all in all (70332)
  [70332, { coreImage: "全体を通した最終評価を示す要約句がコアイメージ。", usage: "結論段落の冒頭で使いやすい。", synonymDifference: "all in all vs overall: ほぼ同義。", englishDefinition: "Considering everything.", etymology: "all + in + all の慣用句。" }],
  // in broad terms (70333)
  [70333, { coreImage: "細部を省いた大枠説明を示す句がコアイメージ。", usage: "詳細前の全体像提示に有効。", synonymDifference: "in broad terms vs generally: 前者は説明枠を示す。", englishDefinition: "In general terms.", etymology: "broad terms 句。" }],
  // in part (70334)
  [70334, { coreImage: "原因・説明の一部性を示す限定句がコアイメージ。", usage: "複合要因説明で便利。", synonymDifference: "in part vs partly: ほぼ同義。", englishDefinition: "Partly; to some extent.", etymology: "part（部分）句。" }],
  // for that matter (70335)
  [70335, { coreImage: "関連事項を追加して論点を拡張する句がコアイメージ。", usage: "補強的な追加例に使う。", synonymDifference: "for that matter vs besides: 前者は直前文脈との結びつきが強い。", englishDefinition: "And regarding that topic as well.", etymology: "matter（事項）句。" }],
  // to begin with (70336)
  [70336, { coreImage: "第一理由や出発点を示す導入句がコアイメージ。", usage: "理由列挙の最初に置くと整理しやすい。", synonymDifference: "to begin with vs first: 前者は会話的。", englishDefinition: "First of all; in the first place.", etymology: "begin 不定詞句。" }],
  // in effect (70337)
  [70337, { coreImage: "実質的にはどうかを示す評価句がコアイメージ。", usage: "見かけと実態の差を示す時に使う。", synonymDifference: "in effect vs effectively: 前者は句として談話機能が強い。", englishDefinition: "In practical terms; essentially.", etymology: "effect（効果・実質）句。" }],
  // in essence (70338)
  [70338, { coreImage: "本質だけを抜き出す要約句がコアイメージ。", usage: "複雑説明の核心提示に向く。", synonymDifference: "in essence vs basically: 前者がややフォーマル。", englishDefinition: "Essentially; in its basic nature.", etymology: "essence（本質）句。" }],
  // put differently (70339)
  [70339, { coreImage: "別表現で言い換える導入句がコアイメージ。", usage: "理解補助の再説明で有効。", synonymDifference: "put differently vs in other words: ほぼ同義。", englishDefinition: "To say it in another way.", etymology: "put + differently 構文。" }],
  // so to speak (70340)
  [70340, { coreImage: "比喩的表現であることを示す緩和句がコアイメージ。", usage: "直喩に近い言い回しの後ろに置く。", synonymDifference: "so to speak vs kind of: 前者は修辞的自覚を示す。", englishDefinition: "As one might say; figuratively speaking.", etymology: "speak を用いた慣用句。" }],
  // in turn (70381)
  [70381, { coreImage: "順番性や連鎖的因果を示す句がコアイメージ。", usage: "A causes B, which in turn causes C の形で有効。", synonymDifference: "in turn vs then: 前者は連鎖関係を強調。", englishDefinition: "As a consequence or in sequence.", etymology: "turn（順番）句。" }],
  // in context (70382)
  [70382, { coreImage: "文脈全体の中で解釈する視点を示す句がコアイメージ。", usage: "単語や発言の誤解防止に有効。", synonymDifference: "in context vs literally: 前者は文脈重視。", englishDefinition: "Considering surrounding circumstances.", etymology: "context（文脈）句。" }],
  // by extension (70383)
  [70383, { coreImage: "前提を拡張して別対象へ適用する論理句がコアイメージ。", usage: "推論の派生を示すときに使う。", synonymDifference: "by extension vs similarly: 前者は推論拡張を明示。", englishDefinition: "As a further consequence or application.", etymology: "extension（拡張）句。" }],
  // for practical purposes (70384)
  [70384, { coreImage: "実務上は同等とみなす近似判断がコアイメージ。", usage: "厳密差を無視して運用する時に有効。", synonymDifference: "for practical purposes vs basically: 前者は運用視点を明示。", englishDefinition: "In practical terms, effectively.", etymology: "practical purposes 句。" }],
  // on balance (70385)
  [70385, { coreImage: "長所短所を秤にかけた総合評価がコアイメージ。", usage: "結論提示で丁寧に使える。", synonymDifference: "on balance vs overall: 前者は比較衡量の含意。", englishDefinition: "Overall, after considering all factors.", etymology: "balance（均衡）句。" }],
  // at length (70386)
  [70386, { coreImage: "十分に詳しく述べる、または長時間にわたる意味がコアイメージ。", usage: "文脈で「詳しく」か「長く」を判別する。", synonymDifference: "at length vs in detail: 前者は長さの含意も持つ。", englishDefinition: "In great detail; for a long time.", etymology: "length（長さ）句。" }],
  // in passing (70387)
  [70387, { coreImage: "本題ではなく軽く触れる程度を示す句がコアイメージ。", usage: "補足情報の扱いを調整できる。", synonymDifference: "in passing vs by the way: 前者は軽く触れる度合いを強調。", englishDefinition: "Briefly and incidentally.", etymology: "passing（通過）句。" }],
  // to date (70388)
  [70388, { coreImage: "現在時点までの累積範囲を示す句がコアイメージ。", usage: "進捗や記録の更新表現で有効。", synonymDifference: "to date vs so far: 前者がややフォーマル。", englishDefinition: "Up to the present time.", etymology: "date（日時）句。" }],
  // in due time (70389)
  [70389, { coreImage: "適切な時機に起こることを示す句がコアイメージ。", usage: "急がせず待つ文脈で使う。", synonymDifference: "in due time vs soon: 前者は適時性を示す。", englishDefinition: "At the proper time; eventually.", etymology: "due（適切な）句。" }],
  // in tandem (70390)
  [70390, { coreImage: "二者以上が連動して進む状態を示す句がコアイメージ。", usage: "協調作業の説明で使える。", synonymDifference: "in tandem vs together: 前者は連動性が強い。", englishDefinition: "Together and in coordination.", etymology: "tandem（二人乗り）由来。" }],
  // in practical use (70431)
  [70431, { coreImage: "理論ではなく実運用での状態を示す句がコアイメージ。", usage: "仕様説明と運用差の整理に有効。", synonymDifference: "in practical use vs in principle: 前者は実際運用。", englishDefinition: "In real-world use.", etymology: "practical use 句。" }],
  // in the aggregate (70432)
  [70432, { coreImage: "個別ではなく合算全体で評価する視点がコアイメージ。", usage: "統計・全体傾向説明に適する。", synonymDifference: "in the aggregate vs overall: 前者は集計ニュアンスが強い。", englishDefinition: "Taken as a whole; collectively.", etymology: "aggregate（集合）句。" }],
  // for context (70433)
  [70433, { coreImage: "背景理解のため補足情報を示す導入句がコアイメージ。", usage: "前提不足を補う時に短く使える。", synonymDifference: "for context vs by the way: 前者は背景提供が目的。", englishDefinition: "Used to provide background information.", etymology: "context（文脈）句。" }],
  // on closer inspection (70434)
  [70434, { coreImage: "初見と異なる詳細判断へ進む句がコアイメージ。", usage: "再検討結果を示す時に有効。", synonymDifference: "on closer inspection vs at first glance: 前者は再観察後。", englishDefinition: "After examining more carefully.", etymology: "inspection（精査）句。" }],
  // at your earliest convenience (70435)
  [70435, { coreImage: "可能な限り早い都合時を丁寧に依頼する句がコアイメージ。", usage: "ビジネスメールで定番。", synonymDifference: "at your earliest convenience vs ASAP: 前者が丁寧。", englishDefinition: "As soon as you can conveniently do so.", etymology: "earliest convenience 句。" }],
  // to a degree (70436)
  [70436, { coreImage: "完全ではないが一定程度を認める句がコアイメージ。", usage: "部分同意や限定評価で使う。", synonymDifference: "to a degree vs to some extent: ほぼ同義。", englishDefinition: "To a certain extent.", etymology: "degree（程度）句。" }],
  // for the sake of argument (70437)
  [70437, { coreImage: "仮定的に前提を置いて議論を進める句がコアイメージ。", usage: "反証や検討の前置きに使う。", synonymDifference: "for the sake of argument vs hypothetically: 前者は議論目的を明示。", englishDefinition: "Assuming something only for discussion.", etymology: "sake（目的）句。" }],
  // that being true (70438)
  [70438, { coreImage: "前提真として次の結論へつなぐ句がコアイメージ。", usage: "譲歩後の展開に使える。", synonymDifference: "that being true vs if that is true: 前者は分詞構文で圧縮。", englishDefinition: "Given that is true.", etymology: "be 動詞分詞構文。" }],
  // in any case (70439)
  [70439, { coreImage: "条件差を超えて結論を維持する句がコアイメージ。", usage: "話を前に進める収束句として有効。", synonymDifference: "in any case vs anyway: 前者がやや丁寧。", englishDefinition: "Regardless; anyway.", etymology: "case（場合）句。" }],
  // from this angle (70440)
  [70440, { coreImage: "特定の観点からの見え方を示す句がコアイメージ。", usage: "視点切替を明確にできる。", synonymDifference: "from this angle vs from this perspective: ほぼ同義。", englishDefinition: "From this viewpoint.", etymology: "angle（角度）比喩。" }],
  // as things stand (70481)
  [70481, { coreImage: "現状条件に基づく暫定評価を示す句がコアイメージ。", usage: "将来変化の余地を残せる。", synonymDifference: "as things stand vs currently: 前者は状況評価の含意。", englishDefinition: "Given the current situation.", etymology: "things stand 構文。" }],
  // to some degree (70482)
  [70482, { coreImage: "一部妥当性を示す程度限定句がコアイメージ。", usage: "断定回避に使いやすい。", synonymDifference: "to some degree vs somewhat: 近いが前者は句として柔軟。", englishDefinition: "To a certain degree.", etymology: "degree 句。" }],
  // in general (70483)
  [70483, { coreImage: "個別例外を除いた一般傾向を示す句がコアイメージ。", usage: "導入で範囲を限定できる。", synonymDifference: "in general vs generally: ほぼ同義。", englishDefinition: "Generally; on the whole.", etymology: "general 句。" }],
  // in detail (70484)
  [70484, { coreImage: "詳細水準で説明・検討する姿勢がコアイメージ。", usage: "概要説明との対比で使う。", synonymDifference: "in detail vs at length: 前者は詳細度、後者は長さも含む。", englishDefinition: "With full details.", etymology: "detail 句。" }],
  // by comparison (70485)
  [70485, { coreImage: "比較対象を置いて相対評価する句がコアイメージ。", usage: "前後文で対象を明示すると明確。", synonymDifference: "by comparison vs comparatively: 前者は接続句として使いやすい。", englishDefinition: "When compared with something else.", etymology: "comparison 句。" }],
  // for emphasis (70486)
  [70486, { coreImage: "強調目的で表現を追加することを示す句がコアイメージ。", usage: "繰り返しや語順強調の説明に使う。", synonymDifference: "for emphasis vs specifically: 前者は強調目的を明示。", englishDefinition: "Used to strengthen a point.", etymology: "emphasis（強調）句。" }],
  // in response (70487)
  [70487, { coreImage: "先行行為への応答としての行動を示す句がコアイメージ。", usage: "因果の時系列を明確にできる。", synonymDifference: "in response vs as a result: 前者は反応性を強調。", englishDefinition: "As a reaction.", etymology: "response 句。" }],
  // at scale (70488)
  [70488, { coreImage: "小規模でなく大規模運用可能性を示す句がコアイメージ。", usage: "プロダクト運用・業務拡張文脈で頻出。", synonymDifference: "at scale vs widely: 前者は運用規模の含意が強い。", englishDefinition: "On a large scale.", etymology: "scale（規模）句。" }],
  // in sequence (70489)
  [70489, { coreImage: "決められた順序に従う進行を示す句がコアイメージ。", usage: "手順説明で明確性が上がる。", synonymDifference: "in sequence vs in order: ほぼ同義。", englishDefinition: "In a particular order.", etymology: "sequence（連続）句。" }],
  // all things equal (70490)
  [70490, { coreImage: "他条件一定という仮定下での比較を示す句がコアイメージ。", usage: "比較判断の前提を明示できる。", synonymDifference: "all things equal vs ceteris paribus: 前者は英語の平易表現。", englishDefinition: "Assuming other factors are equal.", etymology: "比較仮定の慣用句。" }],
  // to that extent (70531)
  [70531, { coreImage: "特定範囲まで妥当と限定する句がコアイメージ。", usage: "部分同意の境界線を示す時に有効。", synonymDifference: "to that extent vs to some extent: 前者は参照対象が明確。", englishDefinition: "To that degree.", etymology: "extent 句。" }],
  // in this regard (70532)
  [70532, { coreImage: "この論点についてと焦点を絞る句がコアイメージ。", usage: "議題切替で明確に使える。", synonymDifference: "in this regard vs in this context: 前者は論点、後者は背景。", englishDefinition: "In this respect.", etymology: "regard（観点）句。" }],
  // in operation (70533)
  [70533, { coreImage: "運用中・稼働中の状態を示す句がコアイメージ。", usage: "制度・設備・手順の稼働説明で使う。", synonymDifference: "in operation vs active: 前者は稼働状態を強調。", englishDefinition: "Functioning or working.", etymology: "operation（運用）句。" }],
  // after thinking it over (70534)
  [70534, { coreImage: "熟考後の再判断を示す句がコアイメージ。", usage: "意見変更を自然に導ける。", synonymDifference: "after thinking it over vs on second thought: 近いが前者は過程が明示。", englishDefinition: "After considering it carefully.", etymology: "think over 句動詞由来。" }],
  // in all honesty (70535)
  [70535, { coreImage: "率直さを強めて本音を示す導入句がコアイメージ。", usage: "感情を正直に述べる前置きに使う。", synonymDifference: "in all honesty vs honestly: 前者は強調が強い。", englishDefinition: "To be completely honest.", etymology: "all + honesty 強調句。" }],
  // for completeness (70536)
  [70536, { coreImage: "情報の欠落を防ぐため補足する目的句がコアイメージ。", usage: "仕様書・説明の追記で有効。", synonymDifference: "for completeness vs for context: 前者は網羅性重視。", englishDefinition: "To make the information complete.", etymology: "completeness（完全性）句。" }],
  // in conjunction with (70537)
  [70537, { coreImage: "他要素と組み合わせて機能する関係を示す句がコアイメージ。", usage: "併用条件の説明で使う。", synonymDifference: "in conjunction with vs with: 前者は連携関係を強調。", englishDefinition: "Together with; in combination with.", etymology: "conjunction（結合）句。" }],
  // at this stage (70538)
  [70538, { coreImage: "進行段階を明示して判断時点を限定する句がコアイメージ。", usage: "暫定判断の共有で有効。", synonymDifference: "at this stage vs at this point: ほぼ同義。", englishDefinition: "At this phase.", etymology: "stage（段階）句。" }],
  // practically speaking (70539)
  [70539, { coreImage: "理論より実務の観点で話す宣言句がコアイメージ。", usage: "運用上の現実制約を述べる時に使う。", synonymDifference: "practically speaking vs in principle: 前者は実務、後者は原則。", englishDefinition: "In practical terms.", etymology: "practically + speaking。" }],
  // as a whole (70540)
  [70540, { coreImage: "部分ではなく全体単位で評価する句がコアイメージ。", usage: "総評を述べる時に使いやすい。", synonymDifference: "as a whole vs overall: 近いが前者は全体単位を明示。", englishDefinition: "Taken together as one complete unit.", etymology: "whole（全体）句。" }],
  // at this juncture (70641)
  [70641, { coreImage: "重要な時点・分岐点を示すやや硬い句がコアイメージ。", usage: "方針決定時の文脈に合う。", synonymDifference: "at this juncture vs now: 前者は節目感が強い。", englishDefinition: "At this point in time.", etymology: "juncture（接合点）句。" }],
  // under these terms (70647)
  [70647, { coreImage: "提示条件の枠内での可否を示す句がコアイメージ。", usage: "契約・合意条件の確認で有効。", synonymDifference: "under these terms vs under these circumstances: 前者は条件文書寄り。", englishDefinition: "According to these conditions.", etymology: "terms（条件）句。" }],
  // with that in mind (70648)
  [70648, { coreImage: "前提を保持したまま次判断へ進む接続句がコアイメージ。", usage: "提案前の橋渡しとして使える。", synonymDifference: "with that in mind vs therefore: 前者は前提保持を示す。", englishDefinition: "Considering that.", etymology: "mind（念頭）句。" }],
  // from a practical standpoint (70649)
  [70649, { coreImage: "実務視点への切替を明示する句がコアイメージ。", usage: "理論対実装の対比で有効。", synonymDifference: "from a practical standpoint vs practically speaking: 近いが前者は名詞句導入。", englishDefinition: "From a practical point of view.", etymology: "standpoint（立場）句。" }],
  // in no small measure (70652)
  [70652, { coreImage: "かなり大きな程度を婉曲に強調する句がコアイメージ。", usage: "貢献度や影響度の強調で使う。", synonymDifference: "in no small measure vs greatly: 前者は文語的。", englishDefinition: "To a significant extent.", etymology: "small を否定した強調構文。" }],
  // on that basis (70653)
  [70653, { coreImage: "その根拠に基づいて判断する接続句がコアイメージ。", usage: "理由から結論へ橋渡しできる。", synonymDifference: "on that basis vs therefore: 前者は根拠参照が明確。", englishDefinition: "Based on that.", etymology: "basis（根拠）句。" }],
  // all else being equal (70655)
  [70655, { coreImage: "他条件一定を仮定した比較句がコアイメージ。", usage: "選択比較の前提を明示する。", synonymDifference: "all else being equal vs all things equal: ほぼ同義。", englishDefinition: "Assuming other factors remain unchanged.", etymology: "分詞構文表現。" }],
  // for argument's sake (70657)
  [70657, { coreImage: "議論便宜上の仮定を置く句がコアイメージ。", usage: "反証検討の導入に使う。", synonymDifference: "for argument's sake vs hypothetically: 近いが前者は議論目的。", englishDefinition: "Assuming something just for discussion.", etymology: "argument + sake 構文。" }],
  // in line with (70658)
  [70658, { coreImage: "基準や方針との整合を示す句がコアイメージ。", usage: "規程準拠の説明で高頻度。", synonymDifference: "in line with vs according to: 前者は整合性、後者は出典準拠。", englishDefinition: "In agreement with; consistent with.", etymology: "line（基準線）比喩。" }],
  // in this context (70659)
  [70659, { coreImage: "この文脈に限定した意味を示す句がコアイメージ。", usage: "多義語の誤解防止に有効。", synonymDifference: "in this context vs generally: 前者は文脈限定。", englishDefinition: "Within this specific context.", etymology: "context 句。" }],
  // on the whole (70660)
  [70660, { coreImage: "細部をならした全体評価を示す句がコアイメージ。", usage: "総評を穏やかに述べる時に使う。", synonymDifference: "on the whole vs overall: ほぼ同義。", englishDefinition: "Overall; generally.", etymology: "whole（全体）句。" }],
  // to a large extent (70661)
  [70661, { coreImage: "かなりの範囲で成り立つことを示す程度句がコアイメージ。", usage: "限定付き肯定で使いやすい。", synonymDifference: "to a large extent vs mostly: 前者は程度表現として丁寧。", englishDefinition: "To a great degree.", etymology: "large extent 句。" }],
  // with respect to (70662)
  [70662, { coreImage: "対象領域を限定して述べるフォーマル句がコアイメージ。", usage: "書き言葉・業務連絡で頻出。", synonymDifference: "with respect to vs regarding: 前者がやや硬い。", englishDefinition: "Concerning; regarding.", etymology: "respect（関連）句。" }],
  // as matters stand (70663)
  [70663, { coreImage: "現状条件に基づく判断を示す句がコアイメージ。", usage: "現時点の暫定性を示せる。", synonymDifference: "as matters stand vs as things stand: ほぼ同義。", englishDefinition: "Given the present situation.", etymology: "matter（事情）句。" }],
  // for present purposes (70664)
  [70664, { coreImage: "現時点の目的に限って有効とする限定句がコアイメージ。", usage: "厳密化を後回しにする場面で有効。", synonymDifference: "for present purposes vs for now: 前者は目的限定が明確。", englishDefinition: "For current needs only.", etymology: "present purposes 句。" }],
  // in connection with (70665)
  [70665, { coreImage: "関連事項として結びつける句がコアイメージ。", usage: "告知・案内文でよく使う。", synonymDifference: "in connection with vs related to: 前者がややフォーマル。", englishDefinition: "In relation to.", etymology: "connection 句。" }],
  // to put it another way (70666)
  [70666, { coreImage: "別の言い方で再説明する導入句がコアイメージ。", usage: "理解確認の言い換えで有効。", synonymDifference: "to put it another way vs in other words: ほぼ同義。", englishDefinition: "To express it differently.", etymology: "put + another way 構文。" }],
  // under normal circumstances (70667)
  [70667, { coreImage: "通常条件下での標準的挙動を示す句がコアイメージ。", usage: "例外条件との対比で使う。", synonymDifference: "under normal circumstances vs usually: 前者は条件枠が明示。", englishDefinition: "In ordinary conditions.", etymology: "normal circumstances 句。" }],
  // in a broader sense (70668)
  [70668, { coreImage: "狭義でなく広義解釈を示す句がコアイメージ。", usage: "概念拡張の説明に使える。", synonymDifference: "in a broader sense vs generally: 前者は意味範囲の拡張。", englishDefinition: "In a wider meaning.", etymology: "broader + sense 句。" }],
  // in practical language (70669)
  [70669, { coreImage: "専門表現を実用的・平易に言い直す意図がコアイメージ。", usage: "難解説明の簡約導入に使う。", synonymDifference: "in practical language vs simply: 前者は実用語化を強調。", englishDefinition: "In plain practical terms.", etymology: "practical language 句。" }],
  // from an operational view (70670)
  [70670, { coreImage: "運用面の観点から評価する句がコアイメージ。", usage: "理論対運用の差分説明に有効。", synonymDifference: "from an operational view vs from a practical standpoint: 近いが前者は運用管理寄り。", englishDefinition: "From an operations perspective.", etymology: "operational view 句。" }],
  // in light of this (70731)
  [70731, { coreImage: "直前情報を踏まえた判断更新を示す句がコアイメージ。", usage: "結論修正の橋渡しで有効。", synonymDifference: "in light of this vs therefore: 前者は情報更新を明示。", englishDefinition: "Considering this.", etymology: "light（照らして見る）比喩。" }],
  // with regard to (70732)
  [70732, { coreImage: "対象事項を明示するフォーマル接続句がコアイメージ。", usage: "メール・文書で頻出。", synonymDifference: "with regard to vs regarding: 前者がやや硬い。", englishDefinition: "Concerning; in relation to.", etymology: "regard（関連）句。" }],
  // to be candid (70735)
  [70735, { coreImage: "率直に述べると前置きする句がコアイメージ。", usage: "評価を正直に伝える時に使う。", synonymDifference: "to be candid vs to be honest: ほぼ同義で candid はやや改まる。", englishDefinition: "To speak frankly.", etymology: "candid（率直）不定詞句。" }],
  // in accordance with (70738)
  [70738, { coreImage: "規則・方針に従っていることを示す句がコアイメージ。", usage: "規程準拠の公式文で多用。", synonymDifference: "in accordance with vs in line with: 前者がよりフォーマル。", englishDefinition: "In conformity with.", etymology: "accordance（一致）句。" }],
  // for the sake of clarity (70739)
  [70739, { coreImage: "誤解防止のため明確化する目的句がコアイメージ。", usage: "定義再掲や補足説明の導入に有効。", synonymDifference: "for the sake of clarity vs to clarify: 前者は目的性を強調。", englishDefinition: "To make things clear.", etymology: "clarity（明確さ）句。" }],
  // to a certain degree (70740)
  [70740, { coreImage: "限定付きで成り立つことを示す程度句がコアイメージ。", usage: "全肯定を避けた評価に使える。", synonymDifference: "to a certain degree vs to some extent: ほぼ同義。", englishDefinition: "To some extent.", etymology: "certain degree 句。" }],
  // iffy (70081)
  [70081, { coreImage: "確実性が低く微妙だと示す口語形容がコアイメージ。", usage: "予定や品質が不安定な時に使う。", synonymDifference: "iffy vs uncertain: iffy の方が口語で軽い。", englishDefinition: "Doubtful or uncertain (informal).", etymology: "if 由来の口語形成。" }],
  // dicey (70082)
  [70082, { coreImage: "危険や不確実性が高い状態を示す口語語がコアイメージ。", usage: "判断がリスク高い場面で使う。", synonymDifference: "dicey vs risky: dicey の方が口語で不安感が強い。", englishDefinition: "Risky or unpredictable.", etymology: "dice（サイコロ）比喩。" }],
  // bummed (70083)
  [70083, { coreImage: "落胆して気分が下がった状態がコアイメージ。", usage: "失望をカジュアルに伝える。", synonymDifference: "bummed vs disappointed: bummed の方が口語。", englishDefinition: "Disappointed or upset (informal).", etymology: "bum out 由来。" }],
  // gutted (70084)
  [70084, { coreImage: "非常に強い失望を示す英国口語がコアイメージ。", usage: "大きな期待外れの場面で使う。", synonymDifference: "gutted vs bummed: gutted の方が程度が強い。", englishDefinition: "Extremely disappointed (BrE informal).", etymology: "gut（内臓）から感情強度へ比喩。" }],
  // knackered (70085)
  [70085, { coreImage: "疲れ切って動けないほどの疲労を示す英国口語がコアイメージ。", usage: "日常会話で強い疲れを表す。", synonymDifference: "knackered vs exhausted: 前者は英国口語色が強い。", englishDefinition: "Very tired (BrE informal).", etymology: "knacker（廃馬処理業）由来俗語。" }],
  // dodgy (70086)
  [70086, { coreImage: "信頼性が低く怪しい様子を示す英国口語がコアイメージ。", usage: "人・場所・話の怪しさ評価で使う。", synonymDifference: "dodgy vs sketchy: 近いが dodgy は英国口語寄り。", englishDefinition: "Suspicious or unreliable (BrE informal).", etymology: "dodge（ごまかす）系。" }],
  // chuffed (70087)
  [70087, { coreImage: "かなり嬉しい・満足している状態を示す英国口語がコアイメージ。", usage: "成果報告の前向き表現に使う。", synonymDifference: "chuffed vs pleased: chuffed の方が口語で感情強め。", englishDefinition: "Very pleased (BrE informal).", etymology: "語源不詳の英国俗語。" }],
  // gobsmacked (70088)
  [70088, { coreImage: "驚きで言葉を失うほどの衝撃を示す英国口語がコアイメージ。", usage: "想定外の出来事への強い反応。", synonymDifference: "gobsmacked vs shocked: 前者は口語で驚愕度が高い。", englishDefinition: "Utterly astonished (BrE informal).", etymology: "gob（口）+ smacked（打たれた）比喩。" }],
  // stingy (70089)
  [70089, { coreImage: "お金や資源を出し惜しみする性質がコアイメージ。", usage: "人の気前の悪さを評価する語。", synonymDifference: "stingy vs cheap: stingy は人の性質、cheap は価格にも使う。", englishDefinition: "Unwilling to spend or share.", etymology: "sting（刺す）由来の否定的比喩。" }],
  // snarky (70090)
  [70090, { coreImage: "皮肉・嫌味を含む語調を示す形容がコアイメージ。", usage: "発言態度の批判に使う。", synonymDifference: "snarky vs sarcastic: snarky は軽口・意地悪感、sarcastic は皮肉技法。", englishDefinition: "Sharply critical or mocking in tone.", etymology: "snark（皮肉）由来。" }],
  // flaky (70091)
  [70091, { coreImage: "予定を守らず当てにならない性質がコアイメージ。", usage: "人の信頼性評価で使う口語。", synonymDifference: "flaky vs unreliable: flaky の方が口語で人物評価寄り。", englishDefinition: "Unreliable or inconsistent (informal).", etymology: "flake（崩れやすい）比喩。" }],
  // shady (70092)
  [70092, { coreImage: "不透明で違法・不正の疑いがある状態がコアイメージ。", usage: "取引や人物の怪しさに使う。", synonymDifference: "shady vs suspicious: shady は不正含意が強い。", englishDefinition: "Questionable or morally doubtful.", etymology: "shade（陰）から不透明性へ比喩。" }],
  // cheesy (70093)
  [70093, { coreImage: "安っぽく陳腐で気恥ずかしい感じがコアイメージ。", usage: "演出・表現の古臭さ評価に使う。", synonymDifference: "cheesy vs tacky: cheesy は陳腐・気恥ずかしさ、tacky は下品さ。", englishDefinition: "Cheap, corny, or overly sentimental.", etymology: "cheese の俗語的転義。" }],
  // corny (70094)
  [70094, { coreImage: "古臭くベタで新鮮さに欠ける表現がコアイメージ。", usage: "ジョークや台詞の評価でよく使う。", synonymDifference: "corny vs cheesy: 近いが corny は「ベタ感」が中心。", englishDefinition: "Old-fashioned and unoriginal in a way that may be embarrassing.", etymology: "corn（ありふれた）俗語転義。" }],
  // tacky (70095)
  [70095, { coreImage: "趣味が悪く品位に欠ける評価がコアイメージ。", usage: "服装・装飾・発言の下品さに使う。", synonymDifference: "tacky vs cheap: tacky は美意識の低さ評価。", englishDefinition: "In bad taste; cheap-looking.", etymology: "tack（粘つく）由来説。" }],
  // wonky (70096)
  [70096, { coreImage: "正常でなく不安定・歪んだ状態がコアイメージ。", usage: "機器・制度・説明の不具合を口語で述べる。", synonymDifference: "wonky vs weird: wonky は不安定・不具合含意が強い。", englishDefinition: "Unstable, off-balance, or not working properly (informal).", etymology: "方言語源の口語。" }],
  // suss (70097)
  [70097, { coreImage: "怪しいと見抜く/判断する口語動詞がコアイメージ。", usage: "suss out で「見抜く・把握する」。", synonymDifference: "suss vs figure out: suss out の方が勘で見抜く感じ。", englishDefinition: "To figure out; to realize (informal).", etymology: "suspect/ suspicious 省略系俗語。" }],
  // faff (70098)
  [70098, { coreImage: "無駄に手間取る・だらだらする英国口語がコアイメージ。", usage: "faff about/around で使われる。", synonymDifference: "faff vs waste time: faff は細かな無駄作業感。", englishDefinition: "To spend time ineffectively (BrE informal).", etymology: "英国口語語源。" }],
  // skedaddle (70099)
  [70099, { coreImage: "急いでその場を去る軽快な口語動詞がコアイメージ。", usage: "冗談交じりに「退散」を言う時に使う。", synonymDifference: "skedaddle vs leave: skedaddle は急いで逃げる感じ。", englishDefinition: "To leave quickly (informal).", etymology: "米俗語起源（19世紀）。" }],
  // shenanigans (70100)
  [70100, { coreImage: "いたずら・ずる・騒ぎなど胡散臭い行為全般がコアイメージ。", usage: "軽い非難や冗談で使う複数形名詞。", synonymDifference: "shenanigans vs mischief: 近いが shenanigans は騒動感が強い。", englishDefinition: "Silly or dishonest behavior (informal, usually plural).", etymology: "米俗語語源。" }],
  // cut to the chase (70161)
  [70161, { coreImage: "前置きを省いて要点へ直行する慣用句がコアイメージ。", usage: "会議や交渉で時間短縮に使う。", synonymDifference: "cut to the chase vs in short: 前者は行動指示として強い。", englishDefinition: "Get to the main point without delay.", etymology: "映画追跡場面に由来する表現。" }],
  // read between the lines (70162)
  [70162, { coreImage: "明示されない含意を文脈から読み取る行為がコアイメージ。", usage: "婉曲表現の解釈で使う。", synonymDifference: "read between the lines vs infer: 前者は言外の意図読解に特化。", englishDefinition: "To understand hidden meaning.", etymology: "行間を読む比喩。" }],
  // play devil's advocate (70163)
  [70163, { coreImage: "検討のため敢えて反対意見を出す役割がコアイメージ。", usage: "対立目的ではなく議論精度向上に使う。", synonymDifference: "play devil's advocate vs disagree: 前者は役割的反論。", englishDefinition: "Argue an opposing view for discussion purposes.", etymology: "教会法用語由来。" }],
  // hit the nail on the head (70164)
  [70164, { coreImage: "核心を正確に突く比喩がコアイメージ。", usage: "洞察への高評価で使う。", synonymDifference: "hit the nail on the head vs be right: 前者は的確性を強調。", englishDefinition: "To describe exactly what is causing a situation.", etymology: "釘頭を打つ比喩。" }],
  // bend over backwards (70165)
  [70165, { coreImage: "相手のために過剰なほど努力する比喩がコアイメージ。", usage: "献身的対応の強調に使う。", synonymDifference: "bend over backwards vs try hard: 前者は度合いが強い。", englishDefinition: "To make a great effort to help or please someone.", etymology: "身体を反らす誇張比喩。" }],
  // call it a day (70166)
  [70166, { coreImage: "作業を切り上げて終了宣言する慣用句がコアイメージ。", usage: "会議・作業終わりで自然。", synonymDifference: "call it a day vs finish: 前者は切り上げ判断を含む。", englishDefinition: "To stop working for the day.", etymology: "day を一区切りとする慣用。" }],
  // be on the same page (70167)
  [70167, { coreImage: "認識・方針が一致している状態がコアイメージ。", usage: "チーム連携確認で高頻度。", synonymDifference: "be on the same page vs agree: 前者は共有理解まで含む。", englishDefinition: "To have the same understanding.", etymology: "同じページを見る比喩。" }],
  // under the weather (70168)
  [70168, { coreImage: "体調不良を婉曲に示す慣用句がコアイメージ。", usage: "重すぎない体調不良の説明に使う。", synonymDifference: "under the weather vs sick: 前者は柔らかい婉曲。", englishDefinition: "Feeling slightly ill.", etymology: "海上気象比喩由来説。" }],
  // once in a blue moon (70169)
  [70169, { coreImage: "極めてまれな頻度を示す慣用句がコアイメージ。", usage: "「ごくたまに」を印象的に言える。", synonymDifference: "once in a blue moon vs rarely: 前者は強い比喩表現。", englishDefinition: "Very rarely.", etymology: "青い月という稀事象比喩。" }],
  // the ball is in your court (70170)
  [70170, { coreImage: "次の行動責任が相手側にあることを示す比喩がコアイメージ。", usage: "交渉・依頼後の主導権移譲で使う。", synonymDifference: "the ball is in your court vs your turn: 前者は責任含意が強い。", englishDefinition: "It is now your responsibility to act.", etymology: "テニス比喩。" }],
  // go the extra mile (70171)
  [70171, { coreImage: "求められる水準を超えて努力する姿勢がコアイメージ。", usage: "顧客対応・学習姿勢の賞賛に使う。", synonymDifference: "go the extra mile vs work hard: 前者は追加努力を強調。", englishDefinition: "To do more than what is required.", etymology: "聖書由来表現。" }],
  // up in the air (70172)
  [70172, { coreImage: "未確定で決まっていない状態がコアイメージ。", usage: "計画未定の共有に使う。", synonymDifference: "up in the air vs uncertain: 前者は計画未確定の文脈に強い。", englishDefinition: "Not yet decided.", etymology: "空中で落ち着かない比喩。" }],
  // on thin ice (70173)
  [70173, { coreImage: "危うい立場にあり小さな失敗で悪化する状態がコアイメージ。", usage: "人間関係や職場評価の警告で使う。", synonymDifference: "on thin ice vs in trouble: 前者は危険な境界状態を強調。", englishDefinition: "In a risky or vulnerable situation.", etymology: "薄氷比喩。" }],
  // by and large (70174)
  [70174, { coreImage: "細部の例外を除いた全体傾向を示す句がコアイメージ。", usage: "総評を穏やかに言う時に有効。", synonymDifference: "by and large vs overall: ほぼ同義でやや口語的。", englishDefinition: "On the whole; generally.", etymology: "航海用語起源説。" }],
  // in hindsight (70175)
  [70175, { coreImage: "後から振り返って分かる評価を示す句がコアイメージ。", usage: "反省や学びの共有でよく使う。", synonymDifference: "in hindsight vs in retrospect: ほぼ同義。", englishDefinition: "Looking back now.", etymology: "hind（後ろ）+ sight（視点）。" }],
  // take it with a grain of salt (70236)
  [70236, { coreImage: "情報を鵜呑みにせず割り引いて受け取る姿勢がコアイメージ。", usage: "噂や未確認情報の注意喚起に使う。", synonymDifference: "take it with a grain of salt vs doubt it: 前者は全面否定せず保留。", englishDefinition: "Treat information with skepticism.", etymology: "塩ひとつまみ比喩。" }],
  // elephant in the room (70237)
  [70237, { coreImage: "誰も触れない重大問題の存在がコアイメージ。", usage: "回避される論点を指摘する時に使う。", synonymDifference: "elephant in the room vs main issue: 前者はタブー性を含む。", englishDefinition: "An obvious problem people avoid discussing.", etymology: "巨大な象の比喩。" }],
  // throw in the towel (70238)
  [70238, { coreImage: "勝負を諦めて降参する比喩がコアイメージ。", usage: "挑戦断念の場面で使う。", synonymDifference: "throw in the towel vs give up: 前者は比喩性・劇的さが強い。", englishDefinition: "To give up or admit defeat.", etymology: "ボクシング由来。" }],
  // jump the gun (70239)
  [70239, { coreImage: "時期尚早に先走る行動がコアイメージ。", usage: "手順逸脱の注意喚起に使う。", synonymDifference: "jump the gun vs rush: 前者は早すぎる開始を強調。", englishDefinition: "To act too early.", etymology: "陸上競技のスタート合図由来。" }],
  // back to square one (70240)
  [70240, { coreImage: "進捗が失われ出発点へ戻る状態がコアイメージ。", usage: "計画のやり直しを示す時に使う。", synonymDifference: "back to square one vs start over: 前者は進捗喪失感が強い。", englishDefinition: "Back to the starting point.", etymology: "ゲーム盤由来説。" }],
  // burn the midnight oil (70241)
  [70241, { coreImage: "夜遅くまで働く・勉強する努力がコアイメージ。", usage: "締切前の集中努力を表す。", synonymDifference: "burn the midnight oil vs stay up late: 前者は目的ある努力を含む。", englishDefinition: "To work late into the night.", etymology: "ランプ油を夜更けまで燃やす比喩。" }],
  // on the fence (70242)
  [70242, { coreImage: "賛否どちらにも決められない保留状態がコアイメージ。", usage: "意思決定未了の説明に使う。", synonymDifference: "on the fence vs undecided: ほぼ同義で前者は慣用的。", englishDefinition: "Unable to decide between options.", etymology: "柵の上でどちらにも降りない比喩。" }],
  // behind the scenes (70243)
  [70243, { coreImage: "表には見えない裏方で進む活動がコアイメージ。", usage: "準備や調整の見えない努力を示せる。", synonymDifference: "behind the scenes vs secretly: 前者は裏方作業で必ずしも悪意でない。", englishDefinition: "Out of public view; privately in preparation.", etymology: "舞台裏比喩。" }],
  // open to interpretation (70244)
  [70244, { coreImage: "解釈が一通りでなく複数可能な状態がコアイメージ。", usage: "曖昧表現の注意喚起に使う。", synonymDifference: "open to interpretation vs unclear: 前者は多義性、後者は不明瞭さ。", englishDefinition: "Able to be understood in different ways.", etymology: "interpretation 句。" }],
  // in due course (70245)
  [70245, { coreImage: "しかるべき流れでやがて起こる時期感がコアイメージ。", usage: "即時でない丁寧な将来予告に使う。", synonymDifference: "in due course vs soon: 前者は時機適切性を含む。", englishDefinition: "At the appropriate time in the future.", etymology: "course（進行）句。" }],
  // at odds with (70246)
  [70246, { coreImage: "見解や利害が対立している状態がコアイメージ。", usage: "意見不一致の説明に使う。", synonymDifference: "at odds with vs different from: 前者は対立感が強い。", englishDefinition: "In conflict with.", etymology: "odds（食い違い）句。" }],
  // by no means (70247)
  [70247, { coreImage: "強い否定を丁寧に示す強調句がコアイメージ。", usage: "not と組み合わせて使う。", synonymDifference: "by no means vs not at all: ほぼ同義で前者はやや硬い。", englishDefinition: "Not at all; certainly not.", etymology: "means（方法）否定句。" }],
  // in light of (70248)
  [70248, { coreImage: "新情報を踏まえて判断する視点更新がコアイメージ。", usage: "方針修正の根拠提示に使う。", synonymDifference: "in light of vs because of: 前者は考慮の含意が強い。", englishDefinition: "Considering; in view of.", etymology: "light（照らして判断）比喩。" }],
  // to say the least (70249)
  [70249, { coreImage: "控えめ表現で実際の強さを含ませる句がコアイメージ。", usage: "皮肉や強調を柔らかく示せる。", synonymDifference: "to say the least vs at least: 前者は含みの強調。", englishDefinition: "To put it mildly.", etymology: "least（最小限）比喩。" }],
  // touch base (70250)
  [70250, { coreImage: "短く連絡を取り合って状況確認する慣用句がコアイメージ。", usage: "業務連絡で高頻度。", synonymDifference: "touch base vs contact: 前者は簡易確認のニュアンス。", englishDefinition: "To make brief contact and update each other.", etymology: "野球で塁に触れる比喩。" }],
  // beyond the pale (70291)
  [70291, { coreImage: "許容範囲を超えて受け入れ難い状態がコアイメージ。", usage: "行為の線引きを強く示す時に使う。", synonymDifference: "beyond the pale vs unacceptable: 前者は慣用的で強い。", englishDefinition: "Outside acceptable limits.", etymology: "pale（境界柵）由来。" }],
  // split hairs (70292)
  [70292, { coreImage: "些細な違いを過度に問題化する行為がコアイメージ。", usage: "議論が細部に偏った時の指摘に使う。", synonymDifference: "split hairs vs be precise: 前者は過剰さを含む。", englishDefinition: "To argue over very small differences.", etymology: "髪を割く比喩。" }],
  // move the needle (70293)
  [70293, { coreImage: "状況を目に見えて前進させる変化がコアイメージ。", usage: "成果やインパクト評価で頻出。", synonymDifference: "move the needle vs improve: 前者は有意な変化を強調。", englishDefinition: "To create meaningful progress.", etymology: "計器針を動かす比喩。" }],
  // in the loop (70294)
  [70294, { coreImage: "必要情報共有の輪に入っている状態がコアイメージ。", usage: "連絡体制の確認で使う。", synonymDifference: "in the loop vs informed: 前者は継続的共有を含む。", englishDefinition: "Included in ongoing information updates.", etymology: "情報ループ比喩。" }],
  // out of the loop (70295)
  [70295, { coreImage: "情報共有から外れている状態がコアイメージ。", usage: "認識齟齬の原因説明に使える。", synonymDifference: "out of the loop vs uninformed: 前者は共有系からの除外含意。", englishDefinition: "Not informed about current updates.", etymology: "in the loop の反対。" }],
  // table the discussion (70296)
  [70296, { coreImage: "議論を一旦保留して後で再開する行為がコアイメージ。", usage: "米英で意味差があるため注意（米:保留、英:提案）。", synonymDifference: "table the discussion vs postpone: 前者は会議運用での保留。", englishDefinition: "To postpone discussion for later (AmE).", etymology: "議題をテーブルに置く比喩。" }],
  // walk me through (70297)
  [70297, { coreImage: "手順を順を追って説明してもらう依頼がコアイメージ。", usage: "実務手順の確認で高頻度。", synonymDifference: "walk me through vs explain: 前者は段階説明を要求。", englishDefinition: "Explain step by step.", etymology: "walk through（順に通る）比喩。" }],
  // raise a red flag (70298)
  [70298, { coreImage: "危険兆候を警告として提示する行為がコアイメージ。", usage: "リスク管理文脈で有効。", synonymDifference: "raise a red flag vs warn: 前者は兆候提示に特化。", englishDefinition: "To signal a warning sign.", etymology: "赤旗警告の比喩。" }],
  // go sideways (70299)
  [70299, { coreImage: "計画が想定外に悪化・混乱する状態がコアイメージ。", usage: "プロジェクト失敗の口語表現として使う。", synonymDifference: "go sideways vs fail: 前者は逸脱・混乱含意。", englishDefinition: "To go wrong unexpectedly.", etymology: "横道に逸れる比喩。" }],
  // keep tabs on (70300)
  [70300, { coreImage: "継続的に動向を見張る管理行為がコアイメージ。", usage: "進捗監視やコスト管理で使う。", synonymDifference: "keep tabs on vs monitor: 前者は口語的。", englishDefinition: "To keep track of something regularly.", etymology: "tab（記録札）由来。" }],
  // call the shots (70341)
  [70341, { coreImage: "最終決定権を握って指示する立場がコアイメージ。", usage: "権限構造の説明で使う。", synonymDifference: "call the shots vs lead: 前者は意思決定権を強調。", englishDefinition: "To make the important decisions.", etymology: "射撃指示由来説。" }],
  // in a nutshell (70342)
  [70342, { coreImage: "非常に短く要約する表現がコアイメージ。", usage: "結論をコンパクトに示す時に使う。", synonymDifference: "in a nutshell vs in short: ほぼ同義で前者は慣用色が強い。", englishDefinition: "In very few words; briefly.", etymology: "木の実殻に収める比喩。" }],
  // off the top of my head (70343)
  [70343, { coreImage: "即興的な記憶ベース回答であることを示す句がコアイメージ。", usage: "正確性に留保を付ける時に有効。", synonymDifference: "off the top of my head vs I think: 前者は即答性を明示。", englishDefinition: "From memory without checking.", etymology: "頭のてっぺんから出る比喩。" }],
  // put a pin in it (70344)
  [70344, { coreImage: "今は保留して後で再開する会議用慣用句がコアイメージ。", usage: "話題脱線を止める際に有効。", synonymDifference: "put a pin in it vs table it: ほぼ同義で前者は口語的。", englishDefinition: "Pause this topic and return later.", etymology: "留めピンで仮止めする比喩。" }],
  // read the room (70345)
  [70345, { coreImage: "場の空気や反応を察知して振る舞う行為がコアイメージ。", usage: "対人調整力の評価で頻出。", synonymDifference: "read the room vs observe: 前者は社会的文脈読解を強調。", englishDefinition: "To sense the mood of people in a situation.", etymology: "部屋の空気を読む比喩。" }],
  // sweep it under the rug (70346)
  [70346, { coreImage: "問題を解決せず隠す行為がコアイメージ。", usage: "再発リスクのある隠蔽を批判する時に使う。", synonymDifference: "sweep it under the rug vs ignore: 前者は隠蔽意図を含む。", englishDefinition: "To hide a problem instead of dealing with it.", etymology: "じゅうたん下に掃き込む比喩。" }],
  // take a rain check (70347)
  [70347, { coreImage: "誘いを断りつつ別日へ延期する丁寧句がコアイメージ。", usage: "関係維持しながら断るのに有効。", synonymDifference: "take a rain check vs decline: 前者は再予定の含意。", englishDefinition: "To postpone an invitation to another time.", etymology: "野球雨天券由来。" }],
  // the jury is still out (70348)
  [70348, { coreImage: "結論がまだ出ていない判断保留状態がコアイメージ。", usage: "評価の未確定性を示す時に使う。", synonymDifference: "the jury is still out vs uncertain: 前者は判断プロセス含意。", englishDefinition: "A decision has not been made yet.", etymology: "陪審評議由来。" }],
  // think on your feet (70349)
  [70349, { coreImage: "即時に状況判断して対応する能力がコアイメージ。", usage: "面接・接客・危機対応で評価される能力。", synonymDifference: "think on your feet vs improvise: 前者は瞬時判断の側面が強い。", englishDefinition: "To think and respond quickly in a situation.", etymology: "立ったまま考える比喩。" }],
  // word of mouth (70350)
  [70350, { coreImage: "人づての口コミ伝播がコアイメージ。", usage: "広告以外の評判拡散を示す。", synonymDifference: "word of mouth vs rumor: 前者は口コミ一般、後者は真偽不明情報寄り。", englishDefinition: "Information spread by people talking to each other.", etymology: "mouth（口）を介した伝達。" }],
  // at stake (70391)
  [70391, { coreImage: "失う/得る重大対象がかかっている状態がコアイメージ。", usage: "意思決定の重要度を強調できる。", synonymDifference: "at stake vs important: 前者は利害が懸かる意味。", englishDefinition: "At risk or in question.", etymology: "stake（賭け金）由来。" }],
  // face the music (70392)
  [70392, { coreImage: "自分の行為の結果を受け止める覚悟がコアイメージ。", usage: "責任受容の文脈で使う。", synonymDifference: "face the music vs apologize: 前者は結果受容全般。", englishDefinition: "To accept unpleasant consequences.", etymology: "舞台/軍楽隊由来説。" }],
  // go to bat for (70393)
  [70393, { coreImage: "誰かのために積極的に擁護・支援する行為がコアイメージ。", usage: "推薦・弁護の場面で使う。", synonymDifference: "go to bat for vs support: 前者は代弁行為が強い。", englishDefinition: "To defend or support someone actively.", etymology: "野球打席比喩。" }],
  // in your corner (70394)
  [70394, { coreImage: "あなたの味方として支える立場がコアイメージ。", usage: "励まし・支援表明に使える。", synonymDifference: "in your corner vs with you: 前者は支援姿勢を強調。", englishDefinition: "Supporting you.", etymology: "ボクシングのコーナー比喩。" }],
  // level with (70395)
  [70395, { coreImage: "率直に本当のことを話す行為がコアイメージ。", usage: "信頼関係を前提に真実共有する時に使う。", synonymDifference: "level with vs tell: 前者は正直さの含意が強い。", englishDefinition: "To speak honestly with someone.", etymology: "level（平ら=ごまかさない）比喩。" }],
  // play it by ear (70396)
  [70396, { coreImage: "事前固定せず状況に応じて柔軟対応する姿勢がコアイメージ。", usage: "予定未確定時の方針として使う。", synonymDifference: "play it by ear vs improvise: 近いが前者は様子見含意。", englishDefinition: "To decide as events happen.", etymology: "楽譜なし演奏由来。" }],
  // pull strings (70397)
  [70397, { coreImage: "人脈や影響力を使って物事を動かす行為がコアイメージ。", usage: "やや否定的ニュアンスを持ちやすい。", synonymDifference: "pull strings vs help: 前者は裏の影響力行使。", englishDefinition: "To use influence to get something done.", etymology: "操り糸比喩。" }],
  // stick to your guns (70398)
  [70398, { coreImage: "圧力があっても立場を守り抜く姿勢がコアイメージ。", usage: "信念維持を評価する文脈で使う。", synonymDifference: "stick to your guns vs insist: 前者は圧力下での堅持を強調。", englishDefinition: "To maintain your position firmly.", etymology: "軍事比喩。" }],
  // throw someone under the bus (70399)
  [70399, { coreImage: "自己保身のため他者に責任を押し付ける行為がコアイメージ。", usage: "組織内の不公正行為批判で使う。", synonymDifference: "throw someone under the bus vs blame: 前者は裏切り含意が強い。", englishDefinition: "To sacrifice someone else for your own benefit.", etymology: "暴力的比喩。" }],
  // up to speed (70400)
  [70400, { coreImage: "必要情報を把握して追随可能な状態がコアイメージ。", usage: "オンボーディングや引継ぎで頻出。", synonymDifference: "up to speed vs informed: 前者は実務遂行可能性まで含む。", englishDefinition: "Fully informed and able to proceed.", etymology: "速度比喩。" }],
  // game changer (70441)
  [70441, { coreImage: "状況ルールを一変させる大きな要因がコアイメージ。", usage: "戦略上の転換点を示す時に使う。", synonymDifference: "game changer vs improvement: 前者は変化規模が大きい。", englishDefinition: "Something that changes the situation dramatically.", etymology: "ゲームの流れを変える比喩。" }],
  // hard stop (70442)
  [70442, { coreImage: "絶対に終えるべき時刻・境界を示す実務句がコアイメージ。", usage: "会議終了時刻の明示で有効。", synonymDifference: "hard stop vs deadline: 前者は即時停止の強制感。", englishDefinition: "A strict non-negotiable stopping point.", etymology: "停止指示語から。" }],
  // on my radar (70443)
  [70443, { coreImage: "注意対象として認識済みである状態がコアイメージ。", usage: "優先度は未確定だが把握済みと示せる。", synonymDifference: "on my radar vs aware: 前者は監視対象のニュアンス。", englishDefinition: "Noticed and being monitored.", etymology: "レーダー比喩。" }],
  // raise the bar (70444)
  [70444, { coreImage: "求める基準を引き上げる行為がコアイメージ。", usage: "品質向上や期待値上昇の文脈で使う。", synonymDifference: "raise the bar vs improve: 前者は基準自体の上昇。", englishDefinition: "To set a higher standard.", etymology: "走高跳バー比喩。" }],
  // see eye to eye (70445)
  [70445, { coreImage: "見解が一致している状態がコアイメージ。", usage: "合意形成の達成を示す時に使う。", synonymDifference: "see eye to eye vs agree: 前者は完全一致の響きが強い。", englishDefinition: "To agree fully.", etymology: "目線一致の比喩。" }],
  // set in stone (70446)
  [70446, { coreImage: "変更不能な確定状態を示す比喩がコアイメージ。", usage: "未確定事項の柔軟性を示す時は否定形で多用。", synonymDifference: "set in stone vs fixed: 前者は変更不能の強さ。", englishDefinition: "Firmly fixed and not changeable.", etymology: "石に刻む比喩。" }],
  // short fuse (70447)
  [70447, { coreImage: "すぐ怒る気質を示す比喩がコアイメージ。", usage: "感情コントロールの注意文脈で使う。", synonymDifference: "short fuse vs bad temper: 前者は発火の速さを強調。", englishDefinition: "A tendency to become angry quickly.", etymology: "導火線比喩。" }],
  // silver lining (70448)
  [70448, { coreImage: "悪い状況の中の前向き要素がコアイメージ。", usage: "逆境での希望提示に使う。", synonymDifference: "silver lining vs upside: 前者は逆境前提が強い。", englishDefinition: "A hopeful aspect in a difficult situation.", etymology: "雲の銀の縁比喩。" }],
  // take ownership (70449)
  [70449, { coreImage: "責任を自分事として引き受ける姿勢がコアイメージ。", usage: "業務文化で重要な行動概念。", synonymDifference: "take ownership vs be responsible: 前者は主体性が強い。", englishDefinition: "To accept full responsibility and act on it.", etymology: "ownership（所有）概念の比喩転用。" }],
  // zoom out (70450)
  [70450, { coreImage: "詳細から離れて全体像を見る視点切替がコアイメージ。", usage: "戦略検討や優先順位整理で有効。", synonymDifference: "zoom out vs step back: 前者は視覚的比喩が強い。", englishDefinition: "To look at the bigger picture.", etymology: "カメラ操作比喩。" }],
  // in the weeds (70491)
  [70491, { coreImage: "細部に入り込み過ぎて全体を見失う状態がコアイメージ。", usage: "議論の粒度調整で使える。", synonymDifference: "in the weeds vs detailed: 前者は過度で非効率の含意。", englishDefinition: "Stuck in excessive detail.", etymology: "雑草の中でもがく比喩。" }],
  // on the same wavelength (70492)
  [70492, { coreImage: "思考や感覚がよく合っている状態がコアイメージ。", usage: "協業相性の良さを示せる。", synonymDifference: "on the same wavelength vs on the same page: 前者は感覚一致寄り。", englishDefinition: "Thinking in a similar way.", etymology: "電波周波数比喩。" }],
  // pull no punches (70493)
  [70493, { coreImage: "遠慮せず率直に厳しいことを言う姿勢がコアイメージ。", usage: "フィードバックの強さを示す。", synonymDifference: "pull no punches vs be honest: 前者は厳しさが強い。", englishDefinition: "To speak very directly without softening.", etymology: "ボクシングで手加減しない比喩。" }],
  // run it up the flagpole (70494)
  [70494, { coreImage: "案を試しに提示して反応を見る行為がコアイメージ。", usage: "提案検証の初期段階で使う。", synonymDifference: "run it up the flagpole vs propose: 前者は試験的提示を強調。", englishDefinition: "To test an idea by seeing reactions.", etymology: "旗を掲げて反応を見る比喩。" }],
  // take stock (70495)
  [70495, { coreImage: "現状を棚卸しして判断材料を整理する行為がコアイメージ。", usage: "節目での振り返りに有効。", synonymDifference: "take stock vs review: 前者は現状把握・在庫比喩がある。", englishDefinition: "To assess the current situation.", etymology: "stock（在庫）確認由来。" }],
  // the bottom line (70496)
  [70496, { coreImage: "最終的に最も重要な結論・要点がコアイメージ。", usage: "議論収束の締めで使う。", synonymDifference: "the bottom line vs main point: 前者は結論性が強い。", englishDefinition: "The most important conclusion.", etymology: "会計帳簿の最下段由来。" }],
  // think twice (70497)
  [70497, { coreImage: "軽率行動を避け再考を促す句がコアイメージ。", usage: "警告・助言で使いやすい。", synonymDifference: "think twice vs reconsider: 前者は口語で警告感。", englishDefinition: "To reconsider carefully before acting.", etymology: "二度考える比喩。" }],
  // under the hood (70498)
  [70498, { coreImage: "外から見えない内部仕組みを示す比喩がコアイメージ。", usage: "技術説明で内部構造を指す時に使う。", synonymDifference: "under the hood vs inside: 前者は機構説明の比喩性が強い。", englishDefinition: "Inside the internal mechanism.", etymology: "車のボンネット下由来。" }],
  // wear many hats (70499)
  [70499, { coreImage: "一人が複数役割を兼任する状態がコアイメージ。", usage: "少人数組織での役割多様性説明に使う。", synonymDifference: "wear many hats vs multitask: 前者は役割兼任、後者は同時作業。", englishDefinition: "To perform many different roles.", etymology: "帽子=役職の比喩。" }],
  // zero in on (70500)
  [70500, { coreImage: "対象を絞って集中的に注目する行為がコアイメージ。", usage: "問題原因や優先課題の特定で使う。", synonymDifference: "zero in on vs focus on: 前者は絞り込みニュアンスが強い。", englishDefinition: "To focus closely on a specific target.", etymology: "照準ゼロ合わせ比喩。" }],
  // call an audible (70541)
  [70541, { coreImage: "状況に応じて計画をその場で変更する行為がコアイメージ。", usage: "固定計画より柔軟対応を示す時に使う。", synonymDifference: "call an audible vs change plan: 前者は即時判断の含意が強い。", englishDefinition: "To change strategy at the last moment.", etymology: "アメフトの戦術変更由来。" }],
  // close the loop (70542)
  [70542, { coreImage: "未完了事項を追跡し、完了連絡まで締める行為がコアイメージ。", usage: "タスク管理・報告の完了確認で頻出。", synonymDifference: "close the loop vs finish: 前者は連絡完結まで含む。", englishDefinition: "To complete a process and confirm closure.", etymology: "ループを閉じる比喩。" }],
  // get ahead of (70543)
  [70543, { coreImage: "問題が大きくなる前に先手対応する行為がコアイメージ。", usage: "リスク予防の方針として有効。", synonymDifference: "get ahead of vs prevent: 前者は先回り行動のニュアンス。", englishDefinition: "To deal with something before it worsens.", etymology: "ahead（前）に出る比喩。" }],
  // in the driver seat (70544)
  [70544, { coreImage: "主導権を握って意思決定を行う状態がコアイメージ。", usage: "交渉・プロジェクト主導を示す。", synonymDifference: "in the driver seat vs in control: 前者は操縦比喩で主体感が強い。", englishDefinition: "In control of decisions.", etymology: "運転席比喩。" }],
  // keep someone posted (70545)
  [70545, { coreImage: "相手に継続的に最新情報を共有する行為がコアイメージ。", usage: "進捗報告依頼として実務で頻出。", synonymDifference: "keep someone posted vs tell someone: 前者は継続更新を含む。", englishDefinition: "To keep someone regularly informed.", etymology: "post（掲示）比喩。" }],
  // learn the ropes (70546)
  [70546, { coreImage: "業務や環境の基本手順を身につける状態がコアイメージ。", usage: "新任者オンボーディング文脈で使う。", synonymDifference: "learn the ropes vs learn basics: 前者は実地手順の含意が強い。", englishDefinition: "To learn how things are done.", etymology: "船のロープ操作由来。" }],
  // not in the clear (70547)
  [70547, { coreImage: "問題が解消しておらず安全圏でない状態がコアイメージ。", usage: "リスク継続の共有で使う。", synonymDifference: "not in the clear vs still risky: 前者は慣用的。", englishDefinition: "Not yet free from trouble or risk.", etymology: "clear（障害なし）の否定。" }],
  // raise concerns (70548)
  [70548, { coreImage: "懸念事項を正式に提起する行為がコアイメージ。", usage: "品質・安全・倫理の注意喚起で使う。", synonymDifference: "raise concerns vs complain: 前者は建設的問題提起。", englishDefinition: "To express worries or issues.", etymology: "raise（持ち上げる）比喩。" }],
  // set expectations (70549)
  [70549, { coreImage: "成果・範囲・期限の期待値を事前調整する行為がコアイメージ。", usage: "齟齬防止の初期コミュニケーションで重要。", synonymDifference: "set expectations vs explain plan: 前者は期待管理に特化。", englishDefinition: "To define what outcomes or behavior are expected.", etymology: "expectation 管理用語。" }],
  // stay the course (70550)
  [70550, { coreImage: "困難があっても方針を維持して進む姿勢がコアイメージ。", usage: "長期計画の継続意思を示す時に有効。", synonymDifference: "stay the course vs continue: 前者は逆風下の継続を強調。", englishDefinition: "To keep following the current plan.", etymology: "航路維持の比喩。" }],
  // ahead of the curve (70671)
  [70671, { coreImage: "平均より先行している優位状態がコアイメージ。", usage: "技術・市場対応の先進性評価に使う。", synonymDifference: "ahead of the curve vs advanced: 前者は比較優位を強調。", englishDefinition: "More advanced than others.", etymology: "曲線（トレンド）比喩。" }],
  // boil down to (70672)
  [70672, { coreImage: "複雑な話を核心要因へ還元する句動詞がコアイメージ。", usage: "結論の単純化に有効。", synonymDifference: "boil down to vs mean: 前者は要約過程の含意がある。", englishDefinition: "To be reduced to the essential point.", etymology: "煮詰める比喩。" }],
  // circle back (70673)
  [70673, { coreImage: "後で再度その話題に戻る実務句がコアイメージ。", usage: "未確定事項の後追いに使う。", synonymDifference: "circle back vs come back to: 前者はビジネス口語。", englishDefinition: "To return to a topic later.", etymology: "円を描いて戻る比喩。" }],
  // cut corners (70674)
  [70674, { coreImage: "品質や手順を省いて手間を削る行為がコアイメージ。", usage: "コスト削減の負の側面指摘で使う。", synonymDifference: "cut corners vs save time: 前者は基準低下の含意。", englishDefinition: "To do something poorly to save time or money.", etymology: "角を切る比喩。" }],
  // deep dive (70675)
  [70675, { coreImage: "特定テーマを深掘り分析する行為がコアイメージ。", usage: "レビューや調査の重点設定に使う。", synonymDifference: "deep dive vs review: 前者は深度が高い。", englishDefinition: "An in-depth analysis.", etymology: "深く潜る比喩。" }],
  // drill down (70676)
  [70676, { coreImage: "上位情報から詳細レベルへ掘り下げる行為がコアイメージ。", usage: "データ分析や原因究明で頻出。", synonymDifference: "drill down vs deep dive: 前者は階層的掘り下げを強調。", englishDefinition: "To examine data or issues in greater detail.", etymology: "drill（掘削）比喩。" }],
  // get the ball rolling (70677)
  [70677, { coreImage: "停滞状態から物事を始動させる行為がコアイメージ。", usage: "会議開始・プロジェクト着手で使う。", synonymDifference: "get the ball rolling vs start: 前者は勢いづけの含意。", englishDefinition: "To start a process.", etymology: "球を転がし始める比喩。" }],
  // in lockstep (70678)
  [70678, { coreImage: "複数主体が完全に同期して動く状態がコアイメージ。", usage: "チーム連携や方針一致を強調できる。", synonymDifference: "in lockstep vs together: 前者は同期精度が高い。", englishDefinition: "Moving or acting in complete coordination.", etymology: "軍隊の足並み比喩。" }],
  // in real time (70679)
  [70679, { coreImage: "遅延なく同時進行で反映される時間性がコアイメージ。", usage: "監視・配信・処理説明で多用。", synonymDifference: "in real time vs immediately: 前者は継続同期の含意。", englishDefinition: "As events happen, without delay.", etymology: "計算機用語から一般化。" }],
  // leave no stone unturned (70680)
  [70680, { coreImage: "可能な手段を残さず徹底的に探る姿勢がコアイメージ。", usage: "調査や改善の徹底方針に使える。", synonymDifference: "leave no stone unturned vs try hard: 前者は網羅性を強調。", englishDefinition: "To do everything possible.", etymology: "石を裏返して探す比喩。" }],
  // move the goalposts (70681)
  [70681, { coreImage: "途中で評価基準を変更して不公平化する行為がコアイメージ。", usage: "合意違反の指摘で使う。", synonymDifference: "move the goalposts vs change requirements: 前者は不当変更含意。", englishDefinition: "To unfairly change the rules or standards.", etymology: "ゴール位置変更の比喩。" }],
  // on the fly (70682)
  [70682, { coreImage: "事前準備なしにその場で即興対応する様子がコアイメージ。", usage: "リアルタイム調整の説明で使う。", synonymDifference: "on the fly vs quickly: 前者は即興性を含む。", englishDefinition: "Done quickly while something is in progress.", etymology: "飛行中比喩。" }],
  // out of scope (70683)
  [70683, { coreImage: "合意範囲の外にある対象を示す管理句がコアイメージ。", usage: "要件境界の明確化で重要。", synonymDifference: "out of scope vs irrelevant: 前者は定義範囲外を示す。", englishDefinition: "Outside the defined boundaries of work.", etymology: "scope（範囲）管理用語。" }],
  // own the outcome (70684)
  [70684, { coreImage: "結果責任を主体的に引き受ける姿勢がコアイメージ。", usage: "リーダーシップ評価で有効。", synonymDifference: "own the outcome vs do the task: 前者は結果責任を強調。", englishDefinition: "Take full responsibility for the result.", etymology: "ownership 比喩。" }],
  // raise the stakes (70685)
  [70685, { coreImage: "勝負や判断の重要度を引き上げる行為がコアイメージ。", usage: "リスク・期待値上昇の説明に使う。", synonymDifference: "raise the stakes vs raise risks: 前者は利害全体の増大。", englishDefinition: "To increase the potential consequences.", etymology: "賭け金 stake 由来。" }],
  // run interference (70686)
  [70686, { coreImage: "妨害を引き受けて味方を動きやすくする支援行為がコアイメージ。", usage: "対外調整を代行する文脈で使う。", synonymDifference: "run interference vs support: 前者は障害処理の代行を強調。", englishDefinition: "To shield someone from obstacles.", etymology: "アメフト由来。" }],
  // scale up (70687)
  [70687, { coreImage: "小規模運用を大規模へ拡張する行為がコアイメージ。", usage: "成長戦略・システム運用で頻出。", synonymDifference: "scale up vs expand: 前者は運用規模と再現性の含意。", englishDefinition: "To increase capacity or size.", etymology: "scale（規模）動詞用法。" }],
  // sense-check (70688)
  [70688, { coreImage: "内容が常識的に妥当かを簡易検証する行為がコアイメージ。", usage: "提出前の軽い確認で有効。", synonymDifference: "sense-check vs verify: 前者は簡易妥当性確認。", englishDefinition: "To quickly check if something seems reasonable.", etymology: "sense（感覚）検証語。" }],
  // showstopper (70689)
  [70689, { coreImage: "進行を止める重大障害がコアイメージ。", usage: "リリース判断の停止要因として使う。", synonymDifference: "showstopper vs bug: 前者は停止級の重大性。", englishDefinition: "A critical issue that prevents progress.", etymology: "公演中断語から転用。" }],
  // single point of failure (70690)
  [70690, { coreImage: "一箇所の故障で全体停止する脆弱点がコアイメージ。", usage: "設計レビューで重要な概念。", synonymDifference: "single point of failure vs risk: 前者は構造的脆弱性を特定。", englishDefinition: "A component whose failure can bring down the whole system.", etymology: "工学用語。" }],
  // split the difference (70691)
  [70691, { coreImage: "双方の中間で妥協点を作る行為がコアイメージ。", usage: "価格・条件交渉で使いやすい。", synonymDifference: "split the difference vs compromise: 前者は数値中間に寄りやすい。", englishDefinition: "To settle at a midpoint between two positions.", etymology: "差額を分ける比喩。" }],
  // stress test (70692)
  [70692, { coreImage: "高負荷条件で耐性を検証する試験がコアイメージ。", usage: "運用前評価でリスク低減に有効。", synonymDifference: "stress test vs test: 前者は極限条件に特化。", englishDefinition: "A test under extreme conditions.", etymology: "工学・金融用語。" }],
  // take point (70693)
  [70693, { coreImage: "先頭で主担当を引き受ける行為がコアイメージ。", usage: "役割分担時の主担当指名で使う。", synonymDifference: "take point vs lead: 前者は当該タスク先頭担当の意味。", englishDefinition: "To take the lead role.", etymology: "先頭 point を取る軍事比喩。" }],
  // throughput (70694)
  [70694, { coreImage: "単位時間あたり処理量の指標がコアイメージ。", usage: "性能評価・業務効率で頻出。", synonymDifference: "throughput vs speed: 前者は処理量、後者は速度。", englishDefinition: "The amount processed in a given time.", etymology: "through + put の工学語。" }],
  // timebox (70695)
  [70695, { coreImage: "作業時間を先に固定して管理する手法がコアイメージ。", usage: "集中維持と遅延防止に有効。", synonymDifference: "timebox vs schedule: 前者は時間上限固定を強調。", englishDefinition: "To allocate a fixed time limit to a task.", etymology: "time + box 管理語。" }],
  // triage (70696)
  [70696, { coreImage: "優先度に応じて案件を分類し処理順を決める行為がコアイメージ。", usage: "障害対応・問い合わせ処理で重要。", synonymDifference: "triage vs prioritize: 前者は分類プロセスを含む。", englishDefinition: "To sort by urgency for action.", etymology: "医療トリアージ由来。" }],
  // under pressure (70697)
  [70697, { coreImage: "時間・責任・状況から強い負荷がかかる状態がコアイメージ。", usage: "パフォーマンス条件説明で使う。", synonymDifference: "under pressure vs stressed: 前者は外的圧力を強調。", englishDefinition: "In a stressful, demanding situation.", etymology: "pressure（圧力）句。" }],
  // upstream (70698)
  [70698, { coreImage: "工程の上流段階を示す位置概念がコアイメージ。", usage: "問題の源流側対策を示す時に使う。", synonymDifference: "upstream vs earlier: 前者は工程構造を含む。", englishDefinition: "At an earlier stage in a process.", etymology: "川の上流比喩。" }],
  // whiteboard it (70699)
  [70699, { coreImage: "ホワイトボードで可視化しながら考える行為がコアイメージ。", usage: "設計整理・認識合わせで有効。", synonymDifference: "whiteboard it vs discuss: 前者は図解可視化を含む。", englishDefinition: "To sketch and explain ideas on a whiteboard.", etymology: "whiteboard からの動詞化。" }],
  // workstream (70700)
  [70700, { coreImage: "プロジェクト内の独立した作業系統がコアイメージ。", usage: "大規模案件の分担管理で使う。", synonymDifference: "workstream vs task: 前者は継続する作業ライン。", englishDefinition: "A distinct stream of related work within a project.", etymology: "work + stream 合成語。" }],
  // alignment (70741)
  [70741, { coreImage: "目標・認識・行動がそろっている状態がコアイメージ。", usage: "組織協調の評価指標として重要。", synonymDifference: "alignment vs agreement: 前者は継続的整合を含む。", englishDefinition: "Shared understanding and coordinated direction.", etymology: "align（一直線にする）由来。" }],
  // bandwidth (70742)
  [70742, { coreImage: "時間・認知リソースの余力を示す比喩語がコアイメージ。", usage: "担当可能量の相談で頻出。", synonymDifference: "bandwidth vs time: 前者は処理能力全体を含む。", englishDefinition: "Available capacity to handle work.", etymology: "通信帯域から比喩転用。" }],
  // bottleneck (70743)
  [70743, { coreImage: "流れ全体を詰まらせる制約点がコアイメージ。", usage: "工程改善で優先的に特定する。", synonymDifference: "bottleneck vs issue: 前者は流量制限の主因。", englishDefinition: "A point that limits overall flow or progress.", etymology: "瓶の首比喩。" }],
  // dependency (70744)
  [70744, { coreImage: "他要素に依存して進行が決まる関係がコアイメージ。", usage: "計画遅延リスクの主要因として管理する。", synonymDifference: "dependency vs requirement: 前者は関係性、後者は必要条件。", englishDefinition: "A reliance on another task or component.", etymology: "depend 由来。" }],
  // escalate (70745)
  [70745, { coreImage: "解決困難事項を上位権限へ引き上げる行為がコアイメージ。", usage: "対応速度確保のための正式手段。", synonymDifference: "escalate vs report: 前者は権限レベルを上げる。", englishDefinition: "To raise an issue to a higher level for action.", etymology: "escalator と同根。" }],
  // fallback plan (70746)
  [70746, { coreImage: "主計画失敗時に切り替える代替計画がコアイメージ。", usage: "リスク管理で事前準備する。", synonymDifference: "fallback plan vs backup: 前者は計画単位、後者は資源複製にも使う。", englishDefinition: "A backup plan used if the primary plan fails.", etymology: "fall back（後退）由来。" }],
  // handoff (70747)
  [70747, { coreImage: "担当・責任・情報を次工程へ引き継ぐ行為がコアイメージ。", usage: "品質維持には手順化が重要。", synonymDifference: "handoff vs transfer: handoff は実務引継ぎの含意が強い。", englishDefinition: "Transfer of responsibility to another person or team.", etymology: "hand off（手渡す）由来。" }],
  // iteration (70748)
  [70748, { coreImage: "改善のため同工程を反復するサイクルがコアイメージ。", usage: "アジャイル開発や改善活動で頻出。", synonymDifference: "iteration vs repetition: 前者は改善目的の反復。", englishDefinition: "One repeated cycle of development or refinement.", etymology: "iterate（反復する）由来。" }],
  // milestone (70749)
  [70749, { coreImage: "進捗を測る重要達成点がコアイメージ。", usage: "計画管理で節目確認に使う。", synonymDifference: "milestone vs deadline: 前者は達成点、後者は期限。", englishDefinition: "A significant checkpoint in a project timeline.", etymology: "里程標（道標）由来。" }],
  // postmortem (70750)
  [70750, { coreImage: "事後に原因と学びを分析する振り返りがコアイメージ。", usage: "障害後改善の再発防止に不可欠。", synonymDifference: "postmortem vs review: 前者は失敗・事故後分析の色が強い。", englishDefinition: "A retrospective analysis after completion or failure.", etymology: "ラテン語 post mortem（死後）由来。" }],
  // apple (10001)
  [10001, { coreImage: "身近な果物の具体物を指す基礎名詞がコアイメージ。", usage: "可算名詞で「an apple / apples」が基本。", synonymDifference: "apple vs fruit: apple は種類名、fruit は果物全体。", englishDefinition: "A round fruit with red, green, or yellow skin.", etymology: "基礎語彙として初級段階で定着する語。" }],
  // book (10002)
  [10002, { coreImage: "読むために綴じられた本という具体物がコアイメージ。", usage: "「read a book」「a history book」の形で高頻度。", synonymDifference: "book vs textbook: textbook は教科書に限定。", englishDefinition: "A set of written or printed pages bound together.", etymology: "基礎語彙として長く使われる語。" }],
  // cat (10003)
  [10003, { coreImage: "猫という動物種を指す基礎名詞がコアイメージ。", usage: "可算名詞で「a cat / cats」。", synonymDifference: "cat vs kitten: kitten は子猫。", englishDefinition: "A small domesticated animal with fur and whiskers.", etymology: "日常語として初級で学ぶ動物名。" }],
  // dog (10004)
  [10004, { coreImage: "犬という動物種を指す基礎名詞がコアイメージ。", usage: "「walk a dog」「pet dog」などで使う。", synonymDifference: "dog vs puppy: puppy は子犬。", englishDefinition: "A domesticated animal often kept as a pet.", etymology: "初級英語で最重要の動物語彙。" }],
  // eat (10005)
  [10005, { coreImage: "食べ物を口にして摂取する行為がコアイメージ。", usage: "「eat breakfast」「eat with ...」で高頻度。", synonymDifference: "eat vs have: have は食事を取る婉曲用法でも使う。", englishDefinition: "To put food into your mouth and swallow it.", etymology: "最基礎動詞として早期に定着する語。" }],
  // friend (10006)
  [10006, { coreImage: "親しく付き合う相手という関係名詞がコアイメージ。", usage: "可算名詞で「a friend」「my friends」。", synonymDifference: "friend vs classmate: classmate は同級生で友人とは限らない。", englishDefinition: "A person you know well and like.", etymology: "人間関係語彙の基礎語。" }],
  // go (10007)
  [10007, { coreImage: "話し手の位置から離れて移動する行為がコアイメージ。", usage: "「go to school」「go home」が基本連語。", synonymDifference: "go vs come: go は離れる方向、come は近づく方向。", englishDefinition: "To move from one place to another.", etymology: "英語の最重要移動動詞。" }],
  // house (10009)
  [10009, { coreImage: "人が住む建物そのものを指す名詞がコアイメージ。", usage: "「a big house」「at my house」の形で使う。", synonymDifference: "house vs home: house は建物、home は生活の場。", englishDefinition: "A building where people live.", etymology: "生活語彙の中心となる基礎語。" }],
  // know (10010)
  [10010, { coreImage: "情報や事実を知っている状態がコアイメージ。", usage: "「know + 名詞」「know that ...」で使う。", synonymDifference: "know vs understand: know は知識保持、understand は理解。", englishDefinition: "To have information or knowledge about something.", etymology: "認知動詞の基礎語。" }],
  // like (10011)
  [10011, { coreImage: "好意を持つ、または似ていることを示す語がコアイメージ。", usage: "動詞「I like music」と前置詞「like this」の両用。", synonymDifference: "like vs love: love の方が感情強度が高い。", englishDefinition: "To enjoy or prefer; also used to show similarity.", etymology: "高頻度の多機能基礎語。" }],
  // name (10013)
  [10013, { coreImage: "人や物を識別する呼び名がコアイメージ。", usage: "「My name is ...」「family name」で頻出。", synonymDifference: "name vs title: title は肩書きや作品名。", englishDefinition: "The word by which a person or thing is known.", etymology: "自己紹介で最重要の基礎語。" }],
  // old (10014)
  [10014, { coreImage: "年数を経ている状態を示す形容がコアイメージ。", usage: "人にも物にも使えるが文脈で意味が変わる。", synonymDifference: "old vs aged: aged はややフォーマル。", englishDefinition: "Having existed for many years; not new.", etymology: "対義語 new と対で学ぶ基礎語。" }],
  // play (10015)
  [10015, { coreImage: "遊ぶ、または演奏する行為を表す多義動詞がコアイメージ。", usage: "「play soccer」「play the piano」で型が異なる。", synonymDifference: "play vs practice: play は実行、practice は練習。", englishDefinition: "To take part in a game; to perform music.", etymology: "初級で早く身につける多義動詞。" }],
  // run (10016)
  [10016, { coreImage: "足で速く移動する動作がコアイメージ。", usage: "自動詞が基本だが「run a shop」の他義もある。", synonymDifference: "run vs walk: run は歩くより速い移動。", englishDefinition: "To move quickly on foot.", etymology: "高頻度の基礎動詞。" }],
  // school (10017)
  [10017, { coreImage: "学ぶための教育機関・場所がコアイメージ。", usage: "「go to school」「at school」で頻出。", synonymDifference: "school vs class: class は授業・学級単位。", englishDefinition: "A place where children are educated.", etymology: "学習文脈の中心語彙。" }],
  // teacher (10018)
  [10018, { coreImage: "教える役割の人を指す職業名詞がコアイメージ。", usage: "可算名詞で「a teacher」「English teacher」。", synonymDifference: "teacher vs instructor: instructor は指導者一般でやや広い。", englishDefinition: "A person whose job is to teach.", etymology: "teach + -er の基本語形成。" }],
  // use (10019)
  [10019, { coreImage: "道具や方法を目的のために使う行為がコアイメージ。", usage: "「use + 名詞」「be used for ...」で使う。", synonymDifference: "use vs utilize: utilize はややフォーマル。", englishDefinition: "To do something with a tool or method for a purpose.", etymology: "実用語彙の基礎動詞。" }],
  // very (10020)
  [10020, { coreImage: "程度を強める基本強調副詞がコアイメージ。", usage: "形容詞・副詞を修飾して程度を上げる。", synonymDifference: "very vs really: really の方が口語で柔らかい場面がある。", englishDefinition: "Used to emphasize degree.", etymology: "最初期に習得する強調副詞。" }],
  // water (10021)
  [10021, { coreImage: "飲用や生活に不可欠な液体を指す名詞がコアイメージ。", usage: "通常不可算名詞で「some water」。", synonymDifference: "water vs drink: drink は飲料一般。", englishDefinition: "The clear liquid that people and animals drink.", etymology: "生活基盤語彙の基礎語。" }],
  // year (10022)
  [10022, { coreImage: "12か月の時間単位を示す名詞がコアイメージ。", usage: "「this year」「next year」で高頻度。", synonymDifference: "year vs month: year は月より長い単位。", englishDefinition: "A period of twelve months.", etymology: "時間表現の基本単位語。" }],
  // zoo (10023)
  [10023, { coreImage: "動物を展示・保護する施設を指す名詞がコアイメージ。", usage: "「go to the zoo」が定型。", synonymDifference: "zoo vs aquarium: aquarium は水族館。", englishDefinition: "A place where animals are kept for people to see.", etymology: "初級学習で扱う施設語彙。" }],
  // morning (10024)
  [10024, { coreImage: "一日の始まりの時間帯を示す名詞がコアイメージ。", usage: "「in the morning」「Good morning」で頻出。", synonymDifference: "morning vs dawn: dawn は夜明けの瞬間寄り。", englishDefinition: "The early part of the day.", etymology: "時間帯語彙の基礎語。" }],
  // night (10025)
  [10025, { coreImage: "日没後の暗い時間帯を示す名詞がコアイメージ。", usage: "「at night」「Good night」が定型。", synonymDifference: "night vs evening: evening は夜の早い時間帯。", englishDefinition: "The time when it is dark outside.", etymology: "時間帯語彙の基礎語。" }],
  // mother (10026)
  [10026, { coreImage: "母親という家族関係を示す名詞がコアイメージ。", usage: "「my mother」「her mother」で使う。", synonymDifference: "mother vs mom: mom はより口語的。", englishDefinition: "A female parent.", etymology: "家族語彙の基本語。" }],
  // father (10027)
  [10027, { coreImage: "父親という家族関係を示す名詞がコアイメージ。", usage: "「my father」「his father」で使う。", synonymDifference: "father vs dad: dad はより口語的。", englishDefinition: "A male parent.", etymology: "家族語彙の基本語。" }],
  // sister (10028)
  [10028, { coreImage: "女性のきょうだいを示す家族名詞がコアイメージ。", usage: "「my sister」「older sister」などで使う。", synonymDifference: "sister vs sibling: sibling は性別中立。", englishDefinition: "A female sibling.", etymology: "家族関係の基礎語。" }],
  // brother (10029)
  [10029, { coreImage: "男性のきょうだいを示す家族名詞がコアイメージ。", usage: "「my brother」「younger brother」などで使う。", synonymDifference: "brother vs sibling: sibling は性別中立。", englishDefinition: "A male sibling.", etymology: "家族関係の基礎語。" }],
  // time (10030)
  [10030, { coreImage: "時刻・時間・機会を表す多義名詞がコアイメージ。", usage: "「What time...?」「have time to do」で頻出。", synonymDifference: "time vs hour: hour は60分の単位。", englishDefinition: "The passing of moments; a point in the day.", etymology: "非常に高頻度の基礎語。" }],
  // read (10031)
  [10031, { coreImage: "文字情報を見て内容を理解する行為がコアイメージ。", usage: "「read a book」「read about ...」で使う。", synonymDifference: "read vs study: read は読む行為、study は学習行為。", englishDefinition: "To look at written words and understand them.", etymology: "学習行為の中心動詞。" }],
  // write (10032)
  [10032, { coreImage: "文字を記して情報を表す行為がコアイメージ。", usage: "「write a letter」「write to ...」で使う。", synonymDifference: "write vs type: write は手書きにも広く使える。", englishDefinition: "To make letters or words on paper or screen.", etymology: "表現活動の基礎動詞。" }],
  // speak (10033)
  [10033, { coreImage: "声に出して言語を話す行為がコアイメージ。", usage: "「speak English」「speak to ...」で頻出。", synonymDifference: "speak vs talk: speak はややフォーマル、talk は口語的。", englishDefinition: "To say words out loud; to use a language.", etymology: "コミュニケーション基礎動詞。" }],
  // listen (10034)
  [10034, { coreImage: "意識して耳を傾ける行為がコアイメージ。", usage: "「listen to music」のように to が必要。", synonymDifference: "listen vs hear: listen は意図的、hear は自然に聞こえる。", englishDefinition: "To pay attention to sound.", etymology: "聴覚行為の基礎動詞。" }],
  // want (10035)
  [10035, { coreImage: "欲求や希望を表す基本動詞がコアイメージ。", usage: "「want + 名詞」「want to do」が基本。", synonymDifference: "want vs need: want は希望、need は必要。", englishDefinition: "To desire something; to wish to do something.", etymology: "初級で重要な欲求表現動詞。" }],
  // bird (10036)
  [10036, { coreImage: "羽とくちばしを持つ鳥類を指す名詞がコアイメージ。", usage: "可算名詞で「a bird / birds」。", synonymDifference: "bird vs chicken: chicken は鶏に限定。", englishDefinition: "An animal with feathers and wings.", etymology: "動物語彙の基礎語。" }],
  // fish (10037)
  [10037, { coreImage: "水中で生きる魚類を指す名詞がコアイメージ。", usage: "生き物としても食材としても使う。", synonymDifference: "fish vs seafood: seafood は魚介類全体。", englishDefinition: "An animal that lives in water and has gills.", etymology: "生活語彙と食語彙の両方で重要。" }],
  // rabbit (10038)
  [10038, { coreImage: "耳が長い小動物を指す名詞がコアイメージ。", usage: "「a rabbit」「pet rabbit」の形で使う。", synonymDifference: "rabbit vs hare: hare は野生で体が大きい種を指すことが多い。", englishDefinition: "A small animal with long ears.", etymology: "初級動物語彙。" }],
  // horse (10039)
  [10039, { coreImage: "人が乗ることもある大型の家畜動物がコアイメージ。", usage: "「ride a horse」が定型。", synonymDifference: "horse vs pony: pony は小型の馬。", englishDefinition: "A large animal used for riding or work.", etymology: "基本動物語彙。" }],
  // cow (10040)
  [10040, { coreImage: "乳を出す家畜としての牛を指す名詞がコアイメージ。", usage: "「a cow」「milk from cows」の形で使う。", synonymDifference: "cow vs bull: bull は雄牛。", englishDefinition: "A large farm animal, especially a female one kept for milk.", etymology: "家畜語彙の基礎語。" }],
  // pig (10041)
  [10041, { coreImage: "豚という家畜動物を指す名詞がコアイメージ。", usage: "動物名として使い、食肉では pork を使うことが多い。", synonymDifference: "pig vs pork: pig は動物、pork は豚肉。", englishDefinition: "A farm animal with a short snout.", etymology: "家畜語彙の基礎語。" }],
  // monkey (10042)
  [10042, { coreImage: "猿類の動物を指す名詞がコアイメージ。", usage: "「a monkey」「monkeys in the zoo」で使う。", synonymDifference: "monkey vs ape: ape は尾がない類人猿を指す。", englishDefinition: "An animal like an ape, usually with a tail.", etymology: "動物語彙の基礎語。" }],
  // bear (10043)
  [10043, { coreImage: "大型の哺乳類クマを指す名詞がコアイメージ。", usage: "動物名としての bear（名詞）をまず習得。", synonymDifference: "bear vs polar bear: 後者は種名。", englishDefinition: "A large, heavy wild animal with thick fur.", etymology: "基本動物語彙。" }],
  // elephant (10044)
  [10044, { coreImage: "長い鼻を持つ大型動物を指す名詞がコアイメージ。", usage: "「an elephant」など不定冠詞に注意。", synonymDifference: "elephant vs mammal: mammal は分類語、elephant は種名。", englishDefinition: "A very large animal with a trunk.", etymology: "初級で扱う代表動物名。" }],
  // lion (10045)
  [10045, { coreImage: "ライオンという大型の肉食獣を指す名詞がコアイメージ。", usage: "「a lion」「the lion」を文脈で使い分ける。", synonymDifference: "lion vs tiger: 種が異なる。", englishDefinition: "A large wild cat, often called the king of beasts.", etymology: "動物語彙の基礎語。" }],
  // tiger (10046)
  [10046, { coreImage: "縞模様を持つ大型の肉食獣を指す名詞がコアイメージ。", usage: "「a tiger」などで使う。", synonymDifference: "tiger vs lion: 種が異なる大型ネコ科動物。", englishDefinition: "A large wild cat with orange fur and black stripes.", etymology: "動物語彙の基礎語。" }],
  // chicken (10047)
  [10047, { coreImage: "鶏（動物）と鶏肉（食材）の両義を持つ語がコアイメージ。", usage: "文脈で生き物か食べ物かを判別する。", synonymDifference: "chicken vs hen: hen は雌鶏、chicken は一般名。", englishDefinition: "A farm bird; also its meat as food.", etymology: "初級で重要な多義名詞。" }],
  // egg (10048)
  [10048, { coreImage: "殻に包まれた卵という具体物がコアイメージ。", usage: "可算名詞で「an egg」「eggs」。", synonymDifference: "egg vs omelet: egg は素材、omelet は料理。", englishDefinition: "An oval object laid by birds, often eaten as food.", etymology: "食語彙の基礎名詞。" }],
  // milk (10049)
  [10049, { coreImage: "白い液体の飲料としての牛乳がコアイメージ。", usage: "通常不可算名詞で「some milk」。", synonymDifference: "milk vs dairy: dairy は乳製品全体。", englishDefinition: "A white liquid from animals, used as a drink.", etymology: "日常食語彙の基礎語。" }],
  // bread (10050)
  [10050, { coreImage: "小麦などで作る主食パンを指す名詞がコアイメージ。", usage: "不可算扱いが基本で「some bread」。", synonymDifference: "bread vs loaf: loaf はパン1斤の単位。", englishDefinition: "Food made from flour, water, and yeast, baked.", etymology: "基本食語彙の中心語。" }],
  // rice (10051)
  [10051, { coreImage: "米という穀物、または炊いたご飯を指す名詞がコアイメージ。", usage: "通常不可算で「some rice」。", synonymDifference: "rice vs grain: grain は穀物一般。", englishDefinition: "A small grain eaten as food, especially in Asia.", etymology: "食文化語彙の基礎語。" }],
  // cake (10052)
  [10052, { coreImage: "焼いて作る甘い菓子を指す名詞がコアイメージ。", usage: "可算名詞で「a cake」「a birthday cake」。", synonymDifference: "cake vs bread: cake は甘味菓子、bread は主食。", englishDefinition: "A sweet baked food made with flour and sugar.", etymology: "日常食語彙の基礎語。" }],
  // orange (10053)
  [10053, { coreImage: "オレンジという果物を指す名詞がコアイメージ。", usage: "色名としての orange も重要。", synonymDifference: "orange vs mandarin: mandarin はみかん系の別種。", englishDefinition: "A round citrus fruit with orange skin.", etymology: "果物語彙の基礎語。" }],
  // banana (10054)
  [10054, { coreImage: "長い形の果物バナナを指す名詞がコアイメージ。", usage: "可算名詞で「a banana / bananas」。", synonymDifference: "banana vs plantain: plantain は料理用バナナ。", englishDefinition: "A long curved yellow fruit.", etymology: "果物語彙の基礎語。" }],
  // fruit (10055)
  [10055, { coreImage: "果物全般をまとめる総称名詞がコアイメージ。", usage: "不可算扱いが多いが種類では可算用法もある。", synonymDifference: "fruit vs fruits: fruits は種類を区別する文脈で使う。", englishDefinition: "Sweet food that grows on trees or plants.", etymology: "食材分類の基本語。" }],
  // vegetable (10056)
  [10056, { coreImage: "野菜を指す食材分類名詞がコアイメージ。", usage: "可算で「a vegetable」、総称で vegetables。", synonymDifference: "vegetable vs fruit: 一般に甘味や食べ方で分類が異なる。", englishDefinition: "A plant eaten as food, such as carrot or cabbage.", etymology: "食材分類の基礎語。" }],
  // meat (10057)
  [10057, { coreImage: "動物由来の食肉全般を指す名詞がコアイメージ。", usage: "通常不可算名詞で使う。", synonymDifference: "meat vs beef: beef は牛肉、meat は肉全般。", englishDefinition: "Animal flesh eaten as food.", etymology: "食語彙の中心語。" }],
  // tea (10058)
  [10058, { coreImage: "茶葉でいれる飲み物を指す名詞がコアイメージ。", usage: "不可算名詞で「a cup of tea」。", synonymDifference: "tea vs green tea: 後者は種類を限定。", englishDefinition: "A hot drink made from tea leaves.", etymology: "飲料語彙の基礎語。" }],
  // juice (10059)
  [10059, { coreImage: "果汁・野菜汁の飲料を指す名詞がコアイメージ。", usage: "不可算扱いが基本で種類は可算化する。", synonymDifference: "juice vs soda: juice は果汁飲料、soda は炭酸飲料。", englishDefinition: "Liquid from fruits or vegetables, often as a drink.", etymology: "飲料語彙の基礎語。" }],
  // lunch (10060)
  [10060, { coreImage: "昼の食事を指す名詞がコアイメージ。", usage: "「have lunch」「eat lunch」で頻出。", synonymDifference: "lunch vs dinner: lunch は昼食、dinner は夕食が一般。", englishDefinition: "The meal eaten in the middle of the day.", etymology: "食事時間語彙の基礎語。" }],
  // dinner (10061)
  [10061, { coreImage: "主に夕方以降の食事を指す名詞がコアイメージ。", usage: "「have dinner with ...」でよく使う。", synonymDifference: "dinner vs supper: 地域差があるが dinner の方が一般的。", englishDefinition: "The main meal of the day, usually in the evening.", etymology: "食事時間語彙の基礎語。" }],
  // breakfast (10062)
  [10062, { coreImage: "朝の最初の食事を指す名詞がコアイメージ。", usage: "「eat breakfast」「for breakfast」で使う。", synonymDifference: "breakfast vs brunch: brunch は朝昼兼用。", englishDefinition: "The first meal of the day.", etymology: "break + fast（断食を破る）由来。" }],
  // flower (10063)
  [10063, { coreImage: "植物の花の部分を指す名詞がコアイメージ。", usage: "可算名詞で「a flower」「flowers」。", synonymDifference: "flower vs plant: flower は植物の一部または花そのもの。", englishDefinition: "The colorful part of a plant.", etymology: "自然語彙の基礎語。" }],
  // tree (10064)
  [10064, { coreImage: "幹を持つ木本植物を指す名詞がコアイメージ。", usage: "「climb a tree」「plant a tree」で使う。", synonymDifference: "tree vs forest: forest は木が集まる場所。", englishDefinition: "A tall plant with a trunk and branches.", etymology: "自然語彙の基礎語。" }],
  // mountain (10065)
  [10065, { coreImage: "高い山地形を指す名詞がコアイメージ。", usage: "「climb a mountain」「in the mountains」で使う。", synonymDifference: "mountain vs hill: mountain の方が一般に高い。", englishDefinition: "A very high natural area of land.", etymology: "地理語彙の基礎語。" }],
  // river (10066)
  [10066, { coreImage: "陸地を流れる川を指す名詞がコアイメージ。", usage: "「cross a river」「along the river」で使う。", synonymDifference: "river vs stream: stream はより小さい流れ。", englishDefinition: "A large natural flow of water.", etymology: "地理語彙の基礎語。" }],
  // sea (10067)
  [10067, { coreImage: "海という広い水域を指す名詞がコアイメージ。", usage: "「by the sea」「go to sea」で使う。", synonymDifference: "sea vs ocean: ocean の方が規模が大きい。", englishDefinition: "A large area of salt water.", etymology: "地理語彙の基礎語。" }],
  // sky (10068)
  [10068, { coreImage: "地上から見える空間としての空がコアイメージ。", usage: "通常不可算で「in the sky」。", synonymDifference: "sky vs space: sky は地上から見える空、space は宇宙空間。", englishDefinition: "The space above the earth where clouds are seen.", etymology: "自然語彙の基礎語。" }],
  // sun (10069)
  [10069, { coreImage: "地球を照らす恒星である太陽がコアイメージ。", usage: "「the sun」は定冠詞付きが基本。", synonymDifference: "sun vs star: sun は私たちの恒星、star は恒星一般。", englishDefinition: "The star that gives light and heat to Earth.", etymology: "自然・天体語彙の基礎語。" }],
  // moon (10070)
  [10070, { coreImage: "地球の衛星である月を指す名詞がコアイメージ。", usage: "「the moon」は定冠詞付きが基本。", synonymDifference: "moon vs satellite: satellite は衛星一般。", englishDefinition: "The natural satellite of Earth.", etymology: "自然・天体語彙の基礎語。" }],
  // star (10071)
  [10071, { coreImage: "夜空に見える星という天体を指す名詞がコアイメージ。", usage: "「a star」「the stars in the sky」で使う。", synonymDifference: "star vs sun: sun は私たちの恒星、star は恒星一般。", englishDefinition: "A bright object in the night sky.", etymology: "天体語彙の基礎語。" }],
  // snow (10072)
  [10072, { coreImage: "雪として降る氷の結晶を指す名詞がコアイメージ。", usage: "不可算扱いで「It is snowing.」「some snow」。", synonymDifference: "snow vs rain: snow は氷結晶、rain は液体の雨。", englishDefinition: "Soft white ice crystals falling from the sky.", etymology: "天候語彙の基礎語。" }],
  // wind (10073)
  [10073, { coreImage: "空気の流れとしての風を指す名詞がコアイメージ。", usage: "「strong wind」「the wind is cold」で使う。", synonymDifference: "wind vs breeze: breeze は弱い風。", englishDefinition: "Moving air.", etymology: "天候語彙の基礎語。" }],
  // cloud (10074)
  [10074, { coreImage: "空に浮かぶ雲を指す名詞がコアイメージ。", usage: "可算名詞で「a cloud / clouds」。", synonymDifference: "cloud vs fog: fog は地表近くの霧。", englishDefinition: "A white or gray mass in the sky made of tiny water drops.", etymology: "天候語彙の基礎語。" }],
  // head (10075)
  [10075, { coreImage: "体の上部で脳や顔を含む部位がコアイメージ。", usage: "「my head」「headache」で頻出。", synonymDifference: "head vs face: head は頭部全体、face は顔面。", englishDefinition: "The top part of the body with the brain and face.", etymology: "身体部位語彙の基礎語。" }],
  // eye (10076)
  [10076, { coreImage: "見る機能を担う目という器官がコアイメージ。", usage: "可算で「an eye」「my eyes」。", synonymDifference: "eye vs sight: eye は器官、sight は視力・視覚。", englishDefinition: "The organ used for seeing.", etymology: "身体部位語彙の基礎語。" }],
  // ear (10077)
  [10077, { coreImage: "聞く機能を担う耳という器官がコアイメージ。", usage: "可算で「an ear」「both ears」。", synonymDifference: "ear vs hearing: ear は器官、hearing は聴力。", englishDefinition: "The organ used for hearing.", etymology: "身体部位語彙の基礎語。" }],
  // mouth (10078)
  [10078, { coreImage: "食べる・話すための口の部位がコアイメージ。", usage: "「open your mouth」「mouth of a river」など多義もある。", synonymDifference: "mouth vs lips: mouth は口全体、lips は唇。", englishDefinition: "The opening in the face used for eating and speaking.", etymology: "身体部位語彙の基礎語。" }],
  // nose (10079)
  [10079, { coreImage: "においを感じ呼吸に使う鼻がコアイメージ。", usage: "可算で「a nose」「my nose」。", synonymDifference: "nose vs nostril: nostril は鼻の穴。", englishDefinition: "The part of the face used for smelling and breathing.", etymology: "身体部位語彙の基礎語。" }],
  // hand (10080)
  [10080, { coreImage: "物をつかむ手の部位がコアイメージ。", usage: "「raise your hand」「right hand」で頻出。", synonymDifference: "hand vs arm: hand は手、arm は腕。", englishDefinition: "The part at the end of your arm with fingers.", etymology: "身体部位語彙の基礎語。" }],
  // foot (10081)
  [10081, { coreImage: "立つ・歩くための足先部位がコアイメージ。", usage: "単複変化 foot/feet に注意。", synonymDifference: "foot vs leg: foot は足先、leg は脚全体。", englishDefinition: "The part at the end of your leg used for standing and walking.", etymology: "身体部位語彙の基礎語。" }],
  // hair (10082)
  [10082, { coreImage: "頭などに生える毛を指す名詞がコアイメージ。", usage: "通常不可算扱いで「long hair」。", synonymDifference: "hair vs fur: hair は人や一部動物の毛、fur は動物の体毛。", englishDefinition: "The strands growing from the skin, especially on the head.", etymology: "身体語彙の基礎語。" }],
  // face (10083)
  [10083, { coreImage: "目・鼻・口がある顔面部位がコアイメージ。", usage: "「wash your face」「happy face」で使う。", synonymDifference: "face vs expression: face は部位、expression は表情。", englishDefinition: "The front part of the head where eyes, nose, and mouth are.", etymology: "身体部位語彙の基礎語。" }],
  // leg (10084)
  [10084, { coreImage: "歩行を支える脚全体を指す名詞がコアイメージ。", usage: "可算で「a leg」「my legs」。", synonymDifference: "leg vs foot: leg は脚、foot は足先。", englishDefinition: "A limb used for standing and walking.", etymology: "身体部位語彙の基礎語。" }],
  // finger (10085)
  [10085, { coreImage: "手先の指を指す名詞がコアイメージ。", usage: "可算で「a finger」「ten fingers」。", synonymDifference: "finger vs thumb: thumb は親指で別語。", englishDefinition: "One of the long parts on your hand.", etymology: "身体部位語彙の基礎語。" }],
  // heart (10086)
  [10086, { coreImage: "心臓という器官、または心の比喩を示す語がコアイメージ。", usage: "身体意味と感情意味の両方を初級で押さえる。", synonymDifference: "heart vs mind: heart は感情寄り、mind は思考寄り。", englishDefinition: "The organ that pumps blood; also feelings or spirit.", etymology: "身体・感情の基礎多義語。" }],
  // body (10087)
  [10087, { coreImage: "頭・胴・手足を含む体全体を指す名詞がコアイメージ。", usage: "「my body」「body parts」で使う。", synonymDifference: "body vs shape: body は体そのもの、shape は体形。", englishDefinition: "The whole physical structure of a person or animal.", etymology: "身体語彙の中心語。" }],
  // spring (10088)
  [10088, { coreImage: "一年の季節としての春を指す名詞がコアイメージ。", usage: "季節名で通常冠詞なし「in spring」。", synonymDifference: "spring vs season: spring は季節名、season は区分名。", englishDefinition: "The season between winter and summer.", etymology: "季節語彙の基礎語。" }],
  // summer (10089)
  [10089, { coreImage: "暑い時期の季節としての夏がコアイメージ。", usage: "「in summer」「summer vacation」で頻出。", synonymDifference: "summer vs hot season: summer は正式な季節名。", englishDefinition: "The warmest season of the year.", etymology: "季節語彙の基礎語。" }],
  // autumn (10090)
  [10090, { coreImage: "夏と冬の間の季節としての秋がコアイメージ。", usage: "米語では fall も同義で頻出。", synonymDifference: "autumn vs fall: 意味同じで地域・文体差。", englishDefinition: "The season between summer and winter.", etymology: "季節語彙の基礎語。" }],
  // winter (10091)
  [10091, { coreImage: "寒い時期の季節としての冬がコアイメージ。", usage: "「in winter」「winter break」で使う。", synonymDifference: "winter vs cold weather: winter は季節、cold weather は天候状態。", englishDefinition: "The coldest season of the year.", etymology: "季節語彙の基礎語。" }],
  // season (10092)
  [10092, { coreImage: "一年を区切る季節区分の概念がコアイメージ。", usage: "four seasons で4季を表す。", synonymDifference: "season vs weather: season は時期区分、weather は日々の天候。", englishDefinition: "One of the four parts of the year.", etymology: "時間区分語彙の基礎語。" }],
  // garden (10093)
  [10093, { coreImage: "花や野菜を育てる庭空間がコアイメージ。", usage: "「in the garden」「garden flowers」で使う。", synonymDifference: "garden vs yard: yard は庭全般、garden は栽培要素が強い。", englishDefinition: "A piece of land where flowers or vegetables are grown.", etymology: "生活空間語彙の基礎語。" }],
  // lake (10094)
  [10094, { coreImage: "陸地に囲まれた大きな水域がコアイメージ。", usage: "「by the lake」「a large lake」で使う。", synonymDifference: "lake vs pond: pond は一般に小さい池。", englishDefinition: "A large body of water surrounded by land.", etymology: "地理語彙の基礎語。" }],
  // island (10095)
  [10095, { coreImage: "水に囲まれた陸地としての島がコアイメージ。", usage: "「on an island」「island country」で使う。", synonymDifference: "island vs continent: continent は大陸。", englishDefinition: "A piece of land surrounded by water.", etymology: "地理語彙の基礎語。" }],
  // stone (10096)
  [10096, { coreImage: "石という硬い小さな岩片を指す名詞がコアイメージ。", usage: "可算で「a stone」「stones」。", synonymDifference: "stone vs rock: rock はより大きな岩全般にも使う。", englishDefinition: "A small piece of rock.", etymology: "自然物語彙の基礎語。" }],
  // grass (10097)
  [10097, { coreImage: "地面を覆う草や芝を指す名詞がコアイメージ。", usage: "通常不可算で「on the grass」。", synonymDifference: "grass vs plant: grass は草類、plant は植物一般。", englishDefinition: "Green plants with narrow leaves that cover the ground.", etymology: "自然語彙の基礎語。" }],
  // air (10098)
  [10098, { coreImage: "呼吸する空気という不可視の気体がコアイメージ。", usage: "通常不可算で「fresh air」。", synonymDifference: "air vs wind: air は気体そのもの、wind はその流れ。", englishDefinition: "The mixture of gases that people breathe.", etymology: "自然・科学語彙の基礎語。" }],
  // earth (10099)
  [10099, { coreImage: "地球、または土壌を示す多義名詞がコアイメージ。", usage: "文脈で planet の意味か soil の意味かを判別。", synonymDifference: "earth vs world: earth は地球体、world は世界概念。", englishDefinition: "The planet we live on; also soil.", etymology: "自然語彙の基礎多義語。" }],
  // leaf (10100)
  [10100, { coreImage: "植物の葉を指す名詞がコアイメージ。", usage: "単複 leaf/leaves の変化に注意。", synonymDifference: "leaf vs flower: leaf は葉、flower は花。", englishDefinition: "A flat green part of a plant.", etymology: "植物語彙の基礎語。" }],
  // fox (10101)
  [10101, { coreImage: "キツネという野生動物を指す名詞がコアイメージ。", usage: "可算で「a fox」「foxes」。", synonymDifference: "fox vs wolf: 種が異なるイヌ科動物。", englishDefinition: "A wild animal with red-brown fur and a bushy tail.", etymology: "動物語彙の基礎語。" }],
  // snake (10102)
  [10102, { coreImage: "脚のない爬虫類ヘビを指す名詞がコアイメージ。", usage: "可算で「a snake」「snakes」。", synonymDifference: "snake vs worm: snake は爬虫類、worm は環形動物。", englishDefinition: "A long, legless reptile.", etymology: "動物語彙の基礎語。" }],
  // deer (10103)
  [10103, { coreImage: "鹿という草食動物を指す名詞がコアイメージ。", usage: "単複同形 deer/deer に注意。", synonymDifference: "deer vs reindeer: reindeer はトナカイ種。", englishDefinition: "A hoofed animal with antlers (in males of many species).", etymology: "動物語彙の基礎語。" }],
  // sheep (10104)
  [10104, { coreImage: "羊という家畜動物を指す名詞がコアイメージ。", usage: "単複同形 sheep/sheep に注意。", synonymDifference: "sheep vs goat: 種が異なる家畜動物。", englishDefinition: "A farm animal kept for wool and meat.", etymology: "家畜語彙の基礎語。" }],
  // frog (10105)
  [10105, { coreImage: "水辺に住むカエルを指す名詞がコアイメージ。", usage: "可算で「a frog」「frogs」。", synonymDifference: "frog vs toad: toad は一般に皮膚が乾いたヒキガエル系。", englishDefinition: "A small animal with long back legs that jumps.", etymology: "動物語彙の基礎語。" }],
  // insect (10106)
  [10106, { coreImage: "昆虫という分類群を指す名詞がコアイメージ。", usage: "可算で「an insect」「insects」。", synonymDifference: "insect vs bug: bug は口語で虫全般を指すことが多い。", englishDefinition: "A small animal with six legs, such as an ant.", etymology: "生物分類語彙の基礎語。" }],
  // pet (10107)
  [10107, { coreImage: "人が飼う愛玩動物を指す名詞がコアイメージ。", usage: "「have a pet」「pet dog」で頻出。", synonymDifference: "pet vs animal: animal は動物一般、pet は飼育目的限定。", englishDefinition: "An animal kept at home for companionship.", etymology: "生活語彙の基礎語。" }],
  // sugar (10108)
  [10108, { coreImage: "甘味料としての砂糖を指す名詞がコアイメージ。", usage: "通常不可算で「some sugar」。", synonymDifference: "sugar vs salt: sugar は甘味、salt は塩味。", englishDefinition: "A sweet substance used in food and drink.", etymology: "調味料語彙の基礎語。" }],
  // salt (10109)
  [10109, { coreImage: "塩味をつける塩を指す名詞がコアイメージ。", usage: "通常不可算で「add salt」。", synonymDifference: "salt vs sugar: salt は塩味、sugar は甘味。", englishDefinition: "A white substance used to season food.", etymology: "調味料語彙の基礎語。" }],
  // soup (10110)
  [10110, { coreImage: "液体中心の料理スープを指す名詞がコアイメージ。", usage: "不可算扱いが多く「some soup」。", synonymDifference: "soup vs stew: stew は具材がより多く煮込まれる料理。", englishDefinition: "A liquid food made by cooking ingredients in water.", etymology: "食語彙の基礎語。" }],
  // salad (10111)
  [10111, { coreImage: "生野菜などを混ぜた料理としてのサラダがコアイメージ。", usage: "可算で「a salad」「salad dressing」で使う。", synonymDifference: "salad vs vegetable: salad は料理、vegetable は食材分類。", englishDefinition: "A dish of mixed raw vegetables, often with dressing.", etymology: "食事語彙の基礎語。" }],
  // chocolate (10112)
  [10112, { coreImage: "カカオ由来の甘い食品を指す名詞がコアイメージ。", usage: "不可算・可算の両用がある（some chocolate / a chocolate）。", synonymDifference: "chocolate vs candy: candy は甘い菓子全般。", englishDefinition: "A sweet food made from cacao.", etymology: "お菓子語彙の基礎語。" }],
  // cookie (10114)
  [10114, { coreImage: "小型の焼き菓子クッキーを指す名詞がコアイメージ。", usage: "可算で「a cookie」「cookies」。", synonymDifference: "cookie vs biscuit: 地域差があり英米で語感が異なる。", englishDefinition: "A small sweet baked biscuit.", etymology: "食語彙の基礎語。" }],
  // sandwich (10115)
  [10115, { coreImage: "パンで具をはさんだ料理がコアイメージ。", usage: "可算で「a sandwich」「sandwiches」。", synonymDifference: "sandwich vs burger: burger は挟む具が主にパティ。", englishDefinition: "Food made by putting filling between slices of bread.", etymology: "人名由来の料理名。" }],
  // pizza (10116)
  [10116, { coreImage: "生地に具をのせて焼く料理ピザがコアイメージ。", usage: "不可算・可算の両方で使われる。", synonymDifference: "pizza vs pie: pie は別系統の料理。", englishDefinition: "A flat baked dish with cheese and toppings.", etymology: "イタリア語由来。" }],
  // potato (10117)
  [10117, { coreImage: "じゃがいもという野菜を指す名詞がコアイメージ。", usage: "可算で「a potato」「potatoes」。", synonymDifference: "potato vs sweet potato: 種類が異なる。", englishDefinition: "A starchy vegetable that grows underground.", etymology: "食材語彙の基礎語。" }],
  // tomato (10118)
  [10118, { coreImage: "トマトという食材を指す名詞がコアイメージ。", usage: "可算で「a tomato」「tomatoes」。", synonymDifference: "tomato vs ketchup: ketchup はトマト加工調味料。", englishDefinition: "A red round fruit used as a vegetable in cooking.", etymology: "食材語彙の基礎語。" }],
  // lemon (10119)
  [10119, { coreImage: "酸味の強い黄色い柑橘を指す名詞がコアイメージ。", usage: "可算で「a lemon」「lemons」。", synonymDifference: "lemon vs lime: 色・風味が異なる柑橘。", englishDefinition: "A sour yellow citrus fruit.", etymology: "果物語彙の基礎語。" }],
  // grape (10120)
  [10120, { coreImage: "房状になる小さな果実ブドウを指す名詞がコアイメージ。", usage: "可算で「a grape」「grapes」。", synonymDifference: "grape vs raisin: raisin は干しぶどう。", englishDefinition: "A small juicy fruit that grows in bunches.", etymology: "果物語彙の基礎語。" }],
  // strawberry (10121)
  [10121, { coreImage: "赤く小さい果実いちごを指す名詞がコアイメージ。", usage: "可算で「a strawberry」「strawberries」。", synonymDifference: "strawberry vs berry: berry は果実分類の総称。", englishDefinition: "A small red sweet fruit with seeds on the outside.", etymology: "果物語彙の基礎語。" }],
  // cherry (10122)
  [10122, { coreImage: "小さく丸い果実さくらんぼを指す名詞がコアイメージ。", usage: "可算で「a cherry」「cherries」。", synonymDifference: "cherry vs berry: cherry は核果で分類が異なる。", englishDefinition: "A small round red fruit with a stone.", etymology: "果物語彙の基礎語。" }],
  // peach (10123)
  [10123, { coreImage: "柔らかい果肉を持つ桃を指す名詞がコアイメージ。", usage: "可算で「a peach」「peaches」。", synonymDifference: "peach vs apricot: 種・大きさ・風味が異なる。", englishDefinition: "A soft round fruit with yellow or pink flesh.", etymology: "果物語彙の基礎語。" }],
  // melon (10124)
  [10124, { coreImage: "大きく甘い果実メロンを指す名詞がコアイメージ。", usage: "可算で「a melon」。", synonymDifference: "melon vs watermelon: watermelon はスイカ種。", englishDefinition: "A large sweet fruit with soft flesh.", etymology: "果物語彙の基礎語。" }],
  // onion (10125)
  [10125, { coreImage: "層状の球根野菜たまねぎを指す名詞がコアイメージ。", usage: "可算で「an onion」「onions」。", synonymDifference: "onion vs garlic: 種類と風味が異なる。", englishDefinition: "A round vegetable with layers and a strong smell.", etymology: "食材語彙の基礎語。" }],
  // carrot (10126)
  [10126, { coreImage: "細長い根菜にんじんを指す名詞がコアイメージ。", usage: "可算で「a carrot」「carrots」。", synonymDifference: "carrot vs radish: どちらも根菜だが種類が異なる。", englishDefinition: "An orange root vegetable.", etymology: "食材語彙の基礎語。" }],
  // corn (10127)
  [10127, { coreImage: "とうもろこし、または穀物一般を示す語がコアイメージ。", usage: "米語では主にとうもろこしの意味で使う。", synonymDifference: "corn vs maize: maize はより学術・国際的表現。", englishDefinition: "A yellow grain crop, especially maize.", etymology: "穀物語彙の基礎語。" }],
  // butter (10128)
  [10128, { coreImage: "乳脂肪由来のバターを指す名詞がコアイメージ。", usage: "不可算で「some butter」「butter bread」。", synonymDifference: "butter vs margarine: 原料と風味が異なる。", englishDefinition: "A soft yellow food made from cream.", etymology: "乳製品語彙の基礎語。" }],
  // cheese (10129)
  [10129, { coreImage: "発酵乳製品チーズを指す名詞がコアイメージ。", usage: "不可算が基本だが種類では可算化。", synonymDifference: "cheese vs milk: cheese は加工品、milk は原料。", englishDefinition: "A food made from milk, usually solid.", etymology: "乳製品語彙の基礎語。" }],
  // noodle (10130)
  [10130, { coreImage: "細長い麺状食品を指す名詞がコアイメージ。", usage: "通常複数で noodles がよく使われる。", synonymDifference: "noodle vs pasta: pasta はイタリア系麺類の総称。", englishDefinition: "A long thin strip of dough used as food.", etymology: "食語彙の基礎語。" }],
  // forest (10131)
  [10131, { coreImage: "木が密集して生える広い森を指す名詞がコアイメージ。", usage: "「in the forest」「a deep forest」で使う。", synonymDifference: "forest vs woods: woods はより小規模な森を指すことが多い。", englishDefinition: "A large area covered with trees.", etymology: "自然地形語彙の基礎語。" }],
  // beach (10132)
  [10132, { coreImage: "海や湖の砂浜・浜辺を指す名詞がコアイメージ。", usage: "「go to the beach」が定型。", synonymDifference: "beach vs coast: coast は海岸線全体、beach は浜辺部分。", englishDefinition: "A sandy or pebbly shore by the sea.", etymology: "地理・レジャー語彙の基礎語。" }],
  // field (10133)
  [10133, { coreImage: "開けた土地としての野原・畑を示す名詞がコアイメージ。", usage: "文脈で意味が変わる多義名詞。", synonymDifference: "field vs farm: field は土地、farm は農場全体。", englishDefinition: "An open area of land, often used for farming.", etymology: "地理・農業語彙の基礎多義語。" }],
  // farm (10134)
  [10134, { coreImage: "作物栽培や家畜飼育を行う農場がコアイメージ。", usage: "「on a farm」「farm animals」で使う。", synonymDifference: "farm vs field: farm は施設・経営単位、field は区画土地。", englishDefinition: "Land and buildings used for growing crops and raising animals.", etymology: "農業語彙の基礎語。" }],
  // pond (10135)
  [10135, { coreImage: "湖より小さい池を指す名詞がコアイメージ。", usage: "「in the pond」「a small pond」で使う。", synonymDifference: "pond vs lake: pond の方が一般に小さい。", englishDefinition: "A small area of still water.", etymology: "地理語彙の基礎語。" }],
  // pen (10136)
  [10136, { coreImage: "インクで書く筆記具ペンがコアイメージ。", usage: "可算で「a pen」「pen case」。", synonymDifference: "pen vs pencil: pen はインク、pencil は鉛筆芯。", englishDefinition: "A writing tool that uses ink.", etymology: "学用品語彙の基礎語。" }],
  // pencil (10137)
  [10137, { coreImage: "鉛筆芯で書く筆記具がコアイメージ。", usage: "可算で「a pencil」「colored pencils」。", synonymDifference: "pencil vs pen: pencil は消しやすく修正しやすい。", englishDefinition: "A writing tool with graphite inside.", etymology: "学用品語彙の基礎語。" }],
  // eraser (10138)
  [10138, { coreImage: "鉛筆の筆跡を消す消しゴムがコアイメージ。", usage: "「an eraser」「rubber（英）」の地域差もある。", synonymDifference: "eraser vs correction pen: 前者は鉛筆、後者はインク修正向け。", englishDefinition: "An object used to remove pencil marks.", etymology: "erase + -er の語形成。" }],
  // ruler (10139)
  [10139, { coreImage: "長さを測る・線を引く定規がコアイメージ。", usage: "可算で「a ruler」。", synonymDifference: "ruler vs scale: scale は目盛り概念全般にも使う。", englishDefinition: "A straight tool marked with units for measuring.", etymology: "学用品語彙の基礎語。" }],
  // desk (10140)
  [10140, { coreImage: "勉強や仕事で使う机を指す名詞がコアイメージ。", usage: "「at my desk」「school desk」で使う。", synonymDifference: "desk vs table: desk は作業用、table は汎用台。", englishDefinition: "A piece of furniture for writing or working.", etymology: "学校・生活語彙の基礎語。" }],
  // chair (10141)
  [10141, { coreImage: "一人用の椅子を指す名詞がコアイメージ。", usage: "可算で「a chair」「chairs」。", synonymDifference: "chair vs seat: seat は座る場所一般。", englishDefinition: "A seat for one person, usually with a back.", etymology: "家具語彙の基礎語。" }],
  // classroom (10142)
  [10142, { coreImage: "授業を行う教室空間を指す名詞がコアイメージ。", usage: "「in the classroom」「classroom rules」で使う。", synonymDifference: "classroom vs class: classroom は場所、class は授業/集団。", englishDefinition: "A room where students are taught.", etymology: "class + room の合成語。" }],
  // blackboard (10143)
  [10143, { coreImage: "チョークで書く黒板を指す名詞がコアイメージ。", usage: "近年は whiteboard との対比で使う。", synonymDifference: "blackboard vs whiteboard: 表面素材と使用ペンが異なる。", englishDefinition: "A dark board used for writing with chalk.", etymology: "school 用具語彙の基礎語。" }],
  // notebook (10144)
  [10144, { coreImage: "書き込み用のノート冊子がコアイメージ。", usage: "可算で「a notebook」「notebooks」。", synonymDifference: "notebook vs textbook: notebook は記録用、textbook は教材。", englishDefinition: "A book of blank pages for writing notes.", etymology: "note + book の合成語。" }],
  // textbook (10145)
  [10145, { coreImage: "授業用の教科書を指す名詞がコアイメージ。", usage: "「open your textbook」が教室定型。", synonymDifference: "textbook vs book: textbook は学習用に特化。", englishDefinition: "A book used for study in a class.", etymology: "text + book の合成語。" }],
  // bag (10146)
  [10146, { coreImage: "物を入れて運ぶ袋・かばんの総称がコアイメージ。", usage: "「school bag」「shopping bag」など用途で修飾。", synonymDifference: "bag vs backpack: backpack は背負うかばん。", englishDefinition: "A container used to carry things.", etymology: "生活語彙の基礎語。" }],
  // map (10147)
  [10147, { coreImage: "場所や地形を図示した地図がコアイメージ。", usage: "「look at a map」「map of Japan」で使う。", synonymDifference: "map vs globe: globe は地球儀の立体模型。", englishDefinition: "A drawing showing where places are.", etymology: "地理情報語彙の基礎語。" }],
  // picture (10148)
  [10148, { coreImage: "絵や写真として視覚情報を示す名詞がコアイメージ。", usage: "「take a picture」「picture book」で頻出。", synonymDifference: "picture vs photo: photo は写真に限定。", englishDefinition: "An image such as a drawing or photograph.", etymology: "視覚表現語彙の基礎語。" }],
  // paper (10149)
  [10149, { coreImage: "紙という素材、または書類を示す名詞がコアイメージ。", usage: "通常不可算だが論文などで可算用法もある。", synonymDifference: "paper vs notebook: paper は素材、notebook は冊子。", englishDefinition: "Material used for writing or printing.", etymology: "学習・生活語彙の基礎多義語。" }],
  // test (10150)
  [10150, { coreImage: "知識や能力を測る試験を指す名詞がコアイメージ。", usage: "「take a test」「math test」で使う。", synonymDifference: "test vs exam: exam の方がやや公式・大規模なことが多い。", englishDefinition: "An assessment to measure knowledge or ability.", etymology: "学校語彙の基礎語。" }],
  // lesson (10151)
  [10151, { coreImage: "授業1回分や学習単位を指す名詞がコアイメージ。", usage: "「today's lesson」「English lesson」で使う。", synonymDifference: "lesson vs class: lesson は内容単位、class は授業や集団。", englishDefinition: "A period of learning or teaching.", etymology: "教育語彙の基礎語。" }],
  // class (10152)
  [10152, { coreImage: "授業、または学級集団の両義を持つ語がコアイメージ。", usage: "文脈で「授業」か「クラス」を判別する。", synonymDifference: "class vs classroom: class は活動・集団、classroom は場所。", englishDefinition: "A lesson period or a group of students.", etymology: "学校語彙の高頻度多義語。" }],
  // student (10153)
  [10153, { coreImage: "学ぶ立場の人を示す名詞がコアイメージ。", usage: "可算で「a student」「students」。", synonymDifference: "student vs pupil: pupil は主に小中等教育で使われることがある。", englishDefinition: "A person who is learning at school or college.", etymology: "study 由来の学習者語彙。" }],
  // library (10154)
  [10154, { coreImage: "本を借りたり読んだりする図書館を指す名詞がコアイメージ。", usage: "「go to the library」「library card」で使う。", synonymDifference: "library vs bookstore: library は貸出/閲覧、bookstore は販売。", englishDefinition: "A place where books are kept for people to read or borrow.", etymology: "学校・公共施設語彙の基礎語。" }],
  // gym (10155)
  [10155, { coreImage: "運動する体育館・ジムを示す名詞がコアイメージ。", usage: "学校文脈では gymnasium の短縮として使う。", synonymDifference: "gym vs stadium: gym は屋内運動施設、stadium は大規模競技場。", englishDefinition: "A place for exercise or sports.", etymology: "gymnasium の短縮語。" }],
  // family (10156)
  [10156, { coreImage: "家族というまとまりの関係単位がコアイメージ。", usage: "集合的に不可算的扱いもあるが通常は可算。", synonymDifference: "family vs relative: relative は親族個人を指す。", englishDefinition: "A group of people related by blood or marriage.", etymology: "人間関係語彙の中心語。" }],
  // parent (10157)
  [10157, { coreImage: "親という立場を示す名詞がコアイメージ。", usage: "単数 parent、複数 parents を使い分ける。", synonymDifference: "parent vs father/mother: parent は父母を包括。", englishDefinition: "A father or mother.", etymology: "家族語彙の基礎語。" }],
  // grandfather (10158)
  [10158, { coreImage: "祖父という家族関係を示す名詞がコアイメージ。", usage: "「my grandfather」で使う。", synonymDifference: "grandfather vs grandparent: grandparent は祖父母を包括。", englishDefinition: "The father of your father or mother.", etymology: "grand + father の合成語。" }],
  // grandmother (10159)
  [10159, { coreImage: "祖母という家族関係を示す名詞がコアイメージ。", usage: "「my grandmother」で使う。", synonymDifference: "grandmother vs grandparent: grandparent は祖父母を包括。", englishDefinition: "The mother of your father or mother.", etymology: "grand + mother の合成語。" }],
  // uncle (10160)
  [10160, { coreImage: "おじ（親の兄弟・配偶者）を示す家族名詞がコアイメージ。", usage: "「my uncle」「an uncle of mine」で使う。", synonymDifference: "uncle vs aunt: uncle は男性、aunt は女性。", englishDefinition: "The brother of your mother or father, or the husband of your aunt.", etymology: "家族関係語彙の基礎語。" }],
  // aunt (10161)
  [10161, { coreImage: "おば（親の姉妹・配偶者）を示す家族名詞がコアイメージ。", usage: "「my aunt」「an aunt of mine」で使う。", synonymDifference: "aunt vs uncle: aunt は女性、uncle は男性。", englishDefinition: "The sister of your mother or father, or the wife of your uncle.", etymology: "家族関係語彙の基礎語。" }],
  // cousin (10162)
  [10162, { coreImage: "いとこ関係を示す親族名詞がコアイメージ。", usage: "英語では性別区別なく cousin を使う。", synonymDifference: "cousin vs sibling: cousin はいとこ、sibling は兄弟姉妹。", englishDefinition: "A child of your aunt or uncle.", etymology: "親族語彙の基礎語。" }],
  // baby (10163)
  [10163, { coreImage: "乳幼児の赤ちゃんを指す名詞がコアイメージ。", usage: "可算で「a baby」「babies」。", synonymDifference: "baby vs child: baby はより低年齢。", englishDefinition: "A very young child.", etymology: "人物語彙の基礎語。" }],
  // boy (10164)
  [10164, { coreImage: "男の子を指す人物名詞がコアイメージ。", usage: "可算で「a boy」「boys」。", synonymDifference: "boy vs man: boy は子ども、man は成人男性。", englishDefinition: "A male child.", etymology: "人物語彙の基礎語。" }],
  // girl (10165)
  [10165, { coreImage: "女の子を指す人物名詞がコアイメージ。", usage: "可算で「a girl」「girls」。", synonymDifference: "girl vs woman: girl は子ども、woman は成人女性。", englishDefinition: "A female child.", etymology: "人物語彙の基礎語。" }],
  // man (10166)
  [10166, { coreImage: "成人男性を指す人物名詞がコアイメージ。", usage: "可算で「a man」「men」。複数形に注意。", synonymDifference: "man vs boy: man は成人、boy は子ども。", englishDefinition: "An adult male person.", etymology: "人物語彙の高頻度基礎語。" }],
  // woman (10167)
  [10167, { coreImage: "成人女性を指す人物名詞がコアイメージ。", usage: "可算で「a woman」「women」。複数形発音に注意。", synonymDifference: "woman vs girl: woman は成人、girl は子ども。", englishDefinition: "An adult female person.", etymology: "人物語彙の高頻度基礎語。" }],
  // child (10168)
  [10168, { coreImage: "子ども一般を示す名詞がコアイメージ。", usage: "単複変化 child/children に注意。", synonymDifference: "child vs kid: kid はより口語的。", englishDefinition: "A young person; a son or daughter.", etymology: "家族・人物語彙の基礎語。" }],
  // people (10169)
  [10169, { coreImage: "人々の集合を示す名詞がコアイメージ。", usage: "複数扱いで「many people」。", synonymDifference: "people vs person: person は単数、people は複数。", englishDefinition: "Human beings in general or in groups.", etymology: "最重要の人物集合語彙。" }],
  // room (10170)
  [10170, { coreImage: "建物内の一つの部屋空間がコアイメージ。", usage: "可算で「a room」「my room」。", synonymDifference: "room vs space: room は部屋、space は空間一般。", englishDefinition: "A part of a building separated by walls.", etymology: "住居語彙の基礎語。" }],
  // kitchen (10171)
  [10171, { coreImage: "料理をする台所空間がコアイメージ。", usage: "「in the kitchen」「kitchen table」で使う。", synonymDifference: "kitchen vs dining room: kitchen は調理、dining room は食事。", englishDefinition: "The room where food is prepared.", etymology: "住居語彙の基礎語。" }],
  // bathroom (10172)
  [10172, { coreImage: "入浴・洗面・トイレ機能を持つ部屋がコアイメージ。", usage: "米英で含意差があるが初級では「お風呂場/トイレ」で扱う。", synonymDifference: "bathroom vs toilet/restroom: 地域・場面で使い分ける。", englishDefinition: "A room with a bath/shower and toilet facilities.", etymology: "住居語彙の基礎語。" }],
  // bed (10173)
  [10173, { coreImage: "寝るための寝具付き家具がコアイメージ。", usage: "「go to bed」「on the bed」で頻出。", synonymDifference: "bed vs sofa: bed は就寝用、sofa は座る家具。", englishDefinition: "A piece of furniture for sleeping.", etymology: "生活語彙の基礎語。" }],
  // window (10174)
  [10174, { coreImage: "光や空気を通す窓を指す名詞がコアイメージ。", usage: "「open the window」が定型。", synonymDifference: "window vs door: window は採光・換気、door は出入り。", englishDefinition: "An opening in a wall fitted with glass.", etymology: "住居語彙の基礎語。" }],
  // door (10175)
  [10175, { coreImage: "出入りのための扉を示す名詞がコアイメージ。", usage: "「close the door」「front door」で使う。", synonymDifference: "door vs gate: door は建物扉、gate は門。", englishDefinition: "A movable barrier used to open and close an entrance.", etymology: "住居語彙の基礎語。" }],
  // table (10176)
  [10176, { coreImage: "物を置くための台・机を示す家具名詞がコアイメージ。", usage: "「on the table」「dining table」で使う。", synonymDifference: "table vs desk: table は汎用、desk は作業向け。", englishDefinition: "A piece of furniture with a flat top and legs.", etymology: "家具語彙の基礎語。" }],
  // floor (10177)
  [10177, { coreImage: "床面、または建物の階を示す多義名詞がコアイメージ。", usage: "「on the floor」「second floor」で使う。", synonymDifference: "floor vs ground: floor は建物内床、ground は地面。", englishDefinition: "The lower surface of a room; also a level of a building.", etymology: "住居語彙の基礎多義語。" }],
  // wall (10178)
  [10178, { coreImage: "部屋や建物を囲う壁面がコアイメージ。", usage: "「on the wall」「wall clock」で使う。", synonymDifference: "wall vs fence: wall は建物/区画の壁、fence は柵。", englishDefinition: "A vertical structure forming the side of a room or building.", etymology: "住居語彙の基礎語。" }],
  // roof (10179)
  [10179, { coreImage: "建物上部を覆う屋根がコアイメージ。", usage: "「on the roof」「roof of the house」で使う。", synonymDifference: "roof vs ceiling: roof は外側上部、ceiling は室内天井。", englishDefinition: "The top covering of a building.", etymology: "建物部位語彙の基礎語。" }],
  // key (10180)
  [10180, { coreImage: "鍵を開閉する道具としてのキーがコアイメージ。", usage: "「a house key」「lose my key」で使う。", synonymDifference: "key vs lock: key は開ける側、lock は閉める機構。", englishDefinition: "A small metal object used to open a lock.", etymology: "生活語彙の基礎語。" }],
  // clock (10181)
  [10181, { coreImage: "置き時計・壁掛け時計を示す名詞がコアイメージ。", usage: "「wall clock」「the clock on the desk」で使う。", synonymDifference: "clock vs watch: clock は据え置き、watch は腕時計。", englishDefinition: "A device that shows the time, usually fixed in a place.", etymology: "時間語彙の基礎語。" }],
  // watch (10182)
  [10182, { coreImage: "身につける時計（腕時計）を示す名詞がコアイメージ。", usage: "名詞「a watch」と動詞「watch（見る）」の区別に注意。", synonymDifference: "watch vs clock: watch は携帯、clock は据え置き。", englishDefinition: "A small timepiece worn on the wrist.", etymology: "多義語として初級で重要。" }],
  // telephone (10183)
  [10183, { coreImage: "通話のための電話機を示す名詞がコアイメージ。", usage: "現代では phone がより口語的に頻用。", synonymDifference: "telephone vs phone: phone は短縮で口語的。", englishDefinition: "A device used for voice communication over distance.", etymology: "tele-（遠く）+ phone（音）由来。" }],
  // computer (10184)
  [10184, { coreImage: "計算・処理・情報利用を行うコンピュータ機器がコアイメージ。", usage: "「use a computer」「computer room」で使う。", synonymDifference: "computer vs laptop: laptop は携帯型の一種。", englishDefinition: "An electronic machine for processing information.", etymology: "現代生活語彙の基礎語。" }],
  // camera (10185)
  [10185, { coreImage: "写真や映像を撮る機器を示す名詞がコアイメージ。", usage: "「take a picture with a camera」で使う。", synonymDifference: "camera vs phone camera: 後者は機能内蔵型。", englishDefinition: "A device used to take photographs.", etymology: "生活・技術語彙の基礎語。" }],
  // shirt (10186)
  [10186, { coreImage: "上半身に着るシャツ衣類を指す名詞がコアイメージ。", usage: "可算で「a shirt」「white shirt」。", synonymDifference: "shirt vs T-shirt: T-shirt は形状が限定。", englishDefinition: "A piece of clothing worn on the upper body.", etymology: "衣類語彙の基礎語。" }],
  // hat (10187)
  [10187, { coreImage: "頭にかぶる帽子を示す名詞がコアイメージ。", usage: "可算で「a hat」「wear a hat」。", synonymDifference: "hat vs cap: cap はつば付きの軽装帽。", englishDefinition: "A covering worn on the head.", etymology: "衣類語彙の基礎語。" }],
  // shoe (10188)
  [10188, { coreImage: "足に履く靴を示す名詞がコアイメージ。", usage: "通常複数で「shoes」を使うことが多い。", synonymDifference: "shoe vs boot: boot は足首以上まで覆う靴。", englishDefinition: "A covering for the foot, usually with a sole.", etymology: "衣類語彙の基礎語。" }],
  // umbrella (10189)
  [10189, { coreImage: "雨を防ぐ傘を示す名詞がコアイメージ。", usage: "「take an umbrella」「open your umbrella」で使う。", synonymDifference: "umbrella vs parasol: parasol は日傘。", englishDefinition: "A device used for protection from rain.", etymology: "生活語彙の基礎語。" }],
  // coat (10190)
  [10190, { coreImage: "上着として外側に着るコートがコアイメージ。", usage: "可算で「a coat」「winter coat」。", synonymDifference: "coat vs jacket: coat の方が長く厚手なことが多い。", englishDefinition: "An outer piece of clothing worn over other clothes.", etymology: "衣類語彙の基礎語。" }],
  // glasses (10191)
  [10191, { coreImage: "視力補正のために目にかける眼鏡がコアイメージ。", usage: "通常複数形で glasses を使う。", synonymDifference: "glasses vs sunglasses: 後者は日差し対策。", englishDefinition: "Lenses in a frame worn to help vision.", etymology: "日常生活語彙の基礎語。" }],
  // park (10192)
  [10192, { coreImage: "人が休んだり遊んだりする公園空間がコアイメージ。", usage: "「go to the park」で高頻度。", synonymDifference: "park vs garden: park は公共空間、garden は庭。", englishDefinition: "A public green area for recreation.", etymology: "場所語彙の基礎語。" }],
  // hospital (10193)
  [10193, { coreImage: "病気やけがの治療を行う病院施設がコアイメージ。", usage: "「go to the hospital」「in hospital」で使う。", synonymDifference: "hospital vs clinic: clinic は一般に小規模。", englishDefinition: "A place where sick or injured people are treated.", etymology: "公共施設語彙の基礎語。" }],
  // store (10194)
  [10194, { coreImage: "物を売る店を示す名詞がコアイメージ。", usage: "米語で shop より一般的に使われる。", synonymDifference: "store vs shop: 意味は近いが地域・語感差がある。", englishDefinition: "A place where goods are sold.", etymology: "買い物語彙の基礎語。" }],
  // restaurant (10195)
  [10195, { coreImage: "外食するための飲食店を指す名詞がコアイメージ。", usage: "「eat at a restaurant」で使う。", synonymDifference: "restaurant vs cafe: cafe は軽食・喫茶中心のことが多い。", englishDefinition: "A place where meals are cooked and served.", etymology: "外食語彙の基礎語。" }],
  // station (10196)
  [10196, { coreImage: "電車などが発着する駅を示す名詞がコアイメージ。", usage: "「at the station」「train station」で使う。", synonymDifference: "station vs stop: stop は停留所で規模が小さいことが多い。", englishDefinition: "A place where trains or buses arrive and leave.", etymology: "交通語彙の基礎語。" }],
  // city (10197)
  [10197, { coreImage: "人口が多く機能が集中した都市を示す名詞がコアイメージ。", usage: "「big city」「city life」で使う。", synonymDifference: "city vs town: city の方が一般に規模が大きい。", englishDefinition: "A large important town.", etymology: "地理語彙の基礎語。" }],
  // town (10198)
  [10198, { coreImage: "都市より小規模な町を示す名詞がコアイメージ。", usage: "「my town」「town center」で使う。", synonymDifference: "town vs village: village はさらに小規模な集落。", englishDefinition: "A place where people live, smaller than a city.", etymology: "地理語彙の基礎語。" }],
  // country (10199)
  [10199, { coreImage: "国家、または都市部以外の田舎を示す多義名詞がコアイメージ。", usage: "文脈で「国」か「田舎」を判別する。", synonymDifference: "country vs nation: nation は民族・国家概念寄り。", englishDefinition: "A nation; also rural area outside cities.", etymology: "地理・社会語彙の基礎多義語。" }],
  // world (10200)
  [10200, { coreImage: "地球全体や世界という広域概念がコアイメージ。", usage: "「around the world」「the world is ...」で使う。", synonymDifference: "world vs earth: world は社会・世界全体、earth は地球体。", englishDefinition: "The earth and all people and places on it.", etymology: "高頻度の基礎概念語。" }],
  // road (10201)
  [10201, { coreImage: "車や人が通る道路を示す名詞がコアイメージ。", usage: "「on the road」「main road」で使う。", synonymDifference: "road vs street: street は町中の通りの含意が強い。", englishDefinition: "A way for vehicles and people to travel.", etymology: "交通語彙の基礎語。" }],
  // street (10202)
  [10202, { coreImage: "建物が並ぶ通り・街路を示す名詞がコアイメージ。", usage: "「across the street」「street name」で使う。", synonymDifference: "street vs road: street は市街地、road は広域道路にも使う。", englishDefinition: "A public road in a town or city.", etymology: "交通・都市語彙の基礎語。" }],
  // bridge (10203)
  [10203, { coreImage: "川や谷を渡るための橋を示す名詞がコアイメージ。", usage: "「cross a bridge」「bridge over ...」で使う。", synonymDifference: "bridge vs tunnel: bridge は上を渡る、tunnel は下を通る。", englishDefinition: "A structure built over water or a gap for crossing.", etymology: "地理・交通語彙の基礎語。" }],
  // church (10204)
  [10204, { coreImage: "キリスト教の礼拝を行う教会施設がコアイメージ。", usage: "「go to church」で施設・活動の両義を持つ。", synonymDifference: "church vs temple: temple は宗教圏で別施設を指す。", englishDefinition: "A building used for Christian worship.", etymology: "施設語彙の基礎語。" }],
  // museum (10205)
  [10205, { coreImage: "美術品・資料を展示する博物館施設がコアイメージ。", usage: "「visit a museum」で頻出。", synonymDifference: "museum vs gallery: gallery は美術展示中心のことが多い。", englishDefinition: "A place where historical, scientific, or art objects are shown.", etymology: "公共施設語彙の基礎語。" }],
  // theater (10206)
  [10206, { coreImage: "演劇・映画を鑑賞する劇場施設がコアイメージ。", usage: "米語 theater / 英語 theatre の綴り差がある。", synonymDifference: "theater vs cinema: cinema は映画館意味が中心。", englishDefinition: "A place where plays or films are shown.", etymology: "文化施設語彙の基礎語。" }],
  // pool (10207)
  [10207, { coreImage: "泳ぐためのプールを示す名詞がコアイメージ。", usage: "「swim in the pool」が定型。", synonymDifference: "pool vs pond: pool は人工水槽、pond は自然の池。", englishDefinition: "A man-made area of water for swimming.", etymology: "施設語彙の基礎語。" }],
  // bus (10208)
  [10208, { coreImage: "複数人を運ぶバス交通手段がコアイメージ。", usage: "「take a bus」「by bus」で使う。", synonymDifference: "bus vs coach: coach は長距離バス文脈で使われる。", englishDefinition: "A large road vehicle for many passengers.", etymology: "交通語彙の基礎語。" }],
  // train (10209)
  [10209, { coreImage: "線路上を走る列車を示す名詞がコアイメージ。", usage: "「take the train」「train station」で使う。", synonymDifference: "train vs subway: subway は地下鉄を指す。", englishDefinition: "A series of connected railway vehicles.", etymology: "交通語彙の基礎語。" }],
  // bike (10210)
  [10210, { coreImage: "自転車を示す口語的名詞がコアイメージ。", usage: "bicycle の短縮語として日常で高頻度。", synonymDifference: "bike vs bicycle: 意味は同じで bike が口語的。", englishDefinition: "A two-wheeled vehicle you ride by pedaling.", etymology: "交通語彙の基礎語。" }],
  // car (10211)
  [10211, { coreImage: "自動車を示す基本名詞がコアイメージ。", usage: "「by car」「drive a car」で頻出。", synonymDifference: "car vs truck: truck は貨物車。", englishDefinition: "A road vehicle with an engine for a few passengers.", etymology: "交通語彙の最重要基礎語。" }],
  // plane (10212)
  [10212, { coreImage: "空を飛ぶ飛行機を示す名詞がコアイメージ。", usage: "airplane の短縮として口語で頻出。", synonymDifference: "plane vs helicopter: 飛行方式が異なる。", englishDefinition: "An aircraft with wings and engines.", etymology: "交通語彙の基礎語。" }],
  // ship (10213)
  [10213, { coreImage: "海を航行する大型船を示す名詞がコアイメージ。", usage: "「by ship」「a large ship」で使う。", synonymDifference: "ship vs boat: ship の方が一般に大型。", englishDefinition: "A large boat used for travel or transport on water.", etymology: "交通語彙の基礎語。" }],
  // ticket (10214)
  [10214, { coreImage: "乗車・入場などの権利を示す券がコアイメージ。", usage: "「buy a ticket」「train ticket」で使う。", synonymDifference: "ticket vs pass: pass は一定期間有効の券を指すことが多い。", englishDefinition: "A printed or digital pass for travel or entry.", etymology: "移動・イベント語彙の基礎語。" }],
  // box (10215)
  [10215, { coreImage: "物を入れる四角い箱を示す名詞がコアイメージ。", usage: "可算で「a box」「boxes」。", synonymDifference: "box vs bag: box は硬い容器、bag は柔らかい袋。", englishDefinition: "A container with flat sides, usually square or rectangular.", etymology: "日用品語彙の基礎語。" }],
  // cup (10216)
  [10216, { coreImage: "飲み物を入れるカップ容器がコアイメージ。", usage: "可算で「a cup of tea」などで使う。", synonymDifference: "cup vs mug: mug は取っ手付きで大きめのことが多い。", englishDefinition: "A small container used for drinking.", etymology: "食器語彙の基礎語。" }],
  // glass (10217)
  [10217, { coreImage: "ガラス素材、またはガラス製コップを示す多義名詞がコアイメージ。", usage: "材質と容器の意味を文脈で区別する。", synonymDifference: "glass vs cup: glass は素材/器、cup は器の形状名。", englishDefinition: "A hard transparent material; also a drinking container.", etymology: "日用品語彙の基礎多義語。" }],
  // plate (10218)
  [10218, { coreImage: "料理をのせる皿を示す名詞がコアイメージ。", usage: "可算で「a plate」「plates」。", synonymDifference: "plate vs dish: dish は料理そのものの意味も持つ。", englishDefinition: "A flat dish used for serving food.", etymology: "食器語彙の基礎語。" }],
  // spoon (10219)
  [10219, { coreImage: "すくって食べるためのスプーンがコアイメージ。", usage: "可算で「a spoon」「spoons」。", synonymDifference: "spoon vs fork: spoon はすくう、fork は刺す。", englishDefinition: "An eating tool with a small bowl-shaped end.", etymology: "食器語彙の基礎語。" }],
  // knife (10220)
  [10220, { coreImage: "切るための刃物ナイフを示す名詞がコアイメージ。", usage: "単複変化 knife/knives に注意。", synonymDifference: "knife vs sword: knife は日常小型刃物、sword は大型武器。", englishDefinition: "A tool with a sharp blade for cutting.", etymology: "日用品語彙の基礎語。" }],
  // fork (10221)
  [10221, { coreImage: "食べ物を刺して食べるフォークがコアイメージ。", usage: "可算で「a fork」「fork and knife」。", synonymDifference: "fork vs spoon: fork は刺す、spoon はすくう。", englishDefinition: "An eating tool with prongs.", etymology: "食器語彙の基礎語。" }],
  // bottle (10222)
  [10222, { coreImage: "液体を入れるボトル・瓶容器がコアイメージ。", usage: "可算で「a bottle of water」。", synonymDifference: "bottle vs can: bottle は瓶、can は缶。", englishDefinition: "A container with a narrow neck for liquids.", etymology: "日用品語彙の基礎語。" }],
  // towel (10223)
  [10223, { coreImage: "水分を拭き取るための布タオルがコアイメージ。", usage: "「bath towel」「paper towel」で使う。", synonymDifference: "towel vs tissue: towel は繰り返し使う布、tissue は薄紙。", englishDefinition: "A piece of cloth used for drying.", etymology: "生活語彙の基礎語。" }],
  // soap (10224)
  [10224, { coreImage: "汚れを落とす石鹸を示す名詞がコアイメージ。", usage: "通常不可算で「some soap」。", synonymDifference: "soap vs shampoo: soap は洗浄剤一般、shampoo は髪用。", englishDefinition: "A substance used for washing.", etymology: "生活語彙の基礎語。" }],
  // mirror (10225)
  [10225, { coreImage: "像を映す鏡面の道具がコアイメージ。", usage: "可算で「a mirror」「look in the mirror」。", synonymDifference: "mirror vs window: mirror は反射、window は透過。", englishDefinition: "A surface that reflects images.", etymology: "生活語彙の基礎語。" }],
  // present (10226)
  [10226, { coreImage: "相手に贈るプレゼントを示す名詞がコアイメージ。", usage: "gift と同義で日常会話でよく使う。", synonymDifference: "present vs gift: 意味は近く、present は場面語として自然。", englishDefinition: "Something given to someone as a gift.", etymology: "与える行為由来の名詞化。" }],
  // letter (10227)
  [10227, { coreImage: "手紙、または文字1つを示す多義名詞がコアイメージ。", usage: "文脈で「手紙」か「文字」を判別する。", synonymDifference: "letter vs email: letter は紙の手紙、email は電子メール。", englishDefinition: "A written message; also a character of the alphabet.", etymology: "学習語彙の基礎多義語。" }],
  // money (10228)
  [10228, { coreImage: "支払いに使うお金全般を示す名詞がコアイメージ。", usage: "不可算で「much money」「save money」。", synonymDifference: "money vs cash: cash は現金、money はお金全般。", englishDefinition: "What people use to buy things.", etymology: "生活語彙の最重要基礎語。" }],
  // game (10229)
  [10229, { coreImage: "遊びのゲーム、または試合を示す名詞がコアイメージ。", usage: "「play a game」「soccer game」で使う。", synonymDifference: "game vs sport: sport は競技分野全体。", englishDefinition: "An activity with rules, often for fun or competition.", etymology: "娯楽語彙の基礎語。" }],
  // toy (10230)
  [10230, { coreImage: "子どもが遊ぶおもちゃを示す名詞がコアイメージ。", usage: "可算で「a toy」「toy box」。", synonymDifference: "toy vs tool: toy は遊ぶため、tool は作業の道具。", englishDefinition: "An object for children to play with.", etymology: "生活語彙の基礎語。" }],
  // doll (10231)
  [10231, { coreImage: "人形おもちゃを示す名詞がコアイメージ。", usage: "可算で「a doll」「dolls」。", synonymDifference: "doll vs toy: doll はおもちゃの一種。", englishDefinition: "A toy in the shape of a person.", etymology: "玩具語彙の基礎語。" }],
  // ball (10232)
  [10232, { coreImage: "丸い形のボールを示す名詞がコアイメージ。", usage: "「kick a ball」「a tennis ball」で使う。", synonymDifference: "ball vs sphere: sphere は幾何学語でより形式的。", englishDefinition: "A round object used in games and sports.", etymology: "運動語彙の基礎語。" }],
  // song (10233)
  [10233, { coreImage: "歌詞と旋律を持つ1曲を示す名詞がコアイメージ。", usage: "可算で「a song」「favorite song」。", synonymDifference: "song vs music: song は曲単位、music は音楽全般。", englishDefinition: "A short piece of music with words.", etymology: "音楽語彙の基礎語。" }],
  // music (10234)
  [10234, { coreImage: "音楽という芸術・音の総称がコアイメージ。", usage: "通常不可算で「listen to music」。", synonymDifference: "music vs song: music は全体、song は1曲。", englishDefinition: "Vocal or instrumental sounds arranged in a pleasing way.", etymology: "文化語彙の基礎語。" }],
  // movie (10235)
  [10235, { coreImage: "映像作品としての映画を示す名詞がコアイメージ。", usage: "「watch a movie」「movie theater」で使う。", synonymDifference: "movie vs film: 意味は近く、movie が口語的。", englishDefinition: "A story shown in moving pictures.", etymology: "娯楽語彙の基礎語。" }],
  // come (10236)
  [10236, { coreImage: "話し手側へ近づく移動を示す動詞がコアイメージ。", usage: "go と対で方向を意識して使う。", synonymDifference: "come vs go: come は近づく、go は離れる。", englishDefinition: "To move toward the speaker or a place.", etymology: "移動動詞の最重要基礎語。" }],
  // get (10237)
  [10237, { coreImage: "得る・到達する・状態変化する多義動詞がコアイメージ。", usage: "「get a book」「get tired」など意味幅が広い。", synonymDifference: "get vs receive: receive は受け取る意味に限定されやすい。", englishDefinition: "To obtain; to become; to reach.", etymology: "初級で最重要の多義動詞。" }],
  // have (10238)
  [10238, { coreImage: "所有する、または食べる/経験するなどを示す基幹動詞がコアイメージ。", usage: "「have a pen」「have lunch」「have to ...」で頻出。", synonymDifference: "have vs own: own は所有に限定、have は機能が広い。", englishDefinition: "To possess, experience, or take.", etymology: "英文法の中核動詞。" }],
  // see (10239)
  [10239, { coreImage: "目に入る・会うという知覚/接触の動詞がコアイメージ。", usage: "「see a bird」「see my friend」で使う。", synonymDifference: "see vs look: see は自然知覚、look は意図して見る。", englishDefinition: "To notice with your eyes; to meet.", etymology: "知覚動詞の基礎語。" }],
  // look (10240)
  [10240, { coreImage: "意識して視線を向ける、または見た目を示す動詞がコアイメージ。", usage: "「look at ...」「look happy」で使う。", synonymDifference: "look vs see: look は能動、see は受動知覚。", englishDefinition: "To direct your eyes toward something; to appear.", etymology: "知覚動詞の基礎語。" }],
  // say (10241)
  [10241, { coreImage: "言葉を発する「言う」行為がコアイメージ。", usage: "発言内容中心で say + 内容 が基本。", synonymDifference: "say vs tell: say は内容、tell は相手を伴うことが多い。", englishDefinition: "To speak words.", etymology: "発話動詞の最重要基礎語。" }],
  // tell (10242)
  [10242, { coreImage: "相手に情報を伝える行為がコアイメージ。", usage: "tell + 人 + 内容 の形が基本。", synonymDifference: "tell vs say: tell は受け手を明示しやすい。", englishDefinition: "To give information to someone.", etymology: "伝達動詞の基礎語。" }],
  // talk (10243)
  [10243, { coreImage: "会話として話す行為がコアイメージ。", usage: "「talk with/to ...」「talk about ...」で使う。", synonymDifference: "talk vs speak: talk は会話的、speak はややフォーマル。", englishDefinition: "To say words in conversation.", etymology: "会話動詞の基礎語。" }],
  // think (10244)
  [10244, { coreImage: "頭の中で考える、または思う判断行為がコアイメージ。", usage: "「think about ...」「I think ...」で高頻度。", synonymDifference: "think vs believe: believe は信じる意味が強い。", englishDefinition: "To use your mind; to have an opinion.", etymology: "認知動詞の基礎語。" }],
  // take (10245)
  [10245, { coreImage: "取る・持っていくなど取得/移動の多義動詞がコアイメージ。", usage: "「take a bus」「take this」など用途が広い。", synonymDifference: "take vs bring: take は持って行く、bring は持って来る。", englishDefinition: "To get hold of; to carry with you.", etymology: "多義で高頻度の基幹動詞。" }],
  // give (10246)
  [10246, { coreImage: "相手に渡して与える行為がコアイメージ。", usage: "「give + 人 + 物」が基本文型。", synonymDifference: "give vs show: give は授受、show は見せる行為。", englishDefinition: "To hand something to someone.", etymology: "授受動詞の基礎語。" }],
  // put (10247)
  [10247, { coreImage: "物をある場所に置く配置動作がコアイメージ。", usage: "「put A on B」「put ... in ...」で使う。", synonymDifference: "put vs place: place はより丁寧・形式的。", englishDefinition: "To move something to a particular place.", etymology: "配置動詞の基礎語。" }],
  // open (10248)
  [10248, { coreImage: "閉じたものを開く操作がコアイメージ。", usage: "動詞と形容詞の両方で頻出。", synonymDifference: "open vs unlock: open は開ける全般、unlock は鍵を外す。", englishDefinition: "To make something no longer closed.", etymology: "反義語 close と対で学ぶ基礎語。" }],
  // close (10249)
  [10249, { coreImage: "開いているものを閉じる操作がコアイメージ。", usage: "動詞と形容詞の両方で使う。", synonymDifference: "close vs shut: 意味は近いが shut は口語で強めに響くことがある。", englishDefinition: "To make something no longer open.", etymology: "反義語 open と対で学ぶ基礎語。" }],
  // walk (10250)
  [10250, { coreImage: "足で歩いて移動する行為がコアイメージ。", usage: "「walk to school」「take a walk」で使う。", synonymDifference: "walk vs run: walk は歩行、run は走行。", englishDefinition: "To move by putting one foot in front of the other.", etymology: "移動動詞の基礎語。" }],
  // swim (10251)
  [10251, { coreImage: "水中で体を動かして進む動作がコアイメージ。", usage: "「swim in the pool」「go swimming」で使う。", synonymDifference: "swim vs dive: swim は泳ぐ、dive は潜る。", englishDefinition: "To move through water using your arms and legs.", etymology: "運動動詞の基礎語。" }],
  // sing (10252)
  [10252, { coreImage: "メロディに合わせて歌う行為がコアイメージ。", usage: "「sing a song」「sing well」で使う。", synonymDifference: "sing vs say: sing は旋律付き、say は発話。", englishDefinition: "To make musical sounds with your voice.", etymology: "音楽行為の基礎動詞。" }],
  // dance (10253)
  [10253, { coreImage: "音楽に合わせて踊る身体動作がコアイメージ。", usage: "「dance with ...」「dance to music」で使う。", synonymDifference: "dance vs jump: dance はリズム動作、jump は単発跳躍。", englishDefinition: "To move your body rhythmically to music.", etymology: "運動・文化語彙の基礎語。" }],
  // cook (10254)
  [10254, { coreImage: "食材を加熱・調理して料理を作る行為がコアイメージ。", usage: "「cook dinner」「cook for my family」で使う。", synonymDifference: "cook vs bake: cook は調理全般、bake は焼く調理。", englishDefinition: "To prepare food by heating it.", etymology: "生活動詞の基礎語。" }],
  // wash (10255)
  [10255, { coreImage: "水や洗剤で汚れを洗い落とす行為がコアイメージ。", usage: "「wash my hands」「wash the dishes」で使う。", synonymDifference: "wash vs clean: wash は水洗い、clean はきれいにする全般。", englishDefinition: "To clean with water.", etymology: "生活動詞の基礎語。" }],
  // clean (10256)
  [10256, { coreImage: "汚れを取り除いて清潔にする行為がコアイメージ。", usage: "「clean the room」「keep it clean」で使う。", synonymDifference: "clean vs wash: clean は広義、wash は水洗い中心。", englishDefinition: "To make something free from dirt.", etymology: "生活動詞の基礎語。" }],
  // sleep (10257)
  [10257, { coreImage: "休息のため眠る状態・行為がコアイメージ。", usage: "「sleep well」「go to sleep」で使う。", synonymDifference: "sleep vs rest: sleep は睡眠、rest は休息全般。", englishDefinition: "To be in a state of rest with eyes closed.", etymology: "生活動詞の基礎語。" }],
  // wake (10258)
  [10258, { coreImage: "眠りから目覚める動作がコアイメージ。", usage: "「wake up at six」「wake me up」で使う。", synonymDifference: "wake vs get up: wake は目覚め、get up は起き上がる。", englishDefinition: "To stop sleeping; to make someone stop sleeping.", etymology: "生活動詞の基礎語。" }],
  // sit (10259)
  [10259, { coreImage: "椅子などに座る姿勢になる動作がコアイメージ。", usage: "「sit down」「sit on a chair」で使う。", synonymDifference: "sit vs stand: sit は座る、stand は立つ。", englishDefinition: "To rest your body on your bottom.", etymology: "姿勢動詞の基礎語。" }],
  // stand (10260)
  [10260, { coreImage: "足で立つ姿勢を保つ動作がコアイメージ。", usage: "「stand up」「stand near the door」で使う。", synonymDifference: "stand vs sit: stand は立つ、sit は座る。", englishDefinition: "To be in an upright position on your feet.", etymology: "姿勢動詞の基礎語。" }],
  // jump (10261)
  [10261, { coreImage: "地面を蹴って跳び上がる動作がコアイメージ。", usage: "「jump high」「jump over ...」で使う。", synonymDifference: "jump vs hop: hop は片足で軽く跳ぶ。", englishDefinition: "To push yourself off the ground with your legs.", etymology: "運動動詞の基礎語。" }],
  // fly (10262)
  [10262, { coreImage: "空中を飛んで移動する動作がコアイメージ。", usage: "鳥・飛行機の動作にも人の移動にも使える。", synonymDifference: "fly vs travel: fly は空路移動、travel は移動全般。", englishDefinition: "To move through the air.", etymology: "移動動詞の基礎語。" }],
  // catch (10263)
  [10263, { coreImage: "動くものを受け止めてつかむ行為がコアイメージ。", usage: "「catch a ball」「catch a bus」など多義。", synonymDifference: "catch vs throw: catch は受ける、throw は投げる。", englishDefinition: "To take hold of something moving.", etymology: "運動動詞の基礎多義語。" }],
  // throw (10264)
  [10264, { coreImage: "物を手で離して投げる動作がコアイメージ。", usage: "「throw a ball」「throw away ...」で使う。", synonymDifference: "throw vs drop: throw は意図的、drop は落とす。", englishDefinition: "To send something through the air with your hand.", etymology: "運動動詞の基礎語。" }],
  // kick (10265)
  [10265, { coreImage: "足で物を蹴る動作がコアイメージ。", usage: "「kick a ball」が定型。", synonymDifference: "kick vs hit: kick は足、hit は手や道具も含む。", englishDefinition: "To strike with your foot.", etymology: "運動動詞の基礎語。" }],
  // hit (10266)
  [10266, { coreImage: "叩く・当てる衝撃動作がコアイメージ。", usage: "「hit the ball」「hit the wall」で使う。", synonymDifference: "hit vs touch: hit は衝撃を伴う接触。", englishDefinition: "To strike something.", etymology: "動作動詞の基礎語。" }],
  // draw (10267)
  [10267, { coreImage: "線や絵を描く創作動作がコアイメージ。", usage: "「draw a picture」で初級頻出。", synonymDifference: "draw vs paint: draw は線中心、paint は色塗り中心。", englishDefinition: "To make a picture with lines.", etymology: "創作動詞の基礎語。" }],
  // cut (10268)
  [10268, { coreImage: "刃物などで切り分ける動作がコアイメージ。", usage: "「cut paper」「cut into pieces」で使う。", synonymDifference: "cut vs break: cut は刃などで切る、break は折る/壊す。", englishDefinition: "To divide something using a sharp tool.", etymology: "生活動詞の基礎語。" }],
  // buy (10269)
  [10269, { coreImage: "お金を払って物を買う行為がコアイメージ。", usage: "「buy a book」「buy for ...」で使う。", synonymDifference: "buy vs sell: buy は買う、sell は売る。", englishDefinition: "To get something by paying money.", etymology: "買い物動詞の基礎語。" }],
  // sell (10270)
  [10270, { coreImage: "商品を渡して代金を受け取る売る行為がコアイメージ。", usage: "「sell books」「sell to ...」で使う。", synonymDifference: "sell vs buy: sell は売る、buy は買う。", englishDefinition: "To give something to someone for money.", etymology: "買い物動詞の基礎語。" }],
  // teach (10271)
  [10271, { coreImage: "知識や技能を教える行為がコアイメージ。", usage: "teach + 人 + 内容 が基本。", synonymDifference: "teach vs tell: teach は学ばせる、tell は伝える。", englishDefinition: "To help someone learn something.", etymology: "教育動詞の基礎語。" }],
  // learn (10272)
  [10272, { coreImage: "知識や技能を学んで身につける行為がコアイメージ。", usage: "「learn English」「learn to ...」で使う。", synonymDifference: "learn vs study: learn は習得結果、study は学習行為。", englishDefinition: "To gain knowledge or skill.", etymology: "教育動詞の基礎語。" }],
  // try (10273)
  [10273, { coreImage: "成功未確定でも試みる行為がコアイメージ。", usage: "「try to do」「try this」で使う。", synonymDifference: "try vs test: try は試行、test は評価目的の試験。", englishDefinition: "To make an attempt.", etymology: "行為開始の基礎動詞。" }],
  // need (10274)
  [10274, { coreImage: "必要性がある状態を示す動詞がコアイメージ。", usage: "「need + 名詞」「need to do」が基本。", synonymDifference: "need vs want: need は必要、want は希望。", englishDefinition: "To require something because it is necessary.", etymology: "必要表現の基礎語。" }],
  // hope (10275)
  [10275, { coreImage: "よい結果を望む気持ちを示す動詞がコアイメージ。", usage: "「hope to do」「hope that ...」で使う。", synonymDifference: "hope vs wish: wish は実現困難な願望にも使う。", englishDefinition: "To want something to happen.", etymology: "感情動詞の基礎語。" }],
  // love (10276)
  [10276, { coreImage: "強い好意・愛情を示す動詞がコアイメージ。", usage: "「love music」「I love you」で使う。", synonymDifference: "love vs like: love の方が感情強度が高い。", englishDefinition: "To like very much; to feel deep affection.", etymology: "感情語彙の中心語。" }],
  // feel (10277)
  [10277, { coreImage: "感覚や感情を感じる内面的動詞がコアイメージ。", usage: "「feel happy」「feel like ...」で使う。", synonymDifference: "feel vs think: feel は感覚・感情、think は思考。", englishDefinition: "To experience a sensation or emotion.", etymology: "感覚動詞の基礎語。" }],
  // enjoy (10278)
  [10278, { coreImage: "行為や物事を楽しむ感情動詞がコアイメージ。", usage: "後ろは名詞か動名詞（enjoy music / enjoy playing）。", synonymDifference: "enjoy vs like: enjoy は実際の体験を楽しむ含意が強い。", englishDefinition: "To take pleasure in something.", etymology: "感情動詞の基礎語。" }],
  // smile (10279)
  [10279, { coreImage: "うれしさや親しみで微笑む動作がコアイメージ。", usage: "名詞「a smile」と動詞「smile」の両用。", synonymDifference: "smile vs laugh: smile は微笑む、laugh は声を出して笑う。", englishDefinition: "To make a happy expression with your mouth.", etymology: "感情表現語彙の基礎語。" }],
  // cry (10280)
  [10280, { coreImage: "涙を流して泣く行為がコアイメージ。", usage: "「cry loudly」「cry for help」で使う。", synonymDifference: "cry vs shout: cry は泣く/叫ぶ両義、shout は叫ぶ中心。", englishDefinition: "To shed tears when sad or hurt.", etymology: "感情動詞の基礎語。" }],
  // laugh (10281)
  [10281, { coreImage: "おかしさや喜びで笑う動作がコアイメージ。", usage: "「laugh at ...」「laugh with ...」で使う。", synonymDifference: "laugh vs smile: laugh は声を伴う笑い、smile は微笑み。", englishDefinition: "To make sounds because something is funny.", etymology: "感情表現の基礎動詞。" }],
  // work (10282)
  [10282, { coreImage: "働く、または機能するという行為/状態がコアイメージ。", usage: "「work hard」「it works」「work on ...」で高頻度。", synonymDifference: "work vs study: work は労働・作業、study は学習。", englishDefinition: "To do a job; to function.", etymology: "基幹動詞として非常に高頻度。" }],
  // live (10283)
  [10283, { coreImage: "住む、または生きる状態を示す動詞がコアイメージ。", usage: "「live in Tokyo」「live a long life」で使う。", synonymDifference: "live vs stay: live は定住、stay は一時滞在。", englishDefinition: "To reside; to be alive.", etymology: "生活動詞の基礎多義語。" }],
  // move (10284)
  [10284, { coreImage: "位置を変える、または引っ越す行為がコアイメージ。", usage: "「move the box」「move to Osaka」で使う。", synonymDifference: "move vs shift: shift は小さな移動・変更に使うことが多い。", englishDefinition: "To change position; to change residence.", etymology: "移動動詞の基礎語。" }],
  // turn (10285)
  [10285, { coreImage: "向きや状態を変える回転・転換がコアイメージ。", usage: "「turn left」「turn on the light」で多義。", synonymDifference: "turn vs rotate: rotate は物理回転をより厳密に示す。", englishDefinition: "To change direction or state.", etymology: "多義で高頻度の基礎動詞。" }],
  // call (10286)
  [10286, { coreImage: "呼ぶ、または電話する接触行為がコアイメージ。", usage: "「call my name」「call me later」で使う。", synonymDifference: "call vs phone: 意味は近く、call がより広い。", englishDefinition: "To shout to someone; to telephone.", etymology: "連絡動詞の基礎語。" }],
  // ask (10287)
  [10287, { coreImage: "質問する・依頼する行為がコアイメージ。", usage: "「ask a question」「ask for help」で使う。", synonymDifference: "ask vs tell: ask は求める、tell は伝える。", englishDefinition: "To request information or help.", etymology: "会話動詞の基礎語。" }],
  // show (10288)
  [10288, { coreImage: "見せて相手に分からせる行為がコアイメージ。", usage: "show + 人 + 物 の形で使う。", synonymDifference: "show vs tell: show は視覚提示、tell は言語伝達。", englishDefinition: "To let someone see something.", etymology: "提示動詞の基礎語。" }],
  // find (10289)
  [10289, { coreImage: "探して見つける、または気づく結果がコアイメージ。", usage: "「find my key」「find it difficult」で使う。", synonymDifference: "find vs look for: find は結果、look for は探す過程。", englishDefinition: "To discover or locate something.", etymology: "探索動詞の基礎語。" }],
  // keep (10290)
  [10290, { coreImage: "状態や所有を継続して保つことがコアイメージ。", usage: "「keep the door open」「keep a diary」で使う。", synonymDifference: "keep vs hold: keep は継続、hold は一時的保持。", englishDefinition: "To continue to have or maintain.", etymology: "継続動詞の基礎語。" }],
  // bring (10291)
  [10291, { coreImage: "話し手側へ持って来る移動授受がコアイメージ。", usage: "「bring me a pen」で使う。", synonymDifference: "bring vs take: bring はこちらへ、take はあちらへ。", englishDefinition: "To carry something toward a person or place.", etymology: "移動授受動詞の基礎語。" }],
  // carry (10292)
  [10292, { coreImage: "物を持ち運ぶ運搬行為がコアイメージ。", usage: "「carry a bag」「carry water」で使う。", synonymDifference: "carry vs bring: carry は運搬動作、bring は方向（こちら）を含む。", englishDefinition: "To hold and move something from one place to another.", etymology: "運搬動詞の基礎語。" }],
  // hold (10293)
  [10293, { coreImage: "手などで持って保持する動作がコアイメージ。", usage: "「hold my hand」「hold a cup」で使う。", synonymDifference: "hold vs keep: hold は保持動作、keep は継続状態。", englishDefinition: "To have something in your hand or arms.", etymology: "保持動詞の基礎語。" }],
  // pull (10294)
  [10294, { coreImage: "自分の方へ引っ張る力の方向がコアイメージ。", usage: "「pull the door」「pull a rope」で使う。", synonymDifference: "pull vs push: pull は引く、push は押す。", englishDefinition: "To move something toward yourself with force.", etymology: "力学動詞の基礎語。" }],
  // push (10295)
  [10295, { coreImage: "自分から離す方向へ押す力の作用がコアイメージ。", usage: "「push the door」「push the cart」で使う。", synonymDifference: "push vs pull: push は押す、pull は引く。", englishDefinition: "To move something away using force.", etymology: "力学動詞の基礎語。" }],
  // drink (10296)
  [10296, { coreImage: "液体を口から取り込む行為がコアイメージ。", usage: "名詞/動詞の両用。「drink water」「a drink」。", synonymDifference: "drink vs eat: drink は液体摂取、eat は固形摂取。", englishDefinition: "To take liquid into your mouth and swallow it.", etymology: "生活動詞の基礎語。" }],
  // wear (10297)
  [10297, { coreImage: "衣類や装飾品を身につけた状態を示す動詞がコアイメージ。", usage: "「wear a hat」「wear glasses」で使う。", synonymDifference: "wear vs put on: wear は着ている状態、put on は着る動作。", englishDefinition: "To have clothes or accessories on your body.", etymology: "衣類動詞の基礎語。" }],
  // ride (10298)
  [10298, { coreImage: "乗り物や動物に乗って移動する行為がコアイメージ。", usage: "「ride a bike」「ride a horse」で使う。", synonymDifference: "ride vs drive: ride は乗る側、drive は運転する側。", englishDefinition: "To travel on or in a vehicle or on an animal.", etymology: "移動動詞の基礎語。" }],
  // drive (10299)
  [10299, { coreImage: "車などを運転して動かす行為がコアイメージ。", usage: "「drive a car」「drive to school」で使う。", synonymDifference: "drive vs ride: drive は運転、ride は同乗/騎乗。", englishDefinition: "To control and operate a vehicle.", etymology: "交通動詞の基礎語。" }],
  // visit (10300)
  [10300, { coreImage: "人や場所を訪ねて行く行為がコアイメージ。", usage: "「visit my friend」「visit Japan」で使う。", synonymDifference: "visit vs go to: visit は訪問目的をより明確に示す。", englishDefinition: "To go to see a person or place.", etymology: "移動・交流動詞の基礎語。" }],
  // meet (10301)
  [10301, { coreImage: "人と会う・出会う接触行為がコアイメージ。", usage: "「meet my teacher」「Nice to meet you」で使う。", synonymDifference: "meet vs see: meet は会う行為、see は見る意味も広い。", englishDefinition: "To come together with someone.", etymology: "対人動詞の基礎語。" }],
  // leave (10302)
  [10302, { coreImage: "その場を去る、または残しておく行為がコアイメージ。", usage: "「leave home」「leave a message」で多義。", synonymDifference: "leave vs go: leave は出発点を離れることを強調。", englishDefinition: "To go away from a place; to let something remain.", etymology: "移動動詞の基礎多義語。" }],
  // arrive (10303)
  [10303, { coreImage: "目的地へ到着する結果がコアイメージ。", usage: "「arrive at/in ...」の前置詞に注意。", synonymDifference: "arrive vs reach: reach は他動詞で目的語を直接取る。", englishDefinition: "To get to a place.", etymology: "移動結果動詞の基礎語。" }],
  // start (10304)
  [10304, { coreImage: "行為や出来事の開始点を作ることがコアイメージ。", usage: "「start to do / doing」「start a game」で使う。", synonymDifference: "start vs begin: ほぼ同義で start の方が口語的。", englishDefinition: "To begin something.", etymology: "開始動詞の基礎語。" }],
  // finish (10305)
  [10305, { coreImage: "行為を最後まで終える完了がコアイメージ。", usage: "「finish homework」「finish doing ...」で使う。", synonymDifference: "finish vs end: finish は主体的完了、end は自動的終結にも使う。", englishDefinition: "To complete something.", etymology: "完了動詞の基礎語。" }],
  // begin (10306)
  [10306, { coreImage: "何かが始まる/始める開始動詞がコアイメージ。", usage: "start と同様に to do / doing と使う。", synonymDifference: "begin vs start: 意味は近いが begin はやや文語寄り。", englishDefinition: "To start; to come into existence.", etymology: "開始動詞の基礎語。" }],
  // end (10307)
  [10307, { coreImage: "物事の終わりに到達する終結がコアイメージ。", usage: "動詞・名詞の両用（The end）。", synonymDifference: "end vs finish: end は終点、finish は完了行為の含意。", englishDefinition: "To come to a stop; the final part.", etymology: "終結語彙の基礎語。" }],
  // send (10308)
  [10308, { coreImage: "物や情報を相手へ送る伝達行為がコアイメージ。", usage: "「send a letter to ...」が基本。", synonymDifference: "send vs give: send は離れた相手へ送る。", englishDefinition: "To make something go to someone.", etymology: "伝達動詞の基礎語。" }],
  // pay (10309)
  [10309, { coreImage: "代金を支払う行為がコアイメージ。", usage: "「pay money for ...」「pay by card」で使う。", synonymDifference: "pay vs spend: pay は支払い行為、spend は消費全体。", englishDefinition: "To give money for something.", etymology: "金銭動詞の基礎語。" }],
  // grow (10310)
  [10310, { coreImage: "育つ/育てる成長変化がコアイメージ。", usage: "自動詞・他動詞の両方で使える。", synonymDifference: "grow vs raise: grow は成長・栽培全般、raise は育てる行為に焦点。", englishDefinition: "To become bigger; to cultivate.", etymology: "変化動詞の基礎語。" }],
  // build (10311)
  [10311, { coreImage: "材料を組み合わせて作る・建てる行為がコアイメージ。", usage: "「build a house」「build a team」で使う。", synonymDifference: "build vs make: build は構造物構築、make は作る全般。", englishDefinition: "To make by putting parts together.", etymology: "制作動詞の基礎語。" }],
  // break (10312)
  [10312, { coreImage: "壊す/壊れることで連続性が断たれる変化がコアイメージ。", usage: "他動詞・自動詞の両用。", synonymDifference: "break vs cut: break は折れる・壊れる、cut は刃物で切る。", englishDefinition: "To damage so that something separates or stops working.", etymology: "変化動詞の基礎語。" }],
  // pick (10313)
  [10313, { coreImage: "複数から選び取る、または摘み取る行為がコアイメージ。", usage: "「pick a color」「pick flowers」で使う。", synonymDifference: "pick vs choose: pick は口語的で軽い選択。", englishDefinition: "To choose or to take by hand.", etymology: "選択動詞の基礎語。" }],
  // drop (10314)
  [10314, { coreImage: "手から下へ落とす行為がコアイメージ。", usage: "「drop a cup」「drop by（立ち寄る）」の句動詞もある。", synonymDifference: "drop vs fall: drop は落とす（他動詞）側、fall は落ちる（自動詞）側。", englishDefinition: "To let something fall.", etymology: "動作動詞の基礎語。" }],
  // fall (10315)
  [10315, { coreImage: "重力で下へ落ちる自動的動作がコアイメージ。", usage: "「fall down」「fall in love」で多義。", synonymDifference: "fall vs drop: fall は自動詞中心、drop は他動詞中心。", englishDefinition: "To move downward by gravity.", etymology: "移動変化動詞の基礎語。" }],
  // climb (10316)
  [10316, { coreImage: "上方向へ登る運動がコアイメージ。", usage: "「climb a mountain」「climb stairs」で使う。", synonymDifference: "climb vs go up: climb は身体動作の努力を含みやすい。", englishDefinition: "To go upward using hands and feet.", etymology: "運動動詞の基礎語。" }],
  // change (10317)
  [10317, { coreImage: "状態を変える/変わる変化がコアイメージ。", usage: "他動詞・自動詞の両用。", synonymDifference: "change vs turn: change は広い変化、turn は向きや状態の転換。", englishDefinition: "To make or become different.", etymology: "変化動詞の基礎語。" }],
  // choose (10318)
  [10318, { coreImage: "選択肢から意図して選ぶ行為がコアイメージ。", usage: "「choose A」「choose to do」で使う。", synonymDifference: "choose vs pick: choose の方がやや丁寧・明確。", englishDefinition: "To select one option from others.", etymology: "選択動詞の基礎語。" }],
  // forget (10319)
  [10319, { coreImage: "記憶や予定を思い出せない状態になることがコアイメージ。", usage: "「forget to do / doing」の使い分けに注意。", synonymDifference: "forget vs miss: forget は失念、miss は見逃し・不在。", englishDefinition: "To fail to remember.", etymology: "記憶動詞の基礎語。" }],
  // remember (10320)
  [10320, { coreImage: "記憶を保持・想起する認知行為がコアイメージ。", usage: "「remember to do / doing」で使う。", synonymDifference: "remember vs recall: recall はやや形式的。", englishDefinition: "To keep in mind or bring back to mind.", etymology: "記憶動詞の基礎語。" }],
  // believe (10321)
  [10321, { coreImage: "情報や人を真実だと信じる心的判断がコアイメージ。", usage: "「believe + 人/内容」で使う。", synonymDifference: "believe vs think: believe は信頼・確信の含意が強い。", englishDefinition: "To accept something as true.", etymology: "思考・信念動詞の基礎語。" }],
  // wish (10322)
  [10322, { coreImage: "実現してほしい願望を示す動詞がコアイメージ。", usage: "「wish to do」「I wish ...」で使う。", synonymDifference: "wish vs hope: wish は実現困難な願いにも使う。", englishDefinition: "To want something strongly.", etymology: "感情動詞の基礎語。" }],
  // mean (10323)
  [10323, { coreImage: "言葉や行為が何を意味するかを示す動詞がコアイメージ。", usage: "「What does it mean?」「I mean ...」で頻出。", synonymDifference: "mean vs say: mean は意味内容、say は発話行為。", englishDefinition: "To signify or intend.", etymology: "言語理解の基礎動詞。" }],
  // check (10324)
  [10324, { coreImage: "正確さや状態を確認する行為がコアイメージ。", usage: "「check answers」「check the time」で使う。", synonymDifference: "check vs confirm: confirm は確定・裏付けの含意が強い。", englishDefinition: "To examine something to make sure.", etymology: "確認動詞の基礎語。" }],
  // taste (10325)
  [10325, { coreImage: "味わう、または味がする感覚動詞がコアイメージ。", usage: "「taste the soup」「It tastes good」で両用。", synonymDifference: "taste vs try: taste は味覚確認、try は試す全般。", englishDefinition: "To perceive flavor; to have a flavor.", etymology: "感覚動詞の基礎多義語。" }],
  // smell (10326)
  [10326, { coreImage: "においを感じる、またはにおいがする感覚がコアイメージ。", usage: "「smell flowers」「It smells nice」で使う。", synonymDifference: "smell vs scent: smell は動詞/名詞、scent は名詞中心。", englishDefinition: "To notice an odor; to have an odor.", etymology: "感覚動詞の基礎語。" }],
  // touch (10327)
  [10327, { coreImage: "手などで触れる接触行為がコアイメージ。", usage: "「touch this」「don't touch」で使う。", synonymDifference: "touch vs hit: touch は軽い接触、hit は衝撃。", englishDefinition: "To put your hand or body on something.", etymology: "動作動詞の基礎語。" }],
  // hear (10328)
  [10328, { coreImage: "音が耳に入って聞こえる知覚がコアイメージ。", usage: "listen との違い（意図性）を対で学ぶ。", synonymDifference: "hear vs listen: hear は自然知覚、listen は意識して聞く。", englishDefinition: "To perceive sound with your ears.", etymology: "知覚動詞の基礎語。" }],
  // hang (10329)
  [10329, { coreImage: "掛ける・ぶら下がる位置関係がコアイメージ。", usage: "「hang a picture」「hang on the wall」で使う。", synonymDifference: "hang vs put: hang は吊るす配置に特化。", englishDefinition: "To suspend or be suspended from above.", etymology: "配置動詞の基礎語。" }],
  // fill (10330)
  [10330, { coreImage: "空間を満たしていっぱいにする行為がコアイメージ。", usage: "「fill the bottle with water」で使う。", synonymDifference: "fill vs cover: fill は内部を満たす、cover は表面を覆う。", englishDefinition: "To make full.", etymology: "状態変化動詞の基礎語。" }],
  // count (10331)
  [10331, { coreImage: "数を順に数える行為がコアイメージ。", usage: "「count to ten」「count apples」で使う。", synonymDifference: "count vs calculate: count は数える、calculate は計算する。", englishDefinition: "To determine number by naming numbers.", etymology: "数処理動詞の基礎語。" }],
  // spell (10332)
  [10332, { coreImage: "単語を文字でつづる行為がコアイメージ。", usage: "「How do you spell ...?」が定型。", synonymDifference: "spell vs write: spell は綴りを言う/書く、write は書く全般。", englishDefinition: "To write or say the letters of a word in order.", etymology: "語学学習動詞の基礎語。" }],
  // share (10333)
  [10333, { coreImage: "分け合う・共有する行為がコアイメージ。", usage: "「share with ...」「share ideas」で使う。", synonymDifference: "share vs give: share は分け合い、give は一方向授受。", englishDefinition: "To divide and use together.", etymology: "協働動詞の基礎語。" }],
  // join (10334)
  [10334, { coreImage: "集団や活動に参加して加わる行為がコアイメージ。", usage: "「join the club」「join us」で使う。", synonymDifference: "join vs attend: join はメンバー化、attend は参加出席。", englishDefinition: "To become part of a group or activity.", etymology: "参加動詞の基礎語。" }],
  // win (10335)
  [10335, { coreImage: "競争で勝利を得る結果がコアイメージ。", usage: "「win a game」「win first prize」で使う。", synonymDifference: "win vs beat: win は勝利獲得、beat は相手に勝つ。", englishDefinition: "To be victorious in a game or contest.", etymology: "競争語彙の基礎語。" }],
  // big (10336)
  [10336, { coreImage: "大きさ・規模が大きい状態を示す形容がコアイメージ。", usage: "「a big house」「big city」で頻出。", synonymDifference: "big vs large: ほぼ同義で big はより口語的。", englishDefinition: "Large in size or amount.", etymology: "形容詞基礎語。" }],
  // small (10337)
  [10337, { coreImage: "大きさ・規模が小さい状態を示す形容がコアイメージ。", usage: "「a small room」「small bag」で使う。", synonymDifference: "small vs little: little は主観的・感情的な用法も多い。", englishDefinition: "Little in size.", etymology: "形容詞基礎語。" }],
  // long (10338)
  [10338, { coreImage: "長さや時間が長い状態を示す形容がコアイメージ。", usage: "「long hair」「a long time」で多用。", synonymDifference: "long vs tall: long は長さ、tall は高さ。", englishDefinition: "Having great length or lasting much time.", etymology: "形容詞基礎語。" }],
  // short (10339)
  [10339, { coreImage: "長さが短い、または背が低い状態を示す形容がコアイメージ。", usage: "「short hair」「a short boy」で使う。", synonymDifference: "short vs low: short は長さ/身長、low は位置や高さ。", englishDefinition: "Not long; of little height.", etymology: "形容詞基礎語。" }],
  // tall (10340)
  [10340, { coreImage: "人や物の高さが高い状態を示す形容がコアイメージ。", usage: "「a tall building」「tall girl」で使う。", synonymDifference: "tall vs high: tall は縦に伸びた物体、high は位置・高さ全般。", englishDefinition: "Having greater than usual height.", etymology: "形容詞基礎語。" }],
  // new (10341)
  [10341, { coreImage: "時間が新しい・使用されていない状態がコアイメージ。", usage: "「a new book」「new student」で使う。", synonymDifference: "new vs old: new は新しい、old は古い。", englishDefinition: "Not old; recently made or discovered.", etymology: "基本対義語の中心語。" }],
  // young (10342)
  [10342, { coreImage: "年齢が若い状態を示す形容がコアイメージ。", usage: "人・動物・時期に広く使う。", synonymDifference: "young vs new: young は年齢、new は新しさ。", englishDefinition: "Having lived or existed for a short time.", etymology: "年齢表現の基礎語。" }],
  // hot (10343)
  [10343, { coreImage: "温度が高い、または暑い状態がコアイメージ。", usage: "天候と物体の両方に使える。", synonymDifference: "hot vs warm: hot の方が温度が高い。", englishDefinition: "Having a high temperature.", etymology: "温度形容詞の基礎語。" }],
  // cold (10344)
  [10344, { coreImage: "温度が低い、または寒い状態がコアイメージ。", usage: "天候・物体・体感に使う。", synonymDifference: "cold vs cool: cold の方が低温。", englishDefinition: "Having a low temperature.", etymology: "温度形容詞の基礎語。" }],
  // warm (10345)
  [10345, { coreImage: "やや暖かい快適温度がコアイメージ。", usage: "「warm day」「keep warm」で使う。", synonymDifference: "warm vs hot: warm は穏やかな暖かさ。", englishDefinition: "Moderately hot; pleasantly heated.", etymology: "温度形容詞の基礎語。" }],
  // cool (10346)
  [10346, { coreImage: "涼しい温度、またはかっこいい評価の両義がコアイメージ。", usage: "文脈で温度義か評価義かを判別。", synonymDifference: "cool vs cold: cool は冷たすぎない。", englishDefinition: "Slightly cold; also fashionable or impressive.", etymology: "多義形容詞の基礎語。" }],
  // fast (10347)
  [10347, { coreImage: "速度が速い状態を示す形容がコアイメージ。", usage: "副詞同形で「run fast」も可能。", synonymDifference: "fast vs quick: fast は速度、quick は時間の短さにも使う。", englishDefinition: "Moving at high speed.", etymology: "速度語彙の基礎語。" }],
  // slow (10348)
  [10348, { coreImage: "速度が遅い状態を示す形容がコアイメージ。", usage: "副詞は slowly が基本。", synonymDifference: "slow vs late: slow は速度、late は時刻遅れ。", englishDefinition: "Moving or happening with little speed.", etymology: "速度語彙の基礎語。" }],
  // easy (10349)
  [10349, { coreImage: "努力が少なくできる容易さがコアイメージ。", usage: "「easy question」「take it easy」で使う。", synonymDifference: "easy vs simple: easy は難易度、simple は構造の単純さ。", englishDefinition: "Not difficult.", etymology: "難易度語彙の基礎語。" }],
  // hard (10350)
  [10350, { coreImage: "難しい、または硬いという二つの核義がコアイメージ。", usage: "文脈で難易度義か物性義かを判別。", synonymDifference: "hard vs difficult: difficult は難しい義に限定されやすい。", englishDefinition: "Difficult; also solid and not soft.", etymology: "多義形容詞の基礎語。" }],
  // beautiful (10351)
  [10351, { coreImage: "見た目や性質が非常に美しい評価がコアイメージ。", usage: "人・景色・物の賞賛に使える。", synonymDifference: "beautiful vs pretty: beautiful の方が強い賞賛。", englishDefinition: "Very attractive and pleasing.", etymology: "評価形容詞の基礎語。" }],
  // pretty (10352)
  [10352, { coreImage: "かわいい・きれいな印象を示す形容がコアイメージ。", usage: "副詞「pretty + 形容詞（かなり）」の用法もある。", synonymDifference: "pretty vs cute: pretty はきれい寄り、cute は愛らしさ寄り。", englishDefinition: "Attractive in a delicate way.", etymology: "評価形容詞の基礎多義語。" }],
  // cute (10353)
  [10353, { coreImage: "小さく愛らしい印象を示す評価がコアイメージ。", usage: "人・動物・物の可愛さに使う。", synonymDifference: "cute vs pretty: cute は愛らしさ、pretty は整った美しさ。", englishDefinition: "Attractive in a charming way.", etymology: "評価形容詞の基礎語。" }],
  // strong (10354)
  [10354, { coreImage: "力・程度・意志が強い状態がコアイメージ。", usage: "身体、味、意見など幅広く使う。", synonymDifference: "strong vs powerful: powerful の方が影響力の規模が大きいことが多い。", englishDefinition: "Having great physical power or intensity.", etymology: "性質形容詞の基礎語。" }],
  // weak (10355)
  [10355, { coreImage: "力・程度が弱い状態を示す形容がコアイメージ。", usage: "身体、信号、主張などに使う。", synonymDifference: "weak vs soft: weak は力不足、soft は柔らかさ。", englishDefinition: "Not strong.", etymology: "性質形容詞の基礎語。" }],
  // busy (10356)
  [10356, { coreImage: "予定や作業で手が埋まっている状態がコアイメージ。", usage: "「I am busy now.」で高頻度。", synonymDifference: "busy vs occupied: occupied はより形式的。", englishDefinition: "Having a lot to do.", etymology: "生活状態語彙の基礎語。" }],
  // free (10357)
  [10357, { coreImage: "自由である、または無料である状態の両義がコアイメージ。", usage: "文脈で「時間が空いている」か「無料」かを判別。", synonymDifference: "free vs available: free は自由/無料、available は利用可能。", englishDefinition: "Not occupied or not costing money.", etymology: "多義形容詞の基礎語。" }],
  // hungry (10358)
  [10358, { coreImage: "空腹で食べたい体感状態がコアイメージ。", usage: "「I am hungry.」が定型。", synonymDifference: "hungry vs starving: starving の方が程度が強い。", englishDefinition: "Feeling a need to eat.", etymology: "体調形容詞の基礎語。" }],
  // thirsty (10359)
  [10359, { coreImage: "のどが渇いて飲みたい体感状態がコアイメージ。", usage: "「I am thirsty.」が定型。", synonymDifference: "thirsty vs dry: thirsty は人の感覚、dry は物の状態にも使う。", englishDefinition: "Feeling a need to drink.", etymology: "体調形容詞の基礎語。" }],
  // tired (10360)
  [10360, { coreImage: "疲れて休みが必要な状態がコアイメージ。", usage: "「I am tired.」「tired of ...」で使う。", synonymDifference: "tired vs sleepy: tired は疲労、sleepy は眠気。", englishDefinition: "Needing rest because of tiredness.", etymology: "体調形容詞の基礎語。" }],
  // sick (10361)
  [10361, { coreImage: "病気・体調不良の状態を示す形容がコアイメージ。", usage: "米語で病気義が強く、英語では ill もよく使う。", synonymDifference: "sick vs ill: 意味は近いが地域差・語感差がある。", englishDefinition: "Not healthy; ill.", etymology: "体調形容詞の基礎語。" }],
  // fine (10362)
  [10362, { coreImage: "問題ない・元気・良好を示す中立評価がコアイメージ。", usage: "返答「I am fine.」や評価「That is fine.」で使う。", synonymDifference: "fine vs good: fine は中立〜やや丁寧、good は一般評価。", englishDefinition: "Well; satisfactory; of good quality.", etymology: "高頻度評価語。" }],
  // kind (10363)
  [10363, { coreImage: "他者に優しく思いやりがある性質がコアイメージ。", usage: "「kind to people」「a kind person」で使う。", synonymDifference: "kind vs nice: kind は親切行為、nice は印象全般。", englishDefinition: "Friendly and caring toward others.", etymology: "性格形容詞の基礎語。" }],
  // sad (10364)
  [10364, { coreImage: "悲しく気分が落ち込んだ感情状態がコアイメージ。", usage: "「I feel sad.」で感情表現に使う。", synonymDifference: "sad vs upset: upset は動揺・不安も含む。", englishDefinition: "Unhappy or sorrowful.", etymology: "感情形容詞の基礎語。" }],
  // angry (10365)
  [10365, { coreImage: "怒りで感情が高ぶった状態がコアイメージ。", usage: "「angry with ...」「angry about ...」で使う。", synonymDifference: "angry vs mad: mad は口語で怒り義にも使われる。", englishDefinition: "Feeling strong displeasure.", etymology: "感情形容詞の基礎語。" }],
  // afraid (10366)
  [10366, { coreImage: "怖い、または不安を感じる状態がコアイメージ。", usage: "「afraid of ...」「I am afraid ...」で使う。", synonymDifference: "afraid vs scared: scared の方が口語的。", englishDefinition: "Feeling fear or worry.", etymology: "感情形容詞の基礎語。" }],
  // surprised (10367)
  [10367, { coreImage: "予想外に出会って驚いた状態がコアイメージ。", usage: "人が主語の受け身形容詞として使う。", synonymDifference: "surprised vs amazing: surprised は人の状態、amazing は原因側。", englishDefinition: "Feeling unexpected astonishment.", etymology: "surprise の過去分詞形容詞。" }],
  // excited (10368)
  [10368, { coreImage: "期待や刺激で気持ちが高まった状態がコアイメージ。", usage: "「excited about ...」が定型。", synonymDifference: "excited vs interesting: excited は人の感情、interesting は物の性質。", englishDefinition: "Very enthusiastic and eager.", etymology: "excite の過去分詞形容詞。" }],
  // interested (10369)
  [10369, { coreImage: "対象に関心を持っている心理状態がコアイメージ。", usage: "「interested in ...」の前置詞に注意。", synonymDifference: "interested vs interesting: interested は人の状態、interesting は対象の性質。", englishDefinition: "Wanting to know or learn more about something.", etymology: "interest の過去分詞形容詞。" }],
  // important (10370)
  [10370, { coreImage: "価値・影響が大きく大切である評価がコアイメージ。", usage: "「important for ...」「important thing」で使う。", synonymDifference: "important vs necessary: important は重要、necessary は必要。", englishDefinition: "Having great value or significance.", etymology: "評価形容詞の基礎語。" }],
  // famous (10371)
  [10371, { coreImage: "多くの人に知られている有名さがコアイメージ。", usage: "「famous for ...」「a famous singer」で使う。", synonymDifference: "famous vs popular: famous は知名度、popular は人気。", englishDefinition: "Known by many people.", etymology: "評価形容詞の基礎語。" }],
  // popular (10372)
  [10372, { coreImage: "多くの人に好まれている人気状態がコアイメージ。", usage: "「popular with students」が定型。", synonymDifference: "popular vs famous: popular は好感度、famous は認知度。", englishDefinition: "Liked by many people.", etymology: "評価形容詞の基礎語。" }],
  // special (10373)
  [10373, { coreImage: "普通と異なる特別性を示す形容がコアイメージ。", usage: "「special day」「special menu」で使う。", synonymDifference: "special vs particular: special は特別価値、particular は特定性。", englishDefinition: "Different from the usual and important.", etymology: "評価形容詞の基礎語。" }],
  // different (10374)
  [10374, { coreImage: "同一でない差異状態を示す形容がコアイメージ。", usage: "「different from ...」の前置詞に注意。", synonymDifference: "different vs same: opposite の関係。", englishDefinition: "Not the same.", etymology: "比較語彙の基礎語。" }],
  // same (10375)
  [10375, { coreImage: "差異がなく同一である状態がコアイメージ。", usage: "「the same as ...」で使う。", synonymDifference: "same vs similar: same は完全一致、similar は類似。", englishDefinition: "Exactly alike; not different.", etymology: "比較語彙の基礎語。" }],
  // right (10376)
  [10376, { coreImage: "正しい、または右側を示す多義形容がコアイメージ。", usage: "文脈で正誤義か方向義かを判別。", synonymDifference: "right vs correct: correct は正確性に限定されやすい。", englishDefinition: "Correct; also on the right side.", etymology: "高頻度多義語。" }],
  // wrong (10377)
  [10377, { coreImage: "正しくない誤り状態を示す形容がコアイメージ。", usage: "「You are wrong.」「wrong answer」で使う。", synonymDifference: "wrong vs mistaken: mistaken は人の思い違いに使うことが多い。", englishDefinition: "Not correct.", etymology: "正誤語彙の基礎語。" }],
  // safe (10378)
  [10378, { coreImage: "危険が少なく安心できる状態がコアイメージ。", usage: "「safe place」「be safe」で使う。", synonymDifference: "safe vs secure: secure は防御面の強固さを強調。", englishDefinition: "Free from danger.", etymology: "安全語彙の基礎語。" }],
  // dangerous (10379)
  [10379, { coreImage: "危険があり害を生む可能性が高い状態がコアイメージ。", usage: "「dangerous road」「dangerous animal」で使う。", synonymDifference: "dangerous vs risky: dangerous は危害可能性、risky は失敗可能性にも広い。", englishDefinition: "Likely to cause harm.", etymology: "安全対義語の基礎語。" }],
  // dirty (10381)
  [10381, { coreImage: "汚れが付いて不潔な状態がコアイメージ。", usage: "「dirty hands」「dirty room」で使う。", synonymDifference: "dirty vs messy: dirty は汚れ、messy は散らかり。", englishDefinition: "Not clean.", etymology: "状態形容詞の基礎語。" }],
  // dark (10382)
  [10382, { coreImage: "光が少なく暗い状態がコアイメージ。", usage: "「dark room」「it is dark」などで使う。", synonymDifference: "dark vs black: dark は明るさ、black は色。", englishDefinition: "Having little or no light.", etymology: "明暗語彙の基礎語。" }],
  // bright (10383)
  [10383, { coreImage: "光が多く明るい状態がコアイメージ。", usage: "部屋・色・人の知性にも比喩使用される。", synonymDifference: "bright vs light: bright は強い明るさ、light は明るい状態一般。", englishDefinition: "Giving out or reflecting much light.", etymology: "明暗語彙の基礎語。" }],
  // heavy (10384)
  [10384, { coreImage: "重さが大きい状態を示す形容がコアイメージ。", usage: "「heavy bag」「heavy rain」で物理/比喩両用。", synonymDifference: "heavy vs hard: heavy は重量、hard は硬さ・難しさ。", englishDefinition: "Having great weight.", etymology: "性質形容詞の基礎語。" }],
  // light (10385)
  [10385, { coreImage: "軽い、または明るいという多義状態がコアイメージ。", usage: "文脈で重量義か明暗義かを判別。", synonymDifference: "light vs bright: bright は明るさ強度、light は軽さ/明るさの広義。", englishDefinition: "Not heavy; also bright.", etymology: "多義形容詞の基礎語。" }],
  // rich (10386)
  [10386, { coreImage: "お金や資源が豊かな状態がコアイメージ。", usage: "人・国・味（rich flavor）にも使える。", synonymDifference: "rich vs wealthy: wealthy の方が財産語感が明確なことが多い。", englishDefinition: "Having a lot of money or abundance.", etymology: "評価形容詞の基礎語。" }],
  // poor (10387)
  [10387, { coreImage: "お金が少ない、または質が低い状態を示す語がコアイメージ。", usage: "経済状態と品質評価の両義がある。", synonymDifference: "poor vs bad: poor は不足感や低水準を示しやすい。", englishDefinition: "Having little money; also of low quality.", etymology: "評価形容詞の基礎多義語。" }],
  // wide (10388)
  [10388, { coreImage: "横幅が広い状態を示す形容がコアイメージ。", usage: "「wide road」「open wide」で使う。", synonymDifference: "wide vs broad: broad も近いが語感差がある。", englishDefinition: "Having great width.", etymology: "空間形容詞の基礎語。" }],
  // narrow (10389)
  [10389, { coreImage: "幅が狭い状態を示す形容がコアイメージ。", usage: "「narrow street」「narrow gap」で使う。", synonymDifference: "narrow vs small: narrow は幅限定、小さいは全体サイズ。", englishDefinition: "Not wide.", etymology: "空間形容詞の基礎語。" }],
  // deep (10390)
  [10390, { coreImage: "上面から底までの深さが大きい状態がコアイメージ。", usage: "「deep water」「deep sleep」で比喩もある。", synonymDifference: "deep vs high: deep は下方向、high は上方向。", englishDefinition: "Extending far down from the top.", etymology: "空間形容詞の基礎語。" }],
  // high (10391)
  [10391, { coreImage: "位置や高さが高い状態を示す形容がコアイメージ。", usage: "「high mountain」「high price」で使う。", synonymDifference: "high vs tall: high は位置・数値、tall は縦長の物体。", englishDefinition: "Far above the ground or above normal level.", etymology: "空間形容詞の基礎語。" }],
  // low (10392)
  [10392, { coreImage: "位置・高さ・量が低い状態を示す形容がコアイメージ。", usage: "「low table」「low voice」で使う。", synonymDifference: "low vs short: low は位置・程度、short は長さ。", englishDefinition: "Not high; near the ground or small in amount.", etymology: "空間・程度語彙の基礎語。" }],
  // loud (10393)
  [10393, { coreImage: "音量が大きく目立つ状態がコアイメージ。", usage: "「loud music」「too loud」で使う。", synonymDifference: "loud vs noisy: loud は音量、noisy は騒がしさ評価。", englishDefinition: "Having a high volume.", etymology: "音量語彙の基礎語。" }],
  // quiet (10394)
  [10394, { coreImage: "音が少なく静かな状態がコアイメージ。", usage: "「quiet room」「be quiet」で使う。", synonymDifference: "quiet vs silent: silent は無音に近い。", englishDefinition: "Making little or no noise.", etymology: "音量語彙の基礎語。" }],
  // soft (10395)
  [10395, { coreImage: "触感が柔らかい、または音がやさしい状態がコアイメージ。", usage: "物の硬さと音量の両方に使う。", synonymDifference: "soft vs weak: soft は硬さ/音量、weak は力不足。", englishDefinition: "Not hard; gentle in sound or touch.", etymology: "性質形容詞の基礎語。" }],
  // sweet (10396)
  [10396, { coreImage: "甘い味、または感じのよい評価を示す語がコアイメージ。", usage: "味覚義と性格評価義の両方がある。", synonymDifference: "sweet vs sugary: sugary は砂糖が多いことを強調。", englishDefinition: "Having a taste like sugar; also kind or pleasant.", etymology: "味覚語彙の基礎語。" }],
  // sour (10397)
  [10397, { coreImage: "酸っぱい味を示す味覚形容がコアイメージ。", usage: "「sour lemon」「taste sour」で使う。", synonymDifference: "sour vs bitter: sour は酸味、bitter は苦味。", englishDefinition: "Having an acid taste.", etymology: "味覚語彙の基礎語。" }],
  // bitter (10398)
  [10398, { coreImage: "苦い味、または苦々しい感情を示す語がコアイメージ。", usage: "味覚義を初級で優先して学ぶ。", synonymDifference: "bitter vs sour: bitter は苦味、sour は酸味。", englishDefinition: "Having a sharp, unpleasant taste.", etymology: "味覚語彙の基礎語。" }],
  // spicy (10399)
  [10399, { coreImage: "香辛料で辛い刺激がある味を示す形容がコアイメージ。", usage: "「spicy food」が定型。", synonymDifference: "spicy vs hot: spicy は香辛料の辛さ、hot は温度/辛さ両義。", englishDefinition: "Having a strong hot flavor from spices.", etymology: "味覚語彙の基礎語。" }],
  // delicious (10400)
  [10400, { coreImage: "食べ物がとてもおいしいという高評価がコアイメージ。", usage: "「This is delicious.」が定型。", synonymDifference: "delicious vs tasty: delicious の方が賞賛度が高い。", englishDefinition: "Very pleasant to taste.", etymology: "味覚評価語彙の基礎語。" }],
  // fresh (10401)
  [10401, { coreImage: "新鮮で古くない状態がコアイメージ。", usage: "食材・空気・情報などに使える。", synonymDifference: "fresh vs new: fresh は鮮度、new は新規性。", englishDefinition: "Recently made or picked; not old.", etymology: "状態形容詞の基礎語。" }],
  // full (10402)
  [10402, { coreImage: "中身がいっぱい、または満腹の状態がコアイメージ。", usage: "容器・時間・お腹など多義で使う。", synonymDifference: "full vs complete: full は充満、complete は完成。", englishDefinition: "Containing as much as possible; not hungry after eating.", etymology: "状態形容詞の基礎語。" }],
  // empty (10403)
  [10403, { coreImage: "中身がなく空っぽの状態がコアイメージ。", usage: "「empty box」「empty room」で使う。", synonymDifference: "empty vs free: empty は中身なし、free は空き/自由。", englishDefinition: "Containing nothing.", etymology: "状態形容詞の基礎語。" }],
  // dry (10404)
  [10404, { coreImage: "水分がなく乾いた状態がコアイメージ。", usage: "天気・衣服・肌などに使える。", synonymDifference: "dry vs thirsty: dry は物の状態、thirsty は人の感覚。", englishDefinition: "Not wet.", etymology: "状態形容詞の基礎語。" }],
  // wet (10405)
  [10405, { coreImage: "水分を含んで濡れている状態がコアイメージ。", usage: "「wet clothes」「wet floor」で使う。", synonymDifference: "wet vs damp: damp はしっとり程度で弱い。", englishDefinition: "Covered or soaked with water.", etymology: "状態形容詞の基礎語。" }],
  // ready (10406)
  [10406, { coreImage: "準備が整ってすぐ行動できる状態がコアイメージ。", usage: "「ready to do」「Are you ready?」が定型。", synonymDifference: "ready vs available: ready は準備完了、available は利用可能。", englishDefinition: "Prepared and able to do something.", etymology: "状態形容詞の基礎語。" }],
  // late (10407)
  [10407, { coreImage: "予定時刻より遅れている状態がコアイメージ。", usage: "「be late for school」で使う。", synonymDifference: "late vs slow: late は時間遅れ、slow は速度。", englishDefinition: "After the expected or usual time.", etymology: "時間形容詞の基礎語。" }],
  // early (10408)
  [10408, { coreImage: "予定時刻より早い、または早い段階の状態がコアイメージ。", usage: "「get up early」「early morning」で使う。", synonymDifference: "early vs fast: early は時刻、fast は速度。", englishDefinition: "Before the usual or expected time.", etymology: "時間形容詞の基礎語。" }],
  // near (10409)
  [10409, { coreImage: "距離が近い位置関係がコアイメージ。", usage: "形容詞/前置詞として「near the station」。", synonymDifference: "near vs next to: next to は隣接、near は近接。", englishDefinition: "Close in distance.", etymology: "位置語彙の基礎語。" }],
  // far (10410)
  [10410, { coreImage: "距離が遠い位置関係がコアイメージ。", usage: "「far from ...」「How far...?」で使う。", synonymDifference: "far vs long: far は距離、long は長さ/時間。", englishDefinition: "At a great distance.", etymology: "位置語彙の基礎語。" }],
  // round (10411)
  [10411, { coreImage: "丸い形状を示す形容がコアイメージ。", usage: "「round table」「a round ball」で使う。", synonymDifference: "round vs circle: round は形容、circle は名詞。", englishDefinition: "Shaped like a circle or ball.", etymology: "形状語彙の基礎語。" }],
  // flat (10412)
  [10412, { coreImage: "平らで起伏が少ない状態がコアイメージ。", usage: "地形・表面・声（flat voice）にも使う。", synonymDifference: "flat vs smooth: flat は平面性、smooth はなめらかさ。", englishDefinition: "Level and even; not raised.", etymology: "形状語彙の基礎語。" }],
  // sharp (10413)
  [10413, { coreImage: "先端や刃が鋭い、または感覚が鋭敏な状態がコアイメージ。", usage: "「sharp knife」「sharp eyes」で使う。", synonymDifference: "sharp vs pointed: sharp は切れ味、pointed は先端形状。", englishDefinition: "Having a fine edge or point.", etymology: "性質語彙の基礎語。" }],
  // thick (10414)
  [10414, { coreImage: "厚み・太さが大きい状態がコアイメージ。", usage: "本・壁・液体濃度にも使える。", synonymDifference: "thick vs fat: thick は物の厚さ、fat は体格。", englishDefinition: "Having a large distance between two sides.", etymology: "形状語彙の基礎語。" }],
  // thin (10415)
  [10415, { coreImage: "厚み・太さが小さい状態がコアイメージ。", usage: "紙・線・体格にも使う。", synonymDifference: "thin vs slim: slim は人に対して前向き評価が多い。", englishDefinition: "Having little thickness or width.", etymology: "形状語彙の基礎語。" }],
  // always (10416)
  [10416, { coreImage: "常に例外なく起こる頻度を示す副詞がコアイメージ。", usage: "頻度副詞の中で最も高い頻度。", synonymDifference: "always vs usually: always は100%、usually はそれ未満。", englishDefinition: "At all times; every time.", etymology: "頻度副詞の基礎語。" }],
  // usually (10417)
  [10417, { coreImage: "たいていの場合そうである高頻度を示す副詞がコアイメージ。", usage: "一般習慣の説明で使う。", synonymDifference: "usually vs often: usually の方が頻度が高いことが多い。", englishDefinition: "In most cases; normally.", etymology: "頻度副詞の基礎語。" }],
  // often (10418)
  [10418, { coreImage: "繰り返しよく起こる頻度を示す副詞がコアイメージ。", usage: "習慣行動の説明で高頻度。", synonymDifference: "often vs sometimes: often の方が頻度が高い。", englishDefinition: "Many times; frequently.", etymology: "頻度副詞の基礎語。" }],
  // sometimes (10419)
  [10419, { coreImage: "時々起こる中程度頻度を示す副詞がコアイメージ。", usage: "習慣の例外や不定期行動に使う。", synonymDifference: "sometimes vs often: sometimes の方が頻度が低い。", englishDefinition: "At times; occasionally.", etymology: "頻度副詞の基礎語。" }],
  // never (10420)
  [10420, { coreImage: "一度も起こらない0%頻度を示す副詞がコアイメージ。", usage: "否定語として文中の not と併用しない。", synonymDifference: "never vs not often: never は0回、not often は低頻度。", englishDefinition: "Not at any time.", etymology: "否定頻度副詞の基礎語。" }],
  // again (10421)
  [10421, { coreImage: "もう一度の反復を示す副詞がコアイメージ。", usage: "「try again」「see you again」で使う。", synonymDifference: "again vs once more: 意味は近く once more はやや丁寧。", englishDefinition: "One more time.", etymology: "反復副詞の基礎語。" }],
  // already (10422)
  [10422, { coreImage: "予想より前にすでに完了した状態を示す副詞がコアイメージ。", usage: "完了表現と相性が高い。", synonymDifference: "already vs yet: already は肯定で先行完了、yet は否定/疑問で未了確認。", englishDefinition: "By this time; earlier than expected.", etymology: "時間副詞の基礎語。" }],
  // still (10423)
  [10423, { coreImage: "以前から続いて今も変わらない継続を示す副詞がコアイメージ。", usage: "「I still live here.」のように使う。", synonymDifference: "still vs yet: still は継続、yet は未了確認。", englishDefinition: "Continuing up to this time.", etymology: "継続副詞の基礎語。" }],
  // just (10424)
  [10424, { coreImage: "ちょうど・ただ・〜したばかり等の限定を示す多義副詞がコアイメージ。", usage: "文脈で「only」「exactly」「recently」の意味を判別。", synonymDifference: "just vs only: only は排他強調、just は時点/程度の軽い限定にも使う。", englishDefinition: "Exactly; only; a short time ago.", etymology: "高頻度多義副詞。" }],
  // really (10425)
  [10425, { coreImage: "本当に、または程度強調を示す副詞がコアイメージ。", usage: "「really good」「Do you really...?」で使う。", synonymDifference: "really vs very: really は真偽確認にも使える。", englishDefinition: "Truly; very.", etymology: "強調副詞の基礎語。" }],
  // maybe (10426)
  [10426, { coreImage: "確信を避けた推量を示す副詞がコアイメージ。", usage: "会話文頭で「Maybe ...」が自然。", synonymDifference: "maybe vs probably: probably の方が可能性が高い。", englishDefinition: "Perhaps; possibly.", etymology: "推量副詞の基礎語。" }],
  // together (10427)
  [10427, { coreImage: "一緒に同じ場所・行動を共有する副詞がコアイメージ。", usage: "「go together」「work together」で使う。", synonymDifference: "together vs with: together は状態副詞、with は前置詞。", englishDefinition: "With each other; in one group.", etymology: "関係副詞の基礎語。" }],
  // outside (10428)
  [10428, { coreImage: "建物や領域の外側を示す副詞がコアイメージ。", usage: "副詞・前置詞・名詞で使える。", synonymDifference: "outside vs out: outside は場所を明示、out は外へ出る動きも含む。", englishDefinition: "On or to the outside.", etymology: "位置副詞の基礎語。" }],
  // inside (10429)
  [10429, { coreImage: "建物や領域の内側を示す副詞がコアイメージ。", usage: "副詞・前置詞・名詞で使える。", synonymDifference: "inside vs in: inside は内側位置をより明示。", englishDefinition: "On or to the inside.", etymology: "位置副詞の基礎語。" }],
  // here (10430)
  [10430, { coreImage: "話し手の近くの場所を指す副詞がコアイメージ。", usage: "「come here」「here is ...」で高頻度。", synonymDifference: "here vs there: here は近い場所、there は離れた場所。", englishDefinition: "In or at this place.", etymology: "指示副詞の基礎語。" }],
  // there (10431)
  [10431, { coreImage: "話し手から離れた場所を指す副詞がコアイメージ。", usage: "「go there」「there is ...」で使う。", synonymDifference: "there vs here: there は遠い場所、here は近い場所。", englishDefinition: "In or at that place.", etymology: "指示副詞の基礎語。" }],
  // everywhere (10432)
  [10432, { coreImage: "あらゆる場所を網羅する副詞がコアイメージ。", usage: "「look everywhere」で全域探索を表せる。", synonymDifference: "everywhere vs anywhere: everywhere は全域、anywhere はどこか/どこでも。", englishDefinition: "In all places.", etymology: "場所副詞の基礎語。" }],
  // enough (10433)
  [10433, { coreImage: "必要量に達して十分である程度を示す語がコアイメージ。", usage: "副詞・形容詞・代名詞で使われる多機能語。", synonymDifference: "enough vs too: enough は十分、too は過剰。", englishDefinition: "As much as needed.", etymology: "程度語彙の基礎語。" }],
  // almost (10434)
  [10434, { coreImage: "完全には達していないが近い状態を示す副詞がコアイメージ。", usage: "数値・時間・完了度の近接表現で使う。", synonymDifference: "almost vs nearly: ほぼ同義で置換可能な場面が多い。", englishDefinition: "Nearly; not quite.", etymology: "程度副詞の基礎語。" }],
  // also (10435)
  [10435, { coreImage: "追加情報として「〜もまた」を示す副詞がコアイメージ。", usage: "文中で add の役割を持ち too と使い分ける。", synonymDifference: "also vs too: also は文中、too は文末で使われやすい。", englishDefinition: "In addition; too.", etymology: "接続副詞の基礎語。" }],
  // soccer (10436)
  [10436, { coreImage: "足でボールを扱う競技サッカーを指す名詞がコアイメージ。", usage: "不可算寄りで play soccer が定型。", synonymDifference: "soccer vs football: 地域で指す競技が異なる場合がある。", englishDefinition: "A sport where players kick a ball to score goals.", etymology: "スポーツ語彙の基礎語。" }],
  // baseball (10437)
  [10437, { coreImage: "バットとボールで得点する野球競技がコアイメージ。", usage: "play baseball が基本。", synonymDifference: "baseball vs softball: ルールやボールが異なる関連競技。", englishDefinition: "A sport played with bat, ball, and bases.", etymology: "スポーツ語彙の基礎語。" }],
  // basketball (10438)
  [10438, { coreImage: "リングにボールを入れて得点する競技がコアイメージ。", usage: "play basketball で使う。", synonymDifference: "basketball vs volleyball: ボール扱いと得点法が異なる。", englishDefinition: "A sport where players score by shooting a ball through a hoop.", etymology: "スポーツ語彙の基礎語。" }],
  // tennis (10439)
  [10439, { coreImage: "ラケットでボールを打ち合う競技がコアイメージ。", usage: "play tennis の形で高頻度。", synonymDifference: "tennis vs table tennis: 後者は卓球で別競技。", englishDefinition: "A sport played by hitting a ball over a net.", etymology: "スポーツ語彙の基礎語。" }],
  // volleyball (10440)
  [10440, { coreImage: "ネット越しにボールを打ち合う競技がコアイメージ。", usage: "play volleyball で使う。", synonymDifference: "volleyball vs basketball: 得点方法・用具が異なる。", englishDefinition: "A sport where teams hit a ball over a net.", etymology: "スポーツ語彙の基礎語。" }],
  // race (10441)
  [10441, { coreImage: "速さを競う競走・レースがコアイメージ。", usage: "「win a race」「car race」で使う。", synonymDifference: "race vs game: race は速さ競争、game は遊戯・試合全般。", englishDefinition: "A competition to see who is fastest.", etymology: "競技語彙の基礎語。" }],
  // team (10442)
  [10442, { coreImage: "共通目的で協力するチーム集団がコアイメージ。", usage: "「team members」「our team」で使う。", synonymDifference: "team vs group: team は協働目的が明確。", englishDefinition: "A group of people working or playing together.", etymology: "協働語彙の基礎語。" }],
  // practice (10443)
  [10443, { coreImage: "上達のための反復練習がコアイメージ。", usage: "名詞として「soccer practice」で使う。", synonymDifference: "practice vs game: practice は練習、game は本番試合。", englishDefinition: "Repeated exercise to improve skill.", etymology: "学習・競技語彙の基礎語。" }],
  // contest (10444)
  [10444, { coreImage: "勝敗・評価を競う大会やコンテストがコアイメージ。", usage: "「speech contest」「math contest」で使う。", synonymDifference: "contest vs competition: 近いが contest はイベント名で使いやすい。", englishDefinition: "A competition where people try to win.", etymology: "競争語彙の基礎語。" }],
  // event (10445)
  [10445, { coreImage: "行事や出来事をまとめて示す名詞がコアイメージ。", usage: "学校行事・特別予定に広く使う。", synonymDifference: "event vs party: party は祝賀会、event はより広い概念。", englishDefinition: "An organized occasion or happening.", etymology: "行事語彙の基礎語。" }],
  // party (10446)
  [10446, { coreImage: "人が集まって祝うパーティーの場がコアイメージ。", usage: "「birthday party」「have a party」で使う。", synonymDifference: "party vs event: party は社交・祝賀色が強い。", englishDefinition: "A social gathering for celebration.", etymology: "行事語彙の基礎語。" }],
  // holiday (10447)
  [10447, { coreImage: "祝日や休みの日を示す名詞がコアイメージ。", usage: "英米で vacation との使い分けに差がある。", synonymDifference: "holiday vs vacation: holiday は祝日/休暇日、vacation はまとまった休暇。", englishDefinition: "A day of celebration or time off.", etymology: "時間語彙の基礎語。" }],
  // vacation (10448)
  [10448, { coreImage: "まとまった休暇期間を示す名詞がコアイメージ。", usage: "「summer vacation」で頻出。", synonymDifference: "vacation vs holiday: vacation は期間、holiday は日単位も含む。", englishDefinition: "A period of time spent away from work or school.", etymology: "時間語彙の基礎語。" }],
  // birthday (10449)
  [10449, { coreImage: "生まれた日を祝う誕生日概念がコアイメージ。", usage: "「happy birthday」「birthday party」で使う。", synonymDifference: "birthday vs anniversary: anniversary は記念日一般。", englishDefinition: "The day each year on which someone was born.", etymology: "生活行事語彙の基礎語。" }],
  // weekend (10450)
  [10450, { coreImage: "週の終わりの休日期間を示す名詞がコアイメージ。", usage: "「on the weekend」「this weekend」で使う。", synonymDifference: "weekend vs weekday: weekend は週末、weekday は平日。", englishDefinition: "Saturday and Sunday.", etymology: "時間語彙の基礎語。" }],
  // trip (10451)
  [10451, { coreImage: "比較的短い旅行・移動を示す名詞がコアイメージ。", usage: "「school trip」「take a trip」で使う。", synonymDifference: "trip vs travel: trip は名詞で具体的な旅行、travel は行為全般。", englishDefinition: "A journey, especially for pleasure.", etymology: "移動語彙の基礎語。" }],
  // idea (10452)
  [10452, { coreImage: "頭に浮かぶ考え・着想を示す名詞がコアイメージ。", usage: "「good idea」「I have an idea.」で使う。", synonymDifference: "idea vs thought: thought は思考過程・考え全般。", englishDefinition: "A thought or suggestion.", etymology: "思考語彙の基礎語。" }],
  // problem (10453)
  [10453, { coreImage: "解決が必要な問題・困りごとがコアイメージ。", usage: "「solve a problem」「no problem」で使う。", synonymDifference: "problem vs question: problem は課題、question は質問。", englishDefinition: "A difficulty that needs a solution.", etymology: "課題語彙の基礎語。" }],
  // story (10454)
  [10454, { coreImage: "出来事を語る物語・話がコアイメージ。", usage: "「read a story」「tell a story」で使う。", synonymDifference: "story vs history: story は物語、history は歴史。", englishDefinition: "A description of events, real or imaginary.", etymology: "表現語彙の基礎語。" }],
  // news (10455)
  [10455, { coreImage: "新しい知らせ・報道情報を示す名詞がコアイメージ。", usage: "通常不可算で「some news」「the news」。", synonymDifference: "news vs information: news は新規性、information は情報一般。", englishDefinition: "Information about recent events.", etymology: "情報語彙の基礎語。" }],
  // thing (10456)
  [10456, { coreImage: "具体物や事柄を広く指せる汎用名詞がコアイメージ。", usage: "語が出ない時の代用にもなる高頻度語。", synonymDifference: "thing vs object: object は物体に限定されやすい。", englishDefinition: "An object, event, or matter.", etymology: "最重要汎用名詞。" }],
  // place (10457)
  [10457, { coreImage: "場所・空間を示す汎用名詞がコアイメージ。", usage: "「this place」「a good place to ...」で使う。", synonymDifference: "place vs location: location の方が位置情報として形式的。", englishDefinition: "A particular position or area.", etymology: "位置語彙の基礎語。" }],
  // way (10458)
  [10458, { coreImage: "道、または方法を示す多義名詞がコアイメージ。", usage: "「the way to school」「a way to do」で使う。", synonymDifference: "way vs road: way は方法義も持つ。", englishDefinition: "A route; also a method.", etymology: "高頻度多義名詞。" }],
  // part (10459)
  [10459, { coreImage: "全体の一部、または役割を示す名詞がコアイメージ。", usage: "「part of ...」「play a part」で使う。", synonymDifference: "part vs piece: piece は分割片、part は機能的部分にも使う。", englishDefinition: "A section of a whole; a role.", etymology: "構成語彙の基礎語。" }],
  // example (10460)
  [10460, { coreImage: "理解のために示す具体例がコアイメージ。", usage: "「for example」「an example of ...」で頻出。", synonymDifference: "example vs sample: sample は見本物体の意味が強い。", englishDefinition: "A specific case used to explain something.", etymology: "説明語彙の基礎語。" }],
  // life (10461)
  [10461, { coreImage: "人生や生活全体を示す名詞がコアイメージ。", usage: "「my life」「school life」で使う。", synonymDifference: "life vs living: life は名詞中心、living は生活様式にも使う。", englishDefinition: "A person's existence and way of living.", etymology: "抽象基礎語彙。" }],
  // dream (10462)
  [10462, { coreImage: "睡眠中の夢、または将来の夢を示す名詞がコアイメージ。", usage: "文脈で睡眠義と目標義を判別。", synonymDifference: "dream vs goal: dream は願望、goal は具体目標。", englishDefinition: "A series of images during sleep; also a strong wish.", etymology: "抽象語彙の基礎語。" }],
  // future (10463)
  [10463, { coreImage: "これから先の時間・将来を示す名詞がコアイメージ。", usage: "「in the future」「future plan」で使う。", synonymDifference: "future vs tomorrow: future は広い将来、tomorrow は明日。", englishDefinition: "The time that is to come.", etymology: "時間概念語彙の基礎語。" }],
  // plan (10464)
  [10464, { coreImage: "事前に決める計画・予定がコアイメージ。", usage: "名詞/動詞の両用があるが初級では名詞中心。", synonymDifference: "plan vs schedule: plan は計画内容、schedule は時刻表。", englishDefinition: "A set of intended actions for the future.", etymology: "計画語彙の基礎語。" }],
  // job (10465)
  [10465, { coreImage: "仕事・職業としての役割を示す名詞がコアイメージ。", usage: "「have a job」「good job（よくやった）」で多用。", synonymDifference: "job vs work: job は職務単位、work は労働全般。", englishDefinition: "A person's regular work or task.", etymology: "職業語彙の基礎語。" }],
  // doctor (10466)
  [10466, { coreImage: "診療を行う医者という職業名がコアイメージ。", usage: "「see a doctor」が定型。", synonymDifference: "doctor vs nurse: doctor は診断治療、nurse は看護。", englishDefinition: "A person qualified to treat illness.", etymology: "職業語彙の基礎語。" }],
  // nurse (10467)
  [10467, { coreImage: "患者を看護する看護師職がコアイメージ。", usage: "「a nurse in a hospital」で使う。", synonymDifference: "nurse vs doctor: nurse は看護中心、doctor は診断治療中心。", englishDefinition: "A healthcare professional who cares for patients.", etymology: "職業語彙の基礎語。" }],
  // pilot (10468)
  [10468, { coreImage: "飛行機を操縦する職業人を示す名詞がコアイメージ。", usage: "「an airline pilot」で使う。", synonymDifference: "pilot vs driver: pilot は航空機、driver は車両。", englishDefinition: "A person who flies an aircraft.", etymology: "職業語彙の基礎語。" }],
  // police (10469)
  [10469, { coreImage: "治安を守る警察組織・警察官集合を示す名詞がコアイメージ。", usage: "通常集合名詞として使う。", synonymDifference: "police vs officer: officer は個々の警察官。", englishDefinition: "The organization responsible for law and order.", etymology: "公共職務語彙の基礎語。" }],
  // king (10470)
  [10470, { coreImage: "王国の男性君主を示す名詞がコアイメージ。", usage: "歴史・物語文脈で頻出。", synonymDifference: "king vs prince: king は君主、prince は王子。", englishDefinition: "A male ruler of a country.", etymology: "人物語彙の基礎語。" }],
  // queen (10471)
  [10471, { coreImage: "女王という女性君主を示す名詞がコアイメージ。", usage: "king と対で覚える。", synonymDifference: "queen vs princess: queen は君主、princess は王女。", englishDefinition: "A female ruler of a country.", etymology: "人物語彙の基礎語。" }],
  // princess (10472)
  [10472, { coreImage: "王女・お姫様を示す名詞がコアイメージ。", usage: "物語語彙として子ども向け文脈で高頻度。", synonymDifference: "princess vs queen: princess は王女、queen は女王。", englishDefinition: "A daughter of a king or queen.", etymology: "人物語彙の基礎語。" }],
  // hero (10473)
  [10473, { coreImage: "勇敢な行動で称賛される人物像がコアイメージ。", usage: "物語・スポーツ文脈でも使う。", synonymDifference: "hero vs star: hero は行為評価、star は人気評価。", englishDefinition: "A person admired for bravery or great deeds.", etymology: "人物評価語彙の基礎語。" }],
  // math (10474)
  [10474, { coreImage: "数学という教科・学問領域がコアイメージ。", usage: "米語 math / 英語 maths の差がある。", synonymDifference: "math vs science: 教科分野が異なる。", englishDefinition: "The study of numbers, shapes, and patterns.", etymology: "教科語彙の基礎語。" }],
  // science (10475)
  [10475, { coreImage: "自然現象を扱う理科・科学領域がコアイメージ。", usage: "学校教科と学問分野の両方で使う。", synonymDifference: "science vs art: 分野が異なる学習領域。", englishDefinition: "The study of the natural world.", etymology: "教科語彙の基礎語。" }],
  // history (10476)
  [10476, { coreImage: "過去の出来事の連なりを示す歴史がコアイメージ。", usage: "教科名としても一般名詞としても使う。", synonymDifference: "history vs story: history は事実の過去、story は物語。", englishDefinition: "The study or record of past events.", etymology: "教科語彙の基礎語。" }],
  // art (10477)
  [10477, { coreImage: "美術・芸術表現全般を示す名詞がコアイメージ。", usage: "「art class」「modern art」で使う。", synonymDifference: "art vs craft: art は芸術表現、craft は手工芸技能。", englishDefinition: "Creative expression such as painting and sculpture.", etymology: "教科・文化語彙の基礎語。" }],
  // subject (10478)
  [10478, { coreImage: "学校で学ぶ科目、または話題対象を示す多義名詞がコアイメージ。", usage: "初級では教科義を優先して学ぶ。", synonymDifference: "subject vs topic: topic は話題、subject は教科義も強い。", englishDefinition: "A topic of study in school; also a topic.", etymology: "学習語彙の基礎多義語。" }],
  // homework (10479)
  [10479, { coreImage: "家で行う課題としての宿題がコアイメージ。", usage: "通常不可算で do homework が定型。", synonymDifference: "homework vs housework: homework は学習課題、housework は家事。", englishDefinition: "School work to be done at home.", etymology: "学習語彙の基礎語。" }],
  // language (10480)
  [10480, { coreImage: "言語システムや言葉を示す名詞がコアイメージ。", usage: "「English language」「body language」で使う。", synonymDifference: "language vs word: language は体系、word は単語。", englishDefinition: "A system of communication using words.", etymology: "言語語彙の基礎語。" }],
  // word (10481)
  [10481, { coreImage: "意味を持つ最小単位としての単語がコアイメージ。", usage: "「new word」「in other words」で使う。", synonymDifference: "word vs sentence: word は単語、sentence は文。", englishDefinition: "A single unit of language with meaning.", etymology: "言語語彙の基礎語。" }],
  // voice (10482)
  [10482, { coreImage: "人が発する声そのものを示す名詞がコアイメージ。", usage: "「loud voice」「voice message」で使う。", synonymDifference: "voice vs sound: voice は人の声、sound は音一般。", englishDefinition: "The sound made when a person speaks or sings.", etymology: "音声語彙の基礎語。" }],
  // sound (10483)
  [10483, { coreImage: "耳に届く音全般を示す名詞がコアイメージ。", usage: "名詞/動詞の両用だが初級は名詞中心。", synonymDifference: "sound vs noise: sound は中立、noise は騒音寄り。", englishDefinition: "Something you hear.", etymology: "聴覚語彙の基礎語。" }],
  // chance (10485)
  [10485, { coreImage: "機会、または可能性を示す名詞がコアイメージ。", usage: "「a chance to do」「by chance」で使う。", synonymDifference: "chance vs opportunity: opportunity の方が計画的好機の響き。", englishDefinition: "An opportunity or possibility.", etymology: "抽象語彙の基礎語。" }],
  // today (11591)
  [11591, { coreImage: "現在の日を指す時間名詞/副詞がコアイメージ。", usage: "名詞・副詞の両用（Today is ... / I go today）。", synonymDifference: "today vs now: today は日単位、now は時点。", englishDefinition: "The present day.", etymology: "時間語彙の基礎語。" }],
  // yesterday (11592)
  [11592, { coreImage: "今日の前の日を示す時間語がコアイメージ。", usage: "過去時制文で頻出。", synonymDifference: "yesterday vs last night: yesterday は日全体、last night は昨夜。", englishDefinition: "The day before today.", etymology: "時間語彙の基礎語。" }],
  // tomorrow (11593)
  [11593, { coreImage: "今日の次の日を示す時間語がコアイメージ。", usage: "未来予定表現で頻出。", synonymDifference: "tomorrow vs next day: tomorrow は話し手基準の翌日。", englishDefinition: "The day after today.", etymology: "時間語彙の基礎語。" }],
  // week (11594)
  [11594, { coreImage: "7日間の時間単位を示す名詞がコアイメージ。", usage: "「this week」「next week」で高頻度。", synonymDifference: "week vs weekend: week は7日、weekend は週末。", englishDefinition: "A period of seven days.", etymology: "時間単位語彙の基礎語。" }],
  // month (11595)
  [11595, { coreImage: "約1か月の時間単位を示す名詞がコアイメージ。", usage: "「last month」「every month」で使う。", synonymDifference: "month vs year: month は12分の1年。", englishDefinition: "One of the twelve parts of a year.", etymology: "時間単位語彙の基礎語。" }],
  // color (11596)
  [11596, { coreImage: "色という視覚的属性を示す名詞がコアイメージ。", usage: "米語 color / 英語 colour の綴り差がある。", synonymDifference: "color vs shade: shade は色調の細かな差。", englishDefinition: "The appearance of things caused by reflected light.", etymology: "視覚語彙の基礎語。" }],
  // number (11597)
  [11597, { coreImage: "数や番号を示す名詞がコアイメージ。", usage: "「phone number」「a large number of ...」で使う。", synonymDifference: "number vs amount: number は可算、amount は不可算量。", englishDefinition: "A figure showing quantity or order.", etymology: "数概念語彙の基礎語。" }],
  // weather (11598)
  [11598, { coreImage: "その時々の天気状態を示す名詞がコアイメージ。", usage: "通常不可算で「nice weather」。", synonymDifference: "weather vs climate: weather は短期、climate は長期傾向。", englishDefinition: "The condition of the atmosphere at a time.", etymology: "天候語彙の基礎語。" }],
  // rain (11599)
  [11599, { coreImage: "雨（名詞）と雨が降る（動詞）の核義がコアイメージ。", usage: "名詞「heavy rain」、動詞「It rains.」で使う。", synonymDifference: "rain vs snow: 降るものが液体か氷結晶かで異なる。", englishDefinition: "Water drops falling from clouds; to fall as rain.", etymology: "天候語彙の基礎多義語。" }],
  // sunny (11600)
  [11600, { coreImage: "日差しが出て晴れている状態がコアイメージ。", usage: "「sunny day」「It is sunny.」で使う。", synonymDifference: "sunny vs bright: sunny は天気、bright は明るさ全般。", englishDefinition: "Bright with sunshine.", etymology: "sun + -y の形容化。" }],
  // study (11601)
  [11601, { coreImage: "学習して知識を得る行為がコアイメージ。", usage: "「study English」「study for a test」で使う。", synonymDifference: "study vs learn: study は行為、learn は習得結果。", englishDefinition: "To spend time learning.", etymology: "学習動詞の基礎語。" }],
  // answer (11602)
  [11602, { coreImage: "答え（名詞）と答える（動詞）の授受がコアイメージ。", usage: "「answer a question」「the right answer」で使う。", synonymDifference: "answer vs reply: reply は応答一般、answer は質問への答えが中心。", englishDefinition: "A response; to respond to a question.", etymology: "会話語彙の基礎多義語。" }],
  // question (11603)
  [11603, { coreImage: "知りたい内容を問う質問がコアイメージ。", usage: "「ask a question」が定型。", synonymDifference: "question vs problem: question は問い、problem は課題。", englishDefinition: "A sentence asking for information.", etymology: "会話語彙の基礎語。" }],
  // sport (11604)
  [11604, { coreImage: "身体活動を伴う競技全般を示す名詞がコアイメージ。", usage: "不可算的に「play sport(s)」で使う。", synonymDifference: "sport vs game: sport は競技分野、game は個別試合。", englishDefinition: "Physical activity done for fun or competition.", etymology: "競技語彙の基礎語。" }],
  // large (11605)
  [11605, { coreImage: "大きいサイズをやや形式的に示す形容がコアイメージ。", usage: "big のフォーマル寄り同義として使う。", synonymDifference: "large vs big: 意味は近く large がやや形式的。", englishDefinition: "Big in size or amount.", etymology: "サイズ形容詞の基礎語。" }],
  // afternoon (11606)
  [11606, { coreImage: "昼から夕方までの午後時間帯がコアイメージ。", usage: "「in the afternoon」「Good afternoon」で使う。", synonymDifference: "afternoon vs evening: afternoon は昼後、evening は日没前後。", englishDefinition: "The part of the day after noon.", etymology: "時間語彙の基礎語。" }],
  // evening (11607)
  [11607, { coreImage: "夕方から夜前までの時間帯がコアイメージ。", usage: "「in the evening」「good evening」で使う。", synonymDifference: "evening vs night: evening は夜の早い時間帯。", englishDefinition: "The period from late afternoon to night.", etymology: "時間語彙の基礎語。" }],
  // bedroom (11608)
  [11608, { coreImage: "寝るための部屋（寝室）を示す名詞がコアイメージ。", usage: "「my bedroom」「bedroom door」で使う。", synonymDifference: "bedroom vs living room: 用途が異なる部屋名。", englishDefinition: "A room used for sleeping.", etymology: "bed + room の合成語。" }],
  // market (11609)
  [11609, { coreImage: "市場や販売の場を示す名詞がコアイメージ。", usage: "「supermarket」「local market」で使う。", synonymDifference: "market vs store: market は市場概念、store は個店。", englishDefinition: "A place where goods are bought and sold.", etymology: "買い物語彙の基礎語。" }],
  // wallet (11610)
  [11610, { coreImage: "お金やカードを入れる財布がコアイメージ。", usage: "可算で「a wallet」「my wallet」。", synonymDifference: "wallet vs purse: 地域で使い分けが異なる場合がある。", englishDefinition: "A small case for money and cards.", etymology: "日用品語彙の基礎語。" }],
  // borrowed (11611)
  [11611, { coreImage: "借りた状態を示す過去分詞形容がコアイメージ。", usage: "「a borrowed book」で受動状態を示す。", synonymDifference: "borrowed vs lent: borrowed は借りた側、lent は貸した側。", englishDefinition: "Taken temporarily from someone else.", etymology: "borrow の過去分詞形容。" }],
  // carefully (11612)
  [11612, { coreImage: "注意深く丁寧に行う様子を示す副詞がコアイメージ。", usage: "「read carefully」「drive carefully」で使う。", synonymDifference: "carefully vs slowly: carefully は注意性、slowly は速度。", englishDefinition: "In a cautious and attentive way.", etymology: "careful + -ly。" }],
  // village (11613)
  [11613, { coreImage: "小規模な集落としての村がコアイメージ。", usage: "「small village」「village life」で使う。", synonymDifference: "village vs town: village の方が一般に小さい。", englishDefinition: "A small community in the countryside.", etymology: "地理語彙の基礎語。" }],
  // cleaner (11614)
  [11614, { coreImage: "clean の比較級として「よりきれいな」状態がコアイメージ。", usage: "A is cleaner than B の比較で使う。", synonymDifference: "cleaner vs cleanest: cleaner は2者比較、cleanest は最上級。", englishDefinition: "More clean.", etymology: "clean の比較級。" }],
  // warmer (11615)
  [11615, { coreImage: "warm の比較級として「より暖かい」状態がコアイメージ。", usage: "warmer than で比較表現に使う。", synonymDifference: "warmer vs warmest: warmer は比較級、warmest は最上級。", englishDefinition: "More warm.", etymology: "warm の比較級。" }],
  // phone (11616)
  [11616, { coreImage: "電話機、または電話する行為を示す語がコアイメージ。", usage: "名詞「my phone」、動詞「phone me」で使える。", synonymDifference: "phone vs telephone: phone は短縮で口語的。", englishDefinition: "A device for calling; also to call someone.", etymology: "telephone の短縮形。" }],
  // pocket (11617)
  [11617, { coreImage: "服についた小さな収納部ポケットがコアイメージ。", usage: "「in my pocket」「pocket money」で使う。", synonymDifference: "pocket vs bag: pocket は衣服一体、bag は独立容器。", englishDefinition: "A small sewn-in pouch in clothing.", etymology: "衣服語彙の基礎語。" }],
  // soon (11618)
  [11618, { coreImage: "遠くない未来にすぐ起こる時期を示す副詞がコアイメージ。", usage: "「see you soon」「come soon」で使う。", synonymDifference: "soon vs early: soon は近未来、early は基準より早い。", englishDefinition: "In a short time from now.", etymology: "時間副詞の基礎語。" }],
  // transport (11619)
  [11619, { coreImage: "運ぶ行為（動詞）や輸送手段（名詞）を示す語がコアイメージ。", usage: "初級では動詞「transport goods」を中心に学ぶ。", synonymDifference: "transport vs carry: transport は体系的輸送、carry は手で運ぶ動作。", englishDefinition: "To move people or goods from one place to another.", etymology: "移送語彙の基礎多義語。" }],
  // radio (11620)
  [11620, { coreImage: "ラジオ機器、または放送媒体を示す名詞がコアイメージ。", usage: "「listen to the radio」「radio station」で使う。", synonymDifference: "radio vs TV: 媒体が音声中心か映像中心かで異なる。", englishDefinition: "A device or system for receiving audio broadcasts.", etymology: "メディア語彙の基礎語。" }],
  // bench (11621)
  [11621, { coreImage: "複数人が座れる長椅子を示す名詞がコアイメージ。", usage: "「sit on a bench」で使う。", synonymDifference: "bench vs chair: bench は長椅子、chair は一人用椅子。", englishDefinition: "A long seat for several people.", etymology: "家具語彙の基礎語。" }],
  // care (11622)
  [11622, { coreImage: "気にかける・世話する行為を示す動詞がコアイメージ。", usage: "「care about ...」「take care of ...」で使う。", synonymDifference: "care vs mind: care は関心・配慮、mind は気にする/嫌がる文脈が多い。", englishDefinition: "To be concerned about; to look after.", etymology: "感情・配慮動詞の基礎語。" }],
  // apron (11623)
  [11623, { coreImage: "衣服の前面を守るエプロンがコアイメージ。", usage: "「wear an apron while cooking」で使う。", synonymDifference: "apron vs coat: apron は保護用前掛け。", englishDefinition: "A protective garment worn over clothes.", etymology: "生活語彙の基礎語。" }],
  // bucket (11624)
  [11624, { coreImage: "液体や物を入れる取っ手付き容器がコアイメージ。", usage: "可算で「a bucket of water」。", synonymDifference: "bucket vs bottle: bucket は開口が大きい容器。", englishDefinition: "A round open container with a handle.", etymology: "日用品語彙の基礎語。" }],
  // carpet (11625)
  [11625, { coreImage: "床に敷くじゅうたんを示す名詞がコアイメージ。", usage: "「on the carpet」「carpet floor」で使う。", synonymDifference: "carpet vs rug: rug は可搬の小型敷物が多い。", englishDefinition: "A thick floor covering made of fabric.", etymology: "住居語彙の基礎語。" }],
  // closet (11626)
  [11626, { coreImage: "衣類等を収納するクローゼット空間がコアイメージ。", usage: "米語で closet、英語で wardrobe も用いる。", synonymDifference: "closet vs cupboard: closet は主に衣類収納、cupboard は食器棚。", englishDefinition: "A small storage space for clothes or items.", etymology: "住居語彙の基礎語。" }],
  // dollar (11627)
  [11627, { coreImage: "ドルという通貨単位を示す名詞がコアイメージ。", usage: "数値とともに「ten dollars」で使う。", synonymDifference: "dollar vs cent: dollar は主単位、cent は補助単位。", englishDefinition: "A unit of money used in several countries.", etymology: "通貨語彙の基礎語。" }],
  // drawer (11628)
  [11628, { coreImage: "机や家具の引き出し部分を示す名詞がコアイメージ。", usage: "「open the drawer」で使う。", synonymDifference: "drawer vs shelf: drawer は引き出す収納、shelf は棚板。", englishDefinition: "A sliding box-like storage part in furniture.", etymology: "家具語彙の基礎語。" }],
  // garage (11629)
  [11629, { coreImage: "車を入れるガレージ空間がコアイメージ。", usage: "「park in the garage」で使う。", synonymDifference: "garage vs parking lot: garage は建物内保管、parking lot は駐車場。", englishDefinition: "A building or space for keeping a car.", etymology: "住居語彙の基礎語。" }],
  // glove (11630)
  [11630, { coreImage: "手にはめる手袋を示す名詞がコアイメージ。", usage: "通常複数で gloves を使うことが多い。", synonymDifference: "glove vs mitten: mitten は指をまとめる手袋。", englishDefinition: "A covering for the hand.", etymology: "衣類語彙の基礎語。" }],
  // hammer (11631)
  [11631, { coreImage: "打つための工具かなづちを示す名詞がコアイメージ。", usage: "「use a hammer」で使う。", synonymDifference: "hammer vs mallet: mallet は木槌で用途が異なる。", englishDefinition: "A tool used for hitting nails.", etymology: "工具語彙の基礎語。" }],
  // jar (11632)
  [11632, { coreImage: "口の広いびん容器を示す名詞がコアイメージ。", usage: "「a jar of jam」で使う。", synonymDifference: "jar vs bottle: jar は広口、bottle は細口。", englishDefinition: "A wide-mouthed container, usually made of glass.", etymology: "容器語彙の基礎語。" }],
  // keychain (11633)
  [11633, { coreImage: "鍵をまとめるキーホルダーを示す名詞がコアイメージ。", usage: "「put keys on a keychain」で使う。", synonymDifference: "keychain vs key ring: ほぼ同義。", englishDefinition: "A ring or holder for keys.", etymology: "key + chain の合成語。" }],
  // lamp (11634)
  [11634, { coreImage: "明かりを照らすランプを示す名詞がコアイメージ。", usage: "「desk lamp」「turn on the lamp」で使う。", synonymDifference: "lamp vs light: lamp は器具、light は光そのものも指す。", englishDefinition: "A device that gives light.", etymology: "照明語彙の基礎語。" }],
  // magnet (11635)
  [11635, { coreImage: "鉄などを引きつける磁石がコアイメージ。", usage: "科学学習や日用品文脈で使う。", synonymDifference: "magnet vs metal: magnet は磁性機能を持つ物。", englishDefinition: "An object that attracts iron and some metals.", etymology: "科学語彙の基礎語。" }],
  // napkin (11636)
  [11636, { coreImage: "食事時に口や手を拭くナプキンがコアイメージ。", usage: "cloth napkin / paper napkin で区別可能。", synonymDifference: "napkin vs towel: napkin は食事用、towel は汎用拭き取り。", englishDefinition: "A piece of cloth or paper used at meals.", etymology: "食事語彙の基礎語。" }],
  // oven (11637)
  [11637, { coreImage: "食べ物を焼くオーブン加熱器具がコアイメージ。", usage: "「bake in the oven」で使う。", synonymDifference: "oven vs microwave: 加熱方式と用途が異なる。", englishDefinition: "A closed appliance for baking or roasting.", etymology: "調理語彙の基礎語。" }],
  // paddle (11638)
  [11638, { coreImage: "水をこぐ・打つためのパドル道具がコアイメージ。", usage: "スポーツや舟遊びで使う語。", synonymDifference: "paddle vs oar: oar は船をこぐ長いオールで用途がやや異なる。", englishDefinition: "A short oar used for rowing or paddling.", etymology: "道具語彙の基礎語。" }],
  // quilt (11639)
  [11639, { coreImage: "中綿入りの掛け布・キルトを示す名詞がコアイメージ。", usage: "寝具文脈で使う。", synonymDifference: "quilt vs blanket: quilt は中綿縫製、blanket は毛布全般。", englishDefinition: "A warm bed covering made of stitched layers.", etymology: "生活語彙の基礎語。" }],
  // receipt (11640)
  [11640, { coreImage: "支払いの証明として渡されるレシートがコアイメージ。", usage: "「keep the receipt」が実用表現。", synonymDifference: "receipt vs bill: bill は請求、receipt は支払済み証明。", englishDefinition: "A paper showing that payment was made.", etymology: "買い物語彙の基礎語。" }],
  // shelf (11641)
  [11641, { coreImage: "物を置く棚板を示す名詞がコアイメージ。", usage: "可算で「a shelf」「bookshelf」。", synonymDifference: "shelf vs drawer: shelf は開放収納、drawer は引き出し収納。", englishDefinition: "A flat board for holding things.", etymology: "家具語彙の基礎語。" }],
  // tablet (11642)
  [11642, { coreImage: "タブレット端末を示す名詞がコアイメージ。", usage: "「use a tablet for study」で使う。", synonymDifference: "tablet vs laptop: 形状・入力方式が異なる。", englishDefinition: "A small touchscreen computer.", etymology: "技術語彙の基礎語。" }],
  // utensil (11643)
  [11643, { coreImage: "調理・食事に使う器具の総称がコアイメージ。", usage: "fork/spoon などの集合名として使える。", synonymDifference: "utensil vs tool: utensil は主に台所・食事用途。", englishDefinition: "A tool used in cooking or eating.", etymology: "台所語彙の基礎語。" }],
  // vase (11644)
  [11644, { coreImage: "花を生ける花瓶を示す名詞がコアイメージ。", usage: "「a vase of flowers」で使う。", synonymDifference: "vase vs pot: vase は観賞花用、pot は調理・栽培容器にも使う。", englishDefinition: "A decorative container for flowers.", etymology: "生活語彙の基礎語。" }],
  // whistle (11645)
  [11645, { coreImage: "笛、または笛を吹く行為を示す語がコアイメージ。", usage: "名詞/動詞の両用がある。", synonymDifference: "whistle vs bell: whistle は吹く音、bell は打鐘音。", englishDefinition: "A small instrument that makes a high sound; to make that sound.", etymology: "音具語彙の基礎多義語。" }],
  // yard (11646)
  [11646, { coreImage: "家の周囲の庭・敷地を示す名詞がコアイメージ。", usage: "米語で庭の意味が一般的。", synonymDifference: "yard vs garden: yard は敷地全般、garden は栽培要素が強い。", englishDefinition: "The area around a house.", etymology: "住居語彙の基礎語。" }],
  // zipper (11647)
  [11647, { coreImage: "衣類や袋を開閉するファスナー部品がコアイメージ。", usage: "「zipper on my bag」で使う。", synonymDifference: "zipper vs button: いずれも留め具だが方式が異なる。", englishDefinition: "A fastening device with interlocking teeth.", etymology: "衣類語彙の基礎語。" }],
  // tidy (11648)
  [11648, { coreImage: "片づけて整頓する行為/整った状態がコアイメージ。", usage: "動詞「tidy the room」、形容詞用法もある。", synonymDifference: "tidy vs clean: tidy は整頓、clean は汚れ除去。", englishDefinition: "To make neat and organized.", etymology: "生活動詞の基礎語。" }],
  // wander (11649)
  [11649, { coreImage: "目的なく歩き回る移動行為がコアイメージ。", usage: "「wander around the park」で使う。", synonymDifference: "wander vs walk: wander はあてもなく歩く含意。", englishDefinition: "To walk around without a clear direction.", etymology: "移動動詞の基礎語。" }],
  // hallway (11651)
  [11651, { coreImage: "部屋と部屋をつなぐ廊下空間がコアイメージ。", usage: "「in the hallway」で使う。", synonymDifference: "hallway vs corridor: ほぼ同義で corridor がやや形式的。", englishDefinition: "A passage inside a building.", etymology: "住居語彙の基礎語。" }],
  // lunchbox (11652)
  [11652, { coreImage: "弁当を入れて持ち運ぶ箱がコアイメージ。", usage: "「pack a lunchbox」で使う。", synonymDifference: "lunchbox vs box: lunchbox は用途特化。", englishDefinition: "A container for carrying lunch.", etymology: "lunch + box の合成語。" }],
  // appointment (11654)
  [11654, { coreImage: "特定時刻に会う予約・約束がコアイメージ。", usage: "「make an appointment」が定型。", synonymDifference: "appointment vs reservation: appointment は面会予約、reservation は席や部屋予約。", englishDefinition: "An arrangement to meet at a specific time.", etymology: "ビジネス基礎語彙。" }],
  // employee (11655)
  [11655, { coreImage: "組織に雇われて働く従業員がコアイメージ。", usage: "可算で「an employee」「employees」。", synonymDifference: "employee vs employer: employee は雇われる側、employer は雇う側。", englishDefinition: "A person paid to work for a company.", etymology: "雇用語彙の基礎語。" }],
  // invoice (11656)
  [11656, { coreImage: "支払請求内容を示す請求書がコアイメージ。", usage: "「send an invoice」で使う。", synonymDifference: "invoice vs receipt: invoice は請求、receipt は支払済み証明。", englishDefinition: "A document requesting payment.", etymology: "商務語彙の基礎語。" }],
  // purchase (11657)
  [11657, { coreImage: "購入（名詞）と購入する（動詞）の商取引行為がコアイメージ。", usage: "buy よりややフォーマル。", synonymDifference: "purchase vs buy: purchase の方が文書・業務で使われやすい。", englishDefinition: "To buy; an act of buying.", etymology: "商務語彙の基礎多義語。" }],
  // reservation (11658)
  [11658, { coreImage: "席・部屋などを前もって押さえる予約がコアイメージ。", usage: "「make a reservation」が定型。", synonymDifference: "reservation vs appointment: reservation は資源予約、appointment は面会予約。", englishDefinition: "An arrangement to keep a place or seat.", etymology: "予約語彙の基礎語。" }],
  // schedule (11659)
  [11659, { coreImage: "予定表（名詞）と予定を組む（動詞）の時間管理がコアイメージ。", usage: "名詞中心だが動詞用法も重要。", synonymDifference: "schedule vs plan: schedule は時刻配置、plan は方針全体。", englishDefinition: "A timetable; to arrange a time.", etymology: "時間管理語彙の基礎多義語。" }],
  // attach (11660)
  [11660, { coreImage: "物やファイルを付ける・添付する行為がコアイメージ。", usage: "「attach A to B」「attach a file」で使う。", synonymDifference: "attach vs connect: attach は物理/文書添付、connect は接続関係全般。", englishDefinition: "To fasten or add something to another thing.", etymology: "実務動詞の基礎語。" }],
  // careful (10488)
  [10488, { coreImage: "注意深くミスを避ける姿勢がコアイメージ。", usage: "「be careful」「careful with ...」で使う。", synonymDifference: "careful vs cautious: cautious は危険回避の慎重さが強い。", englishDefinition: "Giving attention to avoid mistakes or danger.", etymology: "care + -ful。" }],
  // decide (10489)
  [10489, { coreImage: "選択肢から最終的に決める判断がコアイメージ。", usage: "「decide to do」「decide on ...」で使う。", synonymDifference: "decide vs choose: decide は最終決定、choose は選択行為。", englishDefinition: "To make a choice after thinking.", etymology: "判断動詞の基礎語。" }],
  // foreign (10491)
  [10491, { coreImage: "自国・自分の環境の外にある外国性がコアイメージ。", usage: "「foreign country」「foreign language」で使う。", synonymDifference: "foreign vs international: foreign は外来性、international は国際間関係。", englishDefinition: "Belonging to another country.", etymology: "比較文化語彙の基礎語。" }],
  // health (10493)
  [10493, { coreImage: "身体や心の健康状態を示す名詞がコアイメージ。", usage: "不可算で「good health」「health problem」。", synonymDifference: "health vs healthy: health は名詞、healthy は形容詞。", englishDefinition: "The condition of being well.", etymology: "体調語彙の基礎語。" }],
  // instead (10494)
  [10494, { coreImage: "別の選択へ置き換える代替関係がコアイメージ。", usage: "「instead of ...」「I stayed home instead.」で使う。", synonymDifference: "instead vs alternatively: alternatively はやや形式的。", englishDefinition: "In place of something else.", etymology: "接続副詞の基礎語。" }],
  // joke (10495)
  [10495, { coreImage: "人を笑わせる冗談内容がコアイメージ。", usage: "名詞「a joke」、動詞「joke about ...」の両用。", synonymDifference: "joke vs lie: joke は冗談、lie は嘘。", englishDefinition: "Something said to make people laugh.", etymology: "会話語彙の基礎語。" }],
  // member (10498)
  [10498, { coreImage: "集団に属する構成員を示す名詞がコアイメージ。", usage: "「team member」「club member」で使う。", synonymDifference: "member vs staff: member は所属者一般、staff は職員集団。", englishDefinition: "A person who belongs to a group.", etymology: "集団語彙の基礎語。" }],
  // notice (10499)
  [10499, { coreImage: "気づく（動詞）と通知（名詞）の両義がコアイメージ。", usage: "初級では動詞「notice + 名詞」を優先。", synonymDifference: "notice vs realize: realize は理解に重心、notice は知覚に重心。", englishDefinition: "To become aware of; an announcement.", etymology: "知覚語彙の多義語。" }],
  // opinion (10500)
  [10500, { coreImage: "個人の考え・意見を示す名詞がコアイメージ。", usage: "「in my opinion」「your opinion」で使う。", synonymDifference: "opinion vs fact: opinion は主観、fact は事実。", englishDefinition: "A personal view or belief.", etymology: "思考語彙の基礎語。" }],
  // quickly (10502)
  [10502, { coreImage: "動作が速く行われる様子を示す副詞がコアイメージ。", usage: "「run quickly」「answer quickly」で使う。", synonymDifference: "quickly vs fast: fast は副詞同形、quickly は標準副詞形。", englishDefinition: "At high speed; rapidly.", etymology: "quick + -ly。" }],
  // receive (10503)
  [10503, { coreImage: "受け取る側として受領する行為がコアイメージ。", usage: "「receive a letter」「receive from ...」で使う。", synonymDifference: "receive vs get: receive はややフォーマル。", englishDefinition: "To be given or sent something.", etymology: "授受動詞の基礎語。" }],
  // solve (10504)
  [10504, { coreImage: "問題を解いて解決する行為がコアイメージ。", usage: "「solve a problem」「solve a puzzle」で使う。", synonymDifference: "solve vs answer: solve は課題解決、answer は問いへの返答。", englishDefinition: "To find the answer to a problem.", etymology: "課題動詞の基礎語。" }],
  // useful (10506)
  [10506, { coreImage: "役に立って実用価値がある状態がコアイメージ。", usage: "「useful tool」「be useful for ...」で使う。", synonymDifference: "useful vs helpful: useful は道具価値、helpful は人の助けにも広い。", englishDefinition: "Helpful and practical.", etymology: "use + -ful。" }],
  // wonder (10508)
  [10508, { coreImage: "不思議に思って考える心理動作がコアイメージ。", usage: "「I wonder if ...」が定型。", synonymDifference: "wonder vs ask: wonder は内面的疑問、ask は外向き質問。", englishDefinition: "To think curiously about something.", etymology: "思考動詞の基礎語。" }],
  // advice (10509)
  [10509, { coreImage: "助言として他者に示す提案内容がコアイメージ。", usage: "不可算名詞で「some advice」。", synonymDifference: "advice vs suggestion: advice は助言一般、suggestion は提案案。", englishDefinition: "Helpful suggestions about what to do.", etymology: "助言語彙の基礎語。" }],
  // borrow (10510)
  [10510, { coreImage: "他者から借りる受け手側行為がコアイメージ。", usage: "「borrow A from B」が基本。", synonymDifference: "borrow vs lend: borrow は借りる、lend は貸す。", englishDefinition: "To take and use something belonging to someone else.", etymology: "授受動詞の基礎語。" }],
  // culture (10511)
  [10511, { coreImage: "社会の文化・慣習のまとまりがコアイメージ。", usage: "「Japanese culture」のように使う。", synonymDifference: "culture vs custom: custom は個別習慣、culture は体系全体。", englishDefinition: "The ideas, customs, and arts of a society.", etymology: "社会語彙の基礎語。" }],
  // environment (10512)
  [10512, { coreImage: "自然環境や周囲状況の枠組みがコアイメージ。", usage: "「protect the environment」で高頻度。", synonymDifference: "environment vs nature: environment は周囲条件、nature は自然そのもの。", englishDefinition: "The natural world or surroundings.", etymology: "社会・科学語彙の基礎語。" }],
  // information (10515)
  [10515, { coreImage: "知識やデータとしての情報を示す名詞がコアイメージ。", usage: "不可算で「some information」。", synonymDifference: "information vs news: information は情報全般、news は新しい知らせ。", englishDefinition: "Facts or knowledge provided about something.", etymology: "情報語彙の基礎語。" }],
  // suggest (10516)
  [10516, { coreImage: "案を提案して示唆する行為がコアイメージ。", usage: "「suggest doing」「suggest that ...」で使う。", synonymDifference: "suggest vs advise: advise は助言相手への働きかけが強い。", englishDefinition: "To propose an idea.", etymology: "提案動詞の基礎語。" }],
  // recently (10517)
  [10517, { coreImage: "最近の期間内で起きたことを示す副詞がコアイメージ。", usage: "現在完了と相性が高い。", synonymDifference: "recently vs lately: 近いが lately は継続傾向に使われやすい。", englishDefinition: "In the near past.", etymology: "recent + -ly。" }],
  // accident (10519)
  [10519, { coreImage: "意図せず起こる事故・不慮の出来事がコアイメージ。", usage: "「traffic accident」「by accident」で使う。", synonymDifference: "accident vs incident: accident は不慮性が強い。", englishDefinition: "An unexpected event causing damage or injury.", etymology: "出来事語彙の基礎語。" }],
  // age (10523)
  [10523, { coreImage: "年齢、または時代を示す多義名詞がコアイメージ。", usage: "初級では年齢義を優先。「at the age of ...」。", synonymDifference: "age vs year: age は年齢、year は年の単位。", englishDefinition: "How old someone is; also a period in history.", etymology: "時間概念語彙の基礎語。" }],
  // area (10524)
  [10524, { coreImage: "地域・範囲として区切られた領域がコアイメージ。", usage: "「this area」「study area」で使う。", synonymDifference: "area vs place: area は範囲性、place は地点性。", englishDefinition: "A region or part of a place.", etymology: "空間語彙の基礎語。" }],
  // activity (10525)
  [10525, { coreImage: "人が行う活動・行動単位がコアイメージ。", usage: "「school activities」で複数使いが多い。", synonymDifference: "activity vs action: activity は継続的活動、action は行為1回にも使う。", englishDefinition: "Something that people do.", etymology: "行為語彙の基礎語。" }],
  // adventure (10526)
  [10526, { coreImage: "わくわくする冒険的体験がコアイメージ。", usage: "物語や旅行文脈で使いやすい。", synonymDifference: "adventure vs trip: adventure は未知性・挑戦性が強い。", englishDefinition: "An exciting and unusual experience.", etymology: "物語語彙の基礎語。" }],
  // airport (10527)
  [10527, { coreImage: "飛行機が発着する空港施設がコアイメージ。", usage: "「at the airport」「airport bus」で使う。", synonymDifference: "airport vs station: airport は航空、station は鉄道等。", englishDefinition: "A place where aircraft land and take off.", etymology: "交通語彙の基礎語。" }],
  // apartment (10528)
  [10528, { coreImage: "集合住宅の一室としての住居がコアイメージ。", usage: "米語 apartment、英語 flat の違いを意識。", synonymDifference: "apartment vs house: apartment は集合住宅、house は独立家屋。", englishDefinition: "A set of rooms for living, usually in a building.", etymology: "住居語彙の基礎語。" }],
  // attention (10529)
  [10529, { coreImage: "注意・注目を向ける心の焦点がコアイメージ。", usage: "「pay attention to ...」が定型。", synonymDifference: "attention vs interest: attention は集中、interest は関心。", englishDefinition: "Notice or concentration on something.", etymology: "認知語彙の基礎語。" }],
  // audience (10530)
  [10530, { coreImage: "話や演技を聞く・見る観客集団がコアイメージ。", usage: "単数形で集合を表すことが多い。", synonymDifference: "audience vs crowd: audience は鑑賞目的の集団、crowd は群衆一般。", englishDefinition: "The people watching or listening to a performance.", etymology: "集合語彙の基礎語。" }],
];

// 手書き + モチタン取り込みを統合
export const wordExtensions: Map<number, WordExtension> = new Map([
  ..._handwrittenExtensions,
  ...motitownExtensions,
]);

type ExtensionSourceWord = Pick<
  BaseWord,
  "id" | "word" | "meaning" | "partOfSpeech" | "course" | "stage" | "example"
>;

const ALL_SOURCE_WORDS: ExtensionSourceWord[] = allWords;

const COURSE_CONTEXT_LABEL: Record<ExtensionSourceWord["course"], string> = {
  junior: "中学英語",
  senior: "高校英語",
  toeic: "ビジネス",
  eiken: "英検",
  conversation: "会話",
  general: "一般",
  business: "ビジネス",
};

const PART_OF_SPEECH_LABEL: Record<ExtensionSourceWord["partOfSpeech"], string> = {
  noun: "名",
  verb: "動",
  adjective: "形",
  adverb: "副",
  other: "他",
};

const wordsBySurface = new Map<string, ExtensionSourceWord[]>();
const wordsByPrimaryMeaning = new Map<string, ExtensionSourceWord[]>();
const wordBySurface = new Map<string, ExtensionSourceWord>();

for (const w of ALL_SOURCE_WORDS) {
  const key = w.word.toLowerCase();
  const meaningKey = pickPrimaryMeaning(w.meaning).toLowerCase();
  if (!wordsBySurface.has(key)) wordsBySurface.set(key, []);
  wordsBySurface.get(key)!.push(w);
  if (!wordsByPrimaryMeaning.has(meaningKey)) wordsByPrimaryMeaning.set(meaningKey, []);
  wordsByPrimaryMeaning.get(meaningKey)!.push(w);
  if (!wordBySurface.has(key)) wordBySurface.set(key, w);
}

function pickPrimaryMeaning(meaning: string): string {
  const primary = meaning
    .split(/[;；、,\/]/)
    .map((s) => s.trim())
    .find(Boolean);
  return primary || meaning.trim();
}

function buildCoreImage(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  switch (word.partOfSpeech) {
    case "noun":
      return `「${m}」という概念・対象をひとまとまりで捉えるのがコアイメージ。文脈によって具体物にも抽象概念にも広がる。`;
    case "verb":
      return `「${m}する」という動き・変化を起こすのがコアイメージ。誰が何にどう作用するかを意識すると定着しやすい。`;
    case "adjective":
      return `名詞の性質を「${m}な状態」として描写するのがコアイメージ。対象の特徴・評価を短く示せる。`;
    case "adverb":
      return `動詞・形容詞・文全体にかかって「${m}に」という様子や程度を補うのがコアイメージ。`;
    default:
      return `文脈に応じて「${m}」の機能を担う語。定型表現の中で意味をまとめて覚えると使いやすい。`;
  }
}

function buildUsage(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  switch (word.partOfSpeech) {
    case "noun":
      return `「a/the ${word.word}」「${word.word} + of ...」の形で使われることが多い。意味は「${m}」で、可算・不可算や前置詞との相性を例文で確認すると実用性が上がる。`;
    case "verb":
      return `「${word.word} + 名詞」「${word.word} + to do / that ...」などで使う。意味「${m}する」が誰に何を及ぼすかを例文単位で覚えるのが効果的。`;
    case "adjective":
      return `「${word.word} + 名詞」「be動詞 + ${word.word}」で使う。意味「${m}な」を、対象や場面とセットで覚えると定着しやすい。`;
    case "adverb":
      return `主に「動詞 + ${word.word}」「${word.word}, 文」の形で使う。意味「${m}に」がどの語を修飾するかを意識すると誤用を防げる。`;
    default:
      return `会話・定型表現の中で使われることが多い語。意味「${m}」を単体ではなくフレーズごと覚えると運用しやすい。`;
  }
}

function buildSynonymDifference(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  return `${word.word} は「${m}」を表すが、似た語との違いは「語調（フォーマル/カジュアル）」「適用場面」「文型」で現れる。例文で置換比較し、自然に言える組み合わせを優先して覚える。`;
}

function buildEnglishDefinition(word: ExtensionSourceWord): string {
  const m = pickPrimaryMeaning(word.meaning);
  switch (word.partOfSpeech) {
    case "noun":
      return `A noun used to refer to “${m}”, depending on context.`;
    case "verb":
      return `A verb meaning “to ${m}” in context.`;
    case "adjective":
      return `An adjective used to describe something as “${m}”.`;
    case "adverb":
      return `An adverb that modifies verbs/adjectives with the sense of “${m}”.`;
    default:
      return `A word or expression used with the sense of “${m}”, depending on context.`;
  }
}

function buildEtymology(word: ExtensionSourceWord): string {
  return `語源は辞書によって説明が異なるため、主要英英辞典（OED, Merriam-Webster, Collins など）で ${word.word} の語形成（接頭辞・接尾辞・語根）を照合して確認するのが確実。`;
}

function buildGeneratedExtension(word: ExtensionSourceWord): WordExtension {
  return {
    coreImage: buildCoreImage(word),
    usage: buildUsage(word),
    synonymDifference: buildSynonymDifference(word),
    englishDefinition: buildEnglishDefinition(word),
    etymology: buildEtymology(word),
  };
}

function buildGeneratedExamples(word: ExtensionSourceWord): NonNullable<WordExtension["examples"]> {
  const examples: NonNullable<WordExtension["examples"]> = [];

  const seen = new Set<string>();
  const push = (en: string | undefined, ja: string | undefined, context: string) => {
    if (!en) return;
    const normalized = en.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    examples.push({
      en,
      ja: ja ?? "",
      context,
    });
  };

  const sameSurface = wordsBySurface.get(word.word.toLowerCase()) ?? [];
  for (const candidate of sameSurface) {
    if (examples.length >= 3) break;
    push(
      candidate.example,
      exampleJaOverrides.get(candidate.id),
      COURSE_CONTEXT_LABEL[candidate.course]
    );
  }

  if (examples.length < 3 && word.example) {
    push(word.example, exampleJaOverrides.get(word.id), COURSE_CONTEXT_LABEL[word.course]);
  }

  const m = pickPrimaryMeaning(word.meaning);
  const fallbackByPos: Array<{ en: string; ja: string; context: string }> =
    word.partOfSpeech === "verb"
      ? [
          {
            en: `I try to ${word.word} every day.`,
            ja: `私は毎日${m}ようにしています。`,
            context: "学習",
          },
          {
            en: `She can ${word.word} this task well.`,
            ja: `彼女はこの課題をうまく${m}ことができます。`,
            context: "実践",
          },
        ]
      : word.partOfSpeech === "adjective"
        ? [
            {
              en: `The result was ${word.word}.`,
              ja: `その結果は${m}状態でした。`,
              context: "説明",
            },
            {
              en: `It seems ${word.word} to me.`,
              ja: `私にはそれが${m}ように見えます。`,
              context: "判断",
            },
          ]
        : word.partOfSpeech === "adverb"
          ? [
              {
                en: `He answered ${word.word} in class.`,
                ja: `彼は授業で${m}答えました。`,
                context: "授業",
              },
              {
                en: `We moved ${word.word} to finish on time.`,
                ja: `私たちは時間内に終えるため${m}動きました。`,
                context: "行動",
              },
            ]
          : word.partOfSpeech === "noun"
            ? [
                {
                  en: `This ${word.word} is important for daily communication.`,
                  ja: `この${m}は日常のコミュニケーションで重要です。`,
                  context: "日常",
                },
                {
                  en: `We discussed the ${word.word} in today's lesson.`,
                  ja: `私たちは今日の授業でこの${m}について話し合いました。`,
                  context: "授業",
                },
              ]
            : [
                {
                  en: `We often use "${word.word}" in conversation.`,
                  ja: `私たちは会話で「${word.word}」をよく使います。`,
                  context: "会話",
                },
                {
                  en: `Please learn how to use "${word.word}" naturally.`,
                  ja: `「${word.word}」を自然に使えるように学習してください。`,
                  context: "学習",
                },
              ];

  for (const f of fallbackByPos) {
    if (examples.length >= 3) break;
    push(f.en, f.ja, f.context);
  }

  return examples.slice(0, 3);
}

function buildGeneratedRelatedWordEntries(
  word: ExtensionSourceWord
): NonNullable<WordExtension["relatedWordEntries"]> {
  const entries: NonNullable<WordExtension["relatedWordEntries"]> = [];
  const seen = new Set<string>([word.word.toLowerCase()]);
  const push = (candidate: ExtensionSourceWord, isAntonym = false) => {
    const key = candidate.word.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    entries.push({
      word: candidate.word,
      partOfSpeech: PART_OF_SPEECH_LABEL[candidate.partOfSpeech],
      meaning: pickPrimaryMeaning(candidate.meaning),
      isAntonym,
    });
  };

  const meaningKey = pickPrimaryMeaning(word.meaning).toLowerCase();
  const sameMeaning = wordsByPrimaryMeaning.get(meaningKey) ?? [];
  for (const candidate of sameMeaning) {
    if (entries.length >= 4) break;
    push(candidate);
  }

  if (entries.length < 4) {
    const sameCoursePos = ALL_SOURCE_WORDS.filter(
      (w) =>
        w.course === word.course &&
        w.partOfSpeech === word.partOfSpeech &&
        w.id !== word.id
    );
    for (const candidate of sameCoursePos) {
      if (entries.length >= 4) break;
      push(candidate);
    }
  }

  return entries.slice(0, 4);
}

function buildGeneratedSynonymDifferenceEntries(
  word: ExtensionSourceWord,
  relatedEntries: NonNullable<WordExtension["relatedWordEntries"]>
): NonNullable<WordExtension["synonymDifferenceEntries"]> {
  return relatedEntries
    .filter((e) => !e.isAntonym)
    .slice(0, 3)
    .map((e) => ({
      word: e.word,
      description:
        `${e.word} は ${word.word} と近い意味で使われるが、文脈・語調・一緒に使う語の組み合わせが異なる。` +
        `例文で置き換えて自然さを確認するのが効果的。`,
    }));
}

function buildGeneratedColumn(
  word: ExtensionSourceWord,
  generated: WordExtension
): NonNullable<WordExtension["column"]> {
  return {
    title: `${word.word} の使い分けメモ`,
    content:
      `${generated.coreImage}\n\n` +
      `${generated.usage}\n\n` +
      `学習のポイント: ${word.word} は品詞と文型を固定して反復すると定着しやすい。` +
      `関連語との違いは例文単位で比較して確認する。`,
  };
}

/**
 * 既存の手動拡張を優先し、不足フィールドのみ自動補完する。
 * 単語詳細画面で全語に5セクションを表示できるようにするための統一アクセサ。
 * examples / relatedWords / pronunciation は手動データのみ（自動生成なし）。
 */
export function getWordExtension(word: ExtensionSourceWord): WordExtension {
  const manual = wordExtensions.get(word.id);
  const generated = buildGeneratedExtension(word);
  const generatedExamples = buildGeneratedExamples(word);
  const generatedRelatedEntries = buildGeneratedRelatedWordEntries(word);
  const generatedSynonymEntries = buildGeneratedSynonymDifferenceEntries(
    word,
    generatedRelatedEntries
  );
  const generatedColumn = buildGeneratedColumn(word, generated);

  const manualRelatedEntries =
    manual?.relatedWordEntries ??
    (manual?.relatedWords?.map((rw) => {
      const matched = wordBySurface.get(rw.toLowerCase());
      return {
        word: rw,
        partOfSpeech: matched ? PART_OF_SPEECH_LABEL[matched.partOfSpeech] : "他",
        meaning: matched ? pickPrimaryMeaning(matched.meaning) : "関連語",
      };
    }) ?? [
]);

  const mergedRelatedEntries =
    manualRelatedEntries.length > 0 ? manualRelatedEntries : generatedRelatedEntries;

  return {
    coreImage: manual?.coreImage ?? generated.coreImage,
    usage: manual?.usage ?? generated.usage,
    synonymDifference: manual?.synonymDifference ?? generated.synonymDifference,
    englishDefinition: manual?.englishDefinition ?? generated.englishDefinition,
    etymology: manual?.etymology ?? generated.etymology,
    examples: manual?.examples ?? generatedExamples,
    relatedWords:
      manual?.relatedWords ??
      mergedRelatedEntries.map((entry) => entry.word),
    relatedWordEntries: mergedRelatedEntries,
    pronunciation: manual?.pronunciation,
    synonyms:
      manual?.synonyms ??
      (manual?.synonymDifferenceEntries?.map((entry) => entry.word) ??
        generatedSynonymEntries.map((entry) => entry.word)),
    antonyms: manual?.antonyms,
    column: manual?.column ?? generatedColumn,
    synonymDifferenceEntries:
      manual?.synonymDifferenceEntries ?? generatedSynonymEntries,
  };
}
