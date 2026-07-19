import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Ruler, Layers, Users, Waves } from 'lucide-react';
import RaceStatusBadge from './RaceStatusBadge';
import type { Race } from '@/types';

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrize(amount?: number) {
  if (!amount) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

function formatDistance(d?: string | number) {
  if (d == null || d === '') return '';
  return typeof d === 'number' ? `${d}m` : d;
}

interface RaceCardProps {
  race: Race;
  isAdmin?: boolean;
}

export default function RaceCard({ race, isAdmin }: RaceCardProps) {
  const distance = formatDistance(race.distance);

  return (
    <div className="group relative overflow-hidden border border-rim bg-surface-raised transition-all duration-200 hover:border-gold/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]">
      {/* Gold top accent */}
      <div className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />

      <Link to={isAdmin ? `/admin/races/${race.id}` : `/races/${race.id}`} className="block">
        {/* Banner */}
        <div className="relative h-40 overflow-hidden bg-navy">
          {race.bannerImageurl ? (
            <img
              src={race.bannerImageurl}
              alt={race.raceName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(168,132,59,0.14),transparent_60%)]" />
          )}

          {/* Status badge */}
          <div className="absolute left-3 top-3">
            <RaceStatusBadge race={race} size="sm" />
          </div>

          {/* Prize pool */}
          {race.totalprizepool != null && (
            <div className="absolute bottom-3 right-3">
              <span className="inline-flex items-center gap-1 bg-gold/90 px-2 py-0.5 text-[11px] font-bold text-navy">
                <Trophy size={10} />{formatPrize(race.totalprizepool)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-4 py-4">
          <h3 className="line-clamp-2 font-serif text-sm font-bold text-ink transition-colors group-hover:text-navy">
            {race.raceName}
          </h3>

          <div className="mt-2 flex gap-4">
            {/* Left column: date + location + condition */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-ink-3">
                <Calendar size={11} className="shrink-0" />{formatDate(race.startTime)}
              </div>
              {race.location && (
                <div className="flex items-center gap-1.5 text-xs text-ink-3">
                  <MapPin size={11} className="shrink-0" /><span className="truncate">{race.location}</span>
                </div>
              )}
              {race.trackCondition && (
                <div className="flex items-center gap-1.5 text-xs text-ink-3">
                  <Waves size={11} className="shrink-0" /><span className="truncate">{race.trackCondition}</span>
                </div>
              )}
            </div>

            {/* Right column: distance + surface + slots */}
            <div className="min-w-0 flex-1 space-y-1">
              {distance && (
                <div className="flex items-center gap-1.5 text-xs text-ink-3">
                  <Ruler size={11} className="shrink-0" />{distance}
                </div>
              )}
              {race.surfaceType && (
                <div className="flex items-center gap-1.5 text-xs text-ink-3">
                  <Layers size={11} className="shrink-0" />{race.surfaceType}
                </div>
              )}
              {race.capacity != null && (
                <div className="flex items-center gap-1.5 text-xs text-ink-3">
                  <Users size={11} className="shrink-0" />{race.capacity} slots
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}