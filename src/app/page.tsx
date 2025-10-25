import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import DashboardGrid from '@/components/dashboard/dashboard-grid';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar collapsible="icon">
          <AppSidebar />
        </Sidebar>
        <SidebarInset className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <DashboardGrid />
          </main>
          <footer className="border-t bg-background px-4 py-2 sm:px-6">
            <p className="text-center text-xs text-muted-foreground">
              The EWARS system has been developed with funding support from The
              Global Fund and TA provided by IMACS.
            </p>
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
