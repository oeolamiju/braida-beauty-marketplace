import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TopNav from "@/components/navigation/TopNav";
import {
  Shield,
  ClipboardCheck,
  Lock,
  UserCheck,
  AlertTriangle,
  Phone,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import backend from "@/lib/backend";

interface SafetyResource {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  externalLinks?: { title: string; url: string }[];
  iconName: string;
}

const iconMap: Record<string, any> = {
  ClipboardCheck,
  Shield,
  UserShield: UserCheck,
  AlertTriangle,
  Lock,
};

export default function SafetyResources() {
  const [resources, setResources] = useState<SafetyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const response = await backend.safety.getSafetyResources();
      setResources(response.resources);
    } catch (error) {
      console.error("Failed to load safety resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const emergencyContacts = [
    { name: "Emergency Services", number: "999", description: "Police, Fire, Ambulance - for immediate emergencies" },
    { name: "Non-Emergency Police", number: "101", description: "For non-emergency police enquiries" },
    { name: "NHS Direct", number: "111", description: "For non-emergency medical advice" },
    { name: "National Domestic Abuse Helpline", number: "0808 2000 247", description: "24-hour freephone helpline" },
    { name: "Samaritans", number: "116 123", description: "Emotional support - available 24/7" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <TopNav />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="space-y-3 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <TopNav />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Safety Resources</h1>
              <p className="text-muted-foreground">
                Your safety is our priority. Find tips and resources for safe appointments.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Banner */}
        <Card className="p-6 mb-8 bg-red-50 border-red-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Phone className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-800 mb-2">Emergency Contacts</h2>
              <p className="text-red-700 mb-4 text-sm">
                If you're in immediate danger, always call 999 first.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact.number}
                    className="flex items-center justify-between p-3 bg-white rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.description}</p>
                    </div>
                    <a
                      href={`tel:${contact.number.replace(/\s/g, "")}`}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                    >
                      {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Braida Support */}
        <Card className="p-6 mb-8 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-orange-800 mb-2">Braida Support</h2>
              <p className="text-orange-700 mb-3">
                Our team is here to help with any safety concerns or issues.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="text-sm">
                  <p className="font-medium">Phone:</p>
                  <a href="tel:+442012345678" className="text-orange-600 hover:underline">
                    +44 20 1234 5678
                  </a>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Email:</p>
                  <a href="mailto:support@braida.uk" className="text-orange-600 hover:underline">
                    support@braida.uk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Safety Resources */}
        <h2 className="text-2xl font-bold mb-4">Safety Guidelines</h2>
        <div className="space-y-4">
          {resources.map((resource) => {
            const Icon = iconMap[resource.iconName] || Shield;
            const isExpanded = expandedId === resource.id;

            return (
              <Card
                key={resource.id}
                className={`overflow-hidden transition-all ${
                  isExpanded ? "ring-2 ring-orange-200" : ""
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : resource.id)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Icon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t bg-gray-50">
                    <div
                      className="prose prose-sm max-w-none mt-4"
                      dangerouslySetInnerHTML={{
                        __html: resource.content
                          .replace(/##\s(.+)/g, "<h3 class='text-lg font-semibold mt-4 mb-2'>$1</h3>")
                          .replace(
                            /- (.+)/g,
                            "<li class='ml-4 list-disc text-gray-700'>$1</li>"
                          ),
                      }}
                    />

                    {resource.externalLinks && resource.externalLinks.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium mb-2">Helpful Resources:</p>
                        <div className="flex flex-wrap gap-2">
                          {resource.externalLinks.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-orange-600 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {link.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

