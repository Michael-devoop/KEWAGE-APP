export type ApiErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "EXPIRED"
  | "NETWORK";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const notFound = (what: string) => new ApiError(404, "NOT_FOUND", `${what} not found`);
export const conflict = (message: string) => new ApiError(409, "CONFLICT", message);
export const forbidden = (message = "You do not have access to this resource") =>
  new ApiError(403, "FORBIDDEN", message);
export const expired = (message = "This offer has expired") =>
  new ApiError(410, "EXPIRED", message);
