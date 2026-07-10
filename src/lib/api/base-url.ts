const BASE_URL_CANDIDATES = [
  process.env.API_URL,
  process.env.NEXT_PUBLIC_API_URL,
];

export function getApiBaseUrl(): string {
  const baseUrl = BASE_URL_CANDIDATES.find((value): value is string =>
    Boolean(value?.trim()),
  );

  if (!baseUrl) {
    throw new Error(
      "API base URL is not configured. Set API_URL or NEXT_PUBLIC_API_URL.",
    );
  }

  return baseUrl.replace(/\/$/, "");
}
