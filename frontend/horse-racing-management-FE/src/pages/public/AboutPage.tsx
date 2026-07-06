import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Seo from '@/components/seo/Seo';
import Reveal from '@/components/ui/Reveal';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 120, damping: 18 } },
};

const STATS = [
  { label: 'Est.', value: '1934' },
  { label: 'Grandstand Capacity', value: '26,000' },
  { label: 'Main Track', value: '1 Mile Dirt' },
  { label: 'Location', value: 'Arcadia, CA' },
];

const OFFICIALS = [
  { role: 'Racing Secretary', desc: 'Writes the conditions and weights for every race on the card.' },
  { role: 'Clerk of Scales', desc: 'Confirms every jockey weighs in correctly before and after the race.' },
  { role: 'Track Superintendent', desc: 'Keeps the dirt oval and turf course safe to run on, rain or shine.' },
];

export default function AboutPage() {
  const reduce = useReducedMotion();
  return (
    <div>
      <Seo
        title="About"
        description="The history, architecture and racing calendar behind Royal Derby's home track in Arcadia, California."
      />

      {/* Hero */}
      <section className="relative -mt-[113px] flex min-h-[78dvh] items-end overflow-hidden">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/9/94/SantaAnitaTrackMtns_wb.jpg"
          alt="Santa Anita Park's dirt oval with the San Gabriel Mountains in the background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/50 to-navy-deep/5" />
        <Container className="relative z-10 pb-16 pt-24">
          <motion.div
            variants={reduce ? undefined : stagger}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? undefined : 'show'}
          >
            <motion.p variants={fadeUp} className="eyebrow mb-5 tracking-[0.2em]">Home of Royal Derby</motion.p>
            <motion.h1 variants={fadeUp} className="max-w-2xl font-serif text-5xl font-bold leading-[1.05] text-on-blue sm:text-6xl lg:text-7xl">
              The Great Race Place
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-xl text-lg leading-relaxed text-on-blue/70">
              Set against the San Gabriel Mountains in Arcadia, California, this is where Royal Derby
              has raced every season since 1934.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-10">
              <Button as={Link} to="/races" variant="primary" size="lg">View Schedule</Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Stats strip */}
      <section className="border-b border-rim bg-surface">
        <Container>
          <div className="grid grid-cols-2 divide-x divide-rim border-x border-rim sm:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 60} className="px-6 py-10 text-center">
                <p className="tnum font-serif text-4xl font-bold text-ink">{s.value}</p>
                <p className="mt-1.5 text-xs uppercase tracking-[0.15em] text-ink-3">{s.label}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* History */}
      <section className="bg-surface py-32">
        <Container>
          <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/71/Grandstand_Picture_015_%284391194230%29.jpg"
                alt="The Art Deco grandstand facade at Santa Anita Park"
                className="h-full w-full rounded-md border border-rim object-cover"
              />
            </Reveal>
            <Reveal delay={120} className="lg:col-span-7">
              <h2 className="font-serif text-3xl font-bold text-ink sm:text-4xl">
                Ninety Years In The Foothills
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-3">
                Dr. Charles Strub opened the gates on Christmas Day, 1934, with an Art Deco
                grandstand built to outlast trends, not just seasons. Nine decades later it still
                frames the same view of the San Gabriel Mountains that greeted the first post
                parade.
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-3">
                The track first hosted the Breeders' Cup in 1986 and has welcomed it back ten
                times since. Royal Derby inherited that stage and that standard, and every Royal
                Derby card runs on the same dirt that carried Seabiscuit to his most famous win.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Track & facilities */}
      <section className="bg-surface-raised py-32">
        <Container>
          <Reveal>
            <h2 className="max-w-xl font-serif text-3xl font-bold text-ink sm:text-4xl">
              Built For Speed, Walked For Tradition
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-3">
              A one-mile dirt oval circles a seven-furlong turf course, and every field still
              parades through the paddock ring before post time, the way it has been done here for
              nine decades.
            </p>
          </Reveal>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Reveal delay={60}>
              <figure className="rounded-md border border-rim">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/35/Track_Picture_013_%284391192632%29.jpg"
                  alt="The main dirt oval at Santa Anita Park"
                  className="h-72 w-full object-cover"
                />
                <figcaption className="border-t border-rim bg-surface px-4 py-3 text-sm text-ink-3">
                  The main track, a one-mile dirt oval.
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={120}>
              <figure className="rounded-md border border-rim">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/9/9c/Paddock_Picture_007_%284390418755%29.jpg"
                  alt="Horses being saddled in the paddock at Santa Anita Park"
                  className="h-72 w-full object-cover"
                />
                <figcaption className="border-t border-rim bg-surface px-4 py-3 text-sm text-ink-3">
                  The paddock, where every field is saddled in public view.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Officials */}
      <section id="team" className="bg-surface py-32">
        <Container>
          <h2 className="font-serif text-3xl font-bold text-ink sm:text-4xl">Who Runs Raceday</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-3">
            Three roles keep every Royal Derby card honest, on time and safe to run.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden border border-rim bg-rim sm:grid-cols-3">
            {OFFICIALS.map((o, i) => (
              <Reveal key={o.role} delay={i * 80} className="bg-surface p-6">
                <h3 className="font-serif text-lg font-bold text-ink">{o.role}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-3">{o.desc}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA band */}
      <section className="bg-navy py-24">
        <Container>
          <Reveal className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-serif text-2xl font-bold text-on-blue sm:text-3xl">
                See It For Yourself This Season
              </h2>
              <p className="mt-2 max-w-md text-sm text-on-blue/65">
                Royal Derby's full Season 2026 calendar runs every week on this track.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button as={Link} to="/races" variant="primary" size="lg">View Schedule</Button>
              <Button
                as="a"
                href="https://maps.google.com/?q=285+W+Huntington+Dr,+Arcadia,+CA+91007"
                target="_blank"
                rel="noopener noreferrer"
                variant="ghost"
                size="lg"
                className="!border-on-blue/30 !text-on-blue hover:!bg-on-blue/10"
              >
                Get Directions <ArrowRight size={16} />
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </div>
  );
}
