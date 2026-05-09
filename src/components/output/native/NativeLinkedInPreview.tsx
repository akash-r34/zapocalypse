import React from 'react';
import { useTheme } from "@/src/hooks/useTheme";

interface LinkedInPostData {
  hook: string;
  body: string;
  type?: string;
}

interface NativeLinkedInPreviewProps {
  post: LinkedInPostData;
}

export function NativeLinkedInPreview({ post }: NativeLinkedInPreviewProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={`w-full max-w-[550px] mx-auto border rounded-xl overflow-hidden font-sans ${
      isDark ? "bg-[#1b1f23] text-[#ffffff] border-[#38434f]" : "bg-white text-[#191919] border-[#e0dfdc]"
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex gap-3 mb-3">
          <div className={`w-12 h-12 rounded-sm shrink-0 ${isDark ? "bg-[#38434f]" : "bg-yellow-400"}`}></div>
          <div className="flex-1 min-w-0 flex justify-between">
            <div>
              <div className="font-bold text-[15px] hover:underline cursor-pointer hover:text-blue-600 transition-colors">Author Name</div>
              <div className={`text-[12px] truncate ${isDark ? "text-[#8c959f]" : "text-[#666666]"}`}>Author Headline or Title</div>
              <div className={`text-[12px] flex items-center gap-1 ${isDark ? "text-[#8c959f]" : "text-[#666666]"}`}>
                <span>1h •</span>
                <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current" aria-hidden="true"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 13a6 6 0 110-12A6 6 0 018 14zm3.9-9.5L8.5 7v4h-1V6.6l3.6-2.8.8.7z"></path></svg>
              </div>
            </div>
            <div className={`cursor-pointer w-8 h-8 flex items-center justify-center rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-black/5"}`}>
              <svg viewBox="0 0 24 24" className={`w-6 h-6 fill-current ${isDark ? "text-[#8c959f]" : "text-[#666666]"}`}><path d="M14 12a2 2 0 1 1-2-2 2 2 0 0 1 2 2zM4 10a2 2 0 1 0 2 2 2 2 0 0 0-2-2zm16 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2z"></path></svg>
            </div>
          </div>
        </div>
        
        {/* Body */}
        <div className="text-[14px] leading-[1.4] whitespace-pre-wrap break-words">
          <p className="mb-4">{post.hook}</p>
          <p className="mb-4">{post.body}</p>
          {/* <p>{post.cta}</p> */} {/* Removed as per instruction */}
        </div>

        {/* Post Image Mock */}
        <div className={`w-full h-[200px] flex items-center justify-center mb-3 mt-3 border ${
          isDark ? "bg-[#22272b] border-[#38434f]" : "bg-[#f3f2ef] border-[#e0dfdc]"
        }`}>
          <span className={`text-sm ${isDark ? "text-[#8c959f]" : "text-[#666666]"}`}>[Image Placeholder]</span>
        </div>

        {/* Social Proof */}
        <div className={`flex justify-between items-center text-[12px] py-1.5 border-b ${
          isDark ? "text-[#8c959f] border-[#38434f]" : "text-[#666666] border-[#e0dfdc]"
        }`}>
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <div className={`w-4 h-4 rounded-full bg-blue-500 border-2 flex items-center justify-center relative z-30 ${isDark ? "border-[#1b1f23]" : "border-white"}`}>
                <svg viewBox="0 0 16 16" className="w-[10px] h-[10px] fill-white" aria-hidden="true"><path d="M11 5H8.38l.69-2.22A1.4 1.4 0 007.72 1h-.25A1.36 1.36 0 006.1 2.11L4 7v6h7a1.44 1.44 0 001.4-1.12l1-4.75a1.53 1.53 0 00-.06-1A1.49 1.49 0 0012 5zm-9 2H0v6h2z"></path></svg>
              </div>
              <div className={`w-4 h-4 rounded-full bg-red-500 border-2 flex items-center justify-center relative z-20 ${isDark ? "border-[#1b1f23]" : "border-white"}`}>
                <svg viewBox="0 0 16 16" className="w-[10px] h-[10px] fill-white" aria-hidden="true"><path d="M11.66 2C10.15 2 9.07 3.2 8.12 4.3 7 3.2 6 2 4.34 2 2.37 2 1 3.51 1 5.48c0 3.29 4.88 7 7 8 2.22-1 7-4.66 7-8C15 3.51 13.63 2 11.66 2z"></path></svg>
              </div>
              <div className={`w-4 h-4 rounded-full bg-yellow-500 border-2 flex items-center justify-center relative z-10 ${isDark ? "border-[#1b1f23]" : "border-white"}`}>
                <svg viewBox="0 0 16 16" className="w-[10px] h-[10px] fill-white" aria-hidden="true"><path d="M8 1a4 4 0 00-4 4c0 1.25.68 2.34 1.63 2.94L7 9.5V11h2V9.5l1.37-1.56A3.98 3.98 0 0012 5a4 4 0 00-4-4zm1.5 11h-3v1h3v-1zm1 2h-5v1h5v-1z"></path></svg>
              </div>
            </div>
            <span>139K <span className="mx-0.5">•</span> 12K <span className="hidden sm:inline">comments</span> <span className="mx-0.5">•</span> 6K <span className="hidden sm:inline">reposts</span></span>
          </div>
          <span>1h</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className={`flex justify-around items-center px-1 py-1 ${isDark ? "border-[#38434f]" : "border-[#e0dfdc]"} text-[12px] sm:text-[14px] font-semibold ${isDark ? "text-[#e8e8e8]" : "text-[#666666]"}`}>
        <button className={`flex items-center justify-center flex-1 gap-1 sm:gap-1.5 py-2 sm:py-3 rounded-md transition-colors ${
          isDark ? "hover:bg-white/10" : "hover:bg-black/5"
        }`}>
          <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current" aria-hidden="true"><path d="M19.46 11l-3.91-3.91a7 7 0 01-1.69-2.74l-.49-1.47A2.76 2.76 0 0010.76 1 2.75 2.75 0 008 3.74v1.12a9.19 9.19 0 00.46 2.89 2.08 2.08 0 01-1.12 2.5l-2.61 1A2.5 2.5 0 003 13.56v5.88A2.5 2.5 0 005.5 22h11.23a4 4 0 003.88-3.11l1.52-6.57A3.24 3.24 0 0019.46 11zM11 20H5.5a.5.5 0 01-.5-.5v-5.88a.5.5 0 01.34-.48l2.61-1a4.08 4.08 0 002.21-4.91 7.21 7.21 0 01-.46-2.27V3.74A.75.75 0 0110.45 3 a.75.75 0 01.71.55l.49 1.47a9 9 0 002.17 3.52L17.2 12A1.24 1.24 0 0117.56 13l-1.52 6.57a2 2 0 01-1.93 1.55L11 20H11z"></path></svg>
          Like
        </button>
        <button className={`flex items-center justify-center flex-1 gap-1 sm:gap-1.5 py-2 sm:py-3 rounded-md transition-colors ${
          isDark ? "hover:bg-white/10" : "hover:bg-black/5"
        }`}>
          <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-current" aria-hidden="true"><path d="M7 9h10v1H7zm0 4h7v-1H7zm16-2a6.78 6.78 0 01-2.84 5.61L12 22v-4H8A7 7 0 018 4h8a7 7 0 017 7zm-2 0a5 5 0 00-5-5H8a5 5 0 000 10h6v2.28L19 15a4.79 4.79 0 002-4z"></path></svg>
          Comment
        </button>
        <button className={`flex items-center justify-center flex-1 gap-1.5 py-3 rounded-md transition-colors ${
          isDark ? "hover:bg-white/10" : "hover:bg-black/5"
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m17 2 4 4-4 4"/>
            <path d="M3 11v-1a4 4 0 0 1 4-4h14"/>
            <path d="m7 22-4-4 4-4"/>
            <path d="M21 13v1a4 4 0 0 1-4 4H3"/>
          </svg>
          <span className="mt-0.5">Repost</span>
        </button>
        <button className={`flex items-center justify-center flex-1 gap-1.5 py-3 rounded-md transition-colors ${
          isDark ? "hover:bg-white/10" : "hover:bg-black/5"
        }`}>
          <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] fill-current" aria-hidden="true"><path d="M21 12.31l-7.36-5.83v3.74S2 10.91 2 21.28c2.9-5.11 7-5.11 11.64-4.8v3.66L21 12.31zM15 15.68V18l5.24-4.14-5.24-4.15v2.32c-4 .16-7.39.29-9.59 4 .3-.11.63-.22 1-.32a18.33 18.33 0 018.59-.03z"></path></svg>
          <span className="mt-0.5">Share</span>
        </button>
      </div>
    </div>
  )
}
