import { Router } from "express";
import { PaymentMethodsController } from "../controller/PaymentMethodsController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.get("/", authenticateToken, PaymentMethodsController.getPaymentMethods);
router.get(
  "/:id",
  authenticateToken,
  PaymentMethodsController.getPaymentMethod
);
router.post(
  "/",
  authenticateToken,
  PaymentMethodsController.createPaymentMethod
);
router.put(
  "/:id",
  authenticateToken,
  PaymentMethodsController.updatepaymentMethod
);
router.delete(
  "/:id",
  authenticateToken,
  PaymentMethodsController.deletePaymentMethod
);

export { router as paymentMethodRoutes };
