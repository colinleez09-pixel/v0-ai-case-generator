"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPinned,
  FolderTree,
  Package,
  Workflow,
  ClipboardCheck,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "@/lib/store/user-store";
import type { UserRole } from "@/lib/types";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  roles?: UserRole[];
  children?: { title: string; href: string; roles?: UserRole[] }[];
}

const navItems: NavItem[] = [
  {
    title: "首页",
    href: "/",
    icon: Home,
  },
  {
    title: "局点管理",
    href: "/site-management",
    icon: MapPinned,
    roles: ["tc", "admin"],
  },
  {
    title: "测试资产管理",
    icon: Package,
    children: [
      {
        title: "用例步骤资产",
        href: "/assets/steps",
      },
      {
        title: "测试原子组件",
        href: "/assets/components",
      },
      {
        title: "用例场景蓝图",
        href: "/assets/blueprints",
      },
    ],
  },
  {
    title: "审核中心",
    href: "/review",
    icon: ClipboardCheck,
    roles: ["tc", "admin"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUserStore();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "测试资产管理",
  ]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const hasAccess = (roles?: UserRole[]) => {
    if (!roles || roles.length === 0) return true;
    return user && roles.includes(user.role);
  };

  const filteredNavItems = navItems.filter((item) => hasAccess(item.roles));

  return (
    <aside className="flex h-[calc(100vh-3.5rem)] w-60 flex-col border-r bg-sidebar">
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {filteredNavItems.map((item) => {
            const isExpanded = expandedItems.includes(item.title);
            const hasChildren = item.children && item.children.length > 0;
            const isActive = item.href === pathname;
            const Icon = item.icon;

            if (hasChildren) {
              const filteredChildren = item.children!.filter((child) =>
                hasAccess(child.roles)
              );
              const isChildActive = filteredChildren.some(
                (child) => child.href === pathname
              );

              return (
                <div key={item.title}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between px-3 font-normal",
                      isChildActive && "bg-sidebar-accent"
                    )}
                    onClick={() => toggleExpanded(item.title)}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </Button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 border-l pl-3">
                      {filteredChildren.map((child) => {
                        const isChildItemActive = child.href === pathname;
                        return (
                          <Button
                            key={child.href}
                            variant="ghost"
                            asChild
                            className={cn(
                              "w-full justify-start px-3 font-normal",
                              isChildItemActive &&
                                "bg-sidebar-accent text-sidebar-accent-foreground"
                            )}
                          >
                            <Link href={child.href}>{child.title}</Link>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Button
                key={item.title}
                variant="ghost"
                asChild
                className={cn(
                  "w-full justify-start px-3 font-normal",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Link href={item.href!}>
                  <Icon className="mr-3 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
