import { drizzle } from "drizzle-orm/d1";

export function getDB(env: { DB: D1Database }) {
  return drizzle(env.DB);
}
