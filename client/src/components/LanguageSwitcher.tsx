"use client";

import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import LanguageIcon from "@mui/icons-material/LanguageOutlined";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

type Variant = "inline" | "compact";

export default function LanguageSwitcher({ variant = "inline" }: { variant?: Variant }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("common");

  const handleChange = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace({ pathname, params: params as any }, { locale: next });
    });
  };

  return (
    <Tooltip title={t("languageLabel")} arrow>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          opacity: isPending ? 0.6 : 1,
        }}
      >
        <ToggleButtonGroup
          size="small"
          value={locale}
          exclusive
          onChange={(_, next) => next && handleChange(next as Locale)}
          aria-label={t("languageLabel")}
          sx={{
            "& .MuiToggleButton-root": {
              px: 1.2,
              py: 0.3,
              minWidth: 0,
              border: "1px solid",
              borderColor: "divider",
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              lineHeight: 1.2,
              textTransform: "uppercase",
              color: "text.secondary",
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "#fff",
                borderColor: "primary.main",
                "&:hover": { backgroundColor: "primary.dark" },
              },
            },
          }}
        >
          {routing.locales.map((l) => (
            <ToggleButton key={l} value={l} aria-label={l}>
              {l.toUpperCase()}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Tooltip>
  );
}
