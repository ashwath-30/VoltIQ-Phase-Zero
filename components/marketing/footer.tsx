import Link from "next/link";
import { Zap, Twitter, Linkedin, Github } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-display text-lg font-bold">VoltIQX</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              AI-powered home energy auditing that helps you understand and lower your bill.
            </p>
            <div className="mt-4 flex gap-3 text-muted-foreground">
              <a href="#" aria-label="Twitter" className="hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:text-foreground">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" aria-label="GitHub" className="hover:text-foreground">
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="font-display text-sm font-semibold">{section}</p>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} VoltIQX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
