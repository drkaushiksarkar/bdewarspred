"use client";

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { addDays, format, parse, isValid } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '../ui/label';

export function DateRangeFilter({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getInitialDateRange = (): DateRange | undefined => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    if (fromParam && toParam) {
      const fromDate = parse(fromParam, 'yyyy-MM-dd', new Date());
      const toDate = parse(toParam, 'yyyy-MM-dd', new Date());
      if (isValid(fromDate) && isValid(toDate)) {
        return { from: fromDate, to: toDate };
      }
    }
    // Return undefined initially on the client to avoid hydration mismatch
    return undefined;
  };

  const [date, setDate] = React.useState<DateRange | undefined>(getInitialDateRange);

  React.useEffect(() => {
    // This effect runs only on the client after hydration
    if (date === undefined) {
       const fromParam = searchParams.get('from');
       const toParam = searchParams.get('to');
       if (fromParam && toParam) {
           const fromDate = parse(fromParam, 'yyyy-MM-dd', new Date());
           const toDate = parse(toParam, 'yyyy-MM-dd', new Date());
            if (isValid(fromDate) && isValid(toDate)) {
                setDate({ from: fromDate, to: toDate });
            }
       } else {
        // Set default date range on the client if no params are present
        setDate({ from: addDays(new Date(), -29), to: new Date() });
       }
    }
  }, [searchParams, date]);


  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    const params = new URLSearchParams(searchParams);
    if (newDate?.from) {
      params.set('from', format(newDate.from, 'yyyy-MM-dd'));
    } else {
      params.delete('from');
    }
    if (newDate?.to) {
      params.set('to', format(newDate.to, 'yyyy-MM-dd'));
    } else {
      params.delete('to');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label>Date Range</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'MMM dd')} - {format(date.to, 'MMM dd, yyyy')}
                  </>
                ) : (
                  format(date.from, 'MMM dd, yyyy')
                )
              ) : (
                <span>Pick a date</span>
              )}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
