import { Router } from "express";
import { CaixaController } from "../controller/CaixaController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/abrir", authenticateToken, CaixaController.open);
router.post("/fechar", authenticateToken, CaixaController.close);
router.get("/", authenticateToken, CaixaController.getAll);
router.get("/aberto", authenticateToken, CaixaController.hasSessionOpen);
router.get(
  "/aberto/summary",
  authenticateToken,
  CaixaController.getOpenCaixaSummary
);
router.post("/movimentar", authenticateToken, CaixaController.move);

export { router as caixaRoutes };
