import useSWR from 'swr';
import { api } from './client';
import { API_ENDPOINTS } from './config';
import type { 
  User, 
  Site, 
  Step, 
  TestComponent, 
  Blueprint, 
  ReviewItem, 
  Notification 
} from '@/lib/types';

// ============ 用户相关 ============
export function useCurrentUser() {
  return useSWR<User>(
    API_ENDPOINTS.auth.currentUser,
    () => api.get(API_ENDPOINTS.auth.currentUser)
  );
}

// ============ 局点相关 ============
export function useSites() {
  return useSWR<Site[]>(
    API_ENDPOINTS.sites.list,
    () => api.get(API_ENDPOINTS.sites.list)
  );
}

// ============ 步骤资产 ============
export function useSteps(params?: { siteId?: string; category?: string; search?: string }) {
  const key = params ? [API_ENDPOINTS.steps.list, params] : API_ENDPOINTS.steps.list;
  return useSWR<Step[]>(
    key,
    () => api.get(API_ENDPOINTS.steps.list, params)
  );
}

export function useStep(id: string | null) {
  return useSWR<Step>(
    id ? API_ENDPOINTS.steps.detail(id) : null,
    () => id ? api.get(API_ENDPOINTS.steps.detail(id)) : null
  );
}

// ============ 原子组件 ============
export function useComponents(params?: { category?: string; search?: string }) {
  const key = params ? [API_ENDPOINTS.components.list, params] : API_ENDPOINTS.components.list;
  return useSWR<TestComponent[]>(
    key,
    () => api.get(API_ENDPOINTS.components.list, params)
  );
}

export function useComponent(id: string | null) {
  return useSWR<TestComponent>(
    id ? API_ENDPOINTS.components.detail(id) : null,
    () => id ? api.get(API_ENDPOINTS.components.detail(id)) : null
  );
}

// ============ 蓝图 ============
export function useBlueprints(params?: { siteId?: string; status?: string; search?: string }) {
  const key = params ? [API_ENDPOINTS.blueprints.list, params] : API_ENDPOINTS.blueprints.list;
  return useSWR<Blueprint[]>(
    key,
    () => api.get(API_ENDPOINTS.blueprints.list, params)
  );
}

export function useBlueprint(id: string | null) {
  return useSWR<Blueprint>(
    id ? API_ENDPOINTS.blueprints.detail(id) : null,
    () => id ? api.get(API_ENDPOINTS.blueprints.detail(id)) : null
  );
}

// ============ 审核 ============
export function usePendingReviews() {
  return useSWR<ReviewItem[]>(
    API_ENDPOINTS.reviews.pending,
    () => api.get(API_ENDPOINTS.reviews.pending)
  );
}

export function useSubmittedReviews() {
  return useSWR<ReviewItem[]>(
    API_ENDPOINTS.reviews.submitted,
    () => api.get(API_ENDPOINTS.reviews.submitted)
  );
}

// ============ 通知 ============
export function useNotifications() {
  return useSWR<Notification[]>(
    API_ENDPOINTS.notifications.list,
    () => api.get(API_ENDPOINTS.notifications.list)
  );
}

export function useUnreadNotificationCount() {
  return useSWR<number>(
    API_ENDPOINTS.notifications.unreadCount,
    () => api.get(API_ENDPOINTS.notifications.unreadCount)
  );
}

// ============ 操作方法 ============
export const stepActions = {
  create: (data: Partial<Step>) => api.post<Step>(API_ENDPOINTS.steps.create, data),
  update: (id: string, data: Partial<Step>) => api.put<Step>(API_ENDPOINTS.steps.update(id), data),
  delete: (id: string) => api.delete<void>(API_ENDPOINTS.steps.delete(id)),
  submit: (id: string) => api.post<void>(API_ENDPOINTS.steps.submit(id)),
  lock: (id: string) => api.post<void>(API_ENDPOINTS.steps.lock(id)),
  unlock: (id: string) => api.post<void>(API_ENDPOINTS.steps.unlock(id)),
};

export const componentActions = {
  create: (data: Partial<TestComponent>) => api.post<TestComponent>(API_ENDPOINTS.components.create, data),
  update: (id: string, data: Partial<TestComponent>) => api.put<TestComponent>(API_ENDPOINTS.components.update(id), data),
  delete: (id: string) => api.delete<void>(API_ENDPOINTS.components.delete(id)),
  import: (componentIds: string[]) => api.post<TestComponent[]>(API_ENDPOINTS.components.import, { componentIds }),
};

export const blueprintActions = {
  create: (data: Partial<Blueprint>) => api.post<Blueprint>(API_ENDPOINTS.blueprints.create, data),
  update: (id: string, data: Partial<Blueprint>) => api.put<Blueprint>(API_ENDPOINTS.blueprints.update(id), data),
  delete: (id: string) => api.delete<void>(API_ENDPOINTS.blueprints.delete(id)),
  generate: (prompt: string, siteId: string) => api.post<Blueprint>(API_ENDPOINTS.blueprints.generate, { prompt, siteId }),
  execute: (id: string) => api.post<void>(API_ENDPOINTS.blueprints.execute(id)),
};

export const reviewActions = {
  approve: (id: string, comment?: string) => api.post<void>(API_ENDPOINTS.reviews.approve(id), { comment }),
  reject: (id: string, reason: string) => api.post<void>(API_ENDPOINTS.reviews.reject(id), { reason }),
};

export const notificationActions = {
  markRead: (id: string) => api.post<void>(API_ENDPOINTS.notifications.markRead(id)),
  markAllRead: () => api.post<void>(API_ENDPOINTS.notifications.markAllRead),
};
