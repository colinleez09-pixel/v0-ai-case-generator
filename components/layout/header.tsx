"use client";

import { FlaskConical } from "lucide-react";
import { NotificationCenter } from "./notification-center";
import { SiteSwitcher } from "./site-switcher";
import { UserMenu } from "./user-menu";
import { Separator } from "@/components/ui/separator";

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">智能测试用例生成平台</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SiteSwitcher />
        <Separator orientation="vertical" className="mx-2 h-6" />
        <NotificationCenter />
        <UserMenu />
      </div>
    </header>
  );
}
