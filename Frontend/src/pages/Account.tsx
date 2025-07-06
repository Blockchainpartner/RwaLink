import { useChainId } from "wagmi";
import { useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESSES, EID, CHAIN_NAMES, CHAINS } from "../constants";
import { ABI } from "../ABI/abi";
import toast from "react-hot-toast";

const providers = {
  sepolia: new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL_SEPOLIA),
  baseSepolia: new ethers.JsonRpcProvider(
    import.meta.env.VITE_RPC_URL_BASE_SEPOLIA
  ),
  arbitrumSepolia: new ethers.JsonRpcProvider(
    import.meta.env.VITE_RPC_URL_ARB_SEPOLIA
  ),
};

export default function Account() {
  const chainId = useChainId();
  const connectedChainLabel = CHAIN_NAMES[chainId ?? 0];
  console.log("Connected to chain:", chainId);
  const availableChains = CHAINS.filter((c) => c.id !== chainId);
  const [balances, setBalances] = useState({
    sepolia: 0,
    base: 0,
    arbitrum: 0,
  });

  // State to store whitelist status per chain
  const [whitelistStatus, setWhitelistStatus] = useState({
    sepolia: false,
    base: false,
    arbitrum: false,
  });

  const [transferTo, setTransferTo] = useState<number>(
    availableChains[0]?.id || 0
  );
  const [amount, setAmount] = useState("");

  const handleTransfer = async (
    connectedChainLabel: string,
    transferTo: number,
    amount: number
  ) => {
    console.log(
      `Sending ${amount} RWA from ${connectedChainLabel} to ${CHAIN_NAMES[transferTo]}`
    );
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const connectedChainLabel = CHAIN_NAMES[chainId ?? 0];
      console.log("Connected to chain:", chainId);
      const destinationEIDs = transferTo;

      const contract = new ethers.Contract(
        //@ts-ignore
        CONTRACT_ADDRESSES[connectedChainLabel], // replace with correct chain or dynamic switch
        ABI,
        signer
      );

      const quote = await contract.quoteSendRWA(
        //@ts-ignore
        EID[CHAIN_NAMES[destinationEIDs]], // _dstEids
        amount, // send Amount
        "0x", // _options (can be empty bytes)
        false // payInLzToken = false
      );
      //omnichain_send
      const tx = await contract.sendRWA(
        //@ts-ignore
        EID[CHAIN_NAMES[destinationEIDs]],
        amount,
        "0x",
        {
          value: Number(quote[0]), // Pay the native fee
        }
      );
      const receipt = await tx.wait();
      console.log(`https://testnet.layerzeroscan.com/tx/${receipt.hash}`);
      toast.success("Multichain Freeze successful");
      toast.success(`https:/testnet.layerzeroscan.com/tx/${receipt.hash}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Error while Sending ❌");
    }
    //toast.success(`Freezed ${freezeAmount} tokens `);
  };

  const refreshBalances = async () => {
    console.log("Querying balances...");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    try {
      const [sepoliaBalance, baseBalance, arbitrumBalance] = await Promise.all([
        new ethers.Contract(
          CONTRACT_ADDRESSES.sepolia,
          ABI,
          providers.sepolia
        ).balanceOf(userAddress),

        new ethers.Contract(
          CONTRACT_ADDRESSES.baseSepolia,
          ABI,
          providers.baseSepolia
        ).balanceOf(userAddress),

        new ethers.Contract(
          CONTRACT_ADDRESSES.arbitrumSepolia,
          ABI,
          providers.arbitrumSepolia
        ).balanceOf(userAddress),
      ]);

      setBalances({
        sepolia: Number(sepoliaBalance),
        base: Number(baseBalance),
        arbitrum: Number(arbitrumBalance),
      });
    } catch (error) {
      console.error("Error fetching balances:", error);
      alert("Failed to fetch balances");
    }
  };

  const checkWhitelistStatus = async () => {
    console.log("Checking whitelist status on all chains...");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    try {
      const results = await Promise.all([
        new ethers.Contract(
          CONTRACT_ADDRESSES.sepolia,
          ABI,
          providers.sepolia
        ).isWhitelisted(signer.address),
        new ethers.Contract(
          CONTRACT_ADDRESSES.baseSepolia,
          ABI,
          providers.baseSepolia
        ).isWhitelisted(signer.address),
        new ethers.Contract(
          CONTRACT_ADDRESSES.arbitrumSepolia,
          ABI,
          providers.arbitrumSepolia
        ).isWhitelisted(signer.address),
      ]);
      setWhitelistStatus({
        sepolia: results[0],
        base: results[1],
        arbitrum: results[2],
      });
    } catch (error) {
      console.error("Error checking whitelist status:", error);
      alert("Failed to fetch whitelist status");
    }
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
            As a user, you can monitor your Real World Asset (RWA) balances
            across all supported blockchains in real time.
            <br />
            <br />
            You can also transfer your tokens seamlessly between{" "}
            <span className="font-semibold">Sepolia</span>,{" "}
            <span className="font-semibold">Base Sepolia</span>, and{" "}
            <span className="font-semibold">Arbitrum Sepolia</span> using
            cross-chain messaging.
            <br />
            <br />
            This functionality becomes even more useful when secondary markets
            emerge, enabling liquidity and trading of tokenized assets across
            ecosystems.
            <br />
            <br />
            Manage your portfolio with confidence , wherever your assets are
            deployed.
          </p>
        </div>
      </section>

      {/* Right side: Interactive UI */}
      <section className="flex-1 flex flex-col gap-8 justify-center items-center pr-10">
        {/* Balances */}
        <div className="w-full max-w-xl bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow border border-white/20 text-black">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Your RWA Balances
          </h2>
          <ul className="space-y-2">
            <li>
              🔹 <strong>Sepolia:</strong> {balances.sepolia} RWA —{" "}
              {whitelistStatus.sepolia ? (
                <span className="text-green-600 font-semibold">
                  Whitelisted
                </span>
              ) : (
                <span className="text-red-600 font-semibold">
                  Not Whitelisted
                </span>
              )}
            </li>
            <li>
              🔹 <strong>Base Sepolia:</strong> {balances.base} RWA —{" "}
              {whitelistStatus.base ? (
                <span className="text-green-600 font-semibold">
                  Whitelisted
                </span>
              ) : (
                <span className="text-red-600 font-semibold">
                  Not Whitelisted
                </span>
              )}
            </li>
            <li>
              🔹 <strong>Arbitrum Sepolia:</strong> {balances.arbitrum} RWA —{" "}
              {whitelistStatus.arbitrum ? (
                <span className="text-green-600 font-semibold">
                  Whitelisted
                </span>
              ) : (
                <span className="text-red-600 font-semibold">
                  Not Whitelisted
                </span>
              )}
            </li>
          </ul>
          <div className="mt-4 flex gap-4">
            <button
              onClick={refreshBalances}
              className="bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
            >
              Refresh Balances
            </button>
            <button
              onClick={checkWhitelistStatus}
              className="bg-gradient-to-r from-green-500 via-lime-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
            >
              Check Whitelist Status
            </button>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="w-full max-w-xl bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow border border-white/20 text-black">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            Transfer RWA Crosschain
          </h2>

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
            onClick={() =>
              handleTransfer(connectedChainLabel, transferTo, Number(amount))
            }
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
