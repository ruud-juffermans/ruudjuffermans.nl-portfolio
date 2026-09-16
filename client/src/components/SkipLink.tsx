import { Box } from "@mui/material";

/**
 * "Skip to content" link (WCAG 2.4.1): first focusable element on the page,
 * visually hidden until it receives keyboard focus, jumps past the sticky
 * header to <main id="main">.
 */
export default function SkipLink({ label }: { label: string }) {
  return (
    <Box
      component="a"
      href="#main"
      sx={{
        position: "fixed",
        top: 12,
        left: 12,
        // Above the sticky AppBar (MUI default z-index 1100).
        zIndex: 2000,
        px: 2.5,
        py: 1.25,
        borderRadius: 999,
        backgroundColor: "var(--app-surface-elevated)",
        color: "var(--app-text-primary)",
        border: "1px solid var(--app-border)",
        fontFamily: "var(--font-heading)",
        fontWeight: 600,
        fontSize: "0.9rem",
        textDecoration: "none",
        // Hidden but focusable: moved out of the viewport, not display:none.
        transform: "translateY(-200%)",
        "&:focus-visible": { transform: "translateY(0)" },
      }}
    >
      {label}
    </Box>
  );
}
