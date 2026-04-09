import { create } from "zustand";
import type { Site } from "@/lib/types";
import { mockSites } from "@/lib/mock/sites";

interface SiteState {
  currentSite: Site;
  sites: Site[];
  setCurrentSite: (site: Site) => void;
}

export const useSiteStore = create<SiteState>((set) => ({
  currentSite: mockSites[0],
  sites: mockSites,
  setCurrentSite: (site) => set({ currentSite: site }),
}));
