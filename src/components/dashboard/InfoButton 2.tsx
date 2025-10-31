"use client";

import * as React from 'react';
import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InfoButtonProps {
  title: string;
  content: React.ReactNode;
}

export default function InfoButton({ title, content }: InfoButtonProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Information"
        >
          <Info className="h-4 w-4 text-gray-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm text-gray-600 leading-relaxed pt-2">
          {content}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
