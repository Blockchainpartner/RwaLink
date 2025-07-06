# RwaLink

**RwaLink** is a cross-chain Real World Asset (RWA) tokenization platform built on [ERC-7943 (uRWA)](https://eips.ethereum.org/EIPS/eip-7943), enabling compliant, scalable, and unified deployment of RWA tokens across multiple EVM-compatible blockchains. The project leverages [LayerZero](https://layerzero.network/) for seamless cross-chain function execution and messaging.

---

## 🌐 Overview

RwaLink allows institutions to issue, transfer, freeze, and manage RWAs on the blockchain of their choice and automatically reflect the changes across all configured chains. The core design eliminates the complexity of managing fragmented deployments across chains and provides a consistent, secure, and compliant experience.

---

## Setup

- Copy `.env.example` into a new `.env`
- Fill in the fields in the `.env` file

  - You can specify either `MNEMONIC` or `PRIVATE_KEY`:

    ```
    MNEMONIC="test test test test test test test test test test test junk"
    or...
    PRIVATE_KEY="0xabc...def"
    ```

- Install all the dependencies:

    ```
    npm install
    ```

- Fund this deployer address/account with the native tokens of the chains you want to deploy to. This example by default will deploy to the following chains' testnets: **Ethereum Sepolia**, **Arbitrum Sepolia** and **Base Sepolia**.

## Build

```
npx hardhat compile
```

## Deploy

To deploy the OApp contracts to your desired blockchains, run the following command:

```
npx hardhat lz:deploy --tags MyOApp
```

Select all the chains you want to deploy the OApp to.

## Enable Messaging

After deploying the OApp on the respective chains, you enable messaging by running the [wiring](https://docs.layerzero.network/v2/concepts/glossary#wire--wiring) task.

Run the wiring task:

```
npx hardhat lz:oapp:wire --oapp-config layerzero.config.ts
```

Submit all the transactions to complete wiring. After all transactions confirm, your OApps are wired and can send messages to each other.

## Sending Messages

With your OApps wired, you can now send messages cross-chain.

Send a message from **Ethereum Sepolia** to **Arbitrum Sepolia**:

```
npx hardhat lz:oapp:send --dst-eid 40231 --string 'Hello from Ethereum!' --network ethereum-testnet
```

Send a message from **Arbitrum Sepolia** to **Optimism Sepolia**:

```
npx hardhat lz:oapp:send --dst-eid 40161 --string 'Hello from Arbitrum!' --network arbitrum-testnet
```

> :information_source: `40161` and `40231` are the Endpoint IDs of Optimism Sepolia and Arbitrum Sepolia respectively. The source network is determined by the `--network` flag, not a separate `--src-eid` parameter. View the list of chains and their Endpoint IDs on the [Deployed Endpoints](https://docs.layerzero.network/v2/deployments/deployed-contracts) page.

Upon a successful send, the script will provide you with the link to the message on LayerZero Scan.

Once the message is delivered, you will be able to click on the destination transaction hash to verify that the message was received.

Congratulations, you have now sent a message cross-chain!

> If you run into any issues, refer to [Troubleshooting](#troubleshooting).
