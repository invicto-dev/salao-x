import { Router } from "express";
import { AuthController } from "../controller/AuthController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

// Rotas públicas
router.post("/login", AuthController.login);

// Rotas protegidas
router.get("/profile", authenticateToken, AuthController.getProfile);

export { router as authRoutes };
