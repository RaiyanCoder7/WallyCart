
import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI is not defined in the environment variables."
    );
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("MongoDB connected successfully");
  } catch (error: unknown) {
    console.error("MongoDB connection failed.");

    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);

      const mongoError = error as Error & {
        reason?: {
          type?: string;
          servers?: Map<string, { error?: Error }>;
        };
      };

      console.error("Topology type:", mongoError.reason?.type);

      if (mongoError.reason?.servers) {
        for (const [host, server] of mongoError.reason.servers) {
          console.error("Server:", host);
          console.error(
            "Server error:",
            server.error?.message ?? "No specific server error"
          );
        }
      }
    } else {
      console.error("Unknown error:", error);
    }

    throw error;
  }
};