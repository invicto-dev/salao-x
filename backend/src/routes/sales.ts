import { Router } from "express";
import { SalesController } from "../controller/SalesController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/", authenticateToken, SalesController.getAll);
router.get("/:id", authenticateToken, SalesController.getById);
router.post("/", authenticateToken, SalesController.create);

router.patch("/:id/status", SalesController.updateStatus);

export { router as salesRoutes };
