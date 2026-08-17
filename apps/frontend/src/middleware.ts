import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/members",
  "/finances",
  "/rentals",
  "/sacraments",
  "/certificates",
  "/archives",
  "/imports",
  "/settings",
];

// Role-based access mapping (page path -> allowed roles)
const roleAccess: Record<string, string[]> = {
  "/finances/approvals": ["SuperAdmin", "Sebeka"],
  "/finances/reports": ["SuperAdmin", "Sebeka"],
  "/employees": ["SuperAdmin", "Sebeka"],
  "/settings/users": ["SuperAdmin"],
  "/imports": ["SuperAdmin", "Registrar"],
  "/archives": ["SuperAdmin", "Sebeka"],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected) {
    const token = request.cookies.get("accessToken")?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Optional: Decode token to check role
    // For now, we just check if token exists (full role-based logic can be added later)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
