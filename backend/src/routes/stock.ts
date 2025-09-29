import { Router } from "express";
import { StockController } from "../controller/StockController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// --- ROTAS DE CONSULTA (GET) ---
router.get("/products", authenticateToken, StockController.getProductsStock);
router.get(
  "/movements/recent:limit?",
  authenticateToken,
  StockController.getRecentMovements
);
router.get("/kpis", authenticateToken, StockController.getKpis);

// --- ROTAS DE AÇÃO (POST, PUT) ---
router.post("/movements", authenticateToken, StockController.createMovement);
router.put(
  "/movements/:id/status",
  authenticateToken,
  StockController.approveOrRejectMovement
);

export { router as stockRoutes };
