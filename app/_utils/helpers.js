export function formatCurrency(amount, digits = 2) {
  if (isNaN(amount)) return "-";
  if (amount < 0) amount = Math.abs(amount);

  if (digits < 0) digits = 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

export function formatPercentage(value) {
  return `${(value * 100).toFixed(2)}%`;
}

export function calcPosition(element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();

  return {
    x: window.innerWidth - rect.width * 2 - rect.x,
    y: rect.y + rect.height + 16,
  };
}
