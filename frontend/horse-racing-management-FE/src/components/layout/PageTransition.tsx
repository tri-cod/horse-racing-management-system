import { motion, useReducedMotion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
  const { key } = useLocation();
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={key}
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
