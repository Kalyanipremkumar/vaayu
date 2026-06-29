/** React Query hooks for the user's valuation history. */
import { useQuery } from '@tanstack/react-query';
import { getValuation, listValuations, type ValuationRecord } from '../lib/valuations';
import { useAuth } from './useAuth';

/** All of the signed-in user's valuations, newest first. */
export function useValuations() {
  const { user } = useAuth();
  return useQuery<ValuationRecord[]>({
    queryKey: ['valuations', user?.id],
    enabled: Boolean(user?.id),
    queryFn: listValuations,
  });
}

/** A single valuation by id. */
export function useValuation(id: string | undefined) {
  const { user } = useAuth();
  return useQuery<ValuationRecord | null>({
    queryKey: ['valuation', id, user?.id],
    enabled: Boolean(id && user?.id),
    queryFn: () => getValuation(id as string),
  });
}
