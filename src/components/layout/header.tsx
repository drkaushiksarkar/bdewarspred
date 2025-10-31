'use client';

import * as React from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Biohazard, LogOut, Settings, Loader2, Download } from 'lucide-react';
import HelpDrawer from './help-drawer';
import { useSession, signOut } from 'next-auth/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { captureElement, generatePDFReport, wait, waitForImagesToLoad } from '@/lib/pdf-utils';
import { ALL_TABS, TAB_LABELS } from '@/app/page';

type Tab = 'overview' | 'model' | 'alert' | 'disease-maps' | 'simulation' | 'drilldown' | 'data-entry';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  mainContentRef: React.RefObject<HTMLDivElement>;
}

export default function Header({ activeTab, setActiveTab, mainContentRef }: HeaderProps) {
  const { data: session } = useSession();
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  const handleDownloadReport = async () => {
    if (!mainContentRef.current) {
      console.error('Main content ref is not available');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const screenshots: { canvas: HTMLCanvasElement; tabName: string }[] = [];
      const originalTab = activeTab;

      // Filter out data-entry tab
      const tabsToCapture = ALL_TABS.filter(tab => tab !== 'data-entry');

      // Iterate through all tabs
      for (const tab of tabsToCapture) {
        // Switch to the tab
        setActiveTab(tab);

        // Wait for the tab to render and for content to load (including API calls)
        await wait(5000); // Wait 5 seconds for APIs to fetch data

        // Wait for images to load
        if (mainContentRef.current) {
          await waitForImagesToLoad(mainContentRef.current);
        }

        // Additional wait for maps to fully render (especially for disease-maps and simulation tabs)
        if (tab === 'disease-maps' || tab === 'simulation') {
          await wait(3000); // Extra time for map rendering
        } else {
          await wait(1000);
        }

        // Capture the screenshot of the current tab
        if (mainContentRef.current) {
          const canvas = await captureElement(mainContentRef.current);
          screenshots.push({
            canvas,
            tabName: TAB_LABELS[tab],
          });
        }
      }

      // Switch back to the original tab
      setActiveTab(originalTab);

      // Generate the PDF with all screenshots
      const fileName = `EWARS_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      await generatePDFReport(screenshots, fileName);

      console.log('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white">
      <div className="mx-auto max-w-[1600px] flex h-16 items-center gap-4 px-12 sm:px-18 lg:px-36 xl:px-48 2xl:px-72">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <Biohazard className="h-8 w-8 text-black" />
          <span className="font-headline text-xl font-bold text-black">
            EWARS Bangladesh
          </span>
        </div>

      {/* Download Report Button */}
      <div className="ml-auto"></div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="bg-black text-white hover:bg-gray-800"
              onClick={handleDownloadReport}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <span className="sr-only">Download Report</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isGeneratingPDF ? 'Generating PDF...' : 'Download Report'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <HelpDrawer />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="overflow-hidden rounded-full"
          >
            <Avatar>
              {userAvatar && (
                <AvatarImage
                  src={userAvatar.imageUrl}
                  alt={userAvatar.description}
                  width={40}
                  height={40}
                  data-ai-hint={userAvatar.imageHint}
                />
              )}
              <AvatarFallback>AV</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session?.user?.email || ''}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
