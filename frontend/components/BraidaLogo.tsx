import React from "react";

interface BraidaLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "light" | "dark" | "colored";
  className?: string;
}

// Brand colors from logo
export const BRAND_COLORS = {
  teal: "#1ABC9C",
  pink: "#E91E63", 
  gold: "#F4B942",
  darkTeal: "#0D4F5F",
  cream: "#F5E6D3",
  darkBlue: "#1B4B5A",
};

// Unified Braida Logo matching the brand identity
export function BraidaLogo({ size = "md", showText = true, variant = "colored", className = "" }: BraidaLogoProps) {
  const sizes = {
    sm: { icon: 28, text: "text-lg", gap: "gap-1.5" },
    md: { icon: 36, text: "text-xl", gap: "gap-2" },
    lg: { icon: 44, text: "text-2xl", gap: "gap-2" },
    xl: { icon: 56, text: "text-3xl", gap: "gap-3" },
  };

  const { icon, text, gap } = sizes[size];
  
  const textColor = variant === "dark" 
    ? "text-white" 
    : variant === "light" 
    ? "text-gray-900" 
    : "text-[#1ABC9C]"; // Teal for colored variant

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Braid strands forming a flowing pattern */}
        {/* Teal strand (left) */}
        <path
          d="M16 6 C12 12, 14 18, 18 24 C22 30, 14 36, 18 44"
          stroke={BRAND_COLORS.teal}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Pink/Magenta strand (center, prominent) */}
        <path
          d="M24 4 C30 10, 18 16, 24 22 C30 28, 18 34, 24 42"
          stroke={BRAND_COLORS.pink}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Gold strand (right) */}
        <path
          d="M30 8 C36 14, 28 20, 32 26 C36 32, 30 38, 34 44"
          stroke={BRAND_COLORS.gold}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Flowing underline accent */}
        <path
          d="M18 44 Q28 42, 38 46"
          stroke={BRAND_COLORS.pink}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span className={`font-serif italic font-medium ${text} ${textColor}`}>
          Braida
        </span>
      )}
    </div>
  );
}

// Light version for light backgrounds
export function BraidaLogoLight({ size = "md", showText = true, className = "" }: Omit<BraidaLogoProps, "variant">) {
  return <BraidaLogo size={size} showText={showText} variant="colored" className={className} />;
}

// Dark version for dark backgrounds (like footer)
export function BraidaLogoDark({ size = "md", showText = true, className = "" }: Omit<BraidaLogoProps, "variant">) {
  return <BraidaLogo size={size} showText={showText} variant="dark" className={className} />;
}

export default BraidaLogo;
