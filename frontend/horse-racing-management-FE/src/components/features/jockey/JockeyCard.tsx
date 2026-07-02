import { User } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { Jockey } from '@/types';

interface JockeyCardProps {
  jockey: Jockey;
  index?: number;
  onClick?: (jockey: Jockey) => void;
}

function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { first: '', last: parts[0] };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

export default function JockeyCard({ jockey, onClick }: JockeyCardProps) {
  const { first, last } = splitName(jockey.name);
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="group relative flex h-48 cursor-pointer items-stretch overflow-hidden rounded-md bg-navy p-5 shadow-lg shadow-navy-deep/25"
      onClick={() => onClick?.(jockey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(jockey); } }}
      whileHover={reduce ? undefined : { y: -6 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Name */}
      <div className="relative z-10 flex flex-col justify-center">
        {first && <p className="font-serif text-base font-medium leading-tight text-on-blue/75">{first}</p>}
        <h3 className="font-serif text-2xl font-bold uppercase leading-tight text-on-blue">{last}</h3>
      </div>

      {/* Photo or silhouette */}
      {jockey.avatarUrl ? (
        <img src={jockey.avatarUrl} alt={jockey.name} loading="lazy"
          className="absolute bottom-0 right-0 h-full w-auto object-contain object-bottom opacity-95 transition duration-300 group-hover:scale-105" />
      ) : (
        <User size={110} strokeWidth={0.5} className="pointer-events-none absolute -bottom-3 -right-3 text-on-blue/10" />
      )}
    </motion.div>
  );
}
