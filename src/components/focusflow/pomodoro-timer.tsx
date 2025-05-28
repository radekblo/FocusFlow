"use client";

import { useState, useEffect, useCallback } from 'react';
import type { PomodoroSettings } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, SkipForward, Settings, Coffee, Brain } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

type SessionType = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroTimerProps {
  settings: PomodoroSettings;
  onUpdateSettings: (newSettings: PomodoroSettings) => void;
  onPomodoroComplete: (isWorkSession: boolean) => void;
  activeTaskName?: string;
}

export function PomodoroTimer({ settings, onUpdateSettings, onPomodoroComplete, activeTaskName }: PomodoroTimerProps) {
  const [timer, setTimer] = useState(settings.workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<SessionType>('work');
  const [pomodorosInSet, setPomodorosInSet] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<PomodoroSettings>(settings);

  const { toast } = useToast();

  const totalDuration = (() => {
    switch (sessionType) {
      case 'work': return settings.workDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
      default: return settings.workDuration * 60;
    }
  })();
  
  const progressValue = totalDuration > 0 ? ((totalDuration - timer) / totalDuration) * 100 : 0;

  const resetTimer = useCallback((currentSessionType: SessionType) => {
    setIsActive(false);
    switch (currentSessionType) {
      case 'work':
        setTimer(settings.workDuration * 60);
        break;
      case 'shortBreak':
        setTimer(settings.shortBreakDuration * 60);
        break;
      case 'longBreak':
        setTimer(settings.longBreakDuration * 60);
        break;
    }
  }, [settings]);


  useEffect(() => {
    // Update timer and session type if settings change
    resetTimer(sessionType);
    setCurrentSettings(settings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);


  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (isActive && timer === 0) {
      setIsActive(false);
      const isWorkSession = sessionType === 'work';
      onPomodoroComplete(isWorkSession);

      if (isWorkSession) {
        setPomodorosInSet(prev => prev + 1);
        if ((pomodorosInSet + 1) % settings.pomodorosPerSet === 0) {
          setSessionType('longBreak');
          resetTimer('longBreak');
          toast({ title: "Long Break Time!", description: "Great job! Time for a longer rest.", variant: "default" });
        } else {
          setSessionType('shortBreak');
          resetTimer('shortBreak');
          toast({ title: "Short Break!", description: "Take a quick breather.", variant: "default" });
        }
      } else { // Break session ended
        setSessionType('work');
        resetTimer('work');
        toast({ title: "Back to Work!", description: "Let's get focused.", variant: "default" });
      }
      // Optionally auto-start next session: setIsActive(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer, sessionType, pomodorosInSet, settings, onPomodoroComplete, resetTimer, toast]);

  const toggleTimer = () => setIsActive(!isActive);

  const handleReset = () => {
    resetTimer(sessionType);
     if (sessionType !== 'work') { // If resetting a break, go back to work
      setSessionType('work');
      resetTimer('work');
    }
    setPomodorosInSet(0); // Reset pomodoro count in set when main reset is hit
  };

  const skipSession = () => {
    setIsActive(false);
    const isWorkSession = sessionType === 'work';
    // Do not call onPomodoroComplete if user skips a work session early
    // Only call if it was a break session or if work session finished naturally.
    // The current logic in useEffect handles natural completion.

    if (isWorkSession) { // Skipping work session
      setSessionType('shortBreak'); // Go to short break
      resetTimer('shortBreak');
      toast({ title: "Skipped to Short Break", variant: "default" });
    } else { // Skipping break session
      setSessionType('work');
      resetTimer('work');
      toast({ title: "Skipped to Work Session", variant: "default" });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSettingsSave = () => {
    onUpdateSettings(currentSettings);
    setIsSettingsOpen(false);
    // Reset timer to reflect new settings, maintaining current session type logic
    if(sessionType === 'work') setTimer(currentSettings.workDuration * 60);
    else if(sessionType === 'shortBreak') setTimer(currentSettings.shortBreakDuration * 60);
    else if(sessionType === 'longBreak') setTimer(currentSettings.longBreakDuration * 60);
    if (isActive) setIsActive(false); // Pause timer when settings change
  };

  const getSessionDisplay = () => {
    switch(sessionType) {
      case 'work': return { text: activeTaskName ? `Focus: ${activeTaskName}` : "Work Session", Icon: Brain, color: "text-primary" };
      case 'shortBreak': return { text: "Short Break", Icon: Coffee, color: "text-accent" };
      case 'longBreak': return { text: "Long Break", Icon: Coffee, color: "text-green-400" };
      default: return { text: "Work Session", Icon: Brain, color: "text-primary" };
    }
  };
  const currentSessionDisplay = getSessionDisplay();

  return (
    <Card className="shadow-xl">
      <CardHeader className="text-center pb-2">
        <CardTitle className={cn("text-2xl font-bold flex items-center justify-center gap-2", currentSessionDisplay.color)}>
           <currentSessionDisplay.Icon className="h-7 w-7" />
           {currentSessionDisplay.text}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-2">
        <div className="text-7xl font-mono font-bold my-6 tabular-nums">
          {formatTime(timer)}
        </div>
        <Progress value={progressValue} className="w-full h-3 mb-6" />
        <div className="flex space-x-3 mb-6">
          <Button onClick={toggleTimer} variant={isActive ? "destructive" : "default"} size="lg" className="w-32">
            {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="mr-2 h-5 w-5" /> Reset
          </Button>
        </div>
        <div className="flex space-x-3">
           <Button onClick={skipSession} variant="secondary" size="sm">
            <SkipForward className="mr-2 h-4 w-4" /> Skip
          </Button>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Settings className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Timer Settings</DialogTitle>
                <DialogDescription>Customize your Pomodoro intervals.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-3">
                <div>
                  <Label htmlFor="workDuration">Work Duration (min)</Label>
                  <Input id="workDuration" type="number" value={currentSettings.workDuration} onChange={(e) => setCurrentSettings({...currentSettings, workDuration: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label htmlFor="shortBreakDuration">Short Break (min)</Label>
                  <Input id="shortBreakDuration" type="number" value={currentSettings.shortBreakDuration} onChange={(e) => setCurrentSettings({...currentSettings, shortBreakDuration: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label htmlFor="longBreakDuration">Long Break (min)</Label>
                  <Input id="longBreakDuration" type="number" value={currentSettings.longBreakDuration} onChange={(e) => setCurrentSettings({...currentSettings, longBreakDuration: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label htmlFor="pomodorosPerSet">Pomodoros per Set</Label>
                  <Input id="pomodorosPerSet" type="number" value={currentSettings.pomodorosPerSet} onChange={(e) => setCurrentSettings({...currentSettings, pomodorosPerSet: parseInt(e.target.value)})} />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSettingsSave}>Save Settings</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
