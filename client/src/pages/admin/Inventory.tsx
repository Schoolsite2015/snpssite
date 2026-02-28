import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Inventory } from "@shared/schema";

const empty = { itemName: "", category: "Furniture", quantity: 0, unit: "nos", condition: "good" as const, location: "", lowStockThreshold: 5, purchaseDate: "", purchasePrice: "" };

export default function InventoryPage() {
  const [items, setItems] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Inventory | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchItems = () => {
    setLoading(true);
    fetch(`/api/inventory?search=${search}`, { headers: authHeaders() })
      .then(r => r.json()).then(setItems).finally(() => setLoading(false));
  };
  useEffect(fetchItems, [search]);

  const openAdd = () => { setEditItem(null); setForm(empty); setShowModal(true); };
  const openEdit = (i: Inventory) => { setEditItem(i); setForm(i as any); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) { await apiRequest("PUT", `/api/inventory/${editItem.id}`, form); toast({ title: "Item updated" }); }
      else { await apiRequest("POST", "/api/inventory", form); toast({ title: "Item added" }); }
      setShowModal(false); fetchItems();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this item?")) return;
    try { await apiRequest("DELETE", `/api/inventory/${id}`); fetchItems(); }
    catch {}
  };

  const lowStock = items.filter(i => i.quantity <= (i.lowStockThreshold ?? 5));

  const conditionColor = { good: "bg-green-100 text-green-700", fair: "bg-amber-100 text-amber-700", poor: "bg-orange-100 text-orange-700", damaged: "bg-red-100 text-red-700" };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Inventory & Asset Management</h1>
            <p className="text-muted-foreground text-sm">Track school assets and inventory</p>
          </div>
          <Button onClick={openAdd} className="gap-2" data-testid="button-add-item"><Plus className="w-4 h-4" /> Add Item</Button>
        </div>

        {lowStock.length > 0 && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 p-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-sm">Low Stock Alert</div>
                <div className="text-xs">{lowStock.map(i => i.itemName).join(", ")} — needs restocking</div>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <div className="relative max-w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-inventory" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48" /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    {["Item Name", "Category", "Quantity", "Condition", "Location", "Actions"].map(h =>
                      <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground">{h}</th>
                    )}
                  </tr></thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className={`border-b border-border last:border-0 hover:bg-muted/40 ${item.quantity <= (item.lowStockThreshold ?? 5) ? "bg-amber-50/50 dark:bg-amber-900/5" : ""}`} data-testid={`row-inventory-${item.id}`}>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{item.itemName}</span>
                            {item.quantity <= (item.lowStockThreshold ?? 5) && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{item.category}</td>
                        <td className="py-2 px-3 font-semibold">{item.quantity} {item.unit}</td>
                        <td className="py-2 px-3">
                          <Badge className={(conditionColor as any)[item.condition] || ""}>{item.condition}</Badge>
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">{item.location || "—"}</td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Edit className="w-3.5 h-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && <div className="text-center py-10 text-muted-foreground">No inventory items found.</div>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Item" : "Add Inventory Item"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Item Name</Label><Input className="mt-1" value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value })} data-testid="input-item-name" /></div>
            <div><Label>Category</Label>
              <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {["Furniture", "Electronics", "Stationery", "Sports", "Books", "Lab Equipment", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><Label>Condition</Label>
              <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Quantity</Label><Input type="number" className="mt-1" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
            <div><Label>Unit</Label><Input className="mt-1" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
            <div><Label>Location</Label><Input className="mt-1" value={form.location || ""} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
            <div><Label>Low Stock Alert (&lt;=)</Label><Input type="number" className="mt-1" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} /></div>
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
