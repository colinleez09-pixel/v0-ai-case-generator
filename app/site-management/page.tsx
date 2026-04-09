"use client";

import { useState } from "react";
import { MapPin, Plus, Edit, Trash2, Users, Package, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSitesStore } from "@/lib/store/sites-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { mockSteps } from "@/lib/mock/steps";
import { mockComponents } from "@/lib/mock/components";

export default function SiteManagementPage() {
  const { user } = useAuthStore();
  const { sites, addSite, updateSite, deleteSite } = useSitesStore();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<{ id: string; name: string; code: string } | null>(null);
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "" });

  const isAdmin = user?.role === "admin";

  // 统计每个局点的资产数量
  const getSiteStats = (siteId: string) => {
    const steps = mockSteps.filter((s) => s.siteId === siteId).length;
    const components = mockComponents.filter((c) => c.siteId === siteId).length;
    return { steps, components };
  };

  const handleOpenCreate = () => {
    setEditingSite(null);
    setForm({ name: "", code: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (site: { id: string; name: string; code: string }) => {
    setEditingSite(site);
    setForm({ name: site.name, code: site.code });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return;

    if (editingSite) {
      updateSite(editingSite.id, { name: form.name, code: form.code });
    } else {
      addSite({ name: form.name, code: form.code });
    }
    setDialogOpen(false);
    setForm({ name: "", code: "" });
    setEditingSite(null);
  };

  const handleOpenDelete = (siteId: string) => {
    setDeletingSiteId(siteId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingSiteId) {
      deleteSite(deletingSiteId);
    }
    setDeleteDialogOpen(false);
    setDeletingSiteId(null);
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">局点管理</h1>
          <p className="mt-1 text-muted-foreground">管理系统中的局点配置</p>
        </div>
        {isAdmin && (
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建局点
          </Button>
        )}
      </div>

      {!isAdmin && (
        <div className="mb-4 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          仅系统管理员可以新建、编辑或删除局点
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sites.map((site) => {
          const stats = getSiteStats(site.id);
          return (
            <Card key={site.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{site.name}</CardTitle>
                      <CardDescription>代码: {site.code}</CardDescription>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(site)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleOpenDelete(site.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <FileText className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-2xl font-semibold">{stats.steps}</p>
                    <p className="text-xs text-muted-foreground">步骤</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <Package className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-2xl font-semibold">
                      {stats.components}
                    </p>
                    <p className="text-xs text-muted-foreground">组件</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <Users className="mx-auto h-5 w-5 text-muted-foreground" />
                    <p className="mt-1 text-2xl font-semibold">5</p>
                    <p className="text-xs text-muted-foreground">用户</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 新建/编辑局点弹窗 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSite ? "编辑局点" : "新建局点"}</DialogTitle>
            <DialogDescription>
              {editingSite ? "修改局点信息" : "填写局点基本信息"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">局点名称</Label>
              <Input
                id="site-name"
                placeholder="请输入局点名称"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-code">局点代码</Label>
              <Input
                id="site-code"
                placeholder="请输入局点代码（如 BJ、SH）"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim() || !form.code.trim()}>
              {editingSite ? "保存" : "创建"}
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
              确定要删除此局点吗？该操作不可撤销，局点下的所有资产将被清除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
