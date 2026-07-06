import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';

interface AuthSplitLayoutProps {
 children: ReactNode;
 /** Wider form column for multi-field / multi-column steps (e.g. Register's role grid). */
 wide?: boolean;
}

/* Shared brand video panel used on Login / Register / Forgot Password.
 Reuses the same Cloudinary hero footage as the homepage hero for brand consistency. */
function BrandPanel({ compact = false }: { compact?: boolean }) {
 const reduce = useReducedMotion();
 return (
 <div className={`relative overflow-hidden bg-navy ${compact ? 'h-44' : 'h-full'}`}>
 <motion.video
 src="https://res.cloudinary.com/dxg3w2joa/video/upload/v1782285815/hero_hisssl.mp4"
 className="absolute inset-0 h-full w-full object-cover"
 autoPlay loop muted playsInline aria-hidden="true"
 initial={reduce ? false : { scale: 1.08 }}
 animate={{ scale: 1 }}
 transition={{ duration: 14, ease: 'linear' }}
 />
 <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/55 to-navy-deep/30" />
 <div className="pointer-events-none absolute inset-0" style={{
 backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 28px, rgba(168,132,59,0.045) 28px, rgba(168,132,59,0.045) 29px)'
 }} />

 <div className={`relative z-10 flex h-full flex-col ${compact ? 'justify-center px-6' : 'justify-between p-12'}`}>
 <motion.div
 className={`flex items-center ${compact ? 'gap-3' : 'justify-between'}`}
 initial={reduce ? false : { opacity: 0, y: -12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ type: 'spring', stiffness: 140, damping: 18 }}
 >
 <Link to="/">
 <img src="/logopage.png" alt="Royal Derby" className={compact ? 'h-8 object-contain' : 'h-10 object-contain'} />
 </Link>
 {!compact && <p className="text-xs text-on-blue/40">Season {new Date().getFullYear()}</p>}
 </motion.div>

 {!compact && (
 <motion.div
 initial={reduce ? false : { opacity: 0, y: 24 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.15 }}
 >
 <p className="eyebrow mb-4 tracking-[0.2em]">Royal Derby</p>
 <h1 className="font-serif text-5xl font-bold leading-[1.05] text-on-blue lg:text-6xl">
 Glory On<br />
 <em className="not-italic text-gold">The Racetrack</em>
 </h1>
 <p className="mt-4 max-w-sm text-sm leading-relaxed text-on-blue/65">
 Where the proudest steeds and the most talented jockeys come together to compete in
 Royal Derby, a world-class horse racing tournament.
 </p>
 </motion.div>
 )}

 </div>
 </div>
 );
}

export default function AuthSplitLayout({ children, wide = false }: AuthSplitLayoutProps) {
 const reduce = useReducedMotion();
 return (
 <div className="grid min-h-[100dvh] lg:grid-cols-2">
 {/* Desktop brand panel */}
 <div className="hidden lg:block">
 <BrandPanel />
 </div>

 {/* Mobile compact banner */}
 <div className="lg:hidden">
 <BrandPanel compact />
 </div>

 {/* Form panel */}
 <div className="flex flex-1 items-center justify-center bg-surface px-8 py-16 sm:px-12">
 <motion.div
 className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'}`}
 initial={reduce ? false : { opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ type: 'spring', stiffness: 130, damping: 18, delay: 0.1 }}
 >
 {children}
 <div className="mt-8 flex justify-center gap-5 text-xs text-ink-4">
 <a href="#" className="hover:text-ink-2 transition-colors">Privacy</a>
 <a href="#" className="hover:text-ink-2 transition-colors">Terms</a>
 <a href="#" className="hover:text-ink-2 transition-colors">Contact</a>
 </div>
 </motion.div>
 </div>
 </div>
 );
}
