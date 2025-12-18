import { useState, useEffect, useRef } from "react";
import { Search, X, User, Calendar, Scissors, Palette } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import backend from "@/lib/backend";

interface SearchResult {
  type: "service" | "freelancer" | "style" | "booking";
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

interface GlobalSearchProps {
  role?: "client" | "freelancer" | "admin";
}

export default function GlobalSearch({ role }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      const allResults: SearchResult[] = [];

      try {
        if (role === "client" || !role) {
          const [services, freelancers, styles] = await Promise.allSettled([
            backend.search.search({ limit: 3 }),
            backend.freelancers.list(),
            backend.styles.listAll(),
          ]);

          if (services.status === "fulfilled") {
            services.value.results
              .filter((s) =>
                s.title.toLowerCase().includes(query.toLowerCase())
              )
              .forEach((s) => {
                allResults.push({
                  type: "service",
                  id: String(s.id),
                  title: s.title,
                  subtitle: s.freelancerName,
                  url: role ? `/client/services/${s.id}` : `/services/${s.id}`,
                });
              });
          }

          if (freelancers.status === "fulfilled") {
            freelancers.value.freelancers
              .filter((f) =>
                f.displayName?.toLowerCase().includes(query.toLowerCase())
              )
              .forEach((f) => {
                allResults.push({
                  type: "freelancer",
                  id: f.userId,
                  title: f.displayName,
                  subtitle: f.bio?.substring(0, 60) || undefined,
                  url: role ? `/client/freelancers/${f.userId}` : `/freelancers/${f.userId}`,
                });
              });
          }

          if (styles.status === "fulfilled") {
            styles.value.styles
              .filter((s) =>
                s.name.toLowerCase().includes(query.toLowerCase())
              )
              .forEach((s) => {
                allResults.push({
                  type: "style",
                  id: String(s.id),
                  title: s.name,
                  subtitle: s.description?.substring(0, 60) || undefined,
                  url: role ? `/client/styles/${s.id}` : `/styles/${s.id}`,
                });
              });
          }
        }

        if (role === "freelancer") {
          const [bookings, services] = await Promise.allSettled([
            backend.bookings.list({ limit: 5, role: "freelancer" }),
            backend.services.list({}),
          ]);

          if (bookings.status === "fulfilled") {
            bookings.value.bookings
              .filter((b) =>
                b.otherPartyName?.toLowerCase().includes(query.toLowerCase()) ||
                b.serviceTitle?.toLowerCase().includes(query.toLowerCase())
              )
              .forEach((b) => {
                allResults.push({
                  type: "booking",
                  id: String(b.id),
                  title: `Booking with ${b.otherPartyName}`,
                  subtitle: b.serviceTitle,
                  url: `/freelancer/bookings/${b.id}`,
                });
              });
          }

          if (services.status === "fulfilled") {
            services.value.services
              .filter((s) =>
                s.title.toLowerCase().includes(query.toLowerCase())
              )
              .forEach((s) => {
                allResults.push({
                  type: "service",
                  id: String(s.id),
                  title: s.title,
                  subtitle: `${s.durationMinutes} min · $${(s.basePricePence / 100).toFixed(2)}`,
                  url: `/freelancer/services/${s.id}/edit`,
                });
              });
          }
        }

        if (role === "admin") {
          const [bookings, users, services] = await Promise.allSettled([
            backend.admin.listBookings({ limit: 5 }),
            backend.admin.listUsers({ limit: 5 }),
            backend.admin.listServices({ limit: 5 }),
          ]);

          if (bookings.status === "fulfilled") {
            bookings.value.bookings
              .filter((b) =>
                b.clientName?.toLowerCase().includes(query.toLowerCase()) ||
                b.freelancerName?.toLowerCase().includes(query.toLowerCase()) ||
                b.serviceTitle?.toLowerCase().includes(query.toLowerCase())
              )
              .forEach((b) => {
                allResults.push({
                  type: "booking",
                  id: String(b.id),
                  title: `Booking #${b.id.toString().substring(0, 8)}`,
                  subtitle: `${b.clientName} → ${b.freelancerName}`,
                  url: `/admin/bookings/${b.id}`,
                });
              });
          }

          if (users.status === "fulfilled") {
            users.value.users
              .filter((u) =>
                u.fullName?.toLowerCase().includes(query.toLowerCase()) ||
                u.email.toLowerCase().includes(query.toLowerCase())
              )
              .forEach((u) => {
                allResults.push({
                  type: "freelancer",
                  id: u.id,
                  title: u.fullName || u.email,
                  subtitle: `${u.role} · ${u.email}`,
                  url: `/admin/users/${u.id}`,
                });
              });
          }

          if (services.status === "fulfilled") {
            services.value.services
              .filter((s) =>
                s.title.toLowerCase().includes(query.toLowerCase())
              )
              .forEach((s) => {
                allResults.push({
                  type: "service",
                  id: String(s.id),
                  title: s.title,
                  subtitle: s.freelancerName,
                  url: `/admin/listings`,
                });
              });
          }
        }

        setResults(allResults.slice(0, 8));
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query, role]);

  const handleSelect = (url: string) => {
    navigate(url);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "service":
        return <Scissors className="h-4 w-4" />;
      case "freelancer":
        return <User className="h-4 w-4" />;
      case "style":
        return <Palette className="h-4 w-4" />;
      case "booking":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-orange-100"
      >
        <Search className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      {isOpen && (
        <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-12 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search services, freelancers, styles..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && (
              <div className="p-4 text-center text-sm text-gray-500">
                Searching...
              </div>
            )}

            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No results found
              </div>
            )}

            {!loading && query.trim().length < 2 && (
              <div className="p-4 text-center text-sm text-gray-500">
                Type at least 2 characters to search
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="py-2">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.url)}
                    className="w-full px-4 py-3 hover:bg-gray-50 text-left flex items-start gap-3 transition-colors"
                  >
                    <div className="mt-0.5 text-gray-400">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-900 truncate">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-gray-500 truncate">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {result.type}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
