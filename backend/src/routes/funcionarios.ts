import { Router } from "express";
import { FuncionariosController } from "../controller/funcionariosController";

const router = Router();

router.get("/", FuncionariosController.getFuncionarios);
router.get("/:id", FuncionariosController.getFuncionario);
router.post("/", FuncionariosController.createFuncionario);
router.put("/:id", FuncionariosController.updateFuncionario);
router.delete("/:id", FuncionariosController.deleteFuncionario);

export { router as employeeRoutes };
