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
import { mockReviews } from "@/lib/mock/reviews";
import type { ReviewRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "pending", label: "待我审核", icon: Clock },
  { id: "reviewed", label: "我已审核", icon: CheckCircle },
];

const typeIcons = {
  step: FileText,
  component: Package,
  blueprint: Workflow,
};

const typeLabels = {
  step: "步骤",
  component: "组件",
  blueprint: "蓝图",
};

const statusLabels = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "success" | "destructive"
> = {
  pending: "secondary",
  approved: "success",
  rejected: "destructive",
};

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(
    null
  );
  const [rejectReason, setRejectReason] = useState("");

  const filteredReviews = mockReviews.filter((review) => {
    if (activeTab === "pending") {
      return review.status === "pending";
    }
    return review.status === "approved" || review.status === "rejected";
  });

  const handleApprove = () => {
    // TODO: 实现审核通过逻辑
    setSelectedReview(null);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    // TODO: 实现审核拒绝逻辑
    setSelectedReview(null);
    setRejectReason("");
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
    const TypeIcon = typeIcons[selectedReview.type];

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
              <div className="flex-1 overflow-auto p-6">
                <h3 className="mb-4 font-semibold">变更对比</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* 原始数据 */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                      变更前
                    </h4>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      {selectedReview.originalData ? (
                        <pre className="overflow-x-auto text-sm">
                          {JSON.stringify(selectedReview.originalData, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          新增资产，无原始数据
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 新数据 */}
                  <div>
                    <h4 className="mb-2 text-sm font-medium text-muted-foreground">
                      变更后
                    </h4>
                    <div className="rounded-lg border bg-emerald-500/10 p-4">
                      {selectedReview.newData ? (
                        <pre className="overflow-x-auto text-sm">
                          {JSON.stringify(selectedReview.newData, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          删除资产
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

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
                      {typeLabels[selectedReview.type]}
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
                      {selectedReview.reviewerComment && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            审核意见
                          </p>
                          <p className="font-medium">
                            {selectedReview.reviewerComment}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {selectedReview.status === "pending" && (
                    <>
                      <Separator />
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          拒绝理由（可选）
                        </label>
                        <textarea
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="请输入拒绝理由..."
                          className="h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={handleReject}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          拒绝
                        </Button>
                        <Button className="flex-1" onClick={handleApprove}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          通过
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
          const count = mockReviews.filter((r) =>
            tab.id === "pending"
              ? r.status === "pending"
              : r.status !== "pending"
          ).length;

          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
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

      {/* 审核列表 */}
      <Card className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="divide-y">
            {filteredReviews.map((review) => {
              const TypeIcon = typeIcons[review.type];
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
                          {typeLabels[review.type]}
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
