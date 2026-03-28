import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { TronWeb } from "tronweb";
import sharp from "sharp";

export const runtime = "nodejs";

const contractAbi = [
  {
    inputs: [
      { name: "to", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "uri", type: "string" },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, amount = "0", name = "Customer", description = "TRON Payment" } = body;
    const tokenId = body.tokenId || Date.now().toString();

    const pinataJwt = process.env.PINATA_JWT;
    const gateway = process.env.PINATA_GATEWAY?.replace(/\/+$/, "");

    const svgReceipt = `
    <svg width="600" height="800" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="800" fill="white"/>
      <rect width="600" height="120" fill="#FF0013"/>
      <text x="300" y="75" font-family="sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle">RECEIPT PAY</text>
      
      <text x="50" y="200" font-family="monospace" font-size="20" fill="black">ID: ${tokenId.slice(-12).toUpperCase()}</text>
      <text x="50" y="240" font-family="monospace" font-size="20" fill="black">DATE: ${new Date().toLocaleDateString()}</text>
      <text x="50" y="280" font-family="monospace" font-size="20" fill="black">HOLDER: ${to.slice(0, 10)}...</text>
      
      <line x1="50" y1="320" x2="550" y2="320" stroke="black" stroke-width="2"/>
      
      <text x="300" y="500" font-family="sans-serif" font-size="100" font-weight="bold" fill="black" text-anchor="middle">${amount} TRX</text>
      
      <text x="300" y="750" font-family="sans-serif" font-size="16" fill="#666666" text-anchor="middle" font-style="italic">Verified on TRON Nile Testnet</text>
    </svg>
    `;

    const imageBuffer = await sharp(Buffer.from(svgReceipt)).png().toBuffer();

    const uploadForm = new FormData();
    uploadForm.append("file", imageBuffer, {
      filename: `receipt.png`,
      contentType: "image/png",
    });

    const pinataFileRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      uploadForm,
      {
        headers: {
          ...uploadForm.getHeaders(),
          Authorization: `Bearer ${pinataJwt}`,
        },
      }
    );

    const imageUrl = `${gateway}/${pinataFileRes.data.IpfsHash}`;

    const metadata = {
      name: `Receipt #${tokenId.slice(-6)}`,
      description: `Payment of ${amount} TRX by ${name}`,
      image: imageUrl,
      attributes: [
        { trait_type: "Amount", value: amount },
        { trait_type: "Agent_Verifiable", value: "true" }
      ]
    };

    const pinataJsonRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: { Authorization: `Bearer ${pinataJwt}` },
      }
    );

    const metadataUri = `${gateway}/${pinataJsonRes.data.IpfsHash}`;

    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: process.env.TRON_PRIVATE_KEY,
    });

    const contract = await tronWeb.contract(contractAbi, process.env.TRON_NFT_CONTRACT);
    const txid = await contract.mint(to, tokenId, metadataUri).send();

    const transactionId = typeof txid === "string" ? txid : txid.txID;
    const explorerUrl = `https://nile.tronscan.org/#/transaction/${transactionId}`;

    return NextResponse.json({
      ok: true,
      txid: transactionId,
      explorer: explorerUrl,
      imageUrl,
      metadataUri
    });

  } catch (error: any) {
    console.error("MINT ERROR:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}