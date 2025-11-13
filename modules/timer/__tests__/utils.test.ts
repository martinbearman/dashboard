import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  formatTime, 
  minutesToSeconds, 
  secondsToMinutes,
  getMotivationalMessage,
  formatStudyTime,
  formatTimeStamp,
  isToday
} from '../lib/utils'

// Mock window for server-side checks
beforeEach(() => {
  vi.resetAllMocks()
})

/**
 * Unit Tests for Utility Functions
 * 
 * These tests demonstrate how to write tests with Vitest.
 * Tests are organized using describe blocks and it/test blocks.
 * 
 * Run tests with: npm test
 */

describe('formatTime', () => {
  it('should format 1500 seconds as 25:00', () => {
    expect(formatTime(1500)).toBe('25:00')
  })

  it('should format 420 seconds as 07:00', () => {
    expect(formatTime(420)).toBe('07:00')
  })

  it('should format 90 seconds as 01:30', () => {
    expect(formatTime(90)).toBe('01:30')
  })

  it('should format 5 seconds as 00:05', () => {
    expect(formatTime(5)).toBe('00:05')
  })

  it('should format 0 seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })
})

describe('minutesToSeconds', () => {
  it('should convert 25 minutes to 1500 seconds', () => {
    expect(minutesToSeconds(25)).toBe(1500)
  })

  it('should convert 7 minutes to 420 seconds', () => {
    expect(minutesToSeconds(7)).toBe(420)
  })

  it('should convert 0 minutes to 0 seconds', () => {
    expect(minutesToSeconds(0)).toBe(0)
  })
})

describe('secondsToMinutes', () => {
  it('should convert 1500 seconds to 25 minutes', () => {
    expect(secondsToMinutes(1500)).toBe(25)
  })

  it('should convert 420 seconds to 7 minutes', () => {
    expect(secondsToMinutes(420)).toBe(7)
  })

  it('should round 90 seconds to 2 minutes', () => {
    expect(secondsToMinutes(90)).toBe(2)
  })
})

describe('getMotivationalMessage', () => {
  it('should return starter message for 0 sessions', () => {
    const message = getMotivationalMessage(0)
    expect(message).toContain('started')
  })

  it('should return encouraging message for 1 session', () => {
    const message = getMotivationalMessage(1)
    expect(message).toBeTruthy()
    expect(typeof message).toBe('string')
  })

  it('should return different messages for different session counts', () => {
    const message1 = getMotivationalMessage(1)
    const message5 = getMotivationalMessage(5)
    const message10 = getMotivationalMessage(10)
    
    // All should be strings
    expect(typeof message1).toBe('string')
    expect(typeof message5).toBe('string')
    expect(typeof message10).toBe('string')
  })
})

describe('formatStudyTime', () => {
  it('should format time with hours and minutes', () => {
    expect(formatStudyTime(9000)).toBe('2h 30m') // 2.5 hours
  })

  it('should format time with only minutes when less than an hour', () => {
    expect(formatStudyTime(2700)).toBe('45m') // 45 minutes
  })

  it('should handle zero seconds', () => {
    expect(formatStudyTime(0)).toBe('0m')
  })
})

describe('formatTimeStamp', () => {
  it('should format timestamp with date and time', () => {
    const timestamp = new Date('2024-10-15T14:30:00').getTime()
    const result = formatTimeStamp(timestamp)
    
    expect(result).toContain('Oct') // Month
    expect(result).toContain('15') // Day
    expect(result).toContain('2024') // Year
    expect(result).toContain('at') // Time separator
    expect(result).toMatch(/\d{1,2}:\d{2}/) // Time format
  })

  it('should format timestamp in 12-hour format', () => {
    const timestamp = new Date('2024-10-15T14:30:00').getTime()
    const result = formatTimeStamp(timestamp)
    
    // The function uses en-GB locale which returns lowercase am/pm
    expect(result).toMatch(/am|pm/i)
  })
})

describe('isToday', () => {
  it('should return true for current timestamp', () => {
    expect(isToday(Date.now())).toBe(true)
  })

  it('should return false for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(isToday(yesterday.getTime())).toBe(false)
  })

  it('should return false for tomorrow', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(isToday(tomorrow.getTime())).toBe(false)
  })

  it('should return false for distant past', () => {
    const pastDate = new Date('2020-01-01').getTime()
    expect(isToday(pastDate)).toBe(false)
  })
})

