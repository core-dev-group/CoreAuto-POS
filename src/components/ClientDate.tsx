"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ClientDateProps {
  date: Date | string;
  formatStr?: string;
  className?: string;
}

export function ClientDate({ date, formatStr = "dd MMM yyyy, HH:mm", className = "" }: ClientDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return empty span or generic string to prevent hydration mismatch
    return <span className={`opacity-0 ${className}`}>00 Jan 0000, 00:00</span>;
  }

  return <span className={className}>{format(new Date(date), formatStr, { locale: id })}</span>;
}
