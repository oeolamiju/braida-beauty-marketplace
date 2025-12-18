import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function ContactPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Contact Us</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-8">
              Have a question or feedback? We'd love to hear from you. Fill out the form 
              and we'll get back to you as soon as possible.
            </p>

            <div className="space-y-6">
              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <p className="text-sm text-muted-foreground">support@braida.com</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-sm text-muted-foreground">+44 20 1234 5678</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office</h3>
                    <p className="text-sm text-muted-foreground">
                      London, United Kingdom
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="What is this about?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  className="w-full min-h-32 px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell us more..."
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                <Send className="h-4 w-4 mr-2" />
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
