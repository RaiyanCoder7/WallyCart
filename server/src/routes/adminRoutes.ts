
import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getAdminSession,
  loginAdmin,
  logoutAdmin,
} from "../controllers/adminAuthController.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

router.post("/login", loginLimiter, loginAdmin);
router.get("/session", getAdminSession);
router.post("/logout", logoutAdmin);

export default router;