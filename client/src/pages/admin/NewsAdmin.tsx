import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { News } from "@shared/schema";

const emptyNews = { title: "", content: "", category: "general", isPublished: true };

export default function NewsAdmin() {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<News | null>(null);
  const [form, setForm] = useState(emptyNews);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchItems = () => {
    setLoading(true);
    fetch("/api/news?admin=true", { headers: authHeaders() })
      .then(r => r.json()).then(setItems).finally(() => setLoading(false));
  };
  useEffect(fetchItems, []);

  const openAdd = () => { setEditItem(null); setForm(emptyNews); setShowModal(true); };
  const openEdit = (n: News) => { setEditItem(n); setForm(n as any); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) { await apiRequest("PUT", `/api/news/${editItem.id}`, form); toast({ title: "News updated" }); }
      else { await apiRequest("POST", "/api/news", form); toast({ title: "News published" }); }
      setShowModal(false); fetchItems();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const toggle = async (id: number, current: boolean) => {
    try { await apiRequest("PUT", `/api/news/${id}`, { isPublished: !current }); fetchItems(); }
    catch {}
  };

  const del = async (id: number) => {
    if (!confirm("Delete this news item?")) return;
    try { await apiRequest("DELETE", `/api/news/${id}`); fetchItems(); }
    catch {}
  };

  const catColor: Record<string, string> = {
    general: "bg-gray-100 text-gray-700", admission: "bg-blue-100 text-blue-700",
    event: "bg-purple-100 text-purple-700", achievement: "bg-green-100 text-green-700",
    notice: "bg-amber-100 text-amber-700",
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">News & Notices</h1>
            <p className="text-muted-foreground text-sm">Manage announcements displayed on website</p>
          </div>
          <Button onClick={openAdd} className="gap-2" data-testid="button-add-news"><Plus className="w-4 h-4" /> Add News</Button>
        </div>

        {loading ? <Skeleton className="h-48" /> : (
          <div className="space-y-3">
            {items.map(item => (
              <Card key={item.id} className="p-4" data-testid={`card-news-${item.id}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={catColor[item.category] || "bg-gray-100 text-gray-700"}>{item.category}</Badge>
                      <Badge className={item.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                        {item.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(item.publishedAt!).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => toggle(item.id, item.isPublished)} title={item.isPublished ? "Unpublish" : "Publish"}>
                      {item.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </Card>
            ))}
            {items.length === 0 && <div className="text-center py-10 text-muted-foreground">No news items yet.</div>}
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit News" : "Add News / Notice"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} data-testid="input-news-title" /></div>
            <div><Label>Category</Label>
              <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {["general", "admission", "event", "achievement", "notice"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div><Label>Content *</Label><Textarea className="mt-1" rows={5} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} data-testid="input-news-content" /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : editItem ? "Update" : "Publish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
