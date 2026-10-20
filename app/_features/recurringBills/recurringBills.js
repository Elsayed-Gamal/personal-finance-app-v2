const DAY_IN_MS = 24 * 60 * 60 * 1000;

function monthDetails(now) {
  const year = now.getUTCFullYear();
  const monthIndex = now.getUTCMonth();

  return {
    month: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    today: now.toISOString().slice(0, 10),
    lastDay: new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate(),
    year,
    monthIndex,
  };
}

export function getRecurringBillStatus(bill, now = new Date()) {
  const { month, today, lastDay, year, monthIndex } = monthDetails(now);
  const paymentDate = String(bill.date ?? "").slice(0, 10);

  if (paymentDate.startsWith(month) && paymentDate <= today) return "paid";

  const day = Math.min(Number(bill.day), lastDay);
  if (!Number.isInteger(day) || day < 1) return "upcoming";

  const dueDate = Date.UTC(year, monthIndex, day);
  const todayDate = Date.UTC(year, monthIndex, now.getUTCDate());
  const daysUntilDue = Math.round((dueDate - todayDate) / DAY_IN_MS);

  return daysUntilDue >= 0 && daysUntilDue <= 5 ? "due-soon" : "upcoming";
}

export function buildRecurringBillsSummary(bills, now = new Date()) {
  return bills.reduce(
    (summary, bill) => {
      const amount = Math.abs(Number(bill.amount));
      if (!Number.isFinite(amount)) return summary;

      const status = getRecurringBillStatus(bill, now);
      summary.total.amount += amount;
      summary.total.count += 1;
      if (status === "paid") {
        summary.paid.amount += amount;
        summary.paid.count += 1;
      } else {
        summary.upcoming.amount += amount;
        summary.upcoming.count += 1;
        if (status === "due-soon") {
          summary.dueSoon.amount += amount;
          summary.dueSoon.count += 1;
        }
      }

      return summary;
    },
    {
      total: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      upcoming: { count: 0, amount: 0 },
      dueSoon: { count: 0, amount: 0 },
    },
  );
}

export function formatOrdinal(day) {
  const value = Number(day);
  const lastTwoDigits = value % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return `${value}th`;

  const suffixes = { 1: "st", 2: "nd", 3: "rd" };
  return `${value}${suffixes[value % 10] ?? "th"}`;
}
