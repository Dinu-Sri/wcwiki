import { db } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const [artists, paintings, articles] = await Promise.all([
    db.artist.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, name: true, slug: true, updatedAt: true, _count: { select: { paintings: true } } },
    }),
    db.painting.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, title: true, slug: true, updatedAt: true, artist: { select: { name: true } } },
    }),
    db.article.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, title: true, slug: true, status: true, updatedAt: true, author: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Content</h1>

      {/* Artists */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Recent Artists ({artists.length})
        </h2>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3 text-center">Paintings</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-center text-muted">{a._count.paintings}</td>
                  <td className="px-4 py-3 text-muted">{new Date(a.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/artists/${a.slug}`} className="text-primary text-xs hover:underline mr-3">View</Link>
                    <Link href={`/edit/artist/${a.slug}`} className="text-primary text-xs hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Paintings */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Recent Paintings ({paintings.length})
        </h2>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Artist</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paintings.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-muted">{p.artist.name}</td>
                  <td className="px-4 py-3 text-muted">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/paintings/${p.slug}`} className="text-primary text-xs hover:underline mr-3">View</Link>
                    <Link href={`/edit/painting/${p.slug}`} className="text-primary text-xs hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Articles */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Recent Articles ({articles.length})
        </h2>
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-foreground font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-muted">{a.author.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                      a.status === "APPROVED" ? "bg-green-900/30 text-green-400" :
                      a.status === "PENDING" ? "bg-yellow-900/30 text-yellow-400" :
                      a.status === "REJECTED" ? "bg-red-900/30 text-red-400" :
                      "bg-accent text-muted"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{new Date(a.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/articles/${a.slug}`} className="text-primary text-xs hover:underline mr-3">View</Link>
                    <Link href={`/edit/article/${a.slug}`} className="text-primary text-xs hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
