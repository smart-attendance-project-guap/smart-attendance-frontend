const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const normalizedApiUrl = (configuredApiUrl || "http://localhost:3000").replace(/\/$/, "");

export const API_URL = normalizedApiUrl;
