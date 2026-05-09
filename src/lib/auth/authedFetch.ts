import { getClientAuth } from "@/src/lib/firebase/client";

export async function authedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const user = getClientAuth().currentUser;
  if (!user) throw new Error("Not signed in");
  const idToken = await user.getIdToken();
  return fetch(input, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      authorization: `Bearer ${idToken}`,
    },
  });
}
