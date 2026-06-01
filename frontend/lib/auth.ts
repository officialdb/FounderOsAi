const authCookieName = "founderos_token";
const authStorageKey = "founderos_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const fromStorage = window.localStorage.getItem(authStorageKey);
  if (fromStorage) {
    return fromStorage;
  }

  const cookieMatch = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${authCookieName}=`));

  return cookieMatch ? decodeURIComponent(cookieMatch.split("=")[1] ?? "") : null;
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(authStorageKey, token);
  document.cookie = `${authCookieName}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(authStorageKey);
  document.cookie = `${authCookieName}=; path=/; max-age=0; samesite=lax`;
}

