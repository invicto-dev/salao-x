import { Router } from "express";
import { CategoriesController } from "../controller/CategoriesController";

const router = Router();

router.get("/", CategoriesController.getCategories);
router.get("/:id", CategoriesController.getCategory);
router.post("/", CategoriesController.createCategory);
router.put("/:id", CategoriesController.updateCategory);
router.delete("/:id", CategoriesController.deleteCategory);

export { router as categoryRoutes };
