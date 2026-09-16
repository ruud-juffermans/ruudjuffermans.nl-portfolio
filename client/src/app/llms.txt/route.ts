import { getBlogPosts, getProjectItems } from "@/lib/content";
import { absoluteUrl, SITE_URL } from "@/lib/seo";
import nlMessages from "../../../messages/nl.json";

// Curated AI-discovery index (llms.txt convention): the whole portfolio in one
// small Markdown fetch. Dutch is the primary audience; the English mirror is
// noted once. Rendered at build time — a deploy accompanies every content change.
export const dynamic = "force-static";

export function GET() {
  const projects = getProjectItems("nl").map((p) => {
    const url = absoluteUrl("/projects/[slug]", "nl", { slug: p.slug });
    return `- [${p.title}](${url}): ${p.summary}`;
  });

  // Posts link to their Markdown twin — the cheapest representation for an
  // AI fetcher (~1.5K tokens instead of the full HTML page).
  const posts = getBlogPosts("nl").map(
    (p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}.md): ${p.excerpt}`,
  );

  const body = `# ${nlMessages.site.title}

> ${nlMessages.site.description} Portfolio van een data engineer in Nederland, open voor een nieuwe rol.

Taal: Nederlands (primair), Engels onder ${SITE_URL}/en. Volledige inhoud in één bestand: ${SITE_URL}/llms-full.txt

## Projecten

${projects.join("\n")}

## Blog

${posts.join("\n")}

## Contact

- [Over Ruud Juffermans](${absoluteUrl("/about", "nl")}): achtergrond, ervaring en expertise
- [Data engineering](${absoluteUrl("/expertise/[field]", "nl", { field: "data-engineering" })}): aanpak, ervaring en projecten in data engineering
- [AI engineering](${absoluteUrl("/expertise/[field]", "nl", { field: "ai-engineering" })}): aanpak, ervaring en projecten in AI engineering
- [Contact](${absoluteUrl("/contact", "nl")}): neem contact op over een rol of een project
- LinkedIn: https://www.linkedin.com/in/r-j3
- GitHub: https://github.com/ruud-juffermans
- RSS: ${SITE_URL}/feed.xml
`;

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
