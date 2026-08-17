"use client";

import React from "react";
import { ShieldCheck, Cpu, Database, Network, KeyRound, Sparkles, Layers, Lock } from "lucide-react";

export default function GlitterSymbol() {
  return (
    <div className="relative w-full h-full min-h-[600px] flex flex-col items-center justify-center p-8 overflow-hidden bg-[#161615] rounded-3xl border border-[#333330]">
      {/* Background Glitter Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0052cc]/20 via-transparent to-[#38bdf8]/15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#0070f3]/15 rounded-full blur-3xl animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-[#38bdf8]/10 rounded-full blur-2xl pointer-events-none animate-float" />

      {/* Glitter Particle Overlay Grid */}
      <div className="absolute inset-0 glitter-stars opacity-80" />

      {/* Main Centeredjira Provisioning Emblem */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Animated Outer Orbit Rings */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center mb-8">
          
          {/* Ring 1 - Outer Rotating Dashed Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#38bdf8]/40 animate-glitter-spin" />
          
          {/* Ring 2 - Opposite Spinning Pulse Ring */}
          <div className="absolute inset-4 rounded-full border border-[#0052cc]/60 animate-pulse-glow" />
          
          {/* Ring 3 - Inner Glowing Solid Accent */}
          <div className="absolute inset-10 rounded-full border border-sky-400/30 bg-[#0052cc]/10 backdrop-blur-md" />

          {/* Floating Orbiting Node Icons */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 p-2.5 rounded-full bg-[#1A1A19] border border-[#38bdf8] text-[#38bdf8] shadow-[0_0_15px_rgba(56,189,248,0.5)]">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 p-2.5 rounded-full bg-[#1A1A19] border border-[#0070f3] text-[#0070f3] shadow-[0_0_15px_rgba(0,112,243,0.5)]">
            <Database className="w-5 h-5" />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 p-2.5 rounded-full bg-[#1A1A19] border border-sky-400 text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 p-2.5 rounded-full bg-[#1A1A19] border border-[#0052cc] text-[#60a5fa] shadow-[0_0_15px_rgba(0,82,204,0.5)]">
            <Network className="w-5 h-5" />
          </div>

          {/* Center Emblem Core */}
          <div className="relative w-36 h-36 rounded-3xl bg-gradient-to-tr from-[#003db3] via-[#0052cc] to-[#38bdf8] p-0.5 shadow-[0_0_50px_rgba(0,112,243,0.6)] animate-float">
            <div className="w-full h-full bg-[#1A1A19]/90 rounded-[22px] flex flex-col items-center justify-center p-4 backdrop-blur-xl border border-white/10">
              {/* Jira stylized Provisioning SVG logo */}
              <div className="relative">
                <ShieldCheck className="w-16 h-16 text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]" />
                <Sparkles className="absolute -top-1 -right-2 w-6 h-6 text-white animate-sparkle" />
              </div>
              <span className="mt-2 text-[10px] font-bold tracking-widest text-sky-300 uppercase">
                PROVISION
              </span>
            </div>
          </div>
        </div>

        {/* Text Header & Specs */}
        <div className="max-w-md space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052cc]/20 border border-[#38bdf8]/30 text-sky-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Single Admin Control System</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            JIRA PROVISIONING
          </h2>

          <p className="text-sm text-gray-400 leading-relaxed">
            Centralized identity management engine for provisioning task projects, managing user access matrices, and real-time security compliance tracking.
          </p>
        </div>

        {/* Feature Badges Grid */}
        <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs text-xs">
          <div className="p-3 rounded-xl bg-[#222220]/80 border border-[#333330] flex items-center gap-2 text-gray-300">
            <Layers className="w-4 h-4 text-[#38bdf8]" />
            <span>Task Projects Matrix</span>
          </div>
          <div className="p-3 rounded-xl bg-[#222220]/80 border border-[#333330] flex items-center gap-2 text-gray-300">
            <Lock className="w-4 h-4 text-[#0070f3]" />
            <span>Single-User Vault</span>
          </div>
        </div>
      </div>
    </div>
  );
}
