"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  LayoutGrid,
  LayoutList,
  Plus,
  Import,
  X,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockComponents } from "@/lib/mock/components";
import { mockSites } from "@/lib/mock/sites";
import type { AtomicComponent } from "@/lib/types";
import { useUserStore } from "@/lib/store/user-store";
import { useSiteStore } from "@/lib/store/site-store";

const componentTypes = [
  { value: "", label: "全部类型" },
  { value: "input", label: "输入框" },
  { value: "password", label: "密码框" },
  { value: "form", label: "表单" },
  { value: "button", label: "按钮" },
  { value: "select", label: "选择器" },
  { value: "modal", label: "弹窗" },
];

export default function ComponentsPage() {
  const { user } = useUserStore();
  const { currentSite } = useSiteStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedComponent, setSelectedComponent] =
    useState<AtomicComponent | null>(null);

  const isTcOrAdmin = user?.role === "tc" || user?.role === "admin";

  // 过滤组件
  const filteredComponents = mockComponents.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || comp.type === selectedType;
    const matchesSite = !selectedSiteId || comp.siteId === selectedSiteId;
    return matchesSearch && matchesType && matchesSite;
  });

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">测试原子组件</h1>
          <p className="mt-1 text-muted-foreground">
            管理可复用的测试组件资产
          </p>
        </div>
        <div className="flex gap-2">
          {isTcOrAdmin && (
            <Button variant="outline">
              <Import className="mr-2 h-4 w-4" />
              导入组件
            </Button>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建组件
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索组件名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {componentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">全部局点</option>
              {mockSites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex rounded-md border">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* 组件列表 */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(100vh-18rem)]">
            {viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredComponents.map((comp) => (
                  <Card
                    key={comp.id}
                    className={cn(
                      "cursor-pointer transition-shadow hover:shadow-md",
                      selectedComponent?.id === comp.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedComponent(comp)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <CardTitle className="text-base">
                            {comp.name}
                          </CardTitle>
                        </div>
                        <Badge variant="outline">{comp.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {comp.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {comp.siteName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {comp.parameters.length} 个参数
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredComponents.map((comp) => (
                  <Card
                    key={comp.id}
                    className={cn(
                      "cursor-pointer transition-shadow hover:shadow-md",
                      selectedComponent?.id === comp.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedComponent(comp)}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{comp.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {comp.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{comp.type}</Badge>
                        <Badge variant="secondary">{comp.siteName}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {filteredComponents.length === 0 && (
              <div className="flex h-[200px] items-center justify-center">
                <p className="text-muted-foreground">没有找到匹配的组件</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* 右侧详情抽屉 */}
        {selectedComponent && (
          <Card className="w-96 shrink-0 overflow-hidden">
            <CardHeader className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedComponent.name}</CardTitle>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="outline">{selectedComponent.type}</Badge>
                    <Badge variant="secondary">
                      {selectedComponent.siteName}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedComponent(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <CardContent className="p-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">描述</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedComponent.description}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-2 text-sm font-medium">参数列表</h4>
                    {selectedComponent.parameters.length > 0 ? (
                      <div className="space-y-2">
                        {selectedComponent.parameters.map((param) => (
                          <div
                            key={param.id}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm">
                                {param.name}
                              </span>
                              {param.required && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  必填
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              类型: {param.type}
                              {param.defaultValue &&
                                ` | 默认: ${param.defaultValue}`}
                            </p>
                            {param.description && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {param.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">无参数</p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-2 text-sm font-medium">使用示例</h4>
                    {selectedComponent.examples.length > 0 ? (
                      <div className="space-y-2">
                        {selectedComponent.examples.map((example, idx) => (
                          <pre
                            key={idx}
                            className="overflow-x-auto rounded-lg bg-muted p-3 text-xs"
                          >
                            {example}
                          </pre>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">无示例</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}
