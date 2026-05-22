"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/lib/auth/context";
import { Button } from "@/components/ui/button";

const sidebarLinks = [
  { href: "/admin", label: "Overview", icon: "\u{1F4CA}" },
  { href: "/admin/bookings", label: "Bookings", icon: "\u{1F4CB}" },
  { href: "/admin/payments", label: "Payments", icon: "\u{1F4B3}" },
  { href: "/admin/refunds", label: "Refunds", icon: "\u21A9" },
  { href: "/admin/ratings", label: "Ratings", icon: "\u2B50" },
  { href: "/admin/feedback", label: "Feedback", icon: "\u{1F4AC}" },
  { href: "/admin/users", label: "Users & Roles", icon: "\u{1F465}" },
];

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/auth/login");
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted animate-pulse">Loading&hellip;</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted mb-4">You need admin privileges to access this area.</p>
          <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-surface shrink-0">
        <div className="p-6 border-b border-border">
          <Link href="/admin">
            <span className="font-display text-xl font-bold text-accent">JayKia</span>
            <span className="text-xs text-muted block mt-0.5">Admin Dashboard</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors ${
                pathname === link.href
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted-light hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full" onClick={logout}>
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/admin">
          <span className="font-display text-lg font-bold text-accent">JayKia Admin</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={logout}>
          Sign Out
        </Button>
      </div>

      {/* Mobile nav bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border flex overflow-x-auto">
        {sidebarLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[64px] text-xs transition-colors ${
              pathname === link.href ? "text-accent" : "text-muted"
            }`}
          >
            <span className="text-base">{link.icon}</span>
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 md:pt-0 pt-14 pb-20 md:pb-0 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminGuard>{children}</AdminGuard>
    </AuthProvider>
  );
}
