import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SafetyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Safety & Trust</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-12">
          <section className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Your Safety is Our Priority</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've built multiple layers of protection to ensure safe, trustworthy experiences 
              for both clients and beauty professionals on Braida.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold">How We Keep You Safe</h3>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Professional Verification</h4>
                  <p className="text-muted-foreground">
                    All beauty professionals go through a thorough verification process. We check 
                    identity documents, qualifications, and work history to ensure you're connecting 
                    with legitimate, skilled professionals.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Secure Payments</h4>
                  <p className="text-muted-foreground">
                    All payments are processed through Stripe, a trusted payment platform used by 
                    millions worldwide. Your payment information is encrypted and never stored on 
                    our servers. Funds are held in escrow until services are completed.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Reviews & Transparency</h4>
                  <p className="text-muted-foreground">
                    Read verified reviews from real clients. Every review is tied to a completed 
                    booking, so you can trust the feedback. Professionals can't delete or hide 
                    negative reviews—everything stays transparent.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Report & Dispute System</h4>
                  <p className="text-muted-foreground">
                    If something goes wrong, you can report issues or file disputes directly through 
                    the platform. Our team reviews every case fairly and takes appropriate action, 
                    including refunds when warranted.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold">Safety Tips</h3>

            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-semibold mb-2">For Clients</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                  <li>Review portfolios and ratings before booking</li>
                  <li>Read cancellation policies carefully</li>
                  <li>Meet in public places or well-lit locations when possible</li>
                  <li>Keep communication and payments on the platform</li>
                  <li>Trust your instincts—if something feels off, cancel</li>
                  <li>Report any suspicious behavior immediately</li>
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-2">For Professionals</h4>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground text-sm">
                  <li>Verify booking details before accepting</li>
                  <li>Set clear boundaries and policies</li>
                  <li>Keep all communication on the platform</li>
                  <li>Don't share personal contact information prematurely</li>
                  <li>Document your work with photos (with client permission)</li>
                  <li>Report problematic clients or safety concerns</li>
                </ul>
              </Card>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold">Community Standards</h3>
            <Card className="p-6">
              <p className="text-muted-foreground mb-4">
                We expect all users to treat each other with respect and professionalism. 
                Behavior that violates our community standards may result in account suspension 
                or permanent removal from the platform.
              </p>
              <div className="space-y-2 text-sm">
                <p className="font-semibold">Prohibited behavior includes:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Harassment, discrimination, or hate speech</li>
                  <li>Fraudulent activity or scams</li>
                  <li>Sharing fake or misleading information</li>
                  <li>Requesting or conducting transactions off-platform</li>
                  <li>Violating privacy or sharing personal information without consent</li>
                </ul>
              </div>
            </Card>
          </section>

          <Card className="p-8 text-center bg-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Need to Report Something?</h3>
            <p className="text-muted-foreground mb-6">
              If you experience or witness anything that makes you feel unsafe, please report 
              it immediately. We review all reports promptly and take appropriate action.
            </p>
            <Button onClick={() => navigate("/contact")}>
              Contact Safety Team
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
