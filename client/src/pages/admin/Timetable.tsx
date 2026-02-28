import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SUBJECTS = ["Mathematics", "Science", "Hindi", "English", "Social Studies", "Sanskrit", "Computer", "Physical Education", "Art", "Music"];

const empty = { class: "1", section: "A", day: "Monday", period: 1, subject: "", startTime: "08:00", endTime: "08:45", teacherId: null };

export default function Timetable() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchItems = () => {
    setLoading(true);
    fetch(`/api/timetable?class=${selectedClass}&day=${selectedDay}`, { headers: authHeaders() })
      .then(r => r.json()).then(setItems).finally(() => setLoading(false));
  };
  useEffect(fetchItems, [selectedClass, selectedDay]);

  const openAdd = () => { setEditItem(null); setForm({ ...empty, class: selectedClass, day: selectedDay }); setShowModal(true); };
  const openEdit = (i: any) => { setEditItem(i); setForm(i); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) { await apiRequest("PUT", `/api/timetable/${editItem.id}`, form); toast({ title: "Updated" }); }
      else { await apiRequest("POST", "/api/timetable", form); toast({ title: "Period added" }); }
      setShowModal(false); fetchItems();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    try { await apiRequest("DELETE", `/api/timetable/${id}`); fetchItems(); }
    catch {}
  };

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Timetable & Scheduling</h1>
            <p className="text-muted-foreground text-sm">Manage class schedules and periods</p>
          </div>
          <Button onClick={openAdd} className="gap-2" data-testid="button-add-period"><Plus className="w-4 h-4" /> Add Period</Button>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
          </Select>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map(d => (
              <Button key={d} size="sm" variant={selectedDay === d ? "default" : "outline"} onClick={() => setSelectedDay(d)} className="text-xs">{d.slice(0, 3)}</Button>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Class {selectedClass} — {selectedDay}</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48" /> : items.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No periods scheduled. Add periods for this class and day.</div>
            ) : (
              <div className="space-y-2">
                {items.sort((a, b) => a.period - b.period).map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg border border-border" data-testid={`row-timetable-${item.id}`}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{item.period}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.subject}</div>
                      <div className="text-xs text-muted-foreground">{item.startTime} – {item.endTime}</div>
                    </div>
                    {item.teacher && <div className="text-xs text-muted-foreground">{item.teacher.name}</div>}
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(item)}><Edit className="w-3.5 h-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Period" : "Add Period"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Class</Label>
                <Select value={form.class} onValueChange={v => setForm({ ...form, class: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Day</Label>
                <Select value={form.day} onValueChange={v => setForm({ ...form, day: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Subject</Label>
              <Select value={form.subject} onValueChange={v => setForm({ ...form, subject: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Period No.</Label><Input type="number" min={1} max={10} className="mt-1" value={form.period} onChange={e => setForm({ ...form, period: Number(e.target.value) })} /></div>
              <div><Label>Start Time</Label><Input type="time" className="mt-1" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} /></div>
              <div><Label>End Time</Label><Input type="time" className="mt-1" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} /></div>
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
