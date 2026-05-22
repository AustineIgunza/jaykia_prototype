import Link from "next/link";
import { GoldDivider } from "@/components/ui/gold-divider";

const footerLinks = {
  services: [
    { href: "/services", label: "Airport Transfers" },
    { href: "/book", label: "Book Now" },
    { href: "/policies", label: "Policies" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
  ],
};

function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <span className="font-display text-2xl font-bold text-accent">
              JayKia
            </span>
            <p className="mt-3 text-sm text-muted leading-relaxed max-w-xs">
              Premium executive airport transfers at JKIA, Nairobi.
              Arrive happy, travel free.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
              Services
            </h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-light hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">
              Company
            </h4>
            <ul className="flex flex-col gap-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-light hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* TODO: replace with real contact details from env vars */}
            <div className="mt-4 text-sm text-muted">
              <p>{process.env.NEXT_PUBLIC_CONTACT_PHONE || "+254 700 000 000"}</p>
              <p>{process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@jaykia.co.ke"}</p>
            </div>
          </div>
        </div>

        <GoldDivider className="my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} JayKia. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/policies" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/policies" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
