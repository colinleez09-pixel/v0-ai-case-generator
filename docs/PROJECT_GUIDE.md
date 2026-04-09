# 智能测试用例生成平台 - 项目指南

## 一、项目概述

本项目是一个智能测试用例生成平台的前端应用，基于 Next.js 15 + React 19 + TypeScript 构建，采用 shadcn/ui 组件库和 Tailwind CSS 进行样式管理。

---

## 二、项目启动

### 2.1 环境要求

- Node.js >= 18.17
- pnpm >= 8.0（推荐）或 npm >= 9.0

### 2.2 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 2.3 启动开发服务器

```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev
```

启动后访问 http://localhost:3000 即可查看应用。

### 2.4 构建生产版本

```bash
# 构建
pnpm build

# 启动生产服务器
pnpm start
```

---

## 三、项目目录结构

```
v0-ai-case-generator/
├── app/                          # Next.js App Router 页面目录
│   ├── layout.tsx                # 根布局（含顶部栏、侧边栏）
│   ├── page.tsx                  # 首页/工作台
│   ├── globals.css               # 全局样式 + Tailwind 配置
│   ├── assets/                   # 测试资产管理模块
│   │   ├── steps/page.tsx        # 用例步骤资产页面
│   │   ├── components/page.tsx   # 测试原子组件页面
│   │   └── blueprints/page.tsx   # 用例场景蓝图页面
│   ├── review/page.tsx           # 审核中心页面
│   └── site-management/page.tsx  # 局点管理页面
│
├── components/                   # React 组件目录
│   ├── layout/                   # 布局组件
│   │   ├── header.tsx            # 顶部状态栏
│   │   ├── sidebar.tsx           # 左侧导航栏
│   │   ├── notification-center.tsx # 消息中心
│   │   ├── site-switcher.tsx     # 局点切换器
│   │   └── user-menu.tsx         # 用户菜单
│   └── ui/                       # shadcn/ui 基础组件
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       ├── avatar.tsx
│       ├── dropdown-menu.tsx
│       ├── popover.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       └── tooltip.tsx
│
├── lib/                          # 工具库目录
│   ├── utils.ts                  # 通用工具函数
│   ├── types/index.ts            # TypeScript 类型定义
│   ├── mock/                     # Mock 数据（开发用）
│   │   ├── users.ts              # 用户数据
│   │   ├── sites.ts              # 局点数据
│   │   ├── steps.ts              # 步骤资产数据
│   │   ├── components.ts         # 原子组件数据
│   │   ├── blueprints.ts         # 蓝图数据
│   │   ├── reviews.ts            # 审核数据
│   │   └── notifications.ts      # 通知数据
│   └── store/                    # Zustand 状态管理
│       ├── user-store.ts         # 用户状态
│       ├── site-store.ts         # 局点状态
│       └── lock-store.ts         # 锁定状态
│
├── backend/                      # 原有 Flask 后端（保留）
│   ├── app.py                    # Flask 应用入口
│   ├── requirements.txt          # Python 依赖
│   └── README.md                 # 后端说明
│
├── next.config.ts                # Next.js 配置
├── tailwind.config.ts            # Tailwind CSS 配置
├── tsconfig.json                 # TypeScript 配置
├── components.json               # shadcn/ui 配置
├── package.json                  # 项目依赖
└── pnpm-lock.yaml                # 依赖锁定文件
```

---

## 四、对接 Flask 后端

### 4.1 后端 API 基础配置

在 `lib/api/config.ts` 中配置 API 基础路径：

```typescript
// lib/api/config.ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // 用户相关
  auth: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    currentUser: '/api/auth/me',
  },
  // 局点相关
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
  },
  // 原子组件
  components: {
    list: '/api/components',
    detail: (id: string) => `/api/components/${id}`,
    import: '/api/components/import',
  },
  // 蓝图
  blueprints: {
    list: '/api/blueprints',
    detail: (id: string) => `/api/blueprints/${id}`,
    create: '/api/blueprints',
    update: (id: string) => `/api/blueprints/${id}`,
    generate: '/api/blueprints/generate',
  },
  // 审核
  reviews: {
    pending: '/api/reviews/pending',
    submitted: '/api/reviews/submitted',
    approve: (id: string) => `/api/reviews/${id}/approve`,
    reject: (id: string) => `/api/reviews/${id}/reject`,
  },
  // 通知
  notifications: {
    list: '/api/notifications',
    markRead: (id: string) => `/api/notifications/${id}/read`,
    markAllRead: '/api/notifications/read-all',
  },
};
```

### 4.2 创建 API 请求工具

```typescript
// lib/api/client.ts
import { API_BASE_URL } from './config';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;
  
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
    credentials: 'include', // 携带 cookie
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// 便捷方法
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    apiClient<T>(endpoint, { method: 'GET', params }),
    
  post: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
    
  put: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
    
  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};
```

### 4.3 使用 SWR 进行数据获取

```typescript
// lib/api/hooks/use-steps.ts
import useSWR from 'swr';
import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type { Step } from '@/lib/types';

export function useSteps(siteId?: string) {
  return useSWR<Step[]>(
    siteId ? [API_ENDPOINTS.steps.list, siteId] : null,
    () => api.get(API_ENDPOINTS.steps.list, { siteId: siteId! })
  );
}

export function useStep(id: string) {
  return useSWR<Step>(
    id ? API_ENDPOINTS.steps.detail(id) : null,
    () => api.get(API_ENDPOINTS.steps.detail(id))
  );
}
```

### 4.4 Flask 后端 CORS 配置

确保 Flask 后端允许前端跨域请求：

```python
# backend/app.py
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# 配置 CORS
CORS(app, 
     origins=['http://localhost:3000'],  # Next.js 开发服务器
     supports_credentials=True)

# ... 其他代码
```

### 4.5 环境变量配置

创建 `.env.local` 文件配置后端地址：

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4.6 从 Mock 数据切换到真实 API

当后端 API 准备就绪后，只需将页面中的 Mock 数据导入替换为 SWR Hook 即可：

```typescript
// 替换前（使用 Mock 数据）
import { mockSteps } from '@/lib/mock/steps';
const steps = mockSteps;

// 替换后（使用真实 API）
import { useSteps } from '@/lib/api/hooks/use-steps';
const { data: steps, isLoading, error } = useSteps(currentSiteId);
```

---

## 五、Flask 后端 API 接口规范

### 5.1 建议的 API 响应格式

```python
# 成功响应
{
    "code": 0,
    "message": "success",
    "data": { ... }
}

# 错误响应
{
    "code": 1001,
    "message": "参数错误",
    "data": null
}

# 分页响应
{
    "code": 0,
    "message": "success",
    "data": {
        "items": [...],
        "total": 100,
        "page": 1,
        "pageSize": 20
    }
}
```

### 5.2 主要 API 接口清单

| 模块 | 方法 | 路径 | 描述 |
|------|------|------|------|
| 认证 | POST | /api/auth/login | 用户登录 |
| 认证 | POST | /api/auth/logout | 用户登出 |
| 认证 | GET | /api/auth/me | 获取当前用户 |
| 局点 | GET | /api/sites | 获取局点列表 |
| 步骤 | GET | /api/steps | 获取步骤列表 |
| 步骤 | GET | /api/steps/:id | 获取步骤详情 |
| 步骤 | POST | /api/steps | 创建步骤 |
| 步骤 | PUT | /api/steps/:id | 更新步骤 |
| 步骤 | DELETE | /api/steps/:id | 删除步骤 |
| 步骤 | POST | /api/steps/:id/submit | 提交审核 |
| 组件 | GET | /api/components | 获取组件列表 |
| 组件 | POST | /api/components/import | 从 TC 导入 |
| 蓝图 | GET | /api/blueprints | 获取蓝图列表 |
| 蓝图 | POST | /api/blueprints/generate | AI 生成蓝图 |
| 审核 | GET | /api/reviews/pending | 待审核列表 |
| 审核 | POST | /api/reviews/:id/approve | 审核通过 |
| 审核 | POST | /api/reviews/:id/reject | 审核拒绝 |
| 通知 | GET | /api/notifications | 获取通知列表 |

---

## 六、开发注意事项

### 6.1 角色权限

系统支持三种角色：
- **普通用户 (user)**: 可查看基线/局点资产，管理个人资产
- **TC 管理员 (tc)**: 可管理局点资产，审核提交
- **系统管理员 (admin)**: 可管理基线资产，系统配置

### 6.2 锁定机制

编辑资源时需要先获取锁定，防止并发冲突。锁定状态通过 `lock-store.ts` 管理。

### 6.3 状态管理

- 全局状态使用 Zustand（用户、局点、锁定）
- 服务端数据使用 SWR 进行缓存和同步
- 组件内部状态使用 React useState

---

## 七、技术栈说明

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.x | React 框架 |
| React | 19.x | UI 库 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 4.x | 样式框架 |
| shadcn/ui | latest | UI 组件库 |
| Zustand | 5.x | 状态管理 |
| SWR | 2.x | 数据获取 |
| Lucide React | latest | 图标库 |
