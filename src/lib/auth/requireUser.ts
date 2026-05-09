import { getAdminAuth } from "@/src/lib/firebase/admin";

export class ApiAuthError extends Error {
  constructor(
    readonly status: 401 | 403,
    message: string
  ) {
    super(message);
    this.name = "ApiAuthError";
  }
}

export async function requireAllowedUser(req: Request): Promise<void> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new ApiAuthError(401, "Authentication required");

  let email: string | undefined;
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    email = decoded.email;
  } catch {
    throw new ApiAuthError(401, "Invalid or expired token");
  }

  if (email !== process.env.ALLOWED_USER_EMAIL) {
    throw new ApiAuthError(403, "Not authorized");
  }
}
