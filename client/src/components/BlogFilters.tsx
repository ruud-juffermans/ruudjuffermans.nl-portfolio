"use client";

import { useEffect, useMemo, useState } from "react";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import Reveal from "@/components/Reveal";
import BlogCard, { assignThumbVariants } from "@/components/BlogCard";
import type { PostMeta } from "@/lib/content";
import { POST_TOPICS, type PostTopic } from "@/lib/postTopics";
import styles from "./BlogFilters.module.css";

/** Sentinel values for the two filter axes; anything else is a real value. */
const ALL = "all";
/** Posts not written from a portfolio project. */
const STANDALONE = "none";

export interface ProjectOption {
  slug: string;
  label: string;
}

export interface BlogFiltersLabels {
  topicLabel: string;
  projectLabel: string;
  all: string;
  standalone: string;
  topics: Record<PostTopic, string>;
  reset: string;
  /** Singular and plural count templates; "{count}" is replaced. */
  countOne: string;
  countOther: string;
  emptyTitle: string;
  emptyBody: string;
}

type TopicFilter = typeof ALL | PostTopic;
type ProjectFilter = typeof ALL | typeof STANDALONE | string;

function readFromUrl(projects: readonly ProjectOption[]): {
  topic: TopicFilter;
  project: ProjectFilter;
} {
  const params = new URLSearchParams(window.location.search);
  const topic = params.get("topic");
  const project = params.get("project");
  return {
    topic: POST_TOPICS.includes(topic as PostTopic) ? (topic as PostTopic) : ALL,
    project:
      project !== null &&
      (project === STANDALONE || projects.some((p) => p.slug === project))
        ? project
        : ALL,
  };
}

function writeToUrl(topic: TopicFilter, project: ProjectFilter) {
  const params = new URLSearchParams(window.location.search);
  if (topic === ALL) params.delete("topic");
  else params.set("topic", topic);
  if (project === ALL) params.delete("project");
  else params.set("project", project);
  const qs = params.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
}

/**
 * The /blog listing with two filter axes: discipline (AI or data engineering)
 * and the portfolio project a post was written from. The selection lives in
 * the URL (?topic=…&project=…) so a filtered view can be linked to; the page
 * still prerenders the full list, and the URL state is read after hydration.
 */
export default function BlogFilters({
  posts,
  projects,
  metaFor,
  labels,
}: {
  posts: PostMeta[];
  /** Projects to offer, in display order. Only those with posts are shown. */
  projects: ProjectOption[];
  /** Pre-formatted "date · reading time" line per slug (needs server-side i18n). */
  metaFor: Record<string, string>;
  labels: BlogFiltersLabels;
}) {
  const [topic, setTopic] = useState<TopicFilter>(ALL);
  const [project, setProject] = useState<ProjectFilter>(ALL);

  useEffect(() => {
    const initial = readFromUrl(projects);
    setTopic(initial.topic);
    setProject(initial.project);
  }, [projects]);

  const select = (nextTopic: TopicFilter, nextProject: ProjectFilter) => {
    setTopic(nextTopic);
    setProject(nextProject);
    writeToUrl(nextTopic, nextProject);
  };

  // Artwork is assigned over the full list so a post keeps its thumbnail
  // whichever filter is active.
  const thumbVariants = useMemo(
    () => assignThumbVariants(posts.map((p) => p.slug)),
    [posts]
  );

  const usedProjects = useMemo(() => {
    const present = new Set(posts.map((p) => p.project).filter(Boolean));
    return projects.filter((p) => present.has(p.slug));
  }, [posts, projects]);
  const hasStandalone = posts.some((p) => !p.project);

  const visible = posts.filter(
    (p) =>
      (topic === ALL || p.topic === topic) &&
      (project === ALL ||
        (project === STANDALONE ? !p.project : p.project === project))
  );
  const isFiltered = topic !== ALL || project !== ALL;

  const chip = (
    pressed: boolean,
    label: string,
    onClick: () => void,
    key: string
  ) => (
    <button
      key={key}
      type="button"
      className={styles.chip}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className={styles.filters}>
        <div className={styles.row} role="group" aria-label={labels.topicLabel}>
          <span className={styles.label}>{labels.topicLabel}</span>
          {chip(topic === ALL, labels.all, () => select(ALL, project), ALL)}
          {POST_TOPICS.map((t) =>
            chip(topic === t, labels.topics[t], () => select(t, project), t)
          )}
        </div>
        <div className={styles.row} role="group" aria-label={labels.projectLabel}>
          <span className={styles.label}>{labels.projectLabel}</span>
          {chip(project === ALL, labels.all, () => select(topic, ALL), ALL)}
          {usedProjects.map((p) =>
            chip(project === p.slug, p.label, () => select(topic, p.slug), p.slug)
          )}
          {hasStandalone &&
            chip(
              project === STANDALONE,
              labels.standalone,
              () => select(topic, STANDALONE),
              STANDALONE
            )}
          <span className={styles.count} aria-live="polite">
            {(visible.length === 1 ? labels.countOne : labels.countOther).replace(
              "{count}",
              String(visible.length)
            )}
            {isFiltered && (
              <>
                {" · "}
                <button
                  type="button"
                  className={styles.reset}
                  onClick={() => select(ALL, ALL)}
                >
                  {labels.reset}
                </button>
              </>
            )}
          </span>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            {labels.emptyTitle}
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 500, mx: "auto", mb: 3 }}>
            {labels.emptyBody}
          </Typography>
          <button
            type="button"
            className={styles.reset}
            onClick={() => select(ALL, ALL)}
          >
            {labels.reset}
          </button>
        </div>
      ) : (
        <Grid container spacing={2.5}>
          {visible.map((post, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={post.slug}>
              <Reveal variant="rise" delay={Math.min(i, 8) * 100} sx={{ height: "100%" }}>
                <BlogCard
                  post={post}
                  variant={thumbVariants[post.slug]}
                  meta={metaFor[post.slug]}
                />
              </Reveal>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
