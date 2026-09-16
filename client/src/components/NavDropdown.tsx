"use client";

import { Box, ButtonBase } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useCallback, useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { palette } from "@/theme/theme";

export interface NavDropdownItem {
  title: string;
  desc: string;
  /** Internal (typed next-intl Link href) — mutually exclusive with external. */
  href?: ComponentProps<typeof Link>["href"];
  /** External URL — rendered as a plain anchor. */
  external?: string;
  /** Small leading visual (e.g. an app mark). */
  icon?: ReactNode;
}

interface Props {
  label: string;
  active?: boolean;
  items: NavDropdownItem[];
  /** Muted line above the items (e.g. the apps tagline). */
  tagline?: string;
  /** Trailing link at the bottom of the panel (e.g. "View all services"). */
  footer?: { label: string; href: ComponentProps<typeof Link>["href"] };
}

// A hover/click nav dropdown with a soft entrance animation: the panel fades
// in while rising and settling from a slight scale-down, items get a subtle
// hover wash. Hover opens with a grace delay on leave; click toggles; Escape
// and outside clicks close.
export default function NavDropdown({ label, active, items, tagline, footer }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 140);
  }, [cancelClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => cancelClose, [cancelClose]);

  const itemSx = {
    display: "flex",
    alignItems: "flex-start",
    gap: 1.5,
    px: 1.75,
    py: 1.25,
    borderRadius: "12px",
    textDecoration: "none",
    transition: "background-color 0.18s ease",
    "&:hover": { backgroundColor: palette.redMuted },
    "&:hover .nd-title": { color: palette.red },
    "&:hover .nd-arrow": { opacity: 1, transform: "translateX(0)" },
  } as const;

  const itemBody = (item: NavDropdownItem) => (
    <>
      {item.icon && (
        <Box
          aria-hidden
          sx={{
            width: 34,
            height: 34,
            flexShrink: 0,
            mt: 0.25,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            // Letter-box chrome only for plain string icons; app tiles bring
            // their own background.
            ...(typeof item.icon === "string" && {
              borderRadius: "10px",
              backgroundColor: palette.redMuted,
              color: palette.red,
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "0.95rem",
            }),
          }}
        >
          {item.icon}
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box
          className="nd-title"
          sx={{
            fontWeight: 600,
            fontSize: "0.92rem",
            color: palette.gray900,
            transition: "color 0.18s ease",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {item.title}
          <ArrowForwardIcon
            className="nd-arrow"
            sx={{
              fontSize: 14,
              color: palette.red,
              opacity: 0,
              transform: "translateX(-4px)",
              transition: "opacity 0.18s ease, transform 0.18s ease",
            }}
          />
        </Box>
        <Box sx={{ fontSize: "0.8rem", color: "var(--app-text-secondary)", lineHeight: 1.5 }}>
          {item.desc}
        </Box>
      </Box>
    </>
  );

  return (
    <Box
      ref={wrapRef}
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      sx={{ position: "relative" }}
    >
      <ButtonBase
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        disableRipple
        sx={{
          font: "inherit",
          fontWeight: active ? 600 : 500,
          fontSize: "0.92rem",
          color: active || open ? palette.red : "var(--app-text-secondary)",
          px: 2,
          minHeight: 38,
          borderRadius: "8px",
          gap: 0.25,
          transition: "color 0.2s",
          "&:hover": { color: palette.red },
        }}
      >
        {label}
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 18,
            transition: "transform 0.25s cubic-bezier(0.22, 0.61, 0.36, 1)",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </ButtonBase>

      {/* Invisible hover bridge so the pointer can travel to the panel. */}
      <Box sx={{ position: "absolute", left: 0, right: 0, height: 14, display: open ? "block" : "none" }} />

      <Box
        role="menu"
        sx={{
          position: "absolute",
          top: "calc(100% + 12px)",
          left: "50%",
          zIndex: (theme) => theme.zIndex.appBar + 1,
          width: 320,
          p: 1,
          borderRadius: "18px",
          border: "1px solid var(--app-border-soft)",
          backgroundColor: "color-mix(in srgb, var(--app-bg) 92%, transparent)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 2px 6px rgba(11, 17, 32, 0.05), 0 24px 60px -16px rgba(11, 17, 32, 0.22)",
          // Entrance: fade + rise + settle from a slight scale-down.
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transform: open
            ? "translateX(-50%) translateY(0) scale(1)"
            : "translateX(-50%) translateY(10px) scale(0.97)",
          transformOrigin: "top center",
          transition:
            "opacity 0.22s cubic-bezier(0.22, 0.61, 0.36, 1), transform 0.22s cubic-bezier(0.22, 0.61, 0.36, 1), visibility 0.22s",
        }}
      >
        {tagline && (
          <Box
            sx={{
              px: 1.75,
              pt: 1,
              pb: 0.75,
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--app-text-secondary)",
            }}
          >
            {tagline}
          </Box>
        )}
        {items.map((item) =>
          item.external ? (
            <Box key={item.title} component="a" href={item.external} sx={itemSx} onClick={() => setOpen(false)}>
              {itemBody(item)}
            </Box>
          ) : (
            <Box
              key={item.title}
              component={Link}
              href={item.href!}
              sx={itemSx}
              onClick={() => setOpen(false)}
            >
              {itemBody(item)}
            </Box>
          ),
        )}
        {footer && (
          <>
            <Box sx={{ height: "1px", backgroundColor: "var(--app-border-soft)", mx: 1.75, my: 0.75 }} />
            <Box
              component={Link}
              href={footer.href}
              onClick={() => setOpen(false)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                px: 1.75,
                py: 1,
                borderRadius: "12px",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: palette.red,
                transition: "background-color 0.18s ease",
                "&:hover": { backgroundColor: palette.redMuted },
                "&:hover .nd-footer-arrow": { transform: "translateX(3px)" },
              }}
            >
              {footer.label}
              <ArrowForwardIcon
                className="nd-footer-arrow"
                sx={{ fontSize: 15, transition: "transform 0.18s ease" }}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
