import Grid from "@mui/material/Grid2";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import JsonLd from "@/components/JsonLd";
import PageViewTracker from "@/components/PageViewTracker";
import {
  Band,
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

// Bespoke page for strafrecht-rag. It shadows the generic /projects/[slug]
// article for this slug (see CUSTOM_PROJECT_PAGES); the project's MDX file
// still supplies the frontmatter for the /projects listing, the sitemap, the
// OG image and llms-full.txt.

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

export default async function StrafrechtRagPage({
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
        <SectionTitle title={c.architecture.title} />
        <ProseBlock paragraphs={c.architecture.body} />
        <FigureBlock figure={c.architecture.figure} />
        <SubTitle title={c.architecture.partsTitle} />
        <NumberedCards items={c.architecture.parts} columns={3} accent={ACCENT} />
      </Band>

      <Band shaded>
        <SectionTitle title={c.rule.title} />
        <ProseBlock paragraphs={c.rule.body} />
        <FigureBlock figure={c.rule.figure} />
        <SubTitle title={c.rule.stagesTitle} />
        <NumberedCards items={c.rule.stages} columns={3} accent={ACCENT} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 6 } }}>
          <ProseBlock paragraphs={c.rule.after} delay={0} />
        </Reveal>
        <FigureBlock figure={c.rule.screenshot} />
        <PullQuote text={c.rule.yield} accent={ACCENT} />
      </Band>

      <Band>
        <SectionTitle title={c.reranker.title} />
        <ProseWithCallouts paragraphs={c.reranker.body} callouts={c.reranker.callouts} accent={ACCENT} />
        <FigureBlock figure={c.reranker.screenshot} />
      </Band>

      <Band shaded>
        <SectionTitle title={c.reference.title} />
        <ProseBlock paragraphs={c.reference.body} />
        <FigureBlock figure={c.reference.figure} />
        <SubTitle title={c.reference.detailsTitle} />
        <NumberedCards items={c.reference.details} accent={ACCENT} />
      </Band>

      <Band>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionTitle title={c.corpus.title} />
            <ProseBlock paragraphs={[c.corpus.intro, c.corpus.note]} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }} sx={{ mt: { md: 9 } }}>
            <MetricsTable rows={c.corpus.rows} accent={ACCENT} />
          </Grid>
        </Grid>
      </Band>

      <Band shaded>
        <SectionTitle title={c.evaluation.title} intro={c.evaluation.intro} />
        <FigureBlock figure={c.evaluation.screenshot} />
        <MetricsTable columns={c.evaluation.columns} rows={c.evaluation.rows} accent={ACCENT} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 5 } }}>
          <ProseBlock paragraphs={c.evaluation.body} delay={0} />
        </Reveal>
      </Band>

      <Band>
        <SectionTitle title={c.choices.title} intro={c.choices.intro} />
        <NumberedCards items={c.choices.items} accent={ACCENT} />
      </Band>

      <ProjectClosing
        accent={ACCENT}
        title={c.shows.title}
        skills={c.shows.skills}
        closing={c.shows.closing}
        repoUrl={REPO_URL}
        labels={labels}
        footnotes={[c.ui.disclaimer, `${c.ui.dataSource}: ${c.ui.dataSourceName}`]}
      />
    </>
  );
}
