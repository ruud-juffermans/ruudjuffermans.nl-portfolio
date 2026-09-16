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

// Bespoke page for digital-twin. It shadows the generic /projects/[slug]
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

export default async function DigitalTwinPage({
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
        <SectionTitle title={c.design.title} />
        <ProseBlock paragraphs={c.design.body} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 6 } }}>
          <SubTitle title={c.design.partsTitle} />
        </Reveal>
        <NumberedCards items={c.design.parts} columns={3} accent={ACCENT} />
      </Band>

      <Band shaded>
        <SectionTitle title={c.graph.title} />
        <ProseBlock paragraphs={c.graph.body} />
        <FigureBlock figure={c.graph.figure} />
        <SubTitle title={c.graph.nodesTitle} />
        <CodeCards items={c.graph.nodes} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 6 } }}>
          <ProseBlock paragraphs={c.graph.after} delay={0} />
        </Reveal>
        <PullQuote text={c.graph.loop} accent={ACCENT} />
      </Band>

      <Band>
        <SectionTitle title={c.approval.title} />
        <ProseBlock paragraphs={c.approval.body} />
        <FigureBlock figure={c.approval.figure} />
        <BulletCard
          title={c.approval.stepsTitle}
          items={c.approval.steps}
          note={c.approval.stepsNote}
          accent={ACCENT}
          ordered
        />
        <PullQuote text={c.approval.quote} accent={ACCENT} />
      </Band>

      <Band shaded>
        <SectionTitle title={c.layers.title} />
        <ProseWithCallouts paragraphs={c.layers.body} callouts={c.layers.callouts} accent={ACCENT} />
        <FigureBlock figure={c.layers.figure} />
        <SubTitle title={c.layers.layersTitle} />
        <NumberedCards items={c.layers.layers} columns={3} accent={ACCENT} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 6 } }}>
          <BulletCard
            title={c.layers.contractTitle}
            items={c.layers.contract}
            note={c.layers.contractNote}
            accent={ACCENT}
          />
        </Reveal>
      </Band>

      <Band>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <SectionTitle title={c.data.title} />
            <ProseBlock paragraphs={[c.data.intro, ...c.data.body, c.data.note]} />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }} sx={{ mt: { md: 9 } }}>
            <MetricsTable caption={c.data.caption} rows={c.data.rows} accent={ACCENT} />
          </Grid>
        </Grid>
      </Band>

      <Band shaded>
        <SectionTitle title={c.evaluation.title} intro={c.evaluation.intro} />
        <MetricsTable columns={c.evaluation.columns} rows={c.evaluation.rows} accent={ACCENT} />
        <Reveal variant="rise" sx={{ mt: { xs: 4, md: 5 } }}>
          <ProseBlock paragraphs={c.evaluation.body} delay={0} />
        </Reveal>
      </Band>

      <Band>
        <SectionTitle title={c.limits.title} intro={c.limits.intro} />
        <NumberedCards items={c.limits.items} accent={ACCENT} />
      </Band>

      <Band shaded>
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
        footnotes={[c.ui.scope, c.ui.article]}
      />
    </>
  );
}
