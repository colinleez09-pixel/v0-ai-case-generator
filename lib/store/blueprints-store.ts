import { create } from 'zustand'
import type { Blueprint, BlueprintStep, AssetStatus } from '@/lib/types'
import { mockBlueprints } from '@/lib/mock/blueprints'

interface BlueprintsState {
  blueprints: Blueprint[]
  selectedBlueprint: Blueprint | null
  searchQuery: string
  editingBlueprint: Blueprint | null
  
  // Actions
  setBlueprints: (blueprints: Blueprint[]) => void
  setSelectedBlueprint: (blueprint: Blueprint | null) => void
  setSearchQuery: (query: string) => void
  setEditingBlueprint: (blueprint: Blueprint | null) => void
  
  addBlueprint: (blueprint: Omit<Blueprint, 'id' | 'createdAt' | 'updatedAt'>) => Blueprint
  updateBlueprint: (id: string, data: Partial<Blueprint>) => void
  deleteBlueprint: (id: string) => void
  copyBlueprint: (blueprintId: string, targetDirectory: 'personal' | 'site', userId: string, userName: string) => Blueprint
  submitForReview: (blueprintId: string) => void
  
  // 步骤编排
  addStepToBlueprint: (blueprintId: string, step: Omit<BlueprintStep, 'id' | 'order'>) => void
  removeStepFromBlueprint: (blueprintId: string, stepId: string) => void
  reorderSteps: (blueprintId: string, stepIds: string[]) => void
  
  getBlueprintById: (id: string) => Blueprint | undefined
  getFilteredBlueprints: () => Blueprint[]
}

export const useBlueprintsStore = create<BlueprintsState>((set, get) => ({
  blueprints: mockBlueprints,
  selectedBlueprint: null,
  searchQuery: '',
  editingBlueprint: null,
  
  setBlueprints: (blueprints) => set({ blueprints }),
  setSelectedBlueprint: (blueprint) => set({ selectedBlueprint: blueprint }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setEditingBlueprint: (blueprint) => set({ editingBlueprint: blueprint }),
  
  addBlueprint: (blueprintData) => {
    const now = new Date().toISOString()
    const newBlueprint: Blueprint = {
      ...blueprintData,
      id: `bp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ blueprints: [...state.blueprints, newBlueprint] }))
    return newBlueprint
  },
  
  updateBlueprint: (id, data) => {
    set((state) => ({
      blueprints: state.blueprints.map((bp) =>
        bp.id === id ? { ...bp, ...data, updatedAt: new Date().toISOString() } : bp
      ),
      selectedBlueprint: state.selectedBlueprint?.id === id 
        ? { ...state.selectedBlueprint, ...data, updatedAt: new Date().toISOString() } 
        : state.selectedBlueprint,
      editingBlueprint: state.editingBlueprint?.id === id 
        ? { ...state.editingBlueprint, ...data, updatedAt: new Date().toISOString() } 
        : state.editingBlueprint,
    }))
  },
  
  deleteBlueprint: (id) => {
    set((state) => ({
      blueprints: state.blueprints.filter((bp) => bp.id !== id),
      selectedBlueprint: state.selectedBlueprint?.id === id ? null : state.selectedBlueprint,
      editingBlueprint: state.editingBlueprint?.id === id ? null : state.editingBlueprint,
    }))
  },
  
  copyBlueprint: (blueprintId, targetDirectory, userId, userName) => {
    const blueprint = get().getBlueprintById(blueprintId)
    if (!blueprint) throw new Error('Blueprint not found')
    
    const now = new Date().toISOString()
    const newBlueprint: Blueprint = {
      ...blueprint,
      id: `bp-${Date.now()}`,
      name: `${blueprint.name} (副本)`,
      directory: targetDirectory,
      ownerId: userId,
      ownerName: userName,
      status: 'draft' as AssetStatus,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ blueprints: [...state.blueprints, newBlueprint] }))
    return newBlueprint
  },
  
  submitForReview: (blueprintId) => {
    get().updateBlueprint(blueprintId, { status: 'pending' as AssetStatus })
  },
  
  addStepToBlueprint: (blueprintId, step) => {
    const blueprint = get().getBlueprintById(blueprintId)
    if (!blueprint) return
    
    const newStep: BlueprintStep = {
      ...step,
      id: `bps-${Date.now()}`,
      order: blueprint.steps.length,
    }
    
    get().updateBlueprint(blueprintId, {
      steps: [...blueprint.steps, newStep],
    })
  },
  
  removeStepFromBlueprint: (blueprintId, stepId) => {
    const blueprint = get().getBlueprintById(blueprintId)
    if (!blueprint) return
    
    const newSteps = blueprint.steps
      .filter((s) => s.id !== stepId)
      .map((s, index) => ({ ...s, order: index }))
    
    get().updateBlueprint(blueprintId, { steps: newSteps })
  },
  
  reorderSteps: (blueprintId, stepIds) => {
    const blueprint = get().getBlueprintById(blueprintId)
    if (!blueprint) return
    
    const stepMap = new Map(blueprint.steps.map((s) => [s.id, s]))
    const newSteps = stepIds
      .map((id, index) => {
        const step = stepMap.get(id)
        return step ? { ...step, order: index } : null
      })
      .filter(Boolean) as BlueprintStep[]
    
    get().updateBlueprint(blueprintId, { steps: newSteps })
  },
  
  getBlueprintById: (id) => {
    return get().blueprints.find((bp) => bp.id === id)
  },
  
  getFilteredBlueprints: () => {
    const { blueprints, searchQuery } = get()
    if (!searchQuery.trim()) return blueprints
    
    const query = searchQuery.toLowerCase()
    return blueprints.filter((bp) =>
      bp.name.toLowerCase().includes(query) ||
      bp.description?.toLowerCase().includes(query)
    )
  },
}))
