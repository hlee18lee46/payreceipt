import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";
import { TronWeb } from "tronweb";

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

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function serializeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const to = form.get("to") as string | null;
    const tokenId = form.get("tokenId") as string | null;
    const name = (form.get("name") as string | null) || "Uploaded TRON NFT";
    const description =
      (form.get("description") as string | null) || "Minted from uploaded image";
    const file = form.get("image") as File | null;

    if (!to) {
      return NextResponse.json(
        { ok: false, error: "to is required" },
        { status: 400 }
      );
    }

    if (!tokenId) {
      return NextResponse.json(
        { ok: false, error: "tokenId is required" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "image file is required" },
        { status: 400 }
      );
    }

    const fullHost = getRequiredEnv("TRON_FULL_HOST");
    const privateKey = getRequiredEnv("TRON_PRIVATE_KEY");
    const contractAddress = getRequiredEnv("TRON_NFT_CONTRACT");
    const pinataJwt = getRequiredEnv("PINATA_JWT");
    const pinataGateway = getRequiredEnv("PINATA_GATEWAY");

    const tronWeb = new TronWeb({
      fullHost,
      privateKey,
    });

    if (!tronWeb.isAddress(to)) {
      return NextResponse.json(
        { ok: false, error: "Invalid TRON recipient address" },
        { status: 400 }
      );
    }

    if (!tronWeb.isAddress(contractAddress)) {
      return NextResponse.json(
        { ok: false, error: "Invalid TRON contract address in TRON_NFT_CONTRACT" },
        { status: 500 }
      );
    }

    const normalizedTokenId = BigInt(tokenId).toString();
    const normalizedGateway = pinataGateway.replace(/\/+$/, "");

    // 1) Upload image to Pinata
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadForm = new FormData();
    uploadForm.append("file", buffer, {
      filename: file.name || "upload.png",
      contentType: file.type || "application/octet-stream",
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
    const imageUrl = `${normalizedGateway}/${imageCID}`;

    // 2) Build metadata JSON
    const metadata = {
      name,
      description,
      image: imageUrl,
      external_url: imageUrl,
      attributes: [],
      properties: {
        files: [
          {
            uri: imageUrl,
            type: file.type || "image/png",
          },
        ],
        category: "image",
      },
    };

    // 3) Upload metadata JSON to Pinata
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
    const metadataUri = `${normalizedGateway}/${metadataCID}`;


    // 4) Mint on TRON
    const contract = await tronWeb.contract(contractAbi, contractAddress);
    console.log("contract loaded:", contractAddress);

    const txResult = await contract
      .mint(to, normalizedTokenId, metadataUri)
      .send({
        feeLimit: 200_000_000,
        shouldPollResponse: false,
        keepTxID: true,
      });

    let txid: string | null = null;

    if (typeof txResult === "string") {
      txid = txResult;
    } else if (
      Array.isArray(txResult) &&
      txResult.length > 0 &&
      typeof txResult[0] === "string"
    ) {
      txid = txResult[0];
    } else if (
      txResult &&
      typeof txResult === "object" &&
      "txID" in txResult &&
      typeof (txResult as { txID?: unknown }).txID === "string"
    ) {
      txid = (txResult as { txID: string }).txID;
    } else if (
      txResult &&
      typeof txResult === "object" &&
      "txid" in txResult &&
      typeof (txResult as { txid?: unknown }).txid === "string"
    ) {
      txid = (txResult as { txid: string }).txid;
    }

    console.log("mint txid:", txid);

    const explorer = txid
      ? `https://nile.tronscan.org/#/transaction/${txid}`
      : null;

    return NextResponse.json({
      ok: true,
      to,
      tokenId: normalizedTokenId,
      imageCID,
      imageUrl,
      metadataCID,
      metadataUri,
      txid,
      explorer,
      result: txResult,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: serializeError(error),
      },
      { status: 500 }
    );
  }
}