import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Eye, EyeOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest, getToken } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["general", "events", "academics", "sports", "campus", "achievements"];

export default function GalleryAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", imageUrl: "", category: "general" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchItems = () => {
    setLoading(true);
    fetch("/api/gallery?admin=true", { headers: authHeaders() })
      .then(r => r.json()).then(setItems).finally(() => setLoading(false));
  };
  useEffect(fetchItems, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    fd.append("title", form.title || file.name);
    fd.append("category", form.category);
    try {
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      toast({ title: "Image uploaded!" });
      setShowModal(false);
      fetchItems();
    } catch (e: any) { toast({ variant: "destructive", title: "Upload failed", description: e.message }); }
    finally { setUploading(false); }
  };

  const saveUrl = async () => {
    if (!form.imageUrl || !form.title) return;
    setSaving(true);
    try {
      await apiRequest("POST", "/api/gallery", form);
      toast({ title: "Image added" }); setShowModal(false); fetchItems();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const togglePublish = async (id: number, current: boolean) => {
    try { await apiRequest("PUT", `/api/gallery/${id}`, { isPublished: !current }); fetchItems(); }
    catch {}
  };

  const del = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    try { await apiRequest("DELETE", `/api/gallery/${id}`); fetchItems(); }
    catch {}
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gallery Management</h1>
            <p className="text-muted-foreground text-sm">Manage photo gallery displayed on website</p>
          </div>
          <Button onClick={() => { setForm({ title: "", description: "", imageUrl: "", category: "general" }); setShowModal(true); }} className="gap-2" data-testid="button-add-image">
            <Plus className="w-4 h-4" /> Add Image
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div key={item.id} className="relative group rounded-lg overflow-hidden border border-border" data-testid={`card-gallery-${item.id}`}>
                <div className="aspect-square bg-muted">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2">
                  <div className="text-xs font-medium truncate">{item.title}</div>
                  <div className="flex items-center justify-between mt-1">
                    <Badge className="text-xs capitalize">{item.category}</Badge>
                    <Badge className={item.isPublished ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-600 text-xs"}>
                      {item.isPublished ? "Live" : "Hidden"}
                    </Badge>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => togglePublish(item.id, item.isPublished)}>
                      {item.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            ))}
            {items.length === 0 && <div className="col-span-4 text-center py-10 text-muted-foreground">No gallery images yet.</div>}
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Gallery Image</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title *</Label><Input className="mt-1" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} data-testid="input-image-title" /></div>
            <div><Label>Category</Label>
              <select className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <Label>Image URL (or upload below)</Label>
              <Input className="mt-1" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="text-center text-muted-foreground text-sm">— or —</div>
            <div>
              <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
              <Button variant="outline" className="w-full gap-2" onClick={() => fileRef.current?.click()} disabled={uploading} data-testid="button-upload-image">
                <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Image from Device"}
              </Button>
            </div>
            <div><Label>Description (Optional)</Label><Input className="mt-1" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={saveUrl} disabled={saving || !form.imageUrl || !form.title}>{saving ? "Saving..." : "Add Image"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
