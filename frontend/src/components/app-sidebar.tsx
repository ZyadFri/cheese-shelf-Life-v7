"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

const MCGILL_LOGO =
  "https://www.mcgill.ca/visual-identity/files/visual-identity/red_on_white.png";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ href: "/app", label: "Home" }],
  },
  {
    label: "Data",
    items: [
      { href: "/app/synthetic", label: "Synthetic" },
      { href: "/app/real", label: "Real" },
    ],
  },
  {
    label: "Models",
    items: [
      { href: "/app/modeling", label: "Modeling" },
      { href: "/app/explainability", label: "Explainability" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { href: "/app/prediction", label: "Prediction" },
      { href: "/app/results", label: "Results" },
      { href: "/app/classification", label: "Classification" },
      { href: "/app/ingredients", label: "Ingredients" },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/app/how-it-works", label: "How it works" },
      { href: "/app/references", label: "References" },
    ],
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-[#eee2e5] [&>[data-slot=sidebar-inner]]:bg-[linear-gradient(180deg,#fffdfd_0%,#fffafa_48%,#fff6f8_100%)] [&>[data-slot=sidebar-inner]]:backdrop-blur-xl"
    >
      <SidebarHeader className="h-[76px] justify-center border-b border-[#f0e4e7] bg-white/88 px-4 py-0 backdrop-blur-xl">
        <Link
          href="/app"
          className="flex h-full items-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b12046]"
          aria-label="Shelf-Life Studio home"
        >
          <img
            src={MCGILL_LOGO}
            alt="McGill University"
            className="h-[34px] w-auto max-w-[154px] object-contain"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-3 pt-3">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="py-1.5">
            <SidebarGroupLabel className="h-6 px-2 text-[0.59rem] font-semibold tracking-[0.1em] text-[#b09aa1] uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const active =
                    item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        className="h-9 rounded-[10px] px-3 text-[0.78rem] font-medium text-[#75666c] transition-all hover:bg-[#faecef] hover:text-[#713146] data-[active=true]:bg-[linear-gradient(135deg,#a51d42,#821632)] data-[active=true]:font-semibold data-[active=true]:text-white data-[active=true]:shadow-[0_12px_28px_-20px_rgba(130,22,50,.66)]"
                        render={<Link href={item.href} />}
                      >
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

      <SidebarFooter className="border-t border-[#eee2e5] bg-white/68 p-2 backdrop-blur-xl">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
