"use client";

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { diseases } from '@/lib/data';
import type { Disease } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function DiseaseFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentDisease = searchParams.get('disease') || diseases[0].id;

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('disease', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <Label>Disease</Label>
      <Select value={currentDisease} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select Disease" />
        </SelectTrigger>
        <SelectContent>
          {diseases.map((disease: Disease) => (
            <SelectItem key={disease.id} value={disease.id}>
              {disease.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
