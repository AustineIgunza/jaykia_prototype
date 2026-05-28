export type RoleTier = "admin" | "manager" | "support" | "customer";

export function getRoleTier(roles: string[]): RoleTier {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("manager")) return "manager";
  if (roles.includes("support")) return "support";
  return "customer";
}

export function isStaffTier(tier: RoleTier): boolean {
  return tier !== "customer";
}

export type SidebarLink = { href: string; label: string; icon: string };

const ALL_SIDEBAR_LINKS: SidebarLink[] = [
  { href: "/admin", label: "Overview", icon: "\u{1F4CA}" },
  { href: "/admin/bookings", label: "Bookings", icon: "\u{1F4CB}" },
  { href: "/admin/drivers", label: "Drivers", icon: "\u{1F698}" },
  { href: "/admin/payments", label: "Payments", icon: "\u{1F4B3}" },
  { href: "/admin/refunds", label: "Refunds", icon: "↩" },
  { href: "/admin/ratings", label: "Ratings", icon: "⭐" },
  { href: "/admin/feedback", label: "Feedback", icon: "\u{1F4AC}" },
  { href: "/admin/users", label: "Users & Roles", icon: "\u{1F465}" },
];

const MANAGER_HREFS = new Set(["/admin", "/admin/bookings", "/admin/payments", "/admin/refunds", "/admin/users"]);
const SUPPORT_HREFS = new Set(["/admin/ratings", "/admin/feedback", "/admin/users"]);

export const SIDEBAR_LINKS: Record<RoleTier, SidebarLink[]> = {
  admin: [...ALL_SIDEBAR_LINKS],
  manager: ALL_SIDEBAR_LINKS.filter((l) => MANAGER_HREFS.has(l.href)),
  support: ALL_SIDEBAR_LINKS.filter((l) => SUPPORT_HREFS.has(l.href)).map((l) =>
    l.href === "/admin/users" ? { ...l, label: "Users" } : l,
  ),
  customer: [],
};

export function canAccessRoute(tier: RoleTier, pathname: string): boolean {
  if (tier === "admin") return true;
  const links = SIDEBAR_LINKS[tier];
  return links.some((l) => pathname === l.href || pathname.startsWith(l.href + "/"));
}

export function getDefaultRoute(tier: RoleTier): string {
  if (tier === "customer") return "/auth/account";
  const links = SIDEBAR_LINKS[tier];
  return links[0]?.href ?? "/auth/account";
}

export const DASHBOARD_TITLE: Record<RoleTier, string> = {
  admin: "Admin Dashboard",
  manager: "Manager Dashboard",
  support: "Support Dashboard",
  customer: "",
};
