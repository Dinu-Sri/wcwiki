import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";

export function Header() {
  return (
    <header className="glass border-b border-border/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-5">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2 group">
          <svg className="w-6 h-6 text-warm group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span className="text-xl font-bold">
            <span className="text-primary">wc</span>
            <span className="text-foreground">WIKI</span>
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <SearchBox size="default" />
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/artists" className="px-3 py-1.5 rounded-lg text-muted hover:text-foreground hover:bg-accent transition-all">
            Artists
          </Link>
          <Link href="/paintings" className="px-3 py-1.5 rounded-lg text-muted hover:text-foreground hover:bg-accent transition-all">
            Paintings
          </Link>
          <Link href="/articles" className="px-3 py-1.5 rounded-lg text-muted hover:text-foreground hover:bg-accent transition-all">
            Articles
          </Link>
        </nav>
      </div>
    </header>
  );
}
