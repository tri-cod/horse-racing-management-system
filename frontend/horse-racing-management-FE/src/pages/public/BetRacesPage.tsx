import Seo from '@/components/seo/Seo';
import BetBoard from '@/components/features/bet/BetBoard';

export default function BetRacesPage() {
  return (
    <>
      <Seo title="Wagering Board" description="Browse races, study the odds, and place your wagers on Royal Derby." />
      <BetBoard />
    </>
  );
}
