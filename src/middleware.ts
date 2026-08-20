import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;

    if (role === "ADMIN_GUDANG_PUSAT") {
      const allowedPaths = ["/", "/stok", "/mutasi", "/permintaan-barang", "/barang"];
      const isAllowed = allowedPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));
      
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    if (role === "KASIR") {
      const allowedPaths = ["/pos", "/invoice", "/stok", "/permintaan-barang"];
      const isAllowed = allowedPaths.some(p => pathname === p || pathname.startsWith(`${p}/`));
      
      if (!isAllowed) {
        return NextResponse.redirect(new URL("/pos", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - we will protect them individually or let some be public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (auth page)
     * - logo.png (public images)
     * - terms (Syarat & Ketentuan)
     * - privacy (Kebijakan Privasi)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|logo.png|sw.js|workbox-.*\\.js|terms|privacy).*)",
  ],
};
