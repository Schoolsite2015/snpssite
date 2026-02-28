import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, BarChart } from "lucide-react";
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
import type { Exam } from "@shared/schema";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const SUBJECTS = ["Mathematics", "Science", "Hindi", "English", "Social Studies", "Sanskrit", "Computer"];

const emptyExam = { name: "", class: "1", subject: "Mathematics", examDate: "", totalMarks: 100, passingMarks: 33, academicYear: "2024-25" };

export default function Exams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [marks, setMarks] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [editItem, setEditItem] = useState<Exam | null>(null);
  const [form, setForm] = useState(emptyExam);
  const [marksForm, setMarksForm] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchExams = () => {
    setLoading(true);
    fetch("/api/exams", { headers: authHeaders() }).then(r => r.json()).then(setExams).finally(() => setLoading(false));
  };
  useEffect(fetchExams, []);

  const openAdd = () => { setEditItem(null); setForm(emptyExam); setShowModal(true); };
  const openEdit = (e: Exam) => { setEditItem(e); setForm(e as any); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editItem) { await apiRequest("PUT", `/api/exams/${editItem.id}`, form); toast({ title: "Exam updated" }); }
      else { await apiRequest("POST", "/api/exams", form); toast({ title: "Exam created" }); }
      setShowModal(false); fetchExams();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Delete this exam?")) return;
    try { await apiRequest("DELETE", `/api/exams/${id}`); fetchExams(); }
    catch {}
  };

  const openMarks = async (exam: Exam) => {
    setSelectedExam(exam);
    const [m, s] = await Promise.all([
      fetch(`/api/marks/exam/${exam.id}`, { headers: authHeaders() }).then(r => r.json()),
      fetch(`/api/students?class=${exam.class}`, { headers: authHeaders() }).then(r => r.json()),
    ]);
    setMarks(m);
    setStudents(s);
    const init: Record<number, string> = {};
    s.forEach((st: any) => {
      const existing = m.find((mk: any) => mk.studentId === st.id);
      init[st.id] = existing ? String(existing.marksObtained) : "";
    });
    setMarksForm(init);
    setShowMarksModal(true);
  };

  const saveMarks = async () => {
    if (!selectedExam) return;
    setSaving(true);
    try {
      for (const [studentId, marksObtained] of Object.entries(marksForm)) {
        if (!marksObtained) continue;
        const existing = marks.find(m => m.studentId === Number(studentId));
        if (existing) {
          await apiRequest("PUT", `/api/marks/${existing.id}`, { marksObtained });
        } else {
          await apiRequest("POST", "/api/marks", { examId: selectedExam.id, studentId: Number(studentId), marksObtained });
        }
      }
      toast({ title: "Marks saved!" }); setShowMarksModal(false);
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const getPct = (m: number, total: number) => ((m / total) * 100).toFixed(1);

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Examination & Grade Management</h1>
            <p className="text-muted-foreground text-sm">Manage exams, marks and report cards</p>
          </div>
          <Button onClick={openAdd} className="gap-2" data-testid="button-add-exam"><Plus className="w-4 h-4" /> Add Exam</Button>
        </div>

        {loading ? <Skeleton className="h-48" /> : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map(exam => (
              <Card key={exam.id} className="p-4" data-testid={`card-exam-${exam.id}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="font-semibold">{exam.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{exam.subject} — Class {exam.class}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(exam)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => del(exam.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                  <div>Date: <span className="text-foreground">{exam.examDate}</span></div>
                  <div>Total Marks: <span className="text-foreground">{exam.totalMarks}</span></div>
                  <div>Passing: <span className="text-foreground">{exam.passingMarks}</span></div>
                  <div>Year: <span className="text-foreground">{exam.academicYear}</span></div>
                </div>
                <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={() => openMarks(exam)} data-testid={`button-marks-${exam.id}`}>
                  <BarChart className="w-3.5 h-3.5" /> Enter / View Marks
                </Button>
              </Card>
            ))}
            {exams.length === 0 && <div className="col-span-3 text-center py-10 text-muted-foreground">No exams added yet.</div>}
          </div>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editItem ? "Edit Exam" : "Add Exam"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Exam Name *</Label><Input className="mt-1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Unit Test 1, Half Yearly" data-testid="input-exam-name" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Class</Label>
                <Select value={form.class} onValueChange={v => setForm({ ...form, class: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Subject</Label>
                <Select value={form.subject} onValueChange={v => setForm({ ...form, subject: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Exam Date</Label><Input type="date" className="mt-1" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Total Marks</Label><Input type="number" className="mt-1" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })} /></div>
              <div><Label>Passing Marks</Label><Input type="number" className="mt-1" value={form.passingMarks} onChange={e => setForm({ ...form, passingMarks: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Academic Year</Label><Input className="mt-1" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMarksModal} onOpenChange={setShowMarksModal}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedExam?.name} — Marks Entry</DialogTitle>
            <p className="text-xs text-muted-foreground">Class {selectedExam?.class} | {selectedExam?.subject} | Total: {selectedExam?.totalMarks}</p>
          </DialogHeader>
          <div className="space-y-2">
            {students.map(s => {
              const m = marks.find(mk => mk.studentId === s.id);
              const val = marksForm[s.id] || "";
              const pct = val ? getPct(Number(val), selectedExam?.totalMarks || 100) : null;
              return (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded border border-border">
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.admissionNumber}</div>
                  </div>
                  <Input type="number" min={0} max={selectedExam?.totalMarks} className="w-24" value={val} onChange={e => setMarksForm({ ...marksForm, [s.id]: e.target.value })} placeholder="Marks" data-testid={`input-marks-${s.id}`} />
                  {pct && <div className="text-xs w-16 text-center"><div>{pct}%</div><div className="text-muted-foreground">{m?.grade || "—"}</div></div>}
                </div>
              );
            })}
            {students.length === 0 && <div className="text-center py-6 text-muted-foreground">No students in Class {selectedExam?.class}</div>}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowMarksModal(false)}>Cancel</Button>
            <Button onClick={saveMarks} disabled={saving}>{saving ? "Saving..." : "Save Marks"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
