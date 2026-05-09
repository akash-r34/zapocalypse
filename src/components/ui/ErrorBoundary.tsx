"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="rounded-2xl p-6 my-4 glass border border-[var(--glass-danger)]/20">
            <p className="text-sm font-semibold mb-1 text-[var(--glass-danger)]">
              Something went wrong
            </p>
            <p className="text-xs text-[var(--glass-text-secondary)]">
              {this.state.message}
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
