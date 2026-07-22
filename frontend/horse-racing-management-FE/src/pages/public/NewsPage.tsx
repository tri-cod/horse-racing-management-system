import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Trophy, Megaphone, ShieldCheck, Coins } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Seo from '@/components/seo/Seo';
import Reveal from '@/components/ui/Reveal';

type BadgeVariant = 'ocean' | 'warning' | 'danger' | 'neutral' | 'dark';

interface NewsItem {
  date: string;
  tag: string;
  tagVariant: BadgeVariant;
  Icon: typeof Trophy;
  title: string;
  excerpt: string;
  image: string;
}

const FEATURED: NewsItem = {
  date: 'March 2026',
  tag: 'Season',
  tagVariant: 'warning',
  Icon: Megaphone,
  title: 'Season 2026 Officially Underway',
  excerpt: 'Registration is open across the calendar for Season 2026. Horse owners can now enter their stable into any race with open registration and book a jockey ahead of race day — the busiest opening slate the track has run yet.',
  image: 'https://upload.wikimedia.org/wikipedia/commons/9/94/SantaAnitaTrackMtns_wb.jpg',
};

const NEWS: NewsItem[] = [
  {
    date: 'February 2026',
    tag: 'Rule Update',
    tagVariant: 'ocean',
    Icon: ShieldCheck,
    title: 'Mandatory Pre-Race Inspection Now In Effect',
    excerpt: 'Every race now requires the assigned referee to run a clean pre-race inspection before it can start — checking horse fitness, jockey assignments and odds before the gates open.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Paddock_Picture_007_%284390418755%29.jpg',
  },
  {
    date: 'January 2026',
    tag: 'Betting',
    tagVariant: 'dark',
    Icon: Coins,
    title: 'Betting Windows Now Open Right Up To Post Time',
    excerpt: 'Wagers are accepted the moment odds are set and stay open until the race starts, with payouts calculated automatically as soon as results are recorded.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Grandstand_Picture_015_%284391194230%29.jpg',
  },
  {
    date: 'December 2025',
    tag: 'Recap',
    tagVariant: 'neutral',
    Icon: Trophy,
    title: 'A Record Season Closes At Royal Derby',
    excerpt: 'Season 2025 wrapped with its largest field sizes yet, as more stables than ever brought horses to the track across the full calendar.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Track_Picture_013_%284391192632%29.jpg',
  },
];

export default function NewsPage() {
  return (
    <div>
      <Seo
        title="News"
        description="The latest announcements, rule updates and season recaps from Royal Derby."
      />

      {/* Header band */}
      <section className="border-b border-rim bg-navy">
        <Container className="py-20">
          <p className="eyebrow mb-4 tracking-[0.2em] text-gold">Royal Derby</p>
          <h1 className="max-w-2xl font-serif text-4xl font-bold leading-[1.05] text-on-blue sm:text-5xl">
            News &amp; Announcements
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-on-blue/70">
            What's changed at the track — season updates, rule changes and race recaps.
          </p>
        </Container>
      </section>

      {/* Featured story */}
      <section className="bg-surface pt-16">
        <Container>
          <Reveal>
            <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-4">Latest Story</p>
            <article className="group relative overflow-hidden rounded-md border border-rim">
              <div className="relative h-[420px] w-full sm:h-[460px]">
                <img
                  src={FEATURED.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/60 to-transparent" />
                <div className="relative z-10 flex h-full flex-col justify-end p-8 sm:p-12">
                  <div className="flex items-center gap-3">
                    <Badge variant={FEATURED.tagVariant} size="md">
                      <FEATURED.Icon size={12} /> {FEATURED.tag}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs font-medium text-on-blue/60">
                      <Calendar size={12} /> {FEATURED.date}
                    </span>
                  </div>
                  <h2 className="mt-4 max-w-2xl font-serif text-3xl font-bold leading-tight text-on-blue sm:text-4xl">
                    {FEATURED.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-on-blue/70 sm:text-base">
                    {FEATURED.excerpt}
                  </p>
                </div>
              </div>
            </article>
          </Reveal>
        </Container>
      </section>

      {/* More news grid */}
      <section className="bg-surface py-16 sm:py-20">
        <Container>
          <p className="mb-5 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-4">More News</p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {NEWS.map(({ date, tag, tagVariant, Icon, title, excerpt, image }, i) => (
              <Reveal key={title} delay={i * 80}>
                <article className="group flex h-full flex-col overflow-hidden rounded-md border border-rim bg-surface-raised transition-shadow hover:shadow-card">
                  <div className="relative h-44 w-full overflow-hidden">
                    <img
                      src={image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      <Badge variant={tagVariant} size="sm">
                        <Icon size={11} /> {tag}
                      </Badge>
                      <span className="flex items-center gap-1 text-[11px] text-ink-4">
                        <Calendar size={10} /> {date}
                      </span>
                    </div>
                    <h3 className="mt-3 font-serif text-lg font-bold leading-snug text-ink transition-colors group-hover:text-gold-hi">
                      {title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-3">{excerpt}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA band */}
      <section className="bg-navy py-20">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold text-on-blue sm:text-3xl">Catch the next race live</h2>
              <p className="mt-2 max-w-md text-sm text-on-blue/65">
                Check the full Season 2026 calendar and see what's coming up.
              </p>
            </div>
            <Button as={Link} to="/races" variant="primary" size="lg" className="shrink-0">
              View Schedule <ArrowRight size={16} />
            </Button>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
