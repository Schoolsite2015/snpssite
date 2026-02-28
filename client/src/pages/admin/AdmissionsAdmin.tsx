import { useState, useEffect } from "react";
import { Check, X, UserPlus, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Admission } from "@shared/schema";

export default function AdmissionsAdmin() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Admission | null>(null);
  const [tab, setTab] = useState("pending");
  const { toast } = useToast();

  const fetch_ = () => {
    setLoading(true);
    fetch("/api/admissions", { headers: authHeaders() })
      .then(r => r.json()).then(setAdmissions).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(fetch_, []);

  const filtered = admissions.filter(a => tab === "all" || a.status === tab);

  const approve = async (id: number) => {
    try { await apiRequest("POST", `/api/admissions/${id}/approve`); toast({ title: "Application approved" }); fetch_(); }
    catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  const reject = async (id: number) => {
    try { await apiRequest("POST", `/api/admissions/${id}/reject`, { remarks: "Application rejected by admin" }); toast({ title: "Application rejected" }); fetch_(); }
    catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  const convert = async (id: number, name: string) => {
    if (!confirm(`Convert ${name}'s application to a student profile?`)) return;
    try {
      await apiRequest("POST", `/api/admissions/${id}/convert`);
      toast({ title: "Converted!", description: `${name} is now registered as a student.` });
      fetch_();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  const statusColor = (s: string) => ({ pending: "bg-amber-100 text-amber-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" }[s] || "");

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admissions & Enrollment</h1>
            <p className="text-muted-foreground text-sm">Manage online admission applications</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetch_} className="gap-2"><RefreshCw className="w-4 h-4" /> Refresh</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {["pending", "approved", "rejected"].map(s => (
            <Card key={s} className="p-4 text-center">
              <div className="text-2xl font-bold">{admissions.filter(a => a.status === s).length}</div>
              <div className="text-sm capitalize text-muted-foreground">{s}</div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-0">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? <Skeleton className="h-48" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    {["Student", "Class", "Father", "Phone", "Date", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id} className="border-b border-border last:border-0 hover:bg-muted/40" data-testid={`row-admission-${a.id}`}>
                        <td className="py-2 px-3 font-medium">{a.studentName}</td>
                        <td className="py-2 px-3">Class {a.classApplying}</td>
                        <td className="py-2 px-3 text-muted-foreground">{a.fatherName}</td>
                        <td className="py-2 px-3">{a.phone}</td>
                        <td className="py-2 px-3 text-xs text-muted-foreground">{new Date(a.createdAt!).toLocaleDateString("en-IN")}</td>
                        <td className="py-2 px-3"><Badge className={statusColor(a.status)}>{a.status}</Badge></td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => setSelected(a)} title="View details" data-testid={`button-view-admission-${a.id}`}><Eye className="w-3.5 h-3.5" /></Button>
                            {a.status === "pending" && <>
                              <Button size="icon" variant="ghost" className="text-green-600" onClick={() => approve(a.id)} title="Approve" data-testid={`button-approve-${a.id}`}><Check className="w-3.5 h-3.5" /></Button>
                              <Button size="icon" variant="ghost" className="text-destructive" onClick={() => reject(a.id)} title="Reject" data-testid={`button-reject-${a.id}`}><X className="w-3.5 h-3.5" /></Button>
                            </>}
                            {a.status === "approved" && !a.convertedStudentId && (
                              <Button size="sm" variant="outline" onClick={() => convert(a.id, a.studentName)} data-testid={`button-convert-${a.id}`} className="text-xs gap-1">
                                <UserPlus className="w-3 h-3" /> Enroll
                              </Button>
                            )}
                            {a.convertedStudentId && <Badge className="text-xs bg-blue-100 text-blue-700">Enrolled</Badge>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filtered.length === 0 && <div className="text-center py-10 text-muted-foreground">No {tab} applications found.</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selected && (
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Application Details</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Student Name", selected.studentName], ["Date of Birth", selected.dob],
                ["Gender", selected.gender], ["Class Applied", `Class ${selected.classApplying}`],
                ["Father's Name", selected.fatherName], ["Mother's Name", selected.motherName],
                ["Phone", selected.phone], ["Email", selected.email || "—"],
                ["Address", selected.address], ["Status", selected.status],
                ["Applied On", new Date(selected.createdAt!).toLocaleDateString("en-IN")],
                ...(selected.remarks ? [["Remarks", selected.remarks]] : []),
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div className="text-xs text-muted-foreground">{k}</div>
                  <div className="font-medium capitalize">{v as string}</div>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              {selected.status === "pending" && <>
                <Button variant="destructive" onClick={() => { reject(selected.id); setSelected(null); }}>Reject</Button>
                <Button onClick={() => { approve(selected.id); setSelected(null); }}>Approve</Button>
              </>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
