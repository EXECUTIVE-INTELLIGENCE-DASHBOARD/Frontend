import React from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";
import { SessionGate } from "./components/SessionGate";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles.css";
import "./ui-standard.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* Inside the theme so the gate is styled, outside the app so no
            dashboard is ever painted for a browser with no session. */}
        <SessionGate>
          <App />
        </SessionGate>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);