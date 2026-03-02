/**
 * カテゴリオーバーライドマップ
 *
 * コースのデフォルトカテゴリ（CATEGORY_MAP）より詳細なカテゴリ分類が必要な単語に設定する。
 * 1単語に複数カテゴリを付与可能。
 * 単語詳細画面ではここに設定されたカテゴリが表示される。
 */
// Category 型は compat.ts に定義されているが、循環インポートを避けるため string[] を使用
export const categoryOverrides: Map<number, string[]> = new Map([
  // ── TOEIC 500 ──────────────────────────────────────────────────────────────

  // appointment (30001) — 医療・ビジネス予約どちらにも使う
  [30001, ["business", "office"]],
  // confirm (30002) — 予約・契約の確認
  [30002, ["business", "office"]],
  // department (30003) — 部署・売り場
  [30003, ["business", "office"]],
  // employee (30004) — 人事・雇用
  [30004, ["business", "office"]],
  // invoice (30005) — 請求書・経理
  [30005, ["finance", "office"]],
  // manage (30006) — 管理職・マネジメント
  [30006, ["business", "office"]],
  // purchase (30008) — 購入・買い物
  [30008, ["shopping", "finance"]],
  // reservation (30009) — 旅行・レストラン予約
  [30009, ["travel", "shopping"]],
  // schedule (30010) — スケジュール管理
  [30010, ["business", "office"]],
  // attach (30012) — メール添付・オフィスワーク
  [30012, ["office", "technology"]],
  // budget (30014) — 財務・経理
  [30014, ["finance", "business"]],
  // cancel (30015) — 予約キャンセル・ビジネス
  [30015, ["business", "shopping"]],
  // deliver (30016) — 配送・物流
  [30016, ["shopping", "business"]],
  // discount (30017) — 割引・小売
  [30017, ["shopping", "finance"]],
  // payment (30019) — 支払い・決済
  [30019, ["finance", "shopping"]],
  // receipt (30020) — 領収書・会計
  [30020, ["finance", "shopping"]],
  // application (30021) — 求人応募・アプリ
  [30021, ["business", "technology"]],
  // benefit (30023) — 福利厚生・利益
  [30023, ["business", "finance"]],
  // complain (30027) — 苦情・クレーム対応
  [30027, ["business", "communication"]],
  // contact (30029) — 連絡・コミュニケーション
  [30029, ["business", "communication"]],
  // contract (30030) — 契約書・法務
  [30030, ["business", "finance"]],
  // customer (30032) — 顧客対応・小売
  [30032, ["business", "shopping"]],
  // deposit (30036) — 預金・保証金
  [30036, ["finance", "shopping"]],
  // document (30039) — 文書・書類
  [30039, ["office", "business"]],
  // estimate (30041) — 見積もり・財務
  [30041, ["finance", "business"]],
  // exchange (30042) — 両替・外為
  [30042, ["finance", "shopping"]],
  // expense (30043) — 経費・出費
  [30043, ["finance", "business"]],
  // forward (30045) — メール転送・コミュニケーション
  [30045, ["office", "communication"]],
  // guarantee (30046) — 保証・品質
  [30046, ["business", "shopping"]],
  // install (30051) — ソフトウェア・設備
  [30051, ["technology", "business"]],
  // insurance (30052) — 保険・金融
  [30052, ["finance", "business"]],
  // inventory (30053) — 在庫管理・小売
  [30053, ["business", "shopping"]],
  // itinerary (30055) — 旅程・旅行
  [30055, ["travel", "business"]],
  // luggage (30056) — 荷物・旅行
  [30056, ["travel", "daily"]],
  // manufacture (30058) — 製造業
  [30058, ["business", "technology"]],
  // merchandise (30059) — 商品・小売
  [30059, ["shopping", "business"]],
  // negotiate (30060) — 交渉・契約
  [30060, ["business", "finance"]],
  // notify (30061) — 通知・連絡
  [30061, ["business", "communication"]],
  // operate (30063) — 機器操作・運営
  [30063, ["technology", "business"]],
  // order (30065) — 注文・購入
  [30065, ["shopping", "business"]],
  // participate (30066) — 参加・コミュニケーション
  [30066, ["business", "communication"]],
  // policy (30068) — 方針・保険
  [30068, ["business", "finance"]],
  // procedure (30070) — 手順・業務フロー
  [30070, ["business", "office"]],
  // profit (30071) — 利益・財務
  [30071, ["finance", "business"]],
  // propose (30073) — 提案・コミュニケーション
  [30073, ["business", "communication"]],
  // recommend (30076) — 推薦・コミュニケーション
  [30076, ["business", "communication"]],
  // refund (30077) — 返金・消費者保護
  [30077, ["shopping", "finance"]],
  // regulation (30079) — 法規・コンプライアンス
  [30079, ["business", "finance"]],
  // repair (30081) — 修理・メンテナンス
  [30081, ["technology", "daily"]],
  // replace (30082) — 交換・更新
  [30082, ["technology", "business"]],
  // resign (30085) — 退職・人事
  [30085, ["business", "office"]],
  // retail (30086) — 小売業
  [30086, ["shopping", "business"]],
  // revenue (30087) — 収益・経営
  [30087, ["finance", "business"]],
  // salary (30088) — 給料・雇用
  [30088, ["finance", "business"]],
  // shipment (30090) — 出荷・物流
  [30090, ["business", "shopping"]],
  // signature (30091) — 署名・文書
  [30091, ["business", "office"]],
  // subscribe (30093) — 定期購読・サービス
  [30093, ["technology", "shopping"]],
  // supply (30095) — 供給・物流
  [30095, ["business", "shopping"]],
  // update (30097) — 更新・IT
  [30097, ["technology", "business"]],
  // vacancy (30098) — 求人・空き
  [30098, ["business", "office"]],
  // warranty (30099) — 保証・品質
  [30099, ["shopping", "finance"]],
  // withdraw (30100) — 引き出し・金融
  [30100, ["finance", "daily"]],
]);
