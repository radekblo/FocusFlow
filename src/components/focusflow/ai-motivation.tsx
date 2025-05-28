"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Wand2 } from 'lucide-react';
import { weeklySummaryMotivator, WeeklySummaryMotivatorInput } from '@/ai/flows/weekly-summary-motivator';
import { Skeleton } from '@/components/ui/skeleton';

interface AIMotivationProps {
  summaryInput: WeeklySummaryMotivatorInput | null;
}

export function AIMotivation({ summaryInput }: AIMotivationProps) {
  const [motivation, setMotivation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGetMotivation = async () => {
    if (!summaryInput) {
      setError("Summary data is not available to generate motivation.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setMotivation(null);
    try {
      const result = await weeklySummaryMotivator(summaryInput);
      setMotivation(result.motivationMessage);
    } catch (err) {
      console.error("Error getting motivation:", err);
      setError("Failed to generate motivation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Sparkles className="mr-3 h-7 w-7 text-primary" />
          AI Motivator
        </CardTitle>
        <CardDescription>Get a personalized motivational boost based on your weekly progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGetMotivation} disabled={isLoading || !summaryInput} className="w-full">
          <Wand2 className="mr-2 h-5 w-5" />
          {isLoading ? 'Generating...' : 'Get Motivated!'}
        </Button>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {motivation && !isLoading && (
          <blockquote className="mt-6 border-l-2 border-primary pl-6 italic text-foreground/90">
            {motivation}
          </blockquote>
        )}
        {!summaryInput && !isLoading && (
           <p className="text-muted-foreground text-sm text-center py-2">Complete some activities this week to get AI motivation.</p>
        )}
      </CardContent>
    </Card>
  );
}
