"use client";

import { LogOut, Settings, User, Shield, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/store/user-store";
import type { UserRole } from "@/lib/types";

const roleLabels: Record<UserRole, string> = {
  user: "普通用户",
  tc: "TC 管理员",
  admin: "系统管理员",
};

const roleBadgeVariants: Record<
  UserRole,
  "default" | "secondary" | "outline"
> = {
  user: "secondary",
  tc: "default",
  admin: "outline",
};

export function UserMenu() {
  const { user, switchRole } = useUserStore();

  if (!user) return null;

  const initials = user.name.slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full"
          aria-label="用户菜单"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <Badge variant={roleBadgeVariants[user.role]} className="text-xs">
                {roleLabels[user.role]}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              工号: {user.employeeId}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>个人信息</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>设置</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          切换角色 (演示)
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => switchRole("user")}>
            <User className="mr-2 h-4 w-4" />
            <span>普通用户</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchRole("tc")}>
            <UserCog className="mr-2 h-4 w-4" />
            <span>TC 管理员</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => switchRole("admin")}>
            <Shield className="mr-2 h-4 w-4" />
            <span>系统管理员</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
