import { useState } from "react";

export default function Bank() {
  const [whitelistAddress, setWhitelistAddress] = useState("");
  const [blacklistAddress, setBlacklistAddress] = useState("");
  const [mintAddress, setMintAddress] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [freezeAddress, setFreezeAddress] = useState("");
  const [burnAddress, setBurnAddress] = useState("");
  const [burnAmount, setBurnAmount] = useState("");

  return (
    <div className="flex h-screen">
      {/* Left: Project description */}
<section className="flex-1 flex items-center justify-start pl-10">
  <div className="max-w-2xl text-left">
    <h1 className="text-4xl font-bold mb-6 text-black">
      Universal Real World Asset Tokenization
    </h1>
    <p className="text-gray-700 leading-relaxed">
 
      The <span className="font-semibold text-black">Bank</span> acts as the trusted on-chain authority , the owner of the RWA smart contract, responsible for maintaining regulatory compliance and operational integrity.
      It can:
 <ul className="list-disc list-inside mt-2 text-gray-700 space-y-1">
        <li>✅ <span className="font-semibold">Whitelist addresses</span> : onboard users and institutions that have successfully passed <span className="font-medium text-blue-800">KYC and compliance checks</span></li>
        <li>🚫 <span className="font-semibold">Blacklist participants</span> : restrict addresses due to sanctions, fraud, or other policy violations</li>
        <li>💰 <span className="font-semibold">Mint new RWA tokens</span> : issue digital representations of real-world financial assets</li>
        <li>🧊 <span className="font-semibold">Freeze tokens</span> : temporarily disable token transfers for <span className="font-medium text-gray-800">legal holds, regulatory action, or use as locked collateral</span> in financial protocols</li>
        <li>🔥 <span className="font-semibold">Burn tokens</span> : destroy tokens to reflect redemption, expiration, or invalidation of the underlying asset</li>
      </ul>
      <br />
    </p>
  </div>
</section>


      {/* Right: Admin panel */}
      <section className="flex-1 flex items-center justify-center pl-20 overflow-y-auto">
        <div className="grid grid-cols-1 gap-6 w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-lg text-black">
          
          {/* Whitelist */}
          <div>
            <label className="block text-sm font-semibold mb-1">Whitelist Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={whitelistAddress}
                onChange={(e) => setWhitelistAddress(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20 focus:outline-none"
                placeholder="0x..."
              />
              <button className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 text-white px-4 py-2 rounded-lg hover:brightness-110 transition">
                Whitelist
              </button>
            </div>
          </div>

          {/* Blacklist */}
          <div>
            <label className="block text-sm font-semibold mb-1">Blacklist Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={blacklistAddress}
                onChange={(e) => setBlacklistAddress(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
                placeholder="0x..."
              />
              <button className="bg-gradient-to-r from-black via-gray-800 to-red-700 text-white px-4 py-2 rounded-lg hover:brightness-110 transition">
                Blacklist
              </button>
            </div>
          </div>

          {/* Mint Tokens */}
          <div>
            <label className="block text-sm font-semibold mb-1">Mint Tokens</label>
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
              <button className="bg-gradient-to-r from-green-500 via-lime-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:brightness-110 transition">
                Mint
              </button>
            </div>
          </div>

          {/* Freeze */}
          <div>
            <label className="block text-sm font-semibold mb-1">Freeze Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={freezeAddress}
                onChange={(e) => setFreezeAddress(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/30 border border-black/20"
                placeholder="0x..."
              />
              <button className="bg-gradient-to-r from-cyan-600 via-blue-400 to-slate-600 text-white px-4 py-2 rounded-lg hover:brightness-110 transition">
                Freeze
              </button>
            </div>
          </div>

          {/* Burn Tokens */}
          <div>
            <label className="block text-sm font-semibold mb-1">Burn Tokens</label>
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
              <button className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white px-4 py-2 rounded-lg hover:brightness-110 transition">
                Burn
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
