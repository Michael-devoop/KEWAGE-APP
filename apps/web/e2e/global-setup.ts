import { request } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default async function globalSetup() {
  const context = await request.newContext({ baseURL });
  try {
    await context.get("/login", { timeout: 120_000 });
    await context.post("/api/auth/sign-in/email", {
      data: { email: "0911000001@phone.skillconnect.app", password: "password123" },
      timeout: 120_000,
    });
  } finally {
    await context.dispose();
  }
}
