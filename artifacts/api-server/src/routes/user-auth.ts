import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable, ordersTable, subscriptionsTable, plansTable, productsTable } from "@workspace/db";
import { UserSignupBody, UserLoginBody, UpdateUserProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

export function requireUser(req: Request, res: Response, next: NextFunction): void {
  if (req.session?.userId) {
    next();
    return;
  }
  res.status(401).json({ error: "Not authenticated" });
}

function userToProfile(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email ?? null,
    address: user.address,
    pincode: user.pincode,
    createdAt: user.createdAt,
  };
}

router.post("/users/signup", async (req, res): Promise<void> => {
  const parsed = UserSignupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid signup data" });
    return;
  }

  const { name, phone, email, password, address, pincode } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.phone, phone));
  if (existing.length > 0) {
    res.status(400).json({ error: "An account with this phone number already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({ name, phone, email: email ?? null, passwordHash, address, pincode })
    .returning();

  req.session.userId = user.id;
  res.status(201).json({ authenticated: true, user: userToProfile(user) });
});

router.post("/users/login", async (req, res): Promise<void> => {
  const parsed = UserLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Phone and password required" });
    return;
  }

  const { phone, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone));

  if (!user || !user.passwordHash) {
    res.status(401).json({ error: "Invalid phone number or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid phone number or password" });
    return;
  }

  req.session.userId = user.id;
  res.json({ authenticated: true, user: userToProfile(user) });
});

router.post("/users/logout", (req, res): void => {
  req.session.userId = undefined;
  res.json({ authenticated: false });
});

router.get("/users/me", async (req, res): Promise<void> => {
  if (!req.session?.userId) {
    res.json({ authenticated: false });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId));

  if (!user) {
    req.session.userId = undefined;
    res.json({ authenticated: false });
    return;
  }

  res.json({ authenticated: true, user: userToProfile(user) });
});

router.patch("/users/me", requireUser, async (req, res): Promise<void> => {
  const parsed = UpdateUserProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid data" });
    return;
  }

  const { name, email, address, pincode } = parsed.data;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (address !== undefined) updates.address = address;
  if (pincode !== undefined) updates.pincode = pincode;

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.session.userId!))
    .returning();

  res.json(userToProfile(updated));
});

router.get("/users/me/orders", requireUser, async (req, res): Promise<void> => {
  const orders = await db
    .select({
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
    })
    .from(ordersTable)
    .leftJoin(usersTable, eq(ordersTable.userId, usersTable.id))
    .leftJoin(plansTable, eq(ordersTable.planId, plansTable.id))
    .leftJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .where(eq(ordersTable.userId, req.session.userId!))
    .orderBy(ordersTable.createdAt);

  res.json(orders.reverse());
});

router.get("/users/me/subscriptions", requireUser, async (req, res): Promise<void> => {
  const now = new Date();

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
    .where(eq(subscriptionsTable.userId, req.session.userId!))
    .orderBy(subscriptionsTable.createdAt);

  const updated = await Promise.all(
    subs.map(async (sub) => {
      if (sub.status === "active" && new Date(sub.endDate) < now) {
        const [patched] = await db
          .update(subscriptionsTable)
          .set({ status: "inactive" })
          .where(eq(subscriptionsTable.id, sub.id))
          .returning();
        return { ...sub, status: patched.status };
      }
      return sub;
    }),
  );

  res.json(updated.reverse());
});

export default router;
