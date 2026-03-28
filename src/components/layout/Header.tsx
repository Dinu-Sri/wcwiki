import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";

export function Header() {
  return (
    <header className="glass border-b border-border/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-5">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2 group">
          <img src="/logo.webp" alt="wcWIKI" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
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
