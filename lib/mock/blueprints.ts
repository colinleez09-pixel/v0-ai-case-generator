import type { Blueprint } from "@/lib/types";

export const mockBlueprints: Blueprint[] = [
  {
    id: "bp-001",
    name: "用户登录完整流程",
    description: "包含登录、验证、跳转的完整测试流程",
    siteId: "site-001",
    siteName: "北京局点",
    steps: [
      {
        id: "bs-001",
        stepId: "step-001",
        stepName: "用户登录验证",
        order: 1,
        parameters: { username: "testuser", password: "testpass" },
      },
      {
        id: "bs-002",
        stepId: "step-003",
        stepName: "北京局点登录流程",
        order: 2,
        parameters: { employeeId: "EMP001" },
      },
    ],
    status: "active",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-10T14:00:00Z",
  },
  {
    id: "bp-002",
    name: "表单提交测试流程",
    description: "测试各种表单提交场景",
    siteId: "site-002",
    siteName: "上海局点",
    steps: [
      {
        id: "bs-003",
        stepId: "step-002",
        stepName: "表单数据提交",
        order: 1,
        parameters: { formData: '{"name":"test"}' },
      },
    ],
    status: "draft",
    createdAt: "2024-02-05T10:00:00Z",
    updatedAt: "2024-02-08T14:00:00Z",
  },
  {
    id: "bp-003",
    name: "新用户注册流程",
    description: "新用户注册的完整测试流程",
    siteId: "site-001",
    siteName: "北京局点",
    steps: [],
    status: "draft",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
  },
];
