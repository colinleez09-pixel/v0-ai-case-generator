"use client";

import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSiteStore } from "@/lib/store/site-store";
import { cn } from "@/lib/utils";

export function SiteSwitcher() {
  const { currentSite, sites, setCurrentSite } = useSiteStore();

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
      <DropdownMenuContent align="start" className="w-[160px]">
        {sites.map((site) => (
          <DropdownMenuItem
            key={site.id}
            onClick={() => setCurrentSite(site)}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
