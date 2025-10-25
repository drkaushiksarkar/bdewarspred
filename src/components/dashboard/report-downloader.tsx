"use client";

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { downloadReportAction } from '@/app/actions';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2 } from 'lucide-react';

export function ReportDownloader() {
  const [isLoading, setIsLoading] = React.useState(false);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsLoading(true);
    const location = searchParams.get('district') || searchParams.get('division') || 'all';
    const disease = searchParams.get('disease') || 'all';
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const prompt = `Generate a report for ${disease} in ${location}${from && to ? ` from ${from} to ${to}` : ''}.`;

    try {
      const result = await downloadReportAction(prompt);
      if (result.success && result.data) {
        const { report, format } = result.data;
        const byteCharacters = atob(report);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: format === 'PDF' ? 'application/pdf' : 'text/csv' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const fileExtension = format.toLowerCase();
        link.download = `report_${disease}_${location}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
            title: "Download Started",
            description: "Your report is being downloaded."
        })
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleDownload} disabled={isLoading} className="w-full">
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Download Report
    </Button>
  );
}
