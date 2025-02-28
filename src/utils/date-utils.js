import { startOfDay, subDays, startOfWeek, subMonths, format } from "date-fns";

export function filterSubmissionsByDate(submissions) {
  const now = new Date();
  const today = startOfDay(now).getTime() / 1000;
  const yesterday = startOfDay(subDays(now, 1)).getTime() / 1000;
  const dayBeforeYesterday = startOfDay(subDays(now, 2)).getTime() / 1000;
  const oneWeekAgo = startOfDay(subDays(now, 7)).getTime() / 1000;
  const oneMonthAgo = startOfDay(subMonths(now, 1)).getTime() / 1000;

  const result = {
    today: [],
    yesterday: [],
    dayBeforeYesterday: [],
    thisWeek: [],
    thisMonth: [],
  };

  submissions.forEach((submission) => {
    const submissionTime = parseInt(submission.timestamp);

    if (submissionTime >= today) {
      result.today.push(submission);
    } else if (submissionTime >= yesterday) {
      result.yesterday.push(submission);
    } else if (submissionTime >= dayBeforeYesterday) {
      result.dayBeforeYesterday.push(submission);
    }

    if (submissionTime >= oneWeekAgo) {
      result.thisWeek.push(submission);
    }

    if (submissionTime >= oneMonthAgo) {
      result.thisMonth.push(submission);
    }
  });

  return result;
}

export function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return format(date, "h:mm a"); // e.g. "2:30 PM"
  } else {
    return format(date, "MMM d, h:mm a"); // e.g. "Feb 15, 2:30 PM"
  }
}

export function getDayCountFromTimestamps(submissions) {
  const days = new Set();

  submissions.forEach((submission) => {
    const date = new Date(parseInt(submission.timestamp) * 1000).toDateString();
    days.add(date);
  });

  return days.size;
}

export function calculateStreak(submissions) {
  if (submissions.length === 0) return 0;

  // Sort submissions by date (newest first)
  const sorted = [...submissions].sort(
    (a, b) => parseInt(b.timestamp) - parseInt(a.timestamp)
  );

  // Get unique dates
  const dateMap = new Map();
  sorted.forEach((sub) => {
    const date = new Date(parseInt(sub.timestamp) * 1000);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, date);
    }
  });

  // Convert to array and sort
  const dates = Array.from(dateMap.values()).sort((a, b) => b - a);
  if (dates.length === 0) return 0;

  // Check if the newest submission is from today
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const newestDateKey = `${dates[0].getFullYear()}-${dates[0].getMonth()}-${dates[0].getDate()}`;

  if (newestDateKey !== todayKey) {
    return 0; // Streak is broken if no submission today
  }

  // Count consecutive days
  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const curr = dates[i];
    const next = dates[i + 1];

    // Check if dates are consecutive
    const diffTime = curr - next;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break; // Streak is broken
    }
  }

  return streak;
}
