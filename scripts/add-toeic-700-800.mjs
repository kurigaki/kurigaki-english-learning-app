import { readFileSync, writeFileSync } from 'fs';

const FILE = 'src/data/words/toeic.js';
let src = readFileSync(FILE, 'utf8');

// Collect existing words to avoid duplicates
const existingWords = new Set();
const wordMatches = src.matchAll(/word:\s*"([^"]+)"/g);
for (const m of wordMatches) existingWords.add(m[1].toLowerCase());

// Collect existing meanings per stage to avoid meaning duplicates
const existingMeanings700 = new Set();
const existingMeanings800 = new Set();
const entryRe = /stage:\s*"(\d+)".*?meaning:\s*"([^"]+)"/g;
let em;
while ((em = entryRe.exec(src)) !== null) {
  if (em[1] === '700') existingMeanings700.add(em[2]);
  if (em[1] === '800') existingMeanings800.add(em[2]);
}

let nextId = 34012;

function makeEntry(w, meaning, pos, stage, diff, cat, cats, ex) {
  const id = nextId++;
  return `  { id: ${id}, word: "${w}", meaning: "${meaning}", partOfSpeech: "${pos}", course: "toeic", stage: "${stage}", example: "${ex[0].en}", exampleJa: "${ex[0].ja}", examples: [${ex.map(e => `{ en: "${e.en}", ja: "${e.ja}", context: "${e.cx}" }`).join(', ')}], difficulty: ${diff}, category: "${cat}", categories: ${JSON.stringify(cats)}, frequencyRank: 3, source: "CEFR-J" }`;
}

// ============================================================
// Stage 700 words (difficulty 5) - i~z + a~d補完
// ============================================================
const stage700 = [
  // ---- Verbs (i~z) ----
  { w:'identify', m:'特定する', p:'verb', c:'business', cs:['business','office'], ex:[
    {en:'We need to identify the root cause of this issue.',ja:'この問題の根本原因を特定する必要があります。',cx:'会議'},
    {en:'The auditor identified several discrepancies in the report.',ja:'監査人が報告書のいくつかの矛盾を特定しました。',cx:'監査'},
    {en:'Please identify the key stakeholders for this project.',ja:'このプロジェクトの主要関係者を特定してください。',cx:'企画'}]},
  { w:'impose', m:'課す', p:'verb', c:'business', cs:['business','finance'], ex:[
    {en:'The government imposed new regulations on imports.',ja:'政府が輸入に新しい規制を課しました。',cx:'貿易'},
    {en:'Management imposed a deadline for all submissions.',ja:'経営陣が全提出物に期限を課しました。',cx:'オフィス'},
    {en:'The city imposed a fine for parking violations.',ja:'市が駐車違反に罰金を課しました。',cx:'行政'}]},
  { w:'install', m:'設置する', p:'verb', c:'technology', cs:['technology','office'], ex:[
    {en:'We installed new software on all office computers.',ja:'全オフィスのPCに新しいソフトを設置しました。',cx:'IT'},
    {en:'The technician will install the network router tomorrow.',ja:'技術者が明日ルーターを設置します。',cx:'オフィス'},
    {en:'They installed security cameras at every entrance.',ja:'全入口に防犯カメラを設置しました。',cx:'施設管理'}]},
  { w:'intensify', m:'強化する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The company intensified its marketing efforts abroad.',ja:'会社は海外のマーケティングを強化しました。',cx:'営業'},
    {en:'Competition in the sector has intensified recently.',ja:'この業界の競争は最近激しくなりました。',cx:'市場'},
    {en:'We must intensify quality control measures.',ja:'品質管理策を強化しなければなりません。',cx:'製造'}]},
  { w:'intervene', m:'介入する', p:'verb', c:'business', cs:['business','communication'], ex:[
    {en:'The manager intervened to resolve the dispute.',ja:'マネージャーが紛争解決のため介入しました。',cx:'人事'},
    {en:'The central bank intervened in the currency market.',ja:'中央銀行が為替市場に介入しました。',cx:'金融'},
    {en:'HR had to intervene when tensions escalated.',ja:'緊張が高まり人事部が介入しました。',cx:'オフィス'}]},
  { w:'lend', m:'貸す', p:'verb', c:'finance', cs:['finance','daily'], ex:[
    {en:'The bank agreed to lend us the funds.',ja:'銀行が資金を貸すことに同意しました。',cx:'金融'},
    {en:'Can you lend me your projector for the meeting?',ja:'会議用にプロジェクターを貸してもらえますか？',cx:'オフィス'},
    {en:'She lent her expertise to the new team.',ja:'彼女は新チームに専門知識を貸しました。',cx:'協力'}]},
  { w:'levy', m:'徴収する', p:'verb', c:'finance', cs:['finance','business'], ex:[
    {en:'The government will levy a new tax on luxury goods.',ja:'政府が贅沢品に新たな税を徴収します。',cx:'税制'},
    {en:'A surcharge was levied on late payments.',ja:'遅延支払いに追加料金が徴収されました。',cx:'経理'},
    {en:'The council levied fees on commercial properties.',ja:'議会が商業施設に料金を徴収しました。',cx:'行政'}]},
  { w:'log', m:'記録する', p:'verb', c:'technology', cs:['technology','office'], ex:[
    {en:'Please log all customer complaints in the system.',ja:'全ての顧客苦情をシステムに記録してください。',cx:'サポート'},
    {en:'Employees must log their working hours daily.',ja:'社員は毎日勤務時間を記録する必要があります。',cx:'勤怠'},
    {en:'The server logs every access attempt automatically.',ja:'サーバーは全アクセス試行を自動で記録します。',cx:'IT'}]},
  { w:'mediate', m:'調停する', p:'verb', c:'business', cs:['business','communication'], ex:[
    {en:'An external consultant was hired to mediate the conflict.',ja:'外部のコンサルが紛争を調停するために雇われました。',cx:'人事'},
    {en:'She mediated between the two departments.',ja:'彼女は二つの部門の間を調停しました。',cx:'オフィス'},
    {en:'The lawyer agreed to mediate the settlement.',ja:'弁護士が和解の調停に同意しました。',cx:'法務'}]},
  { w:'migrate', m:'移行する', p:'verb', c:'technology', cs:['technology','business'], ex:[
    {en:'We plan to migrate our data to the cloud.',ja:'データをクラウドに移行する予定です。',cx:'IT'},
    {en:'The company migrated to a new ERP system.',ja:'会社は新しいERPシステムに移行しました。',cx:'システム'},
    {en:'Users were migrated to the updated platform.',ja:'ユーザーは更新されたプラットフォームに移行しました。',cx:'IT'}]},
  { w:'mobilize', m:'動員する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The CEO mobilized all resources for the launch.',ja:'CEOが発売に向けて全資源を動員しました。',cx:'経営'},
    {en:'We need to mobilize the team for the deadline.',ja:'締切に向けてチームを動員する必要があります。',cx:'企画'},
    {en:'Volunteers were mobilized for the charity event.',ja:'慈善イベントのためにボランティアが動員されました。',cx:'社会'}]},
  { w:'offset', m:'相殺する', p:'verb', c:'finance', cs:['finance','business'], ex:[
    {en:'The gains offset the losses from last quarter.',ja:'利益が前四半期の損失を相殺しました。',cx:'決算'},
    {en:'We offset carbon emissions by planting trees.',ja:'植樹で二酸化炭素排出量を相殺しました。',cx:'環境'},
    {en:'Higher sales offset the increased production costs.',ja:'売上増が製造費増加を相殺しました。',cx:'財務'}]},
  { w:'orient', m:'方向付ける', p:'verb', c:'business', cs:['business','office'], ex:[
    {en:'The training program orients new hires to company culture.',ja:'研修は新入社員に企業文化を方向付けます。',cx:'人事'},
    {en:'We need to orient our strategy toward growth.',ja:'成長に向けて戦略を方向付ける必要があります。',cx:'経営'},
    {en:'The guide oriented visitors around the facility.',ja:'ガイドが訪問者に施設内を案内しました。',cx:'施設'}]},
  { w:'outperform', m:'上回る', p:'verb', c:'business', cs:['business','finance'], ex:[
    {en:'Our division outperformed all others this year.',ja:'今年、我々の部門が他の全部門を上回りました。',cx:'業績'},
    {en:'The new product outperformed sales expectations.',ja:'新製品は売上予想を上回りました。',cx:'営業'},
    {en:'She consistently outperforms her peers.',ja:'彼女は常に同僚を上回る成果を出します。',cx:'評価'}]},
  { w:'outsource', m:'外注する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The firm outsources its IT support to a vendor.',ja:'その会社はITサポートを業者に外注しています。',cx:'経営'},
    {en:'We decided to outsource the payroll processing.',ja:'給与処理を外注することに決めました。',cx:'人事'},
    {en:'Many companies outsource manufacturing overseas.',ja:'多くの企業が製造を海外に外注しています。',cx:'貿易'}]},
  { w:'overhaul', m:'全面改修する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The board voted to overhaul the compensation system.',ja:'取締役会が報酬制度の全面改修を決議しました。',cx:'経営'},
    {en:'We need to overhaul our outdated processes.',ja:'時代遅れの工程を全面改修する必要があります。',cx:'改善'},
    {en:'The factory was overhauled during the shutdown.',ja:'工場は休止期間中に全面改修されました。',cx:'製造'}]},
  { w:'penalize', m:'罰する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Companies will be penalized for late tax filings.',ja:'会社は税の遅延申告で罰せられます。',cx:'税務'},
    {en:'The contract penalizes vendors for missed deadlines.',ja:'契約は納期遅れの業者を罰します。',cx:'契約'},
    {en:'Employees are penalized for policy violations.',ja:'社員は規定違反で罰せられます。',cx:'人事'}]},
  { w:'phase', m:'段階化する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The rollout will be phased over three months.',ja:'展開は3か月にわたり段階的に行われます。',cx:'企画'},
    {en:'We are phasing out the old product line.',ja:'旧製品ラインを段階的に廃止しています。',cx:'製品'},
    {en:'The merger was phased to minimize disruption.',ja:'合併は混乱を最小限に段階化されました。',cx:'経営'}]},
  { w:'pledge', m:'誓約する', p:'verb', c:'business', cs:['business','communication'], ex:[
    {en:'The CEO pledged to improve working conditions.',ja:'CEOが労働条件の改善を誓約しました。',cx:'経営'},
    {en:'Donors pledged a total of five million dollars.',ja:'寄付者が合計500万ドルを誓約しました。',cx:'資金'},
    {en:'She pledged her full support for the initiative.',ja:'彼女はその取り組みへの全面支援を誓約しました。',cx:'協力'}]},
  { w:'prevail', m:'優勢である', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Common sense should prevail in negotiations.',ja:'交渉では常識が優勢であるべきです。',cx:'交渉'},
    {en:'The plaintiff prevailed in the court case.',ja:'原告が裁判で優勢でした。',cx:'法務'},
    {en:'A positive attitude prevails throughout the team.',ja:'チーム全体に前向きな姿勢が広まっています。',cx:'組織'}]},
  { w:'probe', m:'調査する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Regulators will probe the accounting irregularities.',ja:'規制当局が会計の不正を調査します。',cx:'監査'},
    {en:'The committee probed into the safety incident.',ja:'委員会が安全事故を調査しました。',cx:'安全'},
    {en:'Journalists probed the allegations of fraud.',ja:'記者たちが詐欺の疑惑を調査しました。',cx:'報道'}]},
  { w:'procure', m:'調達する', p:'verb', c:'business', cs:['business','finance'], ex:[
    {en:'The department procured office supplies in bulk.',ja:'部門がオフィス用品を大量に調達しました。',cx:'購買'},
    {en:'We need to procure raw materials by next week.',ja:'来週までに原材料を調達する必要があります。',cx:'製造'},
    {en:'The contract was awarded to procure IT services.',ja:'ITサービスの調達のため契約が発注されました。',cx:'IT'}]},
  { w:'prohibit', m:'禁止する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Company policy prohibits personal use of equipment.',ja:'社内規定で機器の私的利用が禁止されています。',cx:'規則'},
    {en:'The law prohibits insider trading.',ja:'法律はインサイダー取引を禁止しています。',cx:'法務'},
    {en:'Smoking is prohibited in all office areas.',ja:'全オフィスエリアで喫煙が禁止されています。',cx:'施設'}]},
  { w:'prosecute', m:'起訴する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The company will prosecute anyone who leaks data.',ja:'会社はデータを漏洩した者を起訴します。',cx:'法務'},
    {en:'Offenders will be prosecuted to the full extent.',ja:'違反者は法の最大限まで起訴されます。',cx:'規制'},
    {en:'The government prosecuted the firm for tax evasion.',ja:'政府がその会社を脱税で起訴しました。',cx:'税務'}]},
  { w:'publicize', m:'公表する', p:'verb', c:'business', cs:['business','communication'], ex:[
    {en:'The company publicized its new environmental policy.',ja:'会社は新しい環境方針を公表しました。',cx:'広報'},
    {en:'The event was widely publicized on social media.',ja:'そのイベントはSNSで広く公表されました。',cx:'マーケ'},
    {en:'They publicized the merger in a press conference.',ja:'記者会見で合併を公表しました。',cx:'広報'}]},
  { w:'realize', m:'実現する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'We finally realized our goal of global expansion.',ja:'ついにグローバル展開の目標を実現しました。',cx:'経営'},
    {en:'The team realized significant cost savings.',ja:'チームは大幅なコスト削減を実現しました。',cx:'財務'},
    {en:'She realized her potential through hard work.',ja:'彼女は努力で自分の可能性を実現しました。',cx:'キャリア'}]},
  { w:'reclaim', m:'取り戻す', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The company reclaimed its market share after reforms.',ja:'改革後、会社は市場シェアを取り戻しました。',cx:'経営'},
    {en:'You can reclaim travel expenses from accounting.',ja:'旅費を経理から取り戻すことができます。',cx:'経費'},
    {en:'The city reclaimed abandoned industrial land.',ja:'市は放棄された工業用地を取り戻しました。',cx:'都市'}]},
  { w:'redeem', m:'償還する', p:'verb', c:'finance', cs:['finance'], ex:[
    {en:'Customers can redeem loyalty points for discounts.',ja:'顧客はポイントを割引に償還できます。',cx:'販売'},
    {en:'The bond can be redeemed after five years.',ja:'その債券は5年後に償還できます。',cx:'金融'},
    {en:'He redeemed the voucher at the service counter.',ja:'彼はサービスカウンターで券を償還しました。',cx:'店舗'}]},
  { w:'redirect', m:'転送する', p:'verb', c:'technology', cs:['technology','business'], ex:[
    {en:'Please redirect all inquiries to the new department.',ja:'全ての問い合わせを新部門に転送してください。',cx:'顧客対応'},
    {en:'We redirected traffic to the backup server.',ja:'バックアップサーバーにトラフィックを転送しました。',cx:'IT'},
    {en:'The budget was redirected to priority projects.',ja:'予算が優先プロジェクトに転送されました。',cx:'財務'}]},
  { w:'regulate', m:'規制する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The agency regulates pharmaceutical safety standards.',ja:'その機関が医薬品の安全基準を規制しています。',cx:'規制'},
    {en:'New laws regulate data privacy for consumers.',ja:'新法が消費者のデータプライバシーを規制します。',cx:'法務'},
    {en:'The central bank regulates interest rates.',ja:'中央銀行が金利を規制しています。',cx:'金融'}]},
  { w:'remodel', m:'改装する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The office was remodeled to create open workspaces.',ja:'オフィスがオープンスペースに改装されました。',cx:'施設'},
    {en:'They remodeled the lobby for a modern look.',ja:'モダンな外観にロビーを改装しました。',cx:'施設'},
    {en:'The store will be remodeled during the holiday.',ja:'その店舗は休暇中に改装されます。',cx:'店舗'}]},
  { w:'render', m:'提供する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The consultant rendered professional advice.',ja:'コンサルタントが専門的な助言を提供しました。',cx:'コンサル'},
    {en:'The new policy rendered the old one obsolete.',ja:'新方針が旧方針を時代遅れにしました。',cx:'経営'},
    {en:'Services rendered will be billed monthly.',ja:'提供されたサービスは月次で請求されます。',cx:'経理'}]},
  { w:'repeal', m:'撤廃する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The government repealed the outdated regulation.',ja:'政府が時代遅れの規制を撤廃しました。',cx:'政策'},
    {en:'The board voted to repeal the dress code policy.',ja:'取締役会が服装規定の撤廃を決議しました。',cx:'人事'},
    {en:'Many called for the law to be repealed.',ja:'多くの人がその法律の撤廃を求めました。',cx:'社会'}]},
  { w:'replenish', m:'補充する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'We need to replenish inventory before the sale.',ja:'セール前に在庫を補充する必要があります。',cx:'在庫'},
    {en:'The supply team replenished the warehouse stock.',ja:'供給チームが倉庫の在庫を補充しました。',cx:'物流'},
    {en:'Please replenish the paper in the printer.',ja:'プリンターの紙を補充してください。',cx:'オフィス'}]},
  { w:'revamp', m:'刷新する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The company revamped its brand identity.',ja:'会社はブランドアイデンティティを刷新しました。',cx:'マーケ'},
    {en:'We plan to revamp the employee training program.',ja:'社員研修プログラムを刷新する予定です。',cx:'人事'},
    {en:'The website was completely revamped for mobile users.',ja:'ウェブサイトがモバイル向けに完全刷新されました。',cx:'IT'}]},
  { w:'revitalize', m:'活性化する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'New leadership revitalized the struggling division.',ja:'新リーダーが苦戦中の部門を活性化しました。',cx:'経営'},
    {en:'The project aims to revitalize the local economy.',ja:'そのプロジェクトは地域経済の活性化を目指します。',cx:'行政'},
    {en:'A fresh marketing campaign revitalized the brand.',ja:'新しいマーケティングがブランドを活性化しました。',cx:'マーケ'}]},
  { w:'revoke', m:'取り消す', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The license was revoked due to repeated violations.',ja:'繰り返しの違反で免許が取り消されました。',cx:'規制'},
    {en:'Management revoked access to confidential files.',ja:'経営陣が機密ファイルへのアクセスを取り消しました。',cx:'IT'},
    {en:'The contract was revoked after the breach.',ja:'違反後に契約が取り消されました。',cx:'法務'}]},
  { w:'rotate', m:'交代する', p:'verb', c:'business', cs:['business','office'], ex:[
    {en:'Staff rotate shifts every two weeks.',ja:'スタッフは2週間ごとにシフトを交代します。',cx:'勤務'},
    {en:'The chair position rotates among board members.',ja:'議長の役職は取締役間で交代します。',cx:'経営'},
    {en:'We rotate inventory to ensure freshness.',ja:'鮮度を保つため在庫を交代させています。',cx:'在庫'}]},
  { w:'settle', m:'解決する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Both parties agreed to settle the dispute.',ja:'両者が紛争を解決することに同意しました。',cx:'法務'},
    {en:'The insurance claim was settled within a month.',ja:'保険請求は1か月以内に解決されました。',cx:'保険'},
    {en:'We need to settle the payment by Friday.',ja:'金曜日までに支払いを済ませる必要があります。',cx:'経理'}]},
  { w:'specialize', m:'専門化する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Our firm specializes in corporate tax law.',ja:'当社は法人税法を専門としています。',cx:'法務'},
    {en:'She specializes in digital marketing strategy.',ja:'彼女はデジタルマーケ戦略を専門としています。',cx:'マーケ'},
    {en:'The division specializes in renewable energy.',ja:'その部門は再生可能エネルギーを専門としています。',cx:'事業'}]},
  { w:'stabilize', m:'安定させる', p:'verb', c:'finance', cs:['finance','business'], ex:[
    {en:'The central bank acted to stabilize the currency.',ja:'中央銀行が通貨を安定させるため行動しました。',cx:'金融'},
    {en:'New measures helped stabilize supply chains.',ja:'新しい措置がサプライチェーンの安定に役立ちました。',cx:'物流'},
    {en:'Profits stabilized after a turbulent quarter.',ja:'激動の四半期後に利益が安定しました。',cx:'決算'}]},
  { w:'standardize', m:'標準化する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'We standardized our reporting format across regions.',ja:'地域間で報告形式を標準化しました。',cx:'業務'},
    {en:'The industry aims to standardize safety protocols.',ja:'業界は安全規約の標準化を目指しています。',cx:'規制'},
    {en:'All documents should be standardized for consistency.',ja:'一貫性のため全書類を標準化すべきです。',cx:'品質'}]},
  { w:'stipulate', m:'規定する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The contract stipulates a 30-day notice period.',ja:'契約は30日前の通知期間を規定しています。',cx:'契約'},
    {en:'Regulations stipulate minimum safety requirements.',ja:'規制は最低限の安全要件を規定しています。',cx:'法務'},
    {en:'The agreement stipulates payment terms clearly.',ja:'合意書は支払条件を明確に規定しています。',cx:'取引'}]},
  { w:'streamline', m:'効率化する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'We streamlined the approval process to save time.',ja:'時間節約のため承認プロセスを効率化しました。',cx:'業務'},
    {en:'The new software streamlines inventory management.',ja:'新ソフトが在庫管理を効率化します。',cx:'IT'},
    {en:'Efforts to streamline operations reduced costs by 20%.',ja:'業務効率化の取り組みでコストが20%減りました。',cx:'経営'}]},
  { w:'summarize', m:'要約する', p:'verb', c:'communication', cs:['communication','office'], ex:[
    {en:'Please summarize the main points of the meeting.',ja:'会議の要点を要約してください。',cx:'会議'},
    {en:'The report summarizes the quarterly results.',ja:'報告書が四半期の結果を要約しています。',cx:'報告'},
    {en:'She summarized the findings in a brief memo.',ja:'彼女は調査結果を短いメモで要約しました。',cx:'文書'}]},
  { w:'supplement', m:'補足する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Freelance work supplements her regular income.',ja:'フリーランスの仕事が通常収入を補足しています。',cx:'キャリア'},
    {en:'The guide supplements the training materials.',ja:'そのガイドは研修資料を補足しています。',cx:'教育'},
    {en:'Additional data supplements the original report.',ja:'追加データが原本の報告書を補足しています。',cx:'報告'}]},
  { w:'tally', m:'集計する', p:'verb', c:'finance', cs:['finance','office'], ex:[
    {en:'Staff tallied the votes after the board meeting.',ja:'スタッフが取締役会後に投票を集計しました。',cx:'会議'},
    {en:'The accountant tallied all expenses for the month.',ja:'経理が月の全経費を集計しました。',cx:'経理'},
    {en:'Final numbers will be tallied by end of day.',ja:'最終数字は本日中に集計されます。',cx:'報告'}]},
  { w:'tolerate', m:'許容する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The company does not tolerate harassment.',ja:'会社はハラスメントを許容しません。',cx:'人事'},
    {en:'Minor delays can be tolerated during peak season.',ja:'繁忙期は多少の遅延は許容されます。',cx:'物流'},
    {en:'We cannot tolerate any breach of data security.',ja:'データセキュリティの侵害は一切許容できません。',cx:'IT'}]},
  { w:'trace', m:'追跡する', p:'verb', c:'business', cs:['business','technology'], ex:[
    {en:'The system traces every shipment in real time.',ja:'システムが全出荷をリアルタイムで追跡します。',cx:'物流'},
    {en:'We traced the error back to a software update.',ja:'エラーの原因をソフト更新まで追跡しました。',cx:'IT'},
    {en:'Auditors traced all transactions over the year.',ja:'監査人が年間の全取引を追跡しました。',cx:'監査'}]},
  { w:'transit', m:'輸送する', p:'verb', c:'business', cs:['business','travel'], ex:[
    {en:'Goods are transited through the distribution center.',ja:'商品は配送センターを経由して輸送されます。',cx:'物流'},
    {en:'The cargo will transit through three countries.',ja:'貨物は3か国を経由して輸送されます。',cx:'貿易'},
    {en:'Passengers transit at the hub airport.',ja:'乗客はハブ空港を経由して輸送されます。',cx:'交通'}]},
  { w:'trigger', m:'引き起こす', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The product recall triggered a stock price drop.',ja:'製品リコールが株価下落を引き起こしました。',cx:'市場'},
    {en:'Late payments trigger penalty charges.',ja:'支払遅延がペナルティ料金を引き起こします。',cx:'経理'},
    {en:'The announcement triggered widespread media coverage.',ja:'発表が広範なメディア報道を引き起こしました。',cx:'広報'}]},
  { w:'undergo', m:'受ける', p:'verb', c:'business', cs:['business'], ex:[
    {en:'All employees must undergo annual training.',ja:'全社員が年次研修を受けなければなりません。',cx:'人事'},
    {en:'The facility is undergoing a major renovation.',ja:'その施設は大規模改修を受けています。',cx:'施設'},
    {en:'The product underwent rigorous quality testing.',ja:'製品は厳格な品質テストを受けました。',cx:'品質'}]},
  { w:'validate', m:'検証する', p:'verb', c:'business', cs:['business','technology'], ex:[
    {en:'We need to validate the data before publishing.',ja:'公開前にデータを検証する必要があります。',cx:'報告'},
    {en:'The system validates user credentials at login.',ja:'システムがログイン時にユーザー資格を検証します。',cx:'IT'},
    {en:'External auditors validated our financial statements.',ja:'外部監査人が財務諸表を検証しました。',cx:'監査'}]},
  { w:'violate', m:'違反する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Sharing confidential data violates company policy.',ja:'機密データの共有は社内規定に違反します。',cx:'コンプラ'},
    {en:'The vendor violated the terms of the agreement.',ja:'業者が契約条件に違反しました。',cx:'契約'},
    {en:'Any employee who violates rules faces dismissal.',ja:'規則に違反した社員は解雇に直面します。',cx:'人事'}]},
  { w:'void', m:'無効にする', p:'verb', c:'business', cs:['business','finance'], ex:[
    {en:'The contract was voided due to noncompliance.',ja:'不遵守のため契約が無効にされました。',cx:'法務'},
    {en:'The warranty is voided if the product is modified.',ja:'製品を改造すると保証が無効になります。',cx:'製品'},
    {en:'The payment was voided and reissued correctly.',ja:'支払いが無効にされ正しく再発行されました。',cx:'経理'}]},
  { w:'waive', m:'放棄する', p:'verb', c:'business', cs:['business','finance'], ex:[
    {en:'The bank agreed to waive the late fee.',ja:'銀行が遅延料金を放棄することに同意しました。',cx:'金融'},
    {en:'Participants may waive their right to compensation.',ja:'参加者は報酬の権利を放棄できます。',cx:'契約'},
    {en:'The company waived the shipping charges.',ja:'会社が送料を放棄しました。',cx:'販売'}]},
  { w:'warrant', m:'正当化する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The results warrant further investigation.',ja:'結果はさらなる調査を正当化します。',cx:'監査'},
    {en:'Current sales figures warrant an expansion plan.',ja:'現在の売上は拡張計画を正当化します。',cx:'経営'},
    {en:'The severity of the issue warrants immediate action.',ja:'問題の深刻さは即座の行動を正当化します。',cx:'危機管理'}]},
  { w:'yield', m:'生み出す', p:'verb', c:'finance', cs:['finance','business'], ex:[
    {en:'The investment yielded a 12% annual return.',ja:'その投資は年間12%の利益を生み出しました。',cx:'投資'},
    {en:'Negotiations yielded a favorable outcome.',ja:'交渉は好ましい結果を生み出しました。',cx:'交渉'},
    {en:'The new strategy yielded impressive results.',ja:'新戦略は素晴らしい結果を生み出しました。',cx:'経営'}]},

  // ---- Nouns (i~z) ----
  { w:'implication', m:'影響', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The new policy has significant financial implications.',ja:'新方針は大きな財政的影響があります。',cx:'経営'},
    {en:'We must consider the legal implications.',ja:'法的な影響を考慮しなければなりません。',cx:'法務'},
    {en:'The implications of the merger are still unclear.',ja:'合併の影響はまだ不明です。',cx:'経営'}]},
  { w:'inauguration', m:'就任式', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The inauguration of the new CEO was held today.',ja:'新CEOの就任式が本日行われました。',cx:'経営'},
    {en:'The building inauguration attracted many guests.',ja:'ビルの落成式に多くの来賓が集まりました。',cx:'施設'},
    {en:'Her inauguration marked a new era for the firm.',ja:'彼女の就任式は会社の新時代を示しました。',cx:'人事'}]},
  { w:'inception', m:'開始', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Since its inception, the company has grown rapidly.',ja:'開始以来、会社は急速に成長しました。',cx:'経営'},
    {en:'The project has been profitable since inception.',ja:'プロジェクトは開始以来黒字です。',cx:'財務'},
    {en:'From inception to launch took about six months.',ja:'開始から発売まで約6か月かかりました。',cx:'企画'}]},
  { w:'incorporation', m:'法人化', p:'noun', c:'business', cs:['business','finance'], ex:[
    {en:'The articles of incorporation were filed last week.',ja:'定款が先週提出されました。',cx:'法務'},
    {en:'Incorporation provides limited liability protection.',ja:'法人化は有限責任の保護を提供します。',cx:'経営'},
    {en:'The cost of incorporation varies by state.',ja:'法人化の費用は州によって異なります。',cx:'法務'}]},
  { w:'indicator', m:'指標', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'Sales volume is a key performance indicator.',ja:'販売量は重要な業績指標です。',cx:'業績'},
    {en:'Economic indicators suggest a recovery is underway.',ja:'経済指標は回復が進行中であることを示しています。',cx:'経済'},
    {en:'Customer satisfaction is a leading indicator of growth.',ja:'顧客満足度は成長の先行指標です。',cx:'マーケ'}]},
  { w:'infrastructure', m:'基盤', p:'noun', c:'business', cs:['business','technology'], ex:[
    {en:'The city is investing heavily in infrastructure.',ja:'市はインフラ基盤に大きく投資しています。',cx:'行政'},
    {en:'Our IT infrastructure needs a major upgrade.',ja:'IT基盤の大幅なアップグレードが必要です。',cx:'IT'},
    {en:'Reliable infrastructure is essential for business growth.',ja:'信頼できる基盤は事業成長に不可欠です。',cx:'経営'}]},
  { w:'injunction', m:'差し止め', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The court issued an injunction against the merger.',ja:'裁判所が合併に対する差し止めを出しました。',cx:'法務'},
    {en:'An injunction was filed to halt construction.',ja:'建設を止めるため差し止めが申請されました。',cx:'不動産'},
    {en:'The company sought an injunction to protect its patent.',ja:'会社は特許保護のため差し止めを求めました。',cx:'知財'}]},
  { w:'installment', m:'分割払い', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'You can pay in monthly installments.',ja:'月々の分割払いで支払えます。',cx:'販売'},
    {en:'The first installment is due upon signing.',ja:'最初の分割払いは契約時に支払います。',cx:'契約'},
    {en:'Interest-free installments are available for purchases.',ja:'購入に無利息の分割払いが利用可能です。',cx:'金融'}]},
  { w:'integrity', m:'誠実さ', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Professional integrity is our core value.',ja:'プロの誠実さが我々の中核的価値です。',cx:'企業理念'},
    {en:'Data integrity must be maintained at all times.',ja:'データの完全性は常に維持する必要があります。',cx:'IT'},
    {en:'He is known for his integrity in business.',ja:'彼はビジネスでの誠実さで知られています。',cx:'人物'}]},
  { w:'intervention', m:'介入', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Government intervention stabilized the market.',ja:'政府の介入が市場を安定させました。',cx:'経済'},
    {en:'Early intervention prevented a larger crisis.',ja:'早期介入がより大きな危機を防ぎました。',cx:'危機管理'},
    {en:'The union called for management intervention.',ja:'組合が経営陣の介入を求めました。',cx:'労働'}]},
  { w:'justification', m:'正当化', p:'noun', c:'business', cs:['business'], ex:[
    {en:'We need justification for the budget increase.',ja:'予算増の正当化が必要です。',cx:'財務'},
    {en:'There is no justification for missing the deadline.',ja:'締切を逃す正当化はありません。',cx:'業務'},
    {en:'The proposal includes a detailed cost justification.',ja:'提案には詳細なコストの正当化が含まれています。',cx:'企画'}]},
  { w:'keynote', m:'基調講演', p:'noun', c:'business', cs:['business','communication'], ex:[
    {en:'The CEO delivered the keynote at the conference.',ja:'CEOが会議で基調講演を行いました。',cx:'イベント'},
    {en:'The keynote focused on digital transformation.',ja:'基調講演はデジタル変革に焦点を当てました。',cx:'IT'},
    {en:'She was invited to give the keynote speech.',ja:'彼女は基調講演に招待されました。',cx:'イベント'}]},
  { w:'layoff', m:'解雇', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The company announced massive layoffs this quarter.',ja:'会社が今期大規模な解雇を発表しました。',cx:'人事'},
    {en:'Layoffs affected over 500 employees.',ja:'解雇は500人以上の社員に影響しました。',cx:'人事'},
    {en:'The threat of layoffs lowered team morale.',ja:'解雇の恐れがチームの士気を下げました。',cx:'職場'}]},
  { w:'literacy', m:'識字能力', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Digital literacy is essential in modern workplaces.',ja:'デジタル識字能力は現代の職場に不可欠です。',cx:'教育'},
    {en:'Financial literacy training is offered to all staff.',ja:'全スタッフに金融知識の研修が提供されます。',cx:'人事'},
    {en:'Improving data literacy boosts productivity.',ja:'データ識字能力の向上が生産性を高めます。',cx:'業務'}]},
  { w:'loophole', m:'抜け穴', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The company exploited a tax loophole.',ja:'会社が税の抜け穴を利用しました。',cx:'税務'},
    {en:'New regulations closed the existing loopholes.',ja:'新規制が既存の抜け穴を塞ぎました。',cx:'法務'},
    {en:'Lawyers found a loophole in the contract.',ja:'弁護士が契約の抜け穴を見つけました。',cx:'契約'}]},
  { w:'magnitude', m:'規模', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The magnitude of the project exceeded expectations.',ja:'プロジェクトの規模が予想を超えました。',cx:'企画'},
    {en:'We underestimated the magnitude of the problem.',ja:'問題の規模を過小評価していました。',cx:'経営'},
    {en:'An order of magnitude increase in sales occurred.',ja:'売上が桁違いの規模で増加しました。',cx:'営業'}]},
  { w:'manifesto', m:'声明書', p:'noun', c:'business', cs:['business','communication'], ex:[
    {en:'The CEO published a company manifesto on innovation.',ja:'CEOが革新に関する会社の声明書を公開しました。',cx:'広報'},
    {en:'The manifesto outlined the firms vision for 2030.',ja:'声明書は2030年の企業ビジョンを概説しました。',cx:'経営'},
    {en:'A new brand manifesto was shared with all teams.',ja:'新しいブランド声明書が全チームと共有されました。',cx:'マーケ'}]},
  { w:'manuscript', m:'原稿', p:'noun', c:'business', cs:['business','communication'], ex:[
    {en:'The author submitted the manuscript to the publisher.',ja:'著者が出版社に原稿を提出しました。',cx:'出版'},
    {en:'The manuscript was reviewed by three editors.',ja:'原稿が3人の編集者に査読されました。',cx:'出版'},
    {en:'Final revisions to the manuscript are due Friday.',ja:'原稿の最終修正は金曜日が締切です。',cx:'出版'}]},
  { w:'marketplace', m:'市場', p:'noun', c:'business', cs:['business','finance'], ex:[
    {en:'The global marketplace is increasingly competitive.',ja:'世界市場はますます競争が激しくなっています。',cx:'経営'},
    {en:'Our product gained traction in the marketplace.',ja:'我々の製品が市場で支持を得ました。',cx:'営業'},
    {en:'The online marketplace connects buyers and sellers.',ja:'オンライン市場が買い手と売り手を結びます。',cx:'EC'}]},
  { w:'mediation', m:'調停', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Mediation helped resolve the contract dispute.',ja:'調停が契約紛争の解決に役立ちました。',cx:'法務'},
    {en:'We offered mediation before going to court.',ja:'訴訟前に調停を提案しました。',cx:'法務'},
    {en:'The mediation process took about two weeks.',ja:'調停の過程は約2週間かかりました。',cx:'交渉'}]},
  { w:'moratorium', m:'一時停止', p:'noun', c:'business', cs:['business','finance'], ex:[
    {en:'A moratorium on new hiring was announced.',ja:'新規採用の一時停止が発表されました。',cx:'人事'},
    {en:'The bank declared a moratorium on loan payments.',ja:'銀行がローン支払いの一時停止を宣言しました。',cx:'金融'},
    {en:'A moratorium on construction was imposed.',ja:'建設の一時停止が課されました。',cx:'不動産'}]},
  { w:'municipality', m:'自治体', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The municipality approved the new zoning plan.',ja:'自治体が新しいゾーニング計画を承認しました。',cx:'行政'},
    {en:'Local municipalities share infrastructure costs.',ja:'地域の自治体がインフラ費用を分担します。',cx:'行政'},
    {en:'The municipality issued permits for the event.',ja:'自治体がイベントの許可証を発行しました。',cx:'イベント'}]},
  { w:'negligence', m:'過失', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The lawsuit was filed for professional negligence.',ja:'職業上の過失で訴訟が起こされました。',cx:'法務'},
    {en:'Negligence in safety checks caused the accident.',ja:'安全確認の過失が事故を引き起こしました。',cx:'安全'},
    {en:'Insurance may not cover damages from negligence.',ja:'保険は過失による損害をカバーしない場合があります。',cx:'保険'}]},
  { w:'notification', m:'通知', p:'noun', c:'business', cs:['business','technology'], ex:[
    {en:'You will receive a notification upon approval.',ja:'承認時に通知を受け取ります。',cx:'業務'},
    {en:'Push notifications keep users informed of updates.',ja:'プッシュ通知がユーザーに更新を知らせます。',cx:'IT'},
    {en:'Written notification must be given 30 days in advance.',ja:'書面による通知を30日前に行う必要があります。',cx:'契約'}]},
  { w:'obsolescence', m:'陳腐化', p:'noun', c:'business', cs:['business','technology'], ex:[
    {en:'Rapid obsolescence is a risk in the tech industry.',ja:'技術業界では急速な陳腐化がリスクです。',cx:'IT'},
    {en:'Planned obsolescence drives consumer spending.',ja:'計画的陳腐化が消費者支出を促進します。',cx:'マーケ'},
    {en:'The system faces obsolescence within five years.',ja:'そのシステムは5年以内に陳腐化に直面します。',cx:'IT'}]},
  { w:'omission', m:'省略', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The omission of key data affected the report.',ja:'主要データの省略が報告書に影響しました。',cx:'報告'},
    {en:'Any omission in the contract may cause issues.',ja:'契約の省略は問題を引き起こす可能性があります。',cx:'法務'},
    {en:'Errors and omissions insurance protects professionals.',ja:'誤り脱漏保険が専門家を保護します。',cx:'保険'}]},
  { w:'onboarding', m:'入社手続き', p:'noun', c:'business', cs:['business','office'], ex:[
    {en:'The onboarding process takes about one week.',ja:'入社手続きは約1週間かかります。',cx:'人事'},
    {en:'A smooth onboarding experience improves retention.',ja:'円滑な入社手続きが定着率を向上させます。',cx:'人事'},
    {en:'Digital onboarding tools streamline new hire setup.',ja:'デジタル入社ツールが新入社員のセットアップを効率化します。',cx:'IT'}]},
  { w:'ordinance', m:'条例', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The city passed an ordinance on noise levels.',ja:'市が騒音レベルの条例を可決しました。',cx:'行政'},
    {en:'Local ordinances affect business operating hours.',ja:'地方条例が営業時間に影響します。',cx:'店舗'},
    {en:'The building must comply with zoning ordinances.',ja:'建物はゾーニング条例に準拠する必要があります。',cx:'不動産'}]},
  { w:'orientation', m:'研修', p:'noun', c:'business', cs:['business','office'], ex:[
    {en:'New employee orientation starts on Monday.',ja:'新入社員研修は月曜日に始まります。',cx:'人事'},
    {en:'Customer orientation is the focus of our training.',ja:'顧客志向が我々の研修の焦点です。',cx:'研修'},
    {en:'The orientation covers company policies and culture.',ja:'研修では社内規定と企業文化を扱います。',cx:'人事'}]},
  { w:'outlay', m:'支出', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'The initial capital outlay was substantial.',ja:'初期の資本支出は相当な額でした。',cx:'投資'},
    {en:'Marketing outlays increased by 15% this year.',ja:'今年はマーケティング支出が15%増加しました。',cx:'マーケ'},
    {en:'The project requires a significant outlay upfront.',ja:'プロジェクトは多額の前払い支出を必要とします。',cx:'企画'}]},
  { w:'overhead', m:'間接費', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'We need to reduce overhead costs immediately.',ja:'直ちに間接費を削減する必要があります。',cx:'財務'},
    {en:'Office rent is our largest overhead expense.',ja:'オフィス家賃が最大の間接費です。',cx:'経理'},
    {en:'Lower overhead allows us to offer competitive prices.',ja:'低い間接費が競争力のある価格を可能にします。',cx:'経営'}]},
  { w:'ownership', m:'所有権', p:'noun', c:'business', cs:['business','finance'], ex:[
    {en:'Transfer of ownership requires legal documentation.',ja:'所有権の移転には法的書類が必要です。',cx:'法務'},
    {en:'Employee stock ownership programs boost motivation.',ja:'従業員持株制度が意欲を向上させます。',cx:'人事'},
    {en:'She took ownership of the entire project.',ja:'彼女がプロジェクト全体の所有権を取りました。',cx:'企画'}]},
  { w:'patronage', m:'愛顧', p:'noun', c:'business', cs:['business'], ex:[
    {en:'We appreciate your continued patronage.',ja:'引き続きのご愛顧に感謝いたします。',cx:'顧客対応'},
    {en:'Customer patronage has increased since the renovation.',ja:'改装以来、顧客のご愛顧が増えました。',cx:'店舗'},
    {en:'Their patronage helped the small business thrive.',ja:'彼らの愛顧が小企業の繁栄を助けました。',cx:'経営'}]},
  { w:'payroll', m:'給与台帳', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'Payroll is processed on the 25th of each month.',ja:'給与台帳は毎月25日に処理されます。',cx:'経理'},
    {en:'We switched to an automated payroll system.',ja:'自動給与台帳システムに切り替えました。',cx:'IT'},
    {en:'Payroll taxes must be filed quarterly.',ja:'給与税は四半期ごとに申告する必要があります。',cx:'税務'}]},
  { w:'penalty', m:'罰則', p:'noun', c:'business', cs:['business','finance'], ex:[
    {en:'A penalty is charged for early contract termination.',ja:'契約の早期終了には罰則が課されます。',cx:'契約'},
    {en:'The penalty for late submission is five percent.',ja:'提出遅延の罰則は5%です。',cx:'経理'},
    {en:'Tax penalties can be avoided by filing on time.',ja:'期限内申告で税の罰則を回避できます。',cx:'税務'}]},
  { w:'percentile', m:'百分位', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Our sales rank in the 90th percentile.',ja:'売上は90百分位にランクされています。',cx:'営業'},
    {en:'The score is in the top percentile nationally.',ja:'そのスコアは全国のトップ百分位です。',cx:'評価'},
    {en:'Salaries in the 75th percentile attract top talent.',ja:'75百分位の給与はトップ人材を引きつけます。',cx:'人事'}]},
  { w:'practitioner', m:'実務者', p:'noun', c:'business', cs:['business'], ex:[
    {en:'She is an experienced HR practitioner.',ja:'彼女は経験豊富な人事の実務者です。',cx:'人事'},
    {en:'Legal practitioners must maintain high standards.',ja:'法律の実務者は高い基準を維持しなければなりません。',cx:'法務'},
    {en:'Many practitioners attended the industry workshop.',ja:'多くの実務者が業界ワークショップに参加しました。',cx:'研修'}]},
  { w:'precedent', m:'先例', p:'noun', c:'business', cs:['business'], ex:[
    {en:'This case sets a precedent for future disputes.',ja:'この事例は将来の紛争に先例を作ります。',cx:'法務'},
    {en:'There is no precedent for such a large merger.',ja:'このような大規模合併に先例はありません。',cx:'経営'},
    {en:'The decision was based on historical precedent.',ja:'その決定は過去の先例に基づいていました。',cx:'判断'}]},
  { w:'premium', m:'割増金', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'Insurance premiums increased this year.',ja:'今年、保険の割増金が増加しました。',cx:'保険'},
    {en:'Customers pay a premium for express delivery.',ja:'顧客は速達に割増金を支払います。',cx:'物流'},
    {en:'Brand loyalty justifies the price premium.',ja:'ブランドへの忠誠が価格の割増金を正当化します。',cx:'マーケ'}]},
  { w:'prescription', m:'処方箋', p:'noun', c:'daily', cs:['daily','business'], ex:[
    {en:'Health insurance covers prescription medications.',ja:'健康保険が処方箋薬をカバーします。',cx:'保険'},
    {en:'The doctor issued a prescription for the employee.',ja:'医師が社員に処方箋を発行しました。',cx:'健康'},
    {en:'Prescription drug costs are rising steadily.',ja:'処方箋薬のコストが着実に上昇しています。',cx:'医療'}]},
  { w:'productivity', m:'生産性', p:'noun', c:'business', cs:['business','office'], ex:[
    {en:'Remote work can boost overall productivity.',ja:'リモートワークは全体の生産性を向上できます。',cx:'働き方'},
    {en:'We measure productivity through key metrics.',ja:'主要指標で生産性を測定しています。',cx:'経営'},
    {en:'Automation has greatly improved productivity.',ja:'自動化が生産性を大きく向上させました。',cx:'製造'}]},
  { w:'ratification', m:'批准', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Ratification of the treaty requires board approval.',ja:'条約の批准には取締役会の承認が必要です。',cx:'法務'},
    {en:'The agreement awaits ratification by both parties.',ja:'合意は両者の批准を待っています。',cx:'交渉'},
    {en:'Union ratification of the deal is expected Monday.',ja:'組合による取引の批准は月曜の見込みです。',cx:'労働'}]},
  { w:'reallocation', m:'再配分', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'Budget reallocation was approved for Q4.',ja:'第4四半期の予算再配分が承認されました。',cx:'財務'},
    {en:'Resource reallocation improved team efficiency.',ja:'資源の再配分がチームの効率を改善しました。',cx:'経営'},
    {en:'The reallocation of funds requires manager approval.',ja:'資金の再配分にはマネージャーの承認が必要です。',cx:'経理'}]},
  { w:'rebate', m:'割戻し', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'Customers receive a rebate after their purchase.',ja:'顧客は購入後に割戻しを受け取ります。',cx:'販売'},
    {en:'The supplier offered a volume rebate.',ja:'供給元が数量割戻しを提供しました。',cx:'購買'},
    {en:'Tax rebates encourage investment in green energy.',ja:'税の割戻しが環境エネルギーへの投資を促します。',cx:'税制'}]},
  { w:'recruitment', m:'採用', p:'noun', c:'business', cs:['business','office'], ex:[
    {en:'Recruitment efforts are focused on engineering talent.',ja:'採用活動はエンジニア人材に集中しています。',cx:'人事'},
    {en:'Online recruitment has become the standard.',ja:'オンライン採用が標準になりました。',cx:'人事'},
    {en:'The recruitment process takes about four weeks.',ja:'採用プロセスは約4週間かかります。',cx:'人事'}]},
  { w:'remedy', m:'救済策', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Legal remedy is available for breach of contract.',ja:'契約違反には法的救済策があります。',cx:'法務'},
    {en:'The committee proposed a remedy for the issue.',ja:'委員会がその問題の救済策を提案しました。',cx:'経営'},
    {en:'Quick remedies helped restore customer trust.',ja:'迅速な救済策が顧客の信頼を回復させました。',cx:'顧客対応'}]},
  { w:'renovation', m:'改修', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The office renovation will take three months.',ja:'オフィスの改修には3か月かかります。',cx:'施設'},
    {en:'Budget for the renovation was increased this year.',ja:'今年は改修予算が増額されました。',cx:'財務'},
    {en:'Building renovations improved employee satisfaction.',ja:'建物の改修が社員満足度を向上させました。',cx:'施設'}]},
  { w:'requisition', m:'請求書', p:'noun', c:'business', cs:['business','office'], ex:[
    {en:'Submit a purchase requisition for office supplies.',ja:'事務用品の購入請求書を提出してください。',cx:'購買'},
    {en:'The requisition was approved by the department head.',ja:'請求書が部門長に承認されました。',cx:'承認'},
    {en:'All requisitions must be filed before month end.',ja:'全ての請求書は月末までに提出する必要があります。',cx:'経理'}]},
  { w:'residual', m:'残余', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'The residual value of the asset was calculated.',ja:'資産の残余価値が計算されました。',cx:'経理'},
    {en:'Residual income is profit after deducting costs.',ja:'残余所得はコスト控除後の利益です。',cx:'財務'},
    {en:'Lease residuals affect monthly payment amounts.',ja:'リースの残余が月々の支払額に影響します。',cx:'リース'}]},
  { w:'scenario', m:'想定', p:'noun', c:'business', cs:['business'], ex:[
    {en:'We prepared for the worst-case scenario.',ja:'最悪の想定に備えました。',cx:'危機管理'},
    {en:'Multiple scenarios were presented to the board.',ja:'複数の想定が取締役会に提示されました。',cx:'経営'},
    {en:'Under this scenario, revenue increases by 10%.',ja:'この想定では収益が10%増加します。',cx:'計画'}]},
  { w:'scholarship', m:'奨学金', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The company offers scholarships for employee children.',ja:'会社が社員の子供に奨学金を提供しています。',cx:'福利厚生'},
    {en:'She won a scholarship for her MBA program.',ja:'彼女がMBAプログラムの奨学金を獲得しました。',cx:'教育'},
    {en:'Scholarship applications are due by March.',ja:'奨学金の申請締切は3月です。',cx:'教育'}]},
  { w:'settlement', m:'和解', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The parties reached a settlement out of court.',ja:'当事者は法廷外で和解に達しました。',cx:'法務'},
    {en:'The settlement amount was kept confidential.',ja:'和解金額は秘密にされました。',cx:'法務'},
    {en:'Payment settlement occurs within two business days.',ja:'決済は2営業日以内に行われます。',cx:'経理'}]},
  { w:'shareholder', m:'株主', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'Shareholders approved the annual dividend.',ja:'株主が年間配当を承認しました。',cx:'投資'},
    {en:'A letter was sent to all shareholders.',ja:'全株主に書簡が送られました。',cx:'広報'},
    {en:'Major shareholders attended the general meeting.',ja:'主要株主が総会に出席しました。',cx:'経営'}]},
  { w:'shortfall', m:'不足', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'The revenue shortfall was due to weak demand.',ja:'収入の不足は需要低迷によるものでした。',cx:'財務'},
    {en:'A staffing shortfall delayed the project.',ja:'人員の不足がプロジェクトを遅らせました。',cx:'人事'},
    {en:'We must address the budget shortfall this quarter.',ja:'今四半期中に予算の不足に対処する必要があります。',cx:'経営'}]},
  { w:'stakeholder', m:'利害関係者', p:'noun', c:'business', cs:['business'], ex:[
    {en:'All stakeholders were invited to the review meeting.',ja:'全利害関係者がレビュー会議に招待されました。',cx:'企画'},
    {en:'Stakeholder feedback shaped the final proposal.',ja:'利害関係者のフィードバックが最終提案を形成しました。',cx:'経営'},
    {en:'Key stakeholders must approve the design changes.',ja:'主要利害関係者が設計変更を承認する必要があります。',cx:'開発'}]},
  { w:'statistic', m:'統計', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The statistics show a clear upward trend.',ja:'統計は明確な上昇傾向を示しています。',cx:'分析'},
    {en:'Labor statistics were released by the government.',ja:'政府が労働統計を公開しました。',cx:'行政'},
    {en:'We use statistics to guide our decisions.',ja:'意思決定の指針として統計を使います。',cx:'経営'}]},
  { w:'stipulation', m:'条件', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The contract includes a non-compete stipulation.',ja:'契約に競業禁止の条件が含まれています。',cx:'契約'},
    {en:'A key stipulation is on-time delivery.',ja:'重要な条件は期日通りの納品です。',cx:'取引'},
    {en:'All stipulations must be agreed upon before signing.',ja:'署名前に全ての条件に合意する必要があります。',cx:'法務'}]},
  { w:'stockholder', m:'出資者', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'Stockholders received quarterly dividend reports.',ja:'出資者は四半期の配当報告を受け取りました。',cx:'投資'},
    {en:'A meeting was held for minority stockholders.',ja:'少数出資者のための会議が開かれました。',cx:'経営'},
    {en:'Stockholder equity increased year over year.',ja:'出資者の持分が前年比で増加しました。',cx:'財務'}]},
  { w:'strategy', m:'戦略', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The board approved a new growth strategy.',ja:'取締役会が新しい成長戦略を承認しました。',cx:'経営'},
    {en:'Our marketing strategy targets young professionals.',ja:'マーケティング戦略は若手専門家を対象とします。',cx:'マーケ'},
    {en:'A clear exit strategy is essential for investors.',ja:'投資家にとって明確な出口戦略は不可欠です。',cx:'投資'}]},
  { w:'succession', m:'後継', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Succession planning ensures leadership continuity.',ja:'後継計画がリーダーシップの継続を保証します。',cx:'人事'},
    {en:'The CEO announced his succession plan.',ja:'CEOが後継計画を発表しました。',cx:'経営'},
    {en:'A smooth succession was achieved after retirement.',ja:'退職後に円滑な後継が実現しました。',cx:'人事'}]},
  { w:'suspension', m:'停止', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The employee faced a three-day suspension.',ja:'社員は3日間の停止処分を受けました。',cx:'人事'},
    {en:'Trading suspension was imposed on the stock.',ja:'その株式に取引停止が課されました。',cx:'金融'},
    {en:'Suspension of operations caused delays.',ja:'業務の停止が遅延を引き起こしました。',cx:'経営'}]},
  { w:'symposium', m:'討論会', p:'noun', c:'business', cs:['business','communication'], ex:[
    {en:'An industry symposium will be held in Tokyo.',ja:'業界の討論会が東京で開催されます。',cx:'イベント'},
    {en:'She presented her research at the symposium.',ja:'彼女が討論会で研究を発表しました。',cx:'学術'},
    {en:'The symposium attracted over 300 participants.',ja:'討論会に300人以上が参加しました。',cx:'イベント'}]},
  { w:'tenure', m:'在職期間', p:'noun', c:'business', cs:['business'], ex:[
    {en:'His tenure as CEO lasted twelve years.',ja:'彼のCEOとしての在職期間は12年でした。',cx:'経営'},
    {en:'Job security increases with longer tenure.',ja:'在職期間が長いほど雇用の安定が増します。',cx:'人事'},
    {en:'During her tenure, profits doubled.',ja:'彼女の在職期間中に利益が倍増しました。',cx:'業績'}]},
  { w:'termination', m:'終了', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Contract termination requires 60 days notice.',ja:'契約の終了には60日前の通知が必要です。',cx:'契約'},
    {en:'The termination of the project surprised the team.',ja:'プロジェクトの終了がチームを驚かせました。',cx:'企画'},
    {en:'Employment termination must follow legal procedures.',ja:'雇用の終了は法的手続きに従う必要があります。',cx:'人事'}]},
  { w:'territory', m:'領域', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Each sales rep covers an assigned territory.',ja:'各営業担当が割り当てられた領域をカバーします。',cx:'営業'},
    {en:'The brand expanded into new territories.',ja:'ブランドが新しい領域に拡大しました。',cx:'経営'},
    {en:'Territory disputes were resolved through mediation.',ja:'領域の紛争は調停で解決されました。',cx:'交渉'}]},
  { w:'threshold', m:'基準値', p:'noun', c:'business', cs:['business','finance'], ex:[
    {en:'Revenue exceeded the billion-dollar threshold.',ja:'収益が10億ドルの基準値を超えました。',cx:'財務'},
    {en:'The tax-free threshold was raised this year.',ja:'今年、非課税の基準値が引き上げられました。',cx:'税制'},
    {en:'Performance below the threshold triggers a review.',ja:'基準値を下回る成績はレビューを引き起こします。',cx:'評価'}]},
  { w:'timeline', m:'工程表', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The project timeline was extended by two weeks.',ja:'プロジェクトの工程表が2週間延長されました。',cx:'企画'},
    {en:'Please share the updated timeline with the team.',ja:'更新された工程表をチームと共有してください。',cx:'会議'},
    {en:'Meeting the timeline is critical for launch.',ja:'工程表の遵守は発売に不可欠です。',cx:'経営'}]},
  { w:'tribunal', m:'裁判所', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The dispute was brought before the tribunal.',ja:'紛争が裁判所に持ち込まれました。',cx:'法務'},
    {en:'The employment tribunal ruled in her favor.',ja:'雇用裁判所が彼女に有利な判決を下しました。',cx:'労働'},
    {en:'An international tribunal handled the trade case.',ja:'国際裁判所が貿易事件を扱いました。',cx:'貿易'}]},
  { w:'tuition', m:'授業料', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The company reimburses tuition for job-related courses.',ja:'会社が業務関連講座の授業料を償還します。',cx:'福利厚生'},
    {en:'Tuition costs have risen steadily.',ja:'授業料は着実に上昇しています。',cx:'教育'},
    {en:'A tuition assistance program is available for staff.',ja:'スタッフに授業料支援プログラムがあります。',cx:'人事'}]},
  { w:'undertaking', m:'事業', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The merger is a complex undertaking.',ja:'合併は複雑な事業です。',cx:'経営'},
    {en:'This joint undertaking benefits both companies.',ja:'この共同事業は両社に利益をもたらします。',cx:'提携'},
    {en:'The undertaking was completed ahead of schedule.',ja:'事業は予定より早く完了しました。',cx:'企画'}]},
  { w:'upkeep', m:'維持費', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'The upkeep of the facility is costly.',ja:'施設の維持費は高額です。',cx:'施設'},
    {en:'Annual upkeep costs are included in the budget.',ja:'年間維持費が予算に含まれています。',cx:'財務'},
    {en:'Regular upkeep prevents expensive repairs.',ja:'定期的な維持が高額な修理を防ぎます。',cx:'施設管理'}]},
  { w:'utilization', m:'活用', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Resource utilization improved by 30%.',ja:'資源の活用が30%向上しました。',cx:'経営'},
    {en:'Full utilization of the office space is planned.',ja:'オフィススペースの完全活用が計画されています。',cx:'施設'},
    {en:'Data utilization drives better decision-making.',ja:'データの活用がより良い意思決定を促します。',cx:'IT'}]},
  { w:'validation', m:'妥当性確認', p:'noun', c:'business', cs:['business','technology'], ex:[
    {en:'Data validation ensures accuracy of inputs.',ja:'データの妥当性確認が入力の正確さを保証します。',cx:'IT'},
    {en:'Market validation confirmed demand for the product.',ja:'市場の妥当性確認が製品需要を裏付けました。',cx:'マーケ'},
    {en:'The validation process takes about three days.',ja:'妥当性確認の過程は約3日かかります。',cx:'品質'}]},
  { w:'vendor', m:'販売業者', p:'noun', c:'business', cs:['business'], ex:[
    {en:'We selected a new vendor for office supplies.',ja:'事務用品の新しい販売業者を選びました。',cx:'購買'},
    {en:'Vendor performance is reviewed quarterly.',ja:'販売業者の実績は四半期ごとに評価されます。',cx:'購買'},
    {en:'The vendor delivered the goods on time.',ja:'販売業者が期日通りに商品を納品しました。',cx:'物流'}]},
  { w:'verification', m:'確認', p:'noun', c:'business', cs:['business','technology'], ex:[
    {en:'Identity verification is required for new accounts.',ja:'新規口座には本人確認が必要です。',cx:'金融'},
    {en:'Verification of credentials takes two business days.',ja:'資格の確認には2営業日かかります。',cx:'人事'},
    {en:'The system sends a verification code via email.',ja:'システムがメールで確認コードを送信します。',cx:'IT'}]},
  { w:'violation', m:'違反', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Safety violations can result in heavy fines.',ja:'安全違反は多額の罰金につながりえます。',cx:'安全'},
    {en:'The violation was reported to the compliance team.',ja:'違反がコンプライアンスチームに報告されました。',cx:'コンプラ'},
    {en:'Repeated violations lead to contract termination.',ja:'繰り返しの違反は契約終了につながります。',cx:'契約'}]},
  { w:'workforce', m:'労働力', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The global workforce is becoming more diverse.',ja:'世界の労働力はより多様化しています。',cx:'人事'},
    {en:'Workforce planning is critical for growth.',ja:'労働力の計画は成長に不可欠です。',cx:'経営'},
    {en:'A skilled workforce gives us a competitive edge.',ja:'熟練した労働力が競争力を与えます。',cx:'経営'}]},

  // ---- Adjectives/Adverbs ----
  { w:'adjacent', m:'隣接した', p:'adjective', c:'daily', cs:['daily','business'], ex:[
    {en:'The conference room is adjacent to the lobby.',ja:'会議室はロビーに隣接しています。',cx:'オフィス'},
    {en:'We rented the adjacent office for expansion.',ja:'拡張のため隣接するオフィスを借りました。',cx:'施設'},
    {en:'The factory is adjacent to the railway station.',ja:'工場は駅に隣接しています。',cx:'立地'}]},
  { w:'applicable', m:'適用可能な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'These rules are applicable to all departments.',ja:'これらの規則は全部門に適用可能です。',cx:'規則'},
    {en:'Please attach all applicable documents.',ja:'該当する書類をすべて添付してください。',cx:'業務'},
    {en:'The discount is applicable only to annual plans.',ja:'割引は年間プランにのみ適用可能です。',cx:'販売'}]},
  { w:'approximate', m:'おおよその', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The approximate cost is two million dollars.',ja:'おおよその費用は200万ドルです。',cx:'見積'},
    {en:'We gave an approximate delivery date.',ja:'おおよその納期をお伝えしました。',cx:'物流'},
    {en:'The approximate headcount is 500 employees.',ja:'おおよその人数は500名です。',cx:'人事'}]},
  { w:'arbitrary', m:'任意の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The deadline seemed arbitrary and unreasonable.',ja:'締切は任意的で不合理に思えました。',cx:'業務'},
    {en:'Decisions should not be made on arbitrary grounds.',ja:'決定は任意の根拠に基づくべきではありません。',cx:'経営'},
    {en:'The pricing was criticized as arbitrary.',ja:'価格設定が任意的だと批判されました。',cx:'販売'}]},
  { w:'assertive', m:'自己主張の強い', p:'adjective', c:'communication', cs:['communication','business'], ex:[
    {en:'An assertive approach is valued in negotiations.',ja:'交渉では自己主張の強い姿勢が評価されます。',cx:'交渉'},
    {en:'She gave an assertive presentation to the board.',ja:'彼女は取締役会に堂々としたプレゼンをしました。',cx:'会議'},
    {en:'Being assertive helps in leadership roles.',ja:'自己主張が強いことはリーダーに役立ちます。',cx:'キャリア'}]},
  { w:'binding', m:'拘束力のある', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The agreement is legally binding for both parties.',ja:'合意は両者に法的拘束力があります。',cx:'契約'},
    {en:'A binding contract was signed yesterday.',ja:'拘束力のある契約が昨日署名されました。',cx:'法務'},
    {en:'The arbitration decision is binding.',ja:'仲裁の決定は拘束力があります。',cx:'法務'}]},
  { w:'bipartisan', m:'超党派の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The bill received bipartisan support.',ja:'法案は超党派の支持を受けました。',cx:'政治'},
    {en:'A bipartisan committee was formed.',ja:'超党派の委員会が設立されました。',cx:'行政'},
    {en:'Bipartisan cooperation led to the reform.',ja:'超党派の協力が改革につながりました。',cx:'政策'}]},
  { w:'burgeoning', m:'急成長の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The burgeoning tech sector attracts investors.',ja:'急成長のテック部門が投資家を引きつけます。',cx:'投資'},
    {en:'Demand for green energy is burgeoning.',ja:'環境エネルギーの需要が急成長しています。',cx:'エネルギー'},
    {en:'The city has a burgeoning startup scene.',ja:'その都市にはスタートアップが急成長しています。',cx:'経済'}]},
  { w:'centralized', m:'集中型の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'We use a centralized database for all records.',ja:'全記録に集中型データベースを使っています。',cx:'IT'},
    {en:'A centralized management approach was adopted.',ja:'集中型の管理手法が採用されました。',cx:'経営'},
    {en:'Procurement is handled by a centralized team.',ja:'購買は集中型のチームが担当しています。',cx:'購買'}]},
  { w:'chronic', m:'慢性的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The company faces chronic understaffing issues.',ja:'会社は慢性的な人手不足の問題に直面しています。',cx:'人事'},
    {en:'Chronic delays led to customer complaints.',ja:'慢性的な遅延が顧客苦情につながりました。',cx:'品質'},
    {en:'The region suffers from chronic infrastructure problems.',ja:'その地域は慢性的なインフラ問題を抱えています。',cx:'行政'}]},
  { w:'comparable', m:'同等の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Our prices are comparable to those of competitors.',ja:'当社の価格は競合と同等です。',cx:'販売'},
    {en:'The two products offer comparable quality.',ja:'2つの製品は同等の品質を提供します。',cx:'製品'},
    {en:'Salaries should be comparable across similar roles.',ja:'類似職種間で給与は同等であるべきです。',cx:'人事'}]},
  { w:'compelling', m:'説得力のある', p:'adjective', c:'communication', cs:['communication','business'], ex:[
    {en:'She made a compelling case for the investment.',ja:'彼女は投資の説得力のある主張をしました。',cx:'提案'},
    {en:'The data presents a compelling argument.',ja:'データは説得力のある論拠を示しています。',cx:'報告'},
    {en:'A compelling pitch won us the contract.',ja:'説得力のあるプレゼンが契約を勝ち取りました。',cx:'営業'}]},
  { w:'compliant', m:'準拠した', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'All products must be compliant with regulations.',ja:'全製品が規制に準拠する必要があります。',cx:'品質'},
    {en:'The system is fully compliant with data laws.',ja:'システムはデータ法に完全準拠しています。',cx:'IT'},
    {en:'Non-compliant vendors will be removed.',ja:'準拠していない業者は除外されます。',cx:'購買'}]},
  { w:'compulsory', m:'義務的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Safety training is compulsory for all employees.',ja:'安全研修は全社員に義務的です。',cx:'人事'},
    {en:'Compulsory retirement age is set at 65.',ja:'義務的な定年は65歳に設定されています。',cx:'規則'},
    {en:'Attendance at the meeting is compulsory.',ja:'会議への出席は義務的です。',cx:'オフィス'}]},
  { w:'concurrent', m:'同時の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'We manage multiple concurrent projects.',ja:'複数の同時進行プロジェクトを管理しています。',cx:'企画'},
    {en:'Concurrent sessions are available at the conference.',ja:'会議で同時開催のセッションがあります。',cx:'イベント'},
    {en:'The system handles concurrent user access.',ja:'システムが同時ユーザーアクセスを処理します。',cx:'IT'}]},
  { w:'confidential', m:'機密の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'This document is strictly confidential.',ja:'この文書は厳密に機密です。',cx:'法務'},
    {en:'Confidential information must not be shared.',ja:'機密情報を共有してはなりません。',cx:'コンプラ'},
    {en:'The meeting discussed confidential financial data.',ja:'会議で機密の財務データが議論されました。',cx:'経営'}]},
  { w:'consecutive', m:'連続した', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Sales grew for five consecutive quarters.',ja:'5四半期連続で売上が成長しました。',cx:'業績'},
    {en:'She worked three consecutive weekends.',ja:'彼女は3週末連続で働きました。',cx:'勤務'},
    {en:'The team won consecutive awards for excellence.',ja:'チームは連続して優秀賞を受賞しました。',cx:'実績'}]},
  { w:'consolidated', m:'統合された', p:'adjective', c:'finance', cs:['finance','business'], ex:[
    {en:'The consolidated report covers all subsidiaries.',ja:'統合報告書は全子会社をカバーしています。',cx:'経理'},
    {en:'We prepared consolidated financial statements.',ja:'統合財務諸表を作成しました。',cx:'決算'},
    {en:'A consolidated approach saves time and money.',ja:'統合されたアプローチが時間とお金を節約します。',cx:'経営'}]},
  { w:'constitutive', m:'構成的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Innovation is a constitutive element of our culture.',ja:'イノベーションは我々の文化の構成的要素です。',cx:'企業文化'},
    {en:'Trust is constitutive of effective teamwork.',ja:'信頼は効果的なチームワークの構成的要素です。',cx:'組織'},
    {en:'These values are constitutive of our brand.',ja:'これらの価値は我々のブランドの構成的要素です。',cx:'マーケ'}]},
  { w:'customary', m:'慣例の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'It is customary to exchange business cards first.',ja:'最初に名刺交換するのが慣例です。',cx:'ビジネスマナー'},
    {en:'The customary notice period is two weeks.',ja:'慣例の通知期間は2週間です。',cx:'人事'},
    {en:'Tipping is customary in many service industries.',ja:'チップはサービス業で慣例的です。',cx:'接客'}]},
  { w:'decentralized', m:'分散型の', p:'adjective', c:'business', cs:['business','technology'], ex:[
    {en:'A decentralized management style empowers teams.',ja:'分散型の経営スタイルがチームに権限を与えます。',cx:'経営'},
    {en:'Decentralized systems are more fault-tolerant.',ja:'分散型システムは耐障害性が高いです。',cx:'IT'},
    {en:'The firm shifted to a decentralized structure.',ja:'会社が分散型の構造に移行しました。',cx:'組織'}]},
  { w:'definitive', m:'最終的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The board issued a definitive ruling on the matter.',ja:'取締役会がその件で最終的な判断を下しました。',cx:'経営'},
    {en:'A definitive answer is expected by Friday.',ja:'金曜日までに最終的な回答が期待されています。',cx:'交渉'},
    {en:'This is the definitive guide to our procedures.',ja:'これが当社の手続きの最終的なガイドです。',cx:'業務'}]},
  { w:'designated', m:'指定された', p:'adjective', c:'business', cs:['business','office'], ex:[
    {en:'Please park in the designated area.',ja:'指定されたエリアに駐車してください。',cx:'施設'},
    {en:'A designated contact person handles all inquiries.',ja:'指定された担当者が全問い合わせに対応します。',cx:'顧客対応'},
    {en:'Smoking is allowed only in designated zones.',ja:'喫煙は指定されたゾーンでのみ許可されています。',cx:'規則'}]},
  { w:'disruptive', m:'破壊的な', p:'adjective', c:'business', cs:['business','technology'], ex:[
    {en:'Disruptive technology changed the entire industry.',ja:'破壊的な技術が業界全体を変えました。',cx:'IT'},
    {en:'The startup introduced a disruptive business model.',ja:'そのスタートアップが破壊的ビジネスモデルを導入しました。',cx:'経営'},
    {en:'Disruptive innovation creates new market leaders.',ja:'破壊的イノベーションが新たな市場リーダーを生みます。',cx:'市場'}]},
  { w:'diverse', m:'多様な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'A diverse workforce brings fresh perspectives.',ja:'多様な労働力が新鮮な視点をもたらします。',cx:'人事'},
    {en:'We serve a diverse range of clients.',ja:'多様な顧客にサービスを提供しています。',cx:'営業'},
    {en:'The portfolio includes diverse asset classes.',ja:'ポートフォリオに多様な資産クラスが含まれます。',cx:'投資'}]},
  { w:'dominant', m:'支配的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'They hold a dominant position in the market.',ja:'彼らは市場で支配的な地位にあります。',cx:'経営'},
    {en:'Cost reduction is the dominant concern this year.',ja:'今年はコスト削減が支配的な課題です。',cx:'財務'},
    {en:'The dominant player sets industry standards.',ja:'支配的なプレーヤーが業界基準を設定します。',cx:'市場'}]},
  { w:'durable', m:'耐久性のある', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Our products are designed to be durable.',ja:'当社の製品は耐久性があるよう設計されています。',cx:'製品'},
    {en:'Durable goods sales increased this month.',ja:'今月は耐久消費財の売上が増加しました。',cx:'経済'},
    {en:'We use durable materials to reduce replacements.',ja:'交換を減らすため耐久性のある素材を使います。',cx:'製造'}]},
  { w:'equitable', m:'公平な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'An equitable distribution of resources is essential.',ja:'資源の公平な分配が不可欠です。',cx:'経営'},
    {en:'The settlement was considered equitable by both sides.',ja:'和解は両者に公平だと考えられました。',cx:'法務'},
    {en:'Equitable pay practices attract diverse talent.',ja:'公平な給与慣行が多様な人材を引きつけます。',cx:'人事'}]},
  { w:'exemplary', m:'模範的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Her performance this year has been exemplary.',ja:'今年の彼女の業績は模範的でした。',cx:'評価'},
    {en:'The team delivered exemplary customer service.',ja:'チームが模範的な顧客サービスを提供しました。',cx:'サービス'},
    {en:'Exemplary conduct is recognized at annual awards.',ja:'模範的な行動は年次表彰で評価されます。',cx:'表彰'}]},
  { w:'generic', m:'一般的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The company produces both branded and generic products.',ja:'会社はブランド品と一般的な製品の両方を生産しています。',cx:'製品'},
    {en:'A generic template is available for reports.',ja:'報告書用の一般的なテンプレートがあります。',cx:'業務'},
    {en:'Generic solutions may not address specific needs.',ja:'一般的な解決策では特定のニーズに対応できない場合があります。',cx:'コンサル'}]},
  { w:'holistic', m:'包括的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'We take a holistic approach to employee wellbeing.',ja:'社員の幸福に包括的なアプローチを取ります。',cx:'人事'},
    {en:'A holistic review of the supply chain is needed.',ja:'サプライチェーンの包括的な見直しが必要です。',cx:'物流'},
    {en:'Holistic planning ensures nothing is overlooked.',ja:'包括的な計画により見落としがなくなります。',cx:'企画'}]},
  { w:'hypothetical', m:'仮定の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Let us consider a hypothetical scenario.',ja:'仮定のシナリオを考えましょう。',cx:'会議'},
    {en:'The analysis is based on hypothetical data.',ja:'分析は仮定のデータに基づいています。',cx:'報告'},
    {en:'Hypothetical risks were also assessed.',ja:'仮定のリスクも評価されました。',cx:'リスク管理'}]},
  { w:'imminent', m:'差し迫った', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'An imminent product launch requires full preparation.',ja:'差し迫った製品発売には万全の準備が必要です。',cx:'企画'},
    {en:'The merger announcement is imminent.',ja:'合併の発表が差し迫っています。',cx:'経営'},
    {en:'Staff were warned of imminent layoffs.',ja:'社員に差し迫った解雇の警告がありました。',cx:'人事'}]},
  { w:'implicit', m:'暗黙の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'There is an implicit understanding between the teams.',ja:'チーム間に暗黙の了解があります。',cx:'組織'},
    {en:'The contract has several implicit obligations.',ja:'契約にはいくつかの暗黙の義務があります。',cx:'法務'},
    {en:'Customer trust is an implicit part of our brand.',ja:'顧客の信頼はブランドの暗黙の一部です。',cx:'マーケ'}]},
  { w:'inaugural', m:'就任の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The inaugural conference was a great success.',ja:'就任の会議は大成功でした。',cx:'イベント'},
    {en:'Her inaugural speech inspired the whole company.',ja:'彼女の就任の演説が会社全体を鼓舞しました。',cx:'経営'},
    {en:'The inaugural edition of the report was released.',ja:'報告書の第1号が公開されました。',cx:'出版'}]},
  { w:'incremental', m:'段階的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'We prefer incremental improvements over big changes.',ja:'大きな変更より段階的な改善を好みます。',cx:'経営'},
    {en:'Incremental revenue from the new feature is promising.',ja:'新機能からの段階的な収益が有望です。',cx:'開発'},
    {en:'An incremental approach reduces project risk.',ja:'段階的なアプローチがプロジェクトのリスクを減らします。',cx:'企画'}]},
  { w:'indigenous', m:'土着の', p:'adjective', c:'daily', cs:['daily','business'], ex:[
    {en:'We partner with indigenous communities.',ja:'土着のコミュニティと提携しています。',cx:'CSR'},
    {en:'Indigenous knowledge supports sustainable practices.',ja:'土着の知識が持続可能な慣行を支えます。',cx:'環境'},
    {en:'The program respects indigenous cultural values.',ja:'そのプログラムは土着の文化的価値を尊重します。',cx:'社会'}]},
  { w:'inherent', m:'固有の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Every investment carries inherent risks.',ja:'あらゆる投資には固有のリスクがあります。',cx:'投資'},
    {en:'Quality is an inherent part of our brand.',ja:'品質は我々のブランドの固有の要素です。',cx:'マーケ'},
    {en:'The plan has inherent weaknesses.',ja:'計画には固有の弱点があります。',cx:'企画'}]},
  { w:'integral', m:'不可欠な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Teamwork is integral to our success.',ja:'チームワークは我々の成功に不可欠です。',cx:'組織'},
    {en:'Data analysis is integral to marketing.',ja:'データ分析はマーケティングに不可欠です。',cx:'マーケ'},
    {en:'Safety checks are integral to the process.',ja:'安全確認は工程に不可欠です。',cx:'製造'}]},
  { w:'interim', m:'暫定の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'An interim CEO was appointed during the transition.',ja:'移行期間中に暫定のCEOが任命されました。',cx:'人事'},
    {en:'The interim report will be ready next week.',ja:'暫定の報告書は来週準備できます。',cx:'報告'},
    {en:'Interim measures were put in place immediately.',ja:'暫定的な措置が即座に講じられました。',cx:'危機管理'}]},
  { w:'intrinsic', m:'本質的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Employee motivation has intrinsic value.',ja:'社員のモチベーションには本質的な価値があります。',cx:'人事'},
    {en:'Innovation is intrinsic to our company culture.',ja:'イノベーションは企業文化に本質的です。',cx:'経営'},
    {en:'The intrinsic quality of the material is superior.',ja:'その素材の本質的な品質は優れています。',cx:'製造'}]},
  { w:'lateral', m:'水平的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'She made a lateral move to the marketing team.',ja:'彼女はマーケティングチームに水平的な異動をしました。',cx:'人事'},
    {en:'Lateral thinking helps solve complex problems.',ja:'水平的な思考が複雑な問題解決に役立ちます。',cx:'経営'},
    {en:'A lateral transfer does not involve a promotion.',ja:'水平的な異動には昇進は含まれません。',cx:'人事'}]},
  { w:'modest', m:'控えめな', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'We expect modest growth in the next quarter.',ja:'次の四半期は控えめな成長を予想しています。',cx:'予測'},
    {en:'The budget allows only modest improvements.',ja:'予算は控えめな改善のみ許容します。',cx:'財務'},
    {en:'Salary increases were modest due to tight budgets.',ja:'予算制約により給与増加は控えめでした。',cx:'人事'}]},
  { w:'municipal', m:'市の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Municipal bonds offer tax-free income.',ja:'市の債券は非課税収入を提供します。',cx:'金融'},
    {en:'The project requires municipal approval.',ja:'プロジェクトには市の承認が必要です。',cx:'行政'},
    {en:'Municipal regulations govern building codes.',ja:'市の規制が建築基準を管理しています。',cx:'不動産'}]},
  { w:'negligible', m:'無視できる', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The impact on revenue was negligible.',ja:'収益への影響は無視できるものでした。',cx:'財務'},
    {en:'Risk of failure is considered negligible.',ja:'失敗のリスクは無視できると考えられます。',cx:'リスク管理'},
    {en:'The cost difference is negligible.',ja:'コストの差は無視できます。',cx:'購買'}]},
  { w:'ongoing', m:'進行中の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The investigation is still ongoing.',ja:'調査はまだ進行中です。',cx:'監査'},
    {en:'Ongoing maintenance ensures system reliability.',ja:'進行中のメンテナンスがシステムの信頼性を保証します。',cx:'IT'},
    {en:'We have ongoing negotiations with the vendor.',ja:'業者との交渉が進行中です。',cx:'購買'}]},
  { w:'operational', m:'運用上の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Operational costs need to be reduced by 10%.',ja:'運用上のコストを10%削減する必要があります。',cx:'経営'},
    {en:'The new system is now fully operational.',ja:'新システムが完全に運用可能になりました。',cx:'IT'},
    {en:'Operational efficiency improved after the restructuring.',ja:'再編後に運用上の効率が向上しました。',cx:'業務'}]},
  { w:'optimal', m:'最適な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'We seek the optimal solution for each client.',ja:'各顧客に最適な解決策を追求します。',cx:'コンサル'},
    {en:'The server runs at optimal performance.',ja:'サーバーが最適なパフォーマンスで動作しています。',cx:'IT'},
    {en:'Timing was not optimal for the product launch.',ja:'製品発売のタイミングは最適ではありませんでした。',cx:'マーケ'}]},
  { w:'paramount', m:'最重要の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Customer safety is of paramount importance.',ja:'顧客の安全は最重要です。',cx:'品質'},
    {en:'Data security is paramount in our operations.',ja:'データセキュリティは我々の業務で最重要です。',cx:'IT'},
    {en:'Meeting the deadline is paramount.',ja:'締切を守ることが最重要です。',cx:'業務'}]},
  { w:'pending', m:'保留中の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Several applications are still pending.',ja:'いくつかの申請がまだ保留中です。',cx:'業務'},
    {en:'The decision is pending board approval.',ja:'決定は取締役会の承認が保留中です。',cx:'経営'},
    {en:'There are no pending issues on the agenda.',ja:'議題に保留中の問題はありません。',cx:'会議'}]},
  { w:'pertinent', m:'関連のある', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Please provide all pertinent information.',ja:'関連のある情報をすべて提供してください。',cx:'業務'},
    {en:'Only pertinent data should be included.',ja:'関連のあるデータのみ含めるべきです。',cx:'報告'},
    {en:'Her question was highly pertinent to the topic.',ja:'彼女の質問はトピックに大変関連がありました。',cx:'会議'}]},
  { w:'pivotal', m:'極めて重要な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'This quarter is pivotal for our expansion plan.',ja:'今四半期は拡大計画に極めて重要です。',cx:'経営'},
    {en:'She played a pivotal role in the negotiations.',ja:'彼女は交渉で極めて重要な役割を果たしました。',cx:'交渉'},
    {en:'The meeting was pivotal in shaping our strategy.',ja:'会議は戦略形成に極めて重要でした。',cx:'企画'}]},
  { w:'plausible', m:'妥当な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The explanation seemed plausible to the board.',ja:'説明は取締役会に妥当に思えました。',cx:'経営'},
    {en:'A plausible forecast was presented.',ja:'妥当な予測が提示されました。',cx:'計画'},
    {en:'Is this a plausible scenario for next year?',ja:'これは来年の妥当なシナリオですか？',cx:'企画'}]},
  { w:'predominant', m:'主要な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Cost is the predominant factor in the decision.',ja:'コストが決定の主要な要因です。',cx:'経営'},
    {en:'English is the predominant business language.',ja:'英語が主要なビジネス言語です。',cx:'国際'},
    {en:'The predominant trend is toward remote work.',ja:'主要なトレンドはリモートワークに向かっています。',cx:'働き方'}]},
  { w:'prevalent', m:'広く行われる', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Remote work has become prevalent in the industry.',ja:'リモートワークが業界で広く行われるようになりました。',cx:'働き方'},
    {en:'This practice is prevalent in European markets.',ja:'この慣行は欧州市場で広く行われています。',cx:'市場'},
    {en:'Cybersecurity threats are increasingly prevalent.',ja:'サイバーセキュリティの脅威がますます広く見られます。',cx:'IT'}]},
  { w:'proactive', m:'先手を打つ', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'A proactive approach prevents costly mistakes.',ja:'先手を打つアプローチが高額な失敗を防ぎます。',cx:'経営'},
    {en:'We encourage proactive communication with clients.',ja:'顧客との先手を打つ連絡を推奨しています。',cx:'顧客対応'},
    {en:'Being proactive sets you apart as a leader.',ja:'先手を打つことがリーダーとして差をつけます。',cx:'キャリア'}]},
  { w:'proficient', m:'堪能な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'She is proficient in both English and Japanese.',ja:'彼女は英語と日本語の両方に堪能です。',cx:'言語'},
    {en:'Proficient use of Excel is required for the role.',ja:'この職種にはExcelの堪能な使用が求められます。',cx:'求人'},
    {en:'The team is highly proficient in data analysis.',ja:'チームはデータ分析に非常に堪能です。',cx:'スキル'}]},
  { w:'progressive', m:'進歩的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The company adopted a progressive work policy.',ja:'会社が進歩的な勤務方針を採用しました。',cx:'人事'},
    {en:'Progressive tax rates apply to higher incomes.',ja:'進歩的な税率が高所得に適用されます。',cx:'税制'},
    {en:'A progressive approach to training boosts retention.',ja:'進歩的な研修アプローチが定着率を向上させます。',cx:'教育'}]},
  { w:'quarterly', m:'四半期の', p:'adjective', c:'finance', cs:['finance','business'], ex:[
    {en:'Quarterly earnings exceeded analyst forecasts.',ja:'四半期の収益がアナリスト予測を超えました。',cx:'決算'},
    {en:'The quarterly review is scheduled for next week.',ja:'四半期のレビューは来週に予定されています。',cx:'経営'},
    {en:'We publish quarterly reports for stakeholders.',ja:'利害関係者向けに四半期の報告書を発行しています。',cx:'広報'}]},
  { w:'reciprocal', m:'相互の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The two firms signed a reciprocal trade agreement.',ja:'2社が相互の貿易協定に署名しました。',cx:'貿易'},
    {en:'Reciprocal respect is the foundation of teamwork.',ja:'相互の尊重がチームワークの基盤です。',cx:'組織'},
    {en:'We benefit from a reciprocal partnership.',ja:'相互のパートナーシップから利益を得ています。',cx:'提携'}]},
  { w:'respective', m:'それぞれの', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Both managers returned to their respective offices.',ja:'両マネージャーがそれぞれのオフィスに戻りました。',cx:'オフィス'},
    {en:'Each team completed their respective tasks.',ja:'各チームがそれぞれのタスクを完了しました。',cx:'業務'},
    {en:'They excelled in their respective fields.',ja:'彼らはそれぞれの分野で秀でていました。',cx:'キャリア'}]},
  { w:'retroactive', m:'遡及的な', p:'adjective', c:'business', cs:['business','finance'], ex:[
    {en:'The pay raise is retroactive to January.',ja:'昇給は1月に遡及して適用されます。',cx:'人事'},
    {en:'Retroactive changes to the policy caused confusion.',ja:'方針の遡及的な変更が混乱を引き起こしました。',cx:'規則'},
    {en:'The tax credit is applied retroactively.',ja:'税額控除は遡及的に適用されます。',cx:'税制'}]},
  { w:'scalable', m:'拡張可能な', p:'adjective', c:'technology', cs:['technology','business'], ex:[
    {en:'We need a scalable solution for growth.',ja:'成長に向けて拡張可能な解決策が必要です。',cx:'IT'},
    {en:'The platform is designed to be highly scalable.',ja:'プラットフォームは高度に拡張可能に設計されています。',cx:'IT'},
    {en:'A scalable business model attracts investors.',ja:'拡張可能なビジネスモデルが投資家を引きつけます。',cx:'経営'}]},
  { w:'solvent', m:'支払能力のある', p:'adjective', c:'finance', cs:['finance'], ex:[
    {en:'The company remains solvent despite the losses.',ja:'損失にもかかわらず会社は支払能力があります。',cx:'財務'},
    {en:'Only solvent firms qualify for the loan.',ja:'支払能力のある企業のみがローンの資格があります。',cx:'金融'},
    {en:'Keeping the business solvent is the top priority.',ja:'事業の支払能力の維持が最優先です。',cx:'経営'}]},
  { w:'sovereign', m:'主権の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Sovereign debt levels are a concern for investors.',ja:'主権的な債務水準は投資家の懸念です。',cx:'金融'},
    {en:'Each nation has sovereign control over its laws.',ja:'各国は自国の法律に主権を持っています。',cx:'法律'},
    {en:'Sovereign risk affects international investments.',ja:'主権リスクが国際投資に影響します。',cx:'投資'}]},
  { w:'static', m:'静的な', p:'adjective', c:'technology', cs:['technology','business'], ex:[
    {en:'The market has remained static for months.',ja:'市場は数か月間静的な状態です。',cx:'市場'},
    {en:'A static website requires no server-side processing.',ja:'静的なウェブサイトはサーバー処理が不要です。',cx:'IT'},
    {en:'Salaries have been static despite inflation.',ja:'インフレにもかかわらず給与は静的です。',cx:'人事'}]},
  { w:'statutory', m:'法定の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Statutory holidays are observed by the company.',ja:'法定の祝日は会社で遵守されます。',cx:'人事'},
    {en:'All statutory requirements must be met.',ja:'すべての法定要件を満たす必要があります。',cx:'コンプラ'},
    {en:'The statutory audit is conducted annually.',ja:'法定監査は毎年実施されます。',cx:'監査'}]},
  { w:'subsequent', m:'その後の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Subsequent meetings clarified the policy.',ja:'その後の会議で方針が明確になりました。',cx:'経営'},
    {en:'Subsequent analysis confirmed the initial findings.',ja:'その後の分析で初期の発見が確認されました。',cx:'調査'},
    {en:'All subsequent orders qualify for a discount.',ja:'その後の全注文に割引が適用されます。',cx:'販売'}]},
  { w:'successive', m:'連続する', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Profits declined for three successive years.',ja:'3年連続で利益が減少しました。',cx:'決算'},
    {en:'Successive product launches built brand momentum.',ja:'連続する製品発売がブランドの勢いを構築しました。',cx:'マーケ'},
    {en:'Successive rounds of funding fueled the startup.',ja:'連続する資金調達がスタートアップを支えました。',cx:'投資'}]},
  { w:'tangible', m:'具体的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'We need tangible results by year end.',ja:'年末までに具体的な成果が必要です。',cx:'経営'},
    {en:'Tangible assets include property and equipment.',ja:'具体的な資産には不動産と設備が含まれます。',cx:'会計'},
    {en:'The program produced tangible benefits for staff.',ja:'プログラムがスタッフに具体的な利益をもたらしました。',cx:'人事'}]},
  { w:'transparent', m:'透明な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'A transparent process builds stakeholder trust.',ja:'透明なプロセスが利害関係者の信頼を築きます。',cx:'経営'},
    {en:'We are committed to transparent financial reporting.',ja:'透明な財務報告に努めています。',cx:'IR'},
    {en:'Transparent communication reduces misunderstandings.',ja:'透明なコミュニケーションが誤解を減らします。',cx:'組織'}]},
  { w:'underlying', m:'根本的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The underlying cause of the issue was identified.',ja:'問題の根本的な原因が特定されました。',cx:'分析'},
    {en:'Underlying market trends support our forecast.',ja:'根本的な市場トレンドが予測を裏付けます。',cx:'市場'},
    {en:'We must address the underlying structural problems.',ja:'根本的な構造問題に対処する必要があります。',cx:'経営'}]},
  { w:'unilateral', m:'一方的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The decision was made unilaterally by management.',ja:'決定は経営陣によって一方的にされました。',cx:'経営'},
    {en:'Unilateral changes to the contract are prohibited.',ja:'契約の一方的な変更は禁止されています。',cx:'法務'},
    {en:'Unilateral action may damage the partnership.',ja:'一方的な行動はパートナーシップを損なう可能性があります。',cx:'提携'}]},
  { w:'unprecedented', m:'前例のない', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The company achieved unprecedented growth.',ja:'会社は前例のない成長を達成しました。',cx:'経営'},
    {en:'An unprecedented demand surge tested supply chains.',ja:'前例のない需要の急増がサプライチェーンを試しました。',cx:'物流'},
    {en:'This represents an unprecedented opportunity.',ja:'これは前例のない機会を表しています。',cx:'経営'}]},
  { w:'voluntary', m:'自発的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Participation in the survey is voluntary.',ja:'アンケートへの参加は自発的です。',cx:'人事'},
    {en:'The company offered voluntary early retirement.',ja:'会社が自発的な早期退職を提供しました。',cx:'人事'},
    {en:'Voluntary compliance is preferred over enforcement.',ja:'強制より自発的な遵守が好まれます。',cx:'規制'}]},
];

// ============================================================
// Stage 800 words (difficulty 6) - a~b + t~z補完
// ============================================================
const stage800 = [
  // ---- a words ----
  { w:'abate', m:'弱まる', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The storm abated and flights resumed.',ja:'嵐が弱まり運航が再開しました。',cx:'交通'},
    {en:'Demand for the product showed no sign of abating.',ja:'製品の需要に弱まる兆しはありませんでした。',cx:'市場'},
    {en:'Inflation has finally begun to abate.',ja:'インフレがようやく弱まり始めました。',cx:'経済'}]},
  { w:'abdicate', m:'退位する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The chairman abdicated his responsibilities.',ja:'会長が責任を退位しました。',cx:'経営'},
    {en:'Leaders cannot abdicate accountability.',ja:'リーダーは説明責任を放棄できません。',cx:'経営'},
    {en:'He effectively abdicated control of the project.',ja:'彼は事実上プロジェクトの管理権を放棄しました。',cx:'企画'}]},
  { w:'aberration', m:'逸脱', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The spike in returns was a statistical aberration.',ja:'返品の急増は統計的な逸脱でした。',cx:'分析'},
    {en:'The poor quarter was an aberration, not a trend.',ja:'不振な四半期は傾向ではなく逸脱でした。',cx:'決算'},
    {en:'Any aberration from the process must be reported.',ja:'工程からの逸脱は報告する必要があります。',cx:'品質'}]},
  { w:'abstain', m:'棄権する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Three board members abstained from the vote.',ja:'3人の取締役が投票を棄権しました。',cx:'経営'},
    {en:'She abstained due to a conflict of interest.',ja:'利益相反のため彼女は棄権しました。',cx:'コンプラ'},
    {en:'Members may abstain if they are unsure.',ja:'不確かな場合、メンバーは棄権できます。',cx:'会議'}]},
  { w:'accrual', m:'発生額', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'Accruals are recorded at the end of each month.',ja:'発生額は毎月末に記録されます。',cx:'経理'},
    {en:'The accrual method recognizes revenue when earned.',ja:'発生主義は収益を稼得時に認識します。',cx:'会計'},
    {en:'Year-end accruals need to be reviewed carefully.',ja:'年末の発生額は慎重に確認する必要があります。',cx:'監査'}]},
  { w:'acquiesce', m:'黙従する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The union reluctantly acquiesced to the terms.',ja:'組合はしぶしぶ条件に黙従しました。',cx:'労働'},
    {en:'Management acquiesced to the regulatory demands.',ja:'経営陣が規制の要求に黙従しました。',cx:'コンプラ'},
    {en:'She refused to acquiesce to unfair treatment.',ja:'彼女は不公平な扱いへの黙従を拒否しました。',cx:'人事'}]},
  { w:'adjudicate', m:'裁定する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The panel will adjudicate the dispute.',ja:'委員会が紛争を裁定します。',cx:'法務'},
    {en:'Insurance claims are adjudicated within 30 days.',ja:'保険請求は30日以内に裁定されます。',cx:'保険'},
    {en:'An independent body adjudicates complaints.',ja:'独立機関が苦情を裁定します。',cx:'規制'}]},
  { w:'admonish', m:'忠告する', p:'verb', c:'communication', cs:['communication','business'], ex:[
    {en:'The supervisor admonished the team for tardiness.',ja:'上司が遅刻についてチームに忠告しました。',cx:'人事'},
    {en:'He was admonished for violating safety protocols.',ja:'彼は安全規約違反について忠告されました。',cx:'安全'},
    {en:'The auditor admonished the firm to improve controls.',ja:'監査人が管理改善を会社に忠告しました。',cx:'監査'}]},
  { w:'adversarial', m:'敵対的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The negotiations took on an adversarial tone.',ja:'交渉が敵対的な調子になりました。',cx:'交渉'},
    {en:'An adversarial relationship harms both parties.',ja:'敵対的な関係は双方に害を与えます。',cx:'取引'},
    {en:'Avoid adversarial tactics in labor discussions.',ja:'労使交渉で敵対的な戦術は避けましょう。',cx:'労働'}]},
  { w:'affidavit', m:'宣誓供述書', p:'noun', c:'business', cs:['business'], ex:[
    {en:'She submitted an affidavit to the court.',ja:'彼女が裁判所に宣誓供述書を提出しました。',cx:'法務'},
    {en:'The affidavit confirmed the details of the sale.',ja:'宣誓供述書が売買の詳細を確認しました。',cx:'不動産'},
    {en:'All affidavits must be notarized.',ja:'すべての宣誓供述書は公証が必要です。',cx:'法務'}]},
  { w:'aggregate', m:'合計の', p:'adjective', c:'finance', cs:['finance','business'], ex:[
    {en:'Aggregate sales exceeded projections.',ja:'合計の売上が予測を上回りました。',cx:'営業'},
    {en:'The aggregate cost of the project was reviewed.',ja:'プロジェクトの合計費用が見直されました。',cx:'財務'},
    {en:'Aggregate demand continues to grow.',ja:'合計の需要が成長を続けています。',cx:'経済'}]},
  { w:'allocate', m:'配分する', p:'verb', c:'finance', cs:['finance','business'], ex:[
    {en:'We allocated additional funds for marketing.',ja:'マーケティングに追加の資金を配分しました。',cx:'財務'},
    {en:'Resources were allocated based on project priority.',ja:'プロジェクトの優先度に基づき資源が配分されました。',cx:'企画'},
    {en:'Time must be allocated for quality assurance.',ja:'品質保証のために時間を配分する必要があります。',cx:'製造'}]},
  { w:'ameliorate', m:'改善する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'New policies aim to ameliorate working conditions.',ja:'新方針は労働条件の改善を目指しています。',cx:'人事'},
    {en:'Steps were taken to ameliorate the situation.',ja:'状況を改善するための措置が取られました。',cx:'危機管理'},
    {en:'Technology helps ameliorate supply chain inefficiencies.',ja:'技術がサプライチェーンの非効率を改善します。',cx:'物流'}]},
  { w:'amortize', m:'償却する', p:'verb', c:'finance', cs:['finance'], ex:[
    {en:'The loan is amortized over 20 years.',ja:'ローンは20年にわたり償却されます。',cx:'金融'},
    {en:'Intangible assets are amortized on a straight-line basis.',ja:'無形資産は定額法で償却されます。',cx:'会計'},
    {en:'The cost was amortized across all departments.',ja:'費用は全部門にわたり償却されました。',cx:'経理'}]},
  { w:'annex', m:'併合する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The company annexed a smaller competitor.',ja:'会社が小さな競合を併合しました。',cx:'M&A'},
    {en:'The annex building was added last year.',ja:'別館が昨年追加されました。',cx:'施設'},
    {en:'Details are included in the annex of the report.',ja:'詳細は報告書の付録に含まれています。',cx:'報告'}]},
  { w:'appraisal', m:'査定', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Annual performance appraisals start next month.',ja:'年次業績査定が来月始まります。',cx:'人事'},
    {en:'A property appraisal was conducted before purchase.',ja:'購入前に不動産の査定が行われました。',cx:'不動産'},
    {en:'The appraisal determined the assets fair value.',ja:'査定が資産の公正価値を決定しました。',cx:'会計'}]},
  { w:'arbitrage', m:'裁定取引', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'Arbitrage exploits price differences across markets.',ja:'裁定取引は市場間の価格差を利用します。',cx:'金融'},
    {en:'The trader profited from currency arbitrage.',ja:'トレーダーが通貨の裁定取引で利益を得ました。',cx:'為替'},
    {en:'Arbitrage opportunities are rare in efficient markets.',ja:'効率的な市場では裁定取引の機会は稀です。',cx:'投資'}]},
  { w:'ascertain', m:'確認する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'We need to ascertain the facts before proceeding.',ja:'進む前に事実を確認する必要があります。',cx:'調査'},
    {en:'Auditors ascertained compliance with regulations.',ja:'監査人が規制への準拠を確認しました。',cx:'監査'},
    {en:'It was difficult to ascertain the exact cause.',ja:'正確な原因を確認するのは困難でした。',cx:'分析'}]},
  { w:'attrition', m:'自然減', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Staff attrition reached 15% last year.',ja:'昨年の社員の自然減は15%に達しました。',cx:'人事'},
    {en:'Attrition reduced the team size significantly.',ja:'自然減がチームの規模を大幅に縮小しました。',cx:'人事'},
    {en:'Reducing attrition is a key HR goal.',ja:'自然減の削減が人事の重要目標です。',cx:'経営'}]},

  // ---- b words ----
  { w:'benchmark', m:'基準', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Industry benchmarks help measure our performance.',ja:'業界の基準が当社の業績を測るのに役立ちます。',cx:'経営'},
    {en:'We benchmarked our services against competitors.',ja:'サービスを競合と基準比較しました。',cx:'マーケ'},
    {en:'The benchmark rate was set by the central bank.',ja:'基準レートが中央銀行によって設定されました。',cx:'金融'}]},
  { w:'bilateral', m:'二国間の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'A bilateral trade agreement was signed.',ja:'二国間の貿易協定が署名されました。',cx:'貿易'},
    {en:'Bilateral talks resumed after months of delay.',ja:'数か月の遅延後、二国間の協議が再開されました。',cx:'外交'},
    {en:'The bilateral partnership benefits both economies.',ja:'二国間のパートナーシップが両経済に利益をもたらします。',cx:'経済'}]},
  { w:'bottleneck', m:'障害', p:'noun', c:'business', cs:['business'], ex:[
    {en:'A bottleneck in production delayed shipments.',ja:'生産の障害が出荷を遅延させました。',cx:'製造'},
    {en:'The approval process is a major bottleneck.',ja:'承認プロセスが主要な障害です。',cx:'業務'},
    {en:'Removing bottlenecks improved throughput by 40%.',ja:'障害の除去で処理能力が40%向上しました。',cx:'改善'}]},
  { w:'brokerage', m:'仲介業', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'The brokerage handled the stock transaction.',ja:'仲介業者が株式取引を処理しました。',cx:'金融'},
    {en:'Brokerage fees are charged per transaction.',ja:'仲介手数料は取引ごとに課されます。',cx:'投資'},
    {en:'She works at a real estate brokerage firm.',ja:'彼女は不動産仲介会社で働いています。',cx:'不動産'}]},
  { w:'bureaucratic', m:'官僚的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Bureaucratic procedures slow down project approval.',ja:'官僚的な手続きがプロジェクト承認を遅らせます。',cx:'行政'},
    {en:'The company aims to reduce bureaucratic overhead.',ja:'会社は官僚的な間接費の削減を目指しています。',cx:'経営'},
    {en:'A less bureaucratic structure improves agility.',ja:'官僚的でない構造が機敏さを向上させます。',cx:'組織'}]},
  { w:'buyout', m:'買収', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'The management buyout was completed last month.',ja:'経営陣による買収が先月完了しました。',cx:'M&A'},
    {en:'A leveraged buyout restructured the company.',ja:'レバレッジド・バイアウトが会社を再編しました。',cx:'金融'},
    {en:'The buyout offer was rejected by shareholders.',ja:'買収提案は株主に拒否されました。',cx:'投資'}]},

  // ---- t words ----
  { w:'tabulate', m:'表にする', p:'verb', c:'business', cs:['business','office'], ex:[
    {en:'The results were tabulated in a spreadsheet.',ja:'結果がスプレッドシートに表にされました。',cx:'報告'},
    {en:'Please tabulate the survey responses by region.',ja:'アンケート回答を地域別に表にしてください。',cx:'分析'},
    {en:'Data was tabulated for the annual review.',ja:'年次レビューのためにデータが表にされました。',cx:'経理'}]},
  { w:'tenacious', m:'粘り強い', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Her tenacious approach closed the difficult deal.',ja:'彼女の粘り強い姿勢が難しい契約をまとめました。',cx:'営業'},
    {en:'Tenacious negotiators achieve better outcomes.',ja:'粘り強い交渉者がより良い結果を達成します。',cx:'交渉'},
    {en:'Success requires tenacious effort over time.',ja:'成功には時間をかけた粘り強い努力が必要です。',cx:'キャリア'}]},
  { w:'tentative', m:'暫定的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'A tentative agreement was reached on Friday.',ja:'金曜日に暫定的な合意に達しました。',cx:'交渉'},
    {en:'The tentative schedule is subject to change.',ja:'暫定的なスケジュールは変更の可能性があります。',cx:'企画'},
    {en:'We made tentative plans for the product launch.',ja:'製品発売の暫定的な計画を立てました。',cx:'マーケ'}]},
  { w:'tenure', m:'在任期間', p:'noun', c:'business', cs:['business'], ex:[
    {en:'During his tenure, the company doubled revenue.',ja:'彼の在任期間中、会社は収益を倍増させました。',cx:'経営'},
    {en:'Her tenure as director lasted eight years.',ja:'取締役としての在任期間は8年でした。',cx:'人事'},
    {en:'Long tenure brings deep institutional knowledge.',ja:'長い在任期間が深い組織知識をもたらします。',cx:'組織'}]},
  { w:'tenable', m:'支持できる', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The position is no longer tenable.',ja:'その立場はもはや支持できません。',cx:'経営'},
    {en:'Is this budget forecast tenable?',ja:'この予算予測は支持できますか？',cx:'財務'},
    {en:'His argument was not tenable under scrutiny.',ja:'彼の議論は精査に耐え得ませんでした。',cx:'会議'}]},
  { w:'trajectory', m:'軌道', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The growth trajectory remains positive.',ja:'成長の軌道は引き続き前向きです。',cx:'経営'},
    {en:'Career trajectory depends on continuous learning.',ja:'キャリアの軌道は継続的な学習に依存します。',cx:'キャリア'},
    {en:'The company changed its trajectory after the pivot.',ja:'ピボット後に会社が軌道を変えました。',cx:'戦略'}]},
  { w:'transact', m:'取引する', p:'verb', c:'finance', cs:['finance','business'], ex:[
    {en:'Clients can transact business online securely.',ja:'顧客はオンラインで安全に取引できます。',cx:'EC'},
    {en:'The two firms transacted a major deal.',ja:'2社が大型の取引をしました。',cx:'営業'},
    {en:'All parties must agree before transacting.',ja:'取引前に全当事者が同意する必要があります。',cx:'契約'}]},
  { w:'transcend', m:'超越する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Good leadership transcends cultural boundaries.',ja:'優れたリーダーシップは文化的境界を超越します。',cx:'国際'},
    {en:'The brand transcended its niche market.',ja:'ブランドがニッチ市場を超越しました。',cx:'マーケ'},
    {en:'Innovation allows companies to transcend limitations.',ja:'イノベーションが企業に制約の超越を可能にします。',cx:'経営'}]},
  { w:'transmit', m:'送信する', p:'verb', c:'technology', cs:['technology','business'], ex:[
    {en:'The system transmits data in real time.',ja:'システムがリアルタイムでデータを送信します。',cx:'IT'},
    {en:'Reports are transmitted electronically each month.',ja:'報告書は毎月電子的に送信されます。',cx:'業務'},
    {en:'Please transmit the signed documents by email.',ja:'署名済み書類をメールで送信してください。',cx:'オフィス'}]},
  { w:'transpose', m:'入れ替える', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The data was transposed into a different format.',ja:'データが別の形式に入れ替えられました。',cx:'IT'},
    {en:'Be careful not to transpose the column numbers.',ja:'列番号を入れ替えないよう注意してください。',cx:'報告'},
    {en:'Transposing the rows clarified the analysis.',ja:'行を入れ替えたことで分析が明確になりました。',cx:'分析'}]},
  { w:'truncate', m:'切り詰める', p:'verb', c:'technology', cs:['technology','business'], ex:[
    {en:'The report was truncated to fit the summary format.',ja:'報告書が要約形式に合うよう切り詰められました。',cx:'報告'},
    {en:'Long file names are automatically truncated.',ja:'長いファイル名は自動で切り詰められます。',cx:'IT'},
    {en:'Please do not truncate the financial data.',ja:'財務データを切り詰めないでください。',cx:'経理'}]},
  { w:'turnaround', m:'好転', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The CEO led a remarkable financial turnaround.',ja:'CEOが見事な財務の好転を導きました。',cx:'経営'},
    {en:'Document turnaround time is 48 hours.',ja:'書類の処理時間は48時間です。',cx:'業務'},
    {en:'A strategic turnaround saved the company.',ja:'戦略的な好転が会社を救いました。',cx:'経営'}]},

  // ---- u words ----
  { w:'underpin', m:'支える', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Strong fundamentals underpin our growth strategy.',ja:'強固な基盤が成長戦略を支えています。',cx:'経営'},
    {en:'Trust underpins every successful partnership.',ja:'信頼が全ての成功したパートナーシップを支えます。',cx:'提携'},
    {en:'Solid research underpins the policy proposal.',ja:'確かな調査が方針提案を支えています。',cx:'企画'}]},
  { w:'underscore', m:'強調する', p:'verb', c:'communication', cs:['communication','business'], ex:[
    {en:'The report underscores the need for reform.',ja:'報告書が改革の必要性を強調しています。',cx:'経営'},
    {en:'She underscored the importance of compliance.',ja:'彼女がコンプライアンスの重要性を強調しました。',cx:'コンプラ'},
    {en:'Rising costs underscore the urgency of the issue.',ja:'コスト上昇が問題の緊急性を強調しています。',cx:'財務'}]},
  { w:'undertake', m:'着手する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'We undertook a comprehensive market analysis.',ja:'包括的な市場分析に着手しました。',cx:'マーケ'},
    {en:'The firm undertook a major restructuring effort.',ja:'会社が大規模な再編に着手しました。',cx:'経営'},
    {en:'New projects will be undertaken next quarter.',ja:'次四半期に新プロジェクトに着手します。',cx:'企画'}]},
  { w:'unilateral', m:'一方的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The company made a unilateral price increase.',ja:'会社が一方的に値上げしました。',cx:'販売'},
    {en:'Unilateral decisions undermine team morale.',ja:'一方的な決定はチームの士気を損ないます。',cx:'経営'},
    {en:'The move was widely criticized as unilateral.',ja:'その動きは一方的だと広く批判されました。',cx:'交渉'}]},
  { w:'upscale', m:'高級な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The brand targets upscale consumers.',ja:'ブランドは高級な消費者を対象としています。',cx:'マーケ'},
    {en:'An upscale hotel was chosen for the event.',ja:'イベント用に高級なホテルが選ばれました。',cx:'イベント'},
    {en:'The store moved to an upscale location.',ja:'店舗が高級な場所に移転しました。',cx:'店舗'}]},
  { w:'upstream', m:'上流の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Upstream suppliers were affected by the shortage.',ja:'上流のサプライヤーが不足の影響を受けました。',cx:'物流'},
    {en:'The firm expanded into upstream operations.',ja:'会社が上流の事業に拡大しました。',cx:'経営'},
    {en:'Upstream costs impact the final product price.',ja:'上流のコストが最終製品価格に影響します。',cx:'製造'}]},
  { w:'utilitarian', m:'実用的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The office design is purely utilitarian.',ja:'オフィスのデザインは純粋に実用的です。',cx:'施設'},
    {en:'A utilitarian approach saves time and money.',ja:'実用的なアプローチが時間とお金を節約します。',cx:'経営'},
    {en:'The software has a utilitarian interface.',ja:'ソフトウェアは実用的なインターフェースを持っています。',cx:'IT'}]},

  // ---- v words ----
  { w:'vacate', m:'退去する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'Tenants must vacate the premises by month end.',ja:'テナントは月末までに敷地を退去する必要があります。',cx:'不動産'},
    {en:'The office was vacated for renovation.',ja:'改修のためオフィスが退去されました。',cx:'施設'},
    {en:'She vacated her position to pursue other interests.',ja:'彼女は他の関心を追求するために職を退去しました。',cx:'キャリア'}]},
  { w:'variance', m:'差異', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'The budget variance was analyzed in detail.',ja:'予算の差異が詳細に分析されました。',cx:'経理'},
    {en:'Any variance from the plan must be explained.',ja:'計画からの差異はすべて説明する必要があります。',cx:'報告'},
    {en:'Cost variance reporting is done monthly.',ja:'コストの差異報告は毎月行われます。',cx:'財務'}]},
  { w:'versatile', m:'多才な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'She is a versatile employee who handles many tasks.',ja:'彼女は多くの業務をこなす多才な社員です。',cx:'人事'},
    {en:'The software is versatile and easy to customize.',ja:'そのソフトウェアは多才で簡単にカスタマイズできます。',cx:'IT'},
    {en:'A versatile skill set is valued in startups.',ja:'スタートアップでは多才なスキルが評価されます。',cx:'キャリア'}]},
  { w:'vest', m:'帰属する', p:'verb', c:'finance', cs:['finance','business'], ex:[
    {en:'Stock options vest after four years of service.',ja:'ストックオプションは4年勤務後に帰属します。',cx:'報酬'},
    {en:'Authority is vested in the board of directors.',ja:'権限は取締役会に帰属しています。',cx:'経営'},
    {en:'Pension benefits vest gradually over time.',ja:'年金給付は時間の経過とともに段階的に帰属します。',cx:'福利厚生'}]},
  { w:'vet', m:'精査する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'All candidates are carefully vetted before hiring.',ja:'全候補者は採用前に慎重に精査されます。',cx:'人事'},
    {en:'The proposal was vetted by the legal team.',ja:'提案が法務チームに精査されました。',cx:'法務'},
    {en:'Vendors must be vetted for compliance.',ja:'業者はコンプライアンスのため精査される必要があります。',cx:'購買'}]},
  { w:'viable', m:'実行可能な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The plan is commercially viable.',ja:'その計画は商業的に実行可能です。',cx:'経営'},
    {en:'Is this a viable alternative to outsourcing?',ja:'これは外注の実行可能な代替策ですか？',cx:'経営'},
    {en:'The startup became viable after securing funding.',ja:'資金調達後にスタートアップが実行可能になりました。',cx:'投資'}]},
  { w:'vindicate', m:'立証する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The audit vindicated the accounting teams work.',ja:'監査が会計チームの仕事を立証しました。',cx:'監査'},
    {en:'Sales results vindicated the new strategy.',ja:'売上結果が新戦略を立証しました。',cx:'経営'},
    {en:'She was vindicated when the data was verified.',ja:'データが検証され彼女の正しさが立証されました。',cx:'調査'}]},
  { w:'volatile', m:'不安定な', p:'adjective', c:'finance', cs:['finance'], ex:[
    {en:'The stock market has been volatile this week.',ja:'今週、株式市場は不安定です。',cx:'金融'},
    {en:'Volatile exchange rates affect export profits.',ja:'不安定な為替レートが輸出利益に影響します。',cx:'貿易'},
    {en:'Oil prices are extremely volatile right now.',ja:'現在、石油価格は非常に不安定です。',cx:'エネルギー'}]},
  { w:'voucher', m:'引換券', p:'noun', c:'business', cs:['business','finance'], ex:[
    {en:'Employees receive meal vouchers as a benefit.',ja:'社員が福利厚生として食事引換券を受け取ります。',cx:'福利厚生'},
    {en:'The voucher is valid for 90 days.',ja:'引換券は90日間有効です。',cx:'販売'},
    {en:'Please attach the original voucher to the claim.',ja:'請求書に元の引換券を添付してください。',cx:'経理'}]},

  // ---- w words ----
  { w:'waiver', m:'放棄', p:'noun', c:'business', cs:['business'], ex:[
    {en:'A liability waiver must be signed before the event.',ja:'イベント前に責任放棄書に署名が必要です。',cx:'イベント'},
    {en:'The bank granted a fee waiver for the account.',ja:'銀行が口座の手数料放棄を認めました。',cx:'金融'},
    {en:'The waiver clause protects both parties.',ja:'放棄条項が両当事者を保護します。',cx:'契約'}]},
  { w:'whereabouts', m:'所在', p:'noun', c:'daily', cs:['daily','business'], ex:[
    {en:'The whereabouts of the missing shipment is unknown.',ja:'行方不明の出荷品の所在は不明です。',cx:'物流'},
    {en:'Please confirm your whereabouts during business trips.',ja:'出張中の所在を確認してください。',cx:'勤怠'},
    {en:'His whereabouts were tracked via the GPS system.',ja:'彼の所在はGPSシステムで追跡されました。',cx:'IT'}]},
  { w:'wholesale', m:'卸売り', p:'noun', c:'business', cs:['business','finance'], ex:[
    {en:'We buy office supplies at wholesale prices.',ja:'事務用品を卸売り価格で購入しています。',cx:'購買'},
    {en:'The wholesale market opens early in the morning.',ja:'卸売り市場は早朝に開きます。',cx:'流通'},
    {en:'Wholesale distribution reduces unit costs.',ja:'卸売り流通が単価を下げます。',cx:'物流'}]},
  { w:'windfall', m:'思いがけない利益', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'The tax reform created a windfall for corporations.',ja:'税制改革が企業に思いがけない利益をもたらしました。',cx:'税制'},
    {en:'Oil companies enjoyed a windfall from price surges.',ja:'石油会社が価格急騰で思いがけない利益を得ました。',cx:'エネルギー'},
    {en:'The windfall was reinvested into R&D.',ja:'思いがけない利益がR&Dに再投資されました。',cx:'経営'}]},
  { w:'withstand', m:'耐える', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The company withstood the economic downturn.',ja:'会社が景気後退に耐えました。',cx:'経営'},
    {en:'Our infrastructure can withstand peak demand.',ja:'インフラがピーク需要に耐えることができます。',cx:'IT'},
    {en:'The brand withstood intense market competition.',ja:'ブランドが激しい市場競争に耐えました。',cx:'マーケ'}]},
  { w:'writ', m:'令状', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The court issued a writ demanding compliance.',ja:'裁判所が遵守を求める令状を発行しました。',cx:'法務'},
    {en:'A writ of summons was served on the company.',ja:'会社に召喚令状が送達されました。',cx:'法務'},
    {en:'The writ was filed to protect intellectual property.',ja:'知的財産保護のため令状が提出されました。',cx:'知財'}]},

  // ---- x/y/z words ----
  { w:'yield curve', m:'利回り曲線', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'The yield curve inverted, signaling a recession.',ja:'利回り曲線が逆転し、景気後退を示唆しました。',cx:'金融'},
    {en:'Analysts watch the yield curve for economic trends.',ja:'アナリストが経済動向のために利回り曲線を注視します。',cx:'分析'},
    {en:'A steep yield curve indicates economic growth.',ja:'急勾配の利回り曲線は経済成長を示します。',cx:'経済'}]},
  { w:'zenith', m:'頂点', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The company reached its zenith in market share.',ja:'会社が市場シェアの頂点に達しました。',cx:'経営'},
    {en:'His career hit its zenith with the promotion.',ja:'昇進でキャリアの頂点に達しました。',cx:'キャリア'},
    {en:'The brand was at its zenith in the 2020s.',ja:'ブランドは2020年代に頂点にありました。',cx:'マーケ'}]},
  { w:'zero-sum', m:'ゼロサムの', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Negotiations need not be a zero-sum game.',ja:'交渉はゼロサムのゲームである必要はありません。',cx:'交渉'},
    {en:'The market is not a zero-sum competition.',ja:'市場はゼロサムの競争ではありません。',cx:'経済'},
    {en:'A zero-sum approach limits collaborative growth.',ja:'ゼロサムのアプローチが協調的成長を制限します。',cx:'経営'}]},

  // ---- More t words ----
  { w:'tariff', m:'関税', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'New tariffs were imposed on imported goods.',ja:'輸入品に新しい関税が課されました。',cx:'貿易'},
    {en:'The tariff increase raised consumer prices.',ja:'関税の引き上げが消費者価格を上昇させました。',cx:'経済'},
    {en:'Tariff negotiations are ongoing between the two nations.',ja:'二国間で関税交渉が進行中です。',cx:'外交'}]},
  { w:'testimonial', m:'推薦状', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Customer testimonials are displayed on the website.',ja:'顧客の推薦状がウェブサイトに掲載されています。',cx:'マーケ'},
    {en:'His testimonial confirmed the products quality.',ja:'彼の推薦状が製品の品質を裏付けました。',cx:'販売'},
    {en:'We collect testimonials from satisfied clients.',ja:'満足した顧客から推薦状を集めています。',cx:'顧客対応'}]},
  { w:'thoroughfare', m:'大通り', p:'noun', c:'daily', cs:['daily','business'], ex:[
    {en:'The office is located on a busy thoroughfare.',ja:'オフィスは賑やかな大通りにあります。',cx:'立地'},
    {en:'Traffic on the main thoroughfare was heavy today.',ja:'今日は主要な大通りの交通が激しかった。',cx:'通勤'},
    {en:'New shops opened along the thoroughfare.',ja:'大通り沿いに新しい店が開店しました。',cx:'商業'}]},
  { w:'transcription', m:'書き起こし', p:'noun', c:'business', cs:['business','technology'], ex:[
    {en:'Meeting transcription is done automatically by AI.',ja:'会議の書き起こしはAIで自動的に行われます。',cx:'IT'},
    {en:'The transcription was reviewed for accuracy.',ja:'書き起こしの正確さが確認されました。',cx:'業務'},
    {en:'Please provide a full transcription of the call.',ja:'通話の完全な書き起こしを提供してください。',cx:'顧客対応'}]},
  { w:'turnkey', m:'すぐ使える', p:'adjective', c:'business', cs:['business','technology'], ex:[
    {en:'We offer turnkey solutions for small businesses.',ja:'中小企業向けにすぐ使えるソリューションを提供します。',cx:'営業'},
    {en:'The turnkey system was ready within a week.',ja:'すぐ使えるシステムが1週間以内に準備できました。',cx:'IT'},
    {en:'A turnkey project saves time on setup.',ja:'すぐ使えるプロジェクトがセットアップの時間を節約します。',cx:'企画'}]},

  // ---- More a words ----
  { w:'addendum', m:'追補', p:'noun', c:'business', cs:['business'], ex:[
    {en:'An addendum was attached to the original contract.',ja:'元の契約に追補が添付されました。',cx:'法務'},
    {en:'The addendum clarifies the payment schedule.',ja:'追補が支払スケジュールを明確にしています。',cx:'契約'},
    {en:'Please review the addendum before signing.',ja:'署名前に追補を確認してください。',cx:'法務'}]},
  { w:'adjunct', m:'付属物', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The training is an adjunct to the main program.',ja:'研修はメインプログラムの付属物です。',cx:'人事'},
    {en:'An adjunct professor teaches part-time at the college.',ja:'非常勤教授が大学でパートタイムで教えています。',cx:'教育'},
    {en:'This service is offered as an adjunct to the plan.',ja:'このサービスはプランの付属物として提供されます。',cx:'販売'}]},
  { w:'amalgamate', m:'合併する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'The two divisions were amalgamated into one.',ja:'2つの部門が1つに合併されました。',cx:'組織'},
    {en:'We plan to amalgamate the databases next year.',ja:'来年データベースを合併する予定です。',cx:'IT'},
    {en:'Amalgamated operations reduced overhead costs.',ja:'合併された業務が間接費を削減しました。',cx:'経営'}]},
  { w:'ancillary', m:'補助的な', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'Ancillary services include parking and catering.',ja:'補助的なサービスには駐車場と給食が含まれます。',cx:'施設'},
    {en:'Ancillary revenue grew by 20% this year.',ja:'補助的な収益が今年20%成長しました。',cx:'財務'},
    {en:'The firm provides ancillary support to the project.',ja:'会社がプロジェクトに補助的な支援を提供しています。',cx:'企画'}]},
  { w:'annuity', m:'年金', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'She invested in an annuity for retirement.',ja:'彼女が退職用に年金に投資しました。',cx:'投資'},
    {en:'The annuity pays a fixed amount each month.',ja:'年金は毎月一定額を支払います。',cx:'金融'},
    {en:'Annuity options were explained during the seminar.',ja:'セミナーで年金の選択肢が説明されました。',cx:'研修'}]},
  { w:'auspicious', m:'幸先の良い', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'The project had an auspicious start.',ja:'プロジェクトは幸先の良いスタートを切りました。',cx:'企画'},
    {en:'Q1 results were an auspicious sign for the year.',ja:'第1四半期の結果は年間の幸先の良い兆候でした。',cx:'決算'},
    {en:'The partnership began on an auspicious note.',ja:'パートナーシップは幸先の良い調子で始まりました。',cx:'提携'}]},

  // ---- More b words ----
  { w:'bespoke', m:'特注の', p:'adjective', c:'business', cs:['business'], ex:[
    {en:'We offer bespoke solutions for enterprise clients.',ja:'企業顧客に特注のソリューションを提供しています。',cx:'営業'},
    {en:'The software was bespoke, not off-the-shelf.',ja:'ソフトウェアは特注で既製品ではありませんでした。',cx:'IT'},
    {en:'Bespoke training programs are tailored to each team.',ja:'特注の研修プログラムが各チーム向けに作られます。',cx:'人事'}]},
  { w:'bolster', m:'強化する', p:'verb', c:'business', cs:['business'], ex:[
    {en:'New hires will bolster the engineering team.',ja:'新入社員がエンジニアチームを強化します。',cx:'人事'},
    {en:'The partnership will bolster our market position.',ja:'提携が我々の市場地位を強化します。',cx:'経営'},
    {en:'Additional funding will bolster the research effort.',ja:'追加資金が研究活動を強化します。',cx:'R&D'}]},
  { w:'breach', m:'違反', p:'noun', c:'business', cs:['business'], ex:[
    {en:'A data breach compromised customer information.',ja:'データ違反で顧客情報が流出しました。',cx:'IT'},
    {en:'The contract was terminated due to a breach.',ja:'違反のため契約が終了しました。',cx:'法務'},
    {en:'Security breach protocols were activated immediately.',ja:'セキュリティ違反の手順が即座に実行されました。',cx:'セキュリティ'}]},
  { w:'brevity', m:'簡潔さ', p:'noun', c:'communication', cs:['communication','business'], ex:[
    {en:'Brevity is appreciated in business emails.',ja:'ビジネスメールでは簡潔さが好まれます。',cx:'メール'},
    {en:'For brevity, I will summarize the key points.',ja:'簡潔さのため、要点を要約します。',cx:'会議'},
    {en:'The report was praised for its brevity and clarity.',ja:'報告書はその簡潔さと明瞭さで称賛されました。',cx:'報告'}]},
  { w:'buoyant', m:'好調な', p:'adjective', c:'finance', cs:['finance','business'], ex:[
    {en:'Consumer spending remains buoyant this quarter.',ja:'今四半期の消費支出は引き続き好調です。',cx:'経済'},
    {en:'A buoyant job market attracts skilled workers.',ja:'好調な労働市場が熟練労働者を引きつけます。',cx:'人事'},
    {en:'Stock prices were buoyant after the earnings report.',ja:'決算報告後に株価が好調でした。',cx:'金融'}]},

  // ---- More t/u/v/w words ----
  { w:'traction', m:'支持', p:'noun', c:'business', cs:['business'], ex:[
    {en:'The new product gained traction quickly.',ja:'新製品はすぐに支持を得ました。',cx:'マーケ'},
    {en:'The proposal gained traction with senior management.',ja:'提案が上級管理職の支持を得ました。',cx:'経営'},
    {en:'Without traction, the project was shelved.',ja:'支持が得られず、プロジェクトは棚上げされました。',cx:'企画'}]},
  { w:'truncation', m:'切り捨て', p:'noun', c:'technology', cs:['technology','business'], ex:[
    {en:'Data truncation caused the error in the report.',ja:'データの切り捨てが報告書のエラーを引き起こしました。',cx:'IT'},
    {en:'Avoid truncation when importing long text fields.',ja:'長いテキスト欄のインポート時に切り捨てを避けてください。',cx:'IT'},
    {en:'Truncation of names led to processing issues.',ja:'名前の切り捨てが処理の問題を引き起こしました。',cx:'システム'}]},
  { w:'ubiquitous', m:'至る所にある', p:'adjective', c:'technology', cs:['technology','daily'], ex:[
    {en:'Smartphones have become ubiquitous in the workplace.',ja:'スマートフォンは職場で至る所にあります。',cx:'IT'},
    {en:'Cloud computing is now ubiquitous in business.',ja:'クラウドコンピューティングはビジネスで至る所にあります。',cx:'IT'},
    {en:'Digital payments are ubiquitous in urban areas.',ja:'デジタル決済は都市部で至る所にあります。',cx:'金融'}]},
  { w:'unequivocal', m:'明白な', p:'adjective', c:'communication', cs:['communication','business'], ex:[
    {en:'The board gave unequivocal support for the plan.',ja:'取締役会が計画に明白な支持を与えました。',cx:'経営'},
    {en:'Her response was clear and unequivocal.',ja:'彼女の返答は明白で曖昧さがありませんでした。',cx:'会議'},
    {en:'The evidence is unequivocal.',ja:'証拠は明白です。',cx:'調査'}]},
  { w:'vetting', m:'審査', p:'noun', c:'business', cs:['business'], ex:[
    {en:'Thorough vetting of suppliers is mandatory.',ja:'サプライヤーの徹底的な審査が義務付けられています。',cx:'購買'},
    {en:'The vetting process for new hires takes two weeks.',ja:'新入社員の審査プロセスは2週間かかります。',cx:'人事'},
    {en:'Security vetting is required for all contractors.',ja:'全請負業者にセキュリティ審査が必要です。',cx:'コンプラ'}]},
  { w:'winding-up', m:'清算', p:'noun', c:'finance', cs:['finance','business'], ex:[
    {en:'The winding-up of the subsidiary took six months.',ja:'子会社の清算に6か月かかりました。',cx:'経営'},
    {en:'A winding-up petition was filed by creditors.',ja:'債権者により清算申立てが提出されました。',cx:'法務'},
    {en:'The court ordered the winding-up of the company.',ja:'裁判所が会社の清算を命じました。',cx:'法務'}]},
  { w:'write-off', m:'帳消し', p:'noun', c:'finance', cs:['finance'], ex:[
    {en:'The bad debt was recorded as a write-off.',ja:'不良債権が帳消しとして計上されました。',cx:'会計'},
    {en:'Tax write-offs reduce the overall tax burden.',ja:'税金の帳消しが全体の税負担を軽減します。',cx:'税務'},
    {en:'The equipment was a complete write-off after the flood.',ja:'洪水後、設備は完全な帳消しになりました。',cx:'保険'}]},
];

// ---- Build entries and check duplicates ----
const newEntries = [];
const skipped = [];

for (const item of stage700) {
  if (existingWords.has(item.w.toLowerCase())) {
    skipped.push(`700: ${item.w} (word exists)`);
    continue;
  }
  if (existingMeanings700.has(item.m)) {
    skipped.push(`700: ${item.w} (meaning "${item.m}" exists in 700)`);
    continue;
  }
  existingWords.add(item.w.toLowerCase());
  existingMeanings700.add(item.m);
  newEntries.push(makeEntry(item.w, item.m, item.p, '700', 5, item.c, item.cs, item.ex));
}

let count700 = newEntries.length;

for (const item of stage800) {
  if (existingWords.has(item.w.toLowerCase())) {
    skipped.push(`800: ${item.w} (word exists)`);
    continue;
  }
  if (existingMeanings800.has(item.m)) {
    skipped.push(`800: ${item.w} (meaning "${item.m}" exists in 800)`);
    continue;
  }
  existingWords.add(item.w.toLowerCase());
  existingMeanings800.add(item.m);
  newEntries.push(makeEntry(item.w, item.m, item.p, '800', 6, item.c, item.cs, item.ex));
}

let count800 = newEntries.length - count700;

// ---- Insert before the closing "];" ----
const insertPoint = src.lastIndexOf('];');
if (insertPoint === -1) {
  console.error('Could not find closing "];" in toeic.js');
  process.exit(1);
}

const before = src.slice(0, insertPoint).trimEnd();
const after = src.slice(insertPoint);

const newSrc = before + ',\n' + newEntries.join(',\n') + '\n' + after;

writeFileSync(FILE, newSrc, 'utf8');

console.log(`Done!`);
console.log(`  Stage 700: +${count700} words added`);
console.log(`  Stage 800: +${count800} words added`);
console.log(`  Total new entries: ${newEntries.length}`);
console.log(`  Next available ID: ${nextId}`);
if (skipped.length > 0) {
  console.log(`\nSkipped (duplicates):`);
  for (const s of skipped) console.log(`  - ${s}`);
}
