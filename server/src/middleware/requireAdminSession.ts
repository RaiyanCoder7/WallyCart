
import type { Request, Response, NextFunction } from "express";

export const requireAdminSession = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.session.isAdmin) {
    res.status(401).json({
      success: false,
      message: "Admin login required.",
    });
    return;
  }

  next();
};