import React from "react";

export function BackgroundElements() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[var(--glass-bg)] pointer-events-none transition-colors duration-500">
      {/* Decorative gradient orbs for glass refraction */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--orb-1)] blur-[120px] transition-colors duration-500" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[var(--orb-2)] blur-[140px] transition-colors duration-500" />
      <div className="absolute top-[25%] left-[55%] w-[35%] h-[35%] rounded-full bg-[var(--orb-3)] blur-[110px] transition-colors duration-500" />
    </div>
  );
}
