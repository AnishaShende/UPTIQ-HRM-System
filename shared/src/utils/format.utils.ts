/**
 * Format currency amount
 */
export const formatCurrency = (
  amount: number,
  currency = "USD",
  locale = "en-US"
): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Format number with commas
 */
export const formatNumber = (
  number: number,
  locale = "en-US",
  minimumFractionDigits = 0,
  maximumFractionDigits = 2
): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(number);
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  locale = "en-US",
  minimumFractionDigits = 0,
  maximumFractionDigits = 2
): string => {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100);
};

/**
 * Format date
 */
export const formatDate = (
  date: Date,
  format = "short",
  locale = "en-US"
): string => {
  const options: Intl.DateTimeFormatOptions = {};

  switch (format) {
    case "short":
      options.dateStyle = "short";
      break;
    case "medium":
      options.dateStyle = "medium";
      break;
    case "long":
      options.dateStyle = "long";
      break;
    case "full":
      options.dateStyle = "full";
      break;
    case "time":
      options.timeStyle = "short";
      break;
    case "datetime":
      options.dateStyle = "short";
      options.timeStyle = "short";
      break;
    default:
      options.dateStyle = "short";
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
};

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 */
export const formatRelativeTime = (date: Date, locale = "en-US"): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const intervals = [
    { unit: "year" as const, seconds: 31536000 },
    { unit: "month" as const, seconds: 2592000 },
    { unit: "week" as const, seconds: 604800 },
    { unit: "day" as const, seconds: 86400 },
    { unit: "hour" as const, seconds: 3600 },
    { unit: "minute" as const, seconds: 60 },
    { unit: "second" as const, seconds: 1 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(Math.abs(diffInSeconds) / interval.seconds);
    if (count >= 1) {
      return rtf.format(diffInSeconds < 0 ? -count : count, interval.unit);
    }
  }

  return rtf.format(0, "second");
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  }

  // For other formats, just return the cleaned number
  return cleaned;
};

/**
 * Format name (capitalize first letter of each word)
 */
export const formatName = (name: string): string => {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Format employee ID with padding
 */
export const formatEmployeeId = (
  id: number,
  prefix = "EMP",
  padding = 4
): string => {
  return `${prefix}${id.toString().padStart(padding, "0")}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
};

/**
 * Convert camelCase to Title Case
 */
export const camelCaseToTitleCase = (str: string): string => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
};

/**
 * Convert snake_case to Title Case
 */
export const snakeCaseToTitleCase = (str: string): string => {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Generate initials from name
 */
export const generateInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

/**
 * Format duration in minutes to human readable format
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} min${mins !== 1 ? "s" : ""}`;
  } else if (mins === 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  } else {
    return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} min${
      mins !== 1 ? "s" : ""
    }`;
  }
};
