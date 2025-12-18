import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-3" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="text-right">
          <Skeleton className="h-7 w-20 mb-1" />
          <Skeleton className="h-5 w-5 ml-auto" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5" />
            <div className="flex-1">
              <Skeleton className="h-3 w-12 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
