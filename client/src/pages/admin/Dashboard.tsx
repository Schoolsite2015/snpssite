import { useEffect, useState } from "react";
import { Users, Briefcase, UserPlus, CreditCard, ClipboardCheck, Bus, MessageSquare, Package, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, AreaChart, Area } from "recharts";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders } from "@/lib/auth";

interface Stats {
  totalStudents: number; totalStaff: number; pendingAdmissions: number;
  monthlyRevenue: number; todayAttendanceRate: number; totalBuses: number;
  unreadMessages: number; lowStockItems: number;
}

const statCards = [
  { key: "totalStudents", label: "Total Students", icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { key: "totalStaff", label: "Staff Members", icon: Briefcase, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
  { key: "pendingAdmissions", label: "Pending Admissions", icon: UserPlus, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { key: "monthlyRevenue", label: "Monthly Revenue", icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20", prefix: "₹" },
  { key: "todayAttendanceRate", label: "Today's Attendance", icon: ClipboardCheck, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20", suffix: "%" },
  { key: "totalBuses", label: "Active Buses", icon: Bus, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { key: "unreadMessages", label: "New Messages", icon: MessageSquare, color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-900/20" },
  { key: "lowStockItems", label: "Low Stock Alerts", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = authHeaders();
    Promise.all([
      fetch("/api/dashboard/stats", { headers }).then(r => r.json()),
      fetch("/api/dashboard/attendance-trend", { headers }).then(r => r.json()),
      fetch("/api/dashboard/revenue-chart", { headers }).then(r => r.json()),
    ]).then(([s, a, r]) => {
      setStats(s);
      setAttendance(a.slice(-14));
      setRevenue(r);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const fmtNum = (v: number, prefix?: string, suffix?: string) => {
    if (v === undefined || v === null) return "0";
    const s = prefix ? `${prefix}${v.toLocaleString("en-IN")}` : v.toLocaleString("en-IN");
    return suffix ? `${s}${suffix}` : s;
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's what's happening at S.N. Public School.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(card => (
            <Card key={card.key} className="relative" data-testid={`stat-${card.key}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                    {loading ? (
                      <Skeleton className="h-6 w-16" />
                    ) : (
                      <p className="text-xl font-bold">
                        {fmtNum(stats?.[card.key as keyof Stats] as number, card.prefix, card.suffix)}
                      </p>
                    )}
                  </div>
                  <div className={`${card.bg} rounded-lg p-2 flex-shrink-0`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Attendance Trend (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-48" /> : attendance.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No attendance data yet. Start marking attendance to see trends.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={attendance}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="present" name="Present" fill="hsl(215, 60%, 35%)" stroke="hsl(215, 60%, 35%)" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="absent" name="Absent" fill="hsl(0, 72%, 51%)" stroke="hsl(0, 72%, 51%)" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Fee Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-48" /> : revenue.length === 0 ? (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  No revenue data yet. Record fee payments to see charts.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(40, 85%, 52%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: "/admin/students", label: "Add Student", icon: Users, color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600" },
                { href: "/admin/admissions", label: "View Applications", icon: UserPlus, color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600" },
                { href: "/admin/attendance", label: "Mark Attendance", icon: ClipboardCheck, color: "bg-green-50 dark:bg-green-900/20 text-green-600" },
                { href: "/admin/fees", label: "Record Payment", icon: CreditCard, color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600" },
              ].map(item => (
                <a key={item.href} href={item.href} className={`flex flex-col items-center gap-2 p-4 rounded-lg ${item.color} cursor-pointer hover-elevate transition-all`} data-testid={`quick-action-${item.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">{item.label}</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
