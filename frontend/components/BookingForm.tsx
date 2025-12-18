import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Package } from "lucide-react";
import backend from "@/lib/backend";
import { useApiError } from "@/hooks/useApiError";
import { useToast } from "@/components/ui/use-toast";
import { PaymentCheckout } from "./PaymentCheckout";
import { calculateBookingPrice, formatPricePence } from "~backend/shared/pricing";

interface BookingFormProps {
  serviceId: number;
  basePricePence: number;
  materialsFee: number;
  materialsPolicy: string;
  travelFeePence: number;
  locationTypes: string[];
  durationMinutes: number;
}

interface TimeSlot {
  value: string;
  label: string;
}

export default function BookingForm({
  serviceId,
  basePricePence,
  materialsFee,
  materialsPolicy,
  travelFeePence,
  locationTypes,
  durationMinutes,
}: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [locationType, setLocationType] = useState<string>("");
  const [clientAddress, setClientAddress] = useState({
    line1: "",
    postcode: "",
    city: "",
  });
  const [clientProvidesOwnMaterials, setClientProvidesOwnMaterials] = useState(false);
  const [notes, setNotes] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [freelancerArea, setFreelancerArea] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    bookingId: number;
    clientSecret: string;
    priceBreakdown: any;
  } | null>(null);
  
  const { showError } = useApiError();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot("");
    }
  }, [selectedDate]);

  async function loadAvailableSlots() {
    setLoadingSlots(true);
    try {
      const data = await backend.bookings.getSlots({
        serviceId,
        date: selectedDate,
      });
      
      setFreelancerArea(data.freelancerArea);
      
      const slots = data.slots.map((slot: string) => {
        const date = new Date(slot);
        return {
          value: slot,
          label: date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      });
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Failed to load slots:", error);
      showError(error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  function calculateTotal(): number {
    const breakdown = calculateBookingPrice({
      basePricePence,
      materialsPricePence: materialsFee,
      travelPricePence: travelFeePence,
      materialsPolicy: materialsPolicy as 'client_provides' | 'freelancer_provides' | 'both',
      locationType: locationType as 'client_travels_to_freelancer' | 'freelancer_travels_to_client' | undefined,
      clientProvidesOwnMaterials,
    });
    return breakdown.totalPence;
  }

  function formatLocationType(type: string): string {
    if (type === "client_travels_to_freelancer") {
      return "At Freelancer's Location";
    }
    return "At My Address";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedSlot || !locationType) {
      toast({
        title: "Missing Information",
        description: "Please select a time slot and location type",
        variant: "destructive",
      });
      return;
    }
    
    if (locationType === "freelancer_travels_to_client" && 
        (!clientAddress.line1 || !clientAddress.postcode || !clientAddress.city)) {
      toast({
        title: "Address Required",
        description: "Please enter your full address",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const result = await backend.bookings.create({
        serviceId,
        startDatetime: selectedSlot,
        locationType: locationType as "client_travels_to_freelancer" | "freelancer_travels_to_client",
        clientAddressLine1: locationType === "freelancer_travels_to_client" ? clientAddress.line1 : undefined,
        clientPostcode: locationType === "freelancer_travels_to_client" ? clientAddress.postcode : undefined,
        clientCity: locationType === "freelancer_travels_to_client" ? clientAddress.city : undefined,
        clientProvidesOwnMaterials: materialsPolicy === "both" ? clientProvidesOwnMaterials : undefined,
        notes: notes || undefined,
      });
      
      if (result.requiresPayment && result.clientSecret) {
        setPaymentData({
          bookingId: result.id,
          clientSecret: result.clientSecret,
          priceBreakdown: result.priceBreakdown!,
        });
        setShowPayment(true);
      } else {
        toast({
          title: "Booking Created",
          description: result.message,
        });
        navigate("/client/bookings");
      }
    } catch (error) {
      console.error("Failed to create booking:", error);
      showError(error);
    } finally {
      setSubmitting(false);
    }
  }

  const handlePaymentSuccess = () => {
    toast({
      title: "Payment Successful",
      description: "Your booking has been confirmed. Awaiting freelancer acceptance.",
    });
    navigate("/client/bookings");
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setPaymentData(null);
  };

  if (showPayment && paymentData) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Complete Payment</h2>
        <PaymentCheckout
          clientSecret={paymentData.clientSecret}
          priceBreakdown={paymentData.priceBreakdown}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </Card>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="p-4 md:p-8 border-2 shadow-xl bg-white">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Select Date & Time</h2>
        <p className="text-sm md:text-base text-muted-foreground">Choose a slot for your appointment with this stylist</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 md:p-6 rounded-2xl border-2 border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-gray-700">Date</label>
              <p className="text-xs text-muted-foreground">
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Select a date'}
              </p>
            </div>
          </div>
          <Input
            type="date"
            min={today}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
            className="h-12 text-lg border-2 focus:border-orange-600 rounded-xl"
          />
        </div>

        {selectedDate && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wide text-gray-700">Time</label>
                <p className="text-xs text-muted-foreground">10:00 AM</p>
              </div>
            </div>
            {loadingSlots ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                Loading available times...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-xl border-2 border-dashed">
                No available slots for this date
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Morning</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                    {availableSlots.filter(s => {
                      const hour = new Date(s.value).getHours();
                      return hour < 12;
                    }).map((slot) => (
                      <Button
                        key={slot.value}
                        type="button"
                        variant={selectedSlot === slot.value ? "default" : "outline"}
                        onClick={() => setSelectedSlot(slot.value)}
                        className={`h-12 font-medium rounded-xl border-2 transition-all ${
                          selectedSlot === slot.value 
                            ? 'bg-orange-600 border-orange-600 text-white shadow-lg' 
                            : 'hover:border-orange-600 hover:text-orange-600'
                        }`}
                      >
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Afternoon</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
                    {availableSlots.filter(s => {
                      const hour = new Date(s.value).getHours();
                      return hour >= 12 && hour < 18;
                    }).map((slot) => (
                      <Button
                        key={slot.value}
                        type="button"
                        variant={selectedSlot === slot.value ? "default" : "outline"}
                        onClick={() => setSelectedSlot(slot.value)}
                        className={`h-12 font-medium rounded-xl border-2 transition-all ${
                          selectedSlot === slot.value 
                            ? 'bg-orange-600 border-orange-600 text-white shadow-lg' 
                            : 'hover:border-orange-600 hover:text-orange-600'
                        }`}
                      >
                        {slot.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wide text-gray-700">Location</label>
              <p className="text-xs text-muted-foreground">Choose where the service will take place</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {locationTypes.map((type) => (
              <label 
                key={type} 
                className={`relative flex items-start gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                  locationType === type 
                    ? 'border-orange-600 bg-orange-50 shadow-lg' 
                    : 'border-gray-200 hover:border-orange-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="locationType"
                  value={type}
                  checked={locationType === type}
                  onChange={(e) => setLocationType(e.target.value)}
                  required
                  className="mt-1 w-5 h-5 accent-orange-600"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {type === "client_travels_to_freelancer" ? (
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🏠</span>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🚗</span>
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-lg mb-1">{formatLocationType(type)}</div>
                  {type === "client_travels_to_freelancer" && freelancerArea && (
                    <div className="text-sm text-muted-foreground">
                      {type === "client_travels_to_freelancer" ? "Kemi's Braiding Studio" : "We come to you."}
                    </div>
                  )}
                  {type === "client_travels_to_freelancer" && freelancerArea && (
                    <div className="text-xs text-muted-foreground mt-1">
                      12 Rye Lane, Peckham, London
                    </div>
                  )}
                  {type === "freelancer_travels_to_client" && travelFeePence > 0 && (
                    <div className="text-sm font-medium text-orange-600 mt-2">
                      + £{(travelFeePence / 100).toFixed(2)} Travel Fee
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {locationType === "freelancer_travels_to_client" && (
          <div className="space-y-4 p-4 md:p-6 border-2 border-orange-200 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Your Address
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Start typing your address...</p>
            <Input
              placeholder="Enter postcode or street"
              value={clientAddress.line1}
              onChange={(e) => setClientAddress({ ...clientAddress, line1: e.target.value })}
              required
              className="h-12 border-2 focus:border-orange-600 rounded-xl"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <Input
                placeholder="Postcode"
                value={clientAddress.postcode}
                onChange={(e) => setClientAddress({ ...clientAddress, postcode: e.target.value })}
                required
                className="h-12 border-2 focus:border-orange-600 rounded-xl"
              />
              <Input
                placeholder="City"
                value={clientAddress.city}
                onChange={(e) => setClientAddress({ ...clientAddress, city: e.target.value })}
                required
                className="h-12 border-2 focus:border-orange-600 rounded-xl"
              />
            </div>
          </div>
        )}

        {materialsPolicy === "both" && (
          <div className="p-4 md:p-6 border-2 rounded-2xl bg-white">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input
                type="checkbox"
                checked={clientProvidesOwnMaterials}
                onChange={(e) => setClientProvidesOwnMaterials(e.target.checked)}
                className="mt-1 w-5 h-5 accent-orange-600 rounded"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 font-bold text-lg mb-1">
                  <Package className="h-5 w-5 text-orange-600" />
                  I will provide my own materials
                </div>
                <div className="text-sm text-muted-foreground">
                  Unchecking this will add {formatPricePence(materialsFee)} to the total price
                </div>
              </div>
            </label>
          </div>
        )}

        <div>
          <label className="block text-sm font-bold uppercase tracking-wide text-gray-700 mb-3">
            Notes for Kemi (Optional)
          </label>
          <textarea
            className="w-full min-h-[120px] p-4 border-2 rounded-2xl resize-none focus:border-orange-600 transition-colors"
            placeholder="Anything specific about your hair type or length?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="sticky bottom-0 bg-white p-4 md:p-6 -mx-4 md:-mx-8 -mb-4 md:-mb-8 border-t-2 rounded-b-2xl shadow-2xl">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Service Total</span>
              <span className="text-lg font-medium">{formatPricePence(basePricePence)}</span>
            </div>
            {(materialsPolicy === "freelancer_provides" || 
              (materialsPolicy === "both" && !clientProvidesOwnMaterials)) && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Materials Fee</span>
                <span className="text-lg font-medium">{formatPricePence(materialsFee)}</span>
              </div>
            )}
            {locationType === "freelancer_travels_to_client" && (
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Travel Fee</span>
                <span className="text-lg font-medium">{formatPricePence(travelFeePence)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-4 border-t-2">
              <span className="text-lg font-bold">Total</span>
              <span className="text-3xl font-bold text-orange-600">{formatPricePence(calculateTotal())}</span>
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-lg" 
            disabled={submitting || !selectedSlot}
          >
            {submitting ? "Processing..." : "Continue to Payment →"}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <span className="inline-block w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
            Secure booking & verified professional
          </p>
        </div>
      </form>
    </Card>
  );
}
