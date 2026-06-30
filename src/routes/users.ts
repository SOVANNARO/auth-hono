import { Hono } from "hono";
import { getDB } from "../db";
import { users } from "../db/schema";
import { requireAuth } from "../middleware/auth";

type Bindings = { DB: D1Database; JWT_SECRET: string };
type Variables = { userId: number; userEmail: string };

const userRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

userRoutes.get("/", requireAuth, async (c) => {
  const db = getDB(c.env);
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users);

  return c.json(allUsers);
});

export default userRoutes;
