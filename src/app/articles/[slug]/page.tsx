import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EditHistoryButton } from "@/components/EditHistoryButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug, status: "APPROVED" },
    include: { author: true },
  });
  if (!article) return { title: "Article Not Found" };

  return {
    title: article.title,
    description: article.excerpt?.slice(0, 160) || article.title,
    openGraph: {
      title: article.title,
      description: article.excerpt?.slice(0, 160) || undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author.name ? [article.author.name] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = await db.article.findUnique({
    where: { slug, status: "APPROVED" },
    include: { author: true },
  });

  if (!article) notFound();

  // Related articles by shared tags
  const relatedArticles =
    article.tags.length > 0
      ? await db.article.findMany({
          where: {
            id: { not: article.id },
            status: "APPROVED",
            tags: { hasSome: article.tags },
          },
          take: 4,
          orderBy: { publishedAt: "desc" },
        })
      : await db.article.findMany({
          where: {
            id: { not: article.id },
            status: "APPROVED",
          },
          take: 4,
          orderBy: { publishedAt: "desc" },
        });

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    ...(article.excerpt && { description: article.excerpt }),
    ...(article.publishedAt && {
      datePublished: article.publishedAt.toISOString(),
    }),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: article.author.name || "wcWIKI Contributor",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted mb-4 sm:mb-6 flex items-center gap-1.5 overflow-x-auto">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>›</span>
          <Link
            href="/articles"
            className="hover:text-primary transition-colors"
          >
            Articles
          </Link>
          <span>›</span>
          <span className="text-foreground line-clamp-1">{article.title}</span>
        </nav>

        {/* Edit Actions */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/edit/article/${article.slug}`}
            className="text-xs text-primary hover:underline"
          >
            Edit this page
          </Link>
          <EditHistoryButton entityType="ARTICLE" entityId={article.id} />
        </div>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 text-sm text-muted">
            {article.author.name && (
              <span>By {article.author.name}</span>
            )}
            {article.publishedAt && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <time dateTime={article.publishedAt.toISOString()}>
                  {article.publishedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </>
            )}
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium bg-primary-light text-primary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg text-muted leading-relaxed mb-8 pb-8 border-b border-border">
            {article.excerpt}
          </p>
        )}

        {/* Article body */}
        <article
          className="prose prose-neutral max-w-none
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-10 [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3
            [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2
            [&_p]:text-muted [&_p]:leading-relaxed [&_p]:mb-4
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:text-muted
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:text-muted
            [&_li]:mb-1.5 [&_li]:leading-relaxed
            [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary-hover
            [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted
            [&_img]:rounded-xl [&_img]:my-6
            [&_strong]:text-foreground [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Related Articles
            </h2>
            <div className="space-y-2">
              {relatedArticles.map((ra) => (
                <Link
                  key={ra.id}
                  href={`/articles/${ra.slug}`}
                  className="group block px-4 py-3 rounded-xl hover:bg-card hover:shadow-sm transition-all"
                >
                  <div className="text-xs text-primary mb-0.5 truncate">
                    wcwiki.com › articles › {ra.slug}
                  </div>
                  <h3 className="text-lg font-medium text-primary group-hover:underline leading-snug">
                    {ra.title}
                  </h3>
                  {ra.excerpt && (
                    <p className="mt-1 text-sm text-muted line-clamp-2 leading-relaxed">
                      {ra.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
