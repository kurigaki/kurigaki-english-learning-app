// My単語帳・お気に入り・最近見た単語帳の管理

export type MyVocabBook = {
  id: string;
  name: string;
  wordIds: number[];
  createdAt: string;
};

export type RecentlyViewedBook = {
  bookId: string;
  viewedAt: string;
};

const MY_VOCAB_BOOKS_KEY = "my_vocab_books";
const FAVORITE_BOOK_IDS_KEY = "favorite_book_ids";
const RECENTLY_VIEWED_KEY = "recently_viewed_books";
const MAX_RECENTLY_VIEWED = 20;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const vocabularyBooks = {
  // ── My単語帳 ──────────────────────────────────────────────
  getMyVocabBooks(): MyVocabBook[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(MY_VOCAB_BOOKS_KEY);
      const books: MyVocabBook[] = raw ? (JSON.parse(raw) as MyVocabBook[]) : [];
      // デフォルトの「My単語帳」を自動初期化（初回のみ）
      if (books.length === 0) {
        const defaultBook: MyVocabBook = {
          id: generateId(),
          name: "My単語帳",
          wordIds: [],
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(MY_VOCAB_BOOKS_KEY, JSON.stringify([defaultBook]));
        return [defaultBook];
      }
      return books;
    } catch {
      return [];
    }
  },

  createMyVocabBook(name: string): MyVocabBook {
    const books = vocabularyBooks.getMyVocabBooks();
    const newBook: MyVocabBook = {
      id: generateId(),
      name,
      wordIds: [],
      createdAt: new Date().toISOString(),
    };
    books.push(newBook);
    localStorage.setItem(MY_VOCAB_BOOKS_KEY, JSON.stringify(books));
    return newBook;
  },

  deleteMyVocabBook(id: string): void {
    const books = vocabularyBooks.getMyVocabBooks().filter((b) => b.id !== id);
    localStorage.setItem(MY_VOCAB_BOOKS_KEY, JSON.stringify(books));
    // お気に入りからも削除
    const favs = vocabularyBooks.getFavoriteBookIds().filter((fid) => fid !== `my:${id}`);
    localStorage.setItem(FAVORITE_BOOK_IDS_KEY, JSON.stringify(favs));
  },

  renameMyVocabBook(id: string, name: string): void {
    const books = vocabularyBooks.getMyVocabBooks().map((b) =>
      b.id === id ? { ...b, name } : b
    );
    localStorage.setItem(MY_VOCAB_BOOKS_KEY, JSON.stringify(books));
  },

  addWordToBook(bookId: string, wordId: number): void {
    const books = vocabularyBooks.getMyVocabBooks().map((b) => {
      if (b.id !== bookId) return b;
      if (b.wordIds.includes(wordId)) return b;
      return { ...b, wordIds: [...b.wordIds, wordId] };
    });
    localStorage.setItem(MY_VOCAB_BOOKS_KEY, JSON.stringify(books));
  },

  removeWordFromBook(bookId: string, wordId: number): void {
    const books = vocabularyBooks.getMyVocabBooks().map((b) => {
      if (b.id !== bookId) return b;
      return { ...b, wordIds: b.wordIds.filter((wid) => wid !== wordId) };
    });
    localStorage.setItem(MY_VOCAB_BOOKS_KEY, JSON.stringify(books));
  },

  /** 登録済みなら削除、未登録なら追加。戻り値: 追加後の状態（true=登録済み） */
  toggleWordInBook(bookId: string, wordId: number): boolean {
    const book = vocabularyBooks.getMyVocabBooks().find((b) => b.id === bookId);
    if (!book) return false;
    const isIn = book.wordIds.includes(wordId);
    if (isIn) {
      vocabularyBooks.removeWordFromBook(bookId, wordId);
    } else {
      vocabularyBooks.addWordToBook(bookId, wordId);
    }
    return !isIn;
  },

  /** wordId が登録されている My単語帳 ID 一覧 */
  getBooksForWord(wordId: number): string[] {
    return vocabularyBooks
      .getMyVocabBooks()
      .filter((b) => b.wordIds.includes(wordId))
      .map((b) => b.id);
  },

  // ── お気に入り（単語帳を starring） ───────────────────────
  getFavoriteBookIds(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(FAVORITE_BOOK_IDS_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  },

  toggleFavoriteBook(bookId: string): boolean {
    const favs = vocabularyBooks.getFavoriteBookIds();
    const newFavs = favs.includes(bookId)
      ? favs.filter((id) => id !== bookId)
      : [...favs, bookId];
    localStorage.setItem(FAVORITE_BOOK_IDS_KEY, JSON.stringify(newFavs));
    return !favs.includes(bookId); // 追加後の状態
  },

  isFavoriteBook(bookId: string): boolean {
    return vocabularyBooks.getFavoriteBookIds().includes(bookId);
  },

  // ── 最近見た単語帳 ─────────────────────────────────────────
  getRecentlyViewedBooks(): RecentlyViewedBook[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return raw ? (JSON.parse(raw) as RecentlyViewedBook[]) : [];
    } catch {
      return [];
    }
  },

  addRecentlyViewedBook(bookId: string): void {
    if (typeof window === "undefined") return;
    const viewed = vocabularyBooks.getRecentlyViewedBooks().filter((v) => v.bookId !== bookId);
    viewed.unshift({ bookId, viewedAt: new Date().toISOString() });
    const trimmed = viewed.slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed));
  },
};
