"use client";

import { ModuleProps } from "@/lib/types/dashboard";
// TODO: Import your pomodoro timer component here
// import { PomodoroTimer } from "pomodoro-timer";
// OR if copied directly into this module:
// import PomodoroTimer from "./components/PomodoroTimer";

/**
 * Timer Module Component
 * 
 * This component wraps your pomodoro timer to integrate with the dashboard module system.
 * The module receives moduleId and config props from the dashboard system.
 * 
 * This module is self-contained - all timer-related code should live in this folder:
 * - components/ - pomodoro timer components
 * - hooks/ - timer-specific hooks (e.g., useTimer, usePomodoro)
 * - types/ - timer-specific types
 * - utils/ - timer utilities (e.g., formatTime, calculateProgress)
 */
export default function TimerModule({ moduleId, config }: ModuleProps) {
  // TODO: Replace this placeholder with your actual pomodoro timer component
  // You may need to adapt props if your pomodoro timer uses different prop names
  
  return (
    <div className="h-full w-full flex items-center justify-center">
      {/* 
        Example usage (adjust based on your pomodoro timer's props):
        <PomodoroTimer 
          duration={config?.duration || 25} 
          onComplete={() => console.log('Timer completed')}
        />
      */}
      <div className="p-4 bg-blue-100 rounded text-black">
        Timer Module (moduleId: {moduleId})
        {/* Replace with your pomodoro timer component */}
      </div>
    </div>
  );
}
