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
import { Badge } from "@/components/ui/badge";
import { mockSites } from "@/lib/mock/sites";
import { mockSteps } from "@/lib/mock/steps";
import { mockComponents } from "@/lib/mock/components";

export default function SiteManagementPage() {
  const [sites] = useState(mockSites);

  // 统计每个局点的资产数量
  const getSiteStats = (siteId: string) => {
    const steps = mockSteps.filter((s) => s.siteId === siteId).length;
    const components = mockComponents.filter((c) => c.siteId === siteId).length;
    return { steps, components };
  };

  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">局点管理</h1>
          <p className="mt-1 text-muted-foreground">管理系统中的局点配置</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建局点
        </Button>
      </div>

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
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
    </div>
  );
}
