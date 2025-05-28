export interface Task {
  id: string;
  name: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  isCompleted: boolean;
  createdAt: number; // timestamp
  completedAt?: number; // timestamp, set when isCompleted becomes true
  order: number;
  goalId?: string; // New: Link to a goal
}

export interface Goal {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  order: number;
  isCompleted?: boolean;
  completedAt?: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  pomodorosTarget: number;
  tasksTarget: number;
  pomodorosCompleted: number;
  tasksCompleted: number; 
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  pomodorosPerSet: number; // number of work sessions before a long break
}
