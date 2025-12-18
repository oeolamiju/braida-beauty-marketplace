import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  Calendar as CalendarIcon,
  Clock,
  User,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import backend from "@/lib/backend";

interface CalendarEvent {
  id: string;
  type: "booking" | "blocked" | "exception";
  title: string;
  start: string;
  end: string;
  status?: string;
  clientName?: string;
  serviceTitle?: string;
  bookingId?: number;
  color?: string;
}

type ViewType = "month" | "week" | "day";

export function FreelancerCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>("week");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Block time form state
  const [blockDate, setBlockDate] = useState("");
  const [blockStartTime, setBlockStartTime] = useState("");
  const [blockEndTime, setBlockEndTime] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [blocking, setBlocking] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadCalendar();
  }, [currentDate, view]);

  const loadCalendar = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const response = await backend.availability.getCalendar({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        view,
      });
      setEvents(response.events);
    } catch (error) {
      console.error("Failed to load calendar:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();

    if (view === "month") {
      return {
        startDate: new Date(year, month, 1),
        endDate: new Date(year, month + 1, 0),
      };
    } else if (view === "week") {
      const dayOfWeek = currentDate.getDay();
      const monday = new Date(year, month, day - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { startDate: monday, endDate: sunday };
    } else {
      return {
        startDate: new Date(year, month, day),
        endDate: new Date(year, month, day, 23, 59, 59),
      };
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const weekDays = useMemo(() => {
    const days = [];
    const { startDate } = getDateRange();
    
    if (view === "week") {
      for (let i = 0; i < 7; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        days.push(day);
      }
    } else if (view === "day") {
      days.push(currentDate);
    }
    
    return days;
  }, [currentDate, view]);

  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  const getEventsForSlot = (date: Date, hour: number) => {
    return events.filter((event) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(date);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      return (
        eventStart.toDateString() === date.toDateString() &&
        eventStart.getHours() <= hour &&
        eventEnd.getHours() > hour
      );
    });
  };

  const handleBlockTime = async () => {
    if (!blockDate || !blockStartTime || !blockEndTime) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields",
      });
      return;
    }

    setBlocking(true);
    try {
      await backend.availability.blockTime({
        date: blockDate,
        startTime: blockStartTime,
        endTime: blockEndTime,
        reason: blockReason || undefined,
      });

      toast({
        title: "Time Blocked",
        description: "The time slot has been blocked successfully",
      });

      setBlockDialogOpen(false);
      resetBlockForm();
      loadCalendar();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Block Time",
        description: error.message || "Could not block the time slot",
      });
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblock = async (eventId: string) => {
    const id = parseInt(eventId.replace("blocked-", ""));
    try {
      await backend.availability.unblockTime({ id });
      toast({ title: "Time Unblocked" });
      loadCalendar();
    } catch (error) {
      console.error("Failed to unblock:", error);
    }
  };

  const resetBlockForm = () => {
    setBlockDate("");
    setBlockStartTime("");
    setBlockEndTime("");
    setBlockReason("");
  };

  const handleExportIcal = async () => {
    try {
      const response = await backend.availability.exportIcal();
      const blob = new Blob([response.icalData], { type: "text/calendar" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = response.filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export calendar:", error);
    }
  };

  const formatDateHeader = () => {
    if (view === "month") {
      return currentDate.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    } else if (view === "week") {
      const { startDate, endDate } = getDateRange();
      return `${startDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - ${endDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
    } else {
      return currentDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold min-w-[200px] text-center">{formatDateHeader()}</h2>
          <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="ml-2"
          >
            Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            {(["day", "week", "month"] as ViewType[]).map((v) => (
              <Button
                key={v}
                variant={view === v ? "default" : "ghost"}
                size="sm"
                className="rounded-none"
                onClick={() => setView(v)}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={handleExportIcal}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setBlockDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Block Time
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {view === "month" ? (
          <MonthView
            currentDate={currentDate}
            events={events}
            onEventClick={(event) => {
              if (event.bookingId) {
                navigate(`/freelancer/bookings/${event.bookingId}`);
              } else {
                setSelectedEvent(event);
              }
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid border-b" style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}>
                <div className="p-2 border-r bg-gray-50"></div>
                {weekDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`p-2 text-center border-r ${
                      day.toDateString() === new Date().toDateString()
                        ? "bg-orange-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground">
                      {day.toLocaleDateString("en-GB", { weekday: "short" })}
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        day.toDateString() === new Date().toDateString()
                          ? "text-orange-600"
                          : ""
                      }`}
                    >
                      {day.getDate()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="grid border-b"
                  style={{ gridTemplateColumns: `60px repeat(${weekDays.length}, 1fr)` }}
                >
                  <div className="p-2 text-xs text-muted-foreground border-r bg-gray-50 text-right">
                    {hour.toString().padStart(2, "0")}:00
                  </div>
                  {weekDays.map((day) => {
                    const slotEvents = getEventsForSlot(day, hour);
                    return (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className="p-1 border-r min-h-[60px] relative"
                      >
                        {slotEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded mb-1 cursor-pointer ${
                              event.type === "blocked"
                                ? "bg-gray-200 text-gray-700"
                                : ""
                            }`}
                            style={{ backgroundColor: event.type !== "blocked" ? event.color + "20" : undefined }}
                            onClick={() => {
                              if (event.bookingId) {
                                navigate(`/freelancer/bookings/${event.bookingId}`);
                              } else {
                                setSelectedEvent(event);
                              }
                            }}
                          >
                            <div
                              className="font-medium truncate"
                              style={{ color: event.type !== "blocked" ? event.color : undefined }}
                            >
                              {event.title}
                            </div>
                            {event.clientName && (
                              <div className="truncate text-gray-600">
                                {event.clientName}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Block Time Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block Time Slot</DialogTitle>
            <DialogDescription>
              Block out time when you're unavailable for bookings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <Input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time *</label>
                <Input
                  type="time"
                  value={blockStartTime}
                  onChange={(e) => setBlockStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time *</label>
                <Input
                  type="time"
                  value={blockEndTime}
                  onChange={(e) => setBlockEndTime(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reason (optional)</label>
              <Input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g., Personal time, Holiday"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBlockTime} disabled={blocking}>
                {blocking ? "Blocking..." : "Block Time"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {new Date(selectedEvent.start).toLocaleString("en-GB")} -{" "}
                  {new Date(selectedEvent.end).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {selectedEvent.clientName && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.clientName}</span>
                </div>
              )}
              {selectedEvent.type === "blocked" && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleUnblock(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove Block
                </Button>
              )}
              {selectedEvent.bookingId && (
                <Button
                  onClick={() => navigate(`/freelancer/bookings/${selectedEvent.bookingId}`)}
                  className="w-full"
                >
                  View Booking Details
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Month View Component
function MonthView({
  currentDate,
  events,
  onEventClick,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = (firstDay.getDay() + 6) % 7; // Monday = 0
  
  const days: (Date | null)[] = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  const getEventsForDay = (date: Date) => {
    return events.filter((e) => {
      const eventDate = new Date(e.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div>
      <div className="grid grid-cols-7 border-b">
        {weekdays.map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground bg-gray-50">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <div
            key={i}
            className={`min-h-[100px] p-1 border-r border-b ${
              !day ? "bg-gray-50" : ""
            } ${
              day?.toDateString() === new Date().toDateString() ? "bg-orange-50" : ""
            }`}
          >
            {day && (
              <>
                <div
                  className={`text-sm font-medium mb-1 ${
                    day.toDateString() === new Date().toDateString()
                      ? "text-orange-600"
                      : ""
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {getEventsForDay(day).slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded cursor-pointer truncate"
                      style={{ backgroundColor: event.color + "20", color: event.color }}
                      onClick={() => onEventClick(event)}
                    >
                      {event.title}
                    </div>
                  ))}
                  {getEventsForDay(day).length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{getEventsForDay(day).length - 3} more
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

