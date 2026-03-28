"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Artist {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
  _count: { paintings: number };
}

interface Painting {
  id: string;
  title: string;
  slug: string;
  updatedAt: string;
  artist: { name: string };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: string;
  author: { name: string | null };
}

interface ContentTablesProps {
  artists: Artist[];
  paintings: Painting[];
  articles: Article[];
}

const PAGE_SIZE = 20;

export function ContentTables({
  artists,
  paintings,
  articles,
}: ContentTablesProps) {
  const [tab, setTab] = useState<"artists" | "paintings" | "articles">(
    "artists"
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Reset page when switching tabs or searching
  const resetPage = () => setPage(1);

  const filteredArtists = useMemo(() => {
    const q = search.toLowerCase();
    return artists.filter((a) => a.name.toLowerCase().includes(q));
  }, [artists, search]);

  const filteredPaintings = useMemo(() => {
    const q = search.toLowerCase();
    return paintings.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.artist.name.toLowerCase().includes(q)
    );
  }, [paintings, search]);

  const filteredArticles = useMemo(() => {
    const q = search.toLowerCase();
    return articles.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(q) ||
        (a.author.name || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "ALL" || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

  const currentItems =
    tab === "artists"
      ? filteredArtists
      : tab === "paintings"
        ? filteredPaintings
        : filteredArticles;

  const totalPages = Math.ceil(currentItems.length / PAGE_SIZE);
  const paginatedItems = currentItems.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const tabs = [
    {
      key: "artists" as const,
      label: "Artists",
      count: filteredArtists.length,
    },
    {
      key: "paintings" as const,
      label: "Paintings",
      count: filteredPaintings.length,
    },
    {
      key: "articles" as const,
      label: "Articles",
      count: filteredArticles.length,
    },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              resetPage();
            }}
            className={`px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              tab === t.key
                ? "text-primary border-b-2 border-primary"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}{" "}
            <span className="text-xs text-muted ml-1">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          placeholder={`Search ${tab}...`}
          className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {tab === "articles" && (
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              resetPage();
            }}
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="DRAFT">Draft</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {tab === "artists" && (
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
              {(paginatedItems as Artist[]).map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-foreground font-medium">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 text-center text-muted">
                    {a._count.paintings}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(a.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/artists/${a.slug}`}
                      className="text-primary text-xs hover:underline mr-3"
                    >
                      View
                    </Link>
                    <Link
                      href={`/edit/artist/${a.slug}`}
                      className="text-primary text-xs hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No artists found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {tab === "paintings" && (
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
              {(paginatedItems as Painting[]).map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-foreground font-medium">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 text-muted">{p.artist.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/paintings/${p.slug}`}
                      className="text-primary text-xs hover:underline mr-3"
                    >
                      View
                    </Link>
                    <Link
                      href={`/edit/painting/${p.slug}`}
                      className="text-primary text-xs hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted">
                    No paintings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {tab === "articles" && (
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
              {(paginatedItems as Article[]).map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-foreground font-medium">
                    {a.title}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {a.author.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${
                        a.status === "APPROVED"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : a.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : a.status === "REJECTED"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-accent text-muted"
                      }`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(a.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/articles/${a.slug}`}
                      className="text-primary text-xs hover:underline mr-3"
                    >
                      View
                    </Link>
                    <Link
                      href={`/edit/article/${a.slug}`}
                      className="text-primary text-xs hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {paginatedItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No articles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, currentItems.length)} of{" "}
            {currentItems.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted hover:text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum =
                totalPages <= 5
                  ? i + 1
                  : page <= 3
                    ? i + 1
                    : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer ${
                    page === pageNum
                      ? "bg-primary text-white"
                      : "border border-border text-muted hover:text-foreground"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted hover:text-foreground disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
