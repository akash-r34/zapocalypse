"use client";

import { useCopyToClipboard } from "@/src/hooks/useCopyToClipboard";
import { CopyButton } from "./CopyButton";
import { NativeSlackPreview } from "./native/NativeSlackPreview";
import { NativeDiscordPreview } from "./native/NativeDiscordPreview";

interface DarkSocialData {
  slack_message: { hook: string; body: string; emoji_prefix: string };
  discord_message: { hook: string; body: string; embed_title?: string };
  shareable_quote: string;
  context_line: string;
}

interface DarkSocialPreviewProps {
  data: DarkSocialData;
  nativePlatform?: "slack" | "discord" | null;
}

export function DarkSocialPreview({ data, nativePlatform }: DarkSocialPreviewProps) {
  const { copy, isCopied } = useCopyToClipboard();

  if (!data?.slack_message || !data?.discord_message) {
    return (
      <div className="rounded-2xl p-8 text-center glass">
        <p className="text-sm text-[var(--glass-text-secondary)]">Dark Social output is incomplete.</p>
      </div>
    );
  }

  const slackText = `${data.slack_message.emoji_prefix} *${data.slack_message.hook}*\n\n${data.slack_message.body}\n\n_${data.context_line}_`;
  const discordText = `**${data.discord_message.hook}**\n\n${data.discord_message.body}\n\n*${data.context_line}*`;
  const quoteText = `"${data.shareable_quote}"\n\n— ${data.context_line}`;

  if (nativePlatform === "slack") {
    return (
      <div className="space-y-6 flex flex-col items-center">
        <NativeSlackPreview message={data.slack_message} context_line={data.context_line} />
        <div className="pt-2">
          <CopyButton copied={isCopied("slack")} onClick={() => copy(slackText, "slack")} label="Copy for Slack" />
        </div>
      </div>
    );
  }

  if (nativePlatform === "discord") {
    return (
      <div className="space-y-6 flex flex-col items-center">
        <NativeDiscordPreview message={data.discord_message} context_line={data.context_line} />
        <div className="pt-2">
          <CopyButton copied={isCopied("discord")} onClick={() => copy(discordText, "discord")} label="Copy for Discord" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Slack */}
      <div className="rounded-xl glass overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--glass-border)] flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--glass-text)]">Slack</span>
          <span className="text-xs text-[var(--glass-text-tertiary)]">paste into any channel</span>
        </div>
        <div className="p-5 space-y-2">
          <p className="text-sm font-medium text-[var(--glass-text)]">
            {data.slack_message.emoji_prefix} {data.slack_message.hook}
          </p>
          <p className="text-sm text-[var(--glass-text-secondary)] whitespace-pre-wrap">
            {data.slack_message.body}
          </p>
          <p className="text-xs italic text-[var(--glass-text-tertiary)]">{data.context_line}</p>
          <div className="pt-2">
            <CopyButton
              copied={isCopied("slack")}
              onClick={() => copy(slackText, "slack")}
              label="Copy for Slack"
            />
          </div>
        </div>
      </div>

      {/* Discord */}
      <div className="rounded-xl glass overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--glass-border)] flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--glass-text)]">Discord</span>
          <span className="text-xs text-[var(--glass-text-tertiary)]">paste into any server</span>
        </div>
        <div className="p-5 space-y-2">
          {data.discord_message.embed_title && (
            <p className="text-xs font-mono text-[var(--glass-text-tertiary)] mb-1">
              embed: {data.discord_message.embed_title}
            </p>
          )}
          <p className="text-sm font-medium text-[var(--glass-text)]">
            {data.discord_message.hook}
          </p>
          <p className="text-sm text-[var(--glass-text-secondary)] whitespace-pre-wrap">
            {data.discord_message.body}
          </p>
          <p className="text-xs italic text-[var(--glass-text-tertiary)]">{data.context_line}</p>
          <div className="pt-2">
            <CopyButton
              copied={isCopied("discord")}
              onClick={() => copy(discordText, "discord")}
              label="Copy for Discord"
            />
          </div>
        </div>
      </div>

      {/* Shareable quote */}
      <div className="rounded-xl glass-elevated p-5 space-y-3">
        <p className="text-xs font-medium text-[var(--glass-text-tertiary)] uppercase tracking-widest">
          Screenshot-worthy quote
        </p>
        <blockquote className="text-base font-medium text-[var(--glass-text)] leading-relaxed border-l-2 border-[var(--glass-accent)] pl-4">
          &ldquo;{data.shareable_quote}&rdquo;
        </blockquote>
        <p className="text-xs text-[var(--glass-text-tertiary)]">— {data.context_line}</p>
        <CopyButton
          copied={isCopied("quote")}
          onClick={() => copy(quoteText, "quote")}
          label="Copy quote"
        />
      </div>
    </div>
  );
}
