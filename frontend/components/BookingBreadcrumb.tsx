import { ChevronRight, Check } from "lucide-react";

interface BookingBreadcrumbProps {
  currentStep: "service" | "datetime" | "payment";
}

const steps = [
  { id: "service", label: "Service Selection" },
  { id: "datetime", label: "Date & Time" },
  { id: "payment", label: "Payment" },
];

export function BookingBreadcrumb({ currentStep }: BookingBreadcrumbProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = step.id === currentStep;

        return (
          <div key={step.id} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <span
              className={`flex items-center gap-1.5 ${
                isCurrent
                  ? "text-orange-600 font-medium"
                  : isCompleted
                  ? "text-gray-600"
                  : "text-gray-400"
              }`}
            >
              {isCompleted && (
                <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </span>
              )}
              {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}

