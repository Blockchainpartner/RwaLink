export const CONTRACT_ADDRESSES = {
    sepolia: "0xCC55Cb3c6aE9EFB1F99f426e954a9032Ad378544",
    baseSepolia: "0x26a466779f2Dd4DFdda22AC92263f4C055451C55",
    arbitrumSepolia: "0x62a4739174dB89608ebD33Bf8861dA7E5e313f4e",
    
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