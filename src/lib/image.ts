/**
 * 画像関連のユーティリティ
 *
 * フォールバックチェーン:
 * 1. 単語固有URL (word.imageUrl)
 * 2. キーワードベースURL (word.imageKeyword または自動導出)
 * 3. カテゴリURL (CATEGORY_IMAGE_URLS)
 * 4. 絵文字フォールバック (CATEGORY_EMOJIS)
 */

// キーワード・コンセプトに対応する画像URL
// 単語の意味やコアイメージに即した画像を提供
export const CONCEPT_IMAGE_URLS: Record<string, string> = {
  // ビジネス・仕事関連
  meeting: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
  schedule: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=250&fit=crop",
  deadline: "https://images.unsplash.com/photo-1553835973-dec43bfddbeb?w=400&h=250&fit=crop",
  project: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop",
  client: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=250&fit=crop",
  contract: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
  proposal: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=250&fit=crop",
  negotiate: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=250&fit=crop",
  agreement: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop",

  // オフィス・職場
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
  desk: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=250&fit=crop",
  document: "https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=250&fit=crop",
  printer: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&h=250&fit=crop",
  employee: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=250&fit=crop",
  supervisor: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=250&fit=crop",
  colleague: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=250&fit=crop",
  department: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=250&fit=crop",

  // 金融・経済
  budget: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop",
  invoice: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&h=250&fit=crop",
  expense: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop",
  profit: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop",
  revenue: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=250&fit=crop",
  investment: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=250&fit=crop",
  account: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop",
  transaction: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=250&fit=crop",

  // 旅行・交通
  travel: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=250&fit=crop",
  flight: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=250&fit=crop",
  airport: "https://images.unsplash.com/photo-1529074963764-98f45c47344b?w=400&h=250&fit=crop",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=250&fit=crop",
  reservation: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&h=250&fit=crop",
  passport: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400&h=250&fit=crop",
  luggage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop",
  destination: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=400&h=250&fit=crop",

  // 買い物・店舗
  shopping: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=250&fit=crop",
  purchase: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?w=400&h=250&fit=crop",
  discount: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=250&fit=crop",
  receipt: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=400&h=250&fit=crop",
  customer: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=250&fit=crop",
  refund: "https://images.unsplash.com/photo-1556742077-0a6b6a4a4ac4?w=400&h=250&fit=crop",
  warranty: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop",

  // 技術・IT
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop",
  software: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop",
  hardware: "https://images.unsplash.com/photo-1591238372338-22d30c883a86?w=400&h=250&fit=crop",
  network: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=250&fit=crop",
  database: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop",
  update: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
  install: "https://images.unsplash.com/photo-1537884944318-390069bb8665?w=400&h=250&fit=crop",

  // コミュニケーション
  communication: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=250&fit=crop",
  email: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=400&h=250&fit=crop",
  phone: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400&h=250&fit=crop",
  message: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=250&fit=crop",
  confirm: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=250&fit=crop",
  notify: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=250&fit=crop",
  announce: "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?w=400&h=250&fit=crop",

  // 日常生活
  daily: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=250&fit=crop",
  home: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=250&fit=crop",
  weather: "https://images.unsplash.com/photo-1504253163759-c23fccaebb55?w=400&h=250&fit=crop",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=250&fit=crop",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop",

  // 動作・状態（動詞のコアイメージ）
  approve: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=250&fit=crop",
  submit: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop",
  review: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop",
  postpone: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=250&fit=crop",
  cancel: "https://images.unsplash.com/photo-1553835973-dec43bfddbeb?w=400&h=250&fit=crop",
  attend: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=250&fit=crop",
  participate: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop",
};

// カテゴリごとのデフォルト画像URL（フォールバック用）
export const CATEGORY_IMAGE_URLS: Record<string, string> = {
  business: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=250&fit=crop",
  office: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=250&fit=crop",
  travel: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400&h=250&fit=crop",
  shopping: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=250&fit=crop",
  finance: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop",
  daily: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&h=250&fit=crop",
  communication: "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=400&h=250&fit=crop",
  school: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=250&fit=crop",
  family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=250&fit=crop",
  hobby: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=250&fit=crop",
  nature: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop",
  health: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=250&fit=crop",
  food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop",
  sports: "https://images.unsplash.com/photo-1461896836934-bd45ba47ecee?w=400&h=250&fit=crop",
  culture: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=250&fit=crop",
  greeting: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop",
  emotion: "https://images.unsplash.com/photo-1508963493744-76fce69379c0?w=400&h=250&fit=crop",
  opinion: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=400&h=250&fit=crop",
  request: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop",
  smalltalk: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&h=250&fit=crop",
};

// カテゴリごとの絵文字フォールバック
export const CATEGORY_EMOJIS: Record<string, string> = {
  business: "💼",
  office: "🏢",
  travel: "✈️",
  shopping: "🛒",
  finance: "💰",
  technology: "💻",
  daily: "🏠",
  communication: "💬",
  school: "🏫",
  family: "👨‍👩‍👧",
  hobby: "🎮",
  nature: "🌿",
  health: "🏥",
  food: "🍽️",
  sports: "⚽",
  culture: "🎨",
  greeting: "👋",
  emotion: "💭",
  opinion: "🗣️",
  request: "🙏",
  smalltalk: "☕",
};

// カテゴリごとのグラデーションカラー
export const CATEGORY_GRADIENTS: Record<string, string> = {
  business: "from-blue-50 to-indigo-50",
  office: "from-slate-50 to-gray-100",
  travel: "from-cyan-50 to-sky-50",
  shopping: "from-pink-50 to-rose-50",
  finance: "from-emerald-50 to-green-50",
  technology: "from-violet-50 to-purple-50",
  daily: "from-amber-50 to-yellow-50",
  communication: "from-orange-50 to-red-50",
  school: "from-blue-50 to-sky-50",
  family: "from-rose-50 to-pink-50",
  hobby: "from-fuchsia-50 to-purple-50",
  nature: "from-green-50 to-emerald-50",
  health: "from-teal-50 to-cyan-50",
  food: "from-orange-50 to-amber-50",
  sports: "from-lime-50 to-green-50",
  culture: "from-indigo-50 to-violet-50",
  greeting: "from-yellow-50 to-amber-50",
  emotion: "from-pink-50 to-fuchsia-50",
  opinion: "from-sky-50 to-blue-50",
  request: "from-amber-50 to-orange-50",
  smalltalk: "from-stone-50 to-slate-100",
};

/**
 * 単語の画像URLを取得
 *
 * フォールバックチェーン:
 * 1. 単語固有URL (wordImageUrl)
 * 2. キーワードベースURL (imageKeyword)
 * 3. 単語自体からコンセプト画像を検索
 * 4. カテゴリURL
 *
 * @param options.wordImageUrl - 単語固有の画像URL
 * @param options.imageKeyword - 画像検索用キーワード
 * @param options.word - 単語（コンセプト画像検索用）
 * @param options.category - カテゴリ（フォールバック用）
 */
export const getImageUrl = (
  options: {
    wordImageUrl?: string;
    imageKeyword?: string;
    word?: string;
    category?: string;
  } | string | undefined,
  categoryFallback?: string
): string | null => {
  // 後方互換性: 旧API (imageUrl, category) のサポート
  if (typeof options === "string" || options === undefined) {
    const imageUrl = options as string | undefined;
    if (imageUrl) return imageUrl;
    if (categoryFallback && CATEGORY_IMAGE_URLS[categoryFallback]) {
      return CATEGORY_IMAGE_URLS[categoryFallback];
    }
    return null;
  }

  const { wordImageUrl, imageKeyword, word, category } = options;

  // 1. 単語固有URL
  if (wordImageUrl) return wordImageUrl;

  // 2. キーワードベースURL
  if (imageKeyword) {
    const keywordLower = imageKeyword.toLowerCase();
    if (CONCEPT_IMAGE_URLS[keywordLower]) {
      return CONCEPT_IMAGE_URLS[keywordLower];
    }
  }

  // 3. 単語自体からコンセプト画像を検索
  if (word) {
    const wordLower = word.toLowerCase();
    if (CONCEPT_IMAGE_URLS[wordLower]) {
      return CONCEPT_IMAGE_URLS[wordLower];
    }
  }

  // 4. カテゴリURL
  if (category && CATEGORY_IMAGE_URLS[category]) {
    return CATEGORY_IMAGE_URLS[category];
  }

  return null;
};

/**
 * カテゴリに対応する絵文字を取得
 */
export const getCategoryEmoji = (category?: string): string => {
  if (!category) return "📝";
  return CATEGORY_EMOJIS[category] || "📝";
};

/**
 * カテゴリに対応するグラデーションを取得
 */
export const getCategoryGradient = (category?: string): string => {
  if (!category) return "from-primary-50 to-accent-50";
  return CATEGORY_GRADIENTS[category] || "from-primary-50 to-accent-50";
};

/**
 * コンセプト画像が利用可能かチェック
 */
export const hasConceptImage = (keyword: string): boolean => {
  return keyword.toLowerCase() in CONCEPT_IMAGE_URLS;
};

/**
 * 利用可能なコンセプトキーワード一覧を取得
 */
export const getAvailableConcepts = (): string[] => {
  return Object.keys(CONCEPT_IMAGE_URLS);
};
