import { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  generateItemListSchema,
  generateBreadcrumbSchema,
} from "@/lib/schema";

export const dynamic = "force-dynamic";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";

export const metadata: Metadata = {
  title: "Watercolor Art Articles",
  description:
    "Read articles about watercolor techniques, history, materials, and tips from the community. Expert guides and tutorials.",
  alternates: {
    canonical: `${baseUrl}/articles`,
  },
  openGraph: {
    title: "Watercolor Art Articles",
    description: "Read articles about watercolor techniques, history, materials, and tips from the community.",
    url: `${baseUrl}/articles`,
    type: "website",
  },
};

export default async function ArticlesPage() {
  const articles = await db.article.findMany({
    where: { status: "APPROVED" },
    orderBy: { publishedAt: "desc" },
    include: { author: true },
  });

  const itemListLd = generateItemListSchema(
    articles.map((a) => ({
      url: `/articles/${a.slug}`,
      name: a.title,
      image: a.coverImage,
    })),
    baseUrl,
    "Watercolor Art Articles"
  );
  const breadcrumbLd = generateBreadcrumbSchema(baseUrl, [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted mb-4 sm:mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>›</span>
          <span className="text-foreground">Articles</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Articles
        </h1>
        <p className="text-sm sm:text-base text-muted mb-6 sm:mb-8">
          {articles.length} articles on watercolor art
        </p>

        <div className="space-y-2">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group block px-4 py-4 rounded-xl hover:bg-card hover:shadow-sm transition-all duration-200"
            >
              <div className="text-xs text-primary mb-0.5 truncate">
                wcwiki.com › articles › {article.slug}
              </div>
              <h2 className="text-lg font-medium text-primary group-hover:underline leading-snug">
                {article.title}
              </h2>
              {article.excerpt && (
                <p className="mt-1 text-sm text-muted line-clamp-2 leading-relaxed">
                  {article.excerpt}
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                {article.author.name && (
                  <span>{article.author.name}</span>
                )}
                {article.publishedAt && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <time dateTime={article.publishedAt.toISOString()}>
                      {article.publishedAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </>
                )}
              </div>
              {article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs bg-accent text-muted rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
