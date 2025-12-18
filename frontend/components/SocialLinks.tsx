import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

interface SocialLinksProps {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  className?: string;
}

export default function SocialLinks({
  twitter = "#",
  instagram = "#",
  facebook = "#",
  linkedin = "#",
  tiktok = "#",
  className = "flex gap-6",
}: SocialLinksProps) {
  return (
    <div className={className}>
      {twitter && (
        <a
          href={twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-orange-600 transition-colors"
          aria-label="Twitter"
        >
          <Twitter className="h-5 w-5" />
        </a>
      )}
      {instagram && (
        <a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-orange-600 transition-colors"
          aria-label="Instagram"
        >
          <Instagram className="h-5 w-5" />
        </a>
      )}
      {facebook && (
        <a
          href={facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-orange-600 transition-colors"
          aria-label="Facebook"
        >
          <Facebook className="h-5 w-5" />
        </a>
      )}
      {linkedin && (
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-orange-600 transition-colors"
          aria-label="LinkedIn"
        >
          <Linkedin className="h-5 w-5" />
        </a>
      )}
      {tiktok && (
        <a
          href={tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-orange-600 transition-colors"
          aria-label="TikTok"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        </a>
      )}
    </div>
  );
}
