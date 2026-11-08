import { toNextJsHandler } from "better-auth/next-js";
import { auth, ensureSeedUsers } from "@/lib/auth";

const handlers = toNextJsHandler(auth);

export async function GET(request: Request) {
  await ensureSeedUsers();
  return handlers.GET(request);
}

export async function POST(request: Request) {
  await ensureSeedUsers();
  return handlers.POST(request);
}
