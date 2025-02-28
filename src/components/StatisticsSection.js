export default function StatisticsSection({ submissionsByPeriod }) {
  const { today, yesterday, dayBeforeYesterday, thisWeek, thisMonth } =
    submissionsByPeriod;

  const acceptedToday = today.filter(
    (sub) => sub.statusDisplay === "Accepted"
  ).length;
  const acceptedYesterday = yesterday.filter(
    (sub) => sub.statusDisplay === "Accepted"
  ).length;
  const acceptedDayBeforeYesterday = dayBeforeYesterday.filter(
    (sub) => sub.statusDisplay === "Accepted"
  ).length;
  const acceptedThisWeek = thisWeek.filter(
    (sub) => sub.statusDisplay === "Accepted"
  ).length;
  const acceptedThisMonth = thisMonth.filter(
    (sub) => sub.statusDisplay === "Accepted"
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <StatCard
        title="Today"
        count={today.length}
        acceptedCount={acceptedToday}
      />
      <StatCard
        title="Yesterday"
        count={yesterday.length}
        acceptedCount={acceptedYesterday}
      />
      <StatCard
        title="Day Before"
        count={dayBeforeYesterday.length}
        acceptedCount={acceptedDayBeforeYesterday}
      />
      <StatCard
        title="This Week"
        count={thisWeek.length}
        acceptedCount={acceptedThisWeek}
      />
      <StatCard
        title="This Month"
        count={thisMonth.length}
        acceptedCount={acceptedThisMonth}
      />
    </div>
  );
}

function StatCard({ title, count, acceptedCount }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-1">
        <div className="text-2xl font-semibold">{count}</div>
        <div className="text-sm text-green-600">{acceptedCount} accepted</div>
      </div>
    </div>
  );
}
