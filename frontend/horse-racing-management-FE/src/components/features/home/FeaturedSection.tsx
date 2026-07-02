import { useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Container from '@/components/ui/Container';
import Reveal from '@/components/ui/Reveal';

const HORSES = [
 { id: 1, name: 'Ocean Thunder', breed: 'Thoroughbred', age: 5, trainer: 'James Wilder' },
 { id: 2, name: 'Royal Tempest', breed: 'Andalusian', age: 7, trainer: 'Elena Cruz' },
 { id: 3, name: 'Midnight Comet', breed: 'Arabian', age: 4, trainer: 'Marcus Bell' },
 { id: 4, name: 'Silver Mirage', breed: 'Akhal-Teke', age: 6, trainer: 'Sophia Reed' },
 { id: 5, name: 'Storm Chaser', breed: 'Thoroughbred', age: 5, trainer: 'Daniel Hayes' },
 { id: 6, name: 'Golden Horizon', breed: 'Quarter Horse', age: 8, trainer: 'Olivia Grant' },
];

const JOCKEYS = [
 { id: 1, name: 'Marcus Bell', years: 9 },
 { id: 2, name: 'Sophia Reed', years: 6 },
 { id: 3, name: 'Daniel Hayes', years: 12 },
 { id: 4, name: 'Olivia Grant', years: 5 },
 { id: 5, name: 'James Wilder', years: 8 },
 { id: 6, name: 'Elena Cruz', years: 4 },
];

const PREVIEW = 6;

const thCls = 'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-on-blue/50';
const tdCls = 'px-4 py-3.5 text-sm text-on-blue/75';

export default function FeaturedSection() {
 const [tab, setTab] = useState<'horses' | 'jockeys'>('horses');
 const [showAll, setShowAll] = useState(false);
 const reduce = useReducedMotion();

 const horses = showAll ? HORSES : HORSES.slice(0, PREVIEW);
 const jockeys = showAll ? JOCKEYS : JOCKEYS.slice(0, PREVIEW);

 return (
 <section className="bg-navy">
 <div className="border-b border-on-blue/15">
 <Container>
 <div className="flex items-center justify-between py-6">
 <h2 className="font-serif text-3xl font-bold text-on-blue sm:text-4xl">Leaderboard</h2>
 <div className="flex rounded-md border border-on-blue/20 p-1">
 {(['horses', 'jockeys'] as const).map((t) => (
 <button key={t} type="button"
 className={`rounded px-5 py-2 text-sm font-medium capitalize tracking-wide transition-colors ${tab === t ? 'bg-gold text-on-gold' : 'text-on-blue/60 hover:text-on-blue'}`}
 onClick={() => { setTab(t); setShowAll(false); }}>
 {t}
 </button>
 ))}
 </div>
 </div>
 </Container>
 </div>

 <Container className="py-14">
 <Reveal>
 <div className="overflow-hidden rounded-md border border-on-blue/20">
 <table className="w-full">
 <thead className="bg-on-blue/5">
 <tr>
 <th className={thCls}>Pos.</th>
 <th className={thCls}>{tab === 'horses' ? 'Horse' : 'Jockey'}</th>
 {tab === 'horses' && <>
 <th className={thCls}>Breed</th>
 <th className={thCls}>Age</th>
 <th className={thCls}>Trainer</th>
 </>}
 {tab === 'jockeys' && <th className={thCls}>Experience</th>}
 </tr>
 </thead>
 <AnimatePresence mode="wait">
 <motion.tbody key={tab} className="divide-y divide-on-blue/10"
 initial={reduce ? false : { opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={reduce ? {} : { opacity: 0, y: -8 }}
 transition={{ duration: 0.2 }}>
 {tab === 'horses' ? horses.map((h, idx) => (
 <tr key={h.id} className="transition hover:bg-on-blue/5">
 <td className={`${tdCls} w-12`}>
 <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? 'bg-gold text-on-gold' : 'bg-on-blue/10 text-on-blue/50'}`}>{idx + 1}</span>
 </td>
 <td className={`${tdCls} font-medium text-on-blue`}>{h.name}</td>
 <td className={tdCls}>{h.breed}</td>
 <td className={tdCls}>{h.age} yrs</td>
 <td className={tdCls}>{h.trainer}</td>
 </tr>
 )) : jockeys.map((j, idx) => (
 <tr key={j.id} className="transition hover:bg-on-blue/5">
 <td className={`${tdCls} w-12`}>
 <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? 'bg-gold text-on-gold' : 'bg-on-blue/10 text-on-blue/50'}`}>{idx + 1}</span>
 </td>
 <td className={tdCls}>
 <div className="flex items-center gap-2.5">
 <div className="flex h-7 w-7 items-center justify-center rounded-full bg-on-blue/15 text-on-blue/70"><User size={14} /></div>
 <span className="font-medium text-on-blue">{j.name}</span>
 </div>
 </td>
 <td className={tdCls}>{j.years} yrs experience</td>
 </tr>
 ))}
 </motion.tbody>
 </AnimatePresence>
 </table>
 </div>

 <div className="mt-5 text-center">
 <button type="button" onClick={() => setShowAll((p) => !p)}
 className="inline-flex items-center gap-1.5 text-sm font-medium text-on-blue/50 hover:text-gold transition-colors">
 {showAll ? 'Show less' : 'Show all'}
 <ChevronDown size={15} className={`transition-transform ${showAll ? 'rotate-180' : ''}`} />
 </button>
 </div>
 </Reveal>
 </Container>
 </section>
 );
}
