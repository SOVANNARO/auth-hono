import { Hono } from "hono";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";
import { getDB } from "../db";
import { users } from "../db/schema";
import { hashPassword, verifyPassword } from "../utils/password";

type Bindings = { DB: D1Database; JWT_SECRET: string };
type Variables = { userId: number; userEmail: string };

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

auth.post("/register", async (c) => {
  const { name, email, password } = await c.req.json();
  if (!name || !email || !password) {
    return c.json({ error: "Name, email, and password are required" }, 400);
  }

  const db = getDB(c.env);
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return c.json({ error: "Email already registered" }, 409);
  }

  const hashed = await hashPassword(password);
  const result = await db
    .insert(users)
    .values({ name, email, password: hashed })
    .returning();

  const token = await sign(
    { sub: result[0].id, email, exp: Math.floor(Date.now() / 1000) + 86400 },
    c.env.JWT_SECRET,
  );

  return c.json({ token, user: { id: result[0].id, name, email } }, 201);
});

auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password are required" }, 400);
  }

  const db = getDB(c.env);
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (result.length === 0) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const user = result[0];
  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const token = await sign(
    { sub: user.id, email, exp: Math.floor(Date.now() / 1000) + 86400 },
    c.env.JWT_SECRET,
  );

  return c.json({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
});

export default auth;
