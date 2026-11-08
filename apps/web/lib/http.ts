import { NextResponse } from "next/server";
import { ApiError } from "@skillconnect/api";
import type { Role, Session } from "@skillconnect/domain";
import { getSession } from "./session";

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ ok: true, data }, { status });
}

export function fail(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { ok: false, code: error.code, message: error.message },
      { status: error.status },
    );
  }
  console.error("[api] unhandled error", error);
  return NextResponse.json(
    { ok: false, code: "NETWORK", message: "Something went wrong. Try again." },
    { status: 500 },
  );
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new ApiError(401, "UNAUTHORIZED", "Sign in to continue");
  return session;
}

export async function requireRole(role: Role): Promise<Session> {
  const session = await requireSession();
  if (session.role !== role) {
    throw new ApiError(403, "FORBIDDEN", "This action is not available for your role");
  }
  return session;
}

export function parseBody<T>(schema: { safeParse: (v: unknown) => { success: boolean; data?: T; error?: unknown } }, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = (parsed.error as { issues?: { message: string }[] } | undefined)?.issues?.[0];
    throw new ApiError(400, "VALIDATION", first?.message ?? "Invalid input");
  }
  return parsed.data as T;
}
