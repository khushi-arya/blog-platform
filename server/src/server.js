import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const portValue = process.env.PORT || "5000";
const clientUrlValue = process.env.CLIENT_URL || "http://localhost:5173";

const validateEnvironment = () => {
  const errors = [];

  if (!process.env.MONGO_URI?.trim()) {
    errors.push("MONGO_URI is required");
  }

  if (!process.env.JWT_SECRET) {
    errors.push("JWT_SECRET is required");
  } else if (process.env.JWT_SECRET.length < 32) {
    errors.push("JWT_SECRET must be at least 32 characters");
  }

  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    errors.push("PORT must be an integer between 1 and 65535");
  }

  const clientUrls = clientUrlValue
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  if (
    clientUrls.length === 0 ||
    clientUrls.some((url) => {
      try {
        const parsedUrl = new URL(url);
        return !["http:", "https:"].includes(parsedUrl.protocol);
      } catch {
        return true;
      }
    })
  ) {
    errors.push("CLIENT_URL must be a comma-separated list of valid HTTP(S) URLs");
  }

  if (errors.length > 0) {
    console.error(`Invalid environment configuration:\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }

  return { port, clientUrls };
};

const { port } = validateEnvironment();

try {
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
} catch (error) {
  console.error("Failed to connect to MongoDB:", error.message);
  process.exitCode = 1;
}