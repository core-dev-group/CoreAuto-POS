export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="text-gray-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}
