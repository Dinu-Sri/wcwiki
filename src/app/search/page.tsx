import { Suspense } from "react";
import SearchResults from "./SearchResults";

export const metadata = {
  title: "Search",
};

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
