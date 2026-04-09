import { create } from 'zustand'
import type { TestComponent } from '@/lib/types'
import { mockComponents } from '@/lib/mock/components'

interface ComponentsState {
  components: TestComponent[]
  selectedComponent: TestComponent | null
  searchQuery: string
  viewMode: 'grid' | 'list'
  
  // Actions
  setComponents: (components: TestComponent[]) => void
  setSelectedComponent: (component: TestComponent | null) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: 'grid' | 'list') => void
  
  addComponent: (component: Omit<TestComponent, 'id' | 'createdAt' | 'updatedAt'>) => TestComponent
  updateComponent: (id: string, data: Partial<TestComponent>) => void
  deleteComponent: (id: string) => void
  
  getComponentById: (id: string) => TestComponent | undefined
  getFilteredComponents: () => TestComponent[]
}

export const useComponentsStore = create<ComponentsState>((set, get) => ({
  components: mockComponents,
  selectedComponent: null,
  searchQuery: '',
  viewMode: 'grid',
  
  setComponents: (components) => set({ components }),
  setSelectedComponent: (component) => set({ selectedComponent: component }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  addComponent: (componentData) => {
    const now = new Date().toISOString()
    const newComponent: TestComponent = {
      ...componentData,
      id: `comp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ components: [...state.components, newComponent] }))
    return newComponent
  },
  
  updateComponent: (id, data) => {
    set((state) => ({
      components: state.components.map((comp) =>
        comp.id === id ? { ...comp, ...data, updatedAt: new Date().toISOString() } : comp
      ),
      selectedComponent: state.selectedComponent?.id === id 
        ? { ...state.selectedComponent, ...data, updatedAt: new Date().toISOString() } 
        : state.selectedComponent,
    }))
  },
  
  deleteComponent: (id) => {
    set((state) => ({
      components: state.components.filter((comp) => comp.id !== id),
      selectedComponent: state.selectedComponent?.id === id ? null : state.selectedComponent,
    }))
  },
  
  getComponentById: (id) => {
    return get().components.find((comp) => comp.id === id)
  },
  
  getFilteredComponents: () => {
    const { components, searchQuery } = get()
    if (!searchQuery.trim()) return components
    
    const query = searchQuery.toLowerCase()
    return components.filter((comp) =>
      comp.name.toLowerCase().includes(query) ||
      comp.description?.toLowerCase().includes(query) ||
      comp.category?.toLowerCase().includes(query)
    )
  },
}))
