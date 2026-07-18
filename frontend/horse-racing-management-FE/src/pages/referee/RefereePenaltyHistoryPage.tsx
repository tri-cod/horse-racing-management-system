import { useMyPenaltyHistory } from '@/hooks/useMyPenaltyHistory';
import { useToast } from '@/components/ui/ToastProvider';
import PenaltyList from '@/components/features/referee/PenaltyList';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';

export default function RefereePenaltyHistoryPage() {
  const { penalties, loading, error, refetch } = useMyPenaltyHistory();
  const addToast = useToast();

  return (
    <div className="px-8 py-6">
      <Seo title="Penalty History" />
      <DashboardPageHeader eyebrow="Referee" title="Penalty History" subtitle="Every penalty you have issued" />
      <PenaltyList
        penalties={penalties}
        loading={loading}
        error={error}
        onChanged={refetch}
        onToast={(m, t) => addToast(m, t ?? 'success')}
      />
    </div>
  );
}