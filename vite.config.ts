import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(process.cwd(), "dist", "public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Put all Stack Auth modules in one chunk to avoid circular dependencies
          if (id.includes('@stackframe/react')) {
            return 'stack-auth';
          }
          // Put all node_modules in vendor chunk except Stack Auth
          if (id.includes('node_modules') && !id.includes('@stackframe/react')) {
            return 'vendor';
          }
        },
      },
      // Suppress circular dependency warnings for Stack Auth
      onwarn(warning, warn) {
        if (
          warning.code === 'CIRCULAR_DEPENDENCY' &&
          warning.message.includes('@stackframe/react')
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
