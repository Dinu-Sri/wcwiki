"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-accent animate-pulse" />;
  }

  if (!session) {
    return (
      <Link
        href="/auth/login"
        className="px-4 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
      >
        Sign In
      </Link>
    );
  }

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "APPROVER";
  const initial = session.user.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium hover:bg-primary-hover transition-colors cursor-pointer"
      >
        {session.user.image ? (
          <img
            src={session.user.image}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-56 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
          <div className="px-4 py-2.5 border-b border-border">
            <p className="text-sm font-medium text-foreground truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-muted truncate">{session.user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium bg-primary-light text-primary rounded-full uppercase">
              {session.user.role}
            </span>
          </div>

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
          >
            Dashboard
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            >
              Admin Panel
            </Link>
          )}

          <div className="border-t border-border mt-1" />
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-accent transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
