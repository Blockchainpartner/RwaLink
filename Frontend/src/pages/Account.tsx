import { useChainId } from "wagmi";
import { useState } from "react";

const CHAIN_NAMES: Record<number, string> = {
  11155111: "Sepolia",
  84532: "Base Sepolia",
  421614: "Arbitrum Sepolia",
};

const CHAINS = [
  { id: 11155111, label: "Sepolia" },
  { id: 84532, label: "Base Sepolia" },
  { id: 421614, label: "Arbitrum Sepolia" },
];

export default function User() {
  const chainId = useChainId();
  const connectedChainLabel = CHAIN_NAMES[chainId ?? 0];
console.log("Connected to chain:", chainId);
  const availableChains = CHAINS.filter((c) => c.id !== chainId);
  const [balances, setBalances] = useState({
    sepolia: 0,
    base: 0,
    arbitrum: 0,
  });

  const [transferTo, setTransferTo] = useState<number>(availableChains[0]?.id || 0);
  const [amount, setAmount] = useState("");

  const handleTransfer = () => {
    console.log(`Sending ${amount} RWA from ${connectedChainLabel} to ${CHAIN_NAMES[transferTo]}`);
    // TODO: Add writeContract logic here
  };

  const refreshBalances = () => {
    console.log("Querying balances...");
    // TODO: Add readContract logic here
    setBalances({
      sepolia: 100,
      base: 40,
      arbitrum: 72,
    });
  };

  return (
    <div className="flex h-screen">
      {/* Left side: Text */}
      <section className="flex-1 flex items-center justify-start pl-10">
        <div className="max-w-2xl text-left">
          <h1 className="text-4xl font-bold mb-6 text-black">
            Your Crosschain RWA 
          </h1>
          <p className="text-gray-700 leading-relaxed">
            As a user, you can monitor your Real World Asset (RWA) balances across all supported blockchains in real time.
            <br /><br />
            You can also transfer your tokens seamlessly between <span className="font-semibold">Sepolia</span>, <span className="font-semibold">Base Sepolia</span>, and <span className="font-semibold">Arbitrum Sepolia</span> using cross-chain messaging.
            <br /><br />
            This functionality becomes even more useful when secondary markets emerge, enabling liquidity and trading of tokenized assets across ecosystems.
            <br /><br />
            Manage your portfolio with confidence — wherever your assets are deployed.
          </p>
        </div>
      </section>

      {/* Right side: Interactive UI */}
      <section className="flex-1 flex flex-col gap-8 justify-center items-center pr-10">
        {/* Balances */}
        <div className="w-full max-w-xl bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow border border-white/20 text-black">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Your RWA Balances</h2>
          <ul className="space-y-2">
            <li>🔹 <strong>Sepolia:</strong> {balances.sepolia} RWA</li>
            <li>🔹 <strong>Base Sepolia:</strong> {balances.base} RWA</li>
            <li>🔹 <strong>Arbitrum Sepolia:</strong> {balances.arbitrum} RWA</li>
          </ul>
          <button
            onClick={refreshBalances}
            className="mt-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
          >
            Refresh Balances
          </button>
        </div>

        {/* Transfer Form */}
        <div className="w-full max-w-xl bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow border border-white/20 text-black">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Transfer RWA Crosschain</h2>

          {/* From → To */}
          <div className="flex items-center gap-3 mb-4">
            <input
              disabled
              className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20 text-gray-800 font-medium"
              value={connectedChainLabel || "Not Connected"}
            />
            <span className="text-2xl">→</span>
            <select
              value={transferTo}
              onChange={(e) => setTransferTo(Number(e.target.value))}
              className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
            >
              {availableChains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount input */}
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/30 border border-black/20"
            />
          </div>

          <button
            onClick={handleTransfer}
            disabled={!chainId || !transferTo || !amount}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
          >
            Send Tokens
          </button>
        </div>
      </section>
    </div>
  );
}
