import React from "react";

interface BraidaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

// Brand colors from logo
export const BRAND_COLORS = {
  teal: "#1ABC9C",
  pink: "#E91E63", 
  gold: "#F4B942",
  darkTeal: "#0D4F5F",
  cream: "#F5E6D3",
};

export function BraidaLogo({ size = "md", showText = true, className = "" }: BraidaLogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 40, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
    xl: { icon: 64, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Braid strands interweaving */}
        {/* Teal strand */}
        <path
          d="M22 8 Q18 16 22 24 Q26 32 20 40 Q14 48 22 56"
          stroke={BRAND_COLORS.teal}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Pink/Magenta strand (center) */}
        <path
          d="M32 4 Q40 14 28 24 Q16 34 32 44 Q48 54 32 62"
          stroke={BRAND_COLORS.pink}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Gold strand */}
        <path
          d="M38 10 Q46 18 38 28 Q30 38 42 48 Q54 58 42 62"
          stroke={BRAND_COLORS.gold}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Flowing accent */}
        <path
          d="M32 60 Q44 58 52 62"
          stroke={BRAND_COLORS.pink}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span
          className={`font-serif font-semibold ${text}`}
          style={{
            color: BRAND_COLORS.cream,
            textShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          Braida
        </span>
      )}
    </div>
  );
}

export function BraidaLogoLight({ size = "md", showText = true, className = "" }: BraidaLogoProps) {
  const sizes = {
    sm: { icon: 32, text: "text-lg" },
    md: { icon: 40, text: "text-xl" },
    lg: { icon: 48, text: "text-2xl" },
    xl: { icon: 64, text: "text-3xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Teal strand */}
        <path
          d="M22 8 Q18 16 22 24 Q26 32 20 40 Q14 48 22 56"
          stroke={BRAND_COLORS.teal}
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        {/* Pink/Magenta strand */}
        <path
          d="M32 4 Q40 14 28 24 Q16 34 32 44 Q48 54 32 62"
          stroke={BRAND_COLORS.pink}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        {/* Gold strand */}
        <path
          d="M38 10 Q46 18 38 28 Q30 38 42 48 Q54 58 42 62"
          stroke={BRAND_COLORS.gold}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Flowing accent */}
        <path
          d="M32 60 Q44 58 52 62"
          stroke={BRAND_COLORS.pink}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span
          className={`font-serif font-semibold ${text} bg-gradient-to-r from-[#E91E63] via-[#F4B942] to-[#1ABC9C] bg-clip-text text-transparent`}
        >
          Braida
        </span>
      )}
    </div>
  );
}

export default BraidaLogo;

