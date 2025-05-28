// src/components/focusflow/summary-client.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import type { DailyLog, Task } from '@/lib/types';
import type { WeeklySummaryMotivatorInput } from '@/ai/flows/weekly-summary-motivator';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { WeeklySummaryView } from './weekly-summary-view';
import { AIMotivation } from './ai-motivation';
import { DayDetailDialog } from './day-detail-dialog';
import { STORAGE_KEYS } from '@/lib/constants';
import { eachDayOfInterval, startOfWeek, endOfWeek, subDays, format, parseISO, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ViewMode = 'weekly' | 'monthly';

export default function SummaryClient() {
  const [dailyLogs] = useLocalStorage<Record<string, DailyLog>>(STORAGE_KEYS.DAILY_LOGS, {});
  const [tasks] = useLocalStorage<Task[]>(STORAGE_KEYS.TASKS, []);
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('weekly');

  // State for Day Detail Dialog
  const [selectedLogForDialog, setSelectedLogForDialog] = useState<DailyLog | null>(null);
  const [tasksForDialog, setTasksForDialog] = useState<Task[]>([]);
  const [isDayDetailDialogOpen, setIsDayDetailDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const today = new Date();

  // --- Weekly Data ---
  const lastSevenDaysInterval = useMemo(() => ({
    start: subDays(today, 6),
    end: today,
  }), [today]); // today is stable unless page reloads, but good practice

  const daysInLastSeven = useMemo(() => eachDayOfInterval(lastSevenDaysInterval), [lastSevenDaysInterval]);

  const logsForWeek = useMemo(() => {
    return daysInLastSeven.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return dailyLogs[dateStr] || { 
        date: dateStr, 
        pomodorosTarget: 0, 
        tasksTarget: 0, 
        pomodorosCompleted: 0, 
        tasksCompleted: 0 
      };
    }).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [daysInLastSeven, dailyLogs]);

  const weeklyTotalPomodorosCompleted = useMemo(() => logsForWeek.reduce((sum, log) => sum + log.pomodorosCompleted, 0), [logsForWeek]);
  const weeklyTotalTasksCompleted = useMemo(() => logsForWeek.reduce((sum, log) => sum + log.tasksCompleted, 0), [logsForWeek]);
  const weeklyTotalPomodorosGoal = useMemo(() => logsForWeek.reduce((sum, log) => sum + log.pomodorosTarget, 0), [logsForWeek]);
  const weeklyTotalTasksGoal = useMemo(() => logsForWeek.reduce((sum, log) => sum + log.tasksTarget, 0), [logsForWeek]);

  // --- Monthly Data ---
  const currentMonthStart = useMemo(() => startOfMonth(today), [today]);
  const currentMonthEnd = useMemo(() => endOfMonth(today), [today]);
  const daysInCurrentMonth = useMemo(() => eachDayOfInterval({ start: currentMonthStart, end: currentMonthEnd }), [currentMonthStart, currentMonthEnd]);
  
  const logsForMonth = useMemo(() => {
    return daysInCurrentMonth.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      return dailyLogs[dateStr] || { 
        date: dateStr, 
        pomodorosTarget: 0, 
        tasksTarget: 0, 
        pomodorosCompleted: 0, 
        tasksCompleted: 0 
      };
    }).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [daysInCurrentMonth, dailyLogs]);

  const monthlyTotalPomodorosCompleted = useMemo(() => logsForMonth.reduce((sum, log) => sum + log.pomodorosCompleted, 0), [logsForMonth]);
  const monthlyTotalTasksCompleted = useMemo(() => logsForMonth.reduce((sum, log) => sum + log.tasksCompleted, 0), [logsForMonth]);
  const monthlyTotalPomodorosGoal = useMemo(() => logsForMonth.reduce((sum, log) => sum + log.pomodorosTarget, 0), [logsForMonth]);
  const monthlyTotalTasksGoal = useMemo(() => logsForMonth.reduce((sum, log) => sum + log.tasksTarget, 0), [logsForMonth]);

  // AI Summary input remains based on weekly data
  const aiSummaryInput: WeeklySummaryMotivatorInput | null = isMounted ? {
    weeklyPomodorosCompleted: weeklyTotalPomodorosCompleted,
    weeklyTasksCompleted: weeklyTotalTasksCompleted,
    weeklyGoalPomodoros: weeklyTotalPomodorosGoal,
    weeklyGoalTasks: weeklyTotalTasksGoal,
  } : null;

  const handleBarClick = (log: DailyLog) => {
    setSelectedLogForDialog(log);
    const dayTasks = tasks.filter(task => {
      if (!task.isCompleted || !task.completedAt) return false;
      const completedDateStr = format(new Date(task.completedAt), 'yyyy-MM-dd');
      return completedDateStr === log.date;
    });
    setTasksForDialog(dayTasks);
    setIsDayDetailDialogOpen(true);
  };

  if (!isMounted) {
    return (
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <Skeleton className="h-12 w-48 mb-6" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-64 w-full mt-8" />
      </div>
    );
  }
  
  const chartDataToDisplay = viewMode === 'weekly' ? logsForWeek : logsForMonth;
  const title = viewMode === 'weekly' ? "Last 7 Days Summary" : `Monthly Summary - ${format(today, 'MMMM yyyy')}`;
  const description = viewMode === 'weekly' 
    ? "Your productivity overview for the last 7 days. Click a bar to see daily details."
    : `Your productivity overview for ${format(today, 'MMMM yyyy')}. Click a bar to see daily details.`;
  const pomodorosCompleted = viewMode === 'weekly' ? weeklyTotalPomodorosCompleted : monthlyTotalPomodorosCompleted;
  const tasksCompleted = viewMode === 'weekly' ? weeklyTotalTasksCompleted : monthlyTotalTasksCompleted;
  const pomodorosGoal = viewMode === 'weekly' ? weeklyTotalPomodorosGoal : monthlyTotalPomodorosGoal;
  const tasksGoal = viewMode === 'weekly' ? weeklyTotalTasksGoal : monthlyTotalTasksGoal;
  const xAxisTickFormatter = viewMode === 'weekly' 
    ? (dateStr: string) => format(parseISO(dateStr), 'EEE') 
    : (dateStr: string) => format(parseISO(dateStr), 'd');


  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-full max-w-md mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Last 7 Days</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
        </TabsList>
      </Tabs>

      <WeeklySummaryView
        chartTitle={title}
        chartDescription={description}
        displayLogs={chartDataToDisplay}
        totalPomodorosCompleted={pomodorosCompleted}
        totalTasksCompleted={tasksCompleted}
        totalPomodorosGoal={pomodorosGoal}
        totalTasksGoal={tasksGoal}
        onBarClick={handleBarClick}
        xAxisTickFormatter={xAxisTickFormatter}
      />
      <AIMotivation summaryInput={aiSummaryInput} />
      <DayDetailDialog
        isOpen={isDayDetailDialogOpen}
        onClose={() => setIsDayDetailDialogOpen(false)}
        dailyLog={selectedLogForDialog}
        completedTasks={tasksForDialog}
      />
    </div>
  );
}
