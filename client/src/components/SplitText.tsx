"use client";

import * as React from "react";

// Word-by-word slide-up reveal for headings: each word sits in an
// overflow-hidden slot and slides up from below when the heading scrolls
// into view, with a small stagger per word. Scrolling back up past the
// heading resets it so the reveal replays on the next pass down; leaving
// through the top of the viewport does not. Use it inside the heading
// element: <Typography variant="h2"><SplitText text={t("title")} /></Typography>
// — the heading keeps its own typography, SplitText only supplies motion.

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export default function SplitText({
  text,
  stagger = 45,
  duration = 900,
}: {
  text: string;
  stagger?: number;
  duration?: number;
}) {
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  // Server HTML renders the words in place and they only hide once JS is
  // ready to animate them. The heading is usually the LCP element, so
  // shipping it hidden would stall LCP until hydration (~1.5s on slow
  // mobile); this way it paints immediately and the reveal plays on top.
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
        } else if (entry.boundingClientRect.top > 0) {
          setVisible(false);
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const words = text.split(" ");
  return (
    <span ref={ref}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span
            style={{
              display: "inline-block",
              overflow: reduceMotion ? undefined : "hidden",
              verticalAlign: "top",
              // Room for descenders inside the clip, taken back outside it
              // so line spacing is unchanged.
              paddingBottom: "0.12em",
              marginBottom: "-0.12em",
            }}
          >
            <span
              style={
                reduceMotion || !mounted
                  ? undefined
                  : {
                      display: "inline-block",
                      transform: visible ? "translateY(0)" : "translateY(110%)",
                      transition: `transform ${duration}ms ${EASE} ${i * stagger}ms`,
                      willChange: "transform",
                    }
              }
            >
              {word}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );
}
