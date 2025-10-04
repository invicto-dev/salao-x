import { Router } from "express";
import { StockController } from "../controller/StockController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get(
  "/movements/recent:limit?",
  authenticateToken,
  StockController.getRecentMovements
);
router.get("/kpis", authenticateToken, StockController.getKpis);
router.post("/movements", authenticateToken, StockController.createMovement);
router.put(
  "/movements/:id/status",
  authenticateToken,
  StockController.approveOrRejectMovement
);

export { router as stockRoutes };
