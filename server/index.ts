import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { userMiddleware } from "./middleware/user";
import { requestIdMiddleware } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// 1. Basic Express middleware (parsing, cookies) - must come first
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 2. Request ID middleware - early for traceability (requirement 5.4)
app.use(requestIdMiddleware);

// 3. User authentication middleware - after request ID for proper logging (requirement 5.4)
app.use(userMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // 4. Register API routes (includes rate limiting on specific endpoints) - requirement 5.2
  const server = await registerRoutes(app);

  // 5. Error handler middleware MUST be last (requirement 5.3)
  app.use(errorHandler);

  // 6. Static file serving - after all API routes and error handling
  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
