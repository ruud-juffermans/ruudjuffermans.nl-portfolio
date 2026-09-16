import { createTheme } from "@mui/material/styles";

// Fonts loaded via next/font in layout.tsx
// --font-heading: Plus Jakarta Sans
// --font-body: Outfit

// ── Absolute colors (never switch with mode) ────────────────────────────────
// Used as always-white text on navy, navy as accent section bg, etc.
const ABS = {
  navy: "#0B1120",
  navyLight: "#131B2E",
  navySurface: "#1A2340",
  white: "#FFFFFF",
};

// ── Scheme-specific color tokens (switch via data-mui-color-scheme) ─────────
// Light mode: warm cream background (EXAMPLE_LANDING palette: bg #f6f3eb,
// warm #ecead4, deep #e0ddc7), deep blue primary. The border / divider /
// light-gray tiers are warmed to match — cool slate hairlines look dirty
// on cream.
// Dark mode: near-black background with a slight blue cast, softened blue primary
const LIGHT = {
  bg: "#f6f3eb",
  surface: "#ecead4",
  surfaceElevated: "#fbf9f0",
  border: "#e0ddc7",
  borderSoft: "#eae7d6",
  divider: "#eeebdd",
  gray50: "#f3f0e3",
  gray100: "#ecead4",
  gray200: "#e0ddc7",
  gray300: "#CBD5E1",
  // gray400/500 double as text tints on the cream surfaces, so they must
  // clear WCAG 4.5:1 on bg #f6f3eb (gray400) and surface #ecead4 (gray500).
  gray400: "#5d6b80",
  gray500: "#566578",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1E293B",
  gray900: "#0F172A",
  red: "#2563eb",
  redHover: "#1d4ed8",
  redLight: "#60a5fa",
  redMuted: "rgba(37, 99, 235, 0.10)",
  redGlow: "rgba(37, 99, 235, 0.22)",
  // Text on accent-filled surfaces (contained buttons). White passes on the
  // deep light-mode blue; the pale dark-mode blue needs dark ink (WCAG AA).
  onRed: "#FFFFFF",
  textPrimary: "#0F172A",
  // Both tiers are used on the card surface (#ecead4), where 4.5:1 needs
  // secondary ≤ #52627A and muted ≤ #566578; keep secondary the darker tier.
  textSecondary: "#52627A",
  textMuted: "#566578",
};

const DARK = {
  bg: "#0A0F1C",
  surface: "#111726",
  surfaceElevated: "#161D30",
  border: "#283048",
  borderSoft: "#1E2538",
  divider: "#1E2538",
  gray50: "#161D30",
  gray100: "#1E2538",
  gray200: "#283048",
  gray300: "#3B475C",
  gray400: "#64748B",
  gray500: "#94A3B8",
  gray600: "#CBD5E1",
  gray700: "#DBE3EE",
  gray800: "#E8EDF5",
  gray900: "#F4F7FB",
  red: "#60a5fa",
  redHover: "#93c5fd",
  redLight: "#bfdbfe",
  redMuted: "rgba(147, 197, 253, 0.14)",
  redGlow: "rgba(147, 197, 253, 0.30)",
  onRed: "#0A0F1C",
  textPrimary: "#F4F7FB",
  textSecondary: "#B9C4D6",
  textMuted: "#94A3B8",
};

// ── Custom CSS variables (independent of MUI's palette vars) ────────────────
// Declared per-scheme and read via our exported `palette` object below
const cssVarsFor = (tokens: typeof LIGHT) => ({
  "--app-bg": tokens.bg,
  "--app-surface": tokens.surface,
  "--app-surface-elevated": tokens.surfaceElevated,
  "--app-border": tokens.border,
  "--app-border-soft": tokens.borderSoft,
  "--app-divider": tokens.divider,
  "--app-gray-50": tokens.gray50,
  "--app-gray-100": tokens.gray100,
  "--app-gray-200": tokens.gray200,
  "--app-gray-300": tokens.gray300,
  "--app-gray-400": tokens.gray400,
  "--app-gray-500": tokens.gray500,
  "--app-gray-600": tokens.gray600,
  "--app-gray-700": tokens.gray700,
  "--app-gray-800": tokens.gray800,
  "--app-gray-900": tokens.gray900,
  "--app-red": tokens.red,
  "--app-red-hover": tokens.redHover,
  "--app-red-light": tokens.redLight,
  "--app-on-red": tokens.onRed,
  "--app-red-muted": tokens.redMuted,
  "--app-red-glow": tokens.redGlow,
  "--app-text-primary": tokens.textPrimary,
  "--app-text-secondary": tokens.textSecondary,
  "--app-text-muted": tokens.textMuted,
});

// ── Public palette: mix of absolute hex + CSS-var references ────────────────
// Hex values = fixed across modes; var() references = swap per color scheme.
// This preserves the existing palette.* API used throughout the codebase
// while adding automatic light/dark adaptation for all semantic tokens.
export const palette = {
  // absolute
  navy: ABS.navy,
  navyLight: ABS.navyLight,
  navySurface: ABS.navySurface,
  white: ABS.white,
  // scheme-adaptive (primary)
  red: "var(--app-red)",
  redHover: "var(--app-red-hover)",
  redLight: "var(--app-red-light)",
  redMuted: "var(--app-red-muted)",
  redGlow: "var(--app-red-glow)",
  // scheme-adaptive (surfaces)
  offWhite: "var(--app-surface)",
  surfaceElevated: "var(--app-surface-elevated)",
  bg: "var(--app-bg)",
  border: "var(--app-border)",
  // scheme-adaptive (neutrals)
  gray50: "var(--app-gray-50)",
  gray100: "var(--app-gray-100)",
  gray200: "var(--app-gray-200)",
  gray300: "var(--app-gray-300)",
  gray400: "var(--app-gray-400)",
  gray500: "var(--app-gray-500)",
  gray600: "var(--app-gray-600)",
  gray700: "var(--app-gray-700)",
  gray800: "var(--app-gray-800)",
  gray900: "var(--app-gray-900)",
};

// ── Shared motion + shape tokens ─────────────────────────────────────────────
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
export const radii = {
  panel: 24,
  card: 16,
  control: 12,
  pill: 999,
};

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-mui-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        primary: {
          main: LIGHT.red,
          dark: LIGHT.redHover,
          light: LIGHT.redLight,
          contrastText: ABS.white,
        },
        secondary: {
          main: ABS.navy,
          dark: ABS.navy,
          light: ABS.navyLight,
        },
        background: {
          default: LIGHT.bg,
          paper: LIGHT.surface,
        },
        text: {
          primary: LIGHT.textPrimary,
          secondary: LIGHT.textSecondary,
        },
        divider: LIGHT.divider,
      },
    },
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: DARK.red,
          dark: DARK.redHover,
          light: DARK.redLight,
          contrastText: DARK.onRed,
        },
        secondary: {
          main: ABS.navyLight,
          dark: ABS.navy,
          light: ABS.navySurface,
        },
        background: {
          default: DARK.bg,
          paper: DARK.surface,
        },
        text: {
          primary: DARK.textPrimary,
          secondary: DARK.textSecondary,
        },
        divider: DARK.divider,
      },
    },
  },
  // Fluid type scale — clamp() replaces responsiveFontSizes so headings stay
  // large and confident on desktop while fitting comfortably on phones.
  typography: {
    fontFamily: "var(--font-body), 'Segoe UI', sans-serif",
    h1: {
      fontFamily: "var(--font-heading), 'Segoe UI', sans-serif",
      fontWeight: 800,
      fontSize: "clamp(2.5rem, 5.2vw + 1rem, 4.25rem)",
      lineHeight: 1.04,
      letterSpacing: "-0.035em",
    },
    h2: {
      fontFamily: "var(--font-heading), 'Segoe UI', sans-serif",
      fontWeight: 700,
      fontSize: "clamp(1.9rem, 2.6vw + 1rem, 2.75rem)",
      lineHeight: 1.12,
      letterSpacing: "-0.025em",
    },
    h3: {
      fontFamily: "var(--font-heading), 'Segoe UI', sans-serif",
      fontWeight: 650,
      fontSize: "clamp(1.4rem, 1.2vw + 1rem, 1.75rem)",
      lineHeight: 1.22,
      letterSpacing: "-0.015em",
    },
    h4: {
      fontFamily: "var(--font-heading), 'Segoe UI', sans-serif",
      fontWeight: 650,
      fontSize: "1.3rem",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontFamily: "var(--font-heading), 'Segoe UI', sans-serif",
      fontWeight: 600,
      fontSize: "1.15rem",
      lineHeight: 1.4,
    },
    h6: {
      fontFamily: "var(--font-heading), 'Segoe UI', sans-serif",
      fontWeight: 600,
      fontSize: "1rem",
      lineHeight: 1.4,
    },
    body1: {
      fontSize: "1.0625rem",
      fontWeight: 400,
      lineHeight: 1.7,
      color: "var(--app-text-secondary)",
    },
    body2: {
      fontSize: "0.95rem",
      fontWeight: 400,
      lineHeight: 1.65,
    },
    subtitle1: {
      fontSize: "clamp(1.05rem, 0.6vw + 0.9rem, 1.25rem)",
      lineHeight: 1.6,
      fontWeight: 400,
      color: "var(--app-text-secondary)",
    },
    button: {
      fontFamily: "var(--font-body), 'Segoe UI', sans-serif",
      fontWeight: 600,
      textTransform: "none" as const,
      letterSpacing: "0.01em",
    },
    overline: {
      fontFamily: "var(--font-body), 'Segoe UI', sans-serif",
      fontWeight: 600,
      fontSize: "0.72rem",
      letterSpacing: "0.18em",
      textTransform: "uppercase" as const,
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 6,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Scheme-aware CSS variables
        ":root, [data-mui-color-scheme='light']": cssVarsFor(LIGHT),
        "[data-mui-color-scheme='dark']": cssVarsFor(DARK),
        html: {
          scrollBehavior: "smooth",
          colorScheme: "light dark",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "optimizeLegibility",
          // --font-heading / --font-body come from next/font in layout.tsx.
        },
        body: {
          overflowX: "hidden",
          backgroundColor: "var(--app-bg)",
          color: "var(--app-text-primary)",
          WebkitTapHighlightColor: "transparent",
          transition: "background-color 0.3s ease, color 0.3s ease",
        },
        "::selection": {
          backgroundColor: "var(--app-red-muted)",
          color: "var(--app-text-primary)",
        },
        ":focus-visible": {
          outline: "2px solid var(--app-red)",
          outlineOffset: 2,
        },
        // Subtle scrollbar styling that adapts to scheme
        "::-webkit-scrollbar": { width: 10, height: 10 },
        "::-webkit-scrollbar-track": { background: "transparent" },
        "::-webkit-scrollbar-thumb": {
          background: "var(--app-gray-200)",
          borderRadius: 8,
          border: "2px solid transparent",
          backgroundClip: "padding-box",
        },
        "::-webkit-scrollbar-thumb:hover": {
          background: "var(--app-gray-300)",
          backgroundClip: "padding-box",
          border: "2px solid transparent",
        },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: "lg" },
      styleOverrides: {
        root: {
          paddingLeft: 20,
          paddingRight: 20,
          "@media (min-width:600px)": {
            paddingLeft: 32,
            paddingRight: 32,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radii.pill,
          padding: "10px 26px",
          fontSize: "0.95rem",
          fontWeight: 600,
          minHeight: 44, // comfortable tap target on touch devices
          transition: `all 0.25s ${EASE}`,
          "&:active": { transform: "scale(0.98)" },
        },
        sizeLarge: {
          padding: "14px 34px",
          fontSize: "1rem",
          minHeight: 52,
        },
        sizeSmall: {
          padding: "7px 18px",
          fontSize: "0.875rem",
          minHeight: 38,
        },
        containedPrimary: {
          backgroundColor: "var(--app-red)",
          color: "var(--app-on-red)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 1px 2px rgba(11,17,32,0.12)",
          "@media (hover: hover)": {
            "&:hover": {
              backgroundColor: "var(--app-red-hover)",
              transform: "translateY(-1px)",
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.18), 0 10px 28px var(--app-red-glow)`,
            },
          },
        },
        outlinedPrimary: {
          borderColor: "var(--app-border)",
          color: "var(--app-text-primary)",
          borderWidth: 1.5,
          "@media (hover: hover)": {
            "&:hover": {
              borderColor: "var(--app-red)",
              backgroundColor: "var(--app-red-muted)",
              borderWidth: 1.5,
            },
          },
        },
        text: {
          color: "var(--app-red)",
          "@media (hover: hover)": {
            "&:hover": {
              backgroundColor: "var(--app-red-muted)",
            },
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          // Ensure the card behaves correctly when rendered as `<a>` via
          // `component={Link}` — browsers otherwise apply inline display and
          // the default link color to descendants.
          display: "block",
          color: "inherit",
          textDecoration: "none",
          backgroundColor: "var(--app-surface-elevated)",
          border: `1px solid var(--app-border-soft)`,
          borderRadius: radii.card,
          transition: `transform 0.35s ${EASE}, box-shadow 0.35s ${EASE}, border-color 0.35s`,
          // Lift only on devices that can actually hover — on touch it just
          // causes a sticky, half-applied state that feels broken.
          "@media (hover: hover)": {
            "&:hover": {
              borderColor: "var(--app-border)",
              boxShadow: `0 16px 44px rgba(11, 17, 32, 0.09)`,
              transform: "translateY(-3px)",
              textDecoration: "none",
            },
            "[data-mui-color-scheme='dark'] &:hover": {
              boxShadow: `0 16px 44px rgba(0, 0, 0, 0.55)`,
            },
          },
          "&:focus-visible": {
            outline: `2px solid var(--app-red)`,
            outlineOffset: 2,
          },
          // Faint top highlight gives surfaces a machined, layered feel in dark mode
          "[data-mui-color-scheme='dark'] &": {
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025), rgba(255,255,255,0))",
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundColor: "color-mix(in srgb, var(--app-bg) 78%, transparent)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          borderBottom: `1px solid var(--app-border-soft)`,
          color: "var(--app-text-primary)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: radii.pill,
          fontSize: "0.78rem",
        },
        outlined: {
          borderColor: "var(--app-border)",
          color: "var(--app-text-secondary)",
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: radii.control,
            transition: "box-shadow 0.2s ease",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--app-gray-300)",
            },
            "&.Mui-focused": {
              boxShadow: "0 0 0 4px var(--app-red-muted)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--app-red)",
              borderWidth: 1.5,
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: "var(--app-divider)" },
      },
    },
    MuiTypography: {
      defaultProps: {
        // subtitle1/2 are lede paragraphs here, not section headings — MUI's
        // default <h6> mapping breaks heading order (h1 → h6) for a11y.
        variantMapping: { subtitle1: "p", subtitle2: "p" },
      },
      styleOverrides: {
        overline: { color: "var(--app-red)" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: radii.control },
        standardInfo: {
          backgroundColor: "var(--app-red-muted)",
          color: "var(--app-text-primary)",
          "& .MuiAlert-icon": { color: "var(--app-red)" },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: radii.control },
      },
    },
  },
});

export default theme;
