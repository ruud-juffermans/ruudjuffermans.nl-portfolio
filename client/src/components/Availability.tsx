"use client";

import { useTranslations } from "next-intl";
import styles from "./Availability.module.css";

// The badge used to render the current month, which made it read as either
// stale ("vanaf augustus" in August) or as "not yet available". It now states
// availability flatly; the month is set in the copy, not computed here.
export default function Availability({ variant }: { variant: "hero" | "footer" }) {
  const t = useTranslations("common");

  return (
    <span className={variant === "hero" ? styles.badge : styles.status}>
      {variant === "hero" ? t("availableHero") : t("availableFrom")}
      <span className={styles.dot} />
    </span>
  );
}
