"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next-nprogress-bar";
import { Loader2 } from "lucide-react";
import { ComponentProps } from "react";

interface LinkWithLoadingProps extends ComponentProps<typeof Link> {
  spinnerOnly?: boolean;
}

export function LinkWithLoading({ href, children, className, onClick, spinnerOnly, ...rest }: LinkWithLoadingProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;
    
    // Check if it's opening in a new tab
    if (e.ctrlKey || e.metaKey || e.shiftKey || rest.target === "_blank") {
      return;
    }
    
    e.preventDefault();
    setLoading(true);
    router.push(href.toString());
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={`${className || ""} ${loading ? "pointer-events-none opacity-70 relative" : ""}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin text-current" />
          {!spinnerOnly && children}
        </span>
      ) : (
        children
      )}
    </Link>
  );
}
