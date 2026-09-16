import { Box } from "@mui/material";
import { getTranslations } from "next-intl/server";
import { palette } from "@/theme/theme";

/**
 * The three credentials that only apply to Ruud, on one line: aerospace, the
 * police, and the Udemy courses. They used to sit buried in the About timeline;
 * the review's point is that they belong directly under the hero, because they
 * are the reason to believe everything else on the page.
 */
export default async function ProofStrip({
  align = "left",
  tone = "default",
}: {
  align?: "left" | "center";
  tone?: "default" | "onDark";
}) {
  const t = await getTranslations("common.proof");
  const items = [t("nlr"), t("police"), t("udemy")];

  const color = tone === "onDark" ? "rgba(255,255,255,0.72)" : "var(--app-text-secondary)";
  const dot = tone === "onDark" ? "rgba(255,255,255,0.32)" : palette.gray300;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: { xs: 1, sm: 1.75 },
        fontSize: "0.9rem",
        fontWeight: 500,
        color,
      }}
    >
      {items.map((item, i) => (
        <Box key={item} sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.75 } }}>
          {/* Separator belongs to the item that follows it, so it never
              dangles at the end of a wrapped line. */}
          {i > 0 && (
            <Box
              aria-hidden
              sx={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: dot, flexShrink: 0 }}
            />
          )}
          <Box component="span">{item}</Box>
        </Box>
      ))}
    </Box>
  );
}
