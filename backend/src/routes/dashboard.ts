import { Router } from "express";
import { DashboardController } from "../controller/DashboardController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/stats", authenticateToken, DashboardController.getStats);

export { router as dashboardRoutes };
