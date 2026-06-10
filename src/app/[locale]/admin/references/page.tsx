import Link from "next/link";
import { db } from "@/lib/db";
import { ReferenceApprovalActions } from "@/components/references/ReferenceApprovalActions";

export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "APPROVED") return "bg-green-50 text-green-700 border-green-200";
  if (status === "REJECTED") return "bg-red-50 text-red-700 border-red-200";
  return "bg-yellow-50 text-yellow-700 border-yellow-200";
}

export default async function ReferenceApprovalsPage() {
  const [pending, recent] = await Promise.all([
    db.paintingReference.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        category: { select: { name: true } },
        submittedBy: { select: { name: true, email: true } },
      },
      take: 100,
    }),
    db.paintingReference.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { reviewedAt: "desc" },
      include: {
        category: { select: { name: true } },
        submittedBy: { select: { name: true, email: true } },
      },
      take: 20,
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Painting Reference Approvals
          </h1>
          <p className="mt-1 text-sm text-muted">
            {pending.length} pending submission{pending.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/painting-references"
          className="w-fit rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          View Public Library
        </Link>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
          No painting references are waiting for approval.
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((reference) => (
            <div
              key={reference.id}
              className="grid gap-4 rounded-xl border border-border bg-surface p-4 md:grid-cols-[180px_minmax(0,1fr)_240px]"
            >
              <a
                href={reference.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-xl bg-accent"
              >
                <img
                  src={reference.thumbnailUrl}
                  alt={reference.title}
                  className="aspect-[4/3] h-full w-full object-cover"
                />
              </a>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground">
                  {reference.title}
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Submitted by {reference.submittedBy.name || reference.submittedBy.email || "Unknown"} on{" "}
                  {reference.createdAt.toLocaleDateString()}
                </p>
                {reference.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-muted">
                    {reference.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {reference.category && (
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                      {reference.category.name}
                    </span>
                  )}
                  {reference.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-accent px-2 py-1 text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">
                  Attribution: {reference.attributionName || "wcWIKI contributor"}
                  {reference.attributionUrl ? ` (${reference.attributionUrl})` : ""}
                </p>
              </div>
              <ReferenceApprovalActions referenceId={reference.id} />
            </div>
          ))}
        </div>
      )}

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Recently Reviewed
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Contributor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((reference) => (
                  <tr key={reference.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={reference.thumbnailUrl}
                          alt=""
                          className="h-10 w-12 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium text-foreground">
                            {reference.title}
                          </div>
                          <div className="text-xs text-muted">
                            {reference.category?.name || "No category"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {reference.submittedBy.name || reference.submittedBy.email || "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusClass(reference.status)}`}>
                        {reference.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {reference.reviewedAt
                        ? reference.reviewedAt.toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
