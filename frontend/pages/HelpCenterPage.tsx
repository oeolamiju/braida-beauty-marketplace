import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function HelpCenterPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: "For Clients",
      question: "How do I book a service?",
      answer: "Browse our directory of beauty professionals, select a stylist whose work you love, choose an available time slot, and complete the booking with secure payment. You'll receive instant confirmation.",
    },
    {
      category: "For Clients",
      question: "What happens if I need to cancel my booking?",
      answer: "You can cancel your booking from your dashboard. Cancellation policies vary by professional—some offer full refunds if cancelled 24+ hours in advance. Check the specific policy before booking.",
    },
    {
      category: "For Clients",
      question: "How do I know if a professional is verified?",
      answer: "Verified professionals have a checkmark badge on their profile. This means they've submitted and passed our verification process, including identity and qualifications checks.",
    },
    {
      category: "For Clients",
      question: "Can I see a professional's past work?",
      answer: "Yes! Every professional has a portfolio showcasing their previous work. You can also read reviews from other clients to help make your decision.",
    },
    {
      category: "For Professionals",
      question: "How do I get started as a professional on Braida?",
      answer: "Sign up for a professional account, complete your profile with your bio, location, and services offered. Upload portfolio images to showcase your work, then submit verification documents to get verified.",
    },
    {
      category: "For Professionals",
      question: "How do payments work?",
      answer: "Clients pay when they book. Funds are held securely in escrow and released to you after the service is completed. You'll receive payouts to your connected bank account based on your payout schedule.",
    },
    {
      category: "For Professionals",
      question: "How do I manage my availability?",
      answer: "Set your working hours and travel radius in your Availability settings. You can also add exceptions for holidays, special events, or personal time off.",
    },
    {
      category: "For Professionals",
      question: "What fees does Braida charge?",
      answer: "Braida charges a service fee on each completed booking. This covers payment processing, platform maintenance, and customer support. Exact rates are available in your professional dashboard.",
    },
    {
      category: "General",
      question: "Is my payment information secure?",
      answer: "Yes. We use Stripe, a leading payment processor trusted by millions of businesses worldwide. Your payment information is encrypted and never stored on our servers.",
    },
    {
      category: "General",
      question: "What if there's a problem with my booking?",
      answer: "Contact our support team through the Help Center or use the dispute resolution feature in your booking details. We're here to help resolve any issues fairly.",
    },
    {
      category: "General",
      question: "Can I leave a review?",
      answer: "Yes! After your service is completed, you can leave a review and rating for your professional. Reviews help other clients make informed decisions and help professionals build their reputation.",
    },
  ];

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Help Center</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          <section className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How can we help you?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Find answers to frequently asked questions
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </section>

          {categories.map((category) => {
            const categoryFAQs = filteredFAQs.filter(
              (faq) => faq.category === category
            );

            if (categoryFAQs.length === 0) return null;

            return (
              <section key={category}>
                <h3 className="text-2xl font-bold mb-4">{category}</h3>
                <div className="space-y-3">
                  {categoryFAQs.map((faq, index) => {
                    const globalIndex = faqs.indexOf(faq);
                    const isExpanded = expandedIndex === globalIndex;

                    return (
                      <Card
                        key={globalIndex}
                        className="overflow-hidden cursor-pointer"
                        onClick={() =>
                          setExpandedIndex(isExpanded ? null : globalIndex)
                        }
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{faq.question}</h4>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          {isExpanded && (
                            <p className="text-muted-foreground mt-3">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No results found for "{searchTerm}"
              </p>
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            </div>
          )}

          <Card className="p-8 text-center bg-primary/5 border-primary/20">
            <h3 className="text-2xl font-bold mb-4">Still need help?</h3>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Get in touch with our support team.
            </p>
            <Button onClick={() => navigate("/contact")}>Contact Support</Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
