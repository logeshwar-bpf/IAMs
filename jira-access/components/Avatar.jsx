"use client";

import React from "react";
import { getInitials } from "../lib/format";

export default function Avatar({ name, bg = "bg-[#5B5BD6]", size = "md" }) {
  const initials = getInitials(name);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs font-bold rounded-lg",
    md: "w-10 h-10 text-xs font-extrabold rounded-xl",
    lg: "w-12 h-12 text-sm font-black rounded-2xl",
  };

  const selectedSizeClass = sizeClasses[size] || sizeClasses.md;

  // Custom inline style fallback if custom background style is passed
  const isClassBg = bg.startsWith("bg-");

  return (
    <div
      className={`${selectedSizeClass} ${isClassBg ? bg : ""} flex items-center justify-center text-white shrink-0 shadow-sm`}
      style={!isClassBg ? { background: bg } : undefined}
    >
      <span>{initials}</span>
    </div>
  );
}
