// 用户角色
export type UserRole = "user" | "tc" | "admin";

// 用户
export interface User {
  id: string;
  name: string;
  employeeId: string;
  avatar?: string;
  role: UserRole;
  sites: string[];
}

// 局点
export interface Site {
  id: string;
  name: string;
  code: string;
}

// 参数
export interface Parameter {
  id: string;
  name: string;
  type: "string" | "number" | "boolean" | "select";
  required: boolean;
  defaultValue?: string;
  options?: string[];
  description?: string;
}

// 组件引用
export interface ComponentRef {
  id: string;
  componentId: string;
  componentName: string;
  parameters: Record<string, string>;
}

// 测试步骤
export interface TestStep {
  id: string;
  name: string;
  description: string;
  directory: "baseline" | "site" | "personal";
  siteId?: string;
  ownerId?: string;
  ownerName?: string;
  components: ComponentRef[];
  parameters: Parameter[];
  status: "draft" | "pending" | "approved" | "rejected";
  lockedBy?: string;
  lockedByName?: string;
  createdAt: string;
  updatedAt: string;
}

// 目录节点
export interface DirectoryNode {
  id: string;
  name: string;
  type: "folder" | "step";
  directory: "baseline" | "site" | "personal";
  children?: DirectoryNode[];
  stepId?: string;
}

// 原子组件
export interface AtomicComponent {
  id: string;
  name: string;
  type: string;
  description: string;
  siteId: string;
  siteName: string;
  parameters: Parameter[];
  examples: string[];
  createdAt: string;
  updatedAt: string;
}

// 蓝图步骤
export interface BlueprintStep {
  id: string;
  stepId: string;
  stepName: string;
  order: number;
  parameters: Record<string, string>;
}

// 场景蓝图
export interface Blueprint {
  id: string;
  name: string;
  description: string;
  siteId: string;
  siteName: string;
  steps: BlueprintStep[];
  status: "draft" | "active";
  createdAt: string;
  updatedAt: string;
}

// 审核记录
export interface ReviewRecord {
  id: string;
  type: "step" | "component" | "blueprint";
  assetId: string;
  assetName: string;
  submitterId: string;
  submitterName: string;
  targetDirectory: string;
  changeDescription: string;
  status: "pending" | "approved" | "rejected";
  reviewerId?: string;
  reviewerName?: string;
  reviewerComment?: string;
  originalData?: Record<string, unknown>;
  newData?: Record<string, unknown>;
  createdAt: string;
  reviewedAt?: string;
}

// 消息通知
export interface Notification {
  id: string;
  type: "review_request" | "review_result" | "lock_conflict" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

// 导航菜单项
export interface NavItem {
  title: string;
  href?: string;
  icon?: string;
  roles?: UserRole[];
  children?: NavItem[];
}
