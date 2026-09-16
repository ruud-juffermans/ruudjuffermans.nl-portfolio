import Grid from "@mui/material/Grid2";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import PageViewTracker from "@/components/PageViewTracker";
import {
  Band,
  BulletCard,
  CodeCards,
  CodeNote,
  FigureBlock,
  MetricsTable,
  NumberedCards,
  ProjectClosing,
  ProjectHero,
  ProseBlock,
  ProseWithCallouts,
  PullQuote,
  SectionTitle,
  SplitBand,
  SubTitle,
} from "@/components/ProjectPageKit";
import { getProjectItem } from "@/lib/content";
import { absoluteUrl, buildAlternates, buildOpenGraph, SITE_URL } from "@/lib/seo";
import { routing, type Locale } from "@/i18n/routing";
import { ACCENT, CONTENT, REPO_URL, SLUG } from "./content";

// Bespoke page for open-data-warehouse. It shadows the generic
// /projects/[slug] article for this slug (see CUSTOM_PROJECT_PAGES); the
// project's MDX file still supplies the frontmatter for the /projects
// listing, the sitemap, the OG image and llms-full.txt.

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const c = CONTENT[locale];
  return {
    title: c.title,
    description: c.lead,
    alternates: buildAlternates("/projects/[slug]", locale, { slug: SLUG }),
    openGraph: {
      ...buildOpenGraph("/projects/[slug]", locale, { slug: SLUG }),
      type: "article",
      title: c.title,
      description: c.lead,
    },
  };
}

export default async function OpenDataWarehousePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = CONTENT[locale];
  const meta = getProjectItem(locale, SLUG)?.meta;
  const labels = { repo: c.ui.repo, allProjects: c.ui.allProjects, back: c.ui.back };

  return (
    <>
      <PageViewTracker path={`/projects/${SLUG}`} locale={locale} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: locale === "nl" ? "Projecten" : "Projects",
              item: absoluteUrl("/projects", locale),
            },
            { "@type": "ListItem", position: 3, name: c.title },
          ],
        }}
      />

      <ProjectHero
        accent={ACCENT}
        eyebrow={c.eyebrow}
        title={c.title}
        lead={c.lead}
        intro={c.intro}
        tags={meta?.tags ?? []}
        facts={c.facts}
        stats={c.stats}
        repoUrl={REPO_URL}
        labels={labels}
      >
        <FigureBlock figure={c.hero} priority />
      </ProjectHero>

      <SplitBand title={c.why.title} paragraphs={c.why.body} />

      <Band>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionTitle title={c.sources.title} />
            <ProseBlock paragraphs={[...c.sources.body, c.sources.note]} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }} sx={{ mt: { md: 9 } }}>
            <MetricsTable columns={c.sources.columns} rows={c.sources.rows} accent={ACCENT} />
          </Grid>
        </Grid>
      </Band>

      <Band shaded>
        <SectionTitle title={c.architecture.title} />
        <ProseBlock paragraphs={c.architecture.body} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 6 } }}>
          <SubTitle title={c.architecture.partsTitle} />
        </Reveal>
        <NumberedCards items={c.architecture.parts} columns={3} accent={ACCENT} />
      </Band>

      <Band>
        <SectionTitle title={c.ingestion.title} />
        <ProseWithCallouts paragraphs={c.ingestion.body} callouts={c.ingestion.callouts} accent={ACCENT} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 6 } }}>
          <BulletCard
            title={c.ingestion.resultTitle}
            items={c.ingestion.results}
            note={c.ingestion.resultNote}
            accent={ACCENT}
          />
        </Reveal>
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 6 } }}>
          <SubTitle title={c.ingestion.choicesTitle} />
        </Reveal>
        <NumberedCards items={c.ingestion.choices} accent={ACCENT} />
        <CodeNote code={c.ingestion.manifest.code} body={c.ingestion.manifest.body} />
      </Band>

      <Band shaded>
        <SectionTitle title={c.model.title} />
        <ProseBlock paragraphs={c.model.body} />
        <FigureBlock figure={c.model.figure} />
        <SubTitle title={c.model.tablesTitle} />
        <CodeCards items={c.model.tables} />
        <PullQuote text={c.model.quote} accent={ACCENT} />
      </Band>

      <Band>
        <SectionTitle title={c.scd2.title} />
        <ProseWithCallouts paragraphs={c.scd2.body} callouts={c.scd2.callouts} accent={ACCENT} />
        <FigureBlock figure={c.scd2.figure} />
        <BulletCard
          title={c.scd2.testsTitle}
          items={c.scd2.tests}
          note={c.scd2.testsNote}
          accent={ACCENT}
          ordered
        />
      </Band>

      <Band shaded>
        <SectionTitle title={c.limits.title} />
        <ProseBlock paragraphs={c.limits.body} />
        <PullQuote text={c.limits.quote} accent={ACCENT} />
      </Band>

      <Band>
        <SectionTitle title={c.quality.title} />
        <ProseBlock paragraphs={c.quality.body} />
        <FigureBlock figure={c.quality.figure} />
        <MetricsTable columns={c.quality.columns} rows={c.quality.rows} accent={ACCENT} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 5 } }}>
          <ProseBlock paragraphs={c.quality.after} delay={0} />
        </Reveal>
      </Band>

      <Band shaded>
        <SectionTitle title={c.powerbi.title} intro={c.powerbi.intro} />
        <NumberedCards items={c.powerbi.questions} columns={3} accent={ACCENT} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 6 } }}>
          <ProseBlock paragraphs={c.powerbi.body} delay={0} />
        </Reveal>
      </Band>

      <ProjectClosing
        accent={ACCENT}
        title={c.shows.title}
        skills={c.shows.skills}
        closing={c.shows.closing}
        repoUrl={REPO_URL}
        labels={labels}
        footnotes={[c.ui.sources, c.ui.docs]}
      />
    </>
  );
}
