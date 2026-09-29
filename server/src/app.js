import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRoutes from "../routes/auth.js";
import commentsRoutes from "../routes/comments.js";
import postsRoutes from "../routes/posts.js";
import { errorHandler, notFoundHandler } from "../middleware/errorHandler.js";

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const isDevelopmentOrigin = (origin) =>
  process.env.NODE_ENV !== "production" &&
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_request, response) =>
    response.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    }),
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_request, response) =>
    response.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again later.",
    }),
});

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.includes(origin) || isDevelopmentOrigin(origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: "10kb" }));
app.use("/api", apiRateLimit);
app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api", commentsRoutes);

app.get("/api/health", (_request, response) => {
  response.json({ success: true, data: { status: "ok" } });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;