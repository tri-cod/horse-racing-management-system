import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Seo from '@/components/seo/Seo';
import Reveal from '@/components/ui/Reveal';

const CONTACT_CARDS = [
  {
    Icon: MapPin,
    label: 'Address',
    lines: ['285 W Huntington Dr', 'Arcadia, CA 91007'],
    action: { label: 'Get Directions', href: 'https://maps.google.com/?q=285+W+Huntington+Dr,+Arcadia,+CA+91007' },
  },
  {
    Icon: Phone,
    label: 'Phone',
    lines: ['0326 883 343'],
    action: { label: 'Call Now', href: 'tel:0326883343' },
  },
  {
    Icon: Mail,
    label: 'Email',
    lines: ['RoyalDerbyservice@gmail.com'],
    action: { label: 'Send Email', href: 'mailto:RoyalDerbyservice@gmail.com' },
  },
];

const HOURS = [
  { day: 'Race Days (Sat & Sun)', time: '8:00 AM – 6:00 PM' },
  { day: 'Weekdays', time: '9:00 AM – 5:00 PM' },
  { day: 'Race Office', time: 'Closed Mondays' },
];

export default function ContactPage() {
  return (
    <div>
      <Seo
        title="Contact Us"
        description="Get in touch with Royal Derby's race office — address, phone, email and visiting hours."
      />

      {/* Header band */}
      <section className="border-b border-rim bg-navy">
        <Container className="py-20">
          <p className="eyebrow mb-4 tracking-[0.2em] text-gold">Royal Derby</p>
          <h1 className="max-w-2xl font-serif text-4xl font-bold leading-[1.05] text-on-blue sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-on-blue/70">
            Questions about a race, a ruling, or your account — our race office is happy to help.
          </p>
        </Container>
      </section>

      {/* Contact cards */}
      <section className="bg-surface py-24">
        <Container>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {CONTACT_CARDS.map(({ Icon, label, lines, action }, i) => (
              <Reveal key={label} delay={i * 80}>
                <div className="flex h-full flex-col border border-rim bg-surface-raised p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                    <Icon size={18} />
                  </span>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-4">{label}</p>
                  <div className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-2">
                    {lines.map((l) => <p key={l}>{l}</p>)}
                  </div>
                  <a
                    href={action.href}
                    target={action.href.startsWith('http') ? '_blank' : undefined}
                    rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold transition-colors hover:text-gold-hi"
                  >
                    {action.label} <ArrowRight size={14} />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Hours */}
          <Reveal delay={240} className="mx-auto mt-14 max-w-2xl">
            <div className="flex items-center gap-3 border-b border-rim pb-4">
              <Clock size={18} className="text-gold" />
              <h2 className="font-serif text-xl font-bold text-ink">Visiting Hours</h2>
            </div>
            <ul className="mt-4 divide-y divide-rim">
              {HOURS.map((h) => (
                <li key={h.day} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-ink-3">{h.day}</span>
                  <span className="tnum font-semibold text-ink">{h.time}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      </section>

      {/* CTA band */}
      <section className="bg-navy py-20">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold text-on-blue sm:text-3xl">Looking for race rules instead?</h2>
              <p className="mt-2 max-w-md text-sm text-on-blue/65">
                Registration, betting and prize distribution — all in one place.
              </p>
            </div>
            <Button as={Link} to="/rules" variant="ghost" size="lg" className="shrink-0 !border-on-blue/30 !text-on-blue hover:!bg-on-blue/10">
              View Rules <ArrowRight size={16} />
            </Button>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
