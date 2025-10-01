import { Router } from "express";
import { ConfiguracaoController } from "../controller/ConfiguracaoController";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get(
  "/",
  authenticateToken,
  requireAdmin,
  ConfiguracaoController.getConfig
);
router.patch(
  "/:id",
  authenticateToken,
  requireAdmin,
  ConfiguracaoController.updateConfig
);

export { router as settingsRoutes };
