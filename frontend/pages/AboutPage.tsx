import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Award, Heart, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">About Braida</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              Braida connects clients with talented beauty professionals specializing in African and 
              Afro-Caribbean hairstyles, makeup, and beauty services. We're building a platform where 
              skilled freelancers can showcase their expertise and clients can easily find and book 
              the perfect stylist for their needs.
            </p>
          </section>

          <Card className="p-6 bg-gradient-to-br from-orange-50 to-pink-50 border-orange-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-orange-500 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">AI-Powered Style Recommendations</h3>
                <p className="text-muted-foreground mb-4">
                  Our innovative AI technology analyzes your unique facial features, face shape, and skin tone 
                  to provide personalized hairstyle and makeup recommendations. Unlike generic style guides, 
                  our AI considers your individual beauty to suggest styles that will truly complement you.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500 mt-1" />
                    <p><strong>Smart Analysis:</strong> Upload your photo and receive instant analysis of your face shape, skin tone, and features</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500 mt-1" />
                    <p><strong>Personalized Matches:</strong> Get curated hairstyle recommendations with match scores based on your unique attributes</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-orange-500 mt-1" />
                    <p><strong>Makeup Guidance:</strong> Receive tailored makeup recommendations including shades and techniques for your skin tone</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <section className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">For Clients</h3>
                  <p className="text-muted-foreground">
                    Discover talented professionals, browse portfolios, read reviews, and book 
                    services with confidence. Our AI-powered recommendations help you find styles 
                    that perfectly suit your unique features.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">For Professionals</h3>
                  <p className="text-muted-foreground">
                    Grow your business, manage bookings, showcase your portfolio, and connect 
                    with clients who appreciate your unique skills.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Built with Care</h3>
                  <p className="text-muted-foreground">
                    Every feature is designed with both clients and professionals in mind, 
                    ensuring a seamless and trustworthy experience for all.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Community Focused</h3>
                  <p className="text-muted-foreground">
                    We're more than a booking platform—we're a community celebrating culture, 
                    artistry, and the beauty of diversity.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                <p className="text-muted-foreground">
                  We leverage cutting-edge AI technology to provide personalized style recommendations, 
                  making beauty discovery easier and more accurate than ever before.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Quality</h3>
                <p className="text-muted-foreground">
                  We verify our professionals and maintain high standards to ensure exceptional service.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Trust</h3>
                <p className="text-muted-foreground">
                  Secure payments, verified reviews, and transparent policies protect both clients and professionals.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Empowerment</h3>
                <p className="text-muted-foreground">
                  We provide the tools and platform for beauty professionals to build and grow successful businesses.
                </p>
              </div>
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Whether you're looking for the perfect stylist or wanting to grow your beauty business, 
              Braida is here to help you succeed.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate("/auth/register/client")}>
                Book a Service
              </Button>
              <Button variant="outline" onClick={() => navigate("/auth/register/freelancer")}>
                Become a Professional
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
