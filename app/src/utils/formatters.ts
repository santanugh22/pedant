import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatCurrency(amount: number, currency = 'INR'): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `₹ ${formatted}`;
}

export function formatEventDate(rawDate?: string | Date | number | null): { date: string; time: string } {
  if (!rawDate) return { date: 'TBD', time: '--' };
  try {
    const d = typeof rawDate === 'string' || typeof rawDate === 'number' ? new Date(rawDate) : rawDate;
    if (!(d instanceof Date) || isNaN(d.getTime())) {
      return { date: 'TBD', time: '--' };
    }
    const dateFormatter = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
      timeZone: 'Asia/Kolkata',
    });
    const timeFormatter = new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
    return {
      date: dateFormatter.format(d),
      time: timeFormatter.format(d).toUpperCase(),
    };
  } catch {
    return { date: 'TBD', time: '--' };
  }
}

export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}
