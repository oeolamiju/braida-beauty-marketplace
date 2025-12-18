import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRowClick?: (item: T) => void;
  loading?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  total,
  page,
  pageSize,
  onPageChange,
  onRowClick,
  loading = false,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`text-left px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium ${column.className || ""}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-6 md:py-8 text-sm text-muted-foreground">
                    Loading...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-6 md:py-8 text-sm text-muted-foreground">
                    No data found
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={index}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b last:border-0 ${onRowClick ? "cursor-pointer hover:bg-muted/30" : ""}`}
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={`px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm ${column.className || ""}`}>
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="border-t px-3 md:px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs md:text-sm text-muted-foreground order-2 sm:order-1">
            <span className="hidden sm:inline">Showing {startIndex} to {endIndex} of {total} results</span>
            <span className="sm:hidden">{startIndex}-{endIndex} of {total}</span>
          </p>
          <div className="flex gap-1 md:gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="px-2 md:px-3"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className="min-w-[2rem] md:min-w-[2.5rem] px-2 md:px-3 text-xs md:text-sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="px-2 md:px-3"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
