import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, AlertTriangle, CheckCircle, UserCheck, FileText, Scale, Phone, MessageCircle, Flag } from "lucide-react";
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
          <h1 className="text-2xl font-bold">Safety & Trust Center</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="space-y-12">
          <section className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Your Safety is Our Priority</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We've built comprehensive safety measures and verification systems to ensure secure, 
              trustworthy experiences for both clients and beauty professionals on Braida.
            </p>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold">Platform Safety Features</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <UserCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Identity Verification</h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      All beauty professionals undergo thorough identity verification through our 
                      trusted partner Veriff. We verify:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Government-issued ID documents</li>
                      <li>Professional qualifications and licenses</li>
                      <li>Work history and experience</li>
                      <li>Real-time facial recognition</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Secure Payment Escrow</h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      All payments are processed through Stripe, a PCI-DSS Level 1 certified processor. 
                      Your payment is protected by our escrow system:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Funds held securely until service completion</li>
                      <li>Payment information encrypted and never stored</li>
                      <li>Automatic refunds for valid cancellations</li>
                      <li>Dispute protection for both parties</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Verified Reviews System</h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      Authentic feedback you can trust:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Reviews only from completed bookings</li>
                      <li>No fake or purchased reviews tolerated</li>
                      <li>Reviews cannot be deleted or hidden</li>
                      <li>Both ratings and detailed written feedback</li>
                      <li>Admin oversight for inappropriate content</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">On-Platform Communication</h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      All conversations happen within Braida for your protection:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Secure, encrypted messaging system</li>
                      <li>Message history for dispute resolution</li>
                      <li>Automated monitoring for suspicious activity</li>
                      <li>No personal contact details shared prematurely</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Report & Dispute Resolution</h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      Multiple layers of protection if something goes wrong:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Easy reporting tools for safety concerns</li>
                      <li>Professional dispute resolution team</li>
                      <li>Fair investigation of all reported issues</li>
                      <li>Refund protection for legitimate claims</li>
                      <li>Account suspension for policy violations</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Data Protection & Privacy</h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      Your personal information is protected under UK GDPR:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Bank-level encryption for all data</li>
                      <li>Minimal data collection principles</li>
                      <li>No selling of user data to third parties</li>
                      <li>Full control over your data and privacy</li>
                      <li>Regular security audits and testing</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold">Safety Guidelines</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">For Clients</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-sm mb-2">Before Booking</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Review professional's portfolio and ratings carefully</li>
                      <li>Check verification badges and credentials</li>
                      <li>Read previous client reviews thoroughly</li>
                      <li>Understand cancellation and refund policies</li>
                      <li>Verify pricing and what's included in the service</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-2">During the Appointment</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Meet in public or well-lit, accessible locations</li>
                      <li>Inform a friend or family member of your appointment</li>
                      <li>Keep all communication on the Braida platform</li>
                      <li>Trust your instincts—leave if you feel uncomfortable</li>
                      <li>Communicate allergies or concerns upfront</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-2">After Service</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Leave an honest review to help other clients</li>
                      <li>Report any issues or concerns immediately</li>
                      <li>Contact support if service didn't meet expectations</li>
                      <li>Keep payment receipts and booking confirmations</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-2 border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg">For Beauty Professionals</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-semibold text-sm mb-2">Profile & Verification</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Complete identity verification immediately</li>
                      <li>Upload valid professional certifications</li>
                      <li>Keep portfolio and pricing up to date</li>
                      <li>Set clear service descriptions and boundaries</li>
                      <li>Maintain accurate availability calendars</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-2">Client Interactions</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Verify booking details before accepting</li>
                      <li>Keep all communications on the platform</li>
                      <li>Don't share personal contact details prematurely</li>
                      <li>Screen clients through their profiles and reviews</li>
                      <li>Set and enforce professional boundaries</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-2">Service Delivery</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm ml-2">
                      <li>Meet in safe, professional locations</li>
                      <li>Document your work with photos (with consent)</li>
                      <li>Maintain hygiene and safety standards</li>
                      <li>Report problematic clients or safety concerns</li>
                      <li>Request reviews from satisfied clients</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold">Community Standards</h3>
            <Card className="p-6 bg-muted/30">
              <p className="text-muted-foreground mb-4">
                Braida maintains strict community standards to ensure a safe, professional, and respectful 
                environment for all users. We enforce these standards through active moderation, automated 
                monitoring, and user reporting.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Flag className="h-5 w-5 text-destructive" />
                    Strictly Prohibited Behavior
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Harassment, discrimination, or hate speech of any kind</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Fraudulent activity, scams, or identity theft</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Sharing fake, misleading, or fraudulent information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Requesting or conducting transactions off-platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Violating privacy or sharing personal info without consent</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Inappropriate sexual behavior or advances</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Using platform for illegal activities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Creating fake accounts, reviews, or bookings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">•</span>
                      <span>Violent, threatening, or abusive language</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Enforcement Actions
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Violations of our community standards may result in:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Warning:</strong> First-time minor violations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Content Removal:</strong> Inappropriate posts or reviews</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Temporary Suspension:</strong> Repeated or moderate violations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Permanent Ban:</strong> Serious or repeated violations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Legal Action:</strong> Criminal activity or significant harm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span><strong>Law Enforcement Referral:</strong> As required by law</span>
                    </li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4 p-3 bg-background rounded border border-border">
                    <strong>No Tolerance Policy:</strong> Serious violations including harassment, fraud, 
                    or threats will result in immediate permanent removal from the platform.
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold">How to Report Safety Concerns</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full mb-3">
                  <Flag className="h-6 w-6 text-destructive" />
                </div>
                <h4 className="font-semibold mb-2">During a Booking</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Use the "Report Issue" button in your booking details to flag safety concerns immediately.
                </p>
                <p className="text-xs text-muted-foreground">Response time: &lt;1 hour for urgent issues</p>
              </Card>

              <Card className="p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full mb-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h4 className="font-semibold mb-2">General Reports</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Report inappropriate behavior, fake profiles, or policy violations through user profiles.
                </p>
                <p className="text-xs text-muted-foreground">Response time: 24-48 hours</p>
              </Card>

              <Card className="p-4 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-destructive/10 rounded-full mb-3">
                  <Phone className="h-6 w-6 text-destructive" />
                </div>
                <h4 className="font-semibold mb-2">Emergency Situations</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  For immediate physical safety threats, contact local emergency services (999) first.
                </p>
                <p className="text-xs text-muted-foreground">Then notify us for platform action</p>
              </Card>
            </div>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h4 className="font-bold mb-3">What Happens After You Report?</h4>
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">1.</span>
                  <span><strong>Immediate Acknowledgment:</strong> You'll receive confirmation that your report was received</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">2.</span>
                  <span><strong>Investigation:</strong> Our safety team reviews the report and gathers evidence</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">3.</span>
                  <span><strong>Interim Action:</strong> Urgent cases may result in immediate account suspension</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">4.</span>
                  <span><strong>Resolution:</strong> We take appropriate action based on our findings</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">5.</span>
                  <span><strong>Follow-Up:</strong> You'll be notified of the outcome (within privacy constraints)</span>
                </li>
              </ol>
              <p className="text-sm text-muted-foreground mt-4 p-3 bg-background rounded">
                <strong>Your Privacy:</strong> All reports are handled confidentially. The reported user will not 
                be informed of who submitted the report.
              </p>
            </Card>
          </section>

          <section className="space-y-6">
            <h3 className="text-2xl font-bold">Additional Safety Resources</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Trust & Safety FAQs</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Common questions about safety features, verification, and reporting
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/help")}>
                      View FAQs
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Privacy Policy</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Learn how we protect your personal data and privacy
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/privacy">View Privacy Policy</a>
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <Scale className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Terms of Service</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Understand your rights, responsibilities, and our policies
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/terms">View Terms</a>
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <MessageCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-2">Contact Support</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Reach our safety team with questions or concerns
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/contact")}>
                      Contact Us
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <Card className="p-8 text-center bg-primary/5 border-primary/20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you experience or witness anything that makes you feel unsafe, or if you have urgent 
              safety concerns, please contact us immediately. Our safety team is available 24/7 to 
              respond to urgent reports.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={() => navigate("/contact")}>
                Contact Safety Team
              </Button>
              <Button size="lg" variant="outline">
                Email: safety@braida.co.uk
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              <strong>Emergency?</strong> If you are in immediate physical danger, call 999 (UK emergency services) first, 
              then notify us so we can take appropriate platform action.
            </p>
          </Card>

          <div className="text-center py-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Last updated: December 25, 2025 • Questions? Contact <a href="mailto:safety@braida.co.uk" className="text-primary hover:underline">safety@braida.co.uk</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
