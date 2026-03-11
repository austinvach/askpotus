import { Router, type IRouter } from "express";
import healthRouter from "./health";
import executiveOrdersRouter from "./executive-orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(executiveOrdersRouter);

export default router;
