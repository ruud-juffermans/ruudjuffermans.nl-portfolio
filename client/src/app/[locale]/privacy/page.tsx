import { Box, Container, Typography } from "@mui/material";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { palette } from "@/theme/theme";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: buildAlternates("/privacy", locale),
    openGraph: buildOpenGraph("/privacy", locale),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");
  const sections = t.raw("sections") as { title: string; content: string }[];

  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="md">
        <Typography variant="h1" sx={{ mb: 6 }}>
          {t("title")}
        </Typography>

        {sections.map((section) => (
          <Box key={section.title} sx={{ mb: 5 }}>
            <Typography variant="h3" sx={{ mb: 1.5 }}>
              {section.title}
            </Typography>
            <Typography variant="body1" sx={{ color: palette.gray600 }}>
              {section.content}
            </Typography>
          </Box>
        ))}

        <Typography variant="body2" sx={{ color: palette.gray400, mt: 6 }}>
          {t("lastUpdated")}
        </Typography>
      </Container>
    </Box>
  );
}
