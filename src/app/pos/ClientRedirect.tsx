"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClientRedirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [router, to]);
  return <div className="p-10 text-center text-gray-500">Mengarahkan...</div>;
}
