"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Upload, Link2, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DataEntryTab() {
  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-headline text-2xl">Data Entry Portal</CardTitle>
              <CardDescription className="mt-2">
                Upload and manage your EWARS data
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Guide
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="disease" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="disease">Disease Data</TabsTrigger>
              <TabsTrigger value="climate">Climate Data</TabsTrigger>
              <TabsTrigger value="response">Response Data</TabsTrigger>
            </TabsList>

            <TabsContent value="disease" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Plus className="h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-1">Manual Entry</h3>
                    <p className="text-sm text-muted-foreground">
                      Enter data manually through forms
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-1">Upload File</h3>
                    <p className="text-sm text-muted-foreground">
                      Import data from CSV or Excel files
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Link2 className="h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-1">API Connection</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect to external data sources
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-muted/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-48">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        Select a data entry method to begin
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="climate">
              <Card className="bg-muted/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Climate data entry coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="response">
              <Card className="bg-muted/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">Response data entry coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
