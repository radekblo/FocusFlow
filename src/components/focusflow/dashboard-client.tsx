// src/components/focusflow/dashboard-client.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, DailyLog, PomodoroSettings, Goal } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DailyGoalSetter } from './daily-goal-setter';
import { GoalManager } from './goal-manager'; // Changed from TaskList
import { PomodoroTimer } from './pomodoro-timer';
import { DEFAULT_POMODORO_SETTINGS, STORAGE_KEYS } from '@/lib/constants';
import { format, parseISO, startOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

export default function DashboardClient() {
  const [goals, setGoals] = useLocalStorage<Goal[]>(STORAGE_KEYS.GOALS, []);
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.TASKS, []);
  const [dailyLogs, setDailyLogs] = useLocalStorage<Record<string, DailyLog>>(STORAGE_KEYS.DAILY_LOGS, {});
  const [pomodoroSettings, setPomodoroSettings] = useLocalStorage<PomodoroSettings>(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>(STORAGE_KEYS.ACTIVE_TASK_ID, null);
  
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    const today = getTodayDateString();
    if (!dailyLogs[today]) {
      setDailyLogs(prevLogs => ({
        ...prevLogs,
        [today]: {
          date: today, pomodorosTarget: 8, tasksTarget: 3, pomodorosCompleted: 0, tasksCompleted: 0,
        }
      }));
    }
  }, []); // Removed dailyLogs and setDailyLogs from deps to run once

  const currentDailyLog = dailyLogs[getTodayDateString()];
  const activeTask = tasks.find(t => t.id === activeTaskId);

  const handleUpdateGoals = useCallback((pomodoros: number, numTasks: number) => {
    const today = getTodayDateString();
    setDailyLogs(prevLogs => ({
      ...prevLogs,
      [today]: {
        ...(prevLogs[today] || { date: today, pomodorosCompleted: 0, tasksCompleted: 0 }),
        pomodorosTarget: pomodoros, tasksTarget: numTasks,
      }
    }));
    toast({ title: "Daily Targets Updated!", variant: "default" });
  }, [setDailyLogs, toast]);

  // Goal Handlers
  const handleAddGoal = useCallback((name: string, description?: string) => {
    const newGoal: Goal = {
      id: Date.now().toString(), name, description, createdAt: Date.now(),
      order: goals.length > 0 ? Math.max(...goals.map(g => g.order)) + 1 : 0,
    };
    setGoals(prevGoals => [...prevGoals, newGoal]);
    toast({ title: "Goal Added!", description: `"${name}" has been added.`, variant: "default" });
  }, [goals, setGoals, toast]);

  const handleUpdateGoal = useCallback((updatedGoal: Goal) => {
    setGoals(prevGoals => prevGoals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
    toast({ title: "Goal Updated!", variant: "default" });
  }, [setGoals, toast]);

  const handleDeleteGoal = useCallback((goalId: string) => {
    setGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
    // Unassign tasks from this goal
    setTasks(prevTasks => prevTasks.map(task => task.goalId === goalId ? { ...task, goalId: undefined } : task));
    toast({ title: "Goal Deleted!", description: "Associated tasks are now uncategorized.", variant: "destructive" });
  }, [setGoals, setTasks, toast]);

  const handleReorderGoal = useCallback((goalId: string, direction: 'up' | 'down') => {
    setGoals(prevGoals => {
      const sorted = [...prevGoals].sort((a, b) => a.order - b.order);
      const itemIndex = sorted.findIndex(g => g.id === goalId);
      if (itemIndex === -1) return prevGoals;
      const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
      if (newIndex < 0 || newIndex >= sorted.length) return prevGoals;
      [sorted[itemIndex].order, sorted[newIndex].order] = [sorted[newIndex].order, sorted[itemIndex].order];
      return [...sorted];
    });
  }, [setGoals]);

  // Task Handlers
  const handleAddTask = useCallback((name: string, estimatedPomodoros: number, goalId?: string) => {
    const newTask: Task = {
      id: Date.now().toString(), name, estimatedPomodoros, completedPomodoros: 0,
      isCompleted: false, createdAt: Date.now(), goalId,
      order: tasks.filter(t => t.goalId === goalId).length > 0 ? Math.max(...tasks.filter(t => t.goalId === goalId).map(t => t.order)) + 1 : 0,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    if (!activeTaskId) setActiveTaskId(newTask.id);
    toast({ title: "Task Added!", description: `"${name}" added.`, variant: "default" });
  }, [tasks, setTasks, activeTaskId, setActiveTaskId, toast]);

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    toast({ title: "Task Updated!", variant: "default" });
  }, [setTasks, toast]);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    if (activeTaskId === taskId) setActiveTaskId(null);
    toast({ title: "Task Deleted!", variant: "destructive" });
  }, [activeTaskId, setActiveTaskId, setTasks, toast]);

  const handleToggleCompleteTask = useCallback((taskId: string) => {
    const today = getTodayDateString();
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task => 
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted, completedAt: !task.isCompleted ? Date.now() : undefined } : task
      );
      const task = newTasks.find(t => t.id === taskId);
      if (task) {
        setDailyLogs(prevLogs => {
          const currentLog = prevLogs[today] || { date: today, pomodorosTarget: 8, tasksTarget: 3, pomodorosCompleted: 0, tasksCompleted: 0 };
          const change = task.isCompleted ? 1 : (task.completedAt && format(new Date(task.completedAt), 'yyyy-MM-dd') === today ? -1 : 0);
          return { ...prevLogs, [today]: { ...currentLog, tasksCompleted: Math.max(0, currentLog.tasksCompleted + change) }};
        });
        if(task.isCompleted) toast({ title: "Task Complete!", description: `Great job finishing "${task.name}"!`, variant: "default" });
      }
      return newTasks;
    });
  }, [setTasks, setDailyLogs, toast]);
  
  const handleReorderTask = useCallback((taskId: string, direction: 'up' | 'down', goalId?: string) => {
    setTasks(prevTasks => {
      const tasksInScope = prevTasks.filter(t => t.goalId === goalId);
      const sorted = [...tasksInScope].sort((a, b) => a.order - b.order);
      const taskIndex = sorted.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prevTasks;

      const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
      if (newIndex < 0 || newIndex >= sorted.length) return prevTasks;
      
      const originalTaskOrder = sorted[taskIndex].order;
      sorted[taskIndex].order = sorted[newIndex].order;
      sorted[newIndex].order = originalTaskOrder;
      
      // Create a map of updated tasks for easier merging
      const updatedOrderMap = new Map(sorted.map(t => [t.id, t.order]));
      
      return prevTasks.map(t => {
        if (updatedOrderMap.has(t.id)) {
          return { ...t, order: updatedOrderMap.get(t.id)! };
        }
        return t;
      });
    });
  }, [setTasks]);

  const handlePomodoroComplete = useCallback((isWorkSession: boolean) => {
    if (isWorkSession) {
      const today = getTodayDateString();
      setDailyLogs(prevLogs => {
        const currentLog = prevLogs[today] || { date: today, pomodorosTarget: 8, tasksTarget: 3, pomodorosCompleted: 0, tasksCompleted: 0 };
        return { ...prevLogs, [today]: { ...currentLog, pomodorosCompleted: currentLog.pomodorosCompleted + 1 }};
      });
      if (activeTaskId) {
        setTasks(prevTasks => prevTasks.map(task => 
          task.id === activeTaskId ? { ...task, completedPomodoros: task.completedPomodoros + 1 } : task
        ));
      }
    }
  }, [activeTaskId, setDailyLogs, setTasks]);

  if (!isMounted) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-96 w-full" /></div>
          <div className="space-y-6"><Skeleton className="h-64 w-full" /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <PomodoroTimer
            settings={pomodoroSettings} onUpdateSettings={setPomodoroSettings}
            onPomodoroComplete={handlePomodoroComplete} activeTaskName={activeTask?.name}
          />
          <GoalManager
            goals={goals} tasks={tasks} activeTaskId={activeTaskId}
            onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal} onReorderGoal={handleReorderGoal}
            onAddTask={handleAddTask} onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask} onToggleCompleteTask={handleToggleCompleteTask}
            onSelectTask={setActiveTaskId} onReorderTask={handleReorderTask}
          />
        </div>
        <div className="lg:col-span-1 space-y-6 sticky top-20">
          <DailyGoalSetter
            dailyLog={currentDailyLog} onUpdateGoals={handleUpdateGoals} isLoading={!isMounted}
          />
        </div>
      </div>
    </div>
  );
}
