import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const adminConfigTable = pgTable("admin_config", {
  id: serial("id").primaryKey(),
  passwordHash: text("password_hash").notNull(),
  whatsappNumber: text("whatsapp_number").notNull().default("919999999999"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type AdminConfig = typeof adminConfigTable.$inferSelect;
