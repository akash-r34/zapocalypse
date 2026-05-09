import React from 'react';
import { useTheme } from "@/src/hooks/useTheme";

interface DiscordMessageData {
  hook: string;
  body: string;
  embed_title?: string;
}

interface NativeDiscordPreviewProps {
  message: DiscordMessageData;
  context_line: string;
}

export function NativeDiscordPreview({ message, context_line }: NativeDiscordPreviewProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={`max-w-[800px] mx-auto rounded-lg overflow-hidden transition-colors border-y sm:border ${
      isDark ? "bg-[#313338] text-[#dbdee1] border-transparent" : "bg-white text-[#313338] border-[#e3e5e8]"
    }`}>
      {/* Messages */}
      <div className={`flex gap-4 px-3 sm:px-4 py-1 transition-colors mt-2 ${
        isDark ? "hover:bg-[#2e3035]" : "hover:bg-[#f2f3f5]"
      }`}>
        <div className="w-10 h-10 rounded-full bg-indigo-500 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`font-medium text-[16px] hover:underline cursor-pointer ${isDark ? "text-white" : "text-[#060607]"}`}>Discord User</span>
            <span className={`text-[12px] ${isDark ? "text-[#949ba4]" : "text-[#5c5e66]"}`}>Today at 12:00 PM</span>
          </div>
          <div className="text-[15px] leading-[1.375] whitespace-pre-wrap break-words">
            <span className="font-bold">{message.hook}</span>
            <br /><br />
            {message.body}
            <br /><br />
            <span className="italic opacity-80">{context_line}</span>
          </div>
          {message.embed_title && (
            <div className={`mt-2 text-[13px] border-l-4 border-[#202225] p-3 rounded-r-md max-w-[500px] ${
              isDark ? "bg-[#2b2d31]" : "bg-[#f2f3f5]"
            }`}>
              <div className={`font-semibold mb-1 ${isDark ? "text-white" : "text-[#060607]"}`}>{message.embed_title}</div>
              <div className={isDark ? "text-[#dbdee1]" : "text-[#5c5e66]"}>Embed content preview would appear here.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
