import { headers } from "next/headers";
import { loginSchema } from "@skillconnect/domain";
import { ApiError, findUserByPhone } from "@skillconnect/api";
import { applyAuthCookies, auth, ensureSeedUsers } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/http";
import { phoneToEmail } from "@/lib/phone-email";

export async function POST(request: Request) {
  try {
    const input = parseBody(loginSchema, await request.json());
    const user = findUserByPhone(input.phone);
    if (!user) {
      throw new ApiError(401, "UNAUTHORIZED", "Phone number or password is incorrect");
    }

    await ensureSeedUsers();

    let authHeaders: Headers;
    try {
      const result = await auth.api.signInEmail({
        body: { email: phoneToEmail(user.phone), password: input.password },
        headers: await headers(),
        returnHeaders: true,
      });
      authHeaders = result.headers;
    } catch {
      throw new ApiError(401, "UNAUTHORIZED", "Phone number or password is incorrect");
    }

    const response = ok({ userId: user.id, role: user.role, name: user.name });
    applyAuthCookies(response, authHeaders);
    return response;
  } catch (error) {
    return fail(error);
  }
}
