export const CONTRACT_ADDRESSES = {
    sepolia: "0xF3A4B90d0988802B8658df510b834EAF299DF19D",
    baseSepolia: "0xe4e430285D4E1a42DCC3bBa6BF0a4790040C7624",
    arbitrumSepolia: "0x563Ac14Bfd04c3a3342D1466830ff4470cDFd76c",
} as const;

export const EID = {
    sepolia: 40231,
    baseSepolia: 40245,
    arbitrumSepolia: 40231,
} as const;

export const CHAIN_NAMES: Record<number, string> = {
    11155111: "sepolia",
    84532: "baseSepolia",
    421614: "arbitrumSepolia",
} as const;

export const CHAINS = [
    { id: 11155111, label: "sepolia" },
    { id: 84532, label: "baseSepolia" },
    { id: 421614, label: "arbitrumSepolia" },
] as const;