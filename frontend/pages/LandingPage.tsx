import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, MapPin, Star, ChevronLeft, ChevronRight, 
  ShieldCheck, CreditCard, MessageSquare, Menu, X, Sparkles
} from "lucide-react";
import { MapPin as MapPinIcon } from "lucide-react";

const CATEGORIES = [
  { 
    name: "Box Braids", 
    slug: "box-braids",
    image: "https://images.unsplash.com/photo-1763256377422-fec144edeefc?w=200&h=200&fit=crop&crop=faces"
  },
  { 
    name: "Cornrows", 
    slug: "cornrows",
    image: "https://images.unsplash.com/photo-1594254773847-9fce26e950bc?w=200&h=200&fit=crop&crop=faces"
  },
  { 
    name: "Natural Hair", 
    slug: "natural-hair",
    image: "https://images.unsplash.com/photo-1588527962980-72746d95973e?w=200&h=200&fit=crop&crop=faces"
  },
  { 
    name: "Weaves & Wigs", 
    slug: "weaves",
    image: "https://images.unsplash.com/photo-1511929825537-516974a253df?w=200&h=200&fit=crop&crop=faces"
  },
  { 
    name: "Locs", 
    slug: "locs",
    image: "https://images.unsplash.com/photo-1711637819201-1f2671641b4e?w=200&h=200&fit=crop&crop=faces"
  },
  { 
    name: "Barbers", 
    slug: "barbering",
    image: "https://images.unsplash.com/photo-1633990700440-30a1f452a95b?w=200&h=200&fit=crop&crop=faces"
  },
];

const TRENDING_STYLES = [
  {
    id: 1,
    name: "Goddess Braids",
    bookings: "1,204 bookings this week",
    trending: true,
    large: true,
    image: "https://images.unsplash.com/photo-1763256377422-fec144edeefc?w=600&h=800&fit=crop"
  },
  {
    id: 2,
    name: "Skin Fade",
    image: "https://images.unsplash.com/photo-1633990700440-30a1f452a95b?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    name: "Silk Press",
    image: "https://images.unsplash.com/photo-1588527962980-72746d95973e?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    name: "Kids Braids",
    subtitle: "Gentle styling for little ones",
    image: "https://images.unsplash.com/photo-1648010035195-6b0a56e14667?w=600&h=300&fit=crop"
  },
];

const TOP_PROS = [
  {
    id: "1",
    name: "Sarah's Braids",
    specialty: "Braids • Faux Locs",
    location: "Brixton, London",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1763256377422-fec144edeefc?w=300&h=400&fit=crop&crop=faces"
  },
  {
    id: "2",
    name: "Natural Glow",
    specialty: "Natural Hair • Treatments",
    location: "Hackney, London",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1596472946996-3152ea4592b1?w=300&h=400&fit=crop&crop=faces"
  },
  {
    id: "3",
    name: "King's Cuts",
    specialty: "Barber • Grooming",
    location: "Manchester",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=300&h=400&fit=crop&crop=faces"
  },
  {
    id: "4",
    name: "Luxe Units",
    specialty: "Wigs • Custom Color",
    location: "Birmingham",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1615453261246-4b32e335a4a0?w=300&h=400&fit=crop&crop=faces"
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { settings } = usePlatformSettings();
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [proScrollPosition, setProScrollPosition] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("authToken");

    if (userStr && token) {
      const userData = JSON.parse(userStr);
      if (userData.role === "CLIENT") {
        navigate("/client/discover");
      } else if (userData.role === "FREELANCER") {
        navigate("/freelancer/dashboard");
      } else if (userData.role === "ADMIN") {
        navigate("/admin/dashboard");
      }
    }
  }, [navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (service) params.set("keyword", service);
    if (location) params.set("location", location);
    navigate(`/discover?${params.toString()}`);
  };

  const scrollPros = (direction: "left" | "right") => {
    const container = document.getElementById("pros-container");
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-gray-900">Braida</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/discover" className="text-sm text-gray-700 hover:text-orange-500 transition-colors">
                Find a Stylist
              </Link>
              <Link to="/auth/register/freelancer" className="text-sm text-gray-700 hover:text-orange-500 transition-colors">
                Become a Pro
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="hidden md:inline-flex text-sm">
                <Link to="/auth/login">Log In</Link>
              </Button>
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 text-sm">
                <Link to="/auth/register/client">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16">
        <div className="relative bg-gradient-to-br from-[#8B6F47] via-[#7A5C3E] to-[#6B4E35] overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[550px] py-12 lg:py-0">
              {/* Left Content */}
              <div className="space-y-8 z-10">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                  Beauty that understands
                  <br />
                  <span className="italic font-serif">your roots.</span>
                </h1>
                <p className="text-lg text-white/90 max-w-lg">
                  Find and book trusted Afro & Caribbean beauty
                  <br />
                  professionals near you. Verified, secure, and made for you.
                </p>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="bg-white rounded-full p-2 shadow-xl flex items-center gap-2 max-w-2xl">
                  <div className="flex-1 flex items-center gap-3 pl-4">
                    <Search className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wide block font-medium">Service</label>
                      <Input
                        type="text"
                        placeholder="Hairstyles, locs, braids..."
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="border-0 p-0 h-6 text-sm focus-visible:ring-0 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="w-px h-10 bg-gray-200" />
                  <div className="flex-1 flex items-center gap-3 pl-4">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 uppercase tracking-wide block font-medium">Location</label>
                      <Input
                        type="text"
                        placeholder="Postcode or City"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border-0 p-0 h-6 text-sm focus-visible:ring-0 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 h-12 font-medium">
                    Search
                  </Button>
                </form>

                {/* Popular Searches */}
                <div className="flex items-center gap-3 text-sm text-white/80">
                  <span>Popular:</span>
                  <Link to="/discover?keyword=knotless-braids" className="hover:text-white underline underline-offset-2">
                    Knotless Braids
                  </Link>
                  <span>•</span>
                  <Link to="/discover?keyword=starter-locs" className="hover:text-white underline underline-offset-2">
                    Starter Locs
                  </Link>
                  <span>•</span>
                  <Link to="/discover?keyword=weaves" className="hover:text-white underline underline-offset-2">
                    Weaves
                  </Link>
                </div>
              </div>

              {/* Right - Illustration */}
              <div className="hidden lg:flex justify-center items-center relative">
                <div className="relative w-[450px] h-[500px]">
                  <img
                    src="https://images.unsplash.com/photo-1763256377422-fec144edeefc?w=450&h=550&fit=crop&crop=faces"
                    alt="Woman with beautiful braids"
                    className="w-full h-full object-cover object-top"
                    style={{ 
                      clipPath: "ellipse(50% 60% at 50% 40%)",
                      filter: "brightness(1.1) contrast(1.05)"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-gray-900">Browse by Category</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 md:gap-10">
            {CATEGORIES.map((category) => (
              <Link 
                key={category.slug}
                to={`/discover?category=${category.slug}`}
                className="flex flex-col items-center gap-3 group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-gray-200 group-hover:border-orange-500 transition-all shadow-sm">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-center text-gray-700 group-hover:text-orange-500 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Styles */}
      <section className="py-16 px-4 bg-[#fafafa]">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Trending Styles</h2>
            <Link to="/styles" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large Featured Card */}
            <div 
              className="md:row-span-2 relative rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              onClick={() => navigate(`/styles/${TRENDING_STYLES[0].id}`)}
            >
              <img
                src={TRENDING_STYLES[0].image}
                alt={TRENDING_STYLES[0].name}
                className="w-full h-full min-h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                  #1 Trending
                </span>
                <h3 className="text-2xl font-bold mb-1">{TRENDING_STYLES[0].name}</h3>
                <p className="text-sm text-white/90">{TRENDING_STYLES[0].bookings}</p>
              </div>
            </div>

            {/* Skin Fade */}
            <div 
              className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow bg-gray-800"
              onClick={() => navigate(`/styles/${TRENDING_STYLES[1].id}`)}
            >
              <img
                src={TRENDING_STYLES[1].image}
                alt={TRENDING_STYLES[1].name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <h3 className="text-xl font-bold">{TRENDING_STYLES[1].name}</h3>
              </div>
            </div>

            {/* Silk Press */}
            <div 
              className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow"
              onClick={() => navigate(`/styles/${TRENDING_STYLES[2].id}`)}
            >
              <img
                src={TRENDING_STYLES[2].image}
                alt={TRENDING_STYLES[2].name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <h3 className="text-xl font-bold">{TRENDING_STYLES[2].name}</h3>
              </div>
            </div>

            {/* Kids Braids */}
            <div 
              className="md:col-span-2 relative rounded-3xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-shadow bg-[#f5d5c8]"
              onClick={() => navigate(`/styles/${TRENDING_STYLES[3].id}`)}
            >
              <img
                src={TRENDING_STYLES[3].image}
                alt={TRENDING_STYLES[3].name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 text-white">
                <h3 className="text-xl font-bold">{TRENDING_STYLES[3].name}</h3>
                <p className="text-sm text-white/90 mt-1">{TRENDING_STYLES[3].subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Pros */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Top Rated Pros</h2>
              <p className="text-gray-500 text-sm mt-1">Book the best talent in your community</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-300"
                onClick={() => scrollPros("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-gray-300"
                onClick={() => scrollPros("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            id="pros-container"
            className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory mt-6"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {TOP_PROS.map((pro) => (
              <Card 
                key={pro.id}
                className="min-w-[260px] md:min-w-[280px] snap-start border-0 shadow-md hover:shadow-xl transition-all bg-white overflow-hidden cursor-pointer rounded-2xl"
                onClick={() => navigate(`/freelancers/${pro.id}`)}
              >
                <div className="relative aspect-[3/4]">
                  <img 
                    src={pro.image}
                    alt={pro.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                    <span className="text-xs font-bold text-gray-900">{pro.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                          <img src={pro.image} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-gray-900 truncate">{pro.name}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-orange-500 font-medium mb-2">{pro.specialty}</p>
                  <div className="flex items-center gap-1.5 text-gray-600 text-sm mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{pro.location}</span>
                  </div>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-full font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/freelancers/${pro.id}`);
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-4 bg-[#fafafa]">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Verified Pros</h3>
              <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
                We vet every stylist and salon to ensure they meet our standards of professionalism.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Secure Payments</h3>
              <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
                Book with confidence. Your payments are held securely until your appointment is complete.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Real Reviews</h3>
              <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
                Make informed choices with honest reviews and photos from our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-10 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="h-5 w-5 text-orange-500" />
                <span className="font-bold text-xl text-gray-900">Braida</span>
              </div>
              <p className="text-sm text-gray-600 mb-6 max-w-sm leading-relaxed">
                The trusted marketplace for Afro & Caribbean beauty. Connecting you with the best talent in your area.
              </p>
              <div className="flex gap-3">
                <SocialMediaLinks />
              </div>
            </div>

            {/* Discover */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Discover</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/discover" className="text-gray-600 hover:text-orange-500 transition-colors">Find Stylists</Link></li>
                <li><Link to="/styles" className="text-gray-600 hover:text-orange-500 transition-colors">Browse Styles</Link></li>
                <li><Link to="/shop" className="text-gray-600 hover:text-orange-500 transition-colors">Gift Cards</Link></li>
                <li><Link to="/about" className="text-gray-600 hover:text-orange-500 transition-colors">Cities</Link></li>
              </ul>
            </div>

            {/* For Pros */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900">For Pros</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/auth/register/freelancer" className="text-gray-600 hover:text-orange-500 transition-colors">Become a Pro</Link></li>
                <li><Link to="/business-tools" className="text-gray-600 hover:text-orange-500 transition-colors">Business Tools</Link></li>
                <li><Link to="/success-stories" className="text-gray-600 hover:text-orange-500 transition-colors">Success Stories</Link></li>
                <li><Link to="/community" className="text-gray-600 hover:text-orange-500 transition-colors">Community</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/help" className="text-gray-600 hover:text-orange-500 transition-colors">Help Center</Link></li>
                <li><Link to="/safety" className="text-gray-600 hover:text-orange-500 transition-colors">Safety</Link></li>
                <li><Link to="/terms" className="text-gray-600 hover:text-orange-500 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-600 hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © 2025 Braida. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-orange-500 transition-colors">Privacy</Link>
              <Link to="/terms" className="text-gray-600 hover:text-orange-500 transition-colors">Terms</Link>
              <Link to="#" className="text-gray-600 hover:text-orange-500 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
