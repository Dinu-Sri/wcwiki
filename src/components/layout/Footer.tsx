import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          {/* Brand */}
          <div>
            <div className="text-lg font-bold mb-2">
              <span className="text-primary">wc</span>
              <span className="text-foreground">WIKI</span>
            </div>
            <p className="text-muted text-xs leading-relaxed">
              A community-driven watercolor encyclopedia. All artworks are
              listed for educational purposes only. Rights belong to respective
              artists.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-2">Explore</h4>
            <ul className="space-y-1 text-muted">
              <li>
                <Link href="/artists" className="hover:text-foreground transition-colors">
                  Artists
                </Link>
              </li>
              <li>
                <Link href="/paintings" className="hover:text-foreground transition-colors">
                  Paintings
                </Link>
              </li>
              <li>
                <Link href="/articles" className="hover:text-foreground transition-colors">
                  Articles
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-foreground mb-2">Community</h4>
            <ul className="space-y-1 text-muted">
              <li>
                <Link href="/submit" className="hover:text-foreground transition-colors">
                  Submit an Article
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border text-center text-xs text-muted">
          © {new Date().getFullYear()} wcWIKI.com — All rights reserved.
        </div>
      </div>
    </footer>
  );
}
