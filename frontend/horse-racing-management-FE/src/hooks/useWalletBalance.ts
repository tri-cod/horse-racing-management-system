import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBalance } from '@/api/walletApi';

export const WALLET_BALANCE_KEY = ['wallet-balance'] as const;

export function useWalletBalance(enabled: boolean) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: WALLET_BALANCE_KEY,
    queryFn: () =>
      getBalance().then(
        (d) => (d as unknown as { balance: number }).balance ?? (d as unknown as number)
      ),
    enabled,
    staleTime: 30_000,
  });

  return { balance: data ?? null, loading: isLoading, refetch };
}

export function useInvalidateWalletBalance() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: WALLET_BALANCE_KEY });
}
