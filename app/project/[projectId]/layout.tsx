"use client";

import { AuthGate } from "@/src/components/auth/AuthGate";
import type { ReactNode } from "react";

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
