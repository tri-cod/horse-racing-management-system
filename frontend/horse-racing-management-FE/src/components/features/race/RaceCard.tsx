import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Pencil, Lock, Trash2, Trophy, Eye } from 'lucide-react';
import RaceStatusBadge from './RaceStatusBadge';
import { updateRace, deleteRace } from '@/api/raceApi';
import { useToast } from '@/components/ui/ToastProvider';
import type { Race } from '@/types';

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrize(amount?: number) {
  if (!amount) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

const CLOSEABLE = new Set(['UPCOMING', 'OPEN_REGISTRATION']);

interface RaceCardProps {
  race: Race;
  isAdmin?: boolean;
  onRefetch?: () => void;
}

export default function RaceCard({ race, isAdmin, onRefetch }: RaceCardProps) {
  const addToast = useToast();
  const [closing, setClosing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCloseRegistration = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm(`Close registration for "${race.raceName}"?`)) return;
    setClosing(true);
    try {
      await updateRace(race.id, { ...race, distance: race.distance?.toString(), status: 'CLOSED_REGISTRATION' });
      addToast(`Registration closed for "${race.raceName}"!`, 'success');
      onRefetch?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      addToast(e?.response?.data?.message ?? 'Failed to close registration.', 'error');
    } finally { setClosing(false); }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm(`Delete race "${race.raceName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteRace(race.id);
      addToast(`Race "${race.raceName}" deleted.`, 'success');
      onRefetch?.();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      addToast(e?.response?.data?.message ?? 'Failed to delete race.', 'error');
    } finally { setDeleting(false); }
  };

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
              className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(168,132,59,0.14),transparent_60%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent" />

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
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-ink-3">
              <Calendar size={11} className="shrink-0" />{formatDate(race.startTime)}
            </div>
            {race.location && (
              <div className="flex items-center gap-1.5 text-xs text-ink-3">
                <MapPin size={11} className="shrink-0" />{race.location}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex items-center gap-0.5 border-t border-rim px-3 py-2">
          <Link
            to={`/admin/races/${race.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:bg-surface-overlay hover:text-navy"
          >
            <Eye size={12} />View
          </Link>
          {CLOSEABLE.has(race.status) && (
            <button
              type="button"
              disabled={closing}
              onClick={handleCloseRegistration}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:bg-warn-subtle hover:text-warn disabled:opacity-50"
            >
              <Lock size={12} />{closing ? '…' : 'Close Reg'}
            </button>
          )}
          <Link
            to={`/admin/races/${race.id}/edit`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:bg-surface-overlay hover:text-gold"
          >
            <Pencil size={12} />Edit
          </Link>
          <button
            type="button"
            disabled={deleting}
            onClick={handleDelete}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-ink-3 transition-colors hover:bg-fail-subtle hover:text-fail disabled:opacity-50"
          >
            <Trash2 size={12} />{deleting ? '…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}