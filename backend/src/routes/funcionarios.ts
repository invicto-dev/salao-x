import { Router } from "express";
import { FuncionariosController } from "../controller/FuncionariosController";
import { authenticateToken, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", authenticateToken, FuncionariosController.getFuncionarios);
router.get("/:id", authenticateToken, FuncionariosController.getFuncionario);
router.post("/", authenticateToken, FuncionariosController.createFuncionario);
router.put("/:id", authenticateToken, FuncionariosController.updateFuncionario);
router.put(
  "/:userId/password",
  authenticateToken,
  requireAdmin,
  FuncionariosController.adminChangePassword
);

router.delete(
  "/:id",
  authenticateToken,
  FuncionariosController.deleteFuncionario
);

export { router as employeeRoutes };
