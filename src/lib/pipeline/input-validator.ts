const MAX_TEXT_LENGTH = 50_000;
const MIN_TEXT_LENGTH = 100;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const URL_FETCH_TIMEOUT_MS = 10_000;
const MAX_URL_RESPONSE_BYTES = 500 * 1024; // 500KB

const ALLOWED_FILE_TYPES = [
  "text/plain",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export class InputValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputValidationError";
  }
}

export async function validateUrl(url: string): Promise<void> {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new InputValidationError("Invalid URL format");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new InputValidationError("URL must use http or https");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), URL_FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new InputValidationError(
        `URL returned ${response.status} — ensure the page is publicly accessible`
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      throw new InputValidationError(
        "URL must point to an HTML page or plain text content"
      );
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_URL_RESPONSE_BYTES) {
      throw new InputValidationError(
        "Page content is too large (max 500KB)"
      );
    }
  } catch (err) {
    if (err instanceof InputValidationError) throw err;
    const error = err as Error;
    if (error.name === "AbortError") {
      throw new InputValidationError("URL took too long to respond (timeout: 10s)");
    }
    throw new InputValidationError(`Could not reach URL: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

export function validateText(text: string): void {
  if (text.length < MIN_TEXT_LENGTH) {
    throw new InputValidationError(
      `Content is too short — minimum ${MIN_TEXT_LENGTH} characters`
    );
  }
  if (text.length > MAX_TEXT_LENGTH) {
    throw new InputValidationError(
      `Content is too long — maximum ${MAX_TEXT_LENGTH.toLocaleString()} characters`
    );
  }
}

export function validateFile(file: { size: number; type: string; name: string }): void {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new InputValidationError(
      `File is too large — maximum 5MB (got ${(file.size / 1024 / 1024).toFixed(1)}MB)`
    );
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new InputValidationError(
      `Unsupported file type: ${file.type}. Allowed: .txt, .pdf, .docx`
    );
  }
}
