import { create } from 'zustand'
import type { TestStep, StepCategory, AssetStatus } from '@/lib/types'
import { mockSteps, mockStepCategories } from '@/lib/mock/steps'

interface StepsState {
  steps: TestStep[]
  categories: StepCategory[]
  selectedStep: TestStep | null
  searchQuery: string
  
  // Actions
  setSteps: (steps: TestStep[]) => void
  setSelectedStep: (step: TestStep | null) => void
  setSearchQuery: (query: string) => void
  
  addStep: (step: Omit<TestStep, 'id' | 'createdAt' | 'updatedAt'>) => TestStep
  updateStep: (id: string, data: Partial<TestStep>) => void
  deleteStep: (id: string) => void
  copyStep: (stepId: string, targetCategoryId: string, userId: string) => TestStep
  
  addCategory: (category: Omit<StepCategory, 'id'>) => StepCategory
  updateCategory: (id: string, data: Partial<StepCategory>) => void
  deleteCategory: (id: string) => void
  
  submitForReview: (stepId: string) => void
  
  getStepById: (id: string) => TestStep | undefined
  getStepsByCategory: (categoryId: string) => TestStep[]
  getFilteredSteps: () => TestStep[]
}

export const useStepsStore = create<StepsState>((set, get) => ({
  steps: mockSteps,
  categories: mockStepCategories,
  selectedStep: null,
  searchQuery: '',
  
  setSteps: (steps) => set({ steps }),
  setSelectedStep: (step) => set({ selectedStep: step }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  addStep: (stepData) => {
    const now = new Date().toISOString()
    const newStep: TestStep = {
      ...stepData,
      id: `step-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ steps: [...state.steps, newStep] }))
    return newStep
  },
  
  updateStep: (id, data) => {
    set((state) => ({
      steps: state.steps.map((step) =>
        step.id === id ? { ...step, ...data, updatedAt: new Date().toISOString() } : step
      ),
      selectedStep: state.selectedStep?.id === id 
        ? { ...state.selectedStep, ...data, updatedAt: new Date().toISOString() } 
        : state.selectedStep,
    }))
  },
  
  deleteStep: (id) => {
    set((state) => ({
      steps: state.steps.filter((step) => step.id !== id),
      selectedStep: state.selectedStep?.id === id ? null : state.selectedStep,
    }))
  },
  
  copyStep: (stepId, targetCategoryId, userId) => {
    const step = get().getStepById(stepId)
    if (!step) throw new Error('Step not found')
    
    const now = new Date().toISOString()
    const newStep: TestStep = {
      ...step,
      id: `step-${Date.now()}`,
      name: `${step.name} (副本)`,
      categoryId: targetCategoryId,
      ownerId: userId,
      status: 'draft' as AssetStatus,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ steps: [...state.steps, newStep] }))
    return newStep
  },
  
  addCategory: (categoryData) => {
    const newCategory: StepCategory = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    }
    set((state) => ({ categories: [...state.categories, newCategory] }))
    return newCategory
  },
  
  updateCategory: (id, data) => {
    set((state) => ({
      categories: state.categories.map((cat) =>
        cat.id === id ? { ...cat, ...data } : cat
      ),
    }))
  },
  
  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((cat) => cat.id !== id),
    }))
  },
  
  submitForReview: (stepId) => {
    get().updateStep(stepId, { status: 'pending' as AssetStatus })
  },
  
  getStepById: (id) => {
    return get().steps.find((step) => step.id === id)
  },
  
  getStepsByCategory: (categoryId) => {
    return get().steps.filter((step) => step.categoryId === categoryId)
  },
  
  getFilteredSteps: () => {
    const { steps, searchQuery } = get()
    if (!searchQuery.trim()) return steps
    
    const query = searchQuery.toLowerCase()
    return steps.filter((step) =>
      step.name.toLowerCase().includes(query) ||
      step.description?.toLowerCase().includes(query)
    )
  },
}))
