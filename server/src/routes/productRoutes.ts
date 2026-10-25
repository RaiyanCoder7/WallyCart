import { Router } from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  patchProduct,
} from "../controllers/productController.js";

import { requireAdminSession } from "../middleware/requireAdminSession.js";

const router = Router();

// Public product browsing
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin-only product management
router.post("/", requireAdminSession, createProduct);
router.put("/:id", requireAdminSession, updateProduct);
router.patch("/:id", requireAdminSession, patchProduct);
router.delete("/:id", requireAdminSession, deleteProduct);

export default router;