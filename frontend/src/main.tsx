import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { MarketProvider } from "./context/MarketContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MarketProvider>
      <App />
    </MarketProvider>
  </StrictMode>
);
