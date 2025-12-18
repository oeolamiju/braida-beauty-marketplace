import { useState, useEffect } from "react";
import { useBackend } from "@/hooks/useBackend";
import { useApiError } from "@/hooks/useApiError";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { Calendar, Clock, Plus, Trash2, Save, CalendarCheck } from "lucide-react";

interface AvailabilityRule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AvailabilityException {
  id: number;
  startDatetime: string;
  endDatetime: string;
  type: 'blocked' | 'extra';
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Availability() {
  const backend = useBackend();
  const { showError } = useApiError();
  const { toast } = useToast();

  const [minLeadTimeHours, setMinLeadTimeHours] = useState(0);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState<number | null>(null);
  const [rules, setRules] = useState<Record<number, { startTime: string; endTime: string }>>({});
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [loading, setLoading] = useState(true);

  const [newExceptionStart, setNewExceptionStart] = useState("");
  const [newExceptionEnd, setNewExceptionEnd] = useState("");
  const [newExceptionType, setNewExceptionType] = useState<'blocked' | 'extra'>('blocked');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, rulesRes, exceptionsRes] = await Promise.all([
        backend.availability.getSettings(),
        backend.availability.getRules(),
        backend.availability.listExceptions({}),
      ]);

      setMinLeadTimeHours(settingsRes.settings.minLeadTimeHours);
      setMaxBookingsPerDay(settingsRes.settings.maxBookingsPerDay);

      const rulesMap: Record<number, { startTime: string; endTime: string }> = {};
      rulesRes.rules.forEach((rule) => {
        rulesMap[rule.dayOfWeek] = {
          startTime: rule.startTime.substring(0, 5),
          endTime: rule.endTime.substring(0, 5),
        };
      });
      setRules(rulesMap);
      setExceptions(exceptionsRes.exceptions);
    } catch (error) {
      showError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      await backend.availability.setSettings({
        minLeadTimeHours,
        maxBookingsPerDay: maxBookingsPerDay || undefined,
      });

      const ruleArray = Object.entries(rules).map(([day, times]) => ({
        dayOfWeek: parseInt(day),
        startTime: times.startTime,
        endTime: times.endTime,
      }));

      await backend.availability.setRules({ rules: ruleArray });

      toast({ title: "Availability settings saved" });
    } catch (error) {
      showError(error);
      console.error(error);
    }
  };

  const toggleDay = (dayOfWeek: number) => {
    setRules((prev) => {
      const newRules = { ...prev };
      if (newRules[dayOfWeek]) {
        delete newRules[dayOfWeek];
      } else {
        newRules[dayOfWeek] = { startTime: "09:00", endTime: "17:00" };
      }
      return newRules;
    });
  };

  const updateDayTime = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setRules((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }));
  };

  const addException = async () => {
    if (!newExceptionStart || !newExceptionEnd) {
      toast({ title: "Please fill in both start and end times", variant: "destructive" });
      return;
    }

    try {
      await backend.availability.addException({
        startDatetime: newExceptionStart,
        endDatetime: newExceptionEnd,
        type: newExceptionType,
      });

      setNewExceptionStart("");
      setNewExceptionEnd("");
      toast({ title: "Exception added" });
      loadData();
    } catch (error) {
      showError(error);
      console.error(error);
    }
  };

  const deleteException = async (id: number) => {
    try {
      await backend.availability.deleteException({ id });
      toast({ title: "Exception deleted" });
      loadData();
    } catch (error) {
      showError(error);
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading availability settings...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Availability Management</h1>
        <p className="text-muted-foreground">Set your recurring hours, block out holidays, and manage your booking rules to maintain a healthy work-life balance.</p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Weekly Schedule</h2>
            </div>
            <Badge variant="secondary" className="w-full justify-center">Recurring</Badge>

            <div className="space-y-2">
              {DAYS.map((day, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-md bg-background">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded accent-primary"
                    checked={!!rules[index]}
                    onChange={() => toggleDay(index)}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{day}</div>
                    {rules[index] ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          type="time"
                          className="h-8 text-xs px-2"
                          value={rules[index].startTime}
                          onChange={(e) => updateDayTime(index, 'startTime', e.target.value)}
                        />
                        <span className="text-xs text-muted-foreground">to</span>
                        <Input
                          type="time"
                          className="h-8 text-xs px-2"
                          value={rules[index].endTime}
                          onChange={(e) => updateDayTime(index, 'endTime', e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground italic mt-1">Unavailable</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Booking Rules</h2>
            </div>

            <div>
              <label className="text-sm font-medium">Minimum Lead Time</label>
              <p className="text-xs text-muted-foreground mb-2">How far in advance must clients book?</p>
              <select
                className="w-full px-3 py-2 border rounded-md bg-background text-sm"
                value={minLeadTimeHours}
                onChange={(e) => setMinLeadTimeHours(parseInt(e.target.value))}
              >
                <option value="0">⏱️ 24 Hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">3 days</option>
                <option value="168">1 week</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Max Bookings Per Day</label>
              <p className="text-xs text-muted-foreground mb-2">Limit your daily workload.</p>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 5"
                className="text-sm"
                value={maxBookingsPerDay || ""}
                onChange={(e) => setMaxBookingsPerDay(e.target.value ? parseInt(e.target.value) : null)}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={saveSettings} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => loadData()}>Discard</Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <h2 className="text-xl font-semibold">November 2023</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Month</Button>
                <Button variant="ghost" size="sm">Week</Button>
                <Button variant="default" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Block Time
                </Button>
              </div>
            </div>
            <AvailabilityCalendar />
          </Card>
        </div>
      </div>


    </div>
  );
}
