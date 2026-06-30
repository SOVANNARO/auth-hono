import { verify } from "hono/jwt";
import type { Context, Next } from "hono";

export async function requireAuth(c: Context, next: Next) {
  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ error: "Unauthorized" }, 401);
  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");
    c.set("userId", payload.sub);
    c.set("userEmail", payload.email);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
}
