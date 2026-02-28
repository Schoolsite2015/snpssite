import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Briefcase, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Staff } from "@shared/schema";

const emptyStaff = { employeeId: "", name: "", designation: "", department: "", phone: "", email: "", address: "", salary: "", joiningDate: "", isActive: true };

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Staff | null>(null);
  const [form, setForm] = useState(emptyStaff);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchStaff = () => {
    setLoading(true);
    fetch(`/api/staff?search=${search}`, { headers: authHeaders() })
      .then(r => r.json()).then(setStaff).finally(() => setLoading(false));
  };
  useEffect(fetchStaff, [search]);

  const openAdd = () => { setEditItem(null); setForm({ ...emptyStaff, employeeId: `EMP${String(Date.now()).slice(-4)}` }); setShowModal(true); };
  const openEdit = (s: Staff) => { setEditItem(s); setForm(s as any); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) { await apiRequest("PUT", `/api/staff/${editItem.id}`, form); toast({ title: "Staff updated" }); }
      else { await apiRequest("POST", "/api/staff", form); toast({ title: "Staff added" }); }
      setShowModal(false); fetchStaff();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this staff member?")) return;
    try { await apiRequest("DELETE", `/api/staff/${id}`); toast({ title: "Staff deleted" }); fetchStaff(); }
    catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  const totalPayroll = staff.reduce((sum, s) => sum + Number(s.salary), 0);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">HR & Staff Management</h1>
            <p className="text-muted-foreground text-sm">Manage teachers, staff and employees</p>
          </div>
          <Button onClick={openAdd} className="gap-2" data-testid="button-add-staff"><Plus className="w-4 h-4" /> Add Staff</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{staff.length}</div>
            <div className="text-xs text-muted-foreground">Total Staff</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold">{staff.filter(s => s.isActive).length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">₹{totalPayroll.toLocaleString("en-IN")}</div>
            <div className="text-xs text-muted-foreground">Monthly Payroll</div>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="relative max-w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-staff" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48" /> : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staff.map(s => (
                  <Card key={s.id} className="p-4" data-testid={`card-staff-${s.id}`}>
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">{s.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="font-semibold truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.designation}</div>
                        <div className="text-xs text-muted-foreground">{s.department}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <IndianRupee className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-green-600">{Number(s.salary).toLocaleString("en-IN")}/mo</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-muted-foreground">{s.phone}</div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Edit className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                    <Badge className={`mt-2 text-xs ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {s.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </Card>
                ))}
                {staff.length === 0 && <div className="col-span-3 text-center py-10 text-muted-foreground">No staff found.</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "Edit Staff" : "Add Staff Member"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Employee ID *", key: "employeeId" }, { label: "Full Name *", key: "name" },
              { label: "Designation *", key: "designation" }, { label: "Department *", key: "department" },
              { label: "Phone *", key: "phone" }, { label: "Email", key: "email" },
              { label: "Salary (₹/month) *", key: "salary" }, { label: "Joining Date *", key: "joiningDate", type: "date" },
            ].map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input className="mt-1" type={f.type || "text"} value={(form as any)[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div className="col-span-2">
              <Label>Address</Label>
              <Input className="mt-1" value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
