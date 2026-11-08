import { dash, sentinel } from "@better-auth/infra";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { DEMO_PASSWORD, getDb } from "@skillconnect/api";
import { phoneToEmail } from "./phone-email";

type BetterAuthDb = Record<string, unknown[]>;

const globalForAuth = globalThis as unknown as {
  __scAuthDb?: BetterAuthDb;
  __scAuthSeeding?: Promise<void>;
};

function createMemoryDb(): BetterAuthDb {
  const tables: BetterAuthDb = {};
  return new Proxy(tables, {
    get(target, property) {
      if (typeof property !== "string") return undefined;
      target[property] ??= [];
      return target[property];
    },
  });
}

const database = (globalForAuth.__scAuthDb ??= createMemoryDb());
const infraKey =
  process.env.BETTER_AUTH_INFRA === "off" ? undefined : process.env.BETTER_AUTH_API_KEY;

export const auth = betterAuth({
  appName: "SkillConnect",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") ?? []),
  ].filter((origin): origin is string => Boolean(origin?.trim())),
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-only-secret-change-me-please-32ch",
  database: memoryAdapter(database),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "client",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  plugins: infraKey
    ? [
        dash({ apiKey: infraKey, activityTracking: { enabled: false } }),
        sentinel({
          apiKey: infraKey,
          kvOptions: { timeout: 700, retry: { attempts: 0 } },
        }),
      ]
    : [],
});

const SEED_ID = /^(client|worker)_\d+$/;

async function seedUsers(): Promise<void> {
  const context = await auth.$context;
  const password = await context.password.hash(DEMO_PASSWORD);

  for (const user of getDb().users) {
    if (!SEED_ID.test(user.id)) continue;
    const email = phoneToEmail(user.phone);
    const existing = await context.internalAdapter.findUserByEmail(email, { includeAccounts: false });
    if (existing) continue;

    const created = await context.internalAdapter.createUser({
      email,
      name: user.name,
      emailVerified: true,
      role: user.role,
      phone: user.phone,
    }, { method: "email-password" });

    await context.internalAdapter.linkAccount({
      userId: created.id,
      providerId: "credential",
      accountId: created.id,
      password,
    });
  }
}

export function ensureSeedUsers(): Promise<void> {
  globalForAuth.__scAuthSeeding ??= seedUsers().catch((error: unknown) => {
    globalForAuth.__scAuthSeeding = undefined;
    throw error;
  });
  return globalForAuth.__scAuthSeeding;
}

export function applyAuthCookies(response: Response, headers: Headers): void {
  for (const cookie of headers.getSetCookie()) {
    response.headers.append("set-cookie", cookie);
  }
}
