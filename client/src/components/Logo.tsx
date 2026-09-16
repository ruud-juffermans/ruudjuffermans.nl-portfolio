"use client";

import { useId } from "react";
import styles from "./Logo.module.css";

// The rose mark — the hero's circle pattern frozen in its expanded state.
// Same math as HeroCircles: 6 circles at 30deg + 60deg*i, amplitude 110,
// scale 3, each gradient rotated by (17deg - angle). Gradient ids are
// namespaced with useId so multiple instances (header + drawer) don't clash.
const R = 150;
const GRAD_R = 335.41;
const PETALS = [
  { cx: 95.26, cy: -55, rot: -13 },
  { cx: 0, cy: -110, rot: -73 },
  { cx: -95.26, cy: -55, rot: -133 },
  { cx: -95.26, cy: 55, rot: -193 },
  { cx: 0, cy: 110, rot: -253 },
  { cx: 95.26, cy: 55, rot: -313 },
];

export default function Logo({ size = 26 }: { size?: number }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="-260 -260 520 520"
      aria-hidden
      focusable="false"
      style={{ display: "block", flexShrink: 0, isolation: "isolate" }}
    >
      <defs>
        {PETALS.map((p, i) => (
          <radialGradient
            key={i}
            id={`${id}-p${i}`}
            gradientUnits="userSpaceOnUse"
            cx={p.cx}
            cy={p.cy - R}
            r={GRAD_R}
            gradientTransform={`rotate(${p.rot} ${p.cx} ${p.cy})`}
          >
            <stop offset="0" className={styles.stopA} />
            <stop offset="0.5" className={styles.stopB} />
            <stop offset="1" className={styles.stopC} />
          </radialGradient>
        ))}
      </defs>
      {PETALS.map((p, i) => (
        <circle
          key={i}
          className={styles.petal}
          cx={p.cx}
          cy={p.cy}
          r={R}
          fill={`url(#${id}-p${i})`}
        />
      ))}
    </svg>
  );
}
