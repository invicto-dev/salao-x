import { Router } from "express";
import { ConfiguracaoController } from "../controller/configuracaoController";

const router = Router();

router.get("/", ConfiguracaoController.getConfig);
router.patch("/:id", ConfiguracaoController.updateConfig);

export { router as settingsRoutes };
