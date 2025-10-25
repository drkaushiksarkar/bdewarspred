"use client";

import * as React from 'react';
import type { RiskData } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type SortKey = keyof RiskData;

export default function RiskHeatmap({ data }: { data: RiskData[] }) {
  const [sortConfig, setSortConfig] = React.useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>({ key: 'risk_score', direction: 'desc' });

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Non-Spatial Risk Heatmap</CardTitle>
        <CardDescription>Risk scores and trends by location</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Location</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('risk_category')}>
                  Risk Level {getSortIcon('risk_category')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('risk_score')}>
                  Score {getSortIcon('risk_score')}
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('change')}>
                  Change {getSortIcon('change')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.location}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.risk_category === 'High'
                        ? 'destructive'
                        : item.risk_category === 'Medium'
                        ? 'secondary'
                        : 'default'
                    }
                    className={cn(item.risk_category === 'Medium' && 'bg-accent/80 text-accent-foreground')}
                  >
                    {item.risk_category}
                  </Badge>
                </TableCell>
                <TableCell>{item.risk_score}</TableCell>
                <TableCell
                  className={cn(
                    item.change > 0 ? 'text-destructive' : 'text-green-600'
                  )}
                >
                  {item.change > 0 ? `+${item.change}` : item.change}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
