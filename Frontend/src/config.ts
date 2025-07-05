import { http, createConfig } from "wagmi";
import { arbitrumSepolia, baseSepolia, mainnet, sepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const config = createConfig({
  connectors: [metaMask()],
  chains: [mainnet, sepolia, baseSepolia, arbitrumSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
  ssr: false, // Optional: set to `true` if using server-side rendering
});
