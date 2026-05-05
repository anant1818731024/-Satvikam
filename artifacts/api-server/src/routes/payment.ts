import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, ordersTable, subscriptionsTable, plansTable } from "@workspace/db";
import { CreatePaymentOrderBody } from "@workspace/api-zod";
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
  // When RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set, replace with real Razorpay SDK call
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

  // When Razorpay keys are configured, verify HMAC-SHA256 signature:
  // const signature = req.headers['x-razorpay-signature'];
  // const body = JSON.stringify(req.body);
  // const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
  //   .update(body).digest('hex');
  // if (signature !== expectedSig) { res.status(400).json({ error: 'Invalid signature' }); return; }

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

      if (order) {
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
  const { orderId } = req.body as { orderId: string };
  if (!orderId) {
    res.status(400).json({ error: "orderId required" });
    return;
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status: "paid", paymentId: `test_pay_${Date.now()}` })
    .where(eq(ordersTable.orderId, orderId))
    .returning();

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

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

  logger.info({ orderId }, "Test payment confirmed");
  res.json({ success: true, orderId });
});

export default router;
