import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { TronWeb } from "tronweb";
import sharp from "sharp";
import fs from "fs";
import path from "path";

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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const to = body?.to as string | undefined;
    const amount = String(body?.amount ?? "0");
    const customerName = String(body?.name ?? "Customer");
    const description = String(body?.description ?? "TRON Payment");
    const tokenId = String(body?.tokenId ?? Date.now());

    if (!to) {
      return NextResponse.json(
        { ok: false, error: "Recipient address 'to' is required" },
        { status: 400 }
      );
    }

    const pinataJwt = getRequiredEnv("PINATA_JWT");
    const pinataGateway = getRequiredEnv("PINATA_GATEWAY").replace(/\/+$/, "");
    const tronPrivateKey = getRequiredEnv("TRON_PRIVATE_KEY");
    const tronContractAddress = getRequiredEnv("TRON_NFT_CONTRACT");

    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io",
      privateKey: tronPrivateKey,
    });

    if (!tronWeb.isAddress(to)) {
      return NextResponse.json(
        { ok: false, error: "Invalid TRON recipient address" },
        { status: 400 }
      );
    }

    if (!tronWeb.isAddress(tronContractAddress)) {
      return NextResponse.json(
        { ok: false, error: "Invalid TRON_NFT_CONTRACT address" },
        { status: 500 }
      );
    }

    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "Inter-VariableFont_opsz,wght.ttf"
    );

    const fontBase64 = fs.readFileSync(fontPath).toString("base64");

    const safeAmount = escapeXml(amount);
    const safeCustomerName = escapeXml(customerName);
    const safeDescription = escapeXml(description);
    const safeTokenShort = escapeXml(tokenId.slice(-12).toUpperCase());
    const safeDate = escapeXml(new Date().toLocaleDateString("en-US"));
    const safeHolder = escapeXml(`${to.slice(0, 10)}...`);

    const svgReceipt = `
      <svg width="600" height="800" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            @font-face {
              font-family: 'InterEmbedded';
              src: url(data:font/ttf;base64,${fontBase64}) format('truetype');
              font-weight: 100 900;
              font-style: normal;
            }

            .title {
              font-family: 'InterEmbedded', sans-serif;
              font-size: 40px;
              font-weight: 800;
              fill: white;
            }

            .label {
              font-family: 'InterEmbedded', sans-serif;
              font-size: 16px;
              font-weight: 700;
              fill: #666666;
              letter-spacing: 1px;
            }

            .body {
              font-family: 'InterEmbedded', sans-serif;
              font-size: 22px;
              font-weight: 500;
              fill: #111111;
            }

            .amount {
              font-family: 'InterEmbedded', sans-serif;
              font-size: 84px;
              font-weight: 800;
              fill: #111111;
            }

            .footer {
              font-family: 'InterEmbedded', sans-serif;
              font-size: 16px;
              font-weight: 500;
              fill: #666666;
            }
          </style>
        </defs>

        <rect width="600" height="800" fill="white"/>
        <rect width="600" height="120" fill="#FF0013"/>

        <text x="300" y="76" class="title" text-anchor="middle">RECEIPT PAY</text>

        <text x="50" y="185" class="label">RECEIPT ID</text>
        <text x="50" y="215" class="body">${safeTokenShort}</text>

        <text x="50" y="260" class="label">DATE</text>
        <text x="50" y="290" class="body">${safeDate}</text>

        <text x="50" y="335" class="label">HOLDER</text>
        <text x="50" y="365" class="body">${safeHolder}</text>

        <text x="50" y="410" class="label">CUSTOMER</text>
        <text x="50" y="440" class="body">${safeCustomerName}</text>

        <line x1="50" y1="490" x2="550" y2="490" stroke="#111111" stroke-width="2"/>

        <text x="300" y="610" class="amount" text-anchor="middle">${safeAmount} TRX</text>

        <text x="300" y="690" class="label" text-anchor="middle">PAYMENT MEMO</text>
        <text x="300" y="720" class="footer" text-anchor="middle">${safeDescription}</text>

        <text x="300" y="765" class="footer" text-anchor="middle">Verified on TRON Nile Testnet</text>
      </svg>
    `;

    const imageBuffer = await sharp(Buffer.from(svgReceipt))
      .png()
      .toBuffer();

    const uploadForm = new FormData();
    uploadForm.append("file", imageBuffer, {
      filename: "receipt.png",
      contentType: "image/png",
    });

    const pinataFileRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      uploadForm,
      {
        maxBodyLength: Infinity,
        headers: {
          ...uploadForm.getHeaders(),
          Authorization: `Bearer ${pinataJwt}`,
        },
      }
    );

    const imageCID = pinataFileRes.data.IpfsHash;
    const imageUrl = `${pinataGateway}/${imageCID}`;

    const metadata = {
      name: `Receipt #${tokenId.slice(-6)}`,
      description: `Payment of ${amount} TRX by ${customerName}`,
      image: imageUrl,
      external_url: imageUrl,
      attributes: [
        { trait_type: "Amount", value: amount },
        { trait_type: "Customer", value: customerName },
        { trait_type: "Agent_Verifiable", value: "true" }
      ],
      properties: {
        files: [
          {
            uri: imageUrl,
            type: "image/png",
          },
        ],
        category: "image",
      },
    };

    const pinataJsonRes = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinataJwt}`,
        },
      }
    );

    const metadataCID = pinataJsonRes.data.IpfsHash;
    const metadataUri = `${pinataGateway}/${metadataCID}`;

    const contract = await tronWeb.contract(contractAbi, tronContractAddress);

    const txResult = await contract.mint(to, tokenId, metadataUri).send({
      feeLimit: 200_000_000,
      shouldPollResponse: true,
      keepTxID: true,
    });

    let transactionId: string | null = null;

    if (typeof txResult === "string") {
      transactionId = txResult;
    } else if (
      txResult &&
      typeof txResult === "object" &&
      "txID" in txResult &&
      typeof (txResult as { txID?: unknown }).txID === "string"
    ) {
      transactionId = (txResult as { txID: string }).txID;
    } else if (
      txResult &&
      typeof txResult === "object" &&
      "txid" in txResult &&
      typeof (txResult as { txid?: unknown }).txid === "string"
    ) {
      transactionId = (txResult as { txid: string }).txid;
    }

    const explorerUrl = transactionId
      ? `https://nile.tronscan.org/#/transaction/${transactionId}`
      : null;

    return NextResponse.json({
      ok: true,
      txid: transactionId,
      explorer: explorerUrl,
      imageCID,
      imageUrl,
      metadataCID,
      metadataUri,
      tokenId,
    });
  } catch (error: any) {
    console.error("MINT ERROR:", error?.message || error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Mint failed" },
      { status: 500 }
    );
  }
}