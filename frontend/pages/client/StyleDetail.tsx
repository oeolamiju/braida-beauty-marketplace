import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Palette } from "lucide-react";
import SearchFilters from "@/components/SearchFilters";
import SearchResultCard from "@/components/SearchResultCard";
import { useFilters } from "@/hooks/useFilters";
import { useStyleSearch } from "@/hooks/useStyleSearch";

export default function ClientStyleDetail() {
  const { styleId } = useParams<{ styleId: string }>();
  const navigate = useNavigate();
  const { filters, setFilters, buildSearchParams } = useFilters();
  const searchParams = buildSearchParams();
  const { style, results, loading, total, page, hasMore, loadMore } = useStyleSearch(
    styleId,
    searchParams,
    [filters]
  );

  if (loading && !style) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-64 w-full mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!style) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-12 text-center">
          <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Style Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The style you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/client/styles")}>
            Browse Styles
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/client/styles")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Styles
      </Button>

      <div className="mb-8">
        <Card className="overflow-hidden">
          <div className="md:flex">
            {style.referenceImageUrl && (
              <div className="md:w-1/3 aspect-[4/3] md:aspect-auto">
                <img
                  src={style.referenceImageUrl}
                  alt={style.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 md:flex-1">
              <h1 className="text-3xl font-bold mb-2">{style.name}</h1>
              {style.description && (
                <p className="text-muted-foreground">{style.description}</p>
              )}
              <div className="mt-4">
                <p className="text-sm font-medium">
                  {total} service{total !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <SearchFilters
          filters={filters}
          onChange={setFilters}
          hideAvailability={true}
        />
      </div>

      {loading && page === 1 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <Card className="p-12 text-center">
          <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Services Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more results.
          </p>
        </Card>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {results.map((result) => (
              <SearchResultCard
                key={result.id}
                result={result}
                onClick={() => navigate(`/client/services/${result.id}`)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="text-center">
              <Button onClick={loadMore} disabled={loading} variant="outline">
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
