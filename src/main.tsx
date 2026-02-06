import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SettingsProvider } from "./contexts/SettingsContext"; // ★追加
import "./App.css"; // CSSがあれば

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* ▼▼▼ Providerで囲む ▼▼▼ */}
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
);