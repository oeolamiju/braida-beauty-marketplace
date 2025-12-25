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
          <p className="text-muted-foreground mb-6">Last updated: December 25, 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Scope and Application</h2>
            <p className="text-muted-foreground mb-3">
              These Terms of Service ("Terms") govern your access to and use of the Braida platform, a beauty services marketplace operated by Braida Ltd ("Braida", "we", "us", or "our"). By registering for or using our services, you accept and agree to be bound by these Terms.
            </p>
            <p className="text-muted-foreground mb-3">
              The Braida platform is a business-to-consumer (B2C) online marketplace connecting beauty professionals ("Freelancers") with clients seeking beauty services. These Terms apply to all users of the platform, including both Freelancers and clients.
            </p>
            <p className="text-muted-foreground">
              Any user terms and conditions will only apply if expressly recognized in writing by Braida.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Platform Services</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">2.1 Services Provided</h3>
            <p className="text-muted-foreground mb-3">
              Braida provides an online platform offering the following services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Information, communication, and booking platform for beauty services</li>
              <li>Service discovery and search functionality</li>
              <li>User profiles and professional portfolios</li>
              <li>Electronic messaging between users</li>
              <li>Booking management and calendar systems</li>
              <li>Secure payment processing and escrow services</li>
              <li>Review and rating system</li>
              <li>Dispute resolution and support services</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.2 Membership Types</h3>
            <p className="text-muted-foreground mb-3">
              We offer different membership levels, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li><strong>Free memberships</strong> with basic platform access</li>
              <li><strong>Premium memberships</strong> with enhanced features and visibility</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">2.3 Platform Modifications</h3>
            <p className="text-muted-foreground mb-3">
              Braida reserves the right to expand, modify, reduce, or discontinue any services or features at any time. We will make reasonable efforts to provide notice of significant changes. If services are substantially reduced during a paid membership term, you may terminate your membership extraordinarily and receive a pro-rated refund.
            </p>
            <p className="text-muted-foreground">
              We strive to maintain the best possible platform availability within technical capabilities. We may temporarily interrupt access for maintenance, updates, or technical improvements, and will provide advance notice when feasible.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Registration and User Accounts</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">3.1 Eligibility Requirements</h3>
            <p className="text-muted-foreground mb-3">
              To register for Braida, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Be at least 18 years of age with full legal capacity to enter into contracts</li>
              <li>Provide accurate and complete registration information</li>
              <li>Not be previously suspended or banned from the platform</li>
            </ul>
            <p className="text-muted-foreground mb-3">
              <strong>Minors under 18 are strictly prohibited from registering or using the platform.</strong>
            </p>
            <p className="text-muted-foreground">
              Legal entities (companies, agencies, etc.) must register through an authorized natural person with proper legal authority. Braida reserves the right to reject any registration application without providing reasons.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.2 Registration Process</h3>
            <p className="text-muted-foreground mb-3">
              Registration follows this process:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Complete and submit the registration form (constitutes an offer to contract)</li>
              <li>Receive a confirmation email with an account activation link</li>
              <li>Click the activation link to activate your account (contract is concluded upon activation)</li>
              <li>For paid memberships, the contract becomes effective upon payment confirmation</li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-4">3.3 Account Rules and Security</h3>
            <p className="text-muted-foreground mb-3">
              <strong>One Account Policy:</strong> Each user may maintain only one account for personal or professional use. Multiple accounts by the same person are prohibited unless expressly authorized by Braida.
            </p>
            <p className="text-muted-foreground mb-3">
              <strong>Account Security:</strong> You must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Keep your password secure and confidential</li>
              <li>Not share your account with others</li>
              <li>Immediately notify Braida if you suspect unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
            <p className="text-muted-foreground mb-3">
              <strong>Non-Transferability:</strong> Accounts cannot be transferred, sold, or assigned to third parties.
            </p>
            <p className="text-muted-foreground">
              Violations of these account rules may result in immediate account blocking, deletion, and termination of service without refund.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Obligations and Conduct</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">4.1 Information Accuracy</h3>
            <p className="text-muted-foreground mb-3">
              You must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Provide only truthful, accurate, and non-misleading information</li>
              <li>Use your real name (no pseudonyms or aliases)</li>
              <li>Keep your profile information current and complete</li>
              <li>Update availability, pricing, and service information promptly</li>
              <li>Remove service listings when no longer offering those services</li>
              <li>Provide proof of service legitimacy, qualifications, or certifications upon request</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.2 Platform Usage Standards</h3>
            <p className="text-muted-foreground mb-3">
              Content and communications on the platform must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Serve to facilitate legitimate beauty service transactions</li>
              <li>Be relevant and appropriate to the platform's purpose</li>
              <li>Be personalized (no mass messages or spam)</li>
              <li>Respect other users' time and attention</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.3 Confidentiality</h3>
            <p className="text-muted-foreground mb-3">
              You must treat all user information accessed through the platform as confidential. You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Share user contact information with third parties without consent</li>
              <li>Use user data for purposes other than completing bookings through Braida</li>
              <li>Scrape, harvest, or systematically collect user data</li>
            </ul>
            <p className="text-muted-foreground">
              This confidentiality obligation survives termination of your account and these Terms.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.4 Prohibited Activities</h3>
            <p className="text-muted-foreground mb-3">
              You are strictly prohibited from:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Damaging, interfering with, or attempting to breach the platform's technical infrastructure</li>
              <li>Posting illegal, fraudulent, or misleading content</li>
              <li>Using third-party logos, images, or copyrighted materials without authorization</li>
              <li>Posting insulting, defamatory, discriminatory, pornographic, or otherwise offensive content</li>
              <li>Violating copyright, trademark, or intellectual property rights</li>
              <li>Engaging in commercial data processing, trading, or mining of platform data</li>
              <li>Advertising competing platforms or services</li>
              <li>Conducting transactions outside the platform to avoid fees</li>
              <li>Creating fake accounts, reviews, or bookings</li>
              <li>Harassing, threatening, or intimidating other users</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">4.5 Penalties for Violations</h3>
            <p className="text-muted-foreground mb-3">
              Violations of prohibited activities, particularly data misuse or commercial exploitation, will result in:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Immediate account suspension or termination</li>
              <li>Contractual penalties up to £10,000 per violation</li>
              <li>Legal action for damages exceeding the contractual penalty</li>
              <li>Reporting to relevant authorities for illegal activities</li>
            </ul>
            <p className="text-muted-foreground">
              Braida reserves the right to determine penalty amounts at its discretion, and penalties may be offset against further damage claims.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Content Management and User Blocking</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">5.1 Content Moderation Rights</h3>
            <p className="text-muted-foreground mb-3">
              Braida reserves the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Delete or refuse to publish content that violates these Terms or applicable law</li>
              <li>Remove content that offends common decency or infringes third-party rights</li>
              <li>Delete false, misleading, or incompatible content</li>
              <li>Hide or remove content during dispute investigations until resolution</li>
              <li>Correct obvious spelling mistakes and formatting errors</li>
              <li>Request verification or proof of claims made in listings or profiles</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.2 Account Blocking and Termination</h3>
            <p className="text-muted-foreground mb-3">
              For violations of these Terms, Braida may:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Temporarily suspend your account pending investigation</li>
              <li>Permanently terminate your account for serious or repeated violations</li>
              <li>Ban you from creating new accounts or re-registering</li>
            </ul>
            <p className="text-muted-foreground mb-3">
              <strong>No Refund Policy:</strong> If your paid membership is terminated for violations, no refund of membership fees will be provided. Braida retains such fees as liquidated damages. You may provide evidence of no or lesser damages to claim a proportional refund.
            </p>
            <p className="text-muted-foreground">
              Users whose accounts have been blocked or terminated are prohibited from using other accounts or re-registering on the platform.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">5.3 User Liability and Indemnification</h3>
            <p className="text-muted-foreground mb-3">
              If your actions result in third-party claims against Braida, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Indemnify and hold Braida harmless from all such claims</li>
              <li>Cover all legal costs, including court fees and attorney's fees</li>
              <li>Provide all necessary information and cooperation for Braida's defense</li>
              <li>Reimburse Braida for any damages, settlements, or judgments</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Bookings and Service Delivery</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">6.1 Booking Process</h3>
            <p className="text-muted-foreground mb-3">
              All bookings are subject to availability and Freelancer acceptance. Bookings must be completed through the Braida platform. The booking process involves:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Client selects service, date, and time</li>
              <li>Client submits booking request with payment</li>
              <li>Payment is held in escrow</li>
              <li>Freelancer accepts or declines within the specified timeframe</li>
              <li>Service is performed at the scheduled time</li>
              <li>Payment is released to Freelancer upon service completion or auto-confirmation</li>
            </ol>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.2 Freelancer Responsibilities</h3>
            <p className="text-muted-foreground mb-3">
              Freelancers are independent contractors, not employees of Braida. Freelancers are solely responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>The quality and safety of services provided</li>
              <li>Maintaining all necessary licenses, certifications, and insurance</li>
              <li>Compliance with health and safety regulations</li>
              <li>Payment of applicable taxes and social contributions</li>
              <li>Providing professional and courteous service</li>
              <li>Maintaining accurate availability calendars</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.3 Client Responsibilities</h3>
            <p className="text-muted-foreground mb-3">
              Clients agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Provide accurate booking information</li>
              <li>Be present and ready at the scheduled appointment time</li>
              <li>Communicate any allergies, sensitivities, or special requirements</li>
              <li>Treat Freelancers with respect and professionalism</li>
              <li>Review and understand cancellation policies before booking</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">6.4 Cancellations and Rescheduling</h3>
            <p className="text-muted-foreground mb-3">
              Cancellation policies are set by individual Freelancers and must be clearly displayed before booking. Cancellation fees and refund amounts depend on how far in advance cancellation occurs. Please review the specific cancellation policy for each service before booking.
            </p>
            <p className="text-muted-foreground">
              Rescheduling requests must be made through the platform. Both parties must agree to new dates and times.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Payments, Pricing, and Fees</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">7.1 Payment Terms</h3>
            <p className="text-muted-foreground mb-3">
              All payments are processed through Stripe, our secure payment processor. Payment terms:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Service payments are due at the time of booking</li>
              <li>Membership fees are due immediately upon invoice receipt</li>
              <li>Default occurs immediately after the payment due date</li>
              <li>Invoices are sent by email and available in your account</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.2 Pricing and Fees</h3>
            <p className="text-muted-foreground mb-3">
              Braida charges platform fees for connecting clients with Freelancers. Fee structures are clearly displayed during booking. All prices are shown inclusive of applicable taxes unless otherwise stated.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.3 Price Adjustments</h3>
            <p className="text-muted-foreground mb-3">
              Braida reserves the right to adjust membership fees and platform fees. Price changes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Apply immediately to new memberships and bookings</li>
              <li>Are not retroactive for existing customers</li>
              <li>Apply only to renewals or new membership terms for existing users</li>
              <li>Will be communicated with reasonable advance notice</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.4 Payment Restrictions</h3>
            <p className="text-muted-foreground mb-3">
              You may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Withhold payments except for recognized or legally established counterclaims</li>
              <li>Offset payments except for recognized or legally established counterclaims</li>
              <li>Conduct payment transactions outside the platform</li>
              <li>Request refunds through payment processors for services properly delivered</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">7.5 Refunds</h3>
            <p className="text-muted-foreground">
              Refunds are processed according to the applicable cancellation policy. Disputed charges are handled through our dispute resolution process. Approved refunds are returned to the original payment method within 5-10 business days.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Liability and Disclaimers</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">8.1 Platform Role</h3>
            <p className="text-muted-foreground mb-3">
              Braida acts as a marketplace platform connecting clients with independent Freelancers. We do not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Provide beauty services directly</li>
              <li>Employ or control Freelancers</li>
              <li>Guarantee the accuracy, quality, or safety of services</li>
              <li>Verify all content posted by users for accuracy or legality</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.2 Content Disclaimer</h3>
            <p className="text-muted-foreground mb-3">
              Braida is not liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>The accuracy, completeness, or legality of user-generated content</li>
              <li>Representations, warranties, or claims made by users</li>
              <li>Disputes between users</li>
            </ul>
            <p className="text-muted-foreground">
              User-generated content does not reflect Braida's opinions or endorsement.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.3 Limitation of Liability</h3>
            <p className="text-muted-foreground mb-3">
              <strong>Braida's liability is limited as follows:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>We are liable only for damages caused by gross negligence or willful intent</li>
              <li>We are liable for breach of essential contractual obligations (material duties necessary for contract performance)</li>
              <li>For breach of essential obligations without gross negligence or intent, liability is limited to typically foreseeable damages</li>
              <li>Maximum liability in such cases is capped at one year's membership fees or £10,000, whichever is lower</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.4 Unrestricted Liability</h3>
            <p className="text-muted-foreground mb-3">
              The above limitations do not apply to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Injury to life, body, or health caused by Braida</li>
              <li>Claims under express guarantees or warranties provided by Braida</li>
              <li>Liability under applicable consumer protection laws</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">8.5 Third-Party Links</h3>
            <p className="text-muted-foreground">
              Our platform may contain links to third-party websites or services. Braida is not responsible for the content, accuracy, privacy practices, or legal compliance of linked sites. Third-party providers are solely responsible for their content and services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Data Protection and Privacy</h2>
            <p className="text-muted-foreground mb-3">
              Braida collects, processes, and uses personal data in accordance with applicable data protection laws, including the UK GDPR and Data Protection Act 2018. 
            </p>
            <p className="text-muted-foreground">
              For detailed information about how we handle your personal data, please refer to our separate <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">10.1 Free Membership Termination</h3>
            <p className="text-muted-foreground">
              Free memberships may be terminated by either party at any time without notice or cause.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">10.2 Paid Membership Termination</h3>
            <p className="text-muted-foreground mb-3">
              Paid memberships:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Run for the minimum booked period (maximum 1 year)</li>
              <li>Automatically renew for the same duration unless terminated</li>
              <li>Require 7 days' notice before the end of the current term</li>
              <li>Termination notices must be submitted through your account settings or in writing</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">10.3 Termination for Cause</h3>
            <p className="text-muted-foreground mb-3">
              Either party may terminate immediately for good cause, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Violation of these Terms or applicable laws</li>
              <li>Breach of essential contractual obligations</li>
              <li>Conduct endangering Braida's reputation or other users' safety</li>
              <li>Fraudulent activity or material misrepresentation</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">10.4 Effects of Termination</h3>
            <p className="text-muted-foreground mb-3">
              Upon termination:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mb-3">
              <li>Your access to the platform will be revoked</li>
              <li>Your account and profile will be deactivated</li>
              <li>Braida may delete all user-generated content associated with your account</li>
              <li>Outstanding financial obligations remain due and payable</li>
              <li>Provisions regarding confidentiality, liability, and dispute resolution survive termination</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Dispute Resolution</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">11.1 Internal Dispute Process</h3>
            <p className="text-muted-foreground mb-3">
              For disputes between users regarding bookings or services, Braida provides an internal dispute resolution process. Users are encouraged to resolve issues directly first, then escalate to our support team if needed.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">11.2 Mediation</h3>
            <p className="text-muted-foreground mb-3">
              Before pursuing legal action, parties agree to attempt good-faith mediation of disputes.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">11.3 Governing Law and Jurisdiction</h3>
            <p className="text-muted-foreground mb-3">
              These Terms are governed by the laws of England and Wales, excluding conflict of law principles and the United Nations Convention on Contracts for the International Sale of Goods (CISG).
            </p>
            <p className="text-muted-foreground mb-3">
              For business users and legal entities, the exclusive jurisdiction for any disputes shall be the courts of England and Wales. Braida may also bring claims in the courts of your jurisdiction.
            </p>
            <p className="text-muted-foreground">
              For consumer users, nothing in these Terms affects your statutory rights or your right to bring proceedings in your local jurisdiction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. General Provisions</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">12.1 Changes to Terms</h3>
            <p className="text-muted-foreground mb-3">
              Braida may modify these Terms from time to time. We will notify users of material changes via email or platform notification at least 4 weeks in advance. Changes become effective on the stated date.
            </p>
            <p className="text-muted-foreground mb-3">
              You have the right to terminate your account within 4 weeks of receiving notice of changes. Continued use of the platform after the effective date constitutes acceptance of the modified Terms.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">12.2 Written Form</h3>
            <p className="text-muted-foreground mb-3">
              Amendments to these Terms must be in writing (including electronic form). This requirement applies to the written form clause itself. No verbal collateral agreements exist.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">12.3 Assignment</h3>
            <p className="text-muted-foreground mb-3">
              You may not assign your rights or obligations under these Terms to any third party without Braida's prior written consent. Braida may assign these Terms to an affiliate or in connection with a merger, acquisition, or sale of assets.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">12.4 Severability</h3>
            <p className="text-muted-foreground mb-3">
              If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The parties agree to replace any invalid provision with a valid provision that achieves the closest economic result.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">12.5 Entire Agreement</h3>
            <p className="text-muted-foreground mb-3">
              These Terms, together with our Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and Braida regarding use of the platform.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">12.6 Waiver</h3>
            <p className="text-muted-foreground">
              Braida's failure to enforce any right or provision of these Terms does not constitute a waiver of that right or provision.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-muted-foreground mb-3">
              For questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-foreground font-semibold">Braida Ltd</p>
              <p className="text-muted-foreground">Email: legal@braida.co.uk</p>
              <p className="text-muted-foreground">Support: support@braida.co.uk</p>
            </div>
          </section>

          <div className="border-t border-border pt-6 mt-8">
            <p className="text-sm text-muted-foreground text-center">
              These Terms of Service are effective as of December 25, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
