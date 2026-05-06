import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderId: text("order_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  planId: integer("plan_id"),
  productId: integer("product_id"),
  type: text("type").notNull().default("subscription").$type<"subscription" | "single_item">(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending").$type<"pending" | "paid">(),
  deliveryStatus: text("delivery_status").notNull().default("pending").$type<"pending" | "delivered">(),
  paymentId: text("payment_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, orderId: true, paymentId: true, status: true, deliveryStatus: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
