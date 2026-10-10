interface StoredCookie {
  value: string;
  options?: Record<string, unknown>;
}

export const cookieJar = new Map<string, StoredCookie>();

export async function cookies() {
  return {
    get: (name: string) => {
      const cookie = cookieJar.get(name);
      return cookie && { name, value: cookie.value };
    },
    set: (name: string, value: string, options?: Record<string, unknown>) => {
      cookieJar.set(name, { value, options });
    },
    delete: (cookie: string | { name: string }) => {
      cookieJar.delete(typeof cookie === "string" ? cookie : cookie.name);
    },
  };
}

export const requestHeaders = new Headers();

export async function headers() {
  return new Headers(requestHeaders);
}
