import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Tutors from "./pages/Tutors";
import TutorProfile from "./pages/TutorProfile";
import Auth from "./pages/Auth";
import TutorAuth from "./pages/TutorAuth";
import Bookings from "./pages/Bookings";
import TutorDashboard from "./pages/TutorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import TutorMyProfile from "./pages/TutorMyProfile";
import TutorAvailability from "./pages/TutorAvailability";
import TutorImages from "./pages/TutorImages";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import BecomeTutor from "./pages/BecomeTutor";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tutors" element={<Tutors />} />
            <Route path="/tutor/:slug" element={<TutorProfile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/tutor" element={<TutorAuth />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/tutor-dashboard" element={<TutorDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student-profile" element={<StudentProfile />} />
            <Route path="/payments" element={<PaymentHistoryPage />} />
            <Route path="/become-tutor" element={<BecomeTutor />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/tutor/profile" element={<TutorMyProfile />} />
            <Route path="/tutor/availability" element={<TutorAvailability />} />
            <Route path="/tutor/images" element={<TutorImages />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
