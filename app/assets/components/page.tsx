"use client";

import { useState } from "react";
import {
  Search,
  LayoutGrid,
  LayoutList,
  Plus,
  Import,
  X,
  Package,
  Edit,
  Trash2,
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
import { useComponentsStore } from "@/lib/store/components-store";
import { useAuthStore } from "@/lib/store/auth-store";
import type { TestComponent } from "@/lib/types";

const componentTypes = [
  { value: "", label: "全部类型" },
  { value: "input", label: "输入框" },
  { value: "password", label: "密码框" },
  { value: "form", label: "表单" },
  { value: "button", label: "按钮" },
  { value: "select", label: "选择器" },
  { value: "modal", label: "弹窗" },
  { value: "table", label: "表格" },
  { value: "list", label: "列表" },
];

export default function ComponentsPage() {
  const { user } = useAuthStore();
  const { 
    components, 
    viewMode, 
    setViewMode, 
    addComponent, 
    updateComponent, 
    deleteComponent 
  } = useComponentsStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedComponent, setSelectedComponent] = useState<TestComponent | null>(null);

  // 弹窗状态
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const [editingComponent, setEditingComponent] = useState<TestComponent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // 表单状态
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "input",
    category: "",
  });

  const isTcOrAdmin = user?.role === "tc" || user?.role === "admin";

  // 过滤组件 - 测试组件不区分局点
  const filteredComponents = components.filter((comp) => {
    const matchesSearch =
      comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || comp.type === selectedType;
    return matchesSearch && matchesType;
  });

  // 新建组件
  const handleOpenCreate = () => {
    setEditingComponent(null);
    setForm({
      name: "",
      description: "",
      type: "input",
      category: "",
    });
    setComponentDialogOpen(true);
  };

  // 编辑组件
  const handleOpenEdit = () => {
    if (!selectedComponent) return;
    setEditingComponent(selectedComponent);
    setForm({
      name: selectedComponent.name,
      description: selectedComponent.description || "",
      type: selectedComponent.type,
      category: selectedComponent.category || "",
    });
    setComponentDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editingComponent) {
      updateComponent(editingComponent.id, {
        name: form.name,
        description: form.description,
        type: form.type,
        category: form.category,
      });
      setSelectedComponent({
        ...editingComponent,
        name: form.name,
        description: form.description,
        type: form.type,
        category: form.category,
      });
    } else {
      const newComp = addComponent({
        name: form.name,
        description: form.description,
        type: form.type,
        category: form.category,
        parameters: [],
        examples: [],
        ownerId: user?.id || "",
        ownerName: user?.name || "",
      });
      setSelectedComponent(newComp);
    }
    setComponentDialogOpen(false);
  };

  // 删除组件
  const handleDelete = () => {
    if (!selectedComponent) return;
    deleteComponent(selectedComponent.id);
    setSelectedComponent(null);
    setDeleteDialogOpen(false);
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">测试原子组件</h1>
          <p className="mt-1 text-muted-foreground">
            管理可复用的测试组件资产（不区分局点）
          </p>
        </div>
        <div className="flex gap-2">
          {isTcOrAdmin && (
            <Button variant="outline">
              <Import className="mr-2 h-4 w-4" />
              导入组件
            </Button>
          )}
          <Button onClick={handleOpenCreate}>
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
              <Input
                type="text"
                placeholder="搜索组件名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                {componentTypes.map((type) => (
                  <SelectItem key={type.value || "all"} value={type.value || "all"}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                        {comp.category && (
                          <Badge variant="secondary" className="text-xs">
                            {comp.category}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {comp.parameters?.length || 0} 个参数
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
                        {comp.category && (
                          <Badge variant="secondary">{comp.category}</Badge>
                        )}
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
                    {selectedComponent.category && (
                      <Badge variant="secondary">
                        {selectedComponent.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleOpenEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedComponent(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <CardContent className="p-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-2 text-sm font-medium">描述</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedComponent.description || "暂无描述"}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="mb-2 text-sm font-medium">参数列表</h4>
                    {selectedComponent.parameters && selectedComponent.parameters.length > 0 ? (
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
                    {selectedComponent.examples && selectedComponent.examples.length > 0 ? (
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

                  <Separator />

                  <div>
                    <h4 className="mb-2 text-sm font-medium">元信息</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">创建人：</span>
                        {selectedComponent.ownerName || "未知"}
                      </p>
                      <p>
                        <span className="text-muted-foreground">创建时间：</span>
                        {new Date(selectedComponent.createdAt).toLocaleString("zh-CN")}
                      </p>
                      <p>
                        <span className="text-muted-foreground">更新时间：</span>
                        {new Date(selectedComponent.updatedAt).toLocaleString("zh-CN")}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        )}
      </div>

      {/* 新建/编辑组件弹窗 */}
      <Dialog open={componentDialogOpen} onOpenChange={setComponentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingComponent ? "编辑组件" : "新建组件"}</DialogTitle>
            <DialogDescription>
              {editingComponent ? "修改组件信息" : "填写组件基本信息"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="comp-name">组件名称</Label>
              <Input
                id="comp-name"
                placeholder="请输入组件名称"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="comp-desc">组件描述</Label>
              <Textarea
                id="comp-desc"
                placeholder="请输入组件描述"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>组件类型</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.filter(t => t.value).map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comp-category">分类标签</Label>
              <Input
                id="comp-category"
                placeholder="如：用户认证、数据查询"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComponentDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingComponent ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除组件 "{selectedComponent?.name}" 吗？该操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
