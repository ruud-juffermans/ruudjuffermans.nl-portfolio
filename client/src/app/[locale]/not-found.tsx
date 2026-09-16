import { Box, Container, Typography, Button } from "@mui/material";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { palette } from "@/theme/theme";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <Box sx={{ py: { xs: 14, md: 20 }, textAlign: "center" }}>
      <Container maxWidth="sm">
        <Typography
          variant="overline"
          sx={{ color: palette.red, display: "block", letterSpacing: "0.12em", mb: 2 }}
        >
          404
        </Typography>
        <Typography variant="h1" sx={{ mb: 2, fontSize: "clamp(28px, 4vw, 40px)" }}>
          {t("title")}
        </Typography>
        <Typography sx={{ color: palette.gray500, mb: 4 }}>{t("description")}</Typography>
        <Button component={Link} href="/" variant="contained">
          {t("backHome")}
        </Button>
      </Container>
    </Box>
  );
}
