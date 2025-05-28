// src/components/focusflow/day-detail-dialog.tsx
"use client";

import type { DailyLog, Task } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { CalendarDays, ListChecks, Target, CheckCircle2, VenetianMask } from 'lucide-react'; // Using VenetianMask as a placeholder

interface DayDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dailyLog: DailyLog | null;
  completedTasks: Task[];
}

export function DayDetailDialog({ isOpen, onClose, dailyLog, completedTasks }: DayDetailDialogProps) {
  if (!dailyLog) return null;

  const formattedDate = format(parseISO(dailyLog.date), 'MMMM d, yyyy (EEEE)');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
            Activity for {formattedDate}
          </DialogTitle>
          <DialogDescription>
            A summary of your pomodoros and tasks for this day.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="rounded-md border p-4 bg-card/80">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <VenetianMask className="mr-2 h-5 w-5 text-accent" /> {/* Placeholder icon */}
              Pomodoro Summary
            </h3>
            <p>Completed: <span className="font-semibold">{dailyLog.pomodorosCompleted}</span></p>
            <p>Goal: <span className="font-semibold">{dailyLog.pomodorosTarget}</span></p>
          </div>

          <div className="rounded-md border p-4 bg-card/80">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5 text-accent" />
              Task Target Summary
            </h3>
            <p>Target Tasks Completed: <span className="font-semibold">{dailyLog.tasksCompleted}</span></p>
            <p>Task Goal: <span className="font-semibold">{dailyLog.tasksTarget}</span></p>
          </div>
          
          <div className="rounded-md border p-4 bg-card/80">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <ListChecks className="mr-2 h-5 w-5 text-accent" />
              Specific Tasks Marked Done
            </h3>
            {completedTasks.length > 0 ? (
              <ScrollArea className="h-[150px] pr-1">
                <ul className="space-y-2">
                  {completedTasks.map(task => (
                    <li key={task.id} className="text-sm p-2 bg-background rounded-md shadow">
                      {task.name}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground">No specific tasks were marked as completed on this day.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
