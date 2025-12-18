import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TopNav from "@/components/navigation/TopNav";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="container mx-auto max-w-4xl px-4 py-24">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Braida's platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-muted-foreground">
              Permission is granted to temporarily use Braida's services for personal, non-commercial transitory viewing only.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Booking and Payments</h2>
            <p className="text-muted-foreground">
              All bookings are subject to availability. Payment terms and cancellation policies will be clearly displayed before booking confirmation.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Freelancer Responsibilities</h2>
            <p className="text-muted-foreground">
              Freelancers are independent contractors. They are responsible for the quality of their services, maintaining necessary licenses, and paying applicable taxes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, please contact us at legal@braida.co.uk
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
