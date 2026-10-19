// The recurring view contains the latest payment per bill, not a payment ledger.
// Upcoming amounts are estimates for the current month based on those records.
export function recurringSummary(bills, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const lastDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const summary = { paid: 0, upcoming: 0, dueSoon: 0 };
  for (const bill of bills) {
    const amount = Number(bill.amount);
    const paymentDate = String(bill.date ?? "").slice(0, 10);
    if (
      !Number.isFinite(amount) ||
      amount >= 0 ||
      !paymentDate ||
      paymentDate > today
    )
      continue;
    if (paymentDate.startsWith(month)) {
      summary.paid += Math.abs(amount);
      continue;
    }
    const day = Number(bill.day);
    if (!Number.isInteger(day) || day < 1 || day > 31) continue;
    const dueDay = Math.min(day, lastDay);
    summary.upcoming += Math.abs(amount);
    if (dueDay >= now.getUTCDate() && dueDay <= now.getUTCDate() + 5)
      summary.dueSoon += Math.abs(amount);
  }
  return summary;
}
