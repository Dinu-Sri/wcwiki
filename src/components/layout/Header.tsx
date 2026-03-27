import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";

export function Header() {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 text-xl font-bold">
          <span className="text-primary">wc</span>
          <span className="text-foreground">WIKI</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <SearchBox size="default" />
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-4 text-sm text-muted">
          <Link href="/artists" className="hover:text-foreground transition-colors">
            Artists
          </Link>
          <Link href="/paintings" className="hover:text-foreground transition-colors">
            Paintings
          </Link>
          <Link href="/articles" className="hover:text-foreground transition-colors">
            Articles
          </Link>
        </nav>
      </div>
    </header>
  );
}
