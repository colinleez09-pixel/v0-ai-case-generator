import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '@/lib/types'
import { mockUsers } from '@/lib/mock/users'

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateProfile: (data: Partial<User>) => void
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  register: (username: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      
      login: async (username: string, password: string) => {
        // Mock login - 模拟登录验证
        const user = mockUsers.find(u => u.username === username)
        if (!user) {
          return { success: false, error: '用户不存在' }
        }
        // Mock password check - 简单模拟，实际应该hash比对
        if (password !== '123456') {
          return { success: false, error: '密码错误' }
        }
        set({ isAuthenticated: true, user })
        return { success: true }
      },
      
      logout: () => {
        set({ isAuthenticated: false, user: null })
      },
      
      updateProfile: (data: Partial<User>) => {
        const { user } = get()
        if (user) {
          set({ user: { ...user, ...data } })
        }
      },
      
      changePassword: async (oldPassword: string, newPassword: string) => {
        // Mock password change
        if (oldPassword !== '123456') {
          return { success: false, error: '原密码错误' }
        }
        if (newPassword.length < 6) {
          return { success: false, error: '新密码长度至少6位' }
        }
        // 实际应该调用后端API
        return { success: true }
      },
      
      register: async (username: string, password: string, name: string) => {
        // Mock register
        const exists = mockUsers.find(u => u.username === username)
        if (exists) {
          return { success: false, error: '用户名已存在' }
        }
        if (password.length < 6) {
          return { success: false, error: '密码长度至少6位' }
        }
        const newUser: User = {
          id: `user-${Date.now()}`,
          username,
          name,
          role: 'user' as UserRole,
          avatar: '',
          sites: [],
        }
        set({ isAuthenticated: true, user: newUser })
        return { success: true }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
