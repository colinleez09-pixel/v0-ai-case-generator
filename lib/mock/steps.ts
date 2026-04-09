import type { TestStep, DirectoryNode } from "@/lib/types";

export const mockSteps: TestStep[] = [
  {
    id: "step-001",
    name: "用户登录验证",
    description: "验证用户使用正确的用户名和密码能够成功登录系统",
    directory: "baseline",
    components: [
      {
        id: "ref-001",
        componentId: "comp-001",
        componentName: "输入框组件",
        parameters: { placeholder: "请输入用户名" },
      },
      {
        id: "ref-002",
        componentId: "comp-002",
        componentName: "密码输入框组件",
        parameters: { placeholder: "请输入密码" },
      },
    ],
    parameters: [
      {
        id: "param-001",
        name: "username",
        type: "string",
        required: true,
        description: "登录用户名",
      },
      {
        id: "param-002",
        name: "password",
        type: "string",
        required: true,
        description: "登录密码",
      },
    ],
    status: "approved",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "step-002",
    name: "表单数据提交",
    description: "验证表单数据能够正确提交到服务器并返回成功响应",
    directory: "baseline",
    components: [
      {
        id: "ref-003",
        componentId: "comp-003",
        componentName: "表单组件",
        parameters: { action: "/api/submit" },
      },
    ],
    parameters: [
      {
        id: "param-003",
        name: "formData",
        type: "string",
        required: true,
        description: "表单数据 JSON",
      },
    ],
    status: "approved",
    createdAt: "2024-01-16T09:00:00Z",
    updatedAt: "2024-01-18T11:00:00Z",
  },
  {
    id: "step-003",
    name: "北京局点登录流程",
    description: "北京局点特有的登录验证流程",
    directory: "site",
    siteId: "site-001",
    components: [
      {
        id: "ref-004",
        componentId: "comp-001",
        componentName: "输入框组件",
        parameters: { placeholder: "请输入工号" },
      },
    ],
    parameters: [
      {
        id: "param-004",
        name: "employeeId",
        type: "string",
        required: true,
        description: "员工工号",
      },
    ],
    status: "approved",
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-05T16:00:00Z",
  },
  {
    id: "step-004",
    name: "我的自定义步骤",
    description: "个人创建的测试步骤，待提交审核",
    directory: "personal",
    ownerId: "user-002",
    ownerName: "李四",
    components: [],
    parameters: [],
    status: "draft",
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "step-005",
    name: "待审核步骤",
    description: "已提交审核，等待 TC 审批",
    directory: "personal",
    ownerId: "user-002",
    ownerName: "李四",
    components: [],
    parameters: [],
    status: "pending",
    lockedBy: "user-002",
    lockedByName: "李四",
    createdAt: "2024-03-02T10:00:00Z",
    updatedAt: "2024-03-02T14:00:00Z",
  },
];

export const mockDirectoryTree: DirectoryNode[] = [
  {
    id: "dir-baseline",
    name: "基线目录",
    type: "folder",
    directory: "baseline",
    children: [
      {
        id: "dir-baseline-auth",
        name: "认证模块",
        type: "folder",
        directory: "baseline",
        children: [
          {
            id: "dir-baseline-auth-login",
            name: "用户登录验证",
            type: "step",
            directory: "baseline",
            stepId: "step-001",
          },
        ],
      },
      {
        id: "dir-baseline-form",
        name: "表单模块",
        type: "folder",
        directory: "baseline",
        children: [
          {
            id: "dir-baseline-form-submit",
            name: "表单数据提交",
            type: "step",
            directory: "baseline",
            stepId: "step-002",
          },
        ],
      },
    ],
  },
  {
    id: "dir-site",
    name: "局点目录",
    type: "folder",
    directory: "site",
    children: [
      {
        id: "dir-site-bj",
        name: "北京局点",
        type: "folder",
        directory: "site",
        children: [
          {
            id: "dir-site-bj-login",
            name: "北京局点登录流程",
            type: "step",
            directory: "site",
            stepId: "step-003",
          },
        ],
      },
    ],
  },
  {
    id: "dir-personal",
    name: "个人目录",
    type: "folder",
    directory: "personal",
    children: [
      {
        id: "dir-personal-custom",
        name: "我的自定义步骤",
        type: "step",
        directory: "personal",
        stepId: "step-004",
      },
      {
        id: "dir-personal-pending",
        name: "待审核步骤",
        type: "step",
        directory: "personal",
        stepId: "step-005",
      },
    ],
  },
];
