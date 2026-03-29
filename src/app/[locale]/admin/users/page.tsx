"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  _count: { edits: number; articles: number };
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const changeRole = async (userId: string, role: string) => {
    setUpdating(userId);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u))
      );
    }
    setUpdating(null);
  };

  const isSuperAdmin = session?.user?.role === "SUPER_ADMIN";
  const roles = ["USER", "EDITOR", "APPROVER", "SUPER_ADMIN"];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading users...
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">
        User Management
      </h1>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-center">Edits</th>
              <th className="px-4 py-3 text-center">Articles</th>
              <th className="px-4 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt=""
                        className="w-7 h-7 rounded-full"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-foreground">
                        {(user.name || user.email || "?")[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-foreground font-medium">
                      {user.name || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  {isSuperAdmin && user.id !== session?.user?.id ? (
                    <select
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      disabled={updating === user.id}
                      className="bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-foreground">
                      {user.role}
                      {user.id === session?.user?.id && " (you)"}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center text-muted">
                  {user._count.edits}
                </td>
                <td className="px-4 py-3 text-center text-muted">
                  {user._count.articles}
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
