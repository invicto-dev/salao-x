import { Router } from "express";
import { CustomersController } from "../controller/customerController";

const router = Router();

router.get("/", CustomersController.getCustomers);
router.get("/:id", CustomersController.getCustomer);
router.post("/", CustomersController.createCustomer);
router.put("/:id", CustomersController.updateCustomer);
router.delete("/:id", CustomersController.deleteCustomer);

export { router as customerRoutes };
