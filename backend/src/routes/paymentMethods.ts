import { Router } from "express";
import { PaymentMethodsController } from "../controller/paymentMethodsController";

const router = Router();

router.get("/", PaymentMethodsController.getPaymentMethods);
router.get("/:id", PaymentMethodsController.getPaymentMethod);
router.post("/", PaymentMethodsController.createPaymentMethod);
router.put("/:id", PaymentMethodsController.updatepaymentMethod);
router.delete("/:id", PaymentMethodsController.deletePaymentMethod);

export { router as paymentMethodRoutes };
