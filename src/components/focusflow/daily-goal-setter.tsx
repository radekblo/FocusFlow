"use client";

import { useState, useEffect } from 'react';
import type { DailyLog } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, CheckCircle2 } from 'lucide-react';

interface DailyGoalSetterProps {
  dailyLog: DailyLog | undefined;
  onUpdateGoals: (pomodoros: number, tasks: number) => void;
  isLoading: boolean;
}

export function DailyGoalSetter({ dailyLog, onUpdateGoals, isLoading }: DailyGoalSetterProps) {
  const [pomodoroGoal, setPomodoroGoal] = useState(dailyLog?.pomodorosTarget || 8);
  const [taskGoal, setTaskGoal] = useState(dailyLog?.tasksTarget || 3);

  useEffect(() => {
    if (dailyLog) {
      setPomodoroGoal(dailyLog.pomodorosTarget);
      setTaskGoal(dailyLog.tasksTarget);
    }
  }, [dailyLog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoals(pomodoroGoal, taskGoal);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Target className="mr-2 h-6 w-6 text-primary" />
          Daily Goals
        </CardTitle>
        <CardDescription>Set your targets for today.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pomodoro-goal">Pomodoros to Complete</Label>
            <Input
              id="pomodoro-goal"
              type="number"
              value={pomodoroGoal}
              onChange={(e) => setPomodoroGoal(Math.max(0, parseInt(e.target.value, 10)))}
              min="0"
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-goal">Tasks to Complete</Label>
            <Input
              id="task-goal"
              type="number"
              value={taskGoal}
              onChange={(e) => setTaskGoal(Math.max(0, parseInt(e.target.value, 10)))}
              min="0"
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Set Today's Goals
          </Button>
        </form>
        {dailyLog && (
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <p>Pomodoros: {dailyLog.pomodorosCompleted} / {dailyLog.pomodorosTarget} completed</p>
            <p>Tasks: {dailyLog.tasksCompleted} / {dailyLog.tasksTarget} completed</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
