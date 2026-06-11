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
    <main className="min-h-screen bg-[#fbfbfd] text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10 md:px-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <p className="tech text-[10px] uppercase tracking-[0.28em] text-[#0071e3]">{navTitle}</p>
            <div className="mt-4 rounded-[1.6rem] border border-slate-200 bg-[#f5f5f7] p-4">
              <p className="text-sm font-semibold text-slate-950">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{summary}</p>
            </div>
            <nav className="mt-5 grid gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3 transition hover:border-[#0071e3]/25 hover:bg-[#f5f9ff]"
                >
                  <p className="text-sm font-semibold text-slate-950">{link.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{link.hint}</p>
                </Link>
              ))}
            </nav>
          </aside>
          <div>
            <div className="rounded-[2.4rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
              <p className="tech text-[10px] uppercase tracking-[0.3em] text-[#0071e3]">{eyebrow}</p>
              <h1 className="editorial mt-3 text-4xl tracking-[-0.04em] text-slate-950 md:text-6xl">{title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">{summary}</p>
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
    <article className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
      <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
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
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      {kicker ? <p className="tech text-[10px] uppercase tracking-[0.24em] text-[#0071e3]">{kicker}</p> : null}
      <h2 className="mt-2 text-2xl font-semibold text-slate-950">{title}</h2>
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
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] ${toneClassName}`}>
      {children}
    </span>
  );
}
