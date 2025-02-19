import React from "react";
import ReactDOM from "react-dom/client";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { taiko } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "./index.css";
import App from "./App";

const config = getDefaultConfig({
  appName: "Taiko Spin Dapp",
  projectId: process.env.REACT_APP_WALLET_CONNECT_ID,
  chains: [taiko],
});

const queryClient = new QueryClient();

// Custom theme with pink as the accent color
const customTheme = lightTheme({
  accentColor: "#FF1493", // Pink color
  accentColorForeground: "#FFFFFF", // White text for better contrast
  borderRadius: "medium",
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider theme={customTheme}>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);
