import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { applyAuthCookies, auth } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url), { status: 303 });

  try {
    const result = await auth.api.signOut({
      headers: await headers(),
      returnHeaders: true,
    });
    applyAuthCookies(response, result.headers);
  } catch {
    // Already signed out or no session cookie; the redirect still stands.
  }

  return response;
}
