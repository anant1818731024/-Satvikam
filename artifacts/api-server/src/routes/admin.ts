import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { eq, count, sum } from "drizzle-orm";
import { db, ordersTable, subscriptionsTable, usersTable, adminConfigTable } from "@workspace/db";
import { GetAdminSummaryResponse, AdminLoginBody, AdminChangePasswordBody } from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateAdminConfig() {
  const [existing] = await db.select().from(adminConfigTable);
  if (existing) return existing;
  const fallback = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(fallback, 12);
  const [created] = await db.insert(adminConfigTable).values({ passwordHash }).returning();
  return created;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.isAdmin) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Password required" });
    return;
  }
  const config = await getOrCreateAdminConfig();
  const valid = await bcrypt.compare(parsed.data.password, config.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  req.session.isAdmin = true;
  res.json({ authenticated: true });
});

router.post("/admin/logout", (req, res): void => {
  req.session.destroy(() => {});
  res.json({ authenticated: false });
});

router.get("/admin/me", (req, res): void => {
  res.json({ authenticated: !!req.session?.isAdmin });
});

router.post("/admin/change-password", requireAdmin, async (req, res): Promise<void> => {
  const parsed = AdminChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "currentPassword and newPassword are required" });
    return;
  }
  if (parsed.data.newPassword.length < 8) {
    res.status(400).json({ error: "New password must be at least 8 characters" });
    return;
  }
  const config = await getOrCreateAdminConfig();
  const valid = await bcrypt.compare(parsed.data.currentPassword, config.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Current password is incorrect" });
    return;
  }
  const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.update(adminConfigTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(adminConfigTable.id, config.id));
  res.json({ authenticated: true });
});

router.get("/admin/summary", requireAdmin, async (req, res): Promise<void> => {
  const [totalOrdersResult] = await db.select({ count: count() }).from(ordersTable);
  const [paidOrdersResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "paid"));
  const [pendingOrdersResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.status, "pending"));
  const [revenueResult] = await db
    .select({ total: sum(ordersTable.amount) })
    .from(ordersTable)
    .where(eq(ordersTable.status, "paid"));
  const [activeSubsResult] = await db
    .select({ count: count() })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.status, "active"));
  const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
  const [pendingDeliveriesResult] = await db
    .select({ count: count() })
    .from(ordersTable)
    .where(eq(ordersTable.deliveryStatus, "pending"));

  const summary = {
    totalOrders: totalOrdersResult?.count ?? 0,
    paidOrders: paidOrdersResult?.count ?? 0,
    pendingOrders: pendingOrdersResult?.count ?? 0,
    totalRevenue: Number(revenueResult?.total ?? 0),
    activeSubscriptions: activeSubsResult?.count ?? 0,
    totalUsers: totalUsersResult?.count ?? 0,
    pendingDeliveries: pendingDeliveriesResult?.count ?? 0,
  };

  res.json(GetAdminSummaryResponse.parse(summary));
});

export default router;
