import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/products", label: "Products" },
  { href: "/platform", label: "Platform" },
  { href: "/maisp", label: "MAISP" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/investors", label: "Investors" },
  { href: "/careers", label: "Careers" },
  { href: "/our-story", label: "Our Story" },
  { href: "/upcoming-projects", label: "Upcoming" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/buildvora-logo-transparent.png"
            alt="BuildVora"
            width={438}
            height={129}
            priority
            className="h-[4.25rem] w-auto md:h-[4.75rem]"
          />
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-slate-300 transition hover:text-blue-300">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/investors"
          className="inline-flex rounded-full border border-blue-400 bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-400 sm:px-5"
        >
          <span className="hidden sm:inline">Invest With Us</span>
          <span className="sm:hidden">Invest</span>
        </Link>
      </div>
    </header>
  );
}
