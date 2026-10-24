
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

export const loginAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    email.length > 254 ||
    password.length === 0 ||
    password.length > 128
  ) {
    res.status(400).json({
      success: false,
      message: "Enter a valid email and password.",
    });
    return;
  }

  const configuredEmail = process.env.ADMIN_EMAIL;
  const configuredHash = process.env.ADMIN_PASSWORD_HASH;

  if (!configuredEmail || !configuredHash) {
    res.status(503).json({
      success: false,
      message: "Admin login is not configured.",
    });
    return;
  }

  let passwordMatches = false;

  try {
    passwordMatches = await bcrypt.compare(password, configuredHash);
  } catch {
    res.status(503).json({
      success: false,
      message: "Admin login is not configured correctly.",
    });
    return;
  }

  if (
    normalizeEmail(email) !== normalizeEmail(configuredEmail) ||
    !passwordMatches
  ) {
    res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
    return;
  }

  req.session.regenerate((error) => {
    if (error) {
      res.status(500).json({
        success: false,
        message: "Unable to start an admin session.",
      });
      return;
    }

    req.session.isAdmin = true;

    req.session.save((saveError) => {
      if (saveError) {
        res.status(500).json({
          success: false,
          message: "Unable to save the admin session.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Admin login successful.",
      });
    });
  });
};

export const getAdminSession = (
  req: Request,
  res: Response
): void => {
  if (!req.session.isAdmin) {
    res.status(401).json({
      success: false,
      message: "Admin login required.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    authenticated: true,
  });
};

export const logoutAdmin = (
  req: Request,
  res: Response
): void => {
  req.session.destroy((error) => {
    res.clearCookie("wallycart_admin_session", {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production" ||
        Boolean(process.env.VERCEL),
      sameSite:
        process.env.NODE_ENV === "production" ||
        Boolean(process.env.VERCEL)
          ? "none"
          : "lax",
      path: "/",
    });

    if (error) {
      res.status(500).json({
        success: false,
        message: "Unable to end the admin session.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  });
};