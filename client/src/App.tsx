import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAuthenticated } from "@/lib/auth";
import NotFound from "@/pages/not-found";

import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Admissions from "@/pages/public/Admissions";
import Gallery from "@/pages/public/Gallery";
import Contact from "@/pages/public/Contact";

import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Students from "@/pages/admin/Students";
import AdmissionsAdmin from "@/pages/admin/AdmissionsAdmin";
import Attendance from "@/pages/admin/Attendance";
import Timetable from "@/pages/admin/Timetable";
import Exams from "@/pages/admin/Exams";
import Fees from "@/pages/admin/Fees";
import Staff from "@/pages/admin/Staff";
import Finance from "@/pages/admin/Finance";
import Inventory from "@/pages/admin/Inventory";
import Transport from "@/pages/admin/Transport";
import Reports from "@/pages/admin/Reports";
import GalleryAdmin from "@/pages/admin/GalleryAdmin";
import NewsAdmin from "@/pages/admin/NewsAdmin";
import Messages from "@/pages/admin/Messages";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!isAuthenticated()) return <Redirect to="/admin" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/admissions" component={Admissions} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/contact" component={Contact} />

      <Route path="/admin" component={Login} />
      <Route path="/admin/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/admin/students" component={() => <ProtectedRoute component={Students} />} />
      <Route path="/admin/admissions" component={() => <ProtectedRoute component={AdmissionsAdmin} />} />
      <Route path="/admin/attendance" component={() => <ProtectedRoute component={Attendance} />} />
      <Route path="/admin/timetable" component={() => <ProtectedRoute component={Timetable} />} />
      <Route path="/admin/exams" component={() => <ProtectedRoute component={Exams} />} />
      <Route path="/admin/fees" component={() => <ProtectedRoute component={Fees} />} />
      <Route path="/admin/staff" component={() => <ProtectedRoute component={Staff} />} />
      <Route path="/admin/finance" component={() => <ProtectedRoute component={Finance} />} />
      <Route path="/admin/inventory" component={() => <ProtectedRoute component={Inventory} />} />
      <Route path="/admin/transport" component={() => <ProtectedRoute component={Transport} />} />
      <Route path="/admin/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route path="/admin/gallery" component={() => <ProtectedRoute component={GalleryAdmin} />} />
      <Route path="/admin/news" component={() => <ProtectedRoute component={NewsAdmin} />} />
      <Route path="/admin/messages" component={() => <ProtectedRoute component={Messages} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
