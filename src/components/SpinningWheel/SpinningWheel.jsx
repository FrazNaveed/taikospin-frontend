import React, { useState } from "react";
import { ethers } from "ethers";
import { useSignTypedData, useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import addresses from "../../abis/addresses.json";

import "./SpinningWheel.css";

const SpinningWheel = ({ refetchBalance }) => {
  const [rotation, setRotation] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWheelVisible, setIsWheelVisible] = useState(false);
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const TOKEN_ADDRESS = addresses.TAIKO_TOKEN_ADDRESS; // taiko token address
  const SERVER_URL = process.env.REACT_APP_SERVER_URL; // backend URL

  const {
    data: nonce,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["nonce", address],
    queryFn: async () => {
      const response = await fetch(
        `${SERVER_URL}/contract/nonce?userAddress=${address}`
      );
      if (!response.ok) throw new Error("Failed to fetch nonce.");
      const data = await response.json();
      return data.nonce;
    },
    enabled: isConnected && Boolean(address),
    onError: () => {
      toast.error("Failed to fetch nonce.");
    },
  });

  const {
    data: signMessageData,
    isLoading: isLoadingMessage,
    error: messageError,
  } = useQuery({
    queryKey: ["signMessage", address], // Unique key for the query
    queryFn: async () => {
      const response = await fetch(
        `${SERVER_URL}/auth/signMessage?userAddress=${address}`
      );
      if (!response.ok) throw new Error("Failed to fetch sign message.");
      return response.json();
    },
    enabled: isConnected && Boolean(address), // Ensure enabled is a boolean or function returning boolean
    onError: () => {
      toast.error("Failed to fetch the signing message."); // Show error toast
    },
  });

  const letsSpin = async () => {
    if (!address) {
      alert("Please connect your wallet first!");
      return;
    }

    const domain = {
      name: "Taiko Token",
      version: "1",
      chainId: 167000,
      verifyingContract: addresses.TAIKO_TOKEN_ADDRESS,
    };

    const types = {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    };

    const message = {
      owner: address,
      spender: addresses.TAIKO_SPIN_WHEEL,
      value: ethers.parseUnits("1", "ether").toString(),
      nonce: nonce.hex.toString(), // Use the hex value of the nonce
      deadline: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
    };

    try {
      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: "Permit", // Explicitly specify the primary type
        message,
      });
      const res = await fetch(`${SERVER_URL}/contract/spin`, {
        method: "POST",
        body: JSON.stringify({
          signature: signature,
          message: message,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Proceed with spinning the wheel after successful signature
      const x = 1024; // min value
      const y = 9999; // max value
      const deg = Math.floor(Math.random() * (y - x)) + x;
      setRotation(deg);

      setTimeout(() => {
        setIsModalOpen(true);
      }, 5000);
    } catch (error) {
      console.error("Signature error:", error);
      alert("Signature request rejected!");
    }
  };

  const handleSignMessage = async () => {
    if (!signMessageData?.message) {
      toast.error("No message to sign."); // Show error toast
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Request the user to sign the message
      const signature = await signer.signMessage(signMessageData.message);

      // Send the signature to the backend for verification
      const res = await fetch(`${SERVER_URL}/auth/verifySignature`, {
        method: "POST",
        body: JSON.stringify({
          address: address,
          signature: signature,
          message: signMessageData.message,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();
      if (result.success) {
        toast.success(result.message); // Show success toast
        setIsWheelVisible(true);
        refetchBalance.current();
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      toast.error("Error signing the message."); // Show error toast
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsWheelVisible(false);
    refetchBalance.current();
  };

  return (
    <div id="main" className="main">
      {!isWheelVisible ? (
        <button
          className="request-button"
          onClick={() => {
            handleSignMessage();
          }}
        >
          Claim Taiko 🥁
        </button>
      ) : (
        <>
          <div
            id="wheel"
            className="wheel"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: "transform 3s ease-out",
            }}
          >
            <div>
              <span className="span1">
                <p>💵</p>
              </span>
              <span className="span2">
                <p>🔥</p>
              </span>
              <span className="span3">
                <p>💎</p>
              </span>
              <span className="span4">
                <p>🤑</p>
              </span>
              <span className="span5">
                <p>💰</p>
              </span>
              <span className="span6">
                <p>💳</p>
              </span>
              <span className="span7">
                <p>🚀</p>
              </span>
              <span className="span8">
                <p>💲</p>
              </span>
            </div>
          </div>
          <button className="spin" onClick={letsSpin}>
            SPIN
          </button>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Good Luck! 🎉</h2>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpinningWheel;
