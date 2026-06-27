import { useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Target } from 'lucide-react';
import Seo from '../../components/seo/Seo';
import { AuthContext } from '../../context/AuthContext';
import { useRaceDetail } from '../../hooks/queries/useRaceDetail';
import { useToast } from '../../components/ui/ToastProvider';
import { useHorsesByRace } from '../../hooks/queries/useHorsesByRace';
import RaceStatusBadge from '../../components/race/RaceStatusBadge';
import RaceMetaStrip from '../../components/race/RaceMetaStrip';
import RaceInfoSection from '../../components/race/RaceInfoSection';
import RegisteredHorsesList from '../../components/race-horse/RegisteredHorsesList';
import PlaceBetModal from '../../components/bet/PlaceBetModal';
import RaceResultSection from '../../components/race/RaceResultSection';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Button from '../../components/ui/Button';
import '../../assets/css/RaceDetailPage.css';

export default function RaceDetailPage() {
  const { id }    = useParams();
  const { user }  = useContext(AuthContext);
  const addToast  = useToast();
  const { race, loading, error, refetch } = useRaceDetail(id);
  const { entries: raceHorses } = useHorsesByRace(id);

  const [showBetModal, setShowBetModal] = useState(false);

  /* inject JSON-LD via effect to avoid React 19 script-hoisting issues */
  useEffect(() => {
    if (!race) return;
    const id_ld = `race-ld-${race.id}`;
    if (document.getElementById(id_ld)) return;
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.id   = id_ld;
    s.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: race.raceName,
      ...(race.startTime ? { startDate: race.startTime } : {}),
      ...(race.location  ? { location: { '@type': 'Place', name: race.location } } : {}),
      sport: 'Horse racing',
    });
    document.head.appendChild(s);
    return () => document.getElementById(id_ld)?.remove();
  }, [race]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (error)   return (
    <div className="race-detail-page__error">
      <p>{error}</p>
      <Button variant="outline" onClick={refetch}>Try Again</Button>
    </div>
  );
  if (!race) return null;

  const isUser  = user?.role === 'USER' || user?.role === 'SPECTATOR';
  const canBet  = isUser && race.status === 'CLOSED_REGISTRATION';

  return (
    <div className="race-detail-page">
      <Seo
        title={race.raceName}
        description={`${race.raceName} — ${race.location ?? 'Royal Derby'}`}
        type="article"
      />

      {/* Banner */}
      <div className="race-detail-page__banner">
        {race.bannerImageurl ? (
          <img src={race.bannerImageurl} alt={race.raceName} className="race-detail-page__banner-img" />
        ) : (
          <div className="race-detail-page__banner-placeholder" />
        )}
        <div className="race-detail-page__banner-overlay">
          <div className="race-detail-page__banner-content">
            <h1 className="race-detail-page__title">{race.raceName}</h1>
          </div>
        </div>
      </div>

      <RaceMetaStrip race={race} />

      <div className="race-detail-page__body">
        {/* Status + Bet button only */}
        <div className="race-detail-page__actions">
          <RaceStatusBadge race={race} size="lg" />
          {canBet && (
            <div className="race-detail-page__actions-btns">
              <Button variant="primary" onClick={() => setShowBetModal(true)}>
                <Target size={16} /> Place Bet
              </Button>
            </div>
          )}
        </div>

        <RaceInfoSection race={race} />

        <section className="race-detail-page__entries">
          <h2>Registered Horses</h2>
          <RegisteredHorsesList
            raceId={id}
            isAdmin={false}
            onToast={(msg, type) => addToast(msg, type ?? 'success')}
          />
        </section>

        {race.status === 'FINISHED' && <RaceResultSection raceId={id} />}
      </div>

      <PlaceBetModal
        open={showBetModal}
        onClose={() => setShowBetModal(false)}
        race={race}
        raceHorses={raceHorses}
        onSuccess={() => addToast('Bet placed successfully!', 'success')}
      />
    </div>
  );
}
