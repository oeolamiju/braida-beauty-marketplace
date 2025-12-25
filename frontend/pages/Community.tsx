import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, Heart, MessageCircle, Calendar, Award, BookOpen, 
  Video, Sparkles, TrendingUp, Shield 
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Professional Network",
    description: "Connect with thousands of beauty professionals across the UK. Share tips, collaborate, and grow together.",
  },
  {
    icon: BookOpen,
    title: "Learning Resources",
    description: "Access tutorials, business guides, and industry insights to level up your skills and services.",
  },
  {
    icon: Video,
    title: "Live Workshops",
    description: "Join monthly virtual workshops on trending styles, business growth, and marketing strategies.",
  },
  {
    icon: MessageCircle,
    title: "Community Forum",
    description: "Ask questions, share experiences, and get advice from experienced professionals in your field.",
  },
  {
    icon: Award,
    title: "Recognition Program",
    description: "Get featured as a top professional, earn badges, and unlock exclusive opportunities.",
  },
  {
    icon: Calendar,
    title: "Industry Events",
    description: "Exclusive access to beauty events, trade shows, and networking meetups in your city.",
  },
];

const INITIATIVES = [
  {
    icon: Heart,
    title: "Mentorship Program",
    description: "New to the industry? Get paired with experienced professionals who can guide your journey.",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Sparkles,
    title: "Style Challenges",
    description: "Participate in monthly styling challenges, showcase your creativity, and win prizes.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: TrendingUp,
    title: "Business Growth",
    description: "Join our business accelerator program to scale your services and increase bookings.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Community guidelines and support to ensure a safe, respectful environment for all.",
    color: "bg-green-100 text-green-600",
  },
];

export default function Community() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Join Our Community</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            More than a platform – we're a thriving community of beauty professionals supporting,
            learning, and growing together.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow border-2">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Community Initiatives</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {INITIATIVES.map((initiative) => {
              const Icon = initiative.icon;
              return (
                <Card key={initiative.title} className="border-2">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-full ${initiative.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{initiative.title}</h3>
                    <p className="text-muted-foreground">{initiative.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center border-2">
            <CardContent className="p-8">
              <div className="text-4xl font-bold text-orange-600 mb-2">5,000+</div>
              <div className="text-sm text-muted-foreground">Active Professionals</div>
            </CardContent>
          </Card>
          <Card className="text-center border-2">
            <CardContent className="p-8">
              <div className="text-4xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Monthly Events</div>
            </CardContent>
          </Card>
          <Card className="text-center border-2">
            <CardContent className="p-8">
              <div className="text-4xl font-bold text-orange-600 mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Learning Resources</div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to join the community?</h2>
          <p className="text-lg mb-8 opacity-90">
            Connect with like-minded professionals, learn new skills, and grow your business with Braida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-orange-600 hover:bg-gray-100">
              <Link to="/auth/register/freelancer">Join as a Pro</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white text-white hover:bg-white/10">
              <Link to="/auth/register/client">Join as a Client</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
