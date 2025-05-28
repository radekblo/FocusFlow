"use client";

import { useState, useEffect } from 'react';
import type { DailyLog } from '@/lib/types';
import type { WeeklySummaryMotivatorInput } from '@/ai/flows/weekly-summary-motivator';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { WeeklySummaryView } from './weekly-summary-view';
import { AIMotivation } from './ai-motivation';
import { STORAGE_KEYS } from '@/lib/constants';
import { eachDayOfInterval, startOfWeek, endOfWeek, subDays, format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function SummaryClient() {
  const [dailyLogs] = useLocalStorage<Record<string, DailyLog>>(STORAGE_KEYS.DAILY_LOGS, {});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const today = new Date();
  // Ensure startOfWeek has Sunday as the first day of the week if that's the convention desired.
  // Default is locale-dependent. For consistency, can specify { weekStartsOn: 0 } for Sunday or 1 for Monday.
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday as start of week
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // Sunday as end of week
  
  // If we want "last 7 days" instead of "current calendar week":
  const lastSevenDaysInterval = {
    start: subDays(today, 6),
    end: today,
  };

  const daysInInterval = eachDayOfInterval(lastSevenDaysInterval);

  const logsForWeek = daysInInterval.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return dailyLogs[dateStr] || { 
      date: dateStr, 
      pomodorosTarget: 0, 
      tasksTarget: 0, 
      pomodorosCompleted: 0, 
      tasksCompleted: 0 
    };
  }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalPomodorosCompleted = logsForWeek.reduce((sum, log) => sum + log.pomodorosCompleted, 0);
  const totalTasksCompleted = logsForWeek.reduce((sum, log) => sum + log.tasksCompleted, 0);
  const totalPomodorosGoal = logsForWeek.reduce((sum, log) => sum + log.pomodorosTarget, 0);
  const totalTasksGoal = logsForWeek.reduce((sum, log) => sum + log.tasksTarget, 0);

  const aiSummaryInput: WeeklySummaryMotivatorInput | null = isMounted ? {
    weeklyPomodorosCompleted: totalPomodorosCompleted,
    weeklyTasksCompleted: totalTasksCompleted,
    weeklyGoalPomodoros: totalPomodorosGoal,
    weeklyGoalTasks: totalTasksGoal,
  } : null;

  if (!isMounted) {
    return (
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <WeeklySummaryView
        logsForWeek={logsForWeek}
        totalPomodorosCompleted={totalPomodorosCompleted}
        totalTasksCompleted={totalTasksCompleted}
        totalPomodorosGoal={totalPomodorosGoal}
        totalTasksGoal={totalTasksGoal}
      />
      <AIMotivation summaryInput={aiSummaryInput} />
    </div>
  );
}
