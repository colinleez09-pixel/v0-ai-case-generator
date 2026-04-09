import { create } from 'zustand'
import type { Site } from '@/lib/types'
import { mockSites } from '@/lib/mock/sites'

interface SitesState {
  sites: Site[]
  currentSite: Site | null
  
  // Actions
  setSites: (sites: Site[]) => void
  setCurrentSite: (site: Site | null) => void
  addSite: (site: Omit<Site, 'id'>) => Site
  updateSite: (id: string, data: Partial<Site>) => void
  deleteSite: (id: string) => void
  getSiteById: (id: string) => Site | undefined
}

export const useSitesStore = create<SitesState>((set, get) => ({
  sites: mockSites,
  currentSite: mockSites[0] || null,
  
  setSites: (sites) => set({ sites }),
  
  setCurrentSite: (site) => set({ currentSite: site }),
  
  addSite: (siteData) => {
    const newSite: Site = {
      ...siteData,
      id: `site-${Date.now()}`,
    }
    set((state) => ({ sites: [...state.sites, newSite] }))
    return newSite
  },
  
  updateSite: (id, data) => {
    set((state) => ({
      sites: state.sites.map((site) =>
        site.id === id ? { ...site, ...data } : site
      ),
      currentSite: state.currentSite?.id === id 
        ? { ...state.currentSite, ...data } 
        : state.currentSite,
    }))
  },
  
  deleteSite: (id) => {
    set((state) => {
      const newSites = state.sites.filter((site) => site.id !== id)
      return {
        sites: newSites,
        currentSite: state.currentSite?.id === id 
          ? newSites[0] || null 
          : state.currentSite,
      }
    })
  },
  
  getSiteById: (id) => {
    return get().sites.find((site) => site.id === id)
  },
}))
