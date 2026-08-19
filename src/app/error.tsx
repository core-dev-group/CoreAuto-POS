'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error message safely instead of the whole object to prevent "Illegal constructor" on the client
    console.error("Application error:", error?.message || error);
  }, [error]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center p-4">
      <h2 className="mb-4 text-2xl font-bold text-red-600">Something went wrong!</h2>
      <p className="mb-8 text-gray-600">{error.message || 'An unexpected error occurred'}</p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
