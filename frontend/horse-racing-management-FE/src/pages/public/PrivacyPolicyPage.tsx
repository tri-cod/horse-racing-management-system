import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Seo from '@/components/seo/Seo';
import Reveal from '@/components/ui/Reveal';

// Matches Layout.tsx's fixed header height — sections need to clear it when jumped to.
const HEADER_HEIGHT = 109;
const SCROLL_OFFSET = HEADER_HEIGHT + 24;

interface PolicySection {
  id: string;
  title: string;
  points: string[];
}

const SECTIONS: PolicySection[] = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    points: [
      'Account details you provide at registration — full name, username, email address, phone number, and password.',
      'Profile information for horses, jockeys, trainers and horse owners, including uploaded photos and biographical details.',
      'Wallet and transaction records — deposits, withdrawals, bets placed, and race entry fees.',
      'Bank account details you submit for withdrawal requests, used solely to process your payout.',
    ],
  },
  {
    id: 'how-we-use-it',
    title: 'How We Use Your Information',
    points: [
      'To operate your account — race registrations, bets, wallet balance, and notifications.',
      'To verify identity and eligibility before processing deposits and withdrawals.',
      'To communicate updates about races, results, penalties and account activity.',
      'To maintain the integrity of racing and betting — including detecting rule violations.',
    ],
  },
  {
    id: 'data-sharing',
    title: 'Data Sharing',
    points: [
      'We do not sell your personal information to third parties.',
      'Bank account details are used only to process withdrawal payouts and are never shared beyond what is required to complete the transfer.',
      'Public profile information (horse, jockey, trainer, horse owner pages) is visible to any visitor by design — avoid including sensitive personal data in public-facing bios.',
    ],
  },
  {
    id: 'cookies-sessions',
    title: 'Cookies & Sessions',
    points: [
      'We use session tokens to keep you signed in between visits.',
      'No third-party advertising or tracking cookies are used on this platform.',
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    points: [
      'Passwords are stored using one-way encryption and are never visible to our staff.',
      'Access to wallet and banking data is restricted to the systems that process deposits and withdrawals.',
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    points: [
      'You can review and update your profile information at any time from your account settings.',
      'You may request deletion of your account by contacting our race office — some records (e.g. financial transaction history) may be retained as required for auditing.',
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

export default function PrivacyPolicyPage() {
  const ids = SECTIONS.map((s) => s.id);
  const active = useScrollSpy(ids);

  return (
    <div>
      <Seo
        title="Privacy Policy"
        description="How Royal Derby collects, uses and protects your personal information."
      />

      {/* Hero */}
      <section className="border-b border-rim bg-navy">
        <Container className="py-20">
          <p className="eyebrow mb-4 flex items-center gap-2 tracking-[0.2em] text-gold">
            <ShieldCheck size={14} /> Royal Derby
          </p>
          <h1 className="max-w-2xl font-serif text-4xl font-bold leading-[1.05] text-on-blue sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-on-blue/70">
            What information we collect, why we collect it, and how it's kept safe.
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
                        {s.points.map((p) => (
                          <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-ink-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
                            {p}
                          </li>
                        ))}
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
              <h2 className="font-serif text-2xl font-bold text-on-blue sm:text-3xl">Questions about your data?</h2>
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
