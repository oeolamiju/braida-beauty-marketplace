import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Skeleton className="h-10 w-48 mb-6" />
      
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <Skeleton className="h-8 w-3/4 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-24" />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Skeleton className="h-6 w-24 mb-3" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <Skeleton className="h-3 w-16 mb-1" />
                      <Skeleton className="h-4 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-accent/50">
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-2 w-2 rounded-full mt-2" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
