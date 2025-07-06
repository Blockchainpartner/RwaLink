# RwaLink

**RwaLink** is a cross-chain Real World Asset (RWA) tokenization platform built on [ERC-7943 (uRWA)](https://eips.ethereum.org/EIPS/eip-7943), enabling compliant, scalable, and unified deployment of RWA tokens across multiple EVM-compatible blockchains. The project leverages [LayerZero](https://layerzero.network/) for seamless cross-chain function execution and messaging.

---

## 🌐 Overview

RwaLink allows institutions to issue, transfer, freeze, and manage RWAs on the blockchain of their choice and automatically reflect the changes across all configured chains. The core design eliminates the complexity of managing fragmented deployments across chains and provides a consistent, secure, and compliant experience.

---

## ✨ Features

- **Universal Interface:** Built on ERC-7943 (uRWA), ensuring standardized behavior and metadata across chains.
- **LayerZero-Powered Messaging:** Choose any origin chain to execute administrative or user actions; messages are relayed to all configured chains automatically.
- **Compliance Management:**
  - **Whitelist / KYC**
  - **Blacklist (e.g., for sanctions)**
  - **Freeze tokens (e.g., for collateral or legal holds)**
- **Cross-chain Transfers:** Users can view balances across all chains and transfer assets where needed.
- **Secondary Market Ready:** Prepare assets for liquidity and trading where future secondary markets emerge.

---

## 🔧 Tech Stack

| Layer       | Tech                                             |
|-------------|--------------------------------------------------|
| Smart Contracts | Solidity, Hardhat, LayerZero CLI              |
| Cross-chain | LayerZero (OApp standard, omnichain wiring)      |
| Frontend    | React.js, TailwindCSS, Vite                      |
| Web3        | Ethers.js, Wagmi                                 |
| Deployment  | LayerZero CLI, Hardhat Ignition                  |

---

## 🔗 Supported Chains

- Ethereum Sepolia
- Base Sepolia
- Arbitrum Sepolia

You can easily add new chains by extending the LayerZero `wire` configuration and redeploying the contracts using LayerZero CLI and Hardhat.

