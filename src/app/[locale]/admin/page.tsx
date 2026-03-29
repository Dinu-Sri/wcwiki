import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [userCount, artistCount, paintingCount, articleCount, pendingEdits] =
    await Promise.all([
      db.user.count(),
      db.artist.count(),
      db.painting.count(),
      db.article.count(),
      db.editHistory.count({ where: { status: "PENDING" } }),
    ]);

  const recentUsers = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const stats = [
    { label: "Users", value: userCount, href: "/admin/users" },
    { label: "Artists", value: artistCount },
    { label: "Paintings", value: paintingCount },
    { label: "Articles", value: articleCount },
    { label: "Pending Edits", value: pendingEdits, href: "/admin/edits" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => {
          const inner = (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <p className="text-sm text-muted">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {stat.value}
              </p>
            </div>
          );
          return stat.href ? (
            <a key={stat.label} href={stat.href}>
              {inner}
            </a>
          ) : (
            <div key={stat.label}>{inner}</div>
          );
        })}
      </div>

      {/* Recent Users */}
      <h2 className="text-lg font-semibold text-foreground mb-3">
        Recent Users
      </h2>
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-foreground">
                  {user.name || "—"}
                </td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-foreground">
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
