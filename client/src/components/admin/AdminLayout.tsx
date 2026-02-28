import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, UserPlus, ClipboardList, Calendar, BookOpen,
  CreditCard, Briefcase, TrendingUp, Package, Bus, BarChart2,
  Image, Newspaper, MessageSquare, LogOut, Menu, X, School,
  ChevronRight, Moon, Sun, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUser, logout } from "@/lib/auth";
import { useLocation as useWouterLocation } from "wouter";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

const navItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/admissions", label: "Admissions", icon: UserPlus },
  { href: "/admin/attendance", label: "Attendance", icon: ClipboardList },
  { href: "/admin/timetable", label: "Timetable", icon: Calendar },
  { href: "/admin/exams", label: "Exams & Marks", icon: BookOpen },
  { href: "/admin/fees", label: "Fee Management", icon: CreditCard },
  { href: "/admin/staff", label: "HR & Staff", icon: Briefcase },
  { href: "/admin/finance", label: "Finance", icon: TrendingUp },
  { href: "/admin/inventory", label: "Inventory", icon: Package },
  { href: "/admin/transport", label: "Transport", icon: Bus },
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/gallery", label: "Gallery", icon: Image },
  { href: "/admin/news", label: "News & Notices", icon: Newspaper },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [location, navigate] = useWouterLocation();
  const user = getUser();

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-60" : "w-0 overflow-hidden"} transition-all duration-300 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col shadow-xl`}>
        <div className="flex items-center gap-2 p-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <School className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold leading-tight whitespace-nowrap">S.N. Public School</div>
            <div className="text-xs text-sidebar-foreground/60 whitespace-nowrap">ERP Portal</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin py-2">
          {navItems.map(item => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 mx-2 px-3 py-2 rounded-md my-0.5 cursor-pointer transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"}`}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {item.badge && <Badge className="ml-auto text-xs bg-secondary text-secondary-foreground">{item.badge}</Badge>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="w-7 h-7">
              <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{user?.name?.slice(0, 2).toUpperCase() || "AD"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-medium truncate">{user?.name || "Admin"}</div>
              <div className="text-xs text-sidebar-foreground/60 capitalize truncate">{user?.role || "admin"}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/70 gap-2" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={() => setSidebarOpen(!sidebarOpen)} data-testid="button-toggle-sidebar">
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            <div className="text-sm text-muted-foreground hidden sm:flex items-center gap-1">
              <span>Admin</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground font-medium capitalize">{location.replace("/admin/", "")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={toggleDark} data-testid="button-toggle-theme">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link href="/" target="_blank">
              <Button size="sm" variant="outline" className="text-xs">View Website</Button>
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
