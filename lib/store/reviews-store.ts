import { create } from 'zustand'
import type { ReviewItem, ReviewDecision } from '@/lib/types'
import { mockReviews } from '@/lib/mock/reviews'

interface ReviewsState {
  reviews: ReviewItem[]
  selectedReview: ReviewItem | null
  activeTab: 'pending' | 'reviewed'
  
  // Actions
  setReviews: (reviews: ReviewItem[]) => void
  setSelectedReview: (review: ReviewItem | null) => void
  setActiveTab: (tab: 'pending' | 'reviewed') => void
  
  approveReview: (reviewId: string, reviewerId: string, reviewerName: string, comment?: string) => void
  rejectReview: (reviewId: string, reviewerId: string, reviewerName: string, reason: string) => void
  
  getPendingReviews: () => ReviewItem[]
  getReviewedReviews: () => ReviewItem[]
  getReviewById: (id: string) => ReviewItem | undefined
}

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  reviews: mockReviews,
  selectedReview: null,
  activeTab: 'pending',
  
  setReviews: (reviews) => set({ reviews }),
  setSelectedReview: (review) => set({ selectedReview: review }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  approveReview: (reviewId, reviewerId, reviewerName, comment) => {
    set((state) => ({
      reviews: state.reviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: 'approved' as const,
              decision: 'approved' as ReviewDecision,
              reviewerId,
              reviewerName,
              reviewComment: comment || '审核通过',
              reviewedAt: new Date().toISOString(),
            }
          : review
      ),
      selectedReview: state.selectedReview?.id === reviewId
        ? {
            ...state.selectedReview,
            status: 'approved' as const,
            decision: 'approved' as ReviewDecision,
            reviewerId,
            reviewerName,
            reviewComment: comment || '审核通过',
            reviewedAt: new Date().toISOString(),
          }
        : state.selectedReview,
    }))
  },
  
  rejectReview: (reviewId, reviewerId, reviewerName, reason) => {
    set((state) => ({
      reviews: state.reviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: 'rejected' as const,
              decision: 'rejected' as ReviewDecision,
              reviewerId,
              reviewerName,
              reviewComment: reason,
              reviewedAt: new Date().toISOString(),
            }
          : review
      ),
      selectedReview: state.selectedReview?.id === reviewId
        ? {
            ...state.selectedReview,
            status: 'rejected' as const,
            decision: 'rejected' as ReviewDecision,
            reviewerId,
            reviewerName,
            reviewComment: reason,
            reviewedAt: new Date().toISOString(),
          }
        : state.selectedReview,
    }))
  },
  
  getPendingReviews: () => {
    return get().reviews.filter((r) => r.status === 'pending')
  },
  
  getReviewedReviews: () => {
    return get().reviews.filter((r) => r.status !== 'pending')
  },
  
  getReviewById: (id) => {
    return get().reviews.find((r) => r.id === id)
  },
}))
