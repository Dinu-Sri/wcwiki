import { MeiliSearch } from "meilisearch";

const globalForMeili = globalThis as unknown as {
  meili: MeiliSearch | undefined;
};

export const meili =
  globalForMeili.meili ??
  new MeiliSearch({
    host: process.env.MEILISEARCH_HOST || "http://127.0.0.1:7700",
    apiKey: process.env.MEILISEARCH_API_KEY || "",
  });

if (process.env.NODE_ENV !== "production") globalForMeili.meili = meili;

// Index names
export const INDEXES = {
  ARTISTS: "artists",
  PAINTINGS: "paintings",
  ARTICLES: "articles",
  SUGGESTIONS: "suggestions",
} as const;
