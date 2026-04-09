"use client";

import { useState } from "react";
import {
  FlaskConical,
  Send,
  FileText,
  Workflow,
  Package,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/lib/store/user-store";
import { useSiteStore } from "@/lib/store/site-store";
import Link from "next/link";

const quickActions = [
  {
    title: "用例步骤资产",
    description: "管理和浏览测试用例步骤库",
    icon: FileText,
    href: "/assets/steps",
    color: "text-blue-500",
  },
  {
    title: "测试原子组件",
    description: "管理可复用的测试组件",
    icon: Package,
    href: "/assets/components",
    color: "text-emerald-500",
  },
  {
    title: "用例场景蓝图",
    description: "编排测试场景流程",
    icon: Workflow,
    href: "/assets/blueprints",
    color: "text-amber-500",
  },
];

export default function HomePage() {
  const { user } = useUserStore();
  const { currentSite } = useSiteStore();
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (!message.trim()) return;
    // TODO: 实现 AI 对话功能
    setMessage("");
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          欢迎回来，{user?.name || "用户"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          当前局点：{currentSite.name}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.title}
              className="group transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-lg bg-muted p-2 ${action.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <Link href={action.href}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6 flex-1">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI 用例生成助手</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex h-[400px] flex-col p-0">
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <FlaskConical className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-lg bg-muted px-4 py-3">
                <p className="text-sm">
                  你好！我是 AI 用例生成助手。我可以帮助你：
                </p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>- 根据需求描述自动生成测试用例</li>
                  <li>- 分析现有用例并提出优化建议</li>
                  <li>- 解答测试相关的技术问题</li>
                </ul>
                <p className="mt-2 text-sm">请告诉我你需要什么帮助？</p>
              </div>
            </div>
          </div>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="输入你的问题或需求..."
                className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="mr-2 h-4 w-4" />
                发送
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
