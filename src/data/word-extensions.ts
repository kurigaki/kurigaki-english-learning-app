/**
 * 単語拡張データ
 *
 * 単語詳細画面の「コアイメージ」「使い方」「類義語との違い」「英英定義」「語源」
 * セクションに表示するコンテンツを管理する。
 * 単語データ本体（words/）とは分離し、ID をキーとした Map で管理する。
 */

import type { WordExtension } from "@/types";
export type { WordExtension };

export const wordExtensions: Map<number, WordExtension> = new Map([
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
