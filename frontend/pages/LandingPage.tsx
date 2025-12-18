import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Users, Calendar, Shield, Star, TrendingUp, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import TopNav from "@/components/navigation/TopNav";
import SocialLinks from "@/components/SocialLinks";
import { BraidaLogoLight, BRAND_COLORS } from "@/components/BraidaLogo";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-background">
      <TopNav />

      <section className="relative pt-20 md:pt-32 pb-12 md:pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/80 via-amber-50/40 to-background -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(233,30,99,0.06),transparent_50%)] -z-10" />
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E91E63]/10 to-[#F4B942]/10 border border-pink-200 text-[#E91E63] rounded-full text-sm font-semibold backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                Trusted by 1000+ Stylists
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
                Find & Book the Best
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] via-[#F4B942] to-[#1ABC9C]">
                  Afro & Caribbean
                </span>
                <br />
                Stylists in the UK
              </h1>
              <p className="text-base md:text-xl text-gray-600 max-w-lg leading-relaxed">
                Discover trusted beauty professionals for braids, locs, weaves, and natural hair care across London, Birmingham, and beyond.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Button size="lg" asChild className="text-base md:text-lg px-6 md:px-8 bg-gradient-to-r from-[#E91E63] to-[#F4B942] hover:from-[#C2185B] hover:to-[#D4A03A]">
                  <Link to="/auth/register/client">
                    Book a Stylist
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base md:text-lg px-6 md:px-8 border-2">
                  <Link to="/auth/register/freelancer">For Professionals</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-2 md:pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  <span className="text-xs md:text-sm">Verified Stylists</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  <span className="text-xs md:text-sm">Secure Booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  <span className="text-xs md:text-sm">Top Rated</span>
                </div>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080" 
                  alt="Woman getting hair braided"
                  className="w-full h-full object-cover"
                  data-unsplash-id="tS4DRCx3Sfw"
                  data-unsplash-author="Patrick Marah"
                  data-unsplash-query="african woman braids hairstyle salon"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-2xl shadow-2xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#E91E63] to-[#F4B942] rounded-xl flex items-center justify-center shadow-md">
                    <Star className="h-7 w-7 text-white fill-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xl">4.9 Rating</div>
                    <div className="text-sm text-muted-foreground">1200+ reviews</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-2">Featured Stylists</h2>
              <p className="text-sm md:text-base text-muted-foreground">Top-rated professionals ready to serve you</p>
            </div>
            <Button variant="link" asChild className="hidden md:flex text-[#E91E63] hover:text-[#C2185B]">
              <Link to="/discover">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                {
                  id: "1",
                  name: "Amara Okafor",
                  specialty: "Braids & Locs",
                  rating: 4.9,
                  reviews: 127,
                  image: "https://images.unsplash.com/photo-1628682814461-c4461c974211?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
                  imageId: "jsnqiE1WF1s",
                  imageAuthor: "Ben Masora",
                  location: "South London",
                  price: "From £80"
                },
                {
                  id: "2",
                  name: "Zainab Hassan",
                  specialty: "Natural Hair Styling",
                  rating: 5.0,
                  reviews: 93,
                  image: "https://images.unsplash.com/photo-1650702970095-f5b8ebeebce5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
                  imageId: "yOCZRn_a7Sg",
                  imageAuthor: "Nestergrapher nedie",
                  location: "Birmingham",
                  price: "From £60"
                },
                {
                  id: "3",
                  name: "Chioma Adeyemi",
                  specialty: "Weaves & Extensions",
                  rating: 4.8,
                  reviews: 156,
                  image: "https://images.unsplash.com/photo-1712821125604-4ca6b1f86488?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
                  imageId: "eeAuwkNn63E",
                  imageAuthor: "Godfred Kwakye",
                  location: "East London",
                  price: "From £120"
                },
                {
                  id: "4",
                  name: "Fatima Mensah",
                  specialty: "Knotless Braids",
                  rating: 4.9,
                  reviews: 84,
                  image: "https://images.unsplash.com/photo-1669428254009-5388fe93b9b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
                  imageId: "FQcwVfbjXfo",
                  imageAuthor: "Ibrahima Toure",
                  location: "Manchester",
                  price: "From £90"
                },
                {
                  id: "5",
                  name: "Keisha Williams",
                  specialty: "Gele & Makeup",
                  rating: 5.0,
                  reviews: 112,
                  image: "https://images.unsplash.com/photo-1645736353780-e70a7d508088?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
                  imageId: "eXclz2FOr0M",
                  imageAuthor: "Dellon Thomas",
                  location: "West London",
                  price: "From £70"
                },
                {
                  id: "6",
                  name: "Aisha Ibrahim",
                  specialty: "Loc Maintenance",
                  rating: 4.8,
                  reviews: 67,
                  image: "https://images.unsplash.com/photo-1631346543932-ce110c10dbec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
                  imageId: "J1Umi-cHllE",
                  imageAuthor: "Arnold Obizzy",
                  location: "Leeds",
                  price: "From £55"
                },
                {
                  id: "7",
                  name: "Naomi Campbell",
                  specialty: "Nails & Beauty",
                  rating: 4.9,
                  reviews: 98,
                  image: "https://images.unsplash.com/photo-1651848893794-310910ec1e01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=300",
                  imageId: "xw0P5PhNDAQ",
                  imageAuthor: "Nestergrapher nedie",
                  location: "Bristol",
                  price: "From £45"
                }
              ].map((stylist) => (
                <Link 
                  key={stylist.id} 
                  to={`/freelancer/${stylist.id}`}
                  className="min-w-[160px] sm:min-w-[200px] md:min-w-[240px] snap-start block"
                >
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-pink-300 hover:-translate-y-1 bg-white h-full">
                    <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                      <img 
                        src={stylist.image}
                        alt={stylist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        data-unsplash-id={stylist.imageId}
                        data-unsplash-author={stylist.imageAuthor}
                        data-unsplash-query="african woman hairstylist portrait professional"
                      />
                      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                        <Star className="h-3 w-3 fill-[#F4B942] text-[#F4B942]" />
                        <span className="font-bold text-xs">{stylist.rating}</span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div>
                        <h3 className="font-bold text-sm mb-0.5 line-clamp-1">{stylist.name}</h3>
                        <p className="text-xs text-[#E91E63] font-medium line-clamp-1">{stylist.specialty}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{stylist.location}</span>
                        <span className="font-semibold text-foreground">{stylist.price}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold mb-3 md:mb-4">How Braida Works</h2>
            <p className="text-sm md:text-lg text-muted-foreground">Simple, secure, and trusted by thousands</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 text-center space-y-4 md:space-y-6 border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-[#E91E63]" />
              </div>
              <div className="space-y-3">
                <div className="w-8 h-8 bg-[#E91E63] text-white rounded-full flex items-center justify-center mx-auto font-bold">1</div>
                <h3 className="text-xl font-bold">Browse & Discover</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Search through our verified freelancers and find the perfect stylist for your needs.
                </p>
              </div>
            </Card>
            <Card className="p-8 text-center space-y-6 border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-[#E91E63]" />
              </div>
              <div className="space-y-3">
                <div className="w-8 h-8 bg-[#E91E63] text-white rounded-full flex items-center justify-center mx-auto font-bold">2</div>
                <h3 className="text-xl font-bold">Book & Pay Securely</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Choose your date and time, then pay securely through our platform with payment protection.
                </p>
              </div>
            </Card>
            <Card className="p-8 text-center space-y-6 border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto">
                <Star className="h-8 w-8 text-[#E91E63]" />
              </div>
              <div className="space-y-3">
                <div className="w-8 h-8 bg-[#E91E63] text-white rounded-full flex items-center justify-center mx-auto font-bold">3</div>
                <h3 className="text-xl font-bold">Get Styled</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Enjoy your service and leave a review to help other clients discover great talent.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gradient-to-br from-pink-50/50 via-background to-amber-50/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-2">Browse by Category</h2>
              <p className="text-muted-foreground">Explore our most popular beauty services</p>
            </div>
            <Button variant="link" asChild className="hidden md:flex text-[#E91E63] hover:text-[#C2185B]">
              <Link to="/discover">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: "Braids", subtitle: "Knotless, Box & More", image: "https://images.unsplash.com/photo-1688592969417-953dd3c2b9d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", imageId: "0i7fbspgDaY", imageAuthor: "Icyn Kophy", query: "african braids hairstyle" },
              { name: "Locs", subtitle: "Install & Maintenance", image: "https://images.unsplash.com/photo-1625536658679-42d76fd167c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", imageId: "7Lb9KCfvA1w", imageAuthor: "Larry George II", query: "dreadlocks locs hairstyle" },
              { name: "Weaves", subtitle: "Sew-in & Quick Weave", image: "https://images.unsplash.com/photo-1586583226186-19fa230641a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", imageId: "TGw1QN76O7Q", imageAuthor: "Brian Lundquist", query: "black woman long weave hairstyle" },
              { name: "NaturalHair", subtitle: "Styling & Care", image: "https://images.unsplash.com/photo-1763742936992-cac96be031b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", imageId: "V_jW1n6Wzqs", imageAuthor: "Bjorn Pierre", query: "natural hair afro styling" },
              { name: "Barbering", subtitle: "Cuts & Line-ups", image: "https://images.unsplash.com/photo-1633990700440-30a1f452a95b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", imageId: "uXgClQfsplw", imageAuthor: "Steward Masweneng", query: "african barber haircut fade" },
              { name: "Nails", subtitle: "Manicure & Pedicure", image: "https://images.unsplash.com/photo-1655720360101-59ae4e315572?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", imageId: "DzMmp0uewcg", imageAuthor: "Iwaria Inc.", query: "african woman nails manicure" },
              { name: "Makeup", subtitle: "Bridal & Events", image: "https://images.unsplash.com/photo-1692094998669-062c639d3703?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", imageId: "oyGcI0h540U", imageAuthor: "Oluwagbenga Fashola", query: "african woman makeup beauty" },
              { name: "Gele", subtitle: "Traditional Tying", image: "https://images.unsplash.com/photo-1588080270689-73eead74fa18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", imageId: "QusSuWkMqes", imageAuthor: "Krystal Dixon", query: "gele african head wrap" },
            ].map((service, idx) => (
              <Card 
                key={service.name} 
                className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 hover:border-pink-300 hover:-translate-y-1 bg-white"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                    data-unsplash-id={service.imageId}
                    data-unsplash-author={service.imageAuthor}
                    data-unsplash-query={service.query}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                    <Button size="sm" className="w-full" variant="secondary">
                      Explore
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-center mb-1">{service.name}</h3>
                  <p className="text-xs text-muted-foreground text-center">{service.subtitle}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Why Choose Braida?</h2>
            <p className="text-lg text-muted-foreground">Trusted by clients and professionals across the UK</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center space-y-5">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">Vetted Professionals</h3>
              <p className="text-muted-foreground leading-relaxed">
                All stylists go through identity verification and quality checks for your peace of mind.
              </p>
            </div>
            <div className="text-center space-y-5">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">Secure Payments</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pay securely through the app. Funds are released when the job is done to your satisfaction.
              </p>
            </div>
            <div className="text-center space-y-5">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold">Real Reviews</h3>
              <p className="text-muted-foreground leading-relaxed">
                See honest feedback from the community to find the best professionals for your hair.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-br from-[#0D4F5F] via-[#1ABC9C] to-[#0D4F5F] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl md:text-6xl font-extrabold relative">Are you a Beauty Professional?</h2>
          <p className="text-xl md:text-2xl opacity-95 max-w-2xl mx-auto">
            Join the UK's fastest-growing community of Afro & Caribbean beauty experts. Grow your business, manage bookings, and get paid securely.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button size="lg" asChild className="text-lg px-10 bg-white text-[#E91E63] hover:bg-gray-100">
              <Link to="/auth/register/freelancer">
                List Your Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-10 border-2 border-white text-white hover:bg-white/10">
              <Link to="/discover">Learn More</Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-sm opacity-90">Active Stylists</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <div className="text-sm opacity-90">Bookings Made</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9★</div>
              <div className="text-sm opacity-90">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t py-16 px-4 bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="mb-4">
                <BraidaLogoLight size="md" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Connecting talented Afro & Caribbean beauty professionals with clients across the UK.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Discover</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/discover?category=braids" className="hover:text-[#E91E63] transition-colors">Braids</Link></li>
                <li><Link to="/discover?category=locs" className="hover:text-[#E91E63] transition-colors">Locs</Link></li>
                <li><Link to="/discover?category=weaves" className="hover:text-[#E91E63] transition-colors">Weaves</Link></li>
                <li><Link to="/discover?category=barbering" className="hover:text-[#E91E63] transition-colors">Barbering</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-[#E91E63] transition-colors">About</Link></li>
                <li><Link to="/careers" className="hover:text-[#E91E63] transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-[#E91E63] transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-[#E91E63] transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/help" className="hover:text-[#E91E63] transition-colors">Help Centre</Link></li>
                <li><Link to="/safety" className="hover:text-[#E91E63] transition-colors">Safety</Link></li>
                <li><Link to="/terms" className="hover:text-[#E91E63] transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-[#E91E63] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Braida. All rights reserved.
            </div>
            <SocialLinks />
          </div>
        </div>
      </footer>
    </div>
  );
}
