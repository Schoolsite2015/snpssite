import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, FileText, User, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@shared/schema";

const CLASSES = ["All", "Nursery", "KG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const emptyStudent = {
  admissionNumber: "", name: "", fatherName: "", motherName: "", dob: "",
  gender: "male" as const, class: "1", section: "A", rollNumber: "",
  phone: "", email: "", address: "", penNo: "", aadhaarNo: "", isActive: true, isExStudent: false,
};

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [exStudents, setExStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyStudent);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("active");
  const { toast } = useToast();

  const fetchStudents = () => {
    const headers = authHeaders();
    setLoading(true);
    Promise.all([
      fetch(`/api/students?search=${search}&class=${classFilter === "All" ? "" : classFilter}`, { headers }).then(r => r.json()),
      fetch(`/api/students?exStudents=true`, { headers }).then(r => r.json()),
    ]).then(([a, e]) => { setStudents(a); setExStudents(e); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [search, classFilter]);

  const openAdd = () => { setEditStudent(null); setForm({ ...emptyStudent, admissionNumber: `SN${Date.now().toString().slice(-6)}` }); setShowModal(true); };
  const openEdit = (s: Student) => { setEditStudent(s); setForm(s as any); setShowModal(true); };

  const save = async () => {
    setSaving(true);
    try {
      if (editStudent) {
        await apiRequest("PUT", `/api/students/${editStudent.id}`, form);
        toast({ title: "Student updated successfully" });
      } else {
        await apiRequest("POST", `/api/students`, form);
        toast({ title: "Student added successfully" });
      }
      setShowModal(false);
      fetchStudents();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally { setSaving(false); }
  };

  const deleteStudent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      await apiRequest("DELETE", `/api/students/${id}`);
      toast({ title: "Student deleted" });
      fetchStudents();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  const generateTC = async (id: number, name: string) => {
    if (!confirm(`Generate Transfer Certificate for ${name}? This will move them to Ex-Students.`)) return;
    try {
      await apiRequest("POST", `/api/students/${id}/tc`);
      toast({ title: "TC Generated", description: `${name} moved to Ex-Students list` });
      fetchStudents();
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
  };

  const StudentTable = ({ data }: { data: Student[] }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border">
          {["Student", "Adm. No.", "Class", "Phone", "Status", "Actions"].map(h => <th key={h} className="text-left py-2 px-3 font-medium text-muted-foreground">{h}</th>)}
        </tr></thead>
        <tbody>
          {data.map(s => (
            <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/40" data-testid={`row-student-${s.id}`}>
              <td className="py-2 px-3">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    {s.photoUrl && <AvatarImage src={s.photoUrl} alt={s.name} />}
                    <AvatarFallback className="text-xs">{s.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.fatherName}'s child</div>
                  </div>
                </div>
              </td>
              <td className="py-2 px-3 font-mono text-xs">{s.admissionNumber}</td>
              <td className="py-2 px-3"><Badge variant="outline">Class {s.class}-{s.section}</Badge></td>
              <td className="py-2 px-3">{s.phone}</td>
              <td className="py-2 px-3">
                <Badge className={s.isExStudent ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}>
                  {s.isExStudent ? "Ex-Student" : "Active"}
                </Badge>
              </td>
              <td className="py-2 px-3">
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(s)} data-testid={`button-edit-student-${s.id}`}><Edit className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => window.open(`/api/admin/students/${s.id}/export-pdf`, '_blank')} title="Export PDF"><FileText className="w-3.5 h-3.5" /></Button>
                  {!s.isExStudent && (
                    <Button size="icon" variant="ghost" onClick={() => generateTC(s.id, s.name)} title="Generate TC" data-testid={`button-tc-${s.id}`}><GraduationCap className="w-3.5 h-3.5" /></Button>
                  )}
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteStudent(s.id)} data-testid={`button-delete-student-${s.id}`}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <div className="text-center py-10 text-muted-foreground">No students found.</div>}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Student Information System</h1>
            <p className="text-muted-foreground text-sm">Manage all student records</p>
          </div>
          <Button onClick={openAdd} className="gap-2" data-testid="button-add-student"><Plus className="w-4 h-4" /> Add Student</Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search by name or admission no..." value={search} onChange={e => setSearch(e.target.value)} data-testid="input-search-students" />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-32" data-testid="select-class-filter"><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>{c === "All" ? "All Classes" : `Class ${c}`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active Students ({students.length})</TabsTrigger>
                <TabsTrigger value="ex">Ex-Students ({exStudents.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                {loading ? <Skeleton className="h-48" /> : <StudentTable data={students} />}
              </TabsContent>
              <TabsContent value="ex">
                {loading ? <Skeleton className="h-48" /> : <StudentTable data={exStudents} />}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editStudent ? "Edit Student" : "Add New Student"}</DialogTitle></DialogHeader>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Admission No *", key: "admissionNumber", type: "text", testId: "input-adm-no" },
              { label: "Full Name *", key: "name", type: "text", testId: "input-name" },
              { label: "Father's Name *", key: "fatherName", type: "text", testId: "input-father-name" },
              { label: "Mother's Name *", key: "motherName", type: "text", testId: "input-mother-name" },
              { label: "Date of Birth *", key: "dob", type: "date", testId: "input-dob" },
              { label: "Phone *", key: "phone", type: "tel", testId: "input-phone" },
              { label: "Roll Number", key: "rollNumber", type: "text", testId: "input-roll" },
              { label: "Section", key: "section", type: "text", testId: "input-section" },
              { label: "PEN No.", key: "penNo", type: "text" },
              { label: "Aadhaar No.", key: "aadhaarNo", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <Label>{f.label}</Label>
                <Input className="mt-1" type={f.type} value={(form as any)[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} data-testid={f.testId} />
              </div>
            ))}
            <div>
              <Label>Gender *</Label>
              <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v as any })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label>Class *</Label>
              <Select value={form.class} onValueChange={(v) => setForm({ ...form, class: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Address *</Label>
              <Input className="mt-1" value={form.address || ""} onChange={e => setForm({ ...form, address: e.target.value })} data-testid="input-address" />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Student"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
