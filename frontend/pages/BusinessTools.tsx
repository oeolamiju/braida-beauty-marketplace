import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, TrendingUp, DollarSign, Users, BarChart, Shield, 
  MessageSquare, Star, Clock, CreditCard, Target, Award 
} from "lucide-react";

const TOOLS = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automated calendar management with intelligent booking slots and availability sync",
    color: "text-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Track bookings, revenue, and customer trends with real-time insights",
    color: "text-green-500",
  },
  {
    icon: DollarSign,
    title: "Flexible Pricing",
    description: "Set dynamic pricing, packages, and seasonal rates to maximize earnings",
    color: "text-orange-500",
  },
  {
    icon: Users,
    title: "Client Management",
    description: "Build lasting relationships with client profiles, history, and preferences",
    color: "text-purple-500",
  },
  {
    icon: MessageSquare,
    title: "Direct Messaging",
    description: "Communicate securely with clients before, during, and after bookings",
    color: "text-pink-500",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "Get paid on time with escrow protection and automated payouts",
    color: "text-red-500",
  },
  {
    icon: Star,
    title: "Reviews & Ratings",
    description: "Build your reputation with verified customer reviews and testimonials",
    color: "text-yellow-500",
  },
  {
    icon: BarChart,
    title: "Performance Metrics",
    description: "Monitor key metrics like booking rate, average revenue, and client retention",
    color: "text-indigo-500",
  },
  {
    icon: Target,
    title: "Marketing Tools",
    description: "Promote your services with featured listings, discounts, and social sharing",
    color: "text-cyan-500",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description: "Log service duration and optimize your schedule for maximum efficiency",
    color: "text-teal-500",
  },
  {
    icon: CreditCard,
    title: "Invoice Generator",
    description: "Create professional invoices and receipts automatically for every booking",
    color: "text-lime-500",
  },
  {
    icon: Award,
    title: "Loyalty Programs",
    description: "Reward repeat clients with points, discounts, and exclusive perks",
    color: "text-amber-500",
  },
];

export default function BusinessTools() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Business Tools for Pros</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to run and grow your beauty business. From scheduling to payments,
            we've got you covered with professional-grade tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Card key={tool.title} className="hover:shadow-lg transition-shadow border-2">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <Icon className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to grow your business?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of beauty professionals already using Braida to manage their bookings and grow their revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-orange-600 hover:bg-gray-100">
              <Link to="/auth/register/freelancer">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
