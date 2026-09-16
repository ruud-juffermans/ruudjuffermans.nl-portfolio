// Kept apart from content.ts (which reads the filesystem) so client
// components can import the topic list without pulling in `fs`.

/** The two disciplines the blog is filtered on. */
export const POST_TOPICS = ["ai", "data-engineering"] as const;
export type PostTopic = (typeof POST_TOPICS)[number];
