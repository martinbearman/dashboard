/**
 * Utility Functions
 * 
 * Helper functions used throughout the app.
 * Keeping them in a separate file makes them:
 * - Reusable
 * - Testable
 * - Easy to maintain
 */

/**
 * Format seconds into MM:SS format
 * 
 * @param seconds - Total seconds to format
 * @returns Formatted time string (e.g., "25:00", "05:30")
 * 
 * Example:
 * formatTime(1500) => "25:00"
 * formatTime(90) => "01:30"
 * formatTime(5) => "00:05"
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Format seconds into HH:MM:SS format for total time display
 * 
 * @param seconds - Total seconds to format
 * @returns Formatted time string (e.g., "1:25:30", "00:05:30", "0:00:05")
 * 
 * Example:
 * formatTotalTime(3723) => "1:02:03"  (1 hour, 2 minutes, 3 seconds)
 * formatTotalTime(90) => "0:01:30"    (1 minute, 30 seconds)
 * formatTotalTime(5) => "0:00:05"     (5 seconds)
 */
export function formatTotalTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  
  return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Convert minutes to seconds
 * 
 * @param minutes - Number of minutes
 * @returns Number of seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60
}

/**
 * Convert seconds to minutes (rounded)
 * 
 * @param seconds - Number of seconds
 * @returns Number of minutes
 */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60)
}

// Removed obsolete playSound helper; sounds are handled via use-sound in UI

/**
 * Get a motivational message based on completed sessions
 * 
 * @param sessions - Number of completed sessions
 * @returns A motivational message
 */
export function getMotivationalMessage(sessions: number): string {
  if (sessions === 0) {
    return "Let's get started! 🚀"
  } else if (sessions === 1) {
    return "Great start! Keep going! 💪"
  } else if (sessions < 4) {
    return "You're on a roll! 🔥"
  } else if (sessions < 8) {
    return "Incredible focus! 🌟"
  } else {
    return "You're a study machine! 🏆"
  }
}

/**
 * Format total study time into a human-readable string
 * 
 * @param seconds - Total seconds studied
 * @returns Formatted string (e.g., "2h 30m", "45m")
 */
export function formatStudyTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Format a timestamp into a human-readable string
 * 
 * @param timestamp - Timestamp to format
 * @returns Formatted string (e.g., "Oct 10, 2025 at 10:00 AM")
 */

export function formatTimeStamp(timestamp: number): string {
  const date = new Date(timestamp)
  
  const dateString = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  
  const timeString = date.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
  
  return `${dateString} at ${timeString}`
}

/**
 * Check if a timestamp is today
 * 
 * @param timestamp - Timestamp to check
 * @returns True if the timestamp is today, false otherwise
 */

export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp)
  const today = new Date()

  return date.toDateString() === today.toDateString()
}
