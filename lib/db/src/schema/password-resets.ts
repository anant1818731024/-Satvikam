import { pgTable, serial, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const passwordResetsTable = pgTable("password_resets", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id"),
  isAdmin: boolean("is_admin").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PasswordReset = typeof passwordResetsTable.$inferSelect;
