export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type Envelope<T> = { ok: true; data: T } | { ok: false; code?: string; message?: string };

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const envelope = (await response.json().catch(() => null)) as Envelope<T> | null;

  if (!response.ok || !envelope || envelope.ok === false) {
    const message =
      envelope && envelope.ok === false && envelope.message
        ? envelope.message
        : `Request failed (${response.status})`;
    throw new ApiClientError(message, response.status, envelope?.ok === false ? envelope.code : undefined);
  }

  return envelope.data;
}
