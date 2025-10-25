import Header from '@/components/layout/header';
import DashboardGrid from '@/components/dashboard/dashboard-grid';
import PartnerLogos from '@/components/layout/partner-logos';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <DashboardGrid />
      </main>
      <footer className="border-t bg-background px-4 py-4 sm:px-6">
        <div className="flex flex-col items-center gap-4">
          <PartnerLogos />
          <p className="text-center text-xs text-muted-foreground">
            The EWARS system has been developed with funding support from The
            Global Fund and TA provided by IMACS.
          </p>
        </div>
      </footer>
    </div>
  );
}
