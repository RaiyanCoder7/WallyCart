
import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const configuredSecret = process.env.ORDER_ADMIN_SECRET;
  const providedSecret = req.get("x-admin-secret");

  if (!configuredSecret || !providedSecret) {
    res.status(401).json({
      success: false,
      message: "Admin authorization required.",
    });
    return;
  }

  const configuredBuffer = Buffer.from(configuredSecret, "utf8");
  const providedBuffer = Buffer.from(providedSecret, "utf8");

  if (
    configuredBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(configuredBuffer, providedBuffer)
  ) {
    res.status(403).json({
      success: false,
      message: "Admin authorization failed.",
    });
    return;
  }

  next();
};