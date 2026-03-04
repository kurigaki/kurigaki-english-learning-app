import Link from "next/link";

export const MainAction = () => {
  return (
    <Link href="/quiz" className="block">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
            📝
          </div>
          <div className="flex-1 text-white">
            <h2 className="text-xl font-bold">クイズに挑戦</h2>
            <p className="text-sm text-white/80">コースを選んでクイズに挑戦しよう</p>
          </div>
          <div className="text-white/60 group-hover:translate-x-1 transition-transform">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};