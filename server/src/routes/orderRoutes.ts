
import { Router } from "express";
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

// Customer endpoints
router.post("/", createOrder);
router.get("/:id", getOrderById);

// Admin-only endpoint
router.patch("/:id/status", requireAdmin, updateOrderStatus);

export default router;