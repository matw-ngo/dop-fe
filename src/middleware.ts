import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddleware } from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/admin/login",
  "/api/auth",
  "/api/otp",
  "/ekyc",
  // Static assets and API routes
  "/_next",
  "/api",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

// Define protected routes that require authentication
const protectedRoutes = [
  "/admin",
  "/admin/flows",
  "/admin/leads",
  "/admin/users",
  "/admin/settings",
  "/admin/analytics",
];

// Define role-based routes
const adminOnlyRoutes = [
  "/admin/flows",
  "/admin/leads",
  "/admin/users",
  "/admin/settings",
  "/admin/analytics",
];

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
  pathnames: {
    "/": "/",
    "/login": "/login",
    "/admin": {
      en: "/admin",
      vi: "/admin",
    },
    "/admin/login": {
      en: "/admin/login",
      vi: "/admin/login",
    },
  },
});

// Authentication middleware wrapper
function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;
  const userRole = request.cookies.get("user-role")?.value;

  // Extract locale from pathname
  const pathnameLocale = locales.find((locale) => pathname.startsWith(`/${locale}/`)) || defaultLocale;
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/${pathnameLocale}`), "") || "/";

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => {
    // Exact match
    if (pathnameWithoutLocale === route) return true;
    // Prefix match for API routes
    if (route.startsWith("/api") && pathnameWithoutLocale.startsWith(route)) return true;
    // Static assets
    if (route.startsWith("/_next") && pathnameWithoutLocale.startsWith(route)) return true;
    if (route.startsWith("/favicon") || route.startsWith("/robots") || route.startsWith("/sitemap")) {
      return pathnameWithoutLocale.includes(route.split("/")[1]);
    }
    return false;
  });

  // Allow access to public routes
  if (isPublicRoute) {
    return intlMiddleware(request);
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathnameWithoutLocale.startsWith(route));

  if (isProtectedRoute) {
    // Check if user is authenticated
    if (!token) {
      // Redirect to login page with locale
      const loginUrl = new URL(`/${pathnameLocale}/admin/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access for admin-only routes
    const isAdminRoute = adminOnlyRoutes.some((route) => pathnameWithoutLocale.startsWith(route));
    if (isAdminRoute && userRole !== "admin") {
      // Redirect to unauthorized page or dashboard
      const unauthorizedUrl = new URL(`/${pathnameLocale}/admin/unauthorized`, request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // Continue with internationalization middleware
  return intlMiddleware(request);
}

// Export the middleware
export default function middleware(request: NextRequest) {
  return authMiddleware(request);
}

// Configure middleware matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - ekyc (eKYC static assets)
     * - api (API routes handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!ekyc|api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};