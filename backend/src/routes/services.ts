import { Router } from "express";
import { ServicesController } from "../controller/ServicesController";

const router = Router();

router.get("/", ServicesController.getServices);
router.get("/:id", ServicesController.getService);
router.post("/", ServicesController.createService);
router.put("/:id", ServicesController.updateService);
router.delete("/:id", ServicesController.deleteService);

export { router as serviceRoutes };
