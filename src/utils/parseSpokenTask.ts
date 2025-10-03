import { parseISO, addDays, addWeeks, setHours, setMinutes, startOfDay, parse } from 'date-fns';

export interface ParsedTask {
  title: string;
  when: string | null;
  rawTranscript: string;
}

/**
 * Parse spoken task from natural language
 * Handles patterns like:
 * - "create task: buy groceries"
 * - "remind me to call mom tomorrow at 3pm"
 * - "add meeting next week at 2:30"
 * - "schedule dentist appointment on Oct 5 at 3pm"
 */
export function parseSpokenTask(transcript: string): ParsedTask {
  const cleaned = transcript.trim().toLowerCase();
  
  // Extract time information
  const when = extractTime(cleaned);
  
  // Extract title by removing command prefixes and time info
  const title = extractTitle(cleaned);
  
  return {
    title,
    when,
    rawTranscript: transcript
  };
}

function extractTitle(text: string): string {
  // Remove command prefixes
  let title = text
    .replace(/^(create|add|make|new|schedule|remind me to|remind me|set reminder to|set reminder)\s+(a\s+|an\s+)?/i, '')
    .replace(/^(task|reminder|meeting|appointment|event|note)[\s:]+/i, '')
    .trim();
  
  // Remove time information from the end
  title = title
    .replace(/\s+(tomorrow|today|tonight|this\s+(morning|afternoon|evening|week|month)|next\s+(week|month|monday|tuesday|wednesday|thursday|friday|saturday|sunday))(\s+at\s+[\d:apm\s]+)?$/i, '')
    .replace(/\s+at\s+[\d:apm\s]+$/i, '')
    .replace(/\s+on\s+\w+\s+\d+(\s+at\s+[\d:apm\s]+)?$/i, '')
    .trim();
  
  // Capitalize first letter
  if (title.length > 0) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  }
  
  return title || 'Untitled task';
}

function extractTime(text: string): string | null {
  const now = new Date();
  
  // Check for "tomorrow"
  if (/\btomorrow\b/i.test(text)) {
    const time = extractTimeOfDay(text);
    const tomorrow = addDays(startOfDay(now), 1);
    if (time) {
      return setMinutes(setHours(tomorrow, time.hours), time.minutes).toISOString();
    }
    return setHours(tomorrow, 9).toISOString(); // Default 9 AM
  }
  
  // Check for "today" or "tonight"
  if (/\b(today|tonight)\b/i.test(text)) {
    const time = extractTimeOfDay(text);
    const today = startOfDay(now);
    if (time) {
      return setMinutes(setHours(today, time.hours), time.minutes).toISOString();
    }
    return /\btonight\b/i.test(text) 
      ? setHours(today, 20).toISOString() // 8 PM
      : setHours(today, 14).toISOString(); // 2 PM
  }
  
  // Check for "next week"
  if (/\bnext\s+week\b/i.test(text)) {
    const time = extractTimeOfDay(text);
    const nextWeek = addWeeks(startOfDay(now), 1);
    if (time) {
      return setMinutes(setHours(nextWeek, time.hours), time.minutes).toISOString();
    }
    return setHours(nextWeek, 9).toISOString(); // Default 9 AM
  }
  
  // Check for specific days (next Monday, next Tuesday, etc.)
  const dayMatch = text.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
  if (dayMatch) {
    const targetDay = dayMatch[1].toLowerCase();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = now.getDay();
    const targetDayIndex = days.indexOf(targetDay);
    let daysToAdd = targetDayIndex - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;
    
    const time = extractTimeOfDay(text);
    const targetDate = addDays(startOfDay(now), daysToAdd);
    if (time) {
      return setMinutes(setHours(targetDate, time.hours), time.minutes).toISOString();
    }
    return setHours(targetDate, 9).toISOString();
  }
  
  // Check for specific dates (Oct 5, October 5, 10/5, etc.)
  const dateMatch = text.match(/\bon\s+(\w+\s+\d+|\d+\/\d+)/i);
  if (dateMatch) {
    try {
      const dateStr = dateMatch[1];
      let targetDate: Date;
      
      if (/\d+\/\d+/.test(dateStr)) {
        // Handle MM/DD format
        const [month, day] = dateStr.split('/').map(Number);
        targetDate = new Date(now.getFullYear(), month - 1, day);
      } else {
        // Handle "Oct 5" or "October 5" format
        targetDate = parse(dateStr, 'MMM d', now);
      }
      
      if (!isNaN(targetDate.getTime())) {
        const time = extractTimeOfDay(text);
        if (time) {
          return setMinutes(setHours(targetDate, time.hours), time.minutes).toISOString();
        }
        return setHours(targetDate, 9).toISOString();
      }
    } catch (e) {
      console.error('Date parsing error:', e);
    }
  }
  
  // Check for just a time (assume today)
  const time = extractTimeOfDay(text);
  if (time) {
    const targetDate = now.getHours() > time.hours 
      ? addDays(startOfDay(now), 1) // If time has passed, schedule for tomorrow
      : startOfDay(now);
    return setMinutes(setHours(targetDate, time.hours), time.minutes).toISOString();
  }
  
  return null;
}

function extractTimeOfDay(text: string): { hours: number; minutes: number } | null {
  // Match patterns like "at 3pm", "at 3:30pm", "at 15:00", "3 pm"
  const timePattern = /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i;
  const match = text.match(timePattern);
  
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3]?.toLowerCase();
    
    if (meridiem === 'pm' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'am' && hours === 12) {
      hours = 0;
    }
    
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return { hours, minutes };
    }
  }
  
  return null;
}
