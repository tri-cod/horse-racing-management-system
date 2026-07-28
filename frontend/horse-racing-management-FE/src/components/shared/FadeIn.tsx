import { motion, useReducedMotion, type Variants } from 'motion/react';
import type { ReactNode } from 'react';

/* Entrance motion is purely hierarchical: it walks the eye down a section in the
   order the content should be read. Under prefers-reduced-motion that job is
   already done by source order, so the stagger and the travel both collapse to
   nothing and the content simply appears. */

export function FadeInStagger({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.06 } },
  };

  return (
    <motion.div className={className} initial="hidden" animate="show" variants={containerVariants}>
      {children}
    </motion.div>
  );
}

export function FadeInItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.32, ease: 'easeOut' } },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
