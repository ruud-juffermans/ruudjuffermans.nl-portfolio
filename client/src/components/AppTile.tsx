"use client";

import { useId } from "react";

// The maxxing app marks from brand/*.svg, inlined so the header dropdown and
// drawer can render them at any size without extra requests. Gradient ids are
// namespaced with useId so multiple instances on one page don't clash.

export type AppTileName = "fitness" | "habit" | "journal";

const GRADIENTS: Record<AppTileName, [string, string]> = {
  fitness: ["#f34c4c", "#d61f1f"],
  habit: ["#f8763a", "#de4c07"],
  journal: ["#ffa94d", "#e8820e"],
};

function Glyph({ app, gradientId }: { app: AppTileName; gradientId: string }) {
  switch (app) {
    case "fitness":
      return (
        <g stroke="#ffffff" strokeLinecap="round" fill="none">
          <path d="M186,256 H326" strokeWidth="42" />
          <path d="M172,180 V332" strokeWidth="60" />
          <path d="M340,180 V332" strokeWidth="60" />
          <path d="M100,210 V302" strokeWidth="46" />
          <path d="M412,210 V302" strokeWidth="46" />
        </g>
      );
    case "habit":
      return (
        <path
          d="M148,270 L226,348 L364,180"
          stroke="#ffffff"
          strokeWidth="58"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      );
    case "journal":
      return (
        <>
          <path
            fill="#ffffff"
            d="M182,112 h96 l84,84 v172 a32,32 0 0 1 -32,32 h-148 a32,32 0 0 1 -32,-32 v-224 a32,32 0 0 1 32,-32 z"
          />
          <path
            fill={`url(#${gradientId})`}
            opacity="0.45"
            d="M278,112 l84,84 h-56 a28,28 0 0 1 -28,-28 z"
          />
          <g stroke={`url(#${gradientId})`} strokeWidth="26" strokeLinecap="round">
            <path d="M208,270 H306" />
            <path d="M208,330 H282" />
          </g>
        </>
      );
  }
}

export default function AppTile({ app, size = 34 }: { app: AppTileName; size?: number }) {
  const id = useId();
  const g = `${id}-g`;
  const s = `${id}-s`;
  const [from, to] = GRADIENTS[app];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      aria-hidden
      focusable="false"
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={g} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="512" y2="512">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
        <linearGradient id={s} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="512">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.17" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="115" fill={`url(#${g})`} />
      <rect width="512" height="512" rx="115" fill={`url(#${s})`} />
      <Glyph app={app} gradientId={g} />
    </svg>
  );
}
