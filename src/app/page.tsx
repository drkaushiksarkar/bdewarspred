"use client";

import { useState } from 'react';
import Header from '@/components/layout/header';
import NavigationTabs from '@/components/layout/navigation-tabs';
import OverviewTab from '@/components/dashboard/tabs/overview-tab';
import ModelTab from '@/components/dashboard/tabs/model-tab';
import DiseaseMapsTab from '@/components/dashboard/tabs/disease-maps-tab';
import SimulationTab from '@/components/dashboard/tabs/simulation-tab';
import DataEntryTab from '@/components/dashboard/tabs/data-entry-tab';
import PartnerLogos from '@/components/layout/partner-logos';

type Tab = 'overview' | 'model' | 'disease-maps' | 'simulation' | 'data-entry';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'model':
        return <ModelTab />;
      case 'disease-maps':
        return <DiseaseMapsTab />;
      case 'simulation':
        return <SimulationTab />;
      case 'data-entry':
        return <DataEntryTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 px-12 sm:px-18 lg:px-36 xl:px-48 2xl:px-72 py-4 sm:py-6 lg:py-8">
        <div className="mx-auto max-w-[1600px]">
          {renderTabContent()}
        </div>
      </main>
      <footer className="border-t bg-white px-12 sm:px-18 lg:px-36 xl:px-48 2xl:px-72 py-4">
        <div className="mx-auto max-w-[1600px] flex flex-col items-center gap-4">
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
