import { NextRequest, NextResponse } from "next/server";

function unauthorized() {
  return new NextResponse("Authentification administrateur requise.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="AODI Card Admin", charset="UTF-8"',
    },
  });
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const password = process.env.AODI_ADMIN_PASSWORD;

  if (!password) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Administration non configuree.", { status: 404 });
    }

    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return unauthorized();
  }

  const decoded = atob(authorization.replace("Basic ", ""));
  const [, providedPassword] = decoded.split(":");

  if (providedPassword !== password) {
    return unauthorized();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
