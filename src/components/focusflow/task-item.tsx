// src/components/focusflow/task-item.tsx
"use client";

import type { Task } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Edit3, PlayCircle, ChevronUp, ChevronDown, Timer, CheckCircle, GripVertical } from 'lucide-react'; // Added GripVertical
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onSelectTask: (taskId: string | null) => void; // Allow null to deselect
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
    <Card className={cn(
        "transition-all duration-200 ease-in-out hover:shadow-md", 
        isSelected ? "border-primary ring-2 ring-primary shadow-lg" : "border-border", 
        task.isCompleted ? "bg-card/60 opacity-70" : "bg-card"
      )}
    >
      <CardContent className="p-3 flex items-center gap-2">
        <div className="flex flex-col items-center">
          <Button variant="ghost" size="icon" onClick={() => onMoveUp(task.id)} disabled={isFirst} className="h-5 w-5">
            <ChevronUp className="h-3 w-3" />
          </Button>
          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab my-0.5" />
          <Button variant="ghost" size="icon" onClick={() => onMoveDown(task.id)} disabled={isLast} className="h-5 w-5">
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        
        <Checkbox
          id={`task-${task.id}`}
          checked={task.isCompleted}
          onCheckedChange={() => onToggleComplete(task.id)}
          aria-label="Mark task complete"
          className="h-5 w-5"
        />
        
        <div className="flex-grow cursor-pointer" onClick={() => onSelectTask(isSelected ? null : task.id)}>
          <label
            htmlFor={`task-${task.id}`}
            className={cn(
              "font-medium cursor-pointer",
              task.isCompleted && "line-through text-muted-foreground"
            )}
          >
            {task.name}
          </label>
          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
            <div className="flex items-center" title="Completed Pomodoros / Estimated Pomodoros">
              <Timer className="h-3 w-3 mr-1 text-primary/80" />
              <span>{task.completedPomodoros} / {task.estimatedPomodoros}</span>
            </div>
            {task.isCompleted && task.completedAt && (
              <div className="flex items-center text-green-600" title={`Completed on ${new Date(task.completedAt).toLocaleDateString()}`}>
                <CheckCircle className="h-3 w-3 mr-1" />
                Done
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-0.5">
          {!task.isCompleted && (
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={(e) => { e.stopPropagation(); onSelectTask(task.id);}}
              className="h-8 px-2 hidden sm:inline-flex text-xs"
            >
              <PlayCircle className="mr-1 h-3.5 w-3.5" />
              Focus
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="h-7 w-7">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="h-7 w-7 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
