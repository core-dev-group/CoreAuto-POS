export default function ReportLoading() {
  return (
    <div className="w-full px-2 py-4 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-md animate-pulse"></div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="h-10 w-full md:w-40 bg-slate-100 rounded-lg animate-pulse border border-slate-200"></div>
          <div className="h-10 w-32 bg-slate-800 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 relative overflow-hidden">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent z-10"></div>
        
        {/* Report Header Skeleton */}
        <div className="text-center mb-10 space-y-4 flex flex-col items-center">
          <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
          <div className="h-5 w-40 bg-slate-100 rounded-md"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Pendapatan Section */}
          <div className="space-y-6">
            <div className="h-8 w-40 bg-emerald-100 rounded-lg mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div className="h-5 w-1/2 bg-slate-100 rounded"></div>
                <div className="h-5 w-1/3 bg-slate-200 rounded"></div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-4 bg-emerald-50/50 p-4 rounded-lg">
              <div className="h-6 w-1/3 bg-emerald-200 rounded"></div>
              <div className="h-6 w-1/3 bg-emerald-300 rounded"></div>
            </div>
          </div>

          {/* Pengeluaran Section */}
          <div className="space-y-6">
            <div className="h-8 w-40 bg-rose-100 rounded-lg mb-4"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div className="h-5 w-1/2 bg-slate-100 rounded"></div>
                <div className="h-5 w-1/3 bg-slate-200 rounded"></div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-4 bg-rose-50/50 p-4 rounded-lg">
              <div className="h-6 w-1/3 bg-rose-200 rounded"></div>
              <div className="h-6 w-1/3 bg-rose-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* Total Profit Area */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col items-center">
          <div className="h-6 w-32 bg-slate-100 rounded-md mb-4"></div>
          <div className="h-16 w-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
