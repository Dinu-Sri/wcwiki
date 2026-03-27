import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-warm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="text-lg font-bold">
                <span className="text-primary">wc</span>
                <span className="text-foreground">WIKI</span>
              </span>
            </div>
            <p className="text-muted text-xs leading-relaxed max-w-xs">
              A community-driven watercolor encyclopedia. Explore the beauty of
              watercolor art — from classic masters to contemporary creators.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-muted">
              <li>
                <Link href="/artists" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-warm"></span>
                  Artists
                </Link>
              </li>
              <li>
                <Link href="/paintings" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary"></span>
                  Paintings
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-primary transition-colors inline-flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-muted"></span>
                  Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-foreground mb-3 text-xs uppercase tracking-wider">Community</h4>
            <ul className="space-y-2 text-muted">
              <li>
                <Link href="/submit" className="hover:text-primary transition-colors">
                  Submit an Article
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted/60">
          <p>© {new Date().getFullYear()} wcWIKI.com — All rights reserved.</p>
          <p>All artworks are for educational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
