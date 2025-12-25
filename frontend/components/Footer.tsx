import { Link } from "react-router-dom";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import SocialMediaLinks from "./SocialMediaLinks";
import { BraidaLogoLight } from "./BraidaLogo";

export default function Footer() {
  const { settings } = usePlatformSettings();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <BraidaLogoLight size="sm" />
            <p className="mt-4 text-sm">
              Connecting clients with verified beauty professionals across the UK.
            </p>
            <div className="mt-4">
              <SocialMediaLinks />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">For Professionals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/become-freelancer" className="hover:text-white transition-colors">Become a Pro</Link></li>
              <li><Link to="/business-tools" className="hover:text-white transition-colors">Business Tools</Link></li>
              <li><Link to="/success-stories" className="hover:text-white transition-colors">Success Stories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Legal & Safety</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/safety" className="hover:text-white transition-colors">Safety Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>© 2025 Braida Ltd. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {settings?.support.email && (
                <a href={`mailto:${settings.support.email}`} className="hover:text-white transition-colors">
                  {settings.support.email}
                </a>
              )}
              {settings?.support.businessHours && (
                <span className="text-gray-500">{settings.support.businessHours}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
