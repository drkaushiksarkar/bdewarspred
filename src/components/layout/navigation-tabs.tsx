"use client";

import { LayoutDashboard, Layers, Map, Activity, Upload, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'model' | 'disease-maps' | 'simulation' | 'drilldown' | 'data-entry';

interface NavigationTabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs = [
  { id: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
  { id: 'model' as Tab, label: 'Model', icon: Activity },
  { id: 'disease-maps' as Tab, label: 'Disease Maps', icon: Map },
  { id: 'simulation' as Tab, label: 'Simulation', icon: Layers },
  { id: 'drilldown' as Tab, label: 'Drilldown', icon: BarChart3 },
  { id: 'data-entry' as Tab, label: 'Data Entry', icon: Upload },
];

export default function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1600px] px-12 sm:px-18 lg:px-36 xl:px-48 2xl:px-72 py-4">
        <nav className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all',
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
