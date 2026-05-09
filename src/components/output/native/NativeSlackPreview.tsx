import React from 'react';
import { useTheme } from "@/src/hooks/useTheme";

interface SlackMessageData {
  hook: string;
  body: string;
  emoji_prefix: string;
}

interface NativeSlackPreviewProps {
  message: SlackMessageData;
  context_line: string;
}

export function NativeSlackPreview({ message, context_line }: NativeSlackPreviewProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={`w-full rounded-lg overflow-hidden font-sans ${
      isDark ? "bg-[#1A1D21] text-[#D1D2D3]" : "bg-white text-[#1D1C1D]"
    }`}>
      <div className={`flex gap-3 px-3 sm:px-5 py-2 sm:py-3 ${isDark ? "hover:bg-[#222529]" : "hover:bg-[#F8F8F8]"}`}>
        <div className={`w-9 h-9 rounded shrink-0 ${isDark ? "bg-[#222529]" : "bg-[#e8e8e8] border border-black/10"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`font-bold text-[15px] ${isDark ? "text-white" : "text-[#1d1c1d]"}`}>Slack User</span>
            <span className={`text-[12px] ${isDark ? "text-[#ABABAD]" : "text-[#616061]"}`}>12:00 PM</span>
          </div>
          <div className="text-[15px] leading-[1.46666667] whitespace-pre-wrap break-words">
            {message.emoji_prefix} <strong>{message.hook}</strong>
            <br /><br />
            {message.body}
            <br /><br />
            <em>{context_line}</em>
          </div>
        </div>
      </div>
    </div>
  )
}
