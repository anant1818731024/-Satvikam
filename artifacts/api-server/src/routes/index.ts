import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import plansRouter from "./plans";
import usersRouter from "./users";
import ordersRouter from "./orders";
import subscriptionsRouter from "./subscriptions";
import paymentRouter from "./payment";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(plansRouter);
router.use(usersRouter);
router.use(ordersRouter);
router.use(subscriptionsRouter);
router.use(paymentRouter);
router.use(adminRouter);

export default router;
