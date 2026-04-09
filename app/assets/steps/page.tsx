"use client";

import { useState } from "react";
import {
  Search,
  FolderTree,
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
  Edit,
  Copy,
  Lock,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mockDirectoryTree, mockSteps } from "@/lib/mock/steps";
import type { DirectoryNode, TestStep } from "@/lib/types";
import { useUserStore } from "@/lib/store/user-store";

const directoryIcons = {
  baseline: "text-blue-500",
  site: "text-emerald-500",
  personal: "text-amber-500",
};

const directoryLabels = {
  baseline: "基线",
  site: "局点",
  personal: "个人",
};

const statusLabels = {
  draft: "草稿",
  pending: "审核中",
  approved: "已通过",
  rejected: "已拒绝",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive"
> = {
  draft: "secondary",
  pending: "warning",
  approved: "success",
  rejected: "destructive",
};

function TreeNode({
  node,
  level = 0,
  selectedId,
  onSelect,
}: {
  node: DirectoryNode;
  level?: number;
  selectedId: string | null;
  onSelect: (node: DirectoryNode) => void;
}) {
  const [expanded, setExpanded] = useState(level < 2);

  const isFolder = node.type === "folder";
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
          isSelected && "bg-muted"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (isFolder && hasChildren) {
            setExpanded(!expanded);
          }
          onSelect(node);
        }}
      >
        {isFolder && hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-4" />
        )}
        {isFolder ? (
          <FolderTree
            className={cn("h-4 w-4 shrink-0", directoryIcons[node.directory])}
          />
        ) : (
          <FileText
            className={cn("h-4 w-4 shrink-0", directoryIcons[node.directory])}
          />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isFolder && expanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StepsPage() {
  const { user } = useUserStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<DirectoryNode | null>(null);
  const [selectedStep, setSelectedStep] = useState<TestStep | null>(null);

  const handleNodeSelect = (node: DirectoryNode) => {
    setSelectedNode(node);
    if (node.type === "step" && node.stepId) {
      const step = mockSteps.find((s) => s.id === node.stepId);
      setSelectedStep(step || null);
    } else {
      setSelectedStep(null);
    }
  };

  const canEdit =
    selectedStep &&
    (selectedStep.directory === "personal" ||
      user?.role === "tc" ||
      user?.role === "admin");

  const isLocked = selectedStep?.lockedBy && selectedStep.lockedBy !== user?.id;

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">用例步骤资产</h1>
          <p className="mt-1 text-muted-foreground">
            管理和浏览测试用例步骤库
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建步骤
        </Button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* 左侧目录树 */}
        <Card className="w-80 shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">目录结构</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索步骤..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="px-2 pb-4">
                {mockDirectoryTree.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    selectedId={selectedNode?.id || null}
                    onSelect={handleNodeSelect}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* 右侧详情区 */}
        <Card className="flex-1 overflow-hidden">
          {selectedStep ? (
            <>
              <CardHeader className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{selectedStep.name}</CardTitle>
                      <Badge variant={statusVariants[selectedStep.status]}>
                        {statusLabels[selectedStep.status]}
                      </Badge>
                      <Badge variant="outline">
                        {directoryLabels[selectedStep.directory]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedStep.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedStep.directory !== "personal" && (
                      <Button variant="outline" size="sm">
                        <Copy className="mr-2 h-4 w-4" />
                        复制到个人目录
                      </Button>
                    )}
                    {canEdit && !isLocked && (
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        编辑
                      </Button>
                    )}
                    {isLocked && (
                      <Button variant="outline" size="sm" disabled>
                        <Lock className="mr-2 h-4 w-4" />
                        已锁定 ({selectedStep.lockedByName})
                      </Button>
                    )}
                    {selectedStep.directory === "personal" &&
                      selectedStep.status === "draft" && (
                        <Button size="sm">
                          <Send className="mr-2 h-4 w-4" />
                          提交审核
                        </Button>
                      )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-22rem)]">
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* 关联组件 */}
                      <div>
                        <h3 className="mb-3 font-semibold">关联组件</h3>
                        {selectedStep.components.length > 0 ? (
                          <div className="space-y-2">
                            {selectedStep.components.map((comp) => (
                              <div
                                key={comp.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div>
                                  <p className="font-medium">
                                    {comp.componentName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    ID: {comp.componentId}
                                  </p>
                                </div>
                                <Button variant="ghost" size="sm">
                                  查看详情
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            暂无关联组件
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* 参数配置 */}
                      <div>
                        <h3 className="mb-3 font-semibold">参数配置</h3>
                        {selectedStep.parameters.length > 0 ? (
                          <div className="rounded-lg border">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b bg-muted/50">
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    参数名
                                  </th>
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    类型
                                  </th>
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    必填
                                  </th>
                                  <th className="px-4 py-2 text-left text-sm font-medium">
                                    说明
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedStep.parameters.map((param) => (
                                  <tr key={param.id} className="border-b last:border-0">
                                    <td className="px-4 py-2 text-sm font-mono">
                                      {param.name}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {param.type}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                      {param.required ? (
                                        <Badge variant="destructive" className="text-xs">
                                          必填
                                        </Badge>
                                      ) : (
                                        <Badge variant="secondary" className="text-xs">
                                          可选
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-muted-foreground">
                                      {param.description || "-"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            暂无参数配置
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* 元信息 */}
                      <div>
                        <h3 className="mb-3 font-semibold">元信息</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">创建时间：</span>
                            <span>
                              {new Date(selectedStep.createdAt).toLocaleString(
                                "zh-CN"
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">更新时间：</span>
                            <span>
                              {new Date(selectedStep.updatedAt).toLocaleString(
                                "zh-CN"
                              )}
                            </span>
                          </div>
                          {selectedStep.ownerName && (
                            <div>
                              <span className="text-muted-foreground">创建者：</span>
                              <span>{selectedStep.ownerName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <FolderTree className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  请从左侧目录树中选择一个步骤
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
