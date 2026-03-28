import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-sm">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.webp" alt="wcWIKI" className="h-6 w-auto" />
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
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Use
            </Link>
            <span className="hidden sm:inline">·</span>
            <p className="hidden sm:inline">All artworks are for educational purposes only.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
