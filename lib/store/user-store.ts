import { create } from "zustand";
import type { User, UserRole } from "@/lib/types";
import { mockUsers } from "@/lib/mock/users";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: mockUsers[1], // 默认 TC 角色
  setUser: (user) => set({ user }),
  switchRole: (role) => {
    const targetUser = mockUsers.find((u) => u.role === role);
    if (targetUser) {
      set({ user: targetUser });
    }
  },
}));
