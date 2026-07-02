import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** ms, for staggering siblings (e.g. grid items) */
  delay?: number;
  /** vertical travel distance in px before settling */
  distance?: number;
}

/* Scroll-entrance with spring physics (motion/react). Storytelling: reveals a long
   marketing page's content in sequence as the visitor scrolls, instead of dumping
   everything at once. Honors prefers-reduced-motion via useReducedMotion. */
export default function Reveal({ children, className = '', delay = 0, distance = 28 }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: delay / 1000 }}
    >
      {children}
    </motion.div>
  );
}
