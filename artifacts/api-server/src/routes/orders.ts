import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, usersTable, plansTable, productsTable } from "@workspace/db";
import {
  CreateOrderBody,
  UpdateOrderParams,
  UpdateOrderBody,
  GetOrderParams,
  GetOrderByOrderIdParams,
  ListOrdersQueryParams,
  ListOrdersResponse,
  GetOrderResponse,
  UpdateOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function generateOrderId(): string {
  return `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

const orderSelectFields = {
  id: ordersTable.id,
  orderId: ordersTable.orderId,
  userId: ordersTable.userId,
  planId: ordersTable.planId,
  productId: ordersTable.productId,
  type: ordersTable.type,
  amount: ordersTable.amount,
  status: ordersTable.status,
  deliveryStatus: ordersTable.deliveryStatus,
  paymentId: ordersTable.paymentId,
  createdAt: ordersTable.createdAt,
  userName: usersTable.name,
  planName: plansTable.name,
  productName: productsTable.name,
};

router.get("/orders", async (req, res): Promise<void> => {
  const queryParsed = ListOrdersQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.message });
    return;
  }

  const orders = await db
    .select(orderSelectFields)
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(plansTable, eq(ordersTable.planId, plansTable.id))
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .orderBy(ordersTable.createdAt);

  let filtered = orders;
  if (queryParsed.data.status) {
    filtered = filtered.filter((o) => o.status === queryParsed.data.status);
  }
  if (queryParsed.data.type) {
    filtered = filtered.filter((o) => o.type === queryParsed.data.type);
  }
  if (queryParsed.data.deliveryStatus) {
    filtered = filtered.filter((o) => o.deliveryStatus === queryParsed.data.deliveryStatus);
  }

  res.json(ListOrdersResponse.parse(filtered));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const orderId = generateOrderId();
  const orderType = parsed.data.type ?? "subscription";
  const [order] = await db
    .insert(ordersTable)
    .values({
      ...parsed.data,
      orderId,
      status: "pending",
      type: orderType,
    })
    .returning();

  const [result] = await db
    .select(orderSelectFields)
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(plansTable, eq(ordersTable.planId, plansTable.id))
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .where(eq(ordersTable.id, order.id));

  res.status(201).json(GetOrderResponse.parse(result));
});

router.get("/orders/by-order-id/:orderId", async (req, res): Promise<void> => {
  const params = GetOrderByOrderIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select(orderSelectFields)
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(plansTable, eq(ordersTable.planId, plansTable.id))
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .where(eq(ordersTable.orderId, params.data.orderId));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(order));
});

router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select(orderSelectFields)
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(plansTable, eq(ordersTable.planId, plansTable.id))
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  res.json(GetOrderResponse.parse(order));
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const params = UpdateOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(ordersTable)
    .set(parsed.data)
    .where(eq(ordersTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const [result] = await db
    .select(orderSelectFields)
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(plansTable, eq(ordersTable.planId, plansTable.id))
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .where(eq(ordersTable.id, updated.id));

  res.json(UpdateOrderResponse.parse(result));
});

export default router;
