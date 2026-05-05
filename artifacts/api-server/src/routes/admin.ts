import { Router, type IRouter } from "express";
import { eq, count, sum } from "drizzle-orm";
import { db, ordersTable, subscriptionsTable, usersTable } from "@workspace/db";
import { GetAdminSummaryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/admin/summary", async (req, res): Promise<void> => {
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

  const summary = {
    totalOrders: totalOrdersResult?.count ?? 0,
    paidOrders: paidOrdersResult?.count ?? 0,
    pendingOrders: pendingOrdersResult?.count ?? 0,
    totalRevenue: Number(revenueResult?.total ?? 0),
    activeSubscriptions: activeSubsResult?.count ?? 0,
    totalUsers: totalUsersResult?.count ?? 0,
  };

  res.json(GetAdminSummaryResponse.parse(summary));
});

export default router;
