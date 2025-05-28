"use client";

import type { DailyLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, CalendarCheck, CheckCircle, Target } from 'lucide-react';
import { ResponsiveContainer, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { format, parseISO } from 'date-fns';

interface WeeklySummaryViewProps {
  logsForWeek: DailyLog[];
  totalPomodorosCompleted: number;
  totalTasksCompleted: number;
  totalPomodorosGoal: number;
  totalTasksGoal: number;
}

export function WeeklySummaryView({
  logsForWeek,
  totalPomodorosCompleted,
  totalTasksCompleted,
  totalPomodorosGoal,
  totalTasksGoal,
}: WeeklySummaryViewProps) {
  
  const chartData = logsForWeek.map(log => ({
    date: format(parseISO(log.date), 'EEE'), // Format date as Mon, Tue, etc.
    pomodorosCompleted: log.pomodorosCompleted,
    pomodorosTarget: log.pomodorosTarget,
    tasksCompleted: log.tasksCompleted,
    tasksTarget: log.tasksTarget,
  }));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <CalendarCheck className="mr-3 h-7 w-7 text-primary" />
          Weekly Summary
        </CardTitle>
        <CardDescription>Your productivity overview for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <Card className="p-4 bg-card/80">
            <CardHeader className="p-2">
              <CardTitle className="text-lg flex items-center justify-center"><Target className="mr-2 h-5 w-5 text-accent"/>Pomodoros</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <p className="text-3xl font-bold">{totalPomodorosCompleted}</p>
              <p className="text-sm text-muted-foreground">completed of {totalPomodorosGoal} goal</p>
            </CardContent>
          </Card>
          <Card className="p-4 bg-card/80">
             <CardHeader className="p-2">
              <CardTitle className="text-lg flex items-center justify-center"><CheckCircle className="mr-2 h-5 w-5 text-accent"/>Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <p className="text-3xl font-bold">{totalTasksCompleted}</p>
              <p className="text-sm text-muted-foreground">completed of {totalTasksGoal} goal</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center"><BarChart className="mr-2 h-5 w-5 text-primary"/>Daily Pomodoro Progress</h3>
          {logsForWeek.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border)/0.5)" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--background))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
                  <Bar dataKey="pomodorosCompleted" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pomodorosTarget" name="Goal" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <p className="text-muted-foreground text-center py-4">No data available for the chart yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
