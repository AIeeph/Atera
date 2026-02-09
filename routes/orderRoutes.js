import { Router } from "express";
import { createOrder, getMyOrders } from "../controllers/orderController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createOrder);
router.get("/my", authMiddleware, getMyOrders);

export default router;
