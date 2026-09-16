"use client";

import * as React from "react";
import { Box, type BoxProps } from "@mui/material";

type Variant = "rise" | "fade" | "slide-left" | "slide-right" | "zoom";

type RevealProps = Omit<BoxProps, "ref"> & {
  variant?: Variant;
  delay?: number;
  duration?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
};

const INITIAL: Record<Variant, (d: number) => React.CSSProperties> = {
  rise: (d) => ({ opacity: 0, transform: `translate3d(0, ${d}px, 0)` }),
  fade: () => ({ opacity: 0 }),
  "slide-left": (d) => ({ opacity: 0, transform: `translate3d(-${d}px, 0, 0)` }),
  "slide-right": (d) => ({ opacity: 0, transform: `translate3d(${d}px, 0, 0)` }),
  zoom: () => ({ opacity: 0, transform: "scale(0.94)" }),
};

const VISIBLE: React.CSSProperties = {
  opacity: 1,
  transform: "translate3d(0, 0, 0) scale(1)",
};

/**
 * Reveal — a presentational wrapper that fades / rises its children into view
 * when they intersect the viewport. Uses IntersectionObserver + CSS transitions
 * (no animation library). Respects prefers-reduced-motion.
 */
export default function Reveal({
  variant = "rise",
  delay = 0,
  duration = 700,
  distance = 24,
  threshold = 0.12,
  once = true,
  sx,
  children,
  ...rest
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setReduceMotion(true);
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  const initialStyle = INITIAL[variant](distance);
  const style: React.CSSProperties = reduceMotion
    ? {}
    : {
        ...(visible ? VISIBLE : initialStyle),
        transitionProperty: "opacity, transform",
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: "cubic-bezier(0.2, 0.65, 0.25, 1)",
        transitionDelay: `${delay}ms`,
        willChange: visible ? "auto" : "opacity, transform",
      };

  return (
    <Box ref={ref} sx={sx} style={style} {...rest}>
      {children}
    </Box>
  );
}
