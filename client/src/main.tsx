import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { StackProvider, StackTheme } from "@stackframe/react";
import { stackClientApp } from "../../stack/client";
import App from "./App";
import "./index.css";

// Get root element with proper error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Make sure there's a div with id='root' in your HTML.");
}

// Create root and render app with StrictMode for better development experience
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <StackProvider app={stackClientApp}>
      <StackTheme>
        <App />
      </StackTheme>
    </StackProvider>
  </StrictMode>
);
