"use client";

import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import { palette } from "@/theme/theme";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import ThemeSwitcher from "./ThemeSwitcher";

type StaticPathname = Exclude<AppPathname, `${string}[${string}]${string}`>;

export default function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems: { label: string; href: StaticPathname }[] = [
    { label: t("projects"), href: "/projects" },
    { label: t("blog"), href: "/blog" },
    { label: t("about"), href: "/about" },
    { label: t("contact"), href: "/contact" },
  ];

  return (
    <>
      <AppBar position="sticky" sx={{px:{ xs: 2, lg: 5 }}}>
          <Toolbar
            disableGutters
            sx={{ justifyContent: "space-between", minHeight: { xs: 60, lg: 68 } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                sx={{
                  color: palette.gray900,
                  ml: -1,
                  display: { xs: "inline-flex", lg: "none" },
                }}
              >
                <MenuIcon />
              </IconButton>
              <Box
                component={Link}
                href="/"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  textDecoration: "none",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: { xs: "1.15rem", lg: "1.3rem" },
                  color: palette.gray900,
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  "&:hover": { color: palette.red },
                  transition: "color 0.2s",
                }}
              >
                <Logo size={28} />
                Ruud Juffermans
              </Box>
            </Box>

            {/* Desktop nav */}
            <Box>
            <Box
              component="nav"
              aria-label={t("mainNavLabel")}
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                gap: 0.5,
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{
                    color: pathname === item.href ? palette.red : "var(--app-text-secondary)",
                    fontWeight: pathname === item.href ? 600 : 500,
                    fontSize: "0.92rem",
                    px: 2,
                    minHeight: 38,
                    position: "relative",
                    "&::after":
                      pathname === item.href
                        ? {
                            content: '""',
                            position: "absolute",
                            bottom: 4,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 18,
                            height: 2,
                            borderRadius: 1,
                            backgroundColor: palette.red,
                          }
                        : {},
                    "&:hover": {
                      color: palette.red,
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Box sx={{ ml: 1.5, display: "flex", alignItems: "center", gap: 0.5, mr:4 }}>
                <ThemeSwitcher />
                <LanguageSwitcher />
              </Box>
              
              <Button
                variant="contained"
                component={Link}
                href="/contact"
                size="small"
                sx={{ ml: 0.5, px: 3.5 }}
              >
                {tc("cta")}
              </Button>
            </Box>

            {/* Mobile CTA */}
            <Button
              variant="contained"
              component={Link}
              href="/contact"
              size="small"
              sx={{ display: { xs: "inline-flex", lg: "none" }, px: 3 }}
            >
              {tc("contact")}
            </Button>
            </Box>
          </Toolbar>
   
      </AppBar>

      {/* Mobile navigation drawer — large editorial links, controls at the bottom */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: "min(86vw, 360px)",
            backgroundColor: "var(--app-bg)",
            backgroundImage: "none",
            display: "flex",
            flexDirection: "column",
            borderRight: `1px solid var(--app-border-soft)`,
            "@keyframes navItemIn": {
              from: { opacity: 0, transform: "translateX(-14px)" },
              to: { opacity: 1, transform: "translateX(0)" },
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3.5,
            pt: 2.5,
            pb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: "1.05rem",
              color: palette.gray900,
              letterSpacing: "-0.02em",
            }}
          >
            <Logo size={24} />
            Ruud Juffermans
          </Box>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" sx={{ mr: -1 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box
          component="nav"
          aria-label={t("mainNavLabel")}
          sx={{ flex: 1, px: 2, pt: 3, overflowY: "auto" }}
        >
          {navItems.map((item, i) => {
            const active = pathname === item.href;
            return (
              <Box
                key={item.href}
                component={Link}
                href={item.href}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  px: 2,
                  py: 1.8,
                  mb: 0.5,
                  borderRadius: 3,
                  fontFamily: "var(--font-heading)",
                  fontWeight: active ? 700 : 600,
                  fontSize: "1.55rem",
                  letterSpacing: "-0.02em",
                  color: active ? palette.red : palette.gray900,
                  backgroundColor: active ? palette.redMuted : "transparent",
                  animation: drawerOpen
                    ? `navItemIn 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) both`
                    : "none",
                  animationDelay: `${120 + i * 55}ms`,
                  "&:active": { backgroundColor: palette.redMuted },
                }}
              >
                {item.label}
                {active && <ArrowForwardIcon sx={{ fontSize: 20, color: palette.red }} />}
              </Box>
            );
          })}

        </Box>

        <Divider sx={{ mx: 3.5 }} />
        <Box
          sx={{
            px: 3.5,
            pt: 2,
            pb: "calc(20px + env(safe-area-inset-bottom))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ThemeSwitcher />
            <LanguageSwitcher variant="compact" />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              component={Link}
              href="/contact"
              size="small"
              onClick={() => setDrawerOpen(false)}
              sx={{ px: 3 }}
            >
              {tc("cta")}
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
