import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders } from "@/lib/auth";

const COLORS = ["hsl(215, 60%, 35%)", "hsl(40, 85%, 52%)", "hsl(160, 55%, 40%)", "hsl(280, 60%, 55%)", "hsl(0, 72%, 51%)"];

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const h = authHeaders();
    Promise.all([
      fetch("/api/dashboard/stats", { headers: h }).then(r => r.json()),
      fetch("/api/dashboard/attendance-trend", { headers: h }).then(r => r.json()),
      fetch("/api/dashboard/revenue-chart", { headers: h }).then(r => r.json()),
    ]).then(([s, a, r]) => { setStats(s); setAttendance(a); setRevenue(r); }).finally(() => setLoading(false));
  }, []);

  const keyMetrics = stats ? [
    { label: "Total Students", value: stats.totalStudents, color: COLORS[0] },
    { label: "Total Staff", value: stats.totalStaff, color: COLORS[1] },
    { label: "Active Buses", value: stats.totalBuses, color: COLORS[2] },
    { label: "Pending Admissions", value: stats.pendingAdmissions, color: COLORS[3] },
  ] : [];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm">Data-driven insights for school management</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />) :
            keyMetrics.map(m => (
              <Card key={m.label} className="p-4 text-center" data-testid={`report-stat-${m.label.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.label}</div>
              </Card>
            ))
          }
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Attendance Trend</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-52" /> : attendance.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">Mark attendance to see trends</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={attendance}>
                    <defs>
                      <linearGradient id="present" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="present" name="Present" stroke={COLORS[0]} fill="url(#present)" />
                    <Area type="monotone" dataKey="absent" name="Absent" stroke={COLORS[4]} fill="none" strokeDasharray="3 3" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Fee Revenue by Month</CardTitle></CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-52" /> : revenue.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">Record payments to see revenue chart</div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                    <Bar dataKey="revenue" name="Revenue" fill={COLORS[1]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {stats && (
          <Card>
            <CardHeader><CardTitle className="text-base">School Overview Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Today's Attendance Rate", value: `${stats.todayAttendanceRate}%`, note: "of students present" },
                  { label: "Monthly Revenue", value: `₹${Number(stats.monthlyRevenue).toLocaleString("en-IN")}`, note: "fee collected this month" },
                  { label: "Unread Messages", value: stats.unreadMessages, note: "contact messages pending" },
                  { label: "Low Stock Items", value: stats.lowStockItems, note: "inventory items need attention" },
                ].map(m => (
                  <div key={m.label} className="bg-muted/40 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{m.value}</div>
                    <div className="text-xs font-medium mt-1">{m.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.note}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
