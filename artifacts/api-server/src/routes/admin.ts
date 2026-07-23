import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { eq, count, sum, and, isNull, gt } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db, ordersTable, subscriptionsTable, usersTable, adminConfigTable, passwordResetsTable } from "@workspace/db";
import {
  GetAdminSummaryResponse,
  AdminLoginBody,
  AdminChangePasswordBody,
  AdminForgotPasswordBody,
  ResetPasswordBody,
  GetSettingsResponse,
  UpdateAdminSettingsBody,
  UpdateAdminSettingsResponse,
} from "@workspace/api-zod";

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

router.post("/admin/forgot-password", async (req, res): Promise<void> => {
  const parsed = AdminForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Recovery secret is required" });
    return;
  }

  const recoverySecret = process.env.ADMIN_RECOVERY_SECRET;
  if (!recoverySecret) {
    res.status(400).json({ error: "Password recovery is not configured. Set the ADMIN_RECOVERY_SECRET environment variable." });
    return;
  }

  if (parsed.data.recoverySecret !== recoverySecret) {
    res.status(401).json({ error: "Invalid recovery secret" });
    return;
  }

  await db.delete(passwordResetsTable).where(
    and(eq(passwordResetsTable.isAdmin, true), isNull(passwordResetsTable.usedAt))
  );

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(passwordResetsTable).values({ token, userId: null, isAdmin: true, expiresAt });

  const resetUrl = `/admin/reset-password?token=${token}`;
  req.log.info("Admin password reset token generated");

  res.json({ message: "Admin reset link generated. Use it within 1 hour.", resetUrl });
});

router.post("/admin/reset-password", async (req, res): Promise<void> => {
  const parsed = ResetPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Token and new password are required" });
    return;
  }

  const { token, newPassword } = parsed.data;

  if (newPassword.length < 8) {
    res.status(400).json({ error: "Admin password must be at least 8 characters" });
    return;
  }

  const now = new Date();
  const [reset] = await db
    .select()
    .from(passwordResetsTable)
    .where(
      and(
        eq(passwordResetsTable.token, token),
        eq(passwordResetsTable.isAdmin, true),
        isNull(passwordResetsTable.usedAt),
        gt(passwordResetsTable.expiresAt, now)
      )
    );

  if (!reset) {
    res.status(400).json({ error: "This reset link is invalid or has expired" });
    return;
  }

  const config = await getOrCreateAdminConfig();
  const newHash = await bcrypt.hash(newPassword, 12);
  await db.update(adminConfigTable).set({ passwordHash: newHash, updatedAt: new Date() }).where(eq(adminConfigTable.id, config.id));
  await db.update(passwordResetsTable).set({ usedAt: now }).where(eq(passwordResetsTable.id, reset.id));

  req.log.info("Admin password reset successfully");
  res.json({ authenticated: false });
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

router.get("/settings", async (req, res): Promise<void> => {
  const config = await getOrCreateAdminConfig();
  res.json(GetSettingsResponse.parse({ whatsappNumber: config.whatsappNumber }));
});

router.put("/admin/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateAdminSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "whatsappNumber is required" });
    return;
  }
  const whatsappNumber = parsed.data.whatsappNumber.trim();
  if (!/^\d{10,15}$/.test(whatsappNumber)) {
    res.status(400).json({ error: "whatsappNumber must be digits only, including country code (10-15 digits)" });
    return;
  }
  const config = await getOrCreateAdminConfig();
  await db.update(adminConfigTable).set({ whatsappNumber, updatedAt: new Date() }).where(eq(adminConfigTable.id, config.id));
  res.json(UpdateAdminSettingsResponse.parse({ whatsappNumber }));
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
