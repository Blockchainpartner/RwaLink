import { useState } from "react";
import toast from "react-hot-toast";
import { ABI } from "../ABI/abi";
import { CONTRACT_ADDRESSES, EID, CHAIN_NAMES, CHAINS } from "../constants";
import { ethers } from "ethers";
import { useChainId } from "wagmi";

export default function Bank() {
  const [whitelistAddress, setWhitelistAddress] = useState("");
  const [blacklistAddress, setBlacklistAddress] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [freezeAddress, setFreezeAddress] = useState("");
  const [burnAddress, setBurnAddress] = useState("");
  const [burnAmount, setBurnAmount] = useState("");
  const chainId = useChainId();
  // Placeholder function for each action
  const handleWhitelist = async (whitelistAddress: string) => {
    try {
      if (!window.ethereum) throw new Error("Wallet not found");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const connectedChainLabel = CHAIN_NAMES[chainId ?? 0];
      console.log("Connected to chain:", chainId);
      //const availableChains = CHAINS.filter((c) => c.id !== chainId);
      const destinationEIDs = Object.entries(EID)
        .filter(
          ([key]) =>
            key.toLowerCase() !==
            connectedChainLabel.replace(/\s+/g, "").toLowerCase()
        )
        .map(([, eid]) => eid);

      const contract = new ethers.Contract(
        //@ts-ignore
        CONTRACT_ADDRESSES[connectedChainLabel], // replace with correct chain or dynamic switch
        ABI,
        signer
      );
      const quote = await contract.quoteBatchWhitelist(
        destinationEIDs, // _dstEids
        whitelistAddress, // _whitelistAddress
        "0x", // _options (can be empty bytes)
        true, // status = true (whitelist)
        false // payInLzToken = false
      );
      //omnichain_whitelist
      const tx = await contract.changeWhitelist(
        destinationEIDs,
        whitelistAddress,
        "0x",
        true,
        {
          value: Number(quote[0]), // Pay the native fee
        }
      );
      const receipt = await tx.wait();
      console.log(`https://testnet.layerzeroscan.com/tx/${receipt.hash}`);
      toast.success("Multichain whitelisting successful");
      toast.success(`https:/testnet.layerzeroscan.com/tx/${receipt.hash}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to quote whitelist ❌");
    }
  };

  const handleBlacklist = () => {
    toast.success(`Blacklisted: ${blacklistAddress}`);
    // TODO: Call blacklist contract method here
  };

  const handleMint = () => {
    toast.success(`Minted ${mintAmount} tokens to ${mintAddress}`);
    // TODO: Call mint contract method here
  };

  const handleFreeze = () => {
    toast.success(`Froze: ${freezeAddress}`);
    // TODO: Call freeze contract method here
  };

  const handleBurn = () => {
    toast.success(`Burned ${burnAmount} tokens from ${burnAddress}`);
    // TODO: Call burn contract method here
  };

  return (
    <div className="flex h-screen">
      {/* Left: Project description */}
      <section className="flex-1 flex items-center justify-start pl-10">
        <div className="max-w-2xl text-left">
          <p className="text-gray-700 leading-relaxed">
            The <span className="font-semibold text-black">Bank</span> acts as
            the trusted on-chain authority, the owner of the RWA smart contract,
            responsible for maintaining regulatory compliance and operational
            integrity. It can:
          </p>
          <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
            <li>
              ✅ <span className="font-semibold">Whitelist addresses</span>:
              onboard users that passed{" "}
              <span className="text-blue-800 font-medium">KYC checks</span>
            </li>
            <li>
              🚫 <span className="font-semibold">Blacklist participants</span>:
              restrict sanctioned or fraudulent addresses
            </li>
            <li>
              💰 <span className="font-semibold">Mint tokens</span>: issue
              digital assets
            </li>
            <li>
              🧊 <span className="font-semibold">Freeze tokens</span>: hold
              assets for legal/regulatory/collateral purposes
            </li>
            <li>
              🔥 <span className="font-semibold">Burn tokens</span>: destroy
              tokens representing redeemed assets
            </li>
          </ul>
          <br />
        </div>
      </section>

      {/* Right: Admin panel */}
      <section className="flex-1 flex items-center justify-center pl-20 overflow-y-auto">
        <div className="grid grid-cols-1 gap-6 w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg text-black">
          {/* Whitelist */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Whitelist Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={whitelistAddress}
                onChange={(e) => setWhitelistAddress(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
                placeholder="0x..."
              />
              <button
                onClick={() => handleWhitelist(whitelistAddress)}
                className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
              >
                Whitelist
              </button>
            </div>
          </div>

          {/* Blacklist */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Blacklist Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={blacklistAddress}
                onChange={(e) => setBlacklistAddress(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
                placeholder="0x..."
              />
              <button
                onClick={handleBlacklist}
                className="bg-gradient-to-r from-black via-gray-800 to-red-700 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
              >
                Blacklist
              </button>
            </div>
          </div>

          {/* Mint */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Mint Tokens
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={mintAddress}
                onChange={(e) => setMintAddress(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
                placeholder="Address"
              />
              <input
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                className="w-24 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
                placeholder="Amount"
              />
              <button
                onClick={handleMint}
                className="bg-gradient-to-r from-green-500 via-lime-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
              >
                Mint
              </button>
            </div>
          </div>

          {/* Freeze */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Freeze Address
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={freezeAddress}
                onChange={(e) => setFreezeAddress(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
                placeholder="0x..."
              />
              <button
                onClick={handleFreeze}
                className="bg-gradient-to-r from-cyan-600 via-blue-400 to-slate-600 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
              >
                Freeze
              </button>
            </div>
          </div>

          {/* Burn */}
          <div>
            <label className="block text-sm font-semibold mb-1">
              Burn Tokens
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={burnAddress}
                onChange={(e) => setBurnAddress(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
                placeholder="Address"
              />
              <input
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                className="w-24 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
                placeholder="Amount"
              />
              <button
                onClick={handleBurn}
                className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:brightness-110 transition"
              >
                Burn
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
