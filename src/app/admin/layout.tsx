import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (
    !session?.user ||
    (session.user.role !== "SUPER_ADMIN" && session.user.role !== "APPROVER")
  ) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-surface border-r border-border shrink-0">
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.webp" alt="wcWIKI" className="h-6 w-auto" />
          </Link>
          <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">
            Admin Panel
          </p>
        </div>
        <nav className="p-2 space-y-0.5 text-sm">
          <Link
            href="/admin"
            className="block px-3 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="block px-3 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            Users
          </Link>
          <Link
            href="/admin/edits"
            className="block px-3 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            Pending Edits
          </Link>
          <Link
            href="/admin/content"
            className="block px-3 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            Content
          </Link>
          <Link
            href="/admin/media"
            className="block px-3 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
          >
            Media
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 bg-background overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
