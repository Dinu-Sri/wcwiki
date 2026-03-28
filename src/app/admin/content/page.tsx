import { db } from "@/lib/db";
import { ContentTables } from "@/components/admin/ContentTables";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [artists, paintings, articles] = await Promise.all([
    db.artist.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        updatedAt: true,
        _count: { select: { paintings: true } },
      },
    }),
    db.painting.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        updatedAt: true,
        artist: { select: { name: true } },
      },
    }),
    db.article.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Content</h1>
      <ContentTables
        artists={JSON.parse(JSON.stringify(artists))}
        paintings={JSON.parse(JSON.stringify(paintings))}
        articles={JSON.parse(JSON.stringify(articles))}
      />
    </div>
  );
}
