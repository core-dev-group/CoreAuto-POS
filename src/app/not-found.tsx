export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center p-4">
      <h2 className="mb-4 text-4xl font-bold text-gray-800">404</h2>
      <p className="mb-8 text-gray-600">Page not found</p>
      <a
        href="/"
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
      >
        Return Home
      </a>
    </div>
  );
}
