import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, MapPin, Star, ChevronLeft, ChevronRight, 
  ShieldCheck, CreditCard, MessageSquare, Instagram, Twitter, Menu, X, Facebook, Linkedin
} from "lucide-react";
import { BraidaLogoLight } from "@/components/BraidaLogo";

// Category data with placeholder images
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

// Trending styles data
const TRENDING_STYLES = [
  {
    id: "goddess-braids",
    name: "Goddess Braids",
    bookings: "1,204 bookings this week",
    trending: true,
    large: true,
    image: "https://images.unsplash.com/photo-1763256377422-fec144edeefc?w=600&h=800&fit=crop"
  },
  {
    id: "skin-fade",
    name: "Skin Fade",
    image: "https://images.unsplash.com/photo-1633990700440-30a1f452a95b?w=400&h=300&fit=crop"
  },
  {
    id: "silk-press",
    name: "Silk Press",
    image: "https://images.unsplash.com/photo-1588527962980-72746d95973e?w=400&h=300&fit=crop"
  },
  {
    id: "kids-braids",
    name: "Kids Braids",
    subtitle: "Gentle styling for little ones",
    image: "https://images.unsplash.com/photo-1648010035195-6b0a56e14667?w=600&h=300&fit=crop"
  },
];

// Top rated pros
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Link to="/" className="flex items-center">
                <BraidaLogoLight size="md" />
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/discover" className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
                Find a Stylist
              </Link>
              <Link to="/auth/register/freelancer" className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors">
                Become a Pro
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild className="hidden md:inline-flex">
                <Link to="/auth/login">Log In</Link>
              </Button>
              <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 hidden md:inline-flex">
                <Link to="/auth/register/client">Sign Up</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white shadow-lg">
              <div className="py-2">
                <Link 
                  to="/auth/login" 
                  className="block px-4 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link 
                  to="/auth/register/client" 
                  className="block px-4 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link 
                  to="/discover" 
                  className="block px-4 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Find a Stylist
                </Link>
                <Link 
                  to="/auth/register/freelancer" 
                  className="block px-4 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Become a Pro
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16">
        <div className="relative bg-gradient-to-br from-[#f5e6d3] via-[#e8d5c4] to-[#d4c4b0] overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[500px] py-12 lg:py-0">
              {/* Left Content */}
              <div className="space-y-6 z-10">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight text-gray-900">
                  Beauty that understands
                <br />
                  <span className="italic">your roots</span>.
              </h1>
                <p className="text-lg text-gray-700 max-w-md">
                  Find and book trusted Afro & Caribbean beauty
                  professionals near you. Verified, secure, and made for you.
                </p>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="bg-white rounded-full p-2 shadow-lg flex items-center gap-2 max-w-xl">
                  <div className="flex-1 flex items-center gap-3 pl-4">
                    <Search className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wide block">Service</label>
                      <Input
                        type="text"
                        placeholder="Box braids, Silk press..."
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
                      <label className="text-[10px] text-gray-400 uppercase tracking-wide block">Location</label>
                      <Input
                        type="text"
                        placeholder="Postcode or City"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="border-0 p-0 h-6 text-sm focus-visible:ring-0 placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 h-12">
                    Search
                  </Button>
                </form>

                {/* Popular Searches */}
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">Popular:</span>
                  <Link to="/discover?keyword=knotless" className="text-gray-700 hover:text-orange-500 underline underline-offset-2">
                    Knotless Braids
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link to="/discover?keyword=starter-locs" className="text-gray-700 hover:text-orange-500 underline underline-offset-2">
                    Starter Locs
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link to="/discover?keyword=weaves" className="text-gray-700 hover:text-orange-500 underline underline-offset-2">
                    Weaves
                  </Link>
                </div>
              </div>

              {/* Right - Illustration/Image */}
              <div className="hidden lg:flex justify-end items-end relative">
                <div className="relative">
                  {/* Background shape */}
                  <div className="absolute bottom-0 right-0 w-[400px] h-[500px] bg-gradient-to-t from-[#c9b8a6] to-transparent rounded-t-full opacity-50" />
                  {/* Illustration placeholder - using a styled div */}
                  <div className="relative z-10 w-[350px] h-[450px]">
                    <img
                      src="https://images.unsplash.com/photo-1763256377422-fec144edeefc?w=400&h=500&fit=crop&crop=faces"
                      alt="Woman with beautiful braids"
                      className="w-full h-full object-cover rounded-t-[200px] object-top"
                      style={{ filter: "sepia(20%) saturate(80%)" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="flex gap-6 md:gap-10 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((category) => (
                <Link 
                key={category.slug}
                to={`/discover?category=${category.slug}`}
                className="flex flex-col items-center gap-3 min-w-[80px] group"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-orange-500 transition-colors">
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
            <h2 className="text-2xl md:text-3xl font-bold">Trending Styles</h2>
            <Link to="/styles" className="text-orange-500 hover:text-orange-600 font-medium text-sm">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large Featured Card */}
            <div className="md:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src={TRENDING_STYLES[0].image}
                alt={TRENDING_STYLES[0].name}
                className="w-full h-full min-h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                  #1 Trending
                </span>
                <h3 className="text-2xl font-bold mb-1">{TRENDING_STYLES[0].name}</h3>
                <p className="text-sm text-white/80">{TRENDING_STYLES[0].bookings}</p>
              </div>
            </div>

            {/* Small Cards */}
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src={TRENDING_STYLES[1].image}
                alt={TRENDING_STYLES[1].name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h3 className="text-lg font-bold">{TRENDING_STYLES[1].name}</h3>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src={TRENDING_STYLES[2].image}
                alt={TRENDING_STYLES[2].name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundColor: "#f5d5c8" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h3 className="text-lg font-bold">{TRENDING_STYLES[2].name}</h3>
              </div>
              </div>

            {/* Wide Card */}
            <div className="md:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src={TRENDING_STYLES[3].image}
                alt={TRENDING_STYLES[3].name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <h3 className="text-lg font-bold">{TRENDING_STYLES[3].name}</h3>
                <p className="text-sm text-white/80">{TRENDING_STYLES[3].subtitle}</p>
              </div>
              </div>
          </div>
        </div>
      </section>

      {/* Top Rated Pros */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Top Rated Pros</h2>
              <p className="text-gray-500 text-sm">Book the best talent in your community</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => scrollPros("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
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
                className="min-w-[240px] md:min-w-[280px] snap-start border-0 shadow-sm hover:shadow-lg transition-shadow bg-white overflow-hidden"
              >
                <div className="relative aspect-[3/4]">
                  <img 
                    src={pro.image}
                    alt={pro.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                    <span className="text-xs font-bold">{pro.rating}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{pro.name}</h3>
                  <p className="text-sm text-orange-500 mb-2">{pro.specialty}</p>
                  <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
                    <MapPin className="h-3 w-3" />
                    <span>{pro.location}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-orange-200 text-orange-500 hover:bg-orange-50 hover:border-orange-300"
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
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg">Verified Pros</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                We vet every stylist and barber to ensure they meet our standards for skill and professionalism.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg">Secure Payments</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Book with confidence. Your payment is held securely until your appointment is complete.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-bold text-lg">Real Reviews</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Make informed choices with honest reviews and photos from our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            {/* Logo & Description */}
            <div className="md:col-span-2">
              <Link to="/" className="mb-4 inline-block">
                <BraidaLogoLight size="md" />
              </Link>
              <p className="text-sm text-gray-500 mb-4 max-w-xs">
                The trusted marketplace for Afro & Caribbean beauty. Connecting you with the best talent in your area.
              </p>
              <div className="flex gap-3">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Discover */}
            <div>
              <h4 className="font-bold mb-4">Discover</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/discover" className="hover:text-orange-500 transition-colors">Find Stylists</Link></li>
                <li><Link to="/styles" className="hover:text-orange-500 transition-colors">Browse Styles</Link></li>
              </ul>
            </div>

            {/* For Pros */}
            <div>
              <h4 className="font-bold mb-4">For Pros</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/auth/register/freelancer" className="hover:text-orange-500 transition-colors">Become a Pro</Link></li>
                <li><Link to="/business-tools" className="hover:text-orange-500 transition-colors">Business Tools</Link></li>
                <li><Link to="/success-stories" className="hover:text-orange-500 transition-colors">Success Stories</Link></li>
                <li><Link to="/community" className="hover:text-orange-500 transition-colors">Community</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link to="/help" className="hover:text-orange-500 transition-colors">Help Center</Link></li>
                <li><Link to="/safety" className="hover:text-orange-500 transition-colors">Safety</Link></li>
                <li><Link to="/terms" className="hover:text-orange-500 transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              © 2025 Braida. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link to="/privacy" className="hover:text-orange-500 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-orange-500 transition-colors">Terms</Link>
              <Link to="#" className="hover:text-orange-500 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
