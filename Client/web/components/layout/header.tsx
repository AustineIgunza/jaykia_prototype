"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/context";

const navLinks = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/policies", label: "Policies" },
  { href: "/contact", label: "Contact" },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, loading, logout, isStaff } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-accent tracking-tight">
            JayKia
          </span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href
                    ? "text-accent font-medium"
                    : "text-muted-light hover:text-foreground"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="block h-0.5 mt-1 rounded-full bg-accent" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {loading ? (
            <div className="w-20 h-8" />
          ) : user ? (
            <>
              {isStaff && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
              <Link href="/auth/account">
                <Button variant="ghost" size="sm">
                  My Account
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          <Link href="/book">
            <Button size="sm">Book a Transfer</Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-muted-light hover:text-foreground transition-colors cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border animate-slide-up" style={{ animationDuration: "0.25s" }}>
          <div className="px-6 py-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm py-1 transition-colors ${
                  pathname === link.href
                    ? "text-accent font-medium border-l-2 border-accent pl-3"
                    : "text-muted-light hover:text-foreground"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="gold-divider" />
            <div className="flex flex-col gap-2">
              {loading ? null : user ? (
                <>
                  {isStaff && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link href="/auth/account" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      My Account
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" className="w-full" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">
                    Sign In
                  </Button>
                </Link>
              )}
              <Link href="/book" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full">
                  Book a Transfer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export { Header };
