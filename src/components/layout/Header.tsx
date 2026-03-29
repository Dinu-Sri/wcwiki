import Link from "next/link";
import { SearchBox } from "@/components/search/SearchBox";
import { UserMenu } from "@/components/auth/UserMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function Header() {
  return (
    <header className="glass border-b border-border/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center gap-3 sm:gap-5">
        {/* Mobile menu */}
        <MobileNav />

        {/* Logo */}
        <Link href="/" className="shrink-0 flex items-center gap-2 group">
          <img src="/logo.webp" alt="wcWIKI" className="h-7 sm:h-8 w-auto group-hover:scale-110 transition-transform duration-300" />
        </Link>

        {/* Search */}
        <div className="flex-1 min-w-0 max-w-xl">
          <SearchBox size="default" />
        </div>

        {/* Nav links — desktop only */}
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

        {/* Language switcher — desktop only */}
        <div className="hidden md:block">
          <LanguageSwitcher />
        </div>

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}
