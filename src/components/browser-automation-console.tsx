import Link from "next/link";

type NavLink = {
  href: string;
  label: string;
  hint: string;
};

export function ConsoleShell({
  eyebrow,
  title,
  summary,
  navTitle,
  navLinks,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  navTitle: string;
  navLinks: NavLink[];
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#08101b] text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(13,22,36,0.98),rgba(10,16,28,0.94))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
            <p className="tech text-[10px] uppercase tracking-[0.28em] text-cyan-200">{navTitle}</p>
            <div className="mt-4 rounded-[1.6rem] border border-cyan-400/20 bg-cyan-400/8 p-4">
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{summary}</p>
            </div>
            <nav className="mt-5 grid gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-[1.25rem] border border-white/10 bg-white/4 px-4 py-3 transition hover:border-cyan-300/35 hover:bg-cyan-300/8"
                >
                  <p className="text-sm font-semibold text-white">{link.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{link.hint}</p>
                </Link>
              ))}
            </nav>
          </aside>
          <div>
            <div className="rounded-[2.2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(13,19,31,0.98),rgba(9,13,22,0.96))] p-6 shadow-[0_28px_120px_rgba(0,0,0,0.34)] md:p-8">
              <p className="tech text-[10px] uppercase tracking-[0.3em] text-[#d7b26f]">{eyebrow}</p>
              <h1 className="editorial mt-3 text-4xl text-white md:text-6xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">{summary}</p>
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </main>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[1.7rem] border border-white/10 bg-white/6 p-5 shadow-[0_14px_45px_rgba(0,0,0,0.18)]">
      <p className="tech text-[10px] uppercase tracking-[0.24em] text-cyan-200">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{detail}</p>
    </article>
  );
}

export function Panel({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.2)]">
      {kicker ? <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#d7b26f]">{kicker}</p> : null}
      <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function StatusPill({
  tone,
  children,
}: {
  tone: "blue" | "green" | "amber" | "red" | "slate";
  children: React.ReactNode;
}) {
  const toneClassName =
    tone === "green"
      ? "border-emerald-300/30 bg-emerald-400/14 text-emerald-100"
      : tone === "amber"
        ? "border-amber-300/30 bg-amber-400/16 text-amber-100"
        : tone === "red"
          ? "border-rose-300/30 bg-rose-400/16 text-rose-100"
          : tone === "slate"
            ? "border-slate-400/30 bg-slate-500/10 text-slate-200"
            : "border-cyan-300/30 bg-cyan-400/14 text-cyan-100";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${toneClassName}`}>
      {children}
    </span>
  );
}
