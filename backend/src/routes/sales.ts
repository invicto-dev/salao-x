import { Router } from "express";
import { SalesController } from "../controller/salesController";

const router = Router();

router.get("/", SalesController.getAll);
router.get("/:id", SalesController.getById);
router.post("/", SalesController.create);

router.patch("/:id/status", SalesController.updateStatus);

export { router as salesRoutes };
