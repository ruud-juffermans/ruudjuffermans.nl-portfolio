"use client";

import * as React from "react";
import { IconButton, Tooltip, Skeleton } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useTranslations } from "next-intl";

export default function ThemeSwitcher() {
  const { mode, systemMode, setMode } = useColorScheme();
  const t = useTranslations("common");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !mode) {
    return <Skeleton variant="circular" width={34} height={34} />;
  }

  const effective = mode === "system" ? systemMode ?? "light" : mode;
  const next = effective === "dark" ? "light" : "dark";
  const label = effective === "dark" ? t("themeLight") : t("themeDark");

  return (
    <Tooltip title={label} arrow>
      <IconButton
        size="small"
        onClick={() => setMode(next)}
        aria-label={label}
        sx={{
          width: 28,
          height: 28,
          mr: 1,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "50%",
          color: "text.secondary",
          transition: "color 0.2s, border-color 0.2s, background-color 0.2s",
          "&:hover": {
            color: "text.primary",
            borderColor: "text.secondary",
            backgroundColor: "action.hover",
          },
          "& svg": {
            fontSize: 18,
            transition: "transform 0.3s cubic-bezier(0.2, 0.65, 0.25, 1)",
          },
          "&:hover svg": {
            transform: "rotate(-12deg)",
          },
        }}
      >
        {effective === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  );
}
