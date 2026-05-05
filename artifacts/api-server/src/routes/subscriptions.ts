import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, subscriptionsTable, usersTable, plansTable } from "@workspace/db";
import {
  GetSubscriptionParams,
  ListSubscriptionsQueryParams,
  ListSubscriptionsResponse,
  GetSubscriptionResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/subscriptions", async (req, res): Promise<void> => {
  const queryParsed = ListSubscriptionsQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  const subs = await db
    .select({
      id: subscriptionsTable.id,
      userId: subscriptionsTable.userId,
      planId: subscriptionsTable.planId,
      orderId: subscriptionsTable.orderId,
      startDate: subscriptionsTable.startDate,
      endDate: subscriptionsTable.endDate,
      status: subscriptionsTable.status,
      createdAt: subscriptionsTable.createdAt,
      userName: usersTable.name,
      planName: plansTable.name,
    })
    .from(subscriptionsTable)
    .leftJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
    .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
    .orderBy(subscriptionsTable.createdAt);

  const filtered = queryParsed.data.status
    ? subs.filter((s) => s.status === queryParsed.data.status)
    : subs;

  res.json(ListSubscriptionsResponse.parse(filtered));
});

router.get("/subscriptions/:id", async (req, res): Promise<void> => {
  const params = GetSubscriptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [sub] = await db
    .select({
      id: subscriptionsTable.id,
      userId: subscriptionsTable.userId,
      planId: subscriptionsTable.planId,
      orderId: subscriptionsTable.orderId,
      startDate: subscriptionsTable.startDate,
      endDate: subscriptionsTable.endDate,
      status: subscriptionsTable.status,
      createdAt: subscriptionsTable.createdAt,
      userName: usersTable.name,
      planName: plansTable.name,
    })
    .from(subscriptionsTable)
    .leftJoin(usersTable, eq(subscriptionsTable.userId, usersTable.id))
    .leftJoin(plansTable, eq(subscriptionsTable.planId, plansTable.id))
    .where(eq(subscriptionsTable.id, params.data.id));

  if (!sub) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }

  res.json(GetSubscriptionResponse.parse(sub));
});

export default router;
