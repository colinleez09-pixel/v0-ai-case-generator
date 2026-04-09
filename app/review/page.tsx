"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Package,
  Workflow,
  ChevronRight,
  ArrowLeft,
  Plus,
  Minus,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReviewsStore } from "@/lib/store/reviews-store";
import { useAuthStore } from "@/lib/store/auth-store";
import type { ReviewItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "pending", label: "待我审核", icon: Clock },
  { id: "reviewed", label: "我已审核", icon: CheckCircle },
];

const typeIcons: Record<string, any> = {
  step: FileText,
  component: Package,
  blueprint: Workflow,
};

const typeLabels: Record<string, string> = {
  step: "步骤",
  component: "组件",
  blueprint: "蓝图",
};

const statusLabels: Record<string, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
};

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  approved: "outline",
  rejected: "destructive",
};

// Diff 视图组件
function DiffView({ 
  original, 
  updated 
}: { 
  original: Record<string, any> | null; 
  updated: Record<string, any> | null;
}) {
  if (!original && !updated) {
    return <p className="text-sm text-muted-foreground">无数据</p>;
  }

  const allKeys = new Set([
    ...Object.keys(original || {}),
    ...Object.keys(updated || {}),
  ]);

  return (
    <div className="space-y-2">
      {Array.from(allKeys).map((key) => {
        const oldVal = original?.[key];
        const newVal = updated?.[key];
        const isAdded = oldVal === undefined && newVal !== undefined;
        const isRemoved = oldVal !== undefined && newVal === undefined;
        const isChanged = oldVal !== undefined && newVal !== undefined && JSON.stringify(oldVal) !== JSON.stringify(newVal);
        const isUnchanged = !isAdded && !isRemoved && !isChanged;

        return (
          <div
            key={key}
            className={cn(
              "rounded-lg border p-3 text-sm",
              isAdded && "border-green-500/50 bg-green-500/10",
              isRemoved && "border-red-500/50 bg-red-500/10",
              isChanged && "border-amber-500/50 bg-amber-500/10",
              isUnchanged && "border-border bg-muted/30"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              {isAdded && <Plus className="h-3 w-3 text-green-600" />}
              {isRemoved && <Minus className="h-3 w-3 text-red-600" />}
              <span className="font-medium">{key}</span>
              {isAdded && <Badge className="text-xs bg-green-600">新增</Badge>}
              {isRemoved && <Badge variant="destructive" className="text-xs">删除</Badge>}
              {isChanged && <Badge className="text-xs bg-amber-600">修改</Badge>}
            </div>
            {isChanged ? (
              <div className="space-y-1 pl-5">
                <div className="flex items-center gap-2">
                  <span className="text-red-600 line-through">
                    {typeof oldVal === 'object' ? JSON.stringify(oldVal) : String(oldVal)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">
                    {typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="pl-5 text-muted-foreground">
                {typeof (newVal ?? oldVal) === 'object' 
                  ? JSON.stringify(newVal ?? oldVal) 
                  : String(newVal ?? oldVal)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ReviewPage() {
  const { user } = useAuthStore();
  const { 
    reviews, 
    activeTab, 
    selectedReview,
    setActiveTab, 
    setSelectedReview,
    approveReview,
    rejectReview,
    getPendingReviews,
    getReviewedReviews,
  } = useReviewsStore();

  const [rejectReason, setRejectReason] = useState("");
  const [approveComment, setApproveComment] = useState("");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const isTcOrAdmin = user?.role === "tc" || user?.role === "admin";

  const filteredReviews = activeTab === "pending" 
    ? getPendingReviews() 
    : getReviewedReviews();

  const handleApprove = () => {
    if (!selectedReview || !user) return;
    approveReview(selectedReview.id, user.id, user.name, approveComment);
    setApproveComment("");
    setApproveDialogOpen(false);
    setSelectedReview(null);
  };

  const handleReject = () => {
    if (!selectedReview || !user || !rejectReason.trim()) return;
    rejectReview(selectedReview.id, user.id, user.name, rejectReason);
    setRejectReason("");
    setRejectDialogOpen(false);
    setSelectedReview(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 详情视图
  if (selectedReview) {
    const TypeIcon = typeIcons[selectedReview.type] || FileText;

    return (
      <div className="flex h-full flex-col p-6">
        <Button
          variant="ghost"
          className="mb-4 w-fit"
          onClick={() => setSelectedReview(null)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回列表
        </Button>

        <Card className="flex-1 overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <TypeIcon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>{selectedReview.assetName}</CardTitle>
                  <CardDescription className="mt-1">
                    {selectedReview.changeDescription}
                  </CardDescription>
                </div>
              </div>
              <Badge variant={statusVariants[selectedReview.status]}>
                {statusLabels[selectedReview.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex h-[calc(100vh-18rem)]">
              {/* 变更对比 */}
              <ScrollArea className="flex-1 p-6">
                <h3 className="mb-4 font-semibold">变更对比（Diff 视图）</h3>
                <DiffView 
                  original={selectedReview.originalData} 
                  updated={selectedReview.newData} 
                />
              </ScrollArea>

              {/* 审核信息 */}
              <Separator orientation="vertical" />
              <div className="w-80 shrink-0 p-6">
                <h3 className="mb-4 font-semibold">审核信息</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">提交人</p>
                    <p className="font-medium">{selectedReview.submitterName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">提交时间</p>
                    <p className="font-medium">
                      {formatDate(selectedReview.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">资产类型</p>
                    <p className="font-medium">
                      {typeLabels[selectedReview.type] || selectedReview.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">目标目录</p>
                    <p className="font-medium">
                      {selectedReview.targetDirectory}
                    </p>
                  </div>

                  {selectedReview.status !== "pending" && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">审核人</p>
                        <p className="font-medium">
                          {selectedReview.reviewerName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">审核时间</p>
                        <p className="font-medium">
                          {selectedReview.reviewedAt
                            ? formatDate(selectedReview.reviewedAt)
                            : "-"}
                        </p>
                      </div>
                      {selectedReview.reviewComment && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            审核意见
                          </p>
                          <p className="font-medium">
                            {selectedReview.reviewComment}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {selectedReview.status === "pending" && isTcOrAdmin && (
                    <>
                      <Separator />
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => setRejectDialogOpen(true)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          拒绝
                        </Button>
                        <Button 
                          className="flex-1" 
                          onClick={() => setApproveDialogOpen(true)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          通过
                        </Button>
                      </div>
                    </>
                  )}

                  {selectedReview.status === "pending" && !isTcOrAdmin && (
                    <>
                      <Separator />
                      <p className="text-sm text-muted-foreground text-center py-4">
                        仅 TC 或管理员可以审核
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 通过确认弹窗 */}
        <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认通过</DialogTitle>
              <DialogDescription>
                确定要通过此审核申请吗？通过后资产将生效。
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="approve-comment">审核意见（可选）</Label>
              <Textarea
                id="approve-comment"
                placeholder="请输入审核意见..."
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle className="mr-2 h-4 w-4" />
                确认通过
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 拒绝确认弹窗 */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认拒绝</DialogTitle>
              <DialogDescription>
                请填写拒绝理由，以便提交人了解原因。
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="reject-reason">拒绝理由 *</Label>
              <Textarea
                id="reject-reason"
                placeholder="请输入拒绝理由..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                取消
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                <XCircle className="mr-2 h-4 w-4" />
                确认拒绝
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">审核中心</h1>
        <p className="mt-1 text-muted-foreground">审核资产变更申请</p>
      </div>

      {/* Tab 切换 */}
      <div className="mb-6 flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const count = tab.id === "pending" 
            ? getPendingReviews().length 
            : getReviewedReviews().length;

          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id as 'pending' | 'reviewed')}
            >
              <Icon className="mr-2 h-4 w-4" />
              {tab.label}
              <Badge
                variant={activeTab === tab.id ? "secondary" : "outline"}
                className="ml-2"
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {!isTcOrAdmin && (
        <div className="mb-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          您当前是普通用户，可以查看审核记录但无法进行审核操作。
        </div>
      )}

      {/* 审核列表 */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="divide-y">
            {filteredReviews.map((review) => {
              const TypeIcon = typeIcons[review.type] || FileText;
              return (
                <div
                  key={review.id}
                  className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50"
                  onClick={() => setSelectedReview(review)}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-muted p-2">
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{review.assetName}</p>
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[review.type] || review.type}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {review.changeDescription}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>提交人: {review.submitterName}</span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariants[review.status]}>
                      {statusLabels[review.status]}
                    </Badge>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              );
            })}
            {filteredReviews.length === 0 && (
              <div className="flex h-[200px] items-center justify-center">
                <div className="text-center">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">暂无审核记录</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>
    </div>
  );
}
