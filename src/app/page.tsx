"use client";

import { useState, useRef, Suspense } from 'react';
import Header from '@/components/layout/header';
import NavigationTabs from '@/components/layout/navigation-tabs';
import OverviewTab from '@/components/dashboard/tabs/overview-tab';
import ModelTab from '@/components/dashboard/tabs/model-tab';
import AlertTab from '@/components/dashboard/tabs/alert-tab';
import DiseaseMapsTab from '@/components/dashboard/tabs/disease-maps-tab';
import SimulationTab from '@/components/dashboard/tabs/simulation-tab';
import DrilldownTab from '@/components/dashboard/tabs/drilldown-tab';
import DataEntryTab from '@/components/dashboard/tabs/data-entry-tab';
import PartnerLogos from '@/components/layout/partner-logos';

type Tab = 'overview' | 'model' | 'alert' | 'disease-maps' | 'simulation' | 'drilldown' | 'data-entry';

export const TAB_LABELS: Record<Tab, string> = {
  'overview': 'Overview',
  'model': 'Model',
  'alert': 'Alert',
  'disease-maps': 'Disease Maps',
  'simulation': 'Simulation',
  'drilldown': 'Climate Impact',
  'data-entry': 'Data Entry',
};

export const ALL_TABS: Tab[] = ['overview', 'disease-maps', 'alert', 'drilldown', 'simulation', 'model', 'data-entry'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const mainContentRef = useRef<HTMLDivElement>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'model':
        return <ModelTab />;
      case 'alert':
        return <AlertTab />;
      case 'disease-maps':
        return <DiseaseMapsTab />;
      case 'simulation':
        return <SimulationTab />;
      case 'drilldown':
        return <DrilldownTab />;
      case 'data-entry':
        return <DataEntryTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mainContentRef={mainContentRef}
      />
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <main ref={mainContentRef} className="flex-1 px-12 sm:px-18 lg:px-36 xl:px-48 2xl:px-72 py-4 sm:py-6 lg:py-8">
        <div className="mx-auto max-w-[1600px]">
          <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Loading...</div>}>
            {renderTabContent()}
          </Suspense>
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
