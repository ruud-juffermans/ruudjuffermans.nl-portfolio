// The two disciplines behind the homepage's "What I do" slides, each with its
// own page under /expertise/[field]. The copy lives in the `expertise.fields`
// translation namespace under `key`; `projects` lists the case studies that
// belong to the field, in the order the page shows them.
export const EXPERTISE_FIELDS = {
  "data-engineering": {
    key: "data",
    projects: ["open-data-warehouse", "ov-streaming-pipeline"],
  },
  "ai-engineering": {
    key: "ai",
    projects: ["digital-twin", "strafrecht-rag"],
  },
} as const;

export type ExpertiseField = keyof typeof EXPERTISE_FIELDS;

export function isExpertiseField(field: string): field is ExpertiseField {
  return field in EXPERTISE_FIELDS;
}
