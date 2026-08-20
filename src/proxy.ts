import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

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