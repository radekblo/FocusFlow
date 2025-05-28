import type { PomodoroSettings } from './types';

export const STORAGE_KEYS = {
  TASKS: 'focusflow_tasks',
  DAILY_LOGS: 'focusflow_daily_logs',
  POMODORO_SETTINGS: 'focusflow_pomodoro_settings',
  ACTIVE_TASK_ID: 'focusflow_active_task_id',
  GOALS: 'focusflow_goals', // New key for goals
};

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosPerSet: 4,
};
