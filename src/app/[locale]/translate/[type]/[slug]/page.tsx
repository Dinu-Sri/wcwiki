import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TranslationEditor } from "@/components/translation/TranslationEditor";
import { splitBodyIntoSegments } from "@/lib/translation-segments";
import { EntityType } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string; type: string; slug: string }>;
}

const TYPE_MAP: Record<string, EntityType> = {
  article: "ARTICLE",
  artist: "ARTIST",
  painting: "PAINTING",
};

export default async function TranslatePage({ params }: Props) {
  const { locale, type, slug } = await params;

  // Auth check: require EDITOR+ role
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }
  if (!["SUPER_ADMIN", "APPROVER", "EDITOR"].includes(session.user.role)) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted">You need Editor or higher privileges to translate content.</p>
          <Link href="/" className="mt-6 inline-block text-primary hover:underline">Go Home</Link>
        </main>
        <Footer />
      </>
    );
  }

  const entityType = TYPE_MAP[type];
  if (!entityType) notFound();

  // Fetch entity
  const entity = await fetchEntity(entityType, slug);
  if (!entity) notFound();

  // Fetch existing translations
  const existingTranslations = await db.translation.findMany({
    where: { entityType, entityId: entity.id },
  });

  // Build translation map grouped by locale
  const translationMap: Record<string, Record<string, { value: string; status: string }>> = {};
  for (const t of existingTranslations) {
    if (!translationMap[t.locale]) translationMap[t.locale] = {};
    translationMap[t.locale][t.field] = { value: t.value, status: t.status };
  }

  // Prepare fields and segments
  let fields: { key: string; label: string; multiline?: boolean }[];
  let segments: { key: string; html: string }[] | null = null;
  let originalValues: Record<string, string>;

  switch (entityType) {
    case "ARTICLE": {
      fields = [
        { key: "title", label: "Title" },
        { key: "excerpt", label: "Excerpt", multiline: true },
      ];
      segments = splitBodyIntoSegments(entity.body || "");
      originalValues = {
        title: entity.title,
        excerpt: entity.excerpt || "",
        body: entity.body || "",
      };
      break;
    }
    case "ARTIST": {
      fields = [
        { key: "name", label: "Name" },
        { key: "bio", label: "Biography", multiline: true },
      ];
      originalValues = {
        name: entity.name,
        bio: entity.bio || "",
      };
      break;
    }
    case "PAINTING": {
      fields = [
        { key: "title", label: "Title" },
        { key: "description", label: "Description", multiline: true },
      ];
      originalValues = {
        title: entity.title,
        description: entity.description || "",
      };
      break;
    }
    default:
      notFound();
  }

  const backUrl = `/${type}s/${slug}`;

  return (
    <>
      <Header />
      <main className="flex-1 w-full">
        {/* Toolbar */}
        <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-14 sm:top-16 z-30">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 h-12 flex items-center gap-3">
            <Link
              href={backUrl}
              className="text-sm text-muted hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-medium text-foreground truncate">
              Translate: {entity.displayTitle}
            </h1>
          </div>
        </div>

        <TranslationEditor
          entityType={entityType}
          entityId={entity.id}
          fields={fields}
          segments={segments}
          originalValues={originalValues}
          existingTranslations={translationMap}
          entitySlug={slug}
          entityTypeSlug={type}
        />
      </main>
      <Footer />
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchEntity(entityType: EntityType, slug: string): Promise<any> {
  switch (entityType) {
    case "ARTICLE": {
      const a = await db.article.findUnique({ where: { slug, status: "APPROVED" } });
      if (!a) return null;
      return { ...a, displayTitle: a.title };
    }
    case "ARTIST": {
      const a = await db.artist.findUnique({ where: { slug } });
      if (!a) return null;
      return { ...a, displayTitle: a.name };
    }
    case "PAINTING": {
      const p = await db.painting.findUnique({ where: { slug }, include: { artist: true } });
      if (!p) return null;
      return { ...p, displayTitle: p.title };
    }
    default:
      return null;
  }
}
