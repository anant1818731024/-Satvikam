import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, subscriptionsTable, plansTable } from "@workspace/db";
import { CreatePaymentOrderBody, ConfirmTestPaymentBody } from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.post("/payment/create-order", async (req, res): Promise<void> => {
  const parsed = CreatePaymentOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { orderId, amount, phone } = parsed.data;

  req.log.info({ orderId, phone }, "Creating payment order");

  // Stub Razorpay integration — keys not yet configured
  const razorpayOrderId = `rzp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  res.json({
    razorpayOrderId,
    amount,
    currency: "INR",
    orderId,
  });
});

router.post("/payment/webhook", async (req, res): Promise<void> => {
  req.log.info("Payment webhook received");

  const event = req.body;

  if (event?.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;
    const orderIdStr: string | undefined = payment?.notes?.order_id;
    const paymentId: string | undefined = payment?.id;

    if (orderIdStr && paymentId) {
      const [order] = await db
        .update(ordersTable)
        .set({ status: "paid", paymentId })
        .where(eq(ordersTable.orderId, orderIdStr))
        .returning();

      if (order && order.planId) {
        const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, order.planId));
        if (plan) {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + plan.durationDays);

          await db.insert(subscriptionsTable).values({
            userId: order.userId,
            planId: order.planId,
            orderId: order.orderId,
            startDate,
            endDate,
            status: "active",
          });

          req.log.info({ orderId: orderIdStr, paymentId }, "Subscription created after payment");
        }
      }
    }
  }

  res.json({ success: true });
});

// Manual payment confirm endpoint for testing (when Razorpay is not yet configured)
router.post("/payment/confirm-test", async (req, res): Promise<void> => {
  const parsed = ConfirmTestPaymentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "orderId required" });
    return;
  }

  const { orderId } = parsed.data;

  const [order] = await db
    .update(ordersTable)
    .set({ status: "paid", paymentId: `test_pay_${Date.now()}` })
    .where(eq(ordersTable.orderId, orderId))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // Only create subscription if this is a subscription-type order with a plan
  if (order.type === "subscription" && order.planId) {
    const [plan] = await db.select().from(plansTable).where(eq(plansTable.id, order.planId));
    if (plan) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.durationDays);

      await db.insert(subscriptionsTable).values({
        userId: order.userId,
        planId: order.planId,
        orderId: order.orderId,
        startDate,
        endDate,
        status: "active",
      });
    }
  }

  logger.info({ orderId }, "Test payment confirmed");
  res.json({ success: true });
});

export default router;
