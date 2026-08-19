import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Explicitly bypass api and auth routes
  if (pathname.startsWith("/api") || pathname.startsWith("/login") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const token = await getToken({ req });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // SUPER_ADMIN (Owner) has access to everything
  if (role === "SUPER_ADMIN") {
    return NextResponse.next();
  }

  // Role-based Path Rules
  
  // Paths that everyone who is logged in can access (exact match or prefix for nested paths)
  const isPublicPath = 
    pathname === "/" || 
    pathname.startsWith("/pos") || 
    pathname.startsWith("/invoice") || 
    pathname.startsWith("/stok") ||
    pathname.startsWith("/permintaan-barang");

  if (role === "KASIR") {
    // Kasir can only access public paths
    if (!isPublicPath) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (role === "ADMIN_GUDANG") {
    // Admin Gudang can access public paths + /mutasi, /permintaan-barang
    const allowedPaths = ["/mutasi", "/permintaan-barang"];
    const isAllowed = isPublicPath || allowedPaths.some(p => pathname.startsWith(p));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (role === "ADMIN_GUDANG_PUSAT") {
    // Admin Gudang Pusat can access public paths + /mutasi, /permintaan-barang, /barang
    const allowedPaths = ["/mutasi", "/permintaan-barang", "/barang"];
    const isAllowed = isPublicPath || allowedPaths.some(p => pathname.startsWith(p));
    if (!isAllowed) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (role === "KEPALA_CABANG") {
    // Kepala Cabang can access everything EXCEPT /pengguna
    if (pathname.startsWith("/pengguna")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (auth route)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
