"use client";

import { useState, useMemo } from "react";
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
  FolderPlus,
  Eye,
  User,
  UserCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useStepsStore } from "@/lib/store/steps-store";
import { useSitesStore } from "@/lib/store/sites-store";
import { useAuthStore } from "@/lib/store/auth-store";
import type { DirectoryNode, TestStep, StepCategory } from "@/lib/types";

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

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  draft: "secondary",
  pending: "default",
  approved: "outline",
  rejected: "destructive",
};

function TreeNode({
  node,
  level = 0,
  selectedId,
  onSelect,
  searchQuery,
}: {
  node: DirectoryNode;
  level?: number;
  selectedId: string | null;
  onSelect: (node: DirectoryNode) => void;
  searchQuery: string;
}) {
  const [expanded, setExpanded] = useState(level < 2);

  const isFolder = node.type === "folder";
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  // 搜索过滤
  const matchesSearch = searchQuery
    ? node.name.toLowerCase().includes(searchQuery.toLowerCase())
    : true;

  const hasMatchingChildren = useMemo(() => {
    if (!searchQuery || !node.children) return false;
    const checkChildren = (children: DirectoryNode[]): boolean => {
      return children.some(
        (child) =>
          child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (child.children && checkChildren(child.children))
      );
    };
    return checkChildren(node.children);
  }, [node.children, searchQuery]);

  if (searchQuery && !matchesSearch && !hasMatchingChildren) {
    return null;
  }

  return (
    <div>
      <button
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
          isSelected && "bg-primary/10 text-primary"
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
      {isFolder && (expanded || (searchQuery && hasMatchingChildren)) && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StepsPage() {
  const { user } = useAuthStore();
  const { currentSite } = useSitesStore();
  const { steps, categories, addStep, updateStep, copyStep, submitForReview, addCategory } = useStepsStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<DirectoryNode | null>(null);
  const [selectedStep, setSelectedStep] = useState<TestStep | null>(null);

  // 弹窗状态
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<TestStep | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [componentDetailOpen, setComponentDetailOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<any>(null);

  // 表单状态
  const [stepForm, setStepForm] = useState({
    name: "",
    description: "",
    directory: "personal" as "baseline" | "site" | "personal",
    categoryId: "",
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    directory: "personal" as "baseline" | "site" | "personal",
    parentId: "",
  });

  // 构建目录树
  const directoryTree = useMemo(() => {
    const buildTree = (): DirectoryNode[] => {
      const tree: DirectoryNode[] = [
        {
          id: "baseline",
          name: "基线目录",
          type: "folder",
          directory: "baseline",
          children: categories
            .filter((c) => c.directory === "baseline")
            .map((cat) => ({
              id: cat.id,
              name: cat.name,
              type: "folder" as const,
              directory: "baseline" as const,
              children: steps
                .filter((s) => s.categoryId === cat.id)
                .map((step) => ({
                  id: `step-node-${step.id}`,
                  name: step.name,
                  type: "step" as const,
                  directory: "baseline" as const,
                  stepId: step.id,
                })),
            })),
        },
        {
          id: "site",
          name: `局点目录 (${currentSite?.name || "未选择"})`,
          type: "folder",
          directory: "site",
          children: categories
            .filter((c) => c.directory === "site" && c.siteId === currentSite?.id)
            .map((cat) => ({
              id: cat.id,
              name: cat.name,
              type: "folder" as const,
              directory: "site" as const,
              children: steps
                .filter((s) => s.categoryId === cat.id)
                .map((step) => ({
                  id: `step-node-${step.id}`,
                  name: step.name,
                  type: "step" as const,
                  directory: "site" as const,
                  stepId: step.id,
                })),
            })),
        },
        {
          id: "personal",
          name: "个人目录",
          type: "folder",
          directory: "personal",
          children: categories
            .filter((c) => c.directory === "personal" && c.ownerId === user?.id)
            .map((cat) => ({
              id: cat.id,
              name: cat.name,
              type: "folder" as const,
              directory: "personal" as const,
              children: steps
                .filter((s) => s.categoryId === cat.id)
                .map((step) => ({
                  id: `step-node-${step.id}`,
                  name: step.name,
                  type: "step" as const,
                  directory: "personal" as const,
                  stepId: step.id,
                })),
            })),
        },
      ];
      return tree;
    };
    return buildTree();
  }, [categories, steps, currentSite, user]);

  const handleNodeSelect = (node: DirectoryNode) => {
    setSelectedNode(node);
    if (node.type === "step" && node.stepId) {
      const step = steps.find((s) => s.id === node.stepId);
      setSelectedStep(step || null);
    } else {
      setSelectedStep(null);
    }
  };

  const canEdit =
    selectedStep &&
    (selectedStep.directory === "personal" ||
      (selectedStep.directory === "site" && (user?.role === "tc" || user?.role === "admin")) ||
      user?.role === "admin");

  const canCreateInSite = user?.role === "tc" || user?.role === "admin";
  const isLocked = selectedStep?.lockedBy && selectedStep.lockedBy !== user?.id;

  // 新建步骤
  const handleOpenCreateStep = () => {
    setEditingStep(null);
    setStepForm({
      name: "",
      description: "",
      directory: "personal",
      categoryId: "",
    });
    setStepDialogOpen(true);
  };

  // 编辑步骤
  const handleOpenEditStep = () => {
    if (!selectedStep) return;
    setEditingStep(selectedStep);
    setStepForm({
      name: selectedStep.name,
      description: selectedStep.description || "",
      directory: selectedStep.directory,
      categoryId: selectedStep.categoryId,
    });
    setStepDialogOpen(true);
  };

  const handleSaveStep = () => {
    if (!stepForm.name.trim()) return;

    if (editingStep) {
      updateStep(editingStep.id, {
        name: stepForm.name,
        description: stepForm.description,
      });
      setSelectedStep({ ...editingStep, name: stepForm.name, description: stepForm.description });
    } else {
      const personalCategory = categories.find(
        (c) => c.directory === "personal" && c.ownerId === user?.id
      );
      const newStep = addStep({
        name: stepForm.name,
        description: stepForm.description,
        directory: stepForm.directory,
        categoryId: stepForm.categoryId || personalCategory?.id || "",
        siteId: currentSite?.id,
        ownerId: user?.id || "",
        ownerName: user?.name || "",
        status: "draft",
        components: [],
        parameters: [],
      });
      setSelectedStep(newStep);
    }
    setStepDialogOpen(false);
  };

  // 复制到个人目录
  const handleCopyToPersonal = () => {
    if (!selectedStep || !user) return;
    const personalCategory = categories.find(
      (c) => c.directory === "personal" && c.ownerId === user.id
    );
    if (!personalCategory) {
      // 先创建个人目录
      const newCat = addCategory({
        name: "我的步骤",
        directory: "personal",
        ownerId: user.id,
      });
      const copied = copyStep(selectedStep.id, newCat.id, user.id);
      setSelectedStep(copied);
    } else {
      const copied = copyStep(selectedStep.id, personalCategory.id, user.id);
      setSelectedStep(copied);
    }
    setCopyDialogOpen(false);
  };

  // 提交审核
  const handleSubmitForReview = () => {
    if (!selectedStep) return;
    submitForReview(selectedStep.id);
    setSelectedStep({ ...selectedStep, status: "pending" });
  };

  // 新建目录
  const handleOpenCreateCategory = () => {
    setCategoryForm({
      name: "",
      directory: canCreateInSite ? "site" : "personal",
      parentId: "",
    });
    setCategoryDialogOpen(true);
  };

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) return;
    addCategory({
      name: categoryForm.name,
      directory: categoryForm.directory,
      siteId: categoryForm.directory === "site" ? currentSite?.id : undefined,
      ownerId: categoryForm.directory === "personal" ? user?.id : undefined,
      parentId: categoryForm.parentId || undefined,
    });
    setCategoryDialogOpen(false);
  };

  // 查看组件详情
  const handleViewComponent = (comp: any) => {
    setSelectedComponent(comp);
    setComponentDetailOpen(true);
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">用例步骤资产</h1>
          <p className="mt-1 text-muted-foreground">
            管理和浏览测试用例步骤库
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenCreateCategory}>
            <FolderPlus className="mr-2 h-4 w-4" />
            新建目录
          </Button>
          <Button onClick={handleOpenCreateStep}>
            <Plus className="mr-2 h-4 w-4" />
            新建步骤
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* 左侧目录树 */}
        <Card className="w-80 shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">目录结构</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索步骤..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="px-2 pb-4">
                {directoryTree.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    selectedId={selectedNode?.id || null}
                    onSelect={handleNodeSelect}
                    searchQuery={searchQuery}
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
                      <Button variant="outline" size="sm" onClick={() => setCopyDialogOpen(true)}>
                        <Copy className="mr-2 h-4 w-4" />
                        复制到个人目录
                      </Button>
                    )}
                    {canEdit && !isLocked && (
                      <Button variant="outline" size="sm" onClick={handleOpenEditStep}>
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
                        <Button size="sm" onClick={handleSubmitForReview}>
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
                        {selectedStep.components && selectedStep.components.length > 0 ? (
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
                                <Button variant="ghost" size="sm" onClick={() => handleViewComponent(comp)}>
                                  <Eye className="mr-2 h-4 w-4" />
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
                        {selectedStep.parameters && selectedStep.parameters.length > 0 ? (
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
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">创建人：</span>
                            <span>{selectedStep.ownerName || "未知"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">创建时间：</span>
                            <span>
                              {new Date(selectedStep.createdAt).toLocaleString("zh-CN")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">审核人：</span>
                            <span>{selectedStep.reviewerId || "无"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">更新时间：</span>
                            <span>
                              {new Date(selectedStep.updatedAt).toLocaleString("zh-CN")}
                            </span>
                          </div>
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

      {/* 新建/编辑步骤弹窗 */}
      <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStep ? "编辑步骤" : "新建步骤"}</DialogTitle>
            <DialogDescription>
              {editingStep ? "修改步骤信息" : "填写步骤基本信息"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="step-name">步骤名称</Label>
              <Input
                id="step-name"
                placeholder="请输入步骤名称"
                value={stepForm.name}
                onChange={(e) => setStepForm({ ...stepForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="step-desc">步骤描述</Label>
              <Textarea
                id="step-desc"
                placeholder="请输入步骤描述"
                value={stepForm.description}
                onChange={(e) => setStepForm({ ...stepForm, description: e.target.value })}
              />
            </div>
            {!editingStep && (
              <div className="space-y-2">
                <Label>所属目录</Label>
                <Select
                  value={stepForm.directory}
                  onValueChange={(v) => setStepForm({ ...stepForm, directory: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">个人目录</SelectItem>
                    {canCreateInSite && <SelectItem value="site">局点目录</SelectItem>}
                    {user?.role === "admin" && <SelectItem value="baseline">基线目录</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStepDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveStep} disabled={!stepForm.name.trim()}>
              {editingStep ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建目录弹窗 */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建目录</DialogTitle>
            <DialogDescription>创建新的步骤分类目录</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">目录名称</Label>
              <Input
                id="cat-name"
                placeholder="请输入目录名称"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>目录类型</Label>
              <Select
                value={categoryForm.directory}
                onValueChange={(v) => setCategoryForm({ ...categoryForm, directory: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">个人目录</SelectItem>
                  {canCreateInSite && <SelectItem value="site">局点目录</SelectItem>}
                  {user?.role === "admin" && <SelectItem value="baseline">基线目录</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCategory} disabled={!categoryForm.name.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 复制确认弹窗 */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>复制到个人目录</DialogTitle>
            <DialogDescription>
              将步骤 "{selectedStep?.name}" 复制到您的个人目录中，复制后的步骤可以自由编辑。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCopyToPersonal}>
              确认复制
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 组件详情弹窗 */}
      <Dialog open={componentDetailOpen} onOpenChange={setComponentDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>组件详情</DialogTitle>
          </DialogHeader>
          {selectedComponent && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">组件名称</Label>
                <p className="font-medium">{selectedComponent.componentName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">组件 ID</Label>
                <p className="font-mono text-sm">{selectedComponent.componentId}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">参数配置</Label>
                {selectedComponent.params && Object.keys(selectedComponent.params).length > 0 ? (
                  <pre className="mt-2 rounded-lg bg-muted p-4 text-sm overflow-auto">
                    {JSON.stringify(selectedComponent.params, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">无参数配置</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setComponentDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
