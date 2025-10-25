"use client";

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { locations } from '@/lib/data';
import type { Location } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function LocationFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedDivision = searchParams.get('division') || '6'; // Default to Dhaka
  const selectedDistrict = searchParams.get('district');
  const selectedUpazila = searchParams.get('upazila');

  const divisions = React.useMemo(() => locations.filter((l) => l.level === 'division'), []);
  const districts = React.useMemo(
    () => locations.filter((l) => l.parent_id === selectedDivision && l.level === 'district'),
    [selectedDivision]
  );
  const upazilas = React.useMemo(
    () => locations.filter((l) => l.parent_id === selectedDistrict && l.level === 'upazila'),
    [selectedDistrict]
  );

  const handleFilterChange = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    if (key === 'division') {
      params.delete('district');
      params.delete('upazila');
    }
    if (key === 'district') {
      params.delete('upazila');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <Label>Location</Label>
      <div className="space-y-2">
        <Select
          value={selectedDivision}
          onValueChange={(value) => handleFilterChange('division', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((division: Location) => (
              <SelectItem key={division.id} value={division.id}>
                {division.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {districts.length > 0 && (
          <Select
            value={selectedDistrict ?? ''}
            onValueChange={(value) => handleFilterChange('district', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((district: Location) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {upazilas.length > 0 && selectedDistrict && (
          <Select
            value={selectedUpazila ?? ''}
            onValueChange={(value) => handleFilterChange('upazila', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Upazila" />
            </SelectTrigger>
            <SelectContent>
              {upazilas.map((upazila: Location) => (
                <SelectItem key={upazila.id} value={upazila.id}>
                  {upazila.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
