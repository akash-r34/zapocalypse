"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from "firebase/auth";
import { getClientAuth, googleProvider } from "@/src/lib/firebase/client";
import { ALLOWED_EMAIL } from "./allowed";

export type AuthStatus = "loading" | "signed-out" | "signed-in" | "forbidden";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    return onAuthStateChanged(getClientAuth(), async (u) => {
      if (!u) {
        setUser(null);
        setStatus("signed-out");
        return;
      }
      if (u.email !== ALLOWED_EMAIL) {
        setUser(null);
        setStatus("forbidden");
        await firebaseSignOut(getClientAuth());
        return;
      }
      setUser(u);
      setStatus("signed-in");
    });
  }, []);

  const signIn = async () => {
    await signInWithPopup(getClientAuth(), googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(getClientAuth());
  };

  return (
    <AuthContext.Provider value={{ user, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
