/** React Query hooks for the user's Artist Mode pricing history. */
import { useQuery } from '@tanstack/react-query';
import {
  getArtistPricing,
  listArtistPricings,
  type ArtistPricingRecord,
} from '../lib/artistPricings';
import { useAuth } from './useAuth';

/** All of the signed-in user's artist pricings, newest first. */
export function useArtistPricings() {
  const { user } = useAuth();
  return useQuery<ArtistPricingRecord[]>({
    queryKey: ['artistPricings', user?.id],
    enabled: Boolean(user?.id),
    queryFn: listArtistPricings,
  });
}

/** A single artist pricing by id. */
export function useArtistPricing(id: string | undefined) {
  const { user } = useAuth();
  return useQuery<ArtistPricingRecord | null>({
    queryKey: ['artistPricing', id, user?.id],
    enabled: Boolean(id && user?.id),
    queryFn: () => getArtistPricing(id as string),
  });
}
