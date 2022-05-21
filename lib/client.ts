const protocol =
  typeof window === "undefined"
    ? `${process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3000"}`
    : window.location.host;

const host =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_VERCEL_URL || "localhost:3000"
    : window.location.host;

export const origin = `${protocol}:${host}`;
