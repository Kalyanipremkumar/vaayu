/**
 * Zustand store for the multi-step valuation flow (upload → context → review →
 * pay → result). Mobile mirrors these field names so flow logic can be lifted
 * into @vaayu/shared later without renaming.
 */
import { create } from 'zustand';
import type { ArtworkCondition, Dimensions } from '@vaayu/shared';

/** Steps in the valuation wizard. */
export type ValuationStep = 'upload' | 'context' | 'review' | 'pay' | 'processing' | 'result';

interface ValuationDraft {
  imageFile: File | null;
  imagePreviewUrl: string | null;
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
  imageFile: null,
  imagePreviewUrl: null,
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
