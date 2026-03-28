# 💳 TRON_POS — Web3 Point of Sale with NFT Receipts

A modern **Point of Sale (POS) system powered by TRON**, where every payment generates a **verifiable NFT receipt** stored on IPFS and recorded on-chain.

---

## 🚀 Overview

TRON_POS bridges traditional payments with Web3 by turning transactions into **digital, on-chain receipts**.

Users can:

* Pay using **TRX**
* Receive an **NFT receipt instantly**
* View their receipt via **IPFS + blockchain explorer**

---

## SMART CONTRACT ReceiptNFT.sol

In TRONBOX_SMART_CONTRACT/contracts/ReceiptNFT.sol

There is a tronbox that is used to deploy the smart contract, 

ReceiptNFT.sol was compiled and deloyed using migrations/1_deploy_receipt_nft.js

The smart contract was deployed for TRON_POS to mint NFT receipt.

---

## ✨ Features

* 💸 TRON (TRX) payment via TronLink
* 🧾 Automatic invoice generation
* 🖼 Dynamic receipt image (Sharp + SVG)
* 📦 IPFS storage via Pinata
* 🔗 NFT minting on TRON (Nile testnet)
* 🧠 MongoDB invoice tracking
* 📱 Mobile-friendly checkout UI
* 🔍 Explorer + IPFS verification

---

## 🧠 System Flow

```text
Customer → Pay TRX (TronLink)
         ↓
Backend verifies transaction
         ↓
Generate receipt image (SVG → PNG)
         ↓
Upload image to IPFS (Pinata)
         ↓
Create metadata JSON
         ↓
Mint NFT on TRON smart contract
         ↓
Save invoice + NFT data (MongoDB)
         ↓
Frontend displays:
  - Payment TX
  - NFT TX
  - IPFS image
```

---

## 🛠 Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* TronLink Wallet

### Backend

* Next.js API Routes
* Node.js runtime

### Blockchain

* TRON (Nile Testnet)
* Smart Contract (NFT mint)

### Storage

* MongoDB
* IPFS (Pinata)

### Image Generation

* Sharp (SVG → PNG)

---

## 📂 Project Structure

```text
/app
  /api
    /invoices
    /nft/mint
/components
/lib
/public/fonts
```

---

## ⚙️ Environment Variables

Create `.env.local`:

```env
TRON_FULL_HOST=https://nile.trongrid.io
TRON_PRIVATE_KEY=YOUR_PRIVATE_KEY
TRON_NFT_CONTRACT=YOUR_CONTRACT_ADDRESS

PINATA_JWT=YOUR_PINATA_JWT
PINATA_GATEWAY=https://your-gateway.mypinata.cloud/ipfs

MONGO_URI=your_mongodb_uri
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Run Locally

```bash
npm install
npm run dev
```

Open:

```
http://localhost:3000
```

---

## 🧾 NFT Receipt Example

```json
{
  "name": "Receipt #482193",
  "description": "Payment of 10 TRX",
  "image": "https://gateway/ipfs/...",
  "attributes": [
    { "trait_type": "Amount", "value": "10" },
    { "trait_type": "Agent_Verifiable", "value": "true" }
  ]
}
```

---

## 🔐 Smart Contract

```solidity
function mint(address to, uint256 tokenId, string memory uri) public;
```

* Mints NFT receipt
* Stores IPFS metadata URI

---

## 🧨 Challenges Solved

* ❌ Native dependency issues (`canvas`)
* ✅ Migrated to `sharp` for deployment stability
* ❌ Font rendering differences (local vs Vercel)
* ✅ Fixed with SVG + consistent font strategy
* ❌ Async blockchain confirmations
* ✅ Implemented polling + UI states

---

## 💡 Why TRON_POS?

* Real-world POS system using Web3
* Combines payments + NFTs
* Fully verifiable receipts
* Simple UX for non-crypto users

---

## 🚀 Future Improvements

* TRC20 (USDT) payments
* QR code checkout
* Merchant dashboard
* Multi-chain support
* Wallet-less onboarding

---

## 👨‍💻 Author

Han Lee
Georgia Tech OMSCS
Hackathon Builder 🚀

---

## 📜 License

MIT
