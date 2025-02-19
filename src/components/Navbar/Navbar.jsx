import { useState, useEffect } from "react"; // Import useEffect
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { injected } from "wagmi/connectors";
import { ethers } from "ethers";
import { useQuery } from "@tanstack/react-query"; // Import TanStack Query
import { ToastContainer, toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import react-toastify styles

import addresses from "../../abis/addresses.json";
import "./Navbar.css";

const SERVER_URL = process.env.REACT_APP_SERVER_URL; // backend URL
const TOKEN_ADDRESS = addresses.TAIKO_TOKEN_ADDRESS; // taiko token address

const Navbar = ({ refetchBalance }) => {
  const { address, isConnected } = useAccount();
  const { data, isLoading, refetch } = useBalance({
    address: address,
    token: TOKEN_ADDRESS,
    enabled: isConnected,
  });

  useEffect(() => {
    refetchBalance.current = refetch;
  }, [refetch, refetchBalance]);

  return (
    <nav className="navbar">
      <img src="/logotitle.svg" alt="Taiko Logo" />

      <div className="social-icons">
        <a
          href="https://github.com/taikoxyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/github.svg" alt="GitHub" className="github-icon" />
        </a>
        <a
          href="https://twitter.com/taikoxyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/X.svg" alt="X" className="x-icon" />
        </a>
        <a
          href="https://discord.com/invite/taikoxyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/discord.svg" alt="Discord" className="discord-icon" />
        </a>
      </div>

      <div className="wallet-section">
        {isConnected ? (
          <>
            <div className="wallet-container">
              {/* Default visible elements */}
              <div className="wallet-default">
                {isLoading ? (
                  <p className="wallet-address-loading">Loading balance...</p>
                ) : (
                  <div className="wallet-balance">
                    {" "}
                    <p>Balance: {data?.formatted}</p>
                    <p className="taiko-text">Taiko</p>
                    <img src="/taiko.png" alt="Taiko" />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <ConnectButton />
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </nav>
  );
};

export default Navbar;
