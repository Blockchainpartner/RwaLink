import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect, useEnsName } from "wagmi";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  const [isReady, setIsReady] = useState(false);
  const connector = connectors[0]; // Use first connector (e.g., MetaMask)

  useEffect(() => {
    if (!connector) return;

    const check = async () => {
      const provider = await connector.getProvider();
      setIsReady(!!provider);
    };

    check();
  }, [connector]);

  if (!connector) return null;

return (
  <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
    {!isConnected ? (
      <button
        onClick={() => connect({ connector })}
        disabled={!isReady || isPending}
        className={`px-5 py-2 rounded-lg font-semibold text-white transition-all duration-300
          ${
            isPending
              ? "opacity-50 cursor-not-allowed"
              : "bg-gradient-to-r from-violet-400 via-indigo-500 to-blue-500 hover:shadow-lg hover:brightness-110 backdrop-blur-md border border-white/20"
          }
        `}
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
    ) : (
      <>
        <div className="text-blue-900 font-medium hidden sm:block">
          {ensName
            ? `${ensName} (${address?.slice(0, 4)}...${address?.slice(-4)})`
            : `${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-red-400 via-pink-500 to-rose-500 backdrop-blur-md border border-white/20 transition-all duration-300 hover:shadow-lg hover:brightness-110"
        >
          Disconnect
        </button>
      </>
    )}
  </div>
);


}
