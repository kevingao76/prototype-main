import SignUpReceiver from './pages/SignUpReceiver';
import Login from './pages/LoginPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ServiceProviderDashboard from './pages/ServiceProviderDashboard';
import ServiceReceiverDashboard from './pages/ServiceReceiverDashboard';
import React from 'react';
import { AuthProvider } from './components/AuthContext';
import BrowseServicesReceiver from "./pages/BrowseServicesReceiver";
import Home from "./pages/Home";
import Imprint from "./pages/Imprint";
import SignUpProvider from "./pages/SignUpProvider";
import PlannedAppointmentsServiceReceiverPage from "./pages/PlannedAppointmentsReceiver";
import PendingInquiriesServiceReceiverPage from "./pages/InquiriesServiceReceiverPage";
import InquiriesServiceProviderPage from "./pages/InquiriesServiceProviderPage";
import NotificationsServiceReceiverPage from "./pages/NotificationsServiceReceiverPage";
import ProfileManagementServiceReceiverPage from "./pages/ProfileManagementServiceReceiverPage";
import ProfileManagementServiceProviderPage from "./pages/ProfileManagementServiceProviderPage";
import PaintingProviderOverview from "./pages/Services/ServiceProviderOverviewPage";
import ProtectedRoute from './components/ProtectedRoute';
import Error404 from './pages/Error404Page';
import BrowseServices from "./components/Services/BrowseServices";
import ServiceDetailPage from "./pages/ServiceDetailPage";
import ServiceProviderOverviewPage from "./pages/Services/ServiceProviderOverviewPage";
import CraftsmanDetailPage from "./pages/Services/CraftsmanDetailPage";
import EmailVerification from "./pages/EmailVerification";
import Calendar from "./pages/PlannedAppointmentsProvider";
import ProfileView from './pages/ViewProfile';
import BlogReceiver from './pages/BlogReceiverPage';
import BlogProvider from './pages/BlogProviderPage';
import NotificationsServiceProviderPage from "./pages/NotificationsServiceProviderPage";

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<SignUpReceiver />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signupProvider" element={<SignUpProvider />} />
            <Route path="/serviceReceiver/yourInquiries" element={<ProtectedRoute><PendingInquiriesServiceReceiverPage /></ProtectedRoute>} />
            <Route path="/serviceProvider/yourInquiries" element={<ProtectedRoute><InquiriesServiceProviderPage /></ProtectedRoute>} />
            <Route path="/serviceReceiver/plannedAppointments" element={<ProtectedRoute><PlannedAppointmentsServiceReceiverPage /></ProtectedRoute>} />
            <Route path="/serviceReceiver/notifications" element={<ProtectedRoute><NotificationsServiceReceiverPage /></ProtectedRoute>} />
            <Route path="/serviceProvider/notifications" element={<ProtectedRoute><NotificationsServiceProviderPage /></ProtectedRoute>} />
            <Route path="/serviceReceiver/profilemanagement" element={<ProtectedRoute><ProfileManagementServiceReceiverPage /></ProtectedRoute>} />
            <Route path="/serviceProvider/profilemanagement" element={<ProtectedRoute><ProfileManagementServiceProviderPage /></ProtectedRoute>} />
            <Route path="/serviceReceiver/dashboard" element={<ProtectedRoute><ServiceReceiverDashboard /></ProtectedRoute>} />
            <Route path="/serviceProvider/dashboard" element={<ProtectedRoute><ServiceProviderDashboard /></ProtectedRoute>} />
            <Route path="/serviceReceiver/browseServices" element={<ProtectedRoute><BrowseServicesReceiver /></ProtectedRoute>} />
            <Route path="/serviceProvider/plannedAppointments" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/imprint" element={<Imprint />} />
            <Route path="/paintingprovider" element={<ProtectedRoute><PaintingProviderOverview /></ProtectedRoute>} />
            <Route path="/craftsman/:id" element={<CraftsmanDetailPage />} />
            <Route path='*' element={<Error404 />} />
            <Route path="/service-details/:title" element={<ServiceDetailPage />} />
            <Route path="/services" element={<BrowseServices />} />
            <Route path="/serviceReceiver/blog" element={<ProtectedRoute><BlogReceiver /></ProtectedRoute>} />
            <Route path="/serviceProvider/blog" element={<ProtectedRoute><BlogProvider /></ProtectedRoute>} />
            <Route path="/service-provider-overview/:title" element={<ServiceProviderOverviewPage />} />
            <Route path="/viewProfile/:id" element={<ProfileView />} />
            <Route path="/api/auth/verify-email" element={<EmailVerification />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
  );
}

export default App;
