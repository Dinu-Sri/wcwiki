import { Suspense } from "react";
import { Metadata } from "next";
import SearchResults from "./SearchResults";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const query = q?.trim();

  if (!query) {
    return {
      title: "Search",
      description: "Search for watercolor artists, paintings, and articles on wcWIKI.",
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `Search: ${query}`,
    description: `Search results for "${query}" — find watercolor artists, paintings, and articles on wcWIKI.`,
    alternates: {
      canonical: `${baseUrl}/search?q=${encodeURIComponent(query)}`,
    },
    openGraph: {
      title: `Search: ${query} | wcWIKI`,
      description: `Search results for "${query}" on wcWIKI.`,
      url: `${baseUrl}/search?q=${encodeURIComponent(query)}`,
    },
  };
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted">Loading search…</p>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
