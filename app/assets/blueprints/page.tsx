"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Workflow,
  Play,
  Edit,
  GripVertical,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  X,
  Copy,
  Send,
  FolderTree,
  Eye,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { useBlueprintsStore } from "@/lib/store/blueprints-store";
import { useStepsStore } from "@/lib/store/steps-store";
import { useSitesStore } from "@/lib/store/sites-store";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Blueprint, BlueprintStep, DirectoryNode, TestStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  draft: "草稿",
  pending: "审核中",
  approved: "已通过",
  rejected: "已拒绝",
};

const statusVariants: Record<string, "secondary" | "default" | "outline" | "destructive"> = {
  draft: "secondary",
  pending: "default",
  approved: "outline",
  rejected: "destructive",
};

const directoryLabels = {
  baseline: "基线",
  site: "局点",
  personal: "个人",
};

// 目录树节点组件
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
          <FolderTree className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <Workflow className="h-4 w-4 shrink-0 text-primary" />
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

export default function BlueprintsPage() {
  const { user } = useAuthStore();
  const { currentSite } = useSitesStore();
  const { steps } = useStepsStore();
  const { 
    blueprints, 
    addBlueprint, 
    updateBlueprint, 
    copyBlueprint, 
    submitForReview,
    addStepToBlueprint,
    removeStepFromBlueprint,
    reorderSteps,
  } = useBlueprintsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [stepSearchQuery, setStepSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<DirectoryNode | null>(null);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSteps, setEditingSteps] = useState<BlueprintStep[]>([]);

  // 弹窗状态
  const [blueprintDialogOpen, setBlueprintDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [stepDetailOpen, setStepDetailOpen] = useState(false);
  const [selectedStepDetail, setSelectedStepDetail] = useState<BlueprintStep | null>(null);

  // 表单状态
  const [form, setForm] = useState({
    name: "",
    description: "",
    directory: "personal" as "baseline" | "site" | "personal",
  });

  const canCreateInSite = user?.role === "tc" || user?.role === "admin";

  // 构建目录树
  const directoryTree = useMemo(() => {
    const tree: DirectoryNode[] = [
      {
        id: "baseline-bp",
        name: "基线蓝图",
        type: "folder",
        directory: "baseline",
        children: blueprints
          .filter((bp) => bp.directory === "baseline")
          .map((bp) => ({
            id: `bp-node-${bp.id}`,
            name: bp.name,
            type: "blueprint" as const,
            directory: "baseline" as const,
            blueprintId: bp.id,
          })),
      },
      {
        id: "site-bp",
        name: `局点蓝图 (${currentSite?.name || "未选择"})`,
        type: "folder",
        directory: "site",
        children: blueprints
          .filter((bp) => bp.directory === "site" && bp.siteId === currentSite?.id)
          .map((bp) => ({
            id: `bp-node-${bp.id}`,
            name: bp.name,
            type: "blueprint" as const,
            directory: "site" as const,
            blueprintId: bp.id,
          })),
      },
      {
        id: "personal-bp",
        name: "个人蓝图",
        type: "folder",
        directory: "personal",
        children: blueprints
          .filter((bp) => bp.directory === "personal" && bp.ownerId === user?.id)
          .map((bp) => ({
            id: `bp-node-${bp.id}`,
            name: bp.name,
            type: "blueprint" as const,
            directory: "personal" as const,
            blueprintId: bp.id,
          })),
      },
    ];
    return tree;
  }, [blueprints, currentSite, user]);

  // 当前局点的步骤
  const siteSteps = useMemo(() => {
    return steps.filter(
      (s) => 
        s.status === "approved" && 
        (s.directory === "baseline" || s.siteId === currentSite?.id)
    );
  }, [steps, currentSite]);

  // 过滤的步骤
  const filteredSteps = useMemo(() => {
    if (!stepSearchQuery.trim()) return siteSteps;
    const query = stepSearchQuery.toLowerCase();
    return siteSteps.filter(
      (s) => s.name.toLowerCase().includes(query) || s.description?.toLowerCase().includes(query)
    );
  }, [siteSteps, stepSearchQuery]);

  const handleNodeSelect = (node: DirectoryNode) => {
    setSelectedNode(node);
    if (node.type === "blueprint" && (node as any).blueprintId) {
      const bp = blueprints.find((b) => b.id === (node as any).blueprintId);
      if (bp) {
        setSelectedBlueprint(bp);
        setEditingSteps([...bp.steps]);
        setIsEditing(false);
      }
    } else {
      setSelectedBlueprint(null);
    }
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...editingSteps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;

    [newSteps[index], newSteps[targetIndex]] = [
      newSteps[targetIndex],
      newSteps[index],
    ];
    newSteps.forEach((step, idx) => {
      step.order = idx + 1;
    });
    setEditingSteps(newSteps);
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = editingSteps.filter((_, idx) => idx !== index);
    newSteps.forEach((step, idx) => {
      step.order = idx + 1;
    });
    setEditingSteps(newSteps);
  };

  const handleAddStep = (step: TestStep) => {
    const newStep: BlueprintStep = {
      id: `bs-${Date.now()}`,
      stepId: step.id,
      stepName: step.name,
      order: editingSteps.length + 1,
      parameters: {},
    };
    setEditingSteps([...editingSteps, newStep]);
  };

  const handleSaveEdit = () => {
    if (!selectedBlueprint) return;
    updateBlueprint(selectedBlueprint.id, { steps: editingSteps });
    setSelectedBlueprint({ ...selectedBlueprint, steps: editingSteps });
    setIsEditing(false);
  };

  // 新建蓝图
  const handleOpenCreate = () => {
    setForm({
      name: "",
      description: "",
      directory: "personal",
    });
    setBlueprintDialogOpen(true);
  };

  const handleSaveBlueprint = () => {
    if (!form.name.trim()) return;
    const newBp = addBlueprint({
      name: form.name,
      description: form.description,
      directory: form.directory,
      siteId: form.directory === "site" ? currentSite?.id : undefined,
      ownerId: user?.id || "",
      ownerName: user?.name || "",
      status: "draft",
      steps: [],
    });
    setSelectedBlueprint(newBp);
    setEditingSteps([]);
    setBlueprintDialogOpen(false);
  };

  // 复制到个人目录
  const handleCopyToPersonal = () => {
    if (!selectedBlueprint || !user) return;
    const copied = copyBlueprint(selectedBlueprint.id, "personal", user.id, user.name);
    setSelectedBlueprint(copied);
    setEditingSteps([...copied.steps]);
    setCopyDialogOpen(false);
  };

  // 提交审核
  const handleSubmitForReview = () => {
    if (!selectedBlueprint) return;
    submitForReview(selectedBlueprint.id);
    setSelectedBlueprint({ ...selectedBlueprint, status: "pending" });
  };

  // 查看步骤详情
  const handleViewStepDetail = (step: BlueprintStep) => {
    setSelectedStepDetail(step);
    setStepDetailOpen(true);
  };

  const getStepFullInfo = (stepId: string) => {
    return steps.find((s) => s.id === stepId);
  };

  const canEdit =
    selectedBlueprint &&
    (selectedBlueprint.directory === "personal" ||
      (selectedBlueprint.directory === "site" && canCreateInSite) ||
      user?.role === "admin");

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">用例场景蓝图</h1>
          <p className="mt-1 text-muted-foreground">编排和管理测试场景流程</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          新建蓝图
        </Button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* 左侧目录树 */}
        <Card className="w-72 shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">蓝图目录</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索蓝图..."
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

        {/* 蓝图详情 / 编辑区 */}
        <Card className="flex-1 overflow-hidden">
          {selectedBlueprint ? (
            <>
              <CardHeader className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{selectedBlueprint.name}</CardTitle>
                      <Badge variant={statusVariants[selectedBlueprint.status]}>
                        {statusLabels[selectedBlueprint.status]}
                      </Badge>
                      <Badge variant="outline">
                        {directoryLabels[selectedBlueprint.directory]}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {selectedBlueprint.description}
                    </CardDescription>
                    <div className="mt-2">
                      <Badge variant="secondary">
                        {editingSteps.length} 个步骤
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSteps([...selectedBlueprint.steps]);
                            setIsEditing(false);
                          }}
                        >
                          取消
                        </Button>
                        <Button size="sm" onClick={handleSaveEdit}>
                          保存
                        </Button>
                      </>
                    ) : (
                      <>
                        {selectedBlueprint.directory !== "personal" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCopyDialogOpen(true)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            复制到个人
                          </Button>
                        )}
                        {canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </Button>
                        )}
                        {selectedBlueprint.directory === "personal" &&
                          selectedBlueprint.status === "draft" && (
                            <Button size="sm" onClick={handleSubmitForReview}>
                              <Send className="mr-2 h-4 w-4" />
                              提交审核
                            </Button>
                          )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex h-[calc(100vh-22rem)]">
                  {/* 步骤画布 */}
                  <ScrollArea className="flex-1 p-6">
                    <div className="relative">
                      {/* 垂直连接线 */}
                      {editingSteps.length > 1 && (
                        <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-border" />
                      )}

                      <div className="space-y-4">
                        {editingSteps.map((step, index) => (
                          <div key={step.id} className="relative flex gap-4">
                            {/* 步骤序号 */}
                            <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 bg-background font-semibold">
                              {index + 1}
                            </div>

                            {/* 步骤卡片 */}
                            <Card
                              className={cn(
                                "flex-1 transition-shadow",
                                isEditing && "hover:shadow-md"
                              )}
                            >
                              <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  {isEditing && (
                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                                  )}
                                  <div>
                                    <p className="font-medium">
                                      {step.stepName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      步骤 ID: {step.stepId}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleViewStepDetail(step)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {isEditing && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={index === 0}
                                        onClick={() =>
                                          handleMoveStep(index, "up")
                                        }
                                      >
                                        <ChevronUp className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={
                                          index === editingSteps.length - 1
                                        }
                                        onClick={() =>
                                          handleMoveStep(index, "down")
                                        }
                                      >
                                        <ChevronDown className="h-4 w-4" />
                                      </Button>
                                      <Separator
                                        orientation="vertical"
                                        className="mx-1 h-6"
                                      />
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => handleRemoveStep(index)}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        ))}

                        {editingSteps.length === 0 && (
                          <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
                            <p className="text-muted-foreground">
                              暂无步骤，{isEditing ? "从右侧添加步骤" : "点击编辑添加步骤"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>

                  {/* 可用步骤列表（编辑模式下显示） */}
                  {isEditing && (
                    <>
                      <Separator orientation="vertical" />
                      <div className="w-72 shrink-0 flex flex-col">
                        <div className="border-b p-4">
                          <h4 className="font-medium">可用步骤</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            当前局点的已审核步骤
                          </p>
                          <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="搜索步骤..."
                              value={stepSearchQuery}
                              onChange={(e) => setStepSearchQuery(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <ScrollArea className="flex-1">
                          <div className="space-y-2 p-4">
                            {filteredSteps.map((step) => (
                              <Card
                                key={step.id}
                                className="cursor-pointer transition-shadow hover:shadow-md"
                                onClick={() => handleAddStep(step)}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData("stepId", step.id);
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium truncate">
                                        {step.name}
                                      </p>
                                      <p className="line-clamp-1 text-xs text-muted-foreground">
                                        {step.description}
                                      </p>
                                    </div>
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                            {filteredSteps.length === 0 && (
                              <p className="text-center text-sm text-muted-foreground py-4">
                                没有找到匹配的步骤
                              </p>
                            )}
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Workflow className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  请从左侧目录中选择一个蓝图
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 新建蓝图弹窗 */}
      <Dialog open={blueprintDialogOpen} onOpenChange={setBlueprintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建蓝图</DialogTitle>
            <DialogDescription>填写蓝图基本信息</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bp-name">蓝图名称</Label>
              <Input
                id="bp-name"
                placeholder="请输入蓝图名称"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bp-desc">蓝图描述</Label>
              <Textarea
                id="bp-desc"
                placeholder="请输入蓝图描述"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>所属目录</Label>
              <Select
                value={form.directory}
                onValueChange={(v) => setForm({ ...form, directory: v as any })}
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
            <Button variant="outline" onClick={() => setBlueprintDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveBlueprint} disabled={!form.name.trim()}>
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
              将蓝图 "{selectedBlueprint?.name}" 复制到您的个人目录中，复制后可以自由编辑。
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

      {/* 步骤详情弹窗 */}
      <Dialog open={stepDetailOpen} onOpenChange={setStepDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>步骤详情</DialogTitle>
          </DialogHeader>
          {selectedStepDetail && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">步骤名称</Label>
                <p className="font-medium">{selectedStepDetail.stepName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">步骤 ID</Label>
                <p className="font-mono text-sm">{selectedStepDetail.stepId}</p>
              </div>
              
              {/* 获取完整步骤信息 */}
              {(() => {
                const fullStep = getStepFullInfo(selectedStepDetail.stepId);
                return fullStep ? (
                  <>
                    <div>
                      <Label className="text-muted-foreground">步骤描述</Label>
                      <p className="text-sm">{fullStep.description || "无描述"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">参数配置</Label>
                      {fullStep.parameters && fullStep.parameters.length > 0 ? (
                        <div className="mt-2 rounded-lg border">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-3 py-2 text-left text-sm font-medium">参数名</th>
                                <th className="px-3 py-2 text-left text-sm font-medium">类型</th>
                                <th className="px-3 py-2 text-left text-sm font-medium">必填</th>
                                <th className="px-3 py-2 text-left text-sm font-medium">说明</th>
                              </tr>
                            </thead>
                            <tbody>
                              {fullStep.parameters.map((param) => (
                                <tr key={param.id} className="border-b last:border-0">
                                  <td className="px-3 py-2 text-sm font-mono">{param.name}</td>
                                  <td className="px-3 py-2 text-sm">{param.type}</td>
                                  <td className="px-3 py-2 text-sm">
                                    {param.required ? (
                                      <Badge variant="destructive" className="text-xs">必填</Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">可选</Badge>
                                    )}
                                  </td>
                                  <td className="px-3 py-2 text-sm text-muted-foreground">
                                    {param.description || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">无参数配置</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">无法获取步骤详细信息</p>
                );
              })()}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setStepDetailOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
