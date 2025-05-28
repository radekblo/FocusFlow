"use client";

import type { Task } from '@/lib/types';
import { useState } from 'react';
import { TaskItem } from './task-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onAddTask: (name: string, estimatedPomodoros: number) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleCompleteTask: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onReorderTask: (taskId: string, direction: 'up' | 'down') => void;
}

export function TaskList({
  tasks,
  activeTaskId,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleCompleteTask,
  onSelectTask,
  onReorderTask,
}: TaskListProps) {
  const [taskName, setTaskName] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim() === '') return;
    onAddTask(taskName, estimatedPomodoros);
    setTaskName('');
    setEstimatedPomodoros(1);
    setIsAddDialogOpen(false);
  };

  const handleEditTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask && editingTask.name.trim() !== '') {
      onUpdateTask(editingTask);
    }
    setEditingTask(null);
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask({...task});
    setIsEditDialogOpen(true);
  };
  
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl">
            <ListChecks className="mr-2 h-6 w-6 text-primary" />
            Today's Tasks
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>
                  Enter the details for your new task.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTaskSubmit} className="space-y-4 py-4">
                <div>
                  <Label htmlFor="new-task-name">Task Name</Label>
                  <Input
                    id="new-task-name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    placeholder="E.g., Write blog post"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-task-pomos">Estimated Pomodoros</Label>
                  <Input
                    id="new-task-pomos"
                    type="number"
                    value={estimatedPomodoros}
                    onChange={(e) => setEstimatedPomodoros(Math.max(1, parseInt(e.target.value, 10)))}
                    min="1"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Add Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>Organize and track your tasks for the day.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pr-1">
        {sortedTasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tasks yet. Add a task to get started!</p>
        ) : (
          <div className="space-y-1">
            {sortedTasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={task.id === activeTaskId}
                onToggleComplete={onToggleCompleteTask}
                onDelete={onDeleteTask}
                onSelectTask={onSelectTask}
                onEdit={openEditDialog}
                onMoveUp={onReorderTask}
                onMoveDown={onReorderTask}
                isFirst={index === 0}
                isLast={index === sortedTasks.length - 1}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <form onSubmit={handleEditTaskSubmit} className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-task-name">Task Name</Label>
                <Input
                  id="edit-task-name"
                  value={editingTask.name}
                  onChange={(e) => setEditingTask({ ...editingTask, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-task-pomos">Estimated Pomodoros</Label>
                <Input
                  id="edit-task-pomos"
                  type="number"
                  value={editingTask.estimatedPomodoros}
                  onChange={(e) => setEditingTask({ ...editingTask, estimatedPomodoros: Math.max(1, parseInt(e.target.value, 10)) })}
                  min="1"
                />
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
