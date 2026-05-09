import { z } from "zod";

export const C2PAManifestSchema = z.object({
  claim_generator: z.enum(["Zapocalypse/2.0", "Zapocalypse/3.0"]),
  tool_used: z.object({
    name: z.string(),
    version: z.string(),
    model: z.string(),
  }),
  creator_identity: z.object({
    type: z.literal("anonymous_app_user"),
  }),
  content_credentials: z.object({
    creation_timestamp: z.string(),
    content_hash: z.string(),
    do_not_train: z.literal(true),
    ai_generated: z.literal(true),
  }),
  assertions: z.array(
    z.object({
      label: z.string(),
      data: z.record(z.string(), z.unknown()),
    })
  ),
  // Phase 5 — cryptographic signing fields (absent on v2.0 manifests)
  signing_status: z.enum(["signed", "metadata_only"]).optional(),
  signature: z.string().nullable().optional(),
  certificate_thumbprint: z.string().nullable().optional(),
  public_key_pem: z.string().optional(),
  manifest_uri: z.string().optional(),
});

export type C2PAManifest = z.infer<typeof C2PAManifestSchema>;

export type SignedC2PAManifest = C2PAManifest & {
  signing_status: "signed";
  signature: string;
  certificate_thumbprint: string;
  public_key_pem: string;
};
