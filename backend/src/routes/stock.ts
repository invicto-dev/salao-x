import { Router } from "express";
import { StockController } from "../controller/stockController";

const router = Router();

// --- ROTAS DE CONSULTA (GET) ---
router.get("/products", StockController.getProductsStock);
router.get("/movements/recent:limit?", StockController.getRecentMovements);
router.get("/kpis", StockController.getKpis);

// --- ROTAS DE AÇÃO (POST, PUT) ---
router.post("/movements", StockController.createMovement);
router.put("/movements/:id/status", StockController.approveOrRejectMovement);

export { router as stockRoutes };
