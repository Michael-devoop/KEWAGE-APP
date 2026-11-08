import { headers } from "next/headers";
import type { Session } from "@skillconnect/domain";
import { findUserByPhone } from "@skillconnect/api";
import { auth } from "./auth";

type AuthUser = {
  name: string;
  phone?: string | null;
  role?: string | null;
};

export async function getSession(): Promise<Session | null> {
  const result = await auth.api.getSession({ headers: await headers() });
  if (!result?.user) return null;

  const user = result.user as unknown as AuthUser;
  const appUser = user.phone ? findUserByPhone(user.phone) : undefined;

  if (!appUser) return null;

  return {
    userId: appUser.id,
    role: appUser.role,
    firstName: appUser.name.split(" ")[0],
  };
}
