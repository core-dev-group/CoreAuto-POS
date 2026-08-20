export default function AuditLoading() {
  return (
    <div className="w-full px-2 py-4 sm:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-4 w-48 bg-slate-100 rounded-md animate-pulse"></div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent z-10"></div>
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3">
          <div className="h-10 w-full sm:w-1/3 bg-white border border-slate-200 rounded-lg"></div>
          <div className="h-10 w-full sm:w-48 bg-white border border-slate-200 rounded-lg"></div>
          <div className="h-10 w-full sm:w-32 bg-white border border-slate-200 rounded-lg"></div>
        </div>

        {/* Audit Log Timeline Style */}
        <div className="p-0">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-4 p-5 border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
              {/* Icon/Avatar Placeholder */}
              <div className="mt-1 flex-shrink-0">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-indigo-200 rounded-sm"></div>
                </div>
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-3/4">
                    <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  </div>
                  <div className="h-5 bg-slate-100 rounded w-24"></div>
                </div>
                
                {/* Details badge */}
                <div className="flex gap-2 pt-2">
                  <div className="h-6 w-20 bg-slate-100 rounded-md"></div>
                  <div className="h-6 w-24 bg-slate-100 rounded-md"></div>
                </div>
              </div>
            </div>
          ))}
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
