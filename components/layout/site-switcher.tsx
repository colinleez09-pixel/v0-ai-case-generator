"use client";

import { Check, ChevronsUpDown, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useSitesStore } from "@/lib/store/sites-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";

export function SiteSwitcher() {
  const { currentSite, sites, setCurrentSite } = useSitesStore();
  const { user } = useAuthStore();

  // 管理员可以访问所有局点，其他用户只能访问自己有权限的局点
  const isAdmin = user?.role === "admin";
  const userSiteIds = user?.sites || [];

  const accessibleSites = isAdmin 
    ? sites 
    : sites.filter(site => userSiteIds.includes(site.id));
  
  const restrictedSites = isAdmin 
    ? [] 
    : sites.filter(site => !userSiteIds.includes(site.id));

  const handleSiteSelect = (site: typeof sites[0]) => {
    if (!isAdmin && !userSiteIds.includes(site.id)) {
      return; // 无权限，不切换
    }
    setCurrentSite(site);
  };

  if (!currentSite) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-[160px] justify-between"
          aria-label="切换局点"
        >
          <span className="flex items-center gap-2 truncate">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{currentSite.name}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {accessibleSites.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              可访问的局点
            </DropdownMenuLabel>
            {accessibleSites.map((site) => (
              <DropdownMenuItem
                key={site.id}
                onClick={() => handleSiteSelect(site)}
                className="cursor-pointer"
              >
                <span className="flex flex-1 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{site.code}</span>
                  <span>{site.name}</span>
                </span>
                {currentSite.id === site.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        {restrictedSites.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              无权限的局点
            </DropdownMenuLabel>
            {restrictedSites.map((site) => (
              <DropdownMenuItem
                key={site.id}
                className="cursor-not-allowed opacity-50"
                disabled
              >
                <span className="flex flex-1 items-center gap-2">
                  <span className="text-xs text-muted-foreground">{site.code}</span>
                  <span>{site.name}</span>
                </span>
                <Lock className="h-3 w-3 text-muted-foreground" />
              </DropdownMenuItem>
            ))}
          </>
        )}

        {accessibleSites.length === 0 && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            暂无可访问的局点，请联系管理员
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
