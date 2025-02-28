import { startOfDay, subDays, startOfWeek, subMonths } from "date-fns";

export function filterSubmissionsByDate(submissions) {
  const now = new Date();
  const today = startOfDay(now).getTime() / 1000;
  const yesterday = startOfDay(subDays(now, 1)).getTime() / 1000;
  const dayBeforeYesterday = startOfDay(subDays(now, 2)).getTime() / 1000;
  const oneWeekAgo = startOfWeek(now).getTime() / 1000;
  const oneMonthAgo = subMonths(now, 1).getTime() / 1000;

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
  return new Date(timestamp * 1000).toLocaleString();
}
