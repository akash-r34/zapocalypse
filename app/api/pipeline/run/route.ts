import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { initFirebaseAdmin } from "@/src/lib/firebase/admin";
import { createProject } from "@/src/lib/firestore/helpers";
import { validateUrl, validateText, validateFile, InputValidationError } from "@/src/lib/pipeline/input-validator";
import { runPipeline } from "@/src/lib/pipeline/orchestrator";
import { requireAllowedUser, ApiAuthError } from "@/src/lib/auth/requireUser";

interface RunRequestBody {
  mode: "url" | "text" | "file";
  value: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
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

  let body: RunRequestBody;

  try {
    body = (await request.json()) as RunRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { mode, value, fileName, fileType, fileSize } = body;

  if (!mode || !value) {
    return NextResponse.json({ error: "mode and value are required" }, { status: 400 });
  }

  // Validate input before touching the pipeline
  try {
    if (mode === "url") {
      await validateUrl(value);
    } else if (mode === "text") {
      validateText(value);
    } else if (mode === "file") {
      validateFile({
        size: fileSize ?? 0,
        type: fileType ?? "application/octet-stream",
        name: fileName ?? "upload",
      });
      validateText(value); // also validate extracted text length
    }
  } catch (err) {
    if (err instanceof InputValidationError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    throw err;
  }

  // Initialize Firebase Admin (idempotent)
  initFirebaseAdmin();

  const projectId = randomUUID();

  // Create the Firestore project doc immediately
  await createProject(projectId, mode);

  // Fire-and-forget — do NOT await
  void runPipeline({ projectId, mode, value });

  // Return 202 immediately — client watches Firestore via onSnapshot
  return NextResponse.json({ projectId }, { status: 202 });
}
