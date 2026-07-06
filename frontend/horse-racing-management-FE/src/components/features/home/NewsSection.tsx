import { Eye, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import evt1 from '@/assets/img/events/155465add4be157cf3a6f73485c0d4ac.jpg';
import evt2 from '@/assets/img/events/5a2f86ac24877300810fe5994e7e2de3.jpg';
import evt3 from '@/assets/img/events/f85ee7e24a84a66f071927a4dde15e03.jpg';
import evt4 from '@/assets/img/events/fa0e6315489cd530c4fb45579b7442f5.jpg';

const NEWS = [
  { id: 1, title: 'Royal Derby 2026 Officially Kicks Off In July', excerpt: 'The new season promises to bring together the strongest lineup of horses and jockeys ever.', date: '06/01/2026', views: 1280, img: evt1 },
  { id: 2, title: 'Royal Derby Qualifying Round Draw Ceremony', excerpt: 'Top stables will compete from a thrilling group stage onward.', date: '05/28/2026', views: 940, img: evt2 },
  { id: 3, title: 'Jockey Daniel Hayes On His Journey To The Champions Cup', excerpt:"The defending champion opens up about the road ahead this season.", date: '05/20/2026', views: 1530, img: evt3 },
  { id: 4, title: 'Inside The Stables Ahead Of Tournament Day', excerpt: 'A look at the rigorous fitness and nutrition routines behind every champion horse.', date: '05/14/2026', views: 760, img: evt4 },
];

const [FEATURED, ...REST] = NEWS;

export default function NewsSection() {
  return (
    <section className="py-32 bg-navy">
      <Container>
        <SectionHeader title="News & Events"
          subtitle="Stay up to date with the latest stories from the Royal Derby season." invert />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Featured story */}
          <Reveal className="lg:col-span-2">
            <article className="group h-full overflow-hidden rounded-md border border-on-blue/20 bg-on-blue/5 transition hover:border-gold/40 hover:shadow-xl hover:shadow-navy/50">
              <div className="overflow-hidden">
                <img src={FEATURED.img} alt={FEATURED.title} loading="lazy"
                  className="h-64 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-80" />
              </div>
              <div className="p-6">
                <h3 className="mb-2 font-serif text-2xl font-bold leading-snug text-on-blue">{FEATURED.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-on-blue/65">{FEATURED.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-on-blue/40">
                  <span>{FEATURED.date}</span>
                  <span className="flex items-center gap-1"><Eye size={12} />{FEATURED.views}</span>
                </div>
                <div className="mt-3 border-t border-on-blue/15 pt-3">
                  <a href="#" className="flex items-center gap-1 text-xs font-semibold text-gold hover:text-gold-hi transition-colors">
                    Read more <ArrowRight size={11} />
                  </a>
                </div>
              </div>
            </article>
          </Reveal>

          {/* Other stories */}
          <div className="flex flex-col gap-4">
            {REST.map((item, i) => (
              <Reveal key={item.id} delay={(i + 1) * 80}>
                <article className="group flex gap-4 rounded-md border border-on-blue/20 bg-on-blue/5 p-3 transition hover:border-gold/40">
                  <img src={item.img} alt={item.title} loading="lazy"
                    className="h-20 w-20 shrink-0 object-cover transition duration-500 group-hover:scale-105" />
                  <div className="min-w-0">
                    <h3 className="mb-1 line-clamp-2 text-sm font-bold leading-snug text-on-blue">{item.title}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-on-blue/40">
                      <span>{item.date}</span>
                      <span className="flex items-center gap-1"><Eye size={11} />{item.views}</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
