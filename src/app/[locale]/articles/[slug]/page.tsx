import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { EditHistoryButton } from "@/components/EditHistoryButton";
import { ReferencesSection } from "@/components/ReferencesSection";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
} from "@/lib/schema";
import { TranslatePanel } from "@/components/TranslatePanel";
import { getTranslations } from "@/lib/translations";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug, status: "APPROVED" },
    include: { author: true },
  });
  if (!article) return { title: "Article Not Found" };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";
  const title = article.metaTitle || article.title;
  const description =
    article.metaDescription ||
    article.excerpt?.slice(0, 160) ||
    article.title;

  const ogImage = article.ogImage || article.coverImage ||
    `${baseUrl}/api/og?type=article&title=${encodeURIComponent(article.title)}&subtitle=${encodeURIComponent(article.author.name || "wcWIKI")}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/articles/${slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${baseUrl}/articles/${slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: article.author.name ? [article.author.name] : undefined,
      tags: article.tags.length > 0 ? article.tags : undefined,
      images: [{ url: ogImage, width: 1200, height: 630, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;

  const article = await db.article.findUnique({
    where: { slug, status: "APPROVED" },
    include: { author: true },
  });

  if (!article) notFound();

  // Fetch approved translations for this locale
  const t = await getTranslations("ARTICLE", article.id, locale);
  const displayTitle = t.title || article.title;
  const displayExcerpt = t.excerpt || article.excerpt;
  const displayBody = t.body || article.body;

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
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wcwiki.com";
  const jsonLd = generateArticleSchema(article, baseUrl, {
    name: "wcWIKI",
    logoUrl: null,
  });
  const breadcrumbLd = generateBreadcrumbSchema(baseUrl, [
    { name: "Home", url: "/" },
    { name: "Articles", url: "/articles" },
    { name: article.title, url: `/articles/${article.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted mb-4 sm:mb-6 flex items-center gap-1.5 min-w-0">
          <Link href="/" className="shrink-0 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="shrink-0">›</span>
          <Link
            href="/articles"
            className="shrink-0 hover:text-primary transition-colors"
          >
            Articles
          </Link>
          <span>›</span>
          <span className="text-foreground line-clamp-1">{displayTitle}</span>
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
          <TranslatePanel
            entityType="ARTICLE"
            entityId={article.id}
            fields={[
              { key: "title", label: "Title" },
              { key: "excerpt", label: "Excerpt", multiline: true },
              { key: "body", label: "Body", multiline: true },
            ]}
            originalValues={{
              title: article.title,
              excerpt: article.excerpt || "",
              body: article.body,
            }}
          />
        </div>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-3 leading-tight">
            {displayTitle}
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
        {displayExcerpt && (
          <p className="text-lg text-muted leading-relaxed mb-8 pb-8 border-b border-border">
            {displayExcerpt}
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
            [&_img]:rounded-xl [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto
            [&_strong]:text-foreground [&_strong]:font-semibold
            break-words overflow-wrap-anywhere"
          dangerouslySetInnerHTML={{ __html: displayBody }}
        />

        {/* References */}
        <ReferencesSection references={(article.references as { title: string; url?: string; author?: string; publishedDate?: string; accessDate?: string; note?: string }[]) ?? []} />

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
