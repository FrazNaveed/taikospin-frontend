import { useRef } from "react";
import { useAccount } from "wagmi";
import Navbar from "./components/Navbar/Navbar";
import SpinningWheel from "./components/SpinningWheel/SpinningWheel";
import "./App.css";

function App() {
  const { isConnected } = useAccount();
  const refetchBalance = useRef(() => {});

  return (
    <div className="App">
      <Navbar refetchBalance={refetchBalance} />
      {isConnected ? (
        <SpinningWheel refetchBalance={refetchBalance} />
      ) : (
        <h1 className="wallet-connection-prompt">
          Please connect your wallet to play.
        </h1>
      )}
    </div>
  );
}

export default App;
