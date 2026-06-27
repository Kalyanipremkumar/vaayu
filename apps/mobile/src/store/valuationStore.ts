/**
 * Zustand store for the mobile valuation flow. Intentionally mirrors the web
 * store's shape (apps/web/src/store/valuationStore.ts) so the flow logic can be
 * hoisted into @vaayu/shared later without renaming fields. The only platform
 * difference is the image type (a local URI string instead of a File).
 */
import { create } from 'zustand';
import type { ArtworkCondition, Dimensions } from '@vaayu/shared';

export type ValuationStep = 'upload' | 'context' | 'review' | 'pay' | 'processing' | 'result';

interface ValuationDraft {
  imageUri: string | null;
  uploadedImageUrl: string | null;
  artistKnown: boolean;
  artistName: string;
  tradition: string;
  medium: string;
  dimensions: Dimensions;
  yearCreated: number | null;
  condition: ArtworkCondition;
  provenanceNotes: string;
}

interface ValuationState extends ValuationDraft {
  step: ValuationStep;
  setStep: (step: ValuationStep) => void;
  update: (patch: Partial<ValuationDraft>) => void;
  reset: () => void;
}

const initialDraft: ValuationDraft = {
  imageUri: null,
  uploadedImageUrl: null,
  artistKnown: false,
  artistName: '',
  tradition: '',
  medium: '',
  dimensions: { heightCm: 0, widthCm: 0 },
  yearCreated: null,
  condition: 'good',
  provenanceNotes: '',
};

export const useValuationStore = create<ValuationState>((set) => ({
  ...initialDraft,
  step: 'upload',
  setStep: (step) => set({ step }),
  update: (patch) => set(patch),
  reset: () => set({ ...initialDraft, step: 'upload' }),
}));
