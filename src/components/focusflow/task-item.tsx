"use client";

import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical, Trash2, Edit3, PlayCircle, ChevronUp, ChevronDown, Timer, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onMoveUp: (taskId: string) => void;
  onMoveDown: (taskId: string) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function TaskItem({
  task,
  isSelected,
  onToggleComplete,
  onDelete,
  onSelectTask,
  onEdit,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: TaskItemProps) {
  return (
    <Card className={cn("mb-2 transition-all duration-300 ease-in-out", isSelected ? "border-primary shadow-lg" : "border-border", task.isCompleted ? "bg-card/50 opacity-70" : "bg-card")}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onMoveUp(task.id)} disabled={isFirst} className="h-6 w-6">
            <ChevronUp className="h-4 w-4" />
          </Button>
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          <Button variant="ghost" size="icon" onClick={() => onMoveDown(task.id)} disabled={isLast} className="h-6 w-6">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={() => onToggleComplete(task.id)}
          aria-label="Mark task complete"
          className="mr-2"
        />
        
        <div className="flex-grow" onClick={() => onSelectTask(task.id)}>
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              "font-medium cursor-pointer",
              task.isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.name}
          </label>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
            <div className="flex items-center" title="Completed Pomodoros / Estimated Pomodoros">
              <Timer className="h-3 w-3 mr-1 text-primary" />
              <span>{task.completedPomodoros} / {task.estimatedPomodoros}</span>
            </div>
            {task.isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {!task.isCompleted && (
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectTask(task.id)}
              className="hidden sm:inline-flex"
            >
              <PlayCircle className="mr-1 h-4 w-4" />
              Focus
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="h-8 w-8">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="h-8 w-8 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
