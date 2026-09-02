import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data: user, error } = await supabase.auth.getClaims();

  const pathname = request.nextUrl.pathname;

  const protectedRoutes = ["/protected"];

  // 1. Target specifically the dashboard routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = pathname.startsWith("/auth");

  // 2. PROTECT PROTECTED ROUTES: If trying to access protected routes without a session
  if (isProtectedRoute && (!user?.claims || error)) {
    const url = request.nextUrl.clone();
    url.pathname = `/auth/login`;
    // Optional: add a redirect param to bring them back after login
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 4. REDIRECT LOGGED IN USERS: If logged in but hitting /auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();

    // Check if there is a ?next=/path in the URL
    const nextParam = request.nextUrl.searchParams.get("next");

    if (nextParam) {
      // If ?next exists, forward them to that specific path
      url.pathname = nextParam;
      // Clean up the search param so it doesn't stay in the address bar
      url.searchParams.delete("next");
    } else {
      // Default fallback if no ?next is present
      url.pathname = protectedRoutes[0];
    }

    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
