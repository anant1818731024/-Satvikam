import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { eq, count, sum } from "drizzle-orm";
import { db, ordersTable, subscriptionsTable, usersTable } from "@workspace/db";
import { GetAdminSummaryResponse, AdminLoginBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

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
  if (parsed.data.password !== ADMIN_PASSWORD) {
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
