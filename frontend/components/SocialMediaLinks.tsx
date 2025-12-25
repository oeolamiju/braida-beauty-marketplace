import { Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

export default function SocialMediaLinks() {
  const { settings } = usePlatformSettings();

  const links = [
    { Icon: Facebook, url: settings?.socialMedia.facebookUrl, label: "Facebook" },
    { Icon: Instagram, url: settings?.socialMedia.instagramUrl, label: "Instagram" },
    { Icon: Twitter, url: settings?.socialMedia.twitterUrl, label: "Twitter" },
    { Icon: Linkedin, url: settings?.socialMedia.linkedinUrl, label: "LinkedIn" },
    { Icon: Youtube, url: settings?.socialMedia.youtubeUrl, label: "YouTube" },
  ];

  const validLinks = links.filter(link => link.url);

  if (validLinks.length === 0) return null;

  return (
    <div className="flex items-center gap-4">
      {validLinks.map(({ Icon, url, label }) => (
        <a
          key={label}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-primary transition-colors"
          aria-label={label}
        >
          <Icon className="h-5 w-5" />
        </a>
      ))}
    </div>
  );
}
