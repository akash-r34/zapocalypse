import { createHash, generateKeyPairSync, sign, createPrivateKey, createPublicKey } from "crypto";
import type { C2PAManifest } from "@/src/lib/ai/schemas/c2pa-manifest";
import { readSigningKey, writeSigningKey } from "@/src/lib/firestore/helpers";
import { pipelineLogger } from "./logger";

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

interface SigningKeyPair {
  privateKeyPem: string;
  publicKeyPem: string;
  thumbprint: string;
}

let cachedKeyPair: SigningKeyPair | null = null;

export async function getOrCreateSigningKey(): Promise<SigningKeyPair> {
  if (cachedKeyPair) return cachedKeyPair;

  const existing = await readSigningKey();
  if (existing) {
    cachedKeyPair = existing;
    return existing;
  }

  // Generate ECDSA P-256 keypair — fast (<50ms), no native deps
  const { privateKey, publicKey } = generateKeyPairSync("ec", {
    namedCurve: "P-256",
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });

  // Thumbprint = SHA-256 of DER-encoded public key
  const publicKeyObj = createPublicKey(publicKey as string);
  const derBuffer = publicKeyObj.export({ type: "spki", format: "der" });
  const thumbprint = createHash("sha256").update(derBuffer).digest("hex");

  const keyPair: SigningKeyPair = {
    privateKeyPem: privateKey as string,
    publicKeyPem: publicKey as string,
    thumbprint,
  };

  await writeSigningKey(keyPair);
  pipelineLogger.info({ projectId: "system", message: "C2PA signing key generated and persisted to Firestore" });

  cachedKeyPair = keyPair;
  return keyPair;
}

function canonicalize(obj: Record<string, unknown>): string {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = obj[key];
  }
  return JSON.stringify(sorted);
}

function signManifestPayload(payload: string, privateKeyPem: string): string {
  const privateKey = createPrivateKey(privateKeyPem);
  const signature = sign("sha256", Buffer.from(payload, "utf8"), privateKey);
  // base64url encoding
  return signature.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

type ManifestPayload = Omit<C2PAManifest, "signature" | "certificate_thumbprint" | "signing_status" | "public_key_pem" | "manifest_uri">;

export async function createSignedManifest(
  platform: string,
  outputData: unknown
): Promise<C2PAManifest> {
  const json = JSON.stringify(outputData);
  const contentHash = `sha256:${createHash("sha256").update(json).digest("hex")}`;

  const baseManifest: ManifestPayload = {
    claim_generator: "Zapocalypse/3.0",
    tool_used: {
      name: "Google Gemini",
      version: "API",
      model: GEMINI_MODEL,
    },
    creator_identity: {
      type: "anonymous_app_user",
    },
    content_credentials: {
      creation_timestamp: new Date().toISOString(),
      content_hash: contentHash,
      do_not_train: true,
      ai_generated: true,
    },
    assertions: [
      { label: "c2pa.ai.training", data: { use: "notAllowed" } },
      { label: "c2pa.platform", data: { platform } },
    ],
  };

  try {
    const keyPair = await getOrCreateSigningKey();
    const payload = canonicalize(baseManifest as Record<string, unknown>);
    const signature = signManifestPayload(payload, keyPair.privateKeyPem);

    return {
      ...baseManifest,
      signing_status: "signed",
      signature,
      certificate_thumbprint: keyPair.thumbprint,
      public_key_pem: keyPair.publicKeyPem,
    };
  } catch (err) {
    pipelineLogger.warn({
      projectId: "system",
      message: `C2PA signing failed for ${platform} — falling back to metadata_only: ${err instanceof Error ? err.message : String(err)}`,
    });
    return {
      ...baseManifest,
      claim_generator: "Zapocalypse/3.0",
      signing_status: "metadata_only",
      signature: null,
      certificate_thumbprint: null,
    };
  }
}
