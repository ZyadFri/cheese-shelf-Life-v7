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
    items: [{ href: "/app/data", label: "Data" }],
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
    ],
  },
] as const;

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="offcanvas"
      className="border-r border-[#eee5e8] [&>[data-slot=sidebar-inner]]:bg-[linear-gradient(180deg,#fff_0%,#fffdfd_52%,#fffafa_100%)]"
    >
      <SidebarHeader className="h-[72px] justify-center border-b border-[#f0e7ea] bg-white px-4 py-0">
        <Link
          href="/app"
          className="flex h-full flex-col items-start justify-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b12046]"
          aria-label="Shelf-Life Studio home"
        >
          <img
            src={MCGILL_LOGO}
            alt="McGill University"
            className="h-7 w-auto max-w-[146px] object-contain"
          />
          <span className="mt-0.5 pl-[2px] text-[0.53rem] font-medium tracking-[0.01em] text-[#7d686f]">
            Shelf-Life Studio
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-3 pt-3">
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label} className="py-1.5">
            <SidebarGroupLabel className="h-6 px-2 text-[0.58rem] font-semibold tracking-[0.11em] text-[#b19ba3] uppercase">
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
                        className="h-9 rounded-[11px] px-3 text-[0.78rem] font-medium text-[#75676c] transition-all hover:bg-[#f7f1f3] hover:text-[#65283e] data-[active=true]:bg-[linear-gradient(135deg,#fff0f4,#f9e7ed)] data-[active=true]:font-semibold data-[active=true]:text-[#7c2945] data-[active=true]:shadow-none"
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

      <SidebarFooter className="border-t border-[#eee5e8] bg-white/76 p-2 backdrop-blur-xl">
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
