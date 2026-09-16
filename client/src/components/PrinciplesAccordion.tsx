"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { palette, radii } from "@/theme/theme";

// Mobile presentation of the "How I work" cards: an exclusive accordion
// (one item open at a time). The top item opens by itself the first time the
// list scrolls into view, so the section doesn't read as a wall of closed rows.
export default function PrinciplesAccordion({
  items,
}: {
  items: { icon: ReactNode; title: string; description: string }[];
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const autoOpened = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || autoOpened.current) return;
        autoOpened.current = true;
        // Don't fight the user if they already tapped a row open.
        setExpanded((current) => (current === null ? 0 : current));
        observer.disconnect();
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    // One connected block: the container carries the border and radius, the
    // rows share divider lines between them.
    <Box
      ref={rootRef}
      sx={{
        border: "1px solid var(--app-border-soft)",
        borderRadius: `${radii.card}px`,
        overflow: "hidden",
      }}
    >
      {items.map((item, i) => (
        <Accordion
          key={item.title}
          expanded={expanded === i}
          onChange={(_, isExpanded) => {
            autoOpened.current = true;
            setExpanded(isExpanded ? i : null);
          }}
          disableGutters
          elevation={0}
          square
          sx={{
            backgroundColor: "var(--app-surface-elevated)",
            "&:not(:first-of-type)": {
              borderTop: "1px solid var(--app-border-soft)",
            },
            "&::before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: "var(--app-text-muted)" }} />}
            sx={{ px: 2.5, py: 0.75, "& .MuiAccordionSummary-content": { alignItems: "center", gap: 2 } }}
          >
            {/* Same tile as the desktop cards: light red-tinted with the
                brand-red glyph in light mode, navy with pink in dark. */}
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                backgroundColor: "color-mix(in srgb, var(--app-red) 10%, transparent)",
                color: "var(--app-red)",
                flexShrink: 0,
                "[data-mui-color-scheme='dark'] &": {
                  backgroundColor: palette.navy,
                  color: "#a6c8f7",
                },
              }}
            >
              {item.icon}
            </Box>
            {/* Quieter than the desktop cards' h4 — in a compact accordion
                row the big serif heading shouted. */}
            {/* span: MUI already wraps the summary in an <h3>; a nested
                heading element here breaks heading order. */}
            <Typography variant="h5" component="span" sx={{ fontSize: "1.05rem" }}>
              {item.title}
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
            <Typography variant="body2" sx={{ color: "var(--app-text-secondary)" }}>
              {item.description}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
