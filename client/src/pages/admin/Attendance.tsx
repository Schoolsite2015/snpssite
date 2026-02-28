import { useState, useEffect } from "react";
import { Calendar, CheckCircle, XCircle, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "@/components/admin/AdminLayout";
import { authHeaders, apiRequest } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@shared/schema";

const CLASSES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const STATUS_OPTIONS = ["present", "absent", "late", "holiday"] as const;

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [existing, setExisting] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch(`/api/students?class=${selectedClass}`, { headers: authHeaders() })
      .then(r => r.json()).then(data => {
        setStudents(data);
        const init: Record<number, string> = {};
        data.forEach((s: Student) => { init[s.id] = "present"; });
        setAttendance(init);
      }).catch(() => {});
  }, [selectedClass]);

  useEffect(() => {
    fetch(`/api/attendance?class=${selectedClass}&date=${selectedDate}`, { headers: authHeaders() })
      .then(r => r.json()).then(data => {
        setExisting(data);
        if (data.length > 0) {
          const map: Record<number, string> = {};
          data.forEach((a: any) => { map[a.studentId] = a.status; });
          setAttendance(map);
        }
      }).catch(() => {});
  }, [selectedClass, selectedDate]);

  const setStatus = (studentId: number, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: string) => {
    const all: Record<number, string> = {};
    students.forEach(s => { all[s.id] = status; });
    setAttendance(all);
  };

  const save = async () => {
    setSaving(true);
    try {
      for (const [studentId, status] of Object.entries(attendance)) {
        const existing_ = existing.find(e => e.studentId === Number(studentId));
        if (existing_) {
          await apiRequest("PUT", `/api/attendance/${existing_.id}`, { status });
        } else {
          const student = students.find(s => s.id === Number(studentId));
          if (student) {
            await apiRequest("POST", `/api/attendance`, {
              studentId: Number(studentId), date: selectedDate, status,
              class: selectedClass, section: student.section || "A",
            });
          }
        }
      }
      toast({ title: "Attendance saved successfully!" });
    } catch (e: any) { toast({ variant: "destructive", title: "Error", description: e.message }); }
    finally { setSaving(false); }
  };

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const absentCount = Object.values(attendance).filter(s => s === "absent").length;

  return (
    <AdminLayout>
      <div className="space-y-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground text-sm">Mark and track daily attendance</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-32" data-testid="select-attendance-class"><SelectValue /></SelectTrigger>
                <SelectContent>{CLASSES.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-40" data-testid="input-attendance-date" />
              <div className="flex gap-2 ml-auto flex-wrap">
                <Button size="sm" variant="outline" onClick={() => markAll("present")} className="text-green-600 text-xs">All Present</Button>
                <Button size="sm" variant="outline" onClick={() => markAll("absent")} className="text-red-600 text-xs">All Absent</Button>
                <Button size="sm" onClick={save} disabled={saving || students.length === 0} className="gap-2" data-testid="button-save-attendance">
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle className="w-3 h-3" /> Present: {presentCount}</Badge>
              <Badge className="bg-red-100 text-red-700 gap-1"><XCircle className="w-3 h-3" /> Absent: {absentCount}</Badge>
              <Badge className="bg-amber-100 text-amber-700 gap-1"><Clock className="w-3 h-3" /> Late: {Object.values(attendance).filter(s => s === "late").length}</Badge>
            </div>

            {students.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No students found in Class {selectedClass}. Add students first.</div>
            ) : (
              <div className="space-y-2">
                {students.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40" data-testid={`row-attendance-${s.id}`}>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{s.name}</div>
                      <div className="text-xs text-muted-foreground">Roll: {s.rollNumber || "—"} | {s.admissionNumber}</div>
                    </div>
                    <div className="flex gap-1">
                      {STATUS_OPTIONS.map(st => (
                        <button key={st} onClick={() => setStatus(s.id, st)}
                          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${attendance[s.id] === st ? {
                            present: "bg-green-500 text-white", absent: "bg-red-500 text-white",
                            late: "bg-amber-500 text-white", holiday: "bg-blue-500 text-white",
                          }[st] : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                          data-testid={`button-attendance-${st}-${s.id}`}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
