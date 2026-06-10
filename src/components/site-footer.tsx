import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/maisp", label: "MAISP Hub" },
  { href: "/investors", label: "Investors" },
  { href: "/careers", label: "Careers" },
  { href: "/our-story", label: "Our Story" },
  { href: "/upcoming-projects", label: "Upcoming Projects" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-800 bg-black px-6 py-12 md:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <p className="tech text-xs uppercase tracking-[0.2em] text-blue-300">BuildVora</p>
          <p className="mt-3 max-w-sm text-sm text-slate-400">
            AI-native SaaS portfolio engineered for measurable outcomes across CRM, SEO, marketing, operations, and
            investor-focused growth systems.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Image
              src="/vora-avatar.png"
              alt="Vora avatar"
              width={48}
              height={48}
              className="rounded-full border border-blue-500/40 object-cover"
            />
            <Image
              src="/vora-avatar-alt.png"
              alt="Vora alternate avatar"
              width={48}
              height={48}
              className="rounded-full border border-blue-500/40 object-cover"
            />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Navigation</p>
          <ul className="mt-3 space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-slate-400 transition hover:text-blue-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-300">Contact</p>
          <a href="mailto:hello@felixcrego.com" className="mt-3 block text-sm text-slate-400 hover:text-blue-300">
            hello@felixcrego.com
          </a>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-blue-300">Partner Ecosystem</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-700 bg-black/35 px-3 py-1 text-xs text-slate-400">Microsoft for Startups Founders Hub Member</span>
            <span className="rounded-full border border-slate-700 bg-black/35 px-3 py-1 text-xs text-slate-400">Google Cloud Partner Advantage Network</span>
            <span className="rounded-full border border-slate-700 bg-black/35 px-3 py-1 text-xs text-slate-400">OpenAI Deployment Partner Ecosystem</span>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            © {new Date().getFullYear()} BuildVora. Systems. Search. Software. Scale.
          </p>
        </div>
      </div>
    </footer>
  );
}
