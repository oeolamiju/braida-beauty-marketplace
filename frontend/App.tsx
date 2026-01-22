import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "./contexts/NotificationContext";
import LandingPage from "./pages/LandingPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import RegisterPage from "./pages/auth/RegisterPage";
import RegisterClientPage from "./pages/auth/RegisterClientPage";
import RegisterFreelancerPage from "./pages/auth/RegisterFreelancerPage";
import LoginPage from "./pages/auth/LoginPage";
import VerifyPage from "./pages/auth/VerifyPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import ClientLayout from "./layouts/ClientLayout";
import FreelancerLayout from "./layouts/FreelancerLayout";
import AdminLayout from "./layouts/AdminLayout";
import ClientDiscover from "./pages/client/Discover";
import ClientBookings from "./pages/client/Bookings";
import ClientProfile from "./pages/client/Profile";
import FreelancerDashboard from "./pages/freelancer/Dashboard";
import FreelancerBookings from "./pages/freelancer/Bookings";
import FreelancerServices from "./pages/freelancer/Services";
import FreelancerProfile from "./pages/freelancer/Profile";
import ServiceNew from "./pages/freelancer/ServiceNew";
import ServiceEdit from "./pages/freelancer/ServiceEdit";
import ServiceDetail from "./pages/ServiceDetail";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminListings from "./pages/admin/Listings";
import AdminBookings from "./pages/admin/Bookings";
import AdminBookingDetail from "./pages/admin/BookingDetail";
import AdminSettings from "./pages/admin/Settings";
import AdminDisputes from "./pages/admin/Disputes";
import AdminDisputeDetail from "./pages/admin/DisputeDetail";
import DisputeManagement from "./pages/admin/DisputeManagement";
import UserManagement from "./pages/admin/UserManagement";
import AdminReports from "./pages/admin/Reports";
import AdminVerifications from "./pages/admin/Verifications";
import VerificationsList from "./pages/admin/VerificationsList";
import VerificationDetail from "./pages/admin/VerificationDetail";
import FreelancerVerification from "./pages/freelancer/Verification";
import FreelancerAvailability from "./pages/freelancer/Availability";
import FreelancerPublicProfile from "./pages/FreelancerPublicProfile";
import ClientStyles from "./pages/client/Styles";
import ClientStyleDetail from "./pages/client/StyleDetail";
import ClientBookingDetail from "./pages/client/BookingDetail";
import FreelancerBookingDetail from "./pages/freelancer/BookingDetail";
import AdminStyles from "./pages/admin/Styles";
import PublicDiscover from "./pages/public/Discover";
import Categories from "./pages/public/Categories";
import CategoryStyles from "./pages/public/CategoryStyles";
import PublicStyleDetail from "./pages/public/StyleDetail";
import StyleCatalogue from "./pages/public/StyleCatalogue";
import NotificationSettings from "./pages/NotificationSettings";
import PolicySettings from "./pages/admin/PolicySettings";
import FreelancerEarnings from "./pages/freelancer/Earnings";
import FreelancerPayoutSetup from "./pages/freelancer/PayoutSetup";
import FreelancerPackages from "./pages/freelancer/Packages";
import AdminPaymentSettings from "./pages/admin/PaymentSettings";
import AdminPayouts from "./pages/admin/Payouts";
import AdminPayoutDetail from "./pages/admin/PayoutDetail";
import AdminReviews from "./pages/admin/Reviews";
import KPIDashboard from "./pages/admin/KPIDashboard";
import AboutPage from "./pages/AboutPage";
import CareersPage from "./pages/CareersPage";
import BlogPage from "./pages/BlogPage";
import ContactPage from "./pages/ContactPage";
import HelpCenterPage from "./pages/HelpCenterPage";
import SafetyPage from "./pages/SafetyPage";
import SafetyResources from "./pages/public/SafetyResources";
import FreelancerCalendar from "./pages/freelancer/Calendar";
import DisputeDashboard from "./pages/admin/DisputeDashboard";
import NotificationCenter from "./pages/NotificationCenter";
import NotificationPreferences from "./pages/NotificationPreferences";
import CityAnalytics from "./pages/admin/CityAnalytics";
import Messages from "./pages/Messages";
import ClientFavorites from "./pages/client/Favorites";
import ClientReferrals from "./pages/client/Referrals";
import ClientLoyalty from "./pages/client/Loyalty";
import BookPackage from "./pages/client/BookPackage";
import BecomeFreelancerPage from "./pages/BecomeFreelancerPage";
import BusinessTools from "./pages/BusinessTools";
import SuccessStories from "./pages/SuccessStories";
import Community from "./pages/Community";
import AdminCoupons from "./pages/admin/Coupons";
import ContentManagement from "./pages/admin/ContentManagement";
import ContentEditor from "./pages/admin/ContentEditor";
import FAQManagement from "./pages/admin/FAQManagement";
import SafetyResourcesManagement from "./pages/admin/SafetyResourcesManagement";
import PlatformSettings from "./pages/admin/PlatformSettings";
import AdminPortal from "./pages/admin/AdminPortal";
import TreatmentGuidePage from "./pages/TreatmentGuidePage";
import GlossaryPage from "./pages/GlossaryPage";
import Shop from "./pages/public/Shop";
import ProductDetail from "./pages/public/ProductDetail";
import AdminProducts from "./pages/admin/Products";

export default function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/safety" element={<SafetyPage />} />
          <Route path="/safety/resources" element={<SafetyResources />} />
          <Route path="/business-tools" element={<BusinessTools />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/community" element={<Community />} />
          <Route path="/treatment-guide" element={<TreatmentGuidePage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetail />} />

          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/register/client" element={<RegisterClientPage />} />
          <Route path="/auth/register/freelancer" element={<RegisterFreelancerPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/verify" element={<VerifyPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          
          {/* Become Freelancer (role upgrade flow) */}
          <Route path="/become-freelancer" element={<BecomeFreelancerPage />} />

          <Route path="/discover" element={<PublicDiscover />} />
          <Route path="/styles" element={<Categories />} />
          <Route path="/styles/catalogue" element={<StyleCatalogue />} />
          <Route path="/styles/category/:category" element={<CategoryStyles />} />
          <Route path="/styles/:styleId" element={<PublicStyleDetail />} />
          <Route path="/freelancers/:userId" element={<FreelancerPublicProfile />} />
          <Route path="/services/:id" element={<ServiceDetail />} />

          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<Navigate to="/client/discover" replace />} />
            <Route path="discover" element={<ClientDiscover />} />
            <Route path="bookings" element={<ClientBookings />} />
            <Route path="bookings/:id" element={<ClientBookingDetail />} />
            <Route path="profile" element={<ClientProfile />} />
            <Route path="styles" element={<ClientStyles />} />
            <Route path="styles/:styleId" element={<ClientStyleDetail />} />
            <Route path="services/:id" element={<ServiceDetail />} />
            <Route path="favorites" element={<ClientFavorites />} />
            <Route path="referrals" element={<ClientReferrals />} />
            <Route path="loyalty" element={<ClientLoyalty />} />
            <Route path="packages/:packageId" element={<BookPackage />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:conversationId" element={<Messages />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shop/:id" element={<ProductDetail />} />
            <Route path="freelancers" element={<PublicDiscover />} />
            <Route path="freelancers/:userId" element={<FreelancerPublicProfile />} />
          </Route>

          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/notifications/settings" element={<NotificationPreferences />} />

          <Route path="/freelancer" element={<FreelancerLayout />}>
            <Route index element={<Navigate to="/freelancer/dashboard" replace />} />
            <Route path="dashboard" element={<FreelancerDashboard />} />
            <Route path="bookings" element={<FreelancerBookings />} />
            <Route path="bookings/:id" element={<FreelancerBookingDetail />} />
            <Route path="services" element={<FreelancerServices />} />
            <Route path="services/new" element={<ServiceNew />} />
            <Route path="services/:id/edit" element={<ServiceEdit />} />
            <Route path="availability" element={<FreelancerAvailability />} />
            <Route path="calendar" element={<FreelancerCalendar />} />
            <Route path="profile" element={<FreelancerProfile />} />
            <Route path="verification" element={<FreelancerVerification />} />
            <Route path="earnings" element={<FreelancerEarnings />} />
            <Route path="payout-setup" element={<FreelancerPayoutSetup />} />
            <Route path="packages" element={<FreelancerPackages />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:conversationId" element={<Messages />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="shop" element={<Shop />} />
            <Route path="shop/:id" element={<ProductDetail />} />
            <Route path="freelancers" element={<PublicDiscover />} />
            <Route path="freelancers/:userId" element={<FreelancerPublicProfile />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/portal" replace />} />
            <Route path="portal" element={<AdminPortal />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="kpis" element={<KPIDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bookings/:bookingId" element={<AdminBookingDetail />} />
            <Route path="disputes" element={<AdminDisputes />} />
            <Route path="dispute-management" element={<DisputeManagement />} />
            <Route path="dispute-dashboard" element={<DisputeDashboard />} />
            <Route path="disputes/:id" element={<AdminDisputeDetail />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="verifications" element={<VerificationsList />} />
            <Route path="verifications/:freelancerId" element={<VerificationDetail />} />
            <Route path="styles" element={<AdminStyles />} />
            <Route path="payouts" element={<AdminPayouts />} />
            <Route path="payouts/:id" element={<AdminPayoutDetail />} />
            <Route path="settings" element={<PlatformSettings />} />
            <Route path="settings/policies" element={<PolicySettings />} />
            <Route path="settings/payments" element={<AdminPaymentSettings />} />
            <Route path="analytics/cities" element={<CityAnalytics />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="content" element={<ContentManagement />} />
            <Route path="content/new" element={<ContentEditor />} />
            <Route path="content/:id/edit" element={<ContentEditor />} />
            <Route path="faqs" element={<FAQManagement />} />
            <Route path="safety-resources" element={<SafetyResourcesManagement />} />
            <Route path="products" element={<AdminProducts />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </NotificationProvider>
  );
}
