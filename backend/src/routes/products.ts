import { Router } from "express";
import { ProductsController } from "../controller/ProductsController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/", authenticateToken, ProductsController.getProducts);
router.get("/:id", authenticateToken, ProductsController.getProduct);
router.post("/", authenticateToken, ProductsController.createProduct);
router.put("/:id", authenticateToken, ProductsController.updateProduct);
router.delete("/:id", authenticateToken, ProductsController.deleteProduct);

export { router as productRoutes };
