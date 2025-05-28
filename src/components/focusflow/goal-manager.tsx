// src/components/focusflow/goal-manager.tsx
"use client";

import type { Goal, Task } from '@/lib/types';
import { useState, useMemo } from 'react';
import { TaskItem } from './task-item';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlusCircle, Edit2, Trash2, Target, GripVertical, ChevronUp, ChevronDown, FolderKanban, ListPlus } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';

interface GoalManagerProps {
  goals: Goal[];
  tasks: Task[];
  activeTaskId: string | null;
  onAddGoal: (name: string, description?: string) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onReorderGoal: (goalId: string, direction: 'up' | 'down') => void;
  onAddTask: (name: string, estimatedPomodoros: number, goalId?: string) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleCompleteTask: (taskId: string) => void;
  onSelectTask: (taskId: string | null) => void;
  onReorderTask: (taskId: string, direction: 'up' | 'down', goalId?: string) => void;
}

export function GoalManager({
  goals, tasks, activeTaskId,
  onAddGoal, onUpdateGoal, onDeleteGoal, onReorderGoal,
  onAddTask, onUpdateTask, onDeleteTask, onToggleCompleteTask, onSelectTask, onReorderTask
}: GoalManagerProps) {
  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditGoalDialogOpen, setIsEditGoalDialogOpen] = useState(false);
  
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [currentGoalIdForTask, setCurrentGoalIdForTask] = useState<string | undefined>(undefined);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);

  // Form states for Add/Edit Goal
  const [goalName, setGoalName] = useState('');
  const [goalDescription, setGoalDescription] = useState('');

  // Form states for Add/Edit Task
  const [taskName, setTaskName] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  
  const sortedGoals = useMemo(() => [...goals].sort((a, b) => a.order - b.order), [goals]);
  const tasksByGoal = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    const uncategorized: Task[] = [];
    tasks.forEach(task => {
      if (task.goalId) {
        if (!grouped[task.goalId]) grouped[task.goalId] = [];
        grouped[task.goalId].push(task);
      } else {
        uncategorized.push(task);
      }
    });
    for (const goalId in grouped) {
      grouped[goalId].sort((a, b) => a.order - b.order);
    }
    uncategorized.sort((a, b) => a.order - b.order);
    return { ...grouped, uncategorized };
  }, [tasks]);

  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalName.trim() === '') return;
    onAddGoal(goalName, goalDescription);
    setGoalName('');
    setGoalDescription('');
    setIsAddGoalDialogOpen(false);
  };

  const openEditGoalDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setGoalDescription(goal.description || '');
    setIsEditGoalDialogOpen(true);
  };

  const handleEditGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal && goalName.trim() !== '') {
      onUpdateGoal({ ...editingGoal, name: goalName, description: goalDescription });
    }
    setEditingGoal(null);
    setIsEditGoalDialogOpen(false);
  };
  
  const openAddTaskDialog = (goalId?: string) => {
    setCurrentGoalIdForTask(goalId);
    setTaskName('');
    setEstimatedPomodoros(1);
    setIsAddTaskDialogOpen(true);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim() === '') return;
    onAddTask(taskName, estimatedPomodoros, currentGoalIdForTask);
    setTaskName('');
    setEstimatedPomodoros(1);
    setIsAddTaskDialogOpen(false);
    setCurrentGoalIdForTask(undefined);
  };

  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setTaskName(task.name);
    setEstimatedPomodoros(task.estimatedPomodoros);
    setIsEditTaskDialogOpen(true);
  };

  const handleEditTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask && taskName.trim() !== '') {
      onUpdateTask({ ...editingTask, name: taskName, estimatedPomodoros });
    }
    setEditingTask(null);
    setIsEditTaskDialogOpen(false);
  };

  const defaultAccordionValues = useMemo(() => sortedGoals.map(g => g.id), [sortedGoals]);

  return (
    <Card className="h-full flex flex-col shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-xl">
            <Target className="mr-2 h-6 w-6 text-primary" />
            Goals & Tasks
          </CardTitle>
          <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Goal</DialogTitle></DialogHeader>
              <form onSubmit={handleAddGoalSubmit} className="space-y-4 py-4">
                <div><Label htmlFor="new-goal-name">Goal Name</Label><Input id="new-goal-name" value={goalName} onChange={(e) => setGoalName(e.target.value)} required /></div>
                <div><Label htmlFor="new-goal-desc">Description (Optional)</Label><Textarea id="new-goal-desc" value={goalDescription} onChange={(e) => setGoalDescription(e.target.value)} /></div>
                <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">Add Goal</Button></DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>Define your goals and break them down into actionable tasks.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto pr-1 space-y-6">
        {sortedGoals.length === 0 && tasksByGoal.uncategorized?.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No goals or tasks yet. Add a goal or a task to get started!</p>
        )}

        {sortedGoals.length > 0 && (
          <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full">
            {sortedGoals.map((goal, goalIndex) => (
              <AccordionItem value={goal.id} key={goal.id} className="border-b-0 mb-3 rounded-lg bg-card shadow-md overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 rounded-t-lg transition-colors">
                  <div className="flex items-center gap-2 flex-grow">
                     <div className="flex flex-col items-center mr-2">
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onReorderGoal(goal.id, 'up');}} disabled={goalIndex === 0}><ChevronUp className="h-4 w-4"/></Button>
                        <FolderKanban className="h-5 w-5 text-primary my-1" />
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => { e.stopPropagation(); onReorderGoal(goal.id, 'down');}} disabled={goalIndex === sortedGoals.length - 1}><ChevronDown className="h-4 w-4"/></Button>
                    </div>
                    <div className="text-left">
                        <span className="font-semibold text-base">{goal.name}</span>
                        {goal.description && <p className="text-xs text-muted-foreground truncate max-w-xs sm:max-w-sm md:max-w-md">{goal.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-auto pl-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => {e.stopPropagation(); openEditGoalDialog(goal);}}><Edit2 className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteGoal(goal.id);}}><Trash2 className="h-4 w-4"/></Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => openAddTaskDialog(goal.id)} className="mb-3 w-full">
                    <ListPlus className="mr-2 h-4 w-4" /> Add Task to "{goal.name}"
                  </Button>
                  <div className="space-y-1">
                    {(tasksByGoal[goal.id] || []).map((task, taskIndex, arr) => (
                      <TaskItem
                        key={task.id} task={task} isSelected={task.id === activeTaskId}
                        onToggleComplete={onToggleCompleteTask} onDelete={onDeleteTask}
                        onSelectTask={onSelectTask} onEdit={openEditTaskDialog}
                        onMoveUp={(id) => onReorderTask(id, 'up', goal.id)}
                        onMoveDown={(id) => onReorderTask(id, 'down', goal.id)}
                        isFirst={taskIndex === 0} isLast={taskIndex === arr.length - 1}
                      />
                    ))}
                    {(tasksByGoal[goal.id] || []).length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No tasks in this goal yet.</p>}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        
        {/* Uncategorized Tasks */}
        <div>
            <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-base font-semibold text-muted-foreground">General Tasks</h3>
                 <Button variant="outline" size="sm" onClick={() => openAddTaskDialog(undefined)}>
                    <ListPlus className="mr-2 h-4 w-4" /> Add General Task
                  </Button>
            </div>
            {(tasksByGoal.uncategorized || []).length > 0 ? (
                 <div className="space-y-1 p-1 rounded-md border bg-card/50">
                    {(tasksByGoal.uncategorized || []).map((task, taskIndex, arr) => (
                    <TaskItem
                        key={task.id} task={task} isSelected={task.id === activeTaskId}
                        onToggleComplete={onToggleCompleteTask} onDelete={onDeleteTask}
                        onSelectTask={onSelectTask} onEdit={openEditTaskDialog}
                        onMoveUp={(id) => onReorderTask(id, 'up', undefined)}
                        onMoveDown={(id) => onReorderTask(id, 'down', undefined)}
                        isFirst={taskIndex === 0} isLast={taskIndex === arr.length - 1}
                    />
                    ))}
                </div>
            ) : (
                 sortedGoals.length > 0 && <p className="text-xs text-muted-foreground text-center py-3">No general tasks. Add some or assign tasks to goals.</p>
            )}
        </div>
      </CardContent>

      {/* Add Task Dialog (shared) */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={(isOpen) => { setIsAddTaskDialogOpen(isOpen); if (!isOpen) setCurrentGoalIdForTask(undefined); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Task {currentGoalIdForTask ? `to "${goals.find(g=>g.id === currentGoalIdForTask)?.name}"` : "(General)"}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddTaskSubmit} className="space-y-4 py-4">
            <div><Label htmlFor="new-task-name">Task Name</Label><Input id="new-task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} required /></div>
            <div><Label htmlFor="new-task-pomos">Estimated Pomodoros</Label><Input id="new-task-pomos" type="number" value={estimatedPomodoros} onChange={(e) => setEstimatedPomodoros(Math.max(1, parseInt(e.target.value, 10)))} min="1" /></div>
            <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">Add Task</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog (shared) */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          {editingTask && (
            <form onSubmit={handleEditTaskSubmit} className="space-y-4 py-4">
              <div><Label htmlFor="edit-task-name">Task Name</Label><Input id="edit-task-name" value={taskName} onChange={(e) => setTaskName(e.target.value)} required /></div>
              <div><Label htmlFor="edit-task-pomos">Estimated Pomodoros</Label><Input id="edit-task-pomos" type="number" value={estimatedPomodoros} onChange={(e) => setEstimatedPomodoros(Math.max(1, parseInt(e.target.value, 10)))} min="1" /></div>
              {/* Optional: Dropdown to change goalId could be added here */}
              <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Edit Goal Dialog */}
       <Dialog open={isEditGoalDialogOpen} onOpenChange={setIsEditGoalDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Goal</DialogTitle></DialogHeader>
          {editingGoal && (
            <form onSubmit={handleEditGoalSubmit} className="space-y-4 py-4">
              <div><Label htmlFor="edit-goal-name">Goal Name</Label><Input id="edit-goal-name" value={goalName} onChange={(e) => setGoalName(e.target.value)} required /></div>
              <div><Label htmlFor="edit-goal-desc">Description (Optional)</Label><Textarea id="edit-goal-desc" value={goalDescription} onChange={(e) => setGoalDescription(e.target.value)} /></div>
              <DialogFooter><DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose><Button type="submit">Save Changes</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
