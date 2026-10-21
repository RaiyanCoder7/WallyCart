
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDatabase } from "./config/database.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;
let databaseConnection: Promise<void> | null = null;

const ensureDatabaseConnected = (): Promise<void> => {
  if (!databaseConnection) {
    databaseConnection = connectDatabase().catch((error: unknown) => {
      databaseConnection = null;
      throw error;
    });
  }

  return databaseConnection;
};

// Security headers
app.use(helmet());

// Configure CORS.
// Set FRONTEND_URL in your server environment when deploying.
const allowedOrigin = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: allowedOrigin
      ? allowedOrigin.split(",").map((origin) => origin.trim())
      : "http://localhost:5173",
  })
);

// Limit request body size to reduce oversized payload abuse.
app.use(express.json({ limit: "100kb" }));

// General API rate limit: 100 requests per 15 minutes per IP.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "WallyCart API is running!",
    timestamp: new Date().toISOString(),
  });
});

app.use(async (_req, _res, next) => {
  try {
    await ensureDatabaseConnected();
    next();
  } catch (error: unknown) {
    next(error);
  }
});

// Product and order routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Handle unknown routes
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// Central error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("API Error:", err.message);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
);

// Export the Express app for Vercel.
export default app;

// Start the local development server outside Vercel.
if (!process.env.VERCEL) {
  const startServer = async (): Promise<void> => {
    try {
      await ensureDatabaseConnected();

      app.listen(PORT, () => {
        console.log(
          `WallyCart API running at http://localhost:${PORT}`
        );
      });
    } catch (error: unknown) {
      console.error(
        "Server startup failed because the database could not be connected."
      );

      console.error("Detailed error:", error);

      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }

      process.exit(1);
    }
  };

  void startServer();
}