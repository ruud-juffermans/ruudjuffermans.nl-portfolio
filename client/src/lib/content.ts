import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { routing, type Locale } from "@/i18n/routing";
import { POST_TOPICS, type PostTopic } from "@/lib/postTopics";

const contentDir = path.join(process.cwd(), "content");

// Projects with a bespoke page under app/[locale]/projects/<slug>/ instead of
// the generic MDX article. Their MDX file still supplies the frontmatter for
// listings, the sitemap, the OG image and llms-full.txt; the generic
// [slug] route must skip them or its prerender overwrites the custom page.
export const CUSTOM_PROJECT_PAGES: ReadonlySet<string> = new Set([
  "ov-streaming-pipeline",
  "strafrecht-rag",
  "digital-twin",
  "open-data-warehouse",
]);
const DEFAULT_LOCALE = routing.defaultLocale;

export { POST_TOPICS, type PostTopic };

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime: string;
  /** Discipline the post belongs to; set in frontmatter as `topic`. */
  topic: PostTopic;
  /**
   * Slug of the portfolio project the post was written from (a key of
   * CUSTOM_PROJECT_PAGES), or undefined for a standalone article.
   */
  project?: string;
}

export interface ProjectStat {
  label: string;
  value: string;
}

export interface ProjectMeta {
  slug: string;
  title: string;
  industry: string;
  summary: string;
  tags: string[];
  duration: string;
  thumbnail?: string;
  /** 2–3 hard numbers from the case study, rendered as the card's stats strip. */
  stats?: ProjectStat[];
  /** Public repository backing the "verifiable in the repo" claim. */
  repo?: string;
  /** Section accent colour (hex) used by the project's band on /projects. */
  accent?: string;
}

function estimateReadingTime(content: string): string {
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min`;
}

function postMetaFromFrontmatter(
  slug: string,
  data: Record<string, unknown>,
  content: string
): PostMeta {
  const topic = POST_TOPICS.includes(data.topic as PostTopic)
    ? (data.topic as PostTopic)
    : "data-engineering";
  return {
    slug,
    title: (data.title as string) || "Untitled",
    date: (data.date as string) || "",
    excerpt: (data.excerpt as string) || "",
    tags: (data.tags as string[]) || [],
    readingTime: estimateReadingTime(content),
    topic,
    project: typeof data.project === "string" ? data.project : undefined,
  };
}

function listSlugs(kind: "blog" | "projects", locale: Locale): string[] {
  const dir = path.join(contentDir, kind, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

function resolveFile(kind: "blog" | "projects", locale: Locale, slug: string) {
  const primary = path.join(contentDir, kind, locale, `${slug}.mdx`);
  if (fs.existsSync(primary)) return { filePath: primary, usedFallback: false };
  if (locale !== DEFAULT_LOCALE) {
    const fallback = path.join(contentDir, kind, DEFAULT_LOCALE, `${slug}.mdx`);
    if (fs.existsSync(fallback)) return { filePath: fallback, usedFallback: true };
  }
  return null;
}

export function getBlogPosts(locale: Locale = DEFAULT_LOCALE): PostMeta[] {
  const localeSlugs = new Set(listSlugs("blog", locale));
  const fallbackSlugs = listSlugs("blog", DEFAULT_LOCALE);
  const slugs = Array.from(new Set([...localeSlugs, ...fallbackSlugs]));

  return slugs
    .map((slug) => {
      const resolved = resolveFile("blog", locale, slug);
      if (!resolved) return null;
      const raw = fs.readFileSync(resolved.filePath, "utf-8");
      const { data, content } = matter(raw);
      return postMetaFromFrontmatter(slug, data, content);
    })
    .filter((p): p is PostMeta => p !== null)
    // Future-dated posts stay out of listings, sitemap and feed until their
    // date arrives (evaluated at build time — requires a rebuild to appear).
    .filter((p) => !p.date || new Date(p.date).getTime() <= Date.now())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getBlogPost(locale: Locale, slug: string) {
  const resolved = resolveFile("blog", locale, slug);
  if (!resolved) return null;

  const raw = fs.readFileSync(resolved.filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    meta: postMetaFromFrontmatter(slug, data, content),
    content,
    usedFallback: resolved.usedFallback,
  };
}

export function getProjectItems(locale: Locale = DEFAULT_LOCALE): ProjectMeta[] {
  const localeSlugs = new Set(listSlugs("projects", locale));
  const fallbackSlugs = listSlugs("projects", DEFAULT_LOCALE);
  const slugs = Array.from(new Set([...localeSlugs, ...fallbackSlugs]));

  return slugs
    .map((slug) => {
      const resolved = resolveFile("projects", locale, slug);
      if (!resolved) return null;
      const raw = fs.readFileSync(resolved.filePath, "utf-8");
      const { data } = matter(raw);
      return projectMetaFromFrontmatter(slug, data);
    })
    .filter((p): p is ProjectMeta => p !== null);
}

function projectMetaFromFrontmatter(
  slug: string,
  data: Record<string, unknown>
): ProjectMeta {
  return {
    slug,
    title: data.title || "Untitled",
    industry: data.industry || "",
    summary: data.summary || "",
    tags: data.tags || [],
    duration: data.duration || "",
    thumbnail: data.thumbnail,
    stats: data.stats,
    repo: data.repo,
    accent: data.accent,
  } as ProjectMeta;
}

export function getProjectItem(locale: Locale, slug: string) {
  const resolved = resolveFile("projects", locale, slug);
  if (!resolved) return null;

  const raw = fs.readFileSync(resolved.filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    meta: projectMetaFromFrontmatter(slug, data),
    content,
    usedFallback: resolved.usedFallback,
  };
}
