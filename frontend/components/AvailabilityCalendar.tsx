import { useState, useEffect } from "react";
import { useBackend } from "@/hooks/useBackend";
import { useApiError } from "@/hooks/useApiError";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DaySchedule {
  date: string;
  availableSlots: Array<{ startTime: string; endTime: string }>;
  bookings: Array<{ id: number; startTime: string; endTime: string; status: string }>;
  exceptions: Array<{ id: number; startTime: string; endTime: string; type: string }>;
}

export default function AvailabilityCalendar() {
  const backend = useBackend();
  const { showError } = useApiError();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchedule();
  }, [currentDate]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const dateStr = currentDate.toISOString().split('T')[0];
      const response = await backend.availability.getSchedule({ date: dateStr });
      setSchedule(response.schedule);
    } catch (error) {
      showError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" size="sm" onClick={previousDay}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <h3 className="text-lg font-semibold">{formatDate(currentDate)}</h3>
          <Button variant="link" size="sm" onClick={today}>
            Today
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={nextDay}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
      ) : schedule ? (
        <div className="space-y-4">
          {schedule.bookings.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Bookings</h4>
              <div className="space-y-2">
                {schedule.bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 border rounded-md bg-blue-50 dark:bg-blue-950">
                    <div>
                      <div className="font-medium">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                      <Badge variant={getStatusColor(booking.status)} className="mt-1">
                        {booking.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {schedule.exceptions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Exceptions</h4>
              <div className="space-y-2">
                {schedule.exceptions.map((exception) => (
                  <div
                    key={exception.id}
                    className={`flex items-center justify-between p-3 border rounded-md ${
                      exception.type === 'blocked'
                        ? 'bg-red-50 dark:bg-red-950'
                        : 'bg-green-50 dark:bg-green-950'
                    }`}
                  >
                    <div>
                      <div className="font-medium">
                        {formatTime(exception.startTime)} - {formatTime(exception.endTime)}
                      </div>
                      <Badge variant={exception.type === 'blocked' ? 'destructive' : 'default'} className="mt-1">
                        {exception.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {schedule.availableSlots.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Available Slots ({schedule.availableSlots.length})</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {schedule.availableSlots.slice(0, 12).map((slot, index) => (
                  <div key={index} className="p-2 border rounded text-center text-sm bg-green-50 dark:bg-green-950">
                    {formatTime(slot.startTime)}
                  </div>
                ))}
              </div>
              {schedule.availableSlots.length > 12 && (
                <p className="text-sm text-muted-foreground mt-2">
                  +{schedule.availableSlots.length - 12} more slots
                </p>
              )}
            </div>
          )}

          {schedule.bookings.length === 0 &&
            schedule.exceptions.length === 0 &&
            schedule.availableSlots.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No schedule data for this day
              </div>
            )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No schedule data available
        </div>
      )}
    </Card>
  );
}
