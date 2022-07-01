import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Headers", "*");
  response.headers.set("Access-Control-Allow-Methods", "*");
}

export const config = {
  matcher: "*",
};
