import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { CommandPaletteProvider } from "@/components/command-palette";
import { PredictionStoreProvider } from "@/components/prediction-store";
import { AssistantChat } from "@/components/assistant-chat";
import { RequireAuth } from "@/components/require-auth";

/**
 * Authenticated application shell. Middleware already redirects visitors
 * without a session cookie; RequireAuth is the client-side counterpart that
 * covers the case where the cookie exists but the server rejects it (expired
 * or revoked), so the UI can't get stuck rendering a shell it can't fill.
 */
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return (
    <RequireAuth>
      <PredictionStoreProvider>
        <CommandPaletteProvider>
          {/* The shared <Ambience /> (mounted once in the root layout) is
              deliberately kept out of the authenticated workspace -- this
              shell paints its own opaque background so every app page reads
              as a plain, calm instrument rather than the marketing site's
              animated colour wash. */}
          <SidebarProvider>
            <AppSidebar />
            {/* min-w-0: without it this flex item defaults to min-width:auto,
                so a wide table stretches the whole column and produces a
                page-level horizontal scrollbar instead of scrolling inside
                its own overflow-x-auto container. */}
            <SidebarInset className="min-w-0 bg-background">
              <AppTopbar />
              {children}
            </SidebarInset>
          </SidebarProvider>
          <AssistantChat />
        </CommandPaletteProvider>
      </PredictionStoreProvider>
    </RequireAuth>
  );
}
