// src/components/focusflow/summary-client.tsx
"use client";

import { useState, useEffect } from 'react';
import type { DailyLog, Task } from '@/lib/types';
import type { WeeklySummaryMotivatorInput } from '@/ai/flows/weekly-summary-motivator';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { WeeklySummaryView } from './weekly-summary-view';
import { AIMotivation } from './ai-motivation';
import { DayDetailDialog } from './day-detail-dialog'; // New import
import { STORAGE_KEYS } from '@/lib/constants';
import { eachDayOfInterval, startOfWeek, endOfWeek, subDays, format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function SummaryClient() {
  const [dailyLogs] = useLocalStorage<Record<string, DailyLog>>(STORAGE_KEYS.DAILY_LOGS, {});
  const [tasks] = useLocalStorage<Task[]>(STORAGE_KEYS.TASKS, []); // Fetch tasks
  const [isMounted, setIsMounted] = useState(false);

  // State for Day Detail Dialog
  const [selectedLogForDialog, setSelectedLogForDialog] = useState<DailyLog | null>(null);
  const [tasksForDialog, setTasksForDialog] = useState<Task[]>([]);
  const [isDayDetailDialogOpen, setIsDayDetailDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const today = new Date();
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
  }).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

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
        onBarClick={handleBarClick} // Pass handler
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
