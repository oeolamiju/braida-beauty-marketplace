import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Heart, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CareersPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Careers at Braida</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-12">
          <section className="text-center">
            <h2 className="text-4xl font-bold mb-4">Join Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us build the future of beauty services. We're looking for passionate individuals 
              who want to make a difference in connecting talented professionals with clients who value their craft.
            </p>
          </section>

          <section className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Purpose-Driven Work</h3>
                  <p className="text-muted-foreground">
                    Make a real impact by empowering beauty professionals and helping clients 
                    discover exceptional services.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Growth Opportunities</h3>
                  <p className="text-muted-foreground">
                    Join a fast-growing startup where you'll learn, grow, and take on new 
                    challenges every day.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Collaborative Culture</h3>
                  <p className="text-muted-foreground">
                    Work with a diverse, talented team that values creativity, innovation, 
                    and mutual support.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Flexible Work</h3>
                  <p className="text-muted-foreground">
                    We support remote work and flexible schedules to help you maintain 
                    work-life balance.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6 text-center">Open Positions</h2>
            <div className="space-y-4">
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Full Stack Engineer</h3>
                    <p className="text-muted-foreground mb-2">Engineering · Full-time · Remote</p>
                    <p className="text-sm text-muted-foreground">
                      Build and scale our platform using TypeScript, React, and Encore.ts. 
                      Work on features that directly impact thousands of users.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Product Designer</h3>
                    <p className="text-muted-foreground mb-2">Design · Full-time · Remote</p>
                    <p className="text-sm text-muted-foreground">
                      Create beautiful, intuitive experiences for both clients and professionals. 
                      Shape the future of our product.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Community Manager</h3>
                    <p className="text-muted-foreground mb-2">Operations · Full-time · Hybrid</p>
                    <p className="text-sm text-muted-foreground">
                      Build and nurture relationships with our community of beauty professionals 
                      and clients. Drive engagement and growth.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Don't See Your Role?</h2>
            <p className="text-muted-foreground mb-6">
              We're always looking for talented people. Send us your CV and tell us how you'd like to contribute.
            </p>
            <Button onClick={() => navigate("/contact")}>
              Get in Touch
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
