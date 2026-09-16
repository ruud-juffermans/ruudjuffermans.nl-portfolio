import Grid from "@mui/material/Grid2";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import ProjectFigure from "@/components/ProjectFigure";
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

// Bespoke page for the OV streaming pipeline. It shadows the generic
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

export default async function OvStreamingPipelinePage({
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
        <SubTitle title={c.architecture.choicesTitle} />
        <NumberedCards items={c.architecture.choices} accent={ACCENT} />
      </Band>

      <Band shaded>
        <SectionTitle title={c.producer.title} />
        <ProseWithCallouts paragraphs={c.producer.body} callouts={c.producer.callouts} accent={ACCENT} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 6 } }}>
          <BulletCard
            title={c.producer.quirksTitle}
            items={c.producer.quirks}
            note={c.producer.quirksNote}
            accent={ACCENT}
          />
        </Reveal>
      </Band>

      <Band>
        <SectionTitle title={c.windows.title} />
        <ProseBlock paragraphs={c.windows.body} />
        <FigureBlock figure={c.windows.figure} />
        <SubTitle title={c.windows.lessonsTitle} />
        <NumberedCards items={c.windows.lessons} columns={3} accent={ACCENT} />
      </Band>

      <Band shaded>
        <SectionTitle title={c.delivery.title} />
        <ProseBlock paragraphs={c.delivery.body} />
        <FigureBlock figure={c.delivery.figure} />
        <SubTitle title={c.delivery.detailsTitle} />
        <NumberedCards items={c.delivery.details} accent={ACCENT} />
        <CodeNote code={c.delivery.proof.test} body={c.delivery.proof.body} />
      </Band>

      <Band>
        <SectionTitle title={c.failure.title} />
        <ProseBlock paragraphs={c.failure.body} />
        <FigureBlock figure={c.failure.figure} />
        <SubTitle title={c.failure.pathsTitle} />
        <CodeCards items={c.failure.paths.map((p) => ({ code: p.command, title: p.title, body: p.body }))} />
        <PullQuote text={c.failure.measured} accent={ACCENT} />
      </Band>

      <Band shaded>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionTitle title={c.schema.title} />
            <ProseBlock paragraphs={c.schema.body} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ mt: { md: 9 } }}>
            <BulletCard title={c.schema.stepsTitle} items={c.schema.steps} accent={ACCENT} ordered />
          </Grid>
        </Grid>
      </Band>

      <Band>
        <SectionTitle title={c.practice.title} intro={c.practice.intro} />
        <MetricsTable caption={c.practice.tableCaption} rows={c.practice.rows} accent={ACCENT} />
        <Reveal variant="rise" sx={{ mt: { xs: 5, md: 7 } }}>
          <SubTitle title={c.practice.notesTitle} />
        </Reveal>
        <NumberedCards items={c.practice.notes} accent={ACCENT} />
        <Grid container spacing={{ xs: 4, md: 3 }} sx={{ mt: { xs: 2, md: 3 } }}>
          {c.practice.screenshots.map((f, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={f.src}>
              <Reveal variant="fade" delay={i * 100}>
                <ProjectFigure {...f} sizes="(min-width: 900px) 50vw, 100vw" />
              </Reveal>
            </Grid>
          ))}
        </Grid>
      </Band>

      <Band shaded>
        <SectionTitle title={c.choices.title} intro={c.choices.intro} />
        <NumberedCards items={c.choices.items} columns={3} accent={ACCENT} />
      </Band>

      <Band>
        <SectionTitle title={c.testing.title} />
        <ProseBlock paragraphs={c.testing.body} />
        <FigureBlock figure={c.testing.figure} />
      </Band>

      <ProjectClosing
        accent={ACCENT}
        title={c.shows.title}
        skills={c.shows.skills}
        closing={c.shows.closing}
        repoUrl={REPO_URL}
        labels={labels}
        footnotes={[`${c.ui.dataSource}: ${c.ui.dataSourceName}`]}
      />
    </>
  );
}
