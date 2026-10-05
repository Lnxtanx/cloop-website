/**
 * Topic Media Registry
 *
 * Configurable mapping for attaching custom educational media (such as local 3D animations,
 * simulations, or video lessons) to specific topics and chapters.
 */

export interface TopicMatchContext {
  topicId?: number;
  topicTitle?: string;
  chapterTitle?: string;
  subjectName?: string;
}

export interface TopicMediaItem {
  id: string;
  type: "video" | "animation";
  url: string;
  title: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  duration?: string;
  topicIds?: number[];
  matches?: (context: TopicMatchContext) => boolean;
}

/**
 * Registry of available media files.
 * Add new video animations or simulations here as more media is created.
 */
export const TOPIC_MEDIA_REGISTRY: TopicMediaItem[] = [
  {
    id: "force-topic-1-animation",
    type: "video",
    url: "/force.mp4",
    title: "Concept Animation: What is a Force?",
    subtitle: "Class 8 Science • Chapter 5: Exploring Forces",
    badge: "🎬 3D Concept Animation",
    description: "Visual exploration of push and pull forces causing motion, stopping, and direction changes.",
    duration: "Animation",
    topicIds: [3474], // Database ID for Class 8 Science - Force Topic 1
    matches: (ctx: TopicMatchContext) => {
      // 1. Direct match by database Topic ID
      if (ctx.topicId && ctx.topicId === 3474) {
        return true;
      }

      // 2. Flexible match by chapter and topic titles (fetched from database or query params)
      const chapter = (ctx.chapterTitle || "").toLowerCase().trim();
      const topic = (ctx.topicTitle || "").toLowerCase().trim();

      const isForceChapter =
        chapter.includes("force") ||
        chapter.includes("exploring forces") ||
        topic.includes("exploring forces");

      if (!isForceChapter) {
        return false;
      }

      // Match Topic 1 ("What is a Force?", "Topic 1", or general force intro)
      const isTopicOne =
        topic.includes("what is a force") ||
        topic.includes("topic 1") ||
        topic.startsWith("1.") ||
        topic.startsWith("1 ") ||
        (!topic.includes("topic 2") &&
          !topic.includes("topic 3") &&
          !topic.includes("topic 4") &&
          !topic.includes("topic 5") &&
          !topic.includes("types of force") &&
          !topic.includes("contact force") &&
          !topic.includes("non-contact force") &&
          !topic.includes("pressure"));

      return isTopicOne;
    },
  },
];

/**
 * Resolves media for a given topic context.
 * Checks both explicit Topic IDs and title keywords from the database.
 */
export function getTopicMedia(context: TopicMatchContext): TopicMediaItem | null {
  for (const item of TOPIC_MEDIA_REGISTRY) {
    if (context.topicId && item.topicIds && item.topicIds.includes(context.topicId)) {
      return item;
    }
    if (item.matches && item.matches(context)) {
      return item;
    }
  }
  return null;
}
