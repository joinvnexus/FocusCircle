import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const isAuthPage =
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup");
    const isProtected =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/tasks") ||
      pathname.startsWith("/circles") ||
      pathname.startsWith("/goals") ||
      pathname.startsWith("/activity") ||
      pathname.startsWith("/notifications") ||
      pathname.startsWith("/profile");

    if (!isAuthPage && !isProtected) {
      return NextResponse.next();
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !anonKey) {
      return NextResponse.next();
    }

    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }

    if (user && isAuthPage) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/tasks/:path*",
    "/circles/:path*",
    "/goals/:path*",
    "/activity/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/login",
    "/signup",
  ],
};
