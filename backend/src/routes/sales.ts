import { Router } from "express";
import { SalesController } from "../controller/SalesController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/", authenticateToken, SalesController.getAll);
router.get("/:id", authenticateToken, SalesController.getById);
router.post("/", authenticateToken, SalesController.create);

router.put(
  "/finish-command/:id",
  authenticateToken,
  SalesController.finishCommand
);
router.patch("/:id/status", authenticateToken, SalesController.updateStatus);

export { router as salesRoutes };
