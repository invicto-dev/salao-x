import { Router } from "express";
import { ServicesController } from "../controller/ServicesController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/", authenticateToken, ServicesController.getServices);
router.get("/:id", authenticateToken, ServicesController.getService);
router.post("/", authenticateToken, ServicesController.createService);
router.put("/:id", authenticateToken, ServicesController.updateService);
router.delete("/:id", authenticateToken, ServicesController.deleteService);

export { router as serviceRoutes };
