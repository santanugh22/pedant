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

export function formatEventDate(isoDate: string | Date): { date: string; time: string } {
  if (!isoDate) return { date: '', time: '' };
  const d = dayjs(isoDate).tz('Asia/Kolkata');
  return {
    date: d.format('D MMM YY'), // e.g. 10 Aug 26
    time: d.format('hh:mm A'),   // e.g. 11:50 PM
  };
}

export function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}
