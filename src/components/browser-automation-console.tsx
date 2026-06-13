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
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[264px_1fr]">
        <aside className="border-r border-slate-200 bg-[#0f172a] px-5 py-6 text-slate-100">
          <div className="sticky top-0">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="tech text-[10px] uppercase tracking-[0.28em] text-sky-300">{navTitle}</p>
              <p className="mt-3 text-sm font-semibold text-white">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{summary}</p>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-2">
              <div className="flex items-center justify-between px-2 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Navigation</p>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
                  Live
                </span>
              </div>
              <nav className="mt-1 grid gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-xl px-3 py-3 transition hover:bg-white/8"
                >
                  <p className="text-sm font-semibold text-white">{link.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{link.hint}</p>
                </Link>
              ))}
              </nav>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/92 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-8">
              <div className="min-w-0">
                <p className="tech text-[10px] uppercase tracking-[0.24em] text-sky-700">{eyebrow}</p>
                <h1 className="mt-1 truncate text-[1.35rem] font-semibold tracking-[-0.03em] text-slate-950 md:text-2xl">
                  {title}
                </h1>
                <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-500">{summary}</p>
              </div>
              <div className="hidden items-center gap-2 lg:flex">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Credits-based
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Protected runs
                </span>
              </div>
            </div>
          </header>

          <div className="px-6 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-[1320px]">{children}</div>
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
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.03em] text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{detail}</p>
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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {kicker ? <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{kicker}</p> : null}
      <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-slate-950">{title}</h2>
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
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : tone === "red"
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : tone === "slate"
            ? "border-slate-200 bg-slate-100 text-slate-700"
            : "border-blue-200 bg-[#f1f7ff] text-[#0071e3]";

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${toneClassName}`}>
      {children}
    </span>
  );
}
