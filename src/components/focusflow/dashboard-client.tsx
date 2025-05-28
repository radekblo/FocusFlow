"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, DailyLog, PomodoroSettings } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { DailyGoalSetter } from './daily-goal-setter';
import { TaskList } from './task-list';
import { PomodoroTimer } from './pomodoro-timer';
import { DEFAULT_POMODORO_SETTINGS, STORAGE_KEYS } from '@/lib/constants';
import { format, parseISO, startOfWeek, eachDayOfInterval, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const getTodayDateString = () => format(new Date(), 'yyyy-MM-dd');

export default function DashboardClient() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.TASKS, []);
  const [dailyLogs, setDailyLogs] = useLocalStorage<Record<string, DailyLog>>(STORAGE_KEYS.DAILY_LOGS, {});
  const [pomodoroSettings, setPomodoroSettings] = useLocalStorage<PomodoroSettings>(STORAGE_KEYS.POMODORO_SETTINGS, DEFAULT_POMODORO_SETTINGS);
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>(STORAGE_KEYS.ACTIVE_TASK_ID, null);
  
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    // Initialize today's log if it doesn't exist
    const today = getTodayDateString();
    if (!dailyLogs[today]) {
      setDailyLogs(prevLogs => ({
        ...prevLogs,
        [today]: {
          date: today,
          pomodorosTarget: 8,
          tasksTarget: 3,
          pomodorosCompleted: 0,
          tasksCompleted: 0,
        }
      }));
    }
  }, [dailyLogs, setDailyLogs]);

  const currentDailyLog = dailyLogs[getTodayDateString()];
  const activeTask = tasks.find(t => t.id === activeTaskId);

  const handleUpdateGoals = useCallback((pomodoros: number, numTasks: number) => {
    const today = getTodayDateString();
    setDailyLogs(prevLogs => ({
      ...prevLogs,
      [today]: {
        ...(prevLogs[today] || { date: today, pomodorosCompleted: 0, tasksCompleted: 0 }),
        pomodorosTarget: pomodoros,
        tasksTarget: numTasks,
      }
    }));
    toast({ title: "Goals Updated!", description: "Your daily goals have been set.", variant: "default" });
  }, [setDailyLogs, toast]);

  const handleAddTask = useCallback((name: string, estimatedPomodoros: number) => {
    const newTask: Task = {
      id: Date.now().toString(),
      name,
      estimatedPomodoros,
      completedPomodoros: 0,
      isCompleted: false,
      createdAt: Date.now(),
      order: tasks.length > 0 ? Math.max(...tasks.map(t => t.order)) + 1 : 0,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    if (!activeTaskId) setActiveTaskId(newTask.id); // Auto-select first task added
    toast({ title: "Task Added!", description: `"${name}" has been added to your list.`, variant: "default" });
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
      const newTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          const justCompleted = !task.isCompleted;
          return { ...task, isCompleted: justCompleted, completedAt: justCompleted ? Date.now() : undefined };
        }
        return task;
      });
      
      // Update daily tasks completed count
      const task = newTasks.find(t => t.id === taskId);
      if (task) {
        setDailyLogs(prevLogs => {
          const currentLog = prevLogs[today] || { date: today, pomodorosTarget: 8, tasksTarget: 3, pomodorosCompleted: 0, tasksCompleted: 0 };
          const change = task.isCompleted ? 1 : (task.completedAt && format(new Date(task.completedAt), 'yyyy-MM-dd') === today ? -1 : 0); // Only decrement if it was completed today
          return {
            ...prevLogs,
            [today]: { ...currentLog, tasksCompleted: Math.max(0, currentLog.tasksCompleted + change) }
          };
        });
        if(task.isCompleted) toast({ title: "Task Complete!", description: `Great job finishing "${task.name}"!`, variant: "default" });
      }
      return newTasks;
    });
  }, [setTasks, setDailyLogs, toast]);
  
  const handleReorderTask = useCallback((taskId: string, direction: 'up' | 'down') => {
    setTasks(prevTasks => {
      const sorted = [...prevTasks].sort((a, b) => a.order - b.order);
      const taskIndex = sorted.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return prevTasks;

      const newIndex = direction === 'up' ? taskIndex - 1 : taskIndex + 1;
      if (newIndex < 0 || newIndex >= sorted.length) return prevTasks;

      // Swap order property
      const otherTask = sorted[newIndex];
      const taskOrder = sorted[taskIndex].order;
      sorted[taskIndex].order = otherTask.order;
      otherTask.order = taskOrder;
      
      return [...sorted]; // Return a new array to trigger re-render
    });
  }, [setTasks]);


  const handlePomodoroComplete = useCallback((isWorkSession: boolean) => {
    if (isWorkSession) {
      const today = getTodayDateString();
      setDailyLogs(prevLogs => {
        const currentLog = prevLogs[today] || { date: today, pomodorosTarget: 8, tasksTarget: 3, pomodorosCompleted: 0, tasksCompleted: 0 };
        return {
          ...prevLogs,
          [today]: { ...currentLog, pomodorosCompleted: currentLog.pomodorosCompleted + 1 }
        };
      });

      if (activeTaskId) {
        setTasks(prevTasks => prevTasks.map(task => 
          task.id === activeTaskId 
            ? { ...task, completedPomodoros: task.completedPomodoros + 1 } 
            : task
        ));
      }
    }
  }, [activeTaskId, setDailyLogs, setTasks]);

  if (!isMounted) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" /> 
            <Skeleton className="h-96 w-full" /> 
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <PomodoroTimer
            settings={pomodoroSettings}
            onUpdateSettings={setPomodoroSettings}
            onPomodoroComplete={handlePomodoroComplete}
            activeTaskName={activeTask?.name}
          />
          <TaskList
            tasks={tasks}
            activeTaskId={activeTaskId}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleCompleteTask={handleToggleCompleteTask}
            onSelectTask={setActiveTaskId}
            onReorderTask={handleReorderTask}
          />
        </div>
        <div className="lg:col-span-1 space-y-6 sticky top-20">
          <DailyGoalSetter
            dailyLog={currentDailyLog}
            onUpdateGoals={handleUpdateGoals}
            isLoading={!isMounted}
          />
        </div>
      </div>
    </div>
  );
}
