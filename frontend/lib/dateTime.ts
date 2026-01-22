import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid time';
  
  return format(d, 'h:mm a');
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateRange(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): string {
  if (!startDate || !endDate) return 'N/A';
  
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  if (!isValid(start) || !isValid(end)) return 'Invalid date range';
  
  return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
}

export function formatTimeRange(
  startTime: Date | string | null | undefined,
  endTime: Date | string | null | undefined
): string {
  if (!startTime || !endTime) return 'N/A';
  
  const start = typeof startTime === 'string' ? parseISO(startTime) : startTime;
  const end = typeof endTime === 'string' ? parseISO(endTime) : endTime;
  
  if (!isValid(start) || !isValid(end)) return 'Invalid time range';
  
  return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hr${hours > 1 ? 's' : ''} ${mins} min`;
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  
  return format(d, 'MM/dd/yyyy');
}

export function formatLongDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  
  return format(d, 'EEEE, MMMM d, yyyy');
}

export function formatBookingDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  
  return format(d, 'EEEE, MMM d \'at\' h:mm a');
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function isTomorrow(date: Date | string): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

export function getSmartDateLabel(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  
  return formatDate(d);
}
