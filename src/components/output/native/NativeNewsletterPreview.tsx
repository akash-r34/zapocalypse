import React from "react";
import { useTheme } from "@/src/hooks/useTheme";

interface NewsletterSection {
  heading: string;
  content: string;
}

interface NativeNewsletterPreviewProps {
  subjectLine: string;
  sections: NewsletterSection[];
  cta?: { text: string; context: string };
}

export function NativeNewsletterPreview({ subjectLine, sections, cta }: NativeNewsletterPreviewProps) {
  const { mode } = useTheme();
  const isDark = mode === "dark";

  return (
    <div className={`w-full p-4 sm:p-8 rounded-lg overflow-hidden font-sans ${
      isDark ? "bg-[#121212]" : "bg-[#f6f6f6]"
    }`}>
      <div className={`max-w-[600px] mx-auto border shadow-sm ${
        isDark ? "bg-[#1e1e1e] border-[#333333]" : "bg-white border-[#e5e5e5]"
      }`}>
        {/* Email Header mock */}
        <div className={`border-b p-4 ${
          isDark ? "border-[#333333] bg-[#252525]" : "border-[#e5e5e5] bg-[#fafafa]"
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <div className={`text-xs uppercase font-bold tracking-widest ${isDark ? "text-[#a3a3a3]" : "text-[#888888]"} mb-1`}>
                Your Newsletter Weekly
              </div>
              <div className={`text-xl font-bold font-serif ${isDark ? "text-white" : "text-black"}`}>
                Latest Insights & Updates
              </div>
            </div>
            <div className={`text-sm ${isDark ? "text-[#a3a3a3]" : "text-[#888888]"}`}>Today</div>
          </div>
        </div>
        
        {/* Contents */}
        <div className={`p-4 sm:p-8 ${isDark ? "text-[#e5e5e5]" : "text-[#222222]"}`}>
          {/* Native Subject Line inside email body */}
          <div className="mb-8">
            <h1 className="text-[20px] sm:text-[24px] font-sans font-black leading-tight mb-2 tracking-tight">
              {subjectLine}
            </h1>
            <div className="h-1 w-12 bg-blue-600 rounded"></div>
          </div>

          {sections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h2 className={`text-[18px] sm:text-[20px] font-bold mb-3 font-sans leading-tight ${isDark ? "text-white" : "text-black"}`}>
                {section.heading}
              </h2>
              <div className="whitespace-pre-wrap">{section.content}</div>
            </div>
          ))}

          {cta && (
            <div className={`mt-8 pt-8 border-t text-center ${isDark ? "border-[#333]" : "border-[#eee]"}`}>
              <p className="mb-4 italic opacity-80 font-sans text-[14px]">{cta.context}</p>
              <a href="#" className={`inline-block font-sans font-bold px-6 py-3 rounded-full no-underline hover:opacity-80 transition-opacity ${
                isDark ? "bg-white text-black" : "bg-black text-white"
              }`}>
                {cta.text}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
