import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Seo from '@/components/seo/Seo';
import Reveal from '@/components/ui/Reveal';

// Matches Layout.tsx's fixed header height — sections need to clear it when jumped to.
const HEADER_HEIGHT = 109;
const SCROLL_OFFSET = HEADER_HEIGHT + 24;

interface TermsSection {
  id: string;
  title: string;
  points: string[];
  /** Appended after the last point as inline links, e.g. a reference to the Rules page. */
  trailingLink?: { to: string; label: string };
}

const SECTIONS: TermsSection[] = [
  {
    id: 'account-eligibility',
    title: 'Account & Eligibility',
    points: [
      'You must provide accurate information when registering and keep your account credentials confidential.',
      'One account per person — creating multiple accounts to circumvent platform rules is prohibited.',
      'Accounts found in violation of these terms may be suspended or banned at the platform\'s discretion.',
    ],
  },
  {
    id: 'wallet-deposits-withdrawals',
    title: 'Wallet, Deposits & Withdrawals',
    points: [
      'Wallet balances reflect funds deposited, wagered, won, or charged as entry fees and penalties within the platform.',
      'Withdrawal requests are reviewed and processed to the bank account you provide — please ensure your bank details are correct.',
      'All wagers are final once placed and cannot be edited or cancelled after submission.',
    ],
  },
  {
    id: 'racing-betting-rules',
    title: 'Racing & Betting Rules',
    points: [
      'Race registration, pre-race inspection, penalties and prize distribution follow the rules published on our',
    ],
    trailingLink: { to: '/rules', label: 'Rules & Regulations page' },
  },
  {
    id: 'prohibited-conduct',
    title: 'Prohibited Conduct',
    points: [
      'Attempting to manipulate race outcomes, odds, or results.',
      'Abusing the platform\'s wallet, betting, or registration systems (including exploiting bugs for financial gain).',
      'Harassing other users, referees, or staff.',
    ],
  },
  {
    id: 'limitation-of-liability',
    title: 'Limitation of Liability',
    points: [
      'The platform is provided "as is" — we work to keep races, odds and results accurate but do not guarantee uninterrupted availability.',
      'We are not liable for losses arising from wagers placed, market conditions, or account actions taken in violation of these terms.',
    ],
  },
  {
    id: 'changes-to-terms',
    title: 'Changes to These Terms',
    points: [
      'We may update these terms from time to time. Continued use of the platform after changes take effect constitutes acceptance of the revised terms.',
    ],
  },
];

function useScrollSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: `-${SCROLL_OFFSET}px 0px -70% 0px`, threshold: 0 },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join(',')]);
  return active;
}

function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
  window.scrollTo({ top, behavior: 'smooth' });
}

export default function TermsPage() {
  const ids = SECTIONS.map((s) => s.id);
  const active = useScrollSpy(ids);

  return (
    <div>
      <Seo
        title="Terms of Service"
        description="The terms governing your use of Royal Derby's racing and betting platform."
      />

      {/* Hero */}
      <section className="border-b border-rim bg-navy">
        <Container className="py-20">
          <p className="eyebrow mb-4 flex items-center gap-2 tracking-[0.2em] text-gold">
            <FileCheck size={14} /> Royal Derby
          </p>
          <h1 className="max-w-2xl font-serif text-4xl font-bold leading-[1.05] text-on-blue sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-on-blue/70">
            The terms and conditions that govern your use of Royal Derby.
          </p>
          <p className="mt-4 inline-block rounded-full border border-on-blue/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-on-blue/50">
            Last updated: January 2026
          </p>
        </Container>
      </section>

      {/* Document body — sticky table of contents + numbered sections */}
      <section className="bg-surface py-20">
        <Container>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[240px_1fr]">
            {/* Table of contents */}
            <aside className="hidden lg:block">
              <div className="sticky" style={{ top: SCROLL_OFFSET }}>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-ink-4">Contents</p>
                <nav className="flex flex-col gap-0.5 border-l border-rim">
                  {SECTIONS.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => jumpTo(s.id)}
                      className={`-ml-px flex items-start gap-2.5 border-l-2 py-1.5 pl-4 text-left text-sm transition-colors ${
                        active === s.id ? 'border-gold text-ink font-semibold' : 'border-transparent text-ink-4 hover:text-ink-2'
                      }`}
                    >
                      <span className="tnum shrink-0 text-xs">{String(i + 1).padStart(2, '0')}</span>
                      {s.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Document card */}
            <div className="border border-rim bg-surface-raised shadow-card">
              <div className="flex flex-col divide-y divide-rim">
                {SECTIONS.map((s, i) => (
                  <Reveal key={s.id} delay={i * 40}>
                    <section id={s.id} className="px-7 py-9 sm:px-10" style={{ scrollMarginTop: SCROLL_OFFSET }}>
                      <div className="flex items-baseline gap-3">
                        <span className="font-serif text-2xl font-bold text-gold/50">{String(i + 1).padStart(2, '0')}</span>
                        <h2 className="font-serif text-xl font-bold text-ink sm:text-2xl">{s.title}</h2>
                      </div>
                      <ul className="mt-5 space-y-3 pl-1">
                        {s.points.map((p, pi) => {
                          const isLast = pi === s.points.length - 1;
                          return (
                            <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-ink-2">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                              <span>
                                {p}
                                {isLast && s.trailingLink && (
                                  <>
                                    {' '}
                                    <Link to={s.trailingLink.to} className="font-semibold text-gold hover:text-gold-hi">
                                      {s.trailingLink.label}
                                    </Link>
                                    .
                                  </>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-navy py-20">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold text-on-blue sm:text-3xl">Questions about these terms?</h2>
              <p className="mt-2 max-w-md text-sm text-on-blue/65">
                Reach out and our race office will help.
              </p>
            </div>
            <Button as={Link} to="/contact" variant="primary" size="lg" className="shrink-0">
              Contact Us <ArrowRight size={16} />
            </Button>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
