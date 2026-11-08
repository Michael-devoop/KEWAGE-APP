import { headers } from "next/headers";
import { registerSchema } from "@skillconnect/domain";
import {
  ApiError,
  createUser,
  findUserByPhone,
  hashPassword,
  saveProfile,
} from "@skillconnect/api";
import { applyAuthCookies, auth } from "@/lib/auth";
import { fail, ok, parseBody } from "@/lib/http";
import { phoneToEmail } from "@/lib/phone-email";

const ADDIS_CENTER = { lat: 9.03, lng: 38.74, label: "Addis Ababa" };

export async function POST(request: Request) {
  try {
    const input = parseBody(registerSchema, await request.json());
    if (findUserByPhone(input.phone)) {
      throw new ApiError(409, "CONFLICT", "An account with this phone number already exists");
    }

    let authHeaders: Headers;
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: phoneToEmail(input.phone),
          password: input.password,
          name: input.name,
          role: input.role,
          phone: input.phone,
        },
        headers: await headers(),
        returnHeaders: true,
      });
      authHeaders = result.headers;
    } catch {
      throw new ApiError(409, "CONFLICT", "An account with this phone number already exists");
    }

    const user = createUser(
      { name: input.name, phone: input.phone, role: input.role },
      hashPassword(input.password),
    );

    if (input.role === "worker") {
      saveProfile({
        userId: user.id,
        skills: [],
        experienceYears: 0,
        location: ADDIS_CENTER,
        availableNow: false,
        assessmentStatus: "UNVERIFIED",
        ratingAvg: 0,
        ratingCount: 0,
        completedJobs: 0,
        responseRate: 0,
        lastActiveAt: new Date().toISOString(),
      });
    }

    const response = ok({ userId: user.id, role: user.role, name: user.name }, 201);
    applyAuthCookies(response, authHeaders);
    return response;
  } catch (error) {
    return fail(error);
  }
}
