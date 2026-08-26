"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Database,
  FlaskConical,
  GitCompare,
  Home,
  Leaf,
  Library,
  Lightbulb,
  ListTree,
  Sparkles,
  Tags,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/user-menu";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/app", label: "Home", icon: Home }],
  },
  {
    label: "Data",
    items: [
      { href: "/app/synthetic", label: "Synthetic", icon: Database },
      { href: "/app/real", label: "Real", icon: Library },
    ],
  },
  {
    label: "Models",
    items: [
      { href: "/app/modeling", label: "Modeling", icon: ListTree },
      { href: "/app/explainability", label: "Explainability", icon: Lightbulb },
    ],
  },
  {
    label: "Analysis",
    items: [
      { href: "/app/prediction", label: "Prediction", icon: FlaskConical },
      { href: "/app/results", label: "Results", icon: GitCompare },
      { href: "/app/classification", label: "Classification", icon: Tags },
      { href: "/app/ingredients", label: "Ingredients", icon: Leaf },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/app/how-it-works", label: "How it works", icon: Sparkles },
      { href: "/app/references", label: "References", icon: BookOpen },
    ],
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#eadfe2] [&>[data-slot=sidebar-inner]]:bg-[linear-gradient(180deg,#fffafd_0%,#fff_44%,#fff9fb_100%)] [&>[data-slot=sidebar-inner]]:backdrop-blur-xl"
    >
      <SidebarHeader className="relative h-[76px] overflow-hidden border-b border-[#6f1029] bg-[linear-gradient(135deg,#66001d,#3d0616)] px-3 py-0 text-white">
        <div className="pointer-events-none absolute -right-10 -top-12 size-28 rounded-full bg-[#b44a68]/28 blur-2xl" />
        <Link
          href="/app"
          className="relative flex h-full items-center gap-2.5 rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 shadow-[0_8px_24px_-14px_rgba(0,0,0,.65)] backdrop-blur">
            <FlaskConical className="size-4 text-white" strokeWidth={1.8} />
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block truncate text-[0.91rem] font-semibold tracking-[-0.025em] text-white">
              Shelf-Life Studio
            </span>
            <span className="mt-0.5 block text-[0.54rem] text-white/52">Research workspace</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 pt-2">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="py-1.5">
            <SidebarGroupLabel className="h-6 px-2 text-[0.62rem] font-semibold tracking-[0.08em] text-[#a08d94] uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={item.label}
                        className="h-8 gap-2 rounded-lg px-2.5 text-[0.78rem] font-medium text-[#665b60] transition-all hover:bg-[#f8ecef] hover:text-[#4d3039] data-[active=true]:bg-[linear-gradient(135deg,#a01f41,#7a1732)] data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-[0_10px_24px_-18px_rgba(122,27,46,.78)]"
                        render={<Link href={item.href} />}
                      >
                        <item.icon
                          className={active ? "size-4 text-white" : "size-4 text-[#9d8d93]"}
                          strokeWidth={1.7}
                        />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-[#eadfe2] bg-white/72 p-2 backdrop-blur">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
