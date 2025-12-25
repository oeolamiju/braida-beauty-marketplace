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
          <p className="text-muted-foreground mb-6">Last updated: December 25, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground mb-3">
              Braida Ltd ("Braida", "we", "us", or "our") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our platform and services.
            </p>
            <p className="text-muted-foreground mb-3">
              We process your personal data in accordance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018, and other applicable data protection laws.
            </p>
            <p className="text-muted-foreground">
              For questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at: <strong>privacy@braida.co.uk</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Data Controller</h2>
            <div className="bg-muted p-4 rounded-lg mb-3">
              <p className="text-foreground font-semibold">Braida Ltd</p>
              <p className="text-muted-foreground">Data Protection Officer</p>
              <p className="text-muted-foreground">Email: privacy@braida.co.uk</p>
              <p className="text-muted-foreground">Support: support@braida.co.uk</p>
            </div>
            <p className="text-muted-foreground">
              Braida Ltd is the data controller responsible for your personal data collected and processed through our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Personal Data We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Registration Data</h3>
            <p className="text-muted-foreground mb-3">
              <strong>For Clients:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Account password (encrypted)</li>
            </ul>

            <p className="text-muted-foreground mb-3">
              <strong>For Beauty Professionals (Freelancers):</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Full name and professional name</li>
              <li>Email address and phone number</li>
              <li>Business address and service locations</li>
              <li>Date of birth and nationality (for verification purposes)</li>
              <li>Professional qualifications and certifications</li>
              <li>Work experience and skill sets</li>
              <li>Payment information (bank account or Stripe Connect details)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Profile Information</h3>
            <p className="text-muted-foreground mb-3">
              <strong>Mandatory Profile Data (Freelancers):</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Professional bio and description</li>
              <li>Service offerings and pricing</li>
              <li>Availability and booking preferences</li>
              <li>Location and service areas</li>
            </ul>
            <p className="text-muted-foreground mb-3">
              Some information can be configured to be visible only to registered users or kept private.
            </p>

            <p className="text-muted-foreground mb-3">
              <strong>Voluntary Profile Data:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Profile photos and portfolio images</li>
              <li>Service videos</li>
              <li>Professional certificates and credentials</li>
              <li>Previous work examples</li>
              <li>Social media links</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Booking and Transaction Data</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Booking details (service, date, time, location)</li>
              <li>Payment information (processed by Stripe)</li>
              <li>Transaction history and invoices</li>
              <li>Cancellation and refund records</li>
              <li>Reviews and ratings (given and received)</li>
              <li>Messages exchanged through the platform</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.4 Automatically Collected Data</h3>
            <p className="text-muted-foreground mb-3">
              When you use our platform, we automatically collect:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>IP address and device identifiers</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Referral URL (how you found us)</li>
              <li>Pages visited and time spent on pages</li>
              <li>Search queries and filters used</li>
              <li>Application and web server logs</li>
              <li>Geolocation data (with your consent)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.5 Verification and Identity Data</h3>
            <p className="text-muted-foreground mb-3">
              For professional verification and Know Your Customer (KYC) compliance:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Government-issued identification documents</li>
              <li>Professional licenses and certifications</li>
              <li>Proof of qualifications</li>
              <li>Identity verification photos (via Veriff)</li>
              <li>Business registration documents (if applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Personal Data</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Purpose of Processing</h3>
            <p className="text-muted-foreground mb-3">
              We process your personal data for the following purposes:
            </p>

            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Account Management</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                  <li>Create and manage your user account</li>
                  <li>Authenticate and verify your identity</li>
                  <li>Provide customer support</li>
                  <li>Send account-related notifications</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Service Delivery</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                  <li>Connect clients with beauty professionals</li>
                  <li>Facilitate service bookings and scheduling</li>
                  <li>Process payments and manage transactions</li>
                  <li>Enable messaging between users</li>
                  <li>Display profiles, portfolios, and service listings</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Platform Improvement</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                  <li>Analyze platform usage and user behavior</li>
                  <li>Improve search and recommendation algorithms</li>
                  <li>Enhance user experience and functionality</li>
                  <li>Conduct research and development</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Safety and Security</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                  <li>Verify professional credentials and identities</li>
                  <li>Prevent fraud, abuse, and illegal activities</li>
                  <li>Investigate disputes and resolve complaints</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Protect user safety and platform integrity</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Communications</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                  <li>Send booking confirmations and reminders</li>
                  <li>Notify you of new messages and reviews</li>
                  <li>Send marketing communications (with consent)</li>
                  <li>Provide customer support responses</li>
                </ul>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Legal Compliance</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 text-sm">
                  <li>Comply with legal obligations (tax, accounting, regulatory)</li>
                  <li>Respond to lawful requests from authorities</li>
                  <li>Maintain records as required by law</li>
                  <li>Exercise or defend legal claims</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Legal Basis for Processing</h3>
            <p className="text-muted-foreground mb-3">
              We process your personal data based on the following legal grounds under the UK GDPR:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li><strong>Consent (Article 6(1)(a)):</strong> Marketing communications, optional features, cookies</li>
              <li><strong>Contract Performance (Article 6(1)(b)):</strong> Account creation, bookings, payments, service delivery</li>
              <li><strong>Legal Obligation (Article 6(1)(c)):</strong> Tax records, regulatory compliance, lawful requests</li>
              <li><strong>Legitimate Interest (Article 6(1)(f)):</strong> Platform improvement, fraud prevention, analytics, direct marketing to business users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Sharing Your Personal Data</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 When We Share Data</h3>
            <p className="text-muted-foreground mb-3">
              We share your personal data only in the following circumstances:
            </p>

            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <p className="font-semibold text-foreground mb-1">Between Users</p>
                <p className="text-muted-foreground text-sm">
                  When you book a service, we share necessary contact and booking information between clients and freelancers to facilitate the appointment.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="font-semibold text-foreground mb-1">Service Providers</p>
                <p className="text-muted-foreground text-sm">
                  We work with trusted third-party service providers who process data on our behalf:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm ml-4 mt-1">
                  <li>Payment processing (Stripe)</li>
                  <li>Identity verification (Veriff)</li>
                  <li>Email delivery (Resend)</li>
                  <li>Cloud hosting and infrastructure</li>
                  <li>Analytics and performance monitoring</li>
                </ul>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="font-semibold text-foreground mb-1">Legal Requirements</p>
                <p className="text-muted-foreground text-sm">
                  We may disclose your data when required by law, regulation, legal process, or governmental request.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="font-semibold text-foreground mb-1">Business Transfers</p>
                <p className="text-muted-foreground text-sm">
                  In the event of a merger, acquisition, or sale of assets, your data may be transferred to the new entity.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="font-semibold text-foreground mb-1">Safety and Protection</p>
                <p className="text-muted-foreground text-sm">
                  To protect the rights, property, or safety of Braida, our users, or the public.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Third-Party Service Providers</h3>
            <p className="text-muted-foreground mb-3">
              <strong>Payment Processing - Stripe:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-3 text-sm">
              <li>Stripe Payments UK Ltd, London</li>
              <li>Processes all payment transactions securely</li>
              <li>Privacy policy: <a href="https://stripe.com/gb/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://stripe.com/gb/privacy</a></li>
              <li>We do not store your complete payment card details</li>
            </ul>

            <p className="text-muted-foreground mb-3">
              <strong>Identity Verification - Veriff:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4 mb-3 text-sm">
              <li>Verifies professional identities and credentials</li>
              <li>Processes verification data securely</li>
              <li>Data handled according to Veriff's privacy policy</li>
            </ul>

            <p className="text-muted-foreground mb-3">
              All service providers are bound by data processing agreements and must maintain appropriate security measures.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. International Data Transfers</h2>
            <p className="text-muted-foreground mb-3">
              Your personal data is primarily processed and stored within the United Kingdom and European Economic Area (EEA). However, some of our service providers may transfer data to countries outside the UK/EEA.
            </p>
            <p className="text-muted-foreground mb-3">
              When we transfer data internationally, we ensure appropriate safeguards are in place:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li><strong>Standard Contractual Clauses:</strong> EU/UK-approved standard contractual clauses under Article 46(2)(c) GDPR</li>
              <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate data protection as recognized by UK/EU authorities</li>
              <li><strong>Your Consent:</strong> Where you have explicitly consented to the transfer</li>
            </ul>
            <p className="text-muted-foreground">
              For more information about international transfers or to request copies of safeguards, contact: privacy@braida.co.uk
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground mb-3">
              We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected or to comply with legal obligations.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full border border-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="border border-border p-3 text-left text-sm font-semibold">Data Type</th>
                    <th className="border border-border p-3 text-left text-sm font-semibold">Retention Period</th>
                    <th className="border border-border p-3 text-left text-sm font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground text-sm">
                  <tr>
                    <td className="border border-border p-3">Account data (active users)</td>
                    <td className="border border-border p-3">Duration of account</td>
                    <td className="border border-border p-3">Until account deletion</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Account data (after deletion)</td>
                    <td className="border border-border p-3">48 hours</td>
                    <td className="border border-border p-3">Extended to 6 weeks if active subscriptions</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Transaction records</td>
                    <td className="border border-border p-3">7 years</td>
                    <td className="border border-border p-3">Tax and legal compliance</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Booking history</td>
                    <td className="border border-border p-3">3 years</td>
                    <td className="border border-border p-3">Dispute resolution, analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Reviews and ratings</td>
                    <td className="border border-border p-3">Indefinitely</td>
                    <td className="border border-border p-3">Unless removed for violations</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Payment logs (audit)</td>
                    <td className="border border-border p-3">12 months</td>
                    <td className="border border-border p-3">PCI-DSS compliance</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">General server logs</td>
                    <td className="border border-border p-3">6 weeks</td>
                    <td className="border border-border p-3">Security and troubleshooting</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Marketing consent data</td>
                    <td className="border border-border p-3">12 weeks</td>
                    <td className="border border-border p-3">After consent withdrawal</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Support tickets</td>
                    <td className="border border-border p-3">12 weeks</td>
                    <td className="border border-border p-3">After issue resolution</td>
                  </tr>
                  <tr>
                    <td className="border border-border p-3">Invoices and receipts</td>
                    <td className="border border-border p-3">10 years</td>
                    <td className="border border-border p-3">Legal requirement</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights Under UK GDPR</h2>
            <p className="text-muted-foreground mb-3">
              You have the following rights regarding your personal data:
            </p>

            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Right to Access (Article 15)</p>
                <p className="text-muted-foreground text-sm">
                  Request a copy of all personal data we hold about you. You can access most data through your account settings or contact us for a complete data export.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Right to Rectification (Article 16)</p>
                <p className="text-muted-foreground text-sm">
                  Correct inaccurate or incomplete personal data. You can update most information directly in your account settings.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Right to Erasure / "Right to be Forgotten" (Article 17)</p>
                <p className="text-muted-foreground text-sm">
                  Request deletion of your personal data under certain circumstances. Note that we may be required to retain some data for legal compliance.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Right to Restriction (Article 18)</p>
                <p className="text-muted-foreground text-sm">
                  Request that we limit how we use your data in certain situations.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Right to Data Portability (Article 20)</p>
                <p className="text-muted-foreground text-sm">
                  Receive your personal data in a structured, commonly used, machine-readable format and transfer it to another service.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Right to Object (Article 21)</p>
                <p className="text-muted-foreground text-sm">
                  Object to processing based on legitimate interests or for direct marketing purposes. You can manage visibility settings and marketing preferences in your account.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Right to Withdraw Consent (Article 7(3))</p>
                <p className="text-muted-foreground text-sm">
                  Withdraw consent at any time where processing is based on consent. This doesn't affect the lawfulness of processing before withdrawal.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="font-semibold text-foreground mb-2">Right to Lodge a Complaint (Article 77)</p>
                <p className="text-muted-foreground text-sm">
                  File a complaint with the Information Commissioner's Office (ICO) if you believe we've mishandled your personal data.
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mt-4">
              To exercise any of these rights, please contact: <strong>privacy@braida.co.uk</strong>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Cookies and Tracking Technologies</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">8.1 What Are Cookies?</h3>
            <p className="text-muted-foreground mb-3">
              Cookies are small text files stored on your device when you visit our platform. They help us provide and improve our services.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.2 Types of Cookies We Use</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <p className="font-semibold text-foreground mb-1">Strictly Necessary Cookies</p>
                <p className="text-muted-foreground text-sm mb-2">
                  Essential for platform functionality. These cannot be disabled.
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm ml-4">
                  <li>Session management and authentication</li>
                  <li>Security and fraud prevention</li>
                  <li>User preferences and settings</li>
                </ul>
                <p className="text-muted-foreground text-sm mt-1">Legal basis: Legitimate interest (Article 6(1)(f) GDPR)</p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="font-semibold text-foreground mb-1">Performance and Analytics Cookies</p>
                <p className="text-muted-foreground text-sm mb-2">
                  Help us understand how users interact with our platform.
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm ml-4">
                  <li>Google Analytics (with IP anonymization)</li>
                  <li>Page view and engagement tracking</li>
                  <li>Error logging and debugging</li>
                </ul>
                <p className="text-muted-foreground text-sm mt-1">Legal basis: Consent (Article 6(1)(a) GDPR)</p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <p className="font-semibold text-foreground mb-1">Marketing and Advertising Cookies</p>
                <p className="text-muted-foreground text-sm mb-2">
                  Used for targeted advertising and remarketing.
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm ml-4">
                  <li>Conversion tracking</li>
                  <li>Personalized advertising</li>
                  <li>Social media integration</li>
                </ul>
                <p className="text-muted-foreground text-sm mt-1">Legal basis: Consent (Article 6(1)(a) GDPR)</p>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.3 Managing Cookies</h3>
            <p className="text-muted-foreground mb-3">
              You can control cookies through:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Our cookie consent banner when you first visit</li>
              <li>Your browser settings (block or delete cookies)</li>
              <li>Opt-out tools provided by third parties</li>
            </ul>
            <p className="text-muted-foreground">
              Note: Disabling necessary cookies may affect platform functionality.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.4 Local Storage</h3>
            <p className="text-muted-foreground">
              We also use local storage in your browser to store preferences and improve performance. This data remains on your device until you clear your browser cache.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Security Measures</h2>
            <p className="text-muted-foreground mb-3">
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.1 Technical Security</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li><strong>Encryption:</strong> All data transmitted over the internet uses SSL/TLS encryption (HTTPS)</li>
              <li><strong>Secure Storage:</strong> Data stored in secure, access-controlled data centers</li>
              <li><strong>Password Protection:</strong> Passwords are encrypted using industry-standard hashing algorithms</li>
              <li><strong>Firewall Protection:</strong> Network firewalls to prevent unauthorized access</li>
              <li><strong>Regular Backups:</strong> Automated backup and disaster recovery procedures</li>
              <li><strong>Vulnerability Scanning:</strong> Regular security audits and penetration testing</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.2 Organizational Security</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li><strong>Access Controls:</strong> Role-based access with principle of least privilege</li>
              <li><strong>Employee Training:</strong> Regular data protection and security training</li>
              <li><strong>Confidentiality Agreements:</strong> All employees bound by confidentiality obligations</li>
              <li><strong>Data Processing Agreements:</strong> Third-party processors bound by strict security requirements</li>
              <li><strong>Incident Response:</strong> Procedures for detecting and responding to data breaches</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">9.3 Payment Security</h3>
            <p className="text-muted-foreground mb-3">
              All payment processing is handled by Stripe, a PCI-DSS Level 1 certified payment processor. We never store complete payment card details on our servers.
            </p>

            <p className="text-muted-foreground">
              Despite our security measures, no system is completely secure. If you become aware of any security vulnerability, please report it to: security@braida.co.uk
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground mb-3">
              Our platform is not intended for individuals under 18 years of age. We do not knowingly collect personal data from children.
            </p>
            <p className="text-muted-foreground">
              If you believe we have inadvertently collected data from a child, please contact us immediately at privacy@braida.co.uk, and we will take steps to delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground mb-3">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
            </p>
            <p className="text-muted-foreground mb-3">
              We will notify you of material changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Email notification to your registered address</li>
              <li>Prominent notice on our platform</li>
              <li>In-app notification</li>
            </ul>
            <p className="text-muted-foreground">
              The "Last Updated" date at the top of this policy indicates when it was last revised. Your continued use of the platform after changes become effective constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground mb-3">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p className="text-foreground font-semibold mb-3">Braida Ltd - Data Protection</p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacy@braida.co.uk</p>
                <p><strong>Support:</strong> support@braida.co.uk</p>
                <p><strong>Security Issues:</strong> security@braida.co.uk</p>
              </div>
            </div>

            <p className="text-muted-foreground mt-4">
              <strong>Information Commissioner's Office (ICO):</strong><br />
              If you're not satisfied with our response, you can lodge a complaint with the UK's supervisory authority:
            </p>
            <div className="bg-muted p-4 rounded-lg mt-2">
              <p className="text-muted-foreground text-sm">
                Information Commissioner's Office<br />
                Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF<br />
                Helpline: 0303 123 1113<br />
                Website: <a href="https://ico.org.uk" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://ico.org.uk</a>
              </p>
            </div>
          </section>

          <div className="border-t border-border pt-6 mt-8">
            <p className="text-sm text-muted-foreground text-center">
              This Privacy Policy is effective as of December 25, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
