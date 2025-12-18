export interface AvailabilityRule {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface AvailabilityException {
  id: number;
  startDatetime: string;
  endDatetime: string;
  type: 'blocked' | 'extra';
}

export interface AvailabilitySettings {
  minLeadTimeHours: number;
  maxBookingsPerDay: number | null;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  date: string;
  availableSlots: TimeSlot[];
  bookings: Array<{
    id: number;
    startTime: string;
    endTime: string;
    status: string;
  }>;
  exceptions: Array<{
    id: number;
    startTime: string;
    endTime: string;
    type: string;
  }>;
}
