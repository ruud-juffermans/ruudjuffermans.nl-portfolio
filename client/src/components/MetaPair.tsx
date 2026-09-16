import { Box, Typography } from "@mui/material";
import { palette } from "@/theme/theme";

/** A small overline label above a bold value — the stats strip on project
 *  sections and cards. */
export default function MetaPair({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <Box>
      <Typography
        variant="overline"
        sx={{ display: "block", color: "var(--app-text-muted)", mb: 0.25, letterSpacing: "0.14em" }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: "1.05rem",
          color: accent ?? palette.gray900,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
