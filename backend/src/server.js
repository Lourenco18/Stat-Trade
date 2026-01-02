import express from "express";
import cors from "cors";
import "express-async-errors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/auth.js";
import tradesRoutes from "./routes/trades.js";
import analyticsRoutes from "./routes/analytics.js";
import diaryRoutes from "./routes/diary.js";
import insightsRoutes from "./routes/insights.js";
import settingsRoutes from "./routes/settings.js";

// Import middleware
import { authenticate } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Import services
import { initializeScheduledTasks } from "./services/schedulerService.js";

// Initialize express app
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  },
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
  })
);

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Public routes
app.use("/api/auth", authRoutes);
app.use("/api/health", (req, res) => res.json({ status: "ok" }));

// Protected routes
app.use("/api/trades", authenticate, tradesRoutes);
app.use("/api/analytics", authenticate, analyticsRoutes);
app.use("/api/diary", authenticate, diaryRoutes);
app.use("/api/insights", authenticate, insightsRoutes);
app.use("/api/settings", authenticate, settingsRoutes);

// Socket.io events
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);

  // Initialize scheduled tasks
  initializeScheduledTasks();
});

export default app;
