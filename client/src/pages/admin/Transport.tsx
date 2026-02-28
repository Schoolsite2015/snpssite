import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Bus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const emptyBus = { busNumber: "", routeName: "", driverName: "", driverPhone: "", capacity: 40, currentPassengers: 0, isActive: true };

export default function Transport() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState(emptyBus);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchBuses = () => {
    setLoading(true);
    fetch("/api/transport/buses", { headers: authHeaders() })
      .then(r => r.json()).then(setBuses).finally(() => setLoading(false));
  };
  useEffect(fetchBuses, []);

  const openAdd = () => { setEditItem(null); setForm(emptyBus); setShowModal(true); };
  const openEdit = (b: any) => { setEditItem(b); setForm(b); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) { await apiRequest("PUT", `/api/transport/buses/${editItem.id}`, form); toast({ title: "Bus updated" }); }
      else { await apiRequest("POST", "/api/transport/buses", form); toast({ title: "Bus added" }); }
      setShowModal(false); fetchBuses();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Remove this bus?")) return;
    try { await apiRequest("DELETE", `/api/transport/buses/${id}`); fetchBuses(); }
    catch {}
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Transport Management</h1>
            <p className="text-muted-foreground text-sm">Manage school buses, routes and drivers</p>
          </div>
          <Button onClick={openAdd} className="gap-2" data-testid="button-add-bus"><Plus className="w-4 h-4" /> Add Bus</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center"><div className="text-2xl font-bold">{buses.length}</div><div className="text-xs text-muted-foreground">Total Buses</div></Card>
          <Card className="p-4 text-center"><div className="text-2xl font-bold">{buses.filter(b => b.isActive).length}</div><div className="text-xs text-muted-foreground">Active</div></Card>
          <Card className="p-4 text-center"><div className="text-2xl font-bold">{buses.reduce((s, b) => s + b.currentPassengers, 0)}</div><div className="text-xs text-muted-foreground">Total Students on Buses</div></Card>
        </div>

        {loading ? <Skeleton className="h-48" /> : (
          <div className="grid md:grid-cols-2 gap-4">
            {buses.map(bus => (
              <Card key={bus.id} className="p-5" data-testid={`card-bus-${bus.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold">{bus.busNumber}</div>
                      <div className="text-sm text-muted-foreground">{bus.routeName}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(bus)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(bus.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Driver: </span>{bus.driverName}</div>
                  <div><span className="text-muted-foreground">Phone: </span>{bus.driverPhone}</div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{bus.currentPassengers}/{bus.capacity} passengers</span>
                  </div>
                  <div><Badge className={bus.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>{bus.isActive ? "Active" : "Inactive"}</Badge></div>
                </div>
                <div className="mt-3 bg-muted rounded-full h-2">
                  <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${Math.min((bus.currentPassengers / bus.capacity) * 100, 100)}%` }} />
                </div>
              </Card>
            ))}
            {buses.length === 0 && <div className="col-span-2 text-center py-10 text-muted-foreground">No buses added yet.</div>}
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Bus" : "Add Bus"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Bus Number *</Label><Input className="mt-1" value={form.busNumber} onChange={e => setForm({ ...form, busNumber: e.target.value })} placeholder="UP65 AB 1234" /></div>
            <div className="col-span-2"><Label>Route Name *</Label><Input className="mt-1" value={form.routeName} onChange={e => setForm({ ...form, routeName: e.target.value })} placeholder="e.g. Varanasi City Route" /></div>
            <div><Label>Driver Name *</Label><Input className="mt-1" value={form.driverName} onChange={e => setForm({ ...form, driverName: e.target.value })} /></div>
            <div><Label>Driver Phone *</Label><Input className="mt-1" value={form.driverPhone} onChange={e => setForm({ ...form, driverPhone: e.target.value })} /></div>
            <div><Label>Capacity</Label><Input type="number" className="mt-1" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
            <div><Label>Current Passengers</Label><Input type="number" className="mt-1" value={form.currentPassengers} onChange={e => setForm({ ...form, currentPassengers: Number(e.target.value) })} /></div>
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
