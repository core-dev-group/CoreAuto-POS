export default function POSLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50/80">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent shadow-lg"></div>
        <p className="text-gray-600 font-medium animate-pulse">Menyiapkan sistem kasir...</p>
      </div>
    </div>
  );
}
