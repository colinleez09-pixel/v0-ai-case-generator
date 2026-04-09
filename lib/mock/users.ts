import type { User } from "@/lib/types";

export const mockUsers: User[] = [
  {
    id: "user-001",
    name: "张三",
    employeeId: "EMP001",
    avatar: "",
    role: "user",
    sites: ["site-001", "site-002"],
  },
  {
    id: "user-002",
    name: "李四",
    employeeId: "EMP002",
    avatar: "",
    role: "tc",
    sites: ["site-001", "site-002", "site-003"],
  },
  {
    id: "user-003",
    name: "王五",
    employeeId: "EMP003",
    avatar: "",
    role: "admin",
    sites: ["site-001", "site-002", "site-003"],
  },
];

export const currentUser: User = mockUsers[1]; // 默认 TC 角色
