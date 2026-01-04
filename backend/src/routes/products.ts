import { Router } from "express";
import { ProductsController } from "../controller/ProductsController";
import { authenticateToken } from "../middlewares/auth";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/", authenticateToken, ProductsController.getProducts);
router.get("/:id", authenticateToken, ProductsController.getProduct);
router.post("/", authenticateToken, ProductsController.createProduct);
router.post(
  "/import",
  authenticateToken,
  upload.single("file"),
  ProductsController.importCSV
);
router.put("/:id", authenticateToken, ProductsController.updateProduct);
router.delete("/:id", authenticateToken, ProductsController.deleteProduct);

export { router as productRoutes };
