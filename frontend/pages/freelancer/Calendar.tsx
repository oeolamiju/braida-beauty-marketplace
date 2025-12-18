import { FreelancerCalendar } from "@/components/FreelancerCalendar";

export default function FreelancerCalendarPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Calendar</h1>
        <p className="text-muted-foreground">
          View and manage your schedule, bookings, and availability
        </p>
      </div>
      <FreelancerCalendar />
    </div>
  );
}

