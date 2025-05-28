// src/components/focusflow/weekly-summary-view.tsx
"use client";

import type { DailyLog } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart as BarChartIcon, CalendarCheck, CheckCircle, Target as TargetIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { parseISO } from 'date-fns';

interface WeeklySummaryViewProps {
  chartTitle: string;
  chartDescription: string;
  displayLogs: DailyLog[];
  totalPomodorosCompleted: number;
  totalTasksCompleted: number;
  totalPomodorosGoal: number;
  totalTasksGoal: number;
  onBarClick?: (log: DailyLog) => void;
  xAxisTickFormatter: (date: string) => string;
}

export function WeeklySummaryView({
  chartTitle,
  chartDescription,
  displayLogs,
  totalPomodorosCompleted,
  totalTasksCompleted,
  totalPomodorosGoal,
  totalTasksGoal,
  onBarClick,
  xAxisTickFormatter,
}: WeeklySummaryViewProps) {
  
  const chartData = displayLogs.map(log => ({
    date: xAxisTickFormatter(log.date), 
    fullDate: log.date, 
    pomodorosCompleted: log.pomodorosCompleted,
    pomodorosTarget: log.pomodorosTarget,
    tasksCompleted: log.tasksCompleted,
    tasksTarget: log.tasksTarget,
  }));

  const handleChartClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0 && onBarClick) {
      const clickedFullDate = data.activePayload[0].payload.fullDate;
      const originalLog = displayLogs.find(log => log.date === clickedFullDate);
      if (originalLog) {
        onBarClick(originalLog);
      }
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <CalendarCheck className="mr-3 h-7 w-7 text-primary" />
          {chartTitle}
        </CardTitle>
        <CardDescription>{chartDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <Card className="p-4 bg-card/80">
            <CardHeader className="p-2">
              <CardTitle className="text-lg flex items-center justify-center"><TargetIcon className="mr-2 h-5 w-5 text-accent"/>Pomodoros</CardTitle>
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
          <h3 className="text-lg font-semibold mb-2 flex items-center"><BarChartIcon className="mr-2 h-5 w-5 text-primary"/>Daily Pomodoro Progress</h3>
          {displayLogs.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 5, right: 0, left: -20, bottom: 5 }}
                  onClick={handleChartClick}
                >
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
                    formatter={(value: number, name: string, props: any) => {
                      const { payload } = props;
                      if (name === "Completed") return [value, `Completed: ${value}`];
                      if (name === "Goal") return [value, `Goal: ${value}`];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.875rem" }} />
                  <Bar dataKey="pomodorosCompleted" name="Completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} cursor="pointer" />
                  <Bar dataKey="pomodorosTarget" name="Goal" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} cursor="pointer" />
                </BarChart>
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
