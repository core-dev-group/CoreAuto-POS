export default function DashboardLoading() {
  return (
    <div className="w-full animate-pulse px-2 py-4 sm:px-0">
      {/* Header Area Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="space-y-3 w-full sm:w-1/3">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md w-3/4"></div>
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-md w-1/2"></div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="h-10 w-full sm:w-32 bg-gradient-to-r from-indigo-100 to-blue-50 rounded-lg"></div>
          <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg hidden sm:block"></div>
        </div>
      </div>
      
      {/* Metrics Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Shimmer effect overlay */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"></div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
            </div>
            <div className="h-8 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-1/3 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>

      {/* Main Table/Content Skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10"></div>
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="h-9 w-full sm:w-64 bg-white border border-gray-200 rounded-lg"></div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-white border border-gray-200 rounded-lg"></div>
            <div className="h-9 w-24 bg-white border border-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-100">
          <div className="flex h-12 items-center px-6 gap-4 bg-gray-50/80">
             <div className="h-3 bg-gray-300 rounded w-12"></div>
             <div className="h-3 bg-gray-300 rounded w-1/4"></div>
             <div className="h-3 bg-gray-300 rounded w-1/4"></div>
             <div className="h-3 bg-gray-300 rounded w-1/6 hidden md:block"></div>
             <div className="h-3 bg-gray-300 rounded w-1/6 hidden lg:block"></div>
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex h-16 items-center px-6 gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="h-4 bg-gray-200 rounded w-12"></div>
              
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/3"></div>
              </div>
              
              <div className="w-1/6 hidden md:flex items-center gap-2">
                <div className="h-6 w-16 bg-blue-100/50 rounded-full"></div>
              </div>
              
              <div className="w-1/6 hidden lg:flex justify-end gap-2">
                 <div className="h-8 w-8 bg-gray-100 rounded-md"></div>
                 <div className="h-8 w-8 bg-gray-100 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tailwind custom animation config */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
