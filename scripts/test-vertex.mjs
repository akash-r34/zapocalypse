// Quick Vertex AI connectivity test.
// Run: node scripts/test-vertex.mjs
// Confirms: (1) ADC auth works, (2) Vertex endpoint is hit (not generativelanguage API), (3) response is valid.

import { GoogleGenAI } from "@google/genai";

const project = process.env.GOOGLE_CLOUD_PROJECT ?? "your-firebase-project-id";
const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";
const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

console.log("--- Vertex AI connectivity test ---");
console.log(`project  : ${project}`);
console.log(`location : ${location}`);
console.log(`model    : ${model}`);
console.log(`auth     : Application Default Credentials`);
console.log("");

const client = new GoogleGenAI({ vertexai: true, project, location });

// Inspect the base URL the SDK will use — Vertex hits aiplatform.googleapis.com
// not generativelanguage.googleapis.com (API-key mode)
const httpClient = client._apiClient ?? client.apiClient ?? null;
const baseUrl = httpClient?.baseUrl ?? httpClient?._baseUrl ?? "(inspect manually)";
console.log(`SDK base URL : ${baseUrl}`);
console.log("");

try {
  const response = await client.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: "Reply with exactly: VERTEX_OK" }] }],
  });

  const text = response.text;
  const usage = response.usageMetadata;

  console.log(`Response     : ${text?.trim()}`);
  console.log(`Prompt tokens: ${usage?.promptTokenCount}`);
  console.log(`Output tokens: ${usage?.candidatesTokenCount}`);
  console.log("");

  if (text?.includes("VERTEX_OK")) {
    console.log("✓ Vertex AI is working correctly.");
  } else {
    console.log("? Got a response but text was unexpected:", text);
  }
} catch (err) {
  console.error("✗ Call failed:", err.message);
  if (err.message.includes("credentials") || err.message.includes("UNAUTHENTICATED")) {
    console.error("  → ADC not configured. Run: gcloud auth application-default login");
  } else if (err.message.includes("403") || err.message.includes("PERMISSION_DENIED")) {
    console.error("  → IAM issue. Run: gcloud auth application-default set-quota-project your-firebase-project-id");
  } else if (err.message.includes("404")) {
    console.error("  → Model not found in region. Check GEMINI_MODEL and GOOGLE_CLOUD_LOCATION.");
  }
  process.exit(1);
}
