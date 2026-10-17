import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/database.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();

const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/products", productRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "WallyCart API is running!",
    timestamp: new Date().toISOString(),
  });
});


app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("API Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});


const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

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

startServer();