
import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAdminSession } from "../middleware/requireAdminSession.js";

const router = Router();

// Customer endpoints
router.post("/", createOrder);
router.get("/:id", getOrderById);

// Admin-only endpoints
router.get("/", requireAdminSession, getAllOrders);
router.patch("/:id/status", requireAdminSession, updateOrderStatus);

export default router;