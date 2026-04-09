"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Workflow,
  Play,
  Edit,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  X,
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
import { mockBlueprints } from "@/lib/mock/blueprints";
import { mockSteps } from "@/lib/mock/steps";
import type { Blueprint, BlueprintStep } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusLabels = {
  draft: "草稿",
  active: "已发布",
};

const statusVariants: Record<string, "secondary" | "success"> = {
  draft: "secondary",
  active: "success",
};

export default function BlueprintsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editingSteps, setEditingSteps] = useState<BlueprintStep[]>([]);

  const filteredBlueprints = mockBlueprints.filter(
    (bp) =>
      bp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBlueprint = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setEditingSteps(blueprint.steps);
    setIsEditing(false);
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

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">用例场景蓝图</h1>
          <p className="mt-1 text-muted-foreground">编排和管理测试场景流程</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建蓝图
        </Button>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* 蓝图列表 */}
        <Card className="w-96 shrink-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">蓝图列表</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索蓝图..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border bg-background py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="space-y-2 px-4 pb-4">
                {filteredBlueprints.map((blueprint) => (
                  <Card
                    key={blueprint.id}
                    className={cn(
                      "cursor-pointer transition-shadow hover:shadow-md",
                      selectedBlueprint?.id === blueprint.id &&
                        "ring-2 ring-primary"
                    )}
                    onClick={() => handleSelectBlueprint(blueprint)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Workflow className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{blueprint.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {blueprint.siteName}
                            </p>
                          </div>
                        </div>
                        <Badge variant={statusVariants[blueprint.status]}>
                          {statusLabels[blueprint.status]}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {blueprint.description}
                      </p>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {blueprint.steps.length} 个步骤
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {filteredBlueprints.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    没有找到匹配的蓝图
                  </div>
                )}
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
                    </div>
                    <CardDescription className="mt-1">
                      {selectedBlueprint.description}
                    </CardDescription>
                    <div className="mt-2 flex gap-2">
                      <Badge variant="outline">
                        {selectedBlueprint.siteName}
                      </Badge>
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
                            setEditingSteps(selectedBlueprint.steps);
                            setIsEditing(false);
                          }}
                        >
                          取消
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            // TODO: 保存编辑
                            setIsEditing(false);
                          }}
                        >
                          保存
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </Button>
                        <Button variant="outline" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          执行
                        </Button>
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
                              {step.order}
                            </div>

                            {/* 步骤卡片 */}
                            <Card
                              className={cn(
                                "flex-1 transition-shadow",
                                isEditing && "cursor-move hover:shadow-md"
                              )}
                            >
                              <CardContent className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  {isEditing && (
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
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
                                {isEditing && (
                                  <div className="flex items-center gap-1">
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
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                        ))}

                        {editingSteps.length === 0 && (
                          <div className="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed">
                            <p className="text-muted-foreground">
                              暂无步骤，点击右侧添加步骤
                            </p>
                          </div>
                        )}

                        {isEditing && (
                          <div className="relative flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-dashed">
                              <Plus className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <Button
                              variant="outline"
                              className="flex-1 h-12 border-dashed"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              添加步骤
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>

                  {/* 可用步骤列表（编辑模式下显示） */}
                  {isEditing && (
                    <>
                      <Separator orientation="vertical" />
                      <div className="w-72 shrink-0">
                        <div className="border-b p-4">
                          <h4 className="font-medium">可用步骤</h4>
                          <p className="text-sm text-muted-foreground">
                            拖拽或点击添加到蓝图
                          </p>
                        </div>
                        <ScrollArea className="h-[calc(100vh-28rem)]">
                          <div className="space-y-2 p-4">
                            {mockSteps
                              .filter((s) => s.status === "approved")
                              .map((step) => (
                                <Card
                                  key={step.id}
                                  className="cursor-pointer transition-shadow hover:shadow-md"
                                  onClick={() => {
                                    const newStep: BlueprintStep = {
                                      id: `bs-new-${Date.now()}`,
                                      stepId: step.id,
                                      stepName: step.name,
                                      order: editingSteps.length + 1,
                                      parameters: {},
                                    };
                                    setEditingSteps([...editingSteps, newStep]);
                                  }}
                                >
                                  <CardContent className="p-3">
                                    <p className="text-sm font-medium">
                                      {step.name}
                                    </p>
                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                      {step.description}
                                    </p>
                                  </CardContent>
                                </Card>
                              ))}
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
                  请从左侧列表中选择一个蓝图
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
