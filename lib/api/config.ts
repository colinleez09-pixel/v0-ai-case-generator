export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // 用户认证
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    currentUser: '/api/auth/me',
  },
  // 局点管理
  sites: {
    list: '/api/sites',
    detail: (id: string) => `/api/sites/${id}`,
  },
  // 步骤资产
  steps: {
    list: '/api/steps',
    detail: (id: string) => `/api/steps/${id}`,
    create: '/api/steps',
    update: (id: string) => `/api/steps/${id}`,
    delete: (id: string) => `/api/steps/${id}`,
    submit: (id: string) => `/api/steps/${id}/submit`,
    lock: (id: string) => `/api/steps/${id}/lock`,
    unlock: (id: string) => `/api/steps/${id}/unlock`,
  },
  // 原子组件
  components: {
    list: '/api/components',
    detail: (id: string) => `/api/components/${id}`,
    create: '/api/components',
    update: (id: string) => `/api/components/${id}`,
    delete: (id: string) => `/api/components/${id}`,
    import: '/api/components/import',
  },
  // 用例场景蓝图
  blueprints: {
    list: '/api/blueprints',
    detail: (id: string) => `/api/blueprints/${id}`,
    create: '/api/blueprints',
    update: (id: string) => `/api/blueprints/${id}`,
    delete: (id: string) => `/api/blueprints/${id}`,
    generate: '/api/blueprints/generate',
    execute: (id: string) => `/api/blueprints/${id}/execute`,
  },
  // 审核中心
  reviews: {
    pending: '/api/reviews/pending',
    submitted: '/api/reviews/submitted',
    detail: (id: string) => `/api/reviews/${id}`,
    approve: (id: string) => `/api/reviews/${id}/approve`,
    reject: (id: string) => `/api/reviews/${id}/reject`,
  },
  // 通知消息
  notifications: {
    list: '/api/notifications',
    unreadCount: '/api/notifications/unread-count',
    markRead: (id: string) => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/read-all',
  },
};
