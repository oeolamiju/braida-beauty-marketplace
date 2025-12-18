import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TopNav from "@/components/navigation/TopNav";

export default function PrivacyPage() {
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

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly to us, including name, email address, phone number, and payment information when you create an account or make a booking.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to provide, maintain, and improve our services, process transactions, send notifications, and respond to your requests.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We share information with freelancers to facilitate bookings, with payment processors to complete transactions, and as required by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
            <p className="text-muted-foreground">
              We take reasonable measures to protect your information from unauthorized access, use, or disclosure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground">
              You have the right to access, update, or delete your personal information. You may also object to or restrict certain processing of your data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at privacy@braida.co.uk
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
