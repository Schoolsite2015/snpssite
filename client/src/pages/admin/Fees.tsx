import { useState, useEffect } from "react";
import { Plus, CreditCard, Search, Check, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function Fees() {
  const [payments, setPayments] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [paymentForm, setPaymentForm] = useState({ studentId: "", month: "", year: new Date().getFullYear(), amount: "", status: "paid", paymentMethod: "cash" });
  const [structureForm, setStructureForm] = useState({ class: "1", academicYear: "2026-27", tuitionFee: "", admissionFee: "", examFee: "", sportsFee: "", libraryFee: "" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchAll = () => {
    setLoading(true);
    const h = authHeaders();
    Promise.all([
      fetch("/api/fees/payments", { headers: h }).then(r => r.json()),
      fetch("/api/fees/structures", { headers: h }).then(r => r.json()),
      fetch("/api/fees/stats", { headers: h }).then(r => r.json()),
      fetch("/api/students", { headers: h }).then(r => r.json()),
    ]).then(([p, s, st, stu]) => { setPayments(p); setStructures(s); setStats(st); setStudents(stu); })
      .finally(() => setLoading(false));
  };
  useEffect(fetchAll, []);

  const savePayment = async () => {
    setSaving(true);
    try {
      await apiRequest("POST", "/api/fees/payments", { ...paymentForm, studentId: Number(paymentForm.studentId), year: Number(paymentForm.year), paidAt: new Date() });
      toast({ title: "Payment recorded" }); setShowPaymentModal(false); fetchAll();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const saveStructure = async () => {
    setSaving(true);
    try {
      await apiRequest("POST", "/api/fees/structures", structureForm);
      toast({ title: "Fee structure saved" }); setShowStructureModal(false); fetchAll();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const markPaid = async (id: number) => {
    try { await apiRequest("PUT", `/api/fees/payments/${id}`, { status: "paid", paidAt: new Date() }); toast({ title: "Marked as paid" }); fetchAll(); }
    catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Fee Management</h1>
            <p className="text-muted-foreground text-sm">Track fee collections and payment records</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowStructureModal(true)} className="gap-2">Fee Structure</Button>
            <Button onClick={() => setShowPaymentModal(true)} className="gap-2" data-testid="button-record-payment"><Plus className="w-4 h-4" /> Record Payment</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString("en-IN")}`, color: "text-green-600" },
            { label: "Monthly Revenue", value: `₹${(stats?.monthlyRevenue || 0).toLocaleString("en-IN")}`, color: "text-blue-600" },
            { label: "Pending Amount", value: `₹${(stats?.pendingAmount || 0).toLocaleString("en-IN")}`, color: "text-red-600" },
          ].map(s => (
            <Card key={s.label} className="p-4 text-center" data-testid={`stat-${s.label.toLowerCase().replace(/\s/g, "-")}`}>
              <div className={`text-xl font-bold ${s.color}`}>{loading ? "—" : s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Payment Records</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    {["Student", "Month", "Year", "Amount", "Method", "Status", "Actions"].map(h =>
                      <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground">{h}</th>
                    )}
                  </tr></thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/40" data-testid={`row-payment-${p.id}`}>
                        <td className="py-2 px-3 font-medium">{p.student?.name || "—"}</td>
                        <td className="py-2 px-3">{p.month}</td>
                        <td className="py-2 px-3">{p.year}</td>
                        <td className="py-2 px-3 font-semibold text-green-700">₹{Number(p.amount).toLocaleString("en-IN")}</td>
                        <td className="py-2 px-3 capitalize">{p.paymentMethod || "—"}</td>
                        <td className="py-2 px-3">
                          <Badge className={p.status === "paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>{p.status}</Badge>
                        </td>
                        <td className="py-2 px-3">
                          {p.status !== "paid" && (
                            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => markPaid(p.id)}><Check className="w-3 h-3" /> Mark Paid</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length === 0 && <div className="text-center py-10 text-muted-foreground">No payment records yet.</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Fee Payment</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Student</Label>
              <Select onValueChange={v => setPaymentForm({ ...paymentForm, studentId: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name} — Class {s.class}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Month</Label>
                <Select onValueChange={v => setPaymentForm({ ...paymentForm, month: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Month" /></SelectTrigger>
                  <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Input type="number" value={paymentForm.year} onChange={e => setPaymentForm({ ...paymentForm, year: Number(e.target.value) })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="mt-1" placeholder="e.g. 1500" data-testid="input-payment-amount" />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select defaultValue="cash" onValueChange={v => setPaymentForm({ ...paymentForm, paymentMethod: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="online">Online Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={savePayment} disabled={saving} data-testid="button-save-payment">{saving ? "Saving..." : "Record Payment"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showStructureModal} onOpenChange={setShowStructureModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Set Fee Structure</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Class</Label>
                <Select value={structureForm.class} onValueChange={v => setStructureForm({ ...structureForm, class: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Academic Year</Label>
                <Input value={structureForm.academicYear} onChange={e => setStructureForm({ ...structureForm, academicYear: e.target.value })} className="mt-1" />
              </div>
            </div>
            {[
              { label: "Tuition Fee (₹)", key: "tuitionFee" },
              { label: "Admission Fee (₹)", key: "admissionFee" },
              { label: "Exam Fee (₹)", key: "examFee" },
              { label: "Sports Fee (₹)", key: "sportsFee" },
              { label: "Library Fee (₹)", key: "libraryFee" },
            ].map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input type="number" value={(structureForm as any)[f.key]} onChange={e => setStructureForm({ ...structureForm, [f.key]: e.target.value })} className="mt-1" />
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowStructureModal(false)}>Cancel</Button>
            <Button onClick={saveStructure} disabled={saving}>{saving ? "Saving..." : "Save Structure"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
