export const SESSION_COOKIE_NAME = "mobility_pulse_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  sub: string;
  exp: number;
  iat: number;
};

const encoder = new TextEncoder();

function encodeBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function sessionSecret() {
  const secret = process.env.MOBILITY_AUTH_SECRET;
  if (!secret || secret.length < 32) return null;
  return secret;
}

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, encoder.encode(value)),
  );
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

export function authIsConfigured() {
  return Boolean(
    process.env.MOBILITY_AUTH_USERNAME &&
    process.env.MOBILITY_AUTH_PASSWORD &&
    sessionSecret(),
  );
}

export function credentialsMatch(username: string, password: string) {
  const expectedUsername = process.env.MOBILITY_AUTH_USERNAME;
  const expectedPassword = process.env.MOBILITY_AUTH_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;

  const compare = (actual: string, expected: string) => {
    const actualBytes = encoder.encode(actual);
    const expectedBytes = encoder.encode(expected);
    return equalBytes(actualBytes, expectedBytes);
  };

  return (
    compare(username, expectedUsername) && compare(password, expectedPassword)
  );
}

export async function createSessionToken(
  username: string,
  maxAgeSeconds = SESSION_MAX_AGE_SECONDS,
) {
  const secret = sessionSecret();
  if (!secret)
    throw new Error("Authentifizierung ist nicht vollständig konfiguriert");
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    sub: username,
    iat: now,
    exp: now + maxAgeSeconds,
  };
  const encodedPayload = encodeBase64Url(
    encoder.encode(JSON.stringify(payload)),
  );
  const encodedSignature = encodeBase64Url(
    await signature(encodedPayload, secret),
  );
  return `${encodedPayload}.${encodedSignature}`;
}

export async function verifySessionToken(token?: string | null) {
  const secret = sessionSecret();
  if (!secret || !token) return null;
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra) return null;

  try {
    const expectedSignature = await signature(encodedPayload, secret);
    const receivedSignature = decodeBase64Url(encodedSignature);
    if (!equalBytes(expectedSignature, receivedSignature)) return null;
    const payload = JSON.parse(
      new TextDecoder().decode(decodeBase64Url(encodedPayload)),
    ) as SessionPayload;
    if (
      !payload.sub ||
      !payload.exp ||
      payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  const secureCookie =
    process.env.NODE_ENV === "production" &&
    process.env.MOBILITY_AUTH_SECURE_COOKIE !== "false";
  return {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}
