import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp, Users, Award } from "lucide-react";

const STORIES = [
  {
    name: "Amara's Braids Studio",
    location: "London, UK",
    specialty: "Box Braids & Cornrows",
    image: "https://images.unsplash.com/photo-1763256377422-fec144edeefc?w=400&h=400&fit=crop&crop=faces",
    revenue: "£8,500/month",
    bookings: "120+ monthly bookings",
    rating: 4.9,
    quote: "Braida transformed my side hustle into a full-time business. The scheduling tools and secure payments mean I can focus on what I love - creating beautiful styles.",
  },
  {
    name: "Marcus King's Cuts",
    location: "Manchester, UK",
    specialty: "Barber & Men's Grooming",
    image: "https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=400&h=400&fit=crop&crop=faces",
    revenue: "£6,200/month",
    bookings: "90+ monthly bookings",
    rating: 5.0,
    quote: "The platform's client management features helped me build a loyal customer base. My repeat booking rate has increased by 60% since joining.",
  },
  {
    name: "Natural Glow by Lisa",
    location: "Birmingham, UK",
    specialty: "Natural Hair & Treatments",
    image: "https://images.unsplash.com/photo-1596472946996-3152ea4592b1?w=400&h=400&fit=crop&crop=faces",
    revenue: "£5,800/month",
    bookings: "75+ monthly bookings",
    rating: 4.8,
    quote: "I love that Braida understands our community's needs. The verification process builds trust, and clients know they're booking with a professional.",
  },
  {
    name: "Divine Locs Studio",
    location: "Leeds, UK",
    specialty: "Locs & Maintenance",
    image: "https://images.unsplash.com/photo-1711637819201-1f2671641b4e?w=400&h=400&fit=crop&crop=faces",
    revenue: "£7,100/month",
    bookings: "85+ monthly bookings",
    rating: 5.0,
    quote: "Starting my locs journey business seemed daunting, but Braida made it easy. From setting up my profile to getting my first booking in just 2 days!",
  },
];

const STATS = [
  { icon: TrendingUp, label: "Average Revenue Increase", value: "185%" },
  { icon: Users, label: "Active Professionals", value: "5,000+" },
  { icon: Award, label: "Success Stories", value: "2,500+" },
  { icon: Star, label: "Average Pro Rating", value: "4.9" },
];

export default function SuccessStories() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Success Stories</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real professionals, real results. See how beauty pros across the UK are building thriving
            businesses with Braida.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="text-center border-2">
                <CardContent className="p-6">
                  <Icon className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="space-y-8 mb-16">
          {STORIES.map((story, index) => (
            <Card key={story.name} className="overflow-hidden border-2">
              <CardContent className="p-0">
                <div className={`grid md:grid-cols-2 gap-0 ${index % 2 === 1 ? "md:grid-flow-dense" : ""}`}>
                  <div className={`${index % 2 === 1 ? "md:col-start-2" : ""}`}>
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-full h-full object-cover min-h-[400px]"
                    />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full">
                        <Star className="h-4 w-4 fill-orange-500 text-orange-500" />
                        <span className="text-sm font-bold">{story.rating}</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{story.name}</h3>
                    <p className="text-orange-600 font-medium mb-1">{story.specialty}</p>
                    <p className="text-sm text-muted-foreground mb-6">{story.location}</p>
                    <p className="text-lg italic mb-6 text-gray-700">"{story.quote}"</p>
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{story.revenue}</div>
                        <div className="text-xs text-muted-foreground">Monthly Revenue</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{story.bookings}</div>
                        <div className="text-xs text-muted-foreground">Monthly Bookings</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start your success story today</h2>
          <p className="text-lg mb-8 opacity-90">
            Join the community of professionals who are growing their businesses with Braida.
          </p>
          <Button size="lg" asChild className="bg-white text-orange-600 hover:bg-gray-100">
            <Link to="/auth/register/freelancer">Become a Pro</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
