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

export function normalizeImageSrc(src) {
  if (typeof src !== "string") return src;

  const trimmedSrc = src.trim();
  if (trimmedSrc.startsWith("./")) return trimmedSrc.slice(1);
  if (trimmedSrc.startsWith("assets/")) return `/${trimmedSrc}`;

  return trimmedSrc;
}

export function createUuid() {
  const cryptoApi = globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === "function") {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export function calcPosition(element) {
  if (!element) return null;
  const rect = element.getBoundingClientRect();
  const gap = 8;
  const menuHeight = 100;
  const spaceBelow = window.innerHeight - rect.bottom;

  return {
    x: Math.max(gap, window.innerWidth - rect.right),
    y:
      spaceBelow >= menuHeight + gap
        ? rect.bottom + gap
        : Math.max(gap, rect.top - menuHeight - gap),
  };
}
