"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import styles from "./ExperienceTimeline.module.css";

export interface ExperienceEntry {
  period: string;
  role: string;
  org: string;
  body: string;
}

// The Experience photo with the roles laid over its right half as a
// timeline, on a dark scrim that fades in from the left. As the photo
// scrolls into view a rail draws down the timeline and the roles slide in
// one after another, then the CTA below the photo. Until JS runs, and under
// reduced motion, the roles are simply there. Up to tablet width the photo
// bleeds to the full viewport width and its height follows that width, so
// it scales down with the screen; the overlay's spacing and type scale
// along. Below 900px the roles sit under the photo instead, in the theme's
// own colours.
export default function ExperienceTimeline({
  photo,
  entries,
  cta,
}: {
  photo: { src: string; alt: string; objectPosition?: string };
  entries: ExperienceEntry[];
  cta: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"static" | "pending" | "done">("static");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    setPhase("pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setPhase("done");
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[
        styles.root,
        phase === "pending" ? styles.pending : "",
        phase === "done" ? styles.done : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.stage}>
        {/* Wide 2:1 on desktop with room for the overlay; taller on phones
            so the frame isn't a thin strip (the ratio is a spacer in the
            CSS). The crop sits a little left of centre where Ruud stands,
            clear of the overlay. */}
        <Box
          className={styles.frame}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderTop: "1px solid var(--app-border-soft)",
            borderBottom: "1px solid var(--app-border-soft)",
            backgroundColor: "var(--app-surface-elevated)",
          }}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1360px) min(1376px, calc(100vw - 224px)), (min-width: 1200px) 1136px, 100vw"
            style={{ objectFit: "cover", objectPosition: photo.objectPosition }}
          />
        </Box>

        <div className={styles.timeline}>
          <ol className={styles.list}>
            <span className={styles.rail} aria-hidden="true">
              <span className={styles.railFill} />
            </span>
            {entries.map((item, i) => (
              <li
                key={`${item.org}-${item.period}`}
                className={styles.item}
                style={{ "--i": i } as CSSProperties}
              >
                <span className={styles.dot} aria-hidden="true" />
                <Typography
                  variant="overline"
                  className={styles.period}
                  sx={{ display: "block", mb: 0.75, letterSpacing: "0.14em" }}
                >
                  {item.period}
                </Typography>
                <Typography
                  variant="h4"
                  component="h3"
                  className={styles.role}
                  sx={{ mb: 0.25 }}
                >
                  {item.role}
                </Typography>
                <Typography
                  variant="body2"
                  className={styles.org}
                  sx={{ fontWeight: 500, mb: 1.25 }}
                >
                  {item.org}
                </Typography>
                <Typography variant="body1" className={styles.body}>
                  {item.body}
                </Typography>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div
        className={`${styles.item} ${styles.cta}`}
        style={{ "--i": entries.length } as CSSProperties}
      >
        {cta}
      </div>
    </div>
  );
}
