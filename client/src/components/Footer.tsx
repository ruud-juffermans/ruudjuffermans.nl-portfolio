"use client";

import { Box, Container, Typography, TextField, Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid2";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Availability from "./Availability";
import { Link } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import { palette } from "@/theme/theme";
import { useEffect, useState } from "react";
import { subscribeNewsletter } from "@/lib/api";
import { useSession } from "@/lib/session";

type StaticPathname = Exclude<AppPathname, `${string}[${string}]${string}`>;

/**
 * Footer color tokens — hard-coded to a white-on-navy spectrum so they remain
 * identical in both light and dark color schemes. The footer's navy background
 * is already an absolute color; these foreground values complete the lock-in.
 */
const FC = {
  heading: "rgba(255, 255, 255, 0.85)",
  body: "rgba(255, 255, 255, 0.50)",
  link: "rgba(255, 255, 255, 0.65)",
  linkHover: "#FFFFFF",
  // ≥ 0.55 alpha keeps the © line at WCAG AA (4.5:1) on the navy footer.
  copyright: "rgba(255, 255, 255, 0.55)",
  icon: "rgba(255, 255, 255, 0.55)",
  iconHover: "#FFFFFF",
  hairline: "rgba(255, 255, 255, 0.30)",
  inputBg: "rgba(255, 255, 255, 0.06)",
  inputBorder: "rgba(255, 255, 255, 0.12)",
  inputBorderHover: "rgba(255, 255, 255, 0.24)",
  inputText: "#FFFFFF",
  inputPlaceholder: "rgba(255, 255, 255, 0.40)",
};

export default function Footer() {
  const t = useTranslations("footer");
  const { user } = useSession();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Prefill the subscribe field from the platform session, without clobbering
  // anything typed.
  useEffect(() => {
    if (user) setEmail((prev) => prev || user.email);
  }, [user]);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      await subscribeNewsletter(email);
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const siteLinks: { label: string; href: StaticPathname }[] = [
    { label: t("siteLinks.projects"), href: "/projects" },
    { label: t("siteLinks.blog"), href: "/blog" },
    { label: t("siteLinks.about"), href: "/about" },
    { label: t("siteLinks.contact"), href: "/contact" },
    { label: t("siteLinks.privacy"), href: "/privacy" },
  ];

  // Where a recruiter or hiring manager actually looks next.
  const elsewhereLinks: { label: string; href: string }[] = [
    { label: t("elsewhereLinks.linkedin"), href: "https://www.linkedin.com/in/r-j3" },
    { label: t("elsewhereLinks.github"), href: "https://github.com/ruud-juffermans" },
    { label: t("elsewhereLinks.email"), href: "mailto:me@ruudjuffermans.nl" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        // Navy blended with the bottom bar's former 35% black overlay, so the
        // whole footer sits at the darkness the bottom strip used to have.
        backgroundColor: "#070B15",
        color: FC.body,
        pt: { xs: 9, md: 12 },
        pb: 0,
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          pointerEvents: "none",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(to right, transparent, ${palette.red})`,
          opacity: 0.3,
        },
      }}
    >
      <Container>
        <Grid container spacing={6}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                overflow: "hidden",
                border: `1px solid ${FC.hairline}`,
                mb: 2,
                lineHeight: 0,
              }}
            >
              <Image
                src="/images/ruud-juffermans-portrait.jpg"
                alt={t("portraitAlt")}
                width={144}
                height={144}
                sizes="72px"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#FFFFFF",
                mb: 1,
              }}
            >
              Ruud Juffermans
            </Typography>
            <Typography variant="body2" sx={{ color: FC.body, mb: 3 }}>
              {t("tagline")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                component="a"
                href="https://www.linkedin.com/in/r-j3"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                sx={{ color: FC.icon, "&:hover": { color: FC.iconHover } }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                component="a"
                href="https://github.com/ruud-juffermans"
                target="_blank"
                rel="noopener"
                aria-label="GitHub"
                sx={{ color: FC.icon, "&:hover": { color: FC.iconHover } }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                component="a"
                href="mailto:me@ruudjuffermans.nl"
                aria-label="E-mail"
                sx={{ color: FC.icon, "&:hover": { color: FC.iconHover } }}
              >
                <EmailIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="overline" sx={{ color: FC.heading, mb: 2, display: "block" }}>
              {t("siteHeading")}
            </Typography>
            {siteLinks.map((item) => (
              <Box
                key={item.href}
                component={Link}
                href={item.href}
                sx={{
                  display: "block",
                  color: FC.link,
                  textDecoration: "none",
                  fontSize: "1rem",
                  lineHeight: 1.65,
                  mb: 1,
                  "&:hover": { color: FC.linkHover },
                  transition: "color 0.2s",
                }}
              >
                {item.label}
              </Box>
            ))}
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <Typography variant="overline" sx={{ color: FC.heading, mb: 2, display: "block" }}>
              {t("elsewhereHeading")}
            </Typography>
            {elsewhereLinks.map((item) => (
              <Box
                key={item.label}
                component="a"
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener" : undefined}
                sx={{
                  display: "block",
                  color: FC.link,
                  textDecoration: "none",
                  fontSize: "1rem",
                  lineHeight: 1.65,
                  mb: 1,
                  "&:hover": { color: FC.linkHover },
                  transition: "color 0.2s",
                }}
              >
                {item.label}
              </Box>
            ))}
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography variant="overline" sx={{ color: FC.heading, mb: 2, display: "block" }}>
              {t("newsletterHeading")}
            </Typography>
            <Typography variant="body2" sx={{ color: FC.body, mb: 2 }}>
              {t("newsletterBody")}
            </Typography>
            <Box
              component="form"
              onSubmit={handleNewsletter}
              sx={{
                display: "flex",
                gap: 1.5,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                size="small"
                placeholder={t("newsletterPlaceholder")}
                // Placeholder is not an accessible name (and disappears on
                // input) — screen readers need an explicit label.
                slotProps={{ htmlInput: { "aria-label": t("newsletterLabel") } }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: FC.inputBg,
                    color: FC.inputText,
                    borderRadius: 999,
                    px: 1,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: FC.inputBorder,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: FC.inputBorderHover,
                    },
                    "& input::placeholder": {
                      color: FC.inputPlaceholder,
                      opacity: 1,
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="small"
                disabled={status === "loading"}
                sx={{ px: 4, whiteSpace: "nowrap", height: 44, alignSelf: { xs: "stretch", sm: "auto" } }}
              >
                {status === "success" ? t("newsletterSuccess") : t("newsletterSubmit")}
              </Button>
            </Box>
            {/* Persistent live region: mounted before any status exists, so
                screen readers announce the outcome of a submit (4.1.3). */}
            <Box role="status" aria-live="polite">
              {status === "error" && (
                <Typography variant="body2" sx={{ color: "#EF4444", mt: 1, fontSize: "0.85rem" }}>
                  {t("newsletterError")}
                </Typography>
              )}
              {status === "success" && (
                <Typography variant="body2" sx={{ color: FC.body, mt: 1, fontSize: "0.85rem" }}>
                  {t("newsletterSuccess")}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box
        sx={{
          mt: { xs: 7, md: 9 },
          py: 2.5,
          pb: "calc(15px + env(safe-area-inset-bottom))",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <Container>
          <Box
            sx={{
              display: "flex",
              justifyContent: { xs: "center", sm: "space-between" },
              alignItems: "center",
              flexWrap: "wrap",
              textAlign: "center",
              gap: { xs: 0.5, sm: 2 },
            }}
          >
            <Typography variant="body2" sx={{ color: FC.copyright, fontSize: "0.85rem" }}>
              {t("copyright", { year: new Date().getFullYear() })}
            </Typography>
            <Availability variant="footer" />
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
