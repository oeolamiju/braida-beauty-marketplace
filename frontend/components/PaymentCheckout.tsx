import { useState, useEffect } from "react";
import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { STRIPE_PUBLISHABLE_KEY } from "../config";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface PaymentCheckoutProps {
  clientSecret: string;
  priceBreakdown: {
    basePricePence: number;
    materialsPricePence: number;
    travelPricePence: number;
    platformFeePence: number;
    totalPence: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ 
  priceBreakdown, 
  onSuccess, 
  onCancel 
}: Omit<PaymentCheckoutProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/client/bookings`,
      },
      redirect: "if_required",
    });

    if (submitError) {
      setError(submitError.message || "Payment failed");
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  const formatPrice = (pence: number) => `£${(pence / 100).toFixed(2)}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-4 space-y-2">
        <h3 className="font-semibold text-lg">Price Breakdown</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Base Price:</span>
            <span>{formatPrice(priceBreakdown.basePricePence)}</span>
          </div>
          {priceBreakdown.materialsPricePence > 0 && (
            <div className="flex justify-between">
              <span>Materials:</span>
              <span>{formatPrice(priceBreakdown.materialsPricePence)}</span>
            </div>
          )}
          {priceBreakdown.travelPricePence > 0 && (
            <div className="flex justify-between">
              <span>Travel Fee:</span>
              <span>{formatPrice(priceBreakdown.travelPricePence)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Booking Fee (10%):</span>
            <span>{formatPrice(priceBreakdown.platformFeePence)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total:</span>
            <span>{formatPrice(priceBreakdown.totalPence)}</span>
          </div>
        </div>
      </Card>

      <PaymentElement />

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatPrice(priceBreakdown.totalPence)}`
          )}
        </Button>
      </div>
    </form>
  );
}

export function PaymentCheckout(props: PaymentCheckoutProps) {
  const options = {
    clientSecret: props.clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="max-w-md mx-auto">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          priceBreakdown={props.priceBreakdown}
          onSuccess={props.onSuccess}
          onCancel={props.onCancel}
        />
      </Elements>
    </div>
  );
}
