import { BookingDashboard } from "@/components/BookingDashboard";

export default function FreelancerDashboard() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Real-time overview of your bookings and schedule</p>
      </div>

      <BookingDashboard />
    </div>
  );
}
