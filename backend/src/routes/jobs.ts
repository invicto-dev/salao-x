import { Router } from "express";
import { authenticateToken } from "../middlewares/auth";
import { JobController } from "../controller/JobController";

const router = Router();

router.get("/:jobId", authenticateToken, JobController.getJobStatus);

export { router as JobRoutes };
