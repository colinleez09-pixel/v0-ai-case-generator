import type { Notification } from "@/lib/types";

export const mockNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "review_request",
    title: "新的审核请求",
    message: "张三 提交了「日期选择器组件」的审核申请",
    read: false,
    createdAt: "2024-03-03T10:00:00Z",
    link: "/review?id=review-002",
  },
  {
    id: "notif-002",
    type: "review_request",
    title: "新的审核请求",
    message: "李四 提交了「待审核步骤」的审核申请",
    read: false,
    createdAt: "2024-03-02T14:00:00Z",
    link: "/review?id=review-001",
  },
  {
    id: "notif-003",
    type: "review_result",
    title: "审核已通过",
    message: "您提交的「旧版登录步骤」已通过审核",
    read: true,
    createdAt: "2024-03-01T09:00:00Z",
    link: "/assets/steps?id=step-old-001",
  },
  {
    id: "notif-004",
    type: "lock_conflict",
    title: "编辑冲突提醒",
    message: "王五 正在编辑「用户登录验证」步骤",
    read: true,
    createdAt: "2024-02-28T16:00:00Z",
    link: "/assets/steps?id=step-001",
  },
  {
    id: "notif-005",
    type: "system",
    title: "系统通知",
    message: "系统将于今晚 22:00 进行维护，预计持续 2 小时",
    read: true,
    createdAt: "2024-02-27T10:00:00Z",
  },
];
