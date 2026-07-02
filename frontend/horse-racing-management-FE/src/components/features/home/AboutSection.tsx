import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';

export default function AboutSection() {
 return (
 <section className="py-32 bg-surface">
 <Container>
 <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
 {/* Text */}
 <Reveal>
 <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">About Royal Derby</p>
 <h2 className="font-serif text-4xl font-bold text-ink sm:text-5xl">
 A World-Class Horse Racing Tournament
 </h2>
 <p className="mt-6 text-base leading-relaxed text-ink-3">
 Royal Derby is a horse racing arena that brings together purebred champions and outstanding jockeys from all over the world.
 Every season is a journey celebrating speed, courage and the spirit of fair competition.
 </p>
 <p className="mt-4 text-base leading-relaxed text-ink-3">
 From thrilling qualifying heats to spectacular finals, Royal Derby delivers a premium experience for spectators,
 owners, trainers and jockeys alike, connecting a community of racing enthusiasts on a modern, transparent management platform.
 </p>
 <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-gold hover:text-gold-hi transition-colors">
 Learn more <ArrowRight size={14} />
 </Link>
 </Reveal>

 {/* Video */}
 <Reveal delay={120} className="relative aspect-[4/3] overflow-hidden border border-rim">
 <video
 src="https://res.cloudinary.com/dxg3w2joa/video/upload/v1782286249/about_jbzsjt.mp4"
 className="h-full w-full object-cover"
 autoPlay loop muted playsInline
 />
 <div className="absolute inset-0 ring-1 ring-inset ring-navy/50 pointer-events-none" />
 </Reveal>
 </div>
 </Container>
 </section>
 );
}
