import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./i18n/config";

// CSP configuration
function getCSPHeaders() {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Base CSP directives
  const directives = [
    // Default directive: restrict to same origin by default
    `default-src 'self'`,

    // Style sources: allow self, unsafe-inline (required for CSS-in-JS), and external fonts
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,

    // Script sources: allow self and unsafe-inline for development
    `script-src 'self' ${isDevelopment ? "'unsafe-inline' 'unsafe-eval'" : ""}`,

    // Connect sources: allow self and API endpoints
    `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || ""}`,

    // Image sources: allow self, data URIs, and external image services
    `img-src 'self' data: https:`,

    // Font sources: allow self and Google Fonts
    `font-src 'self' https://fonts.gstatic.com`,

    // Frame sources: deny by default for security
    `frame-src 'none'`,

    // Object sources: deny by default
    `object-src 'none'`,

    // Base URI: restrict to same origin
    `base-uri 'self'`,

    // Form action: restrict to same origin
    `form-action 'self'`,

    // Upgrade insecure requests in production
    !isDevelopment ? "upgrade-insecure-requests" : "",
  ].filter(Boolean); // Remove empty strings

  return directives.join("; ");
}

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
  const pathnameLocale =
    locales.find((locale) => pathname.startsWith(`/${locale}/`)) ||
    defaultLocale;
  const pathnameWithoutLocale =
    pathname.replace(new RegExp(`^/${pathnameLocale}`), "") || "/";

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => {
    // Exact match
    if (pathnameWithoutLocale === route) return true;
    // Prefix match for API routes
    if (route.startsWith("/api") && pathnameWithoutLocale.startsWith(route))
      return true;
    // Static assets
    if (route.startsWith("/_next") && pathnameWithoutLocale.startsWith(route))
      return true;
    if (
      route.startsWith("/favicon") ||
      route.startsWith("/robots") ||
      route.startsWith("/sitemap")
    ) {
      return pathnameWithoutLocale.includes(route.split("/")[1]);
    }
    return false;
  });

  // Allow access to public routes
  if (isPublicRoute) {
    const response = intlMiddleware(request);
    // Add CSP headers to the response
    if (response && typeof response.headers?.set === "function") {
      response.headers.set("Content-Security-Policy", getCSPHeaders());
    }
    return response;
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathnameWithoutLocale.startsWith(route),
  );

  if (isProtectedRoute) {
    // Check if user is authenticated
    if (!token) {
      // Redirect to login page with locale
      const loginUrl = new URL(`/${pathnameLocale}/admin/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      // Add CSP headers to redirect response
      response.headers.set("Content-Security-Policy", getCSPHeaders());
      return response;
    }

    // Check role-based access for admin-only routes
    const isAdminRoute = adminOnlyRoutes.some((route) =>
      pathnameWithoutLocale.startsWith(route),
    );
    if (isAdminRoute && userRole !== "admin") {
      // Redirect to unauthorized page or dashboard
      const unauthorizedUrl = new URL(
        `/${pathnameLocale}/admin/unauthorized`,
        request.url,
      );
      const response = NextResponse.redirect(unauthorizedUrl);
      // Add CSP headers to redirect response
      response.headers.set("Content-Security-Policy", getCSPHeaders());
      return response;
    }
  }

  // Continue with internationalization middleware
  const response = intlMiddleware(request);

  // Add CSP headers to the response
  if (response && typeof response.headers?.set === "function") {
    response.headers.set("Content-Security-Policy", getCSPHeaders());
    // Add additional security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }

  return response;
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
