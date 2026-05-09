import { NextResponse } from "next/server";
import { initFirebaseAdmin } from "@/src/lib/firebase/admin";
import { runSelectiveRegeneration, type SupportedPlatform } from "@/src/lib/pipeline/regenerate";
import { getRegenerationCount } from "@/src/lib/firestore/helpers";
import { requireAllowedUser, ApiAuthError } from "@/src/lib/auth/requireUser";

const SUPPORTED_PLATFORMS: SupportedPlatform[] = ["twitter", "linkedin", "newsletter", "veo", "dark_social"];
const MAX_REGENS_PER_PLATFORM = 3;

interface RegenerateRequestBody {
  projectId: string;
  platform: SupportedPlatform;
  feedback?: string;   // optional for retry mode
  retry?: boolean;     // true = skip tone refinement, just re-synthesize
}

export async function POST(request: Request) {
  try {
    await requireAllowedUser(request);
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }

  let body: RegenerateRequestBody;

  try {
    body = (await request.json()) as RegenerateRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { projectId, platform, feedback, retry } = body;

  if (!projectId || !platform) {
    return NextResponse.json(
      { error: "projectId and platform are required" },
      { status: 400 }
    );
  }

  if (!retry && !feedback) {
    return NextResponse.json(
      { error: "feedback is required (or pass retry: true to re-synthesize without tone refinement)" },
      { status: 400 }
    );
  }

  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    return NextResponse.json(
      { error: `Invalid platform. Must be one of: ${SUPPORTED_PLATFORMS.join(", ")}` },
      { status: 400 }
    );
  }

  initFirebaseAdmin();

  const regenCount = await getRegenerationCount(projectId, platform);
  if (regenCount >= MAX_REGENS_PER_PLATFORM) {
    return NextResponse.json(
      { error: `Maximum ${MAX_REGENS_PER_PLATFORM} regenerations reached for ${platform}` },
      { status: 429 }
    );
  }

  void runSelectiveRegeneration(projectId, platform, feedback ?? "", !!retry);

  return NextResponse.json({ status: "processing" }, { status: 202 });
}
