import { db } from "./db";
import {
  users, students, admissions, attendance, timetable, exams, marks,
  feeStructures, feePayments, staff, salaryPayments, income, expenses,
  inventory, buses, busAssignments, gallery, news, contactMessages,
  type User, type InsertUser, type Student, type InsertStudent,
  type Admission, type InsertAdmission, type Attendance, type InsertAttendance,
  type Timetable, type InsertTimetable, type Exam, type InsertExam,
  type Mark, type InsertMark, type FeeStructure, type InsertFeeStructure,
  type FeePayment, type InsertFeePayment, type Staff, type InsertStaff,
  type SalaryPayment, type InsertSalaryPayment, type Income, type InsertIncome,
  type Expense, type InsertExpense, type Inventory, type InsertInventory,
  type Bus, type InsertBus, type BusAssignment, type InsertBusAssignment,
  type Gallery, type InsertGallery, type News, type InsertNews,
  type ContactMessage, type InsertContactMessage, type DashboardStats,
} from "@shared/schema";
import { eq, desc, and, like, sql, count, sum } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Auth
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserById(id: number): Promise<User | undefined>;

  // Students
  getStudents(filters?: { class?: string; search?: string; isExStudent?: boolean }): Promise<Student[]>;
  getStudentById(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, updates: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
  generateTC(id: number): Promise<Student>;

  // Admissions
  getAdmissions(status?: string): Promise<Admission[]>;
  getAdmissionById(id: number): Promise<Admission | undefined>;
  createAdmission(admission: InsertAdmission): Promise<Admission>;
  updateAdmission(id: number, updates: Partial<InsertAdmission> & { status?: string; remarks?: string }): Promise<Admission>;
  convertToStudent(id: number): Promise<Student>;

  // Attendance
  getAttendance(filters?: { class?: string; section?: string; date?: string; studentId?: number }): Promise<(Attendance & { student: Student })[]>;
  markAttendance(data: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, updates: Partial<InsertAttendance>): Promise<Attendance>;
  getAttendanceSummary(days?: number): Promise<{ date: string; present: number; absent: number; late: number }[]>;

  // Timetable
  getTimetable(filters?: { class?: string; section?: string; day?: string }): Promise<(Timetable & { teacher?: Staff })[]>;
  createTimetable(data: InsertTimetable): Promise<Timetable>;
  updateTimetable(id: number, updates: Partial<InsertTimetable>): Promise<Timetable>;
  deleteTimetable(id: number): Promise<void>;

  // Exams
  getExams(filters?: { class?: string }): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, updates: Partial<InsertExam>): Promise<Exam>;
  deleteExam(id: number): Promise<void>;

  // Marks
  getMarksByExam(examId: number): Promise<(Mark & { student: Student })[]>;
  getMarksByStudent(studentId: number): Promise<(Mark & { exam: Exam })[]>;
  createMark(mark: InsertMark): Promise<Mark>;
  updateMark(id: number, updates: Partial<InsertMark>): Promise<Mark>;
  deleteMark(id: number): Promise<void>;

  // Fees
  getFeeStructures(cls?: string): Promise<FeeStructure[]>;
  createFeeStructure(fs: InsertFeeStructure): Promise<FeeStructure>;
  getFeePayments(filters?: { studentId?: number; month?: string; year?: number; status?: string }): Promise<(FeePayment & { student: Student })[]>;
  createFeePayment(payment: InsertFeePayment): Promise<FeePayment>;
  updateFeePayment(id: number, updates: Partial<InsertFeePayment>): Promise<FeePayment>;
  getFeeStats(): Promise<{ totalRevenue: number; monthlyRevenue: number; pendingAmount: number }>;

  // Staff
  getStaff(search?: string): Promise<Staff[]>;
  getStaffById(id: number): Promise<Staff | undefined>;
  createStaff(s: InsertStaff): Promise<Staff>;
  updateStaff(id: number, updates: Partial<InsertStaff>): Promise<Staff>;
  deleteStaff(id: number): Promise<void>;

  // Salary
  getSalaryPayments(staffId?: number): Promise<(SalaryPayment & { staff: Staff })[]>;
  createSalaryPayment(payment: InsertSalaryPayment): Promise<SalaryPayment>;
  getSalarySummary(): Promise<{ month: string; year: number; total: number }[]>;

  // Finance
  getIncome(): Promise<Income[]>;
  createIncome(inc: InsertIncome): Promise<Income>;
  deleteIncome(id: number): Promise<void>;
  getExpenses(): Promise<Expense[]>;
  createExpense(exp: InsertExpense): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  getFinanceSummary(): Promise<{ totalIncome: number; totalExpenses: number; profit: number }>;

  // Inventory
  getInventory(search?: string): Promise<Inventory[]>;
  createInventory(item: InsertInventory): Promise<Inventory>;
  updateInventory(id: number, updates: Partial<InsertInventory>): Promise<Inventory>;
  deleteInventory(id: number): Promise<void>;

  // Transport
  getBuses(): Promise<Bus[]>;
  createBus(bus: InsertBus): Promise<Bus>;
  updateBus(id: number, updates: Partial<InsertBus>): Promise<Bus>;
  deleteBus(id: number): Promise<void>;
  getBusAssignments(busId?: number): Promise<(BusAssignment & { student: Student; bus: Bus })[]>;
  createBusAssignment(assignment: InsertBusAssignment): Promise<BusAssignment>;
  deleteBusAssignment(id: number): Promise<void>;

  // Gallery
  getGallery(published?: boolean): Promise<Gallery[]>;
  createGallery(item: InsertGallery): Promise<Gallery>;
  updateGallery(id: number, updates: Partial<InsertGallery>): Promise<Gallery>;
  deleteGallery(id: number): Promise<void>;

  // News
  getNews(published?: boolean): Promise<News[]>;
  createNews(item: InsertNews): Promise<News>;
  updateNews(id: number, updates: Partial<InsertNews>): Promise<News>;
  deleteNews(id: number): Promise<void>;

  // Contact
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(msg: InsertContactMessage): Promise<ContactMessage>;
  markMessageRead(id: number): Promise<void>;
  deleteContactMessage(id: number): Promise<void>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  getAttendanceTrend(): Promise<{ date: string; present: number; absent: number; late: number }[]>;
  getRevenueChart(): Promise<{ month: string; revenue: number }[]>;
}

function computeGrade(marks: number, total: number): string {
  const pct = (marks / total) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C";
  if (pct >= 40) return "D";
  return "F";
}

export class DatabaseStorage implements IStorage {
  // ─── AUTH ──────────────────────────────────────────────────────────────────
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(user: InsertUser): Promise<User> {
    const hashed = await bcrypt.hash(user.password, 10);
    const [u] = await db.insert(users).values({ ...user, password: hashed }).returning();
    return u;
  }
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  // ─── STUDENTS ──────────────────────────────────────────────────────────────
  async getStudents(filters?: { class?: string; search?: string; isExStudent?: boolean }): Promise<Student[]> {
    let query = db.select().from(students) as any;
    const conditions: any[] = [];
    if (filters?.class) conditions.push(eq(students.class, filters.class));
    if (filters?.isExStudent !== undefined) conditions.push(eq(students.isExStudent, filters.isExStudent));
    else conditions.push(eq(students.isExStudent, false));
    if (conditions.length) query = query.where(and(...conditions));
    const result = await query.orderBy(desc(students.createdAt));
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      return result.filter((st: Student) =>
        st.name.toLowerCase().includes(s) ||
        st.admissionNumber.toLowerCase().includes(s) ||
        st.class.toLowerCase().includes(s)
      );
    }
    return result;
  }
  async getStudentById(id: number): Promise<Student | undefined> {
    const [s] = await db.select().from(students).where(eq(students.id, id));
    return s;
  }
  async createStudent(student: InsertStudent): Promise<Student> {
    const [s] = await db.insert(students).values(student).returning();
    return s;
  }
  async updateStudent(id: number, updates: Partial<InsertStudent>): Promise<Student> {
    const [s] = await db.update(students).set(updates).where(eq(students.id, id)).returning();
    return s;
  }
  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }
  async generateTC(id: number): Promise<Student> {
    const [s] = await db.update(students)
      .set({ isActive: false, isExStudent: true, tcGeneratedAt: new Date() })
      .where(eq(students.id, id)).returning();
    return s;
  }

  // ─── ADMISSIONS ────────────────────────────────────────────────────────────
  async getAdmissions(status?: string): Promise<Admission[]> {
    if (status) {
      return db.select().from(admissions).where(eq(admissions.status, status as any)).orderBy(desc(admissions.createdAt));
    }
    return db.select().from(admissions).orderBy(desc(admissions.createdAt));
  }
  async getAdmissionById(id: number): Promise<Admission | undefined> {
    const [a] = await db.select().from(admissions).where(eq(admissions.id, id));
    return a;
  }
  async createAdmission(admission: InsertAdmission): Promise<Admission> {
    const [a] = await db.insert(admissions).values(admission).returning();
    return a;
  }
  async updateAdmission(id: number, updates: any): Promise<Admission> {
    const [a] = await db.update(admissions).set({ ...updates, updatedAt: new Date() }).where(eq(admissions.id, id)).returning();
    return a;
  }
  async convertToStudent(id: number): Promise<Student> {
    const admission = await this.getAdmissionById(id);
    if (!admission) throw new Error("Admission not found");
    const year = new Date().getFullYear();
    const admissionNumber = `SN${year}${String(id).padStart(4, "0")}`;
    const studentData: InsertStudent = {
      admissionNumber,
      name: admission.studentName,
      fatherName: admission.fatherName,
      motherName: admission.motherName,
      dob: admission.dob,
      gender: admission.gender,
      class: admission.classApplying,
      section: "A",
      phone: admission.phone,
      email: admission.email ?? undefined,
      address: admission.address,
      isActive: true,
      isExStudent: false,
    };
    const newStudent = await this.createStudent(studentData);
    await this.updateAdmission(id, { status: "approved", convertedStudentId: newStudent.id });
    return newStudent;
  }

  // ─── ATTENDANCE ────────────────────────────────────────────────────────────
  async getAttendance(filters?: any): Promise<(Attendance & { student: Student })[]> {
    const rows = await db.select().from(attendance)
      .leftJoin(students, eq(attendance.studentId, students.id))
      .orderBy(desc(attendance.date));
    const mapped = rows.map(r => ({ ...r.attendance, student: r.students! }));
    if (!filters) return mapped;
    return mapped.filter(r => {
      if (filters.class && r.class !== filters.class) return false;
      if (filters.section && r.section !== filters.section) return false;
      if (filters.date && r.date !== filters.date) return false;
      if (filters.studentId && r.studentId !== filters.studentId) return false;
      return true;
    });
  }
  async markAttendance(data: InsertAttendance): Promise<Attendance> {
    const [a] = await db.insert(attendance).values(data).returning();
    return a;
  }
  async updateAttendance(id: number, updates: Partial<InsertAttendance>): Promise<Attendance> {
    const [a] = await db.update(attendance).set(updates).where(eq(attendance.id, id)).returning();
    return a;
  }
  async getAttendanceSummary(days = 30): Promise<{ date: string; present: number; absent: number; late: number }[]> {
    const rows = await db.select({
      date: attendance.date,
      status: attendance.status,
      cnt: count(),
    }).from(attendance).groupBy(attendance.date, attendance.status).orderBy(attendance.date);
    const map = new Map<string, { present: number; absent: number; late: number }>();
    rows.forEach(r => {
      if (!map.has(r.date)) map.set(r.date, { present: 0, absent: 0, late: 0 });
      const entry = map.get(r.date)!;
      if (r.status === "present") entry.present = Number(r.cnt);
      if (r.status === "absent") entry.absent = Number(r.cnt);
      if (r.status === "late") entry.late = Number(r.cnt);
    });
    return Array.from(map.entries()).slice(-days).map(([date, v]) => ({ date, ...v }));
  }

  // ─── TIMETABLE ─────────────────────────────────────────────────────────────
  async getTimetable(filters?: any): Promise<(Timetable & { teacher?: Staff })[]> {
    const rows = await db.select().from(timetable)
      .leftJoin(staff, eq(timetable.teacherId, staff.id))
      .orderBy(timetable.period);
    let mapped = rows.map(r => ({ ...r.timetable, teacher: r.staff ?? undefined }));
    if (filters?.class) mapped = mapped.filter(r => r.class === filters.class);
    if (filters?.section) mapped = mapped.filter(r => r.section === filters.section);
    if (filters?.day) mapped = mapped.filter(r => r.day === filters.day);
    return mapped;
  }
  async createTimetable(data: InsertTimetable): Promise<Timetable> {
    const [t] = await db.insert(timetable).values(data).returning();
    return t;
  }
  async updateTimetable(id: number, updates: Partial<InsertTimetable>): Promise<Timetable> {
    const [t] = await db.update(timetable).set(updates).where(eq(timetable.id, id)).returning();
    return t;
  }
  async deleteTimetable(id: number): Promise<void> {
    await db.delete(timetable).where(eq(timetable.id, id));
  }

  // ─── EXAMS ─────────────────────────────────────────────────────────────────
  async getExams(filters?: { class?: string }): Promise<Exam[]> {
    if (filters?.class) {
      return db.select().from(exams).where(eq(exams.class, filters.class)).orderBy(desc(exams.examDate));
    }
    return db.select().from(exams).orderBy(desc(exams.examDate));
  }
  async createExam(exam: InsertExam): Promise<Exam> {
    const [e] = await db.insert(exams).values(exam).returning();
    return e;
  }
  async updateExam(id: number, updates: Partial<InsertExam>): Promise<Exam> {
    const [e] = await db.update(exams).set(updates).where(eq(exams.id, id)).returning();
    return e;
  }
  async deleteExam(id: number): Promise<void> {
    await db.delete(exams).where(eq(exams.id, id));
  }

  // ─── MARKS ─────────────────────────────────────────────────────────────────
  async getMarksByExam(examId: number): Promise<(Mark & { student: Student })[]> {
    const rows = await db.select().from(marks).leftJoin(students, eq(marks.studentId, students.id)).where(eq(marks.examId, examId));
    return rows.map(r => ({ ...r.marks, student: r.students! }));
  }
  async getMarksByStudent(studentId: number): Promise<(Mark & { exam: Exam })[]> {
    const rows = await db.select().from(marks).leftJoin(exams, eq(marks.examId, exams.id)).where(eq(marks.studentId, studentId));
    return rows.map(r => ({ ...r.marks, exam: r.exams! }));
  }
  async createMark(mark: InsertMark): Promise<Mark> {
    const exam = await db.select().from(exams).where(eq(exams.id, mark.examId)).then(r => r[0]);
    const grade = exam ? computeGrade(Number(mark.marksObtained), exam.totalMarks) : "N/A";
    const [m] = await db.insert(marks).values({ ...mark, grade }).returning();
    return m;
  }
  async updateMark(id: number, updates: Partial<InsertMark>): Promise<Mark> {
    const [m] = await db.update(marks).set(updates).where(eq(marks.id, id)).returning();
    return m;
  }
  async deleteMark(id: number): Promise<void> {
    await db.delete(marks).where(eq(marks.id, id));
  }

  // ─── FEES ──────────────────────────────────────────────────────────────────
  async getFeeStructures(cls?: string): Promise<FeeStructure[]> {
    if (cls) return db.select().from(feeStructures).where(eq(feeStructures.class, cls));
    return db.select().from(feeStructures);
  }
  async createFeeStructure(fs: InsertFeeStructure): Promise<FeeStructure> {
    const [f] = await db.insert(feeStructures).values(fs).returning();
    return f;
  }
  async getFeePayments(filters?: any): Promise<(FeePayment & { student: Student })[]> {
    const rows = await db.select().from(feePayments)
      .leftJoin(students, eq(feePayments.studentId, students.id))
      .orderBy(desc(feePayments.createdAt));
    let mapped = rows.map(r => ({ ...r.fee_payments, student: r.students! }));
    if (filters?.studentId) mapped = mapped.filter(r => r.studentId === filters.studentId);
    if (filters?.month) mapped = mapped.filter(r => r.month === filters.month);
    if (filters?.year) mapped = mapped.filter(r => r.year === filters.year);
    if (filters?.status) mapped = mapped.filter(r => r.status === filters.status);
    return mapped;
  }
  async createFeePayment(payment: InsertFeePayment): Promise<FeePayment> {
    const [f] = await db.insert(feePayments).values(payment).returning();
    return f;
  }
  async updateFeePayment(id: number, updates: Partial<InsertFeePayment>): Promise<FeePayment> {
    const [f] = await db.update(feePayments).set(updates).where(eq(feePayments.id, id)).returning();
    return f;
  }
  async getFeeStats(): Promise<{ totalRevenue: number; monthlyRevenue: number; pendingAmount: number }> {
    const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
    const currentYear = new Date().getFullYear();
    const allPaid = await db.select({ total: sum(feePayments.amount) }).from(feePayments).where(eq(feePayments.status, "paid"));
    const monthly = await db.select({ total: sum(feePayments.amount) }).from(feePayments)
      .where(and(eq(feePayments.status, "paid"), eq(feePayments.month, currentMonth), eq(feePayments.year, currentYear)));
    const pending = await db.select({ total: sum(feePayments.amount) }).from(feePayments).where(eq(feePayments.status, "unpaid"));
    return {
      totalRevenue: Number(allPaid[0]?.total ?? 0),
      monthlyRevenue: Number(monthly[0]?.total ?? 0),
      pendingAmount: Number(pending[0]?.total ?? 0),
    };
  }

  // ─── STAFF ─────────────────────────────────────────────────────────────────
  async getStaff(search?: string): Promise<Staff[]> {
    const all = await db.select().from(staff).orderBy(staff.name);
    if (search) {
      const s = search.toLowerCase();
      return all.filter(st => st.name.toLowerCase().includes(s) || st.designation.toLowerCase().includes(s));
    }
    return all;
  }
  async getStaffById(id: number): Promise<Staff | undefined> {
    const [s] = await db.select().from(staff).where(eq(staff.id, id));
    return s;
  }
  async createStaff(s: InsertStaff): Promise<Staff> {
    const [st] = await db.insert(staff).values(s).returning();
    return st;
  }
  async updateStaff(id: number, updates: Partial<InsertStaff>): Promise<Staff> {
    const [s] = await db.update(staff).set(updates).where(eq(staff.id, id)).returning();
    return s;
  }
  async deleteStaff(id: number): Promise<void> {
    await db.delete(staff).where(eq(staff.id, id));
  }

  // ─── SALARY ────────────────────────────────────────────────────────────────
  async getSalaryPayments(staffId?: number): Promise<(SalaryPayment & { staff: Staff })[]> {
    const rows = await db.select().from(salaryPayments)
      .leftJoin(staff, eq(salaryPayments.staffId, staff.id))
      .orderBy(desc(salaryPayments.createdAt));
    let mapped = rows.map(r => ({ ...r.salary_payments, staff: r.staff! }));
    if (staffId) mapped = mapped.filter(r => r.staffId === staffId);
    return mapped;
  }
  async createSalaryPayment(payment: InsertSalaryPayment): Promise<SalaryPayment> {
    const [s] = await db.insert(salaryPayments).values({ ...payment, paidAt: new Date() }).returning();
    return s;
  }
  async getSalarySummary(): Promise<{ month: string; year: number; total: number }[]> {
    const rows = await db.select({
      month: salaryPayments.month,
      year: salaryPayments.year,
      total: sum(salaryPayments.amount),
    }).from(salaryPayments).groupBy(salaryPayments.month, salaryPayments.year);
    return rows.map(r => ({ month: r.month, year: r.year, total: Number(r.total ?? 0) }));
  }

  // ─── FINANCE ───────────────────────────────────────────────────────────────
  async getIncome(): Promise<Income[]> {
    return db.select().from(income).orderBy(desc(income.date));
  }
  async createIncome(inc: InsertIncome): Promise<Income> {
    const [i] = await db.insert(income).values(inc).returning();
    return i;
  }
  async deleteIncome(id: number): Promise<void> {
    await db.delete(income).where(eq(income.id, id));
  }
  async getExpenses(): Promise<Expense[]> {
    return db.select().from(expenses).orderBy(desc(expenses.date));
  }
  async createExpense(exp: InsertExpense): Promise<Expense> {
    const [e] = await db.insert(expenses).values(exp).returning();
    return e;
  }
  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }
  async getFinanceSummary(): Promise<{ totalIncome: number; totalExpenses: number; profit: number }> {
    const incResult = await db.select({ total: sum(income.amount) }).from(income);
    const expResult = await db.select({ total: sum(expenses.amount) }).from(expenses);
    const totalIncome = Number(incResult[0]?.total ?? 0);
    const totalExpenses = Number(expResult[0]?.total ?? 0);
    return { totalIncome, totalExpenses, profit: totalIncome - totalExpenses };
  }

  // ─── INVENTORY ─────────────────────────────────────────────────────────────
  async getInventory(search?: string): Promise<Inventory[]> {
    const all = await db.select().from(inventory).orderBy(inventory.itemName);
    if (search) {
      const s = search.toLowerCase();
      return all.filter(i => i.itemName.toLowerCase().includes(s) || i.category.toLowerCase().includes(s));
    }
    return all;
  }
  async createInventory(item: InsertInventory): Promise<Inventory> {
    const [i] = await db.insert(inventory).values(item).returning();
    return i;
  }
  async updateInventory(id: number, updates: Partial<InsertInventory>): Promise<Inventory> {
    const [i] = await db.update(inventory).set({ ...updates, updatedAt: new Date() }).where(eq(inventory.id, id)).returning();
    return i;
  }
  async deleteInventory(id: number): Promise<void> {
    await db.delete(inventory).where(eq(inventory.id, id));
  }

  // ─── TRANSPORT ─────────────────────────────────────────────────────────────
  async getBuses(): Promise<Bus[]> {
    return db.select().from(buses).orderBy(buses.busNumber);
  }
  async createBus(bus: InsertBus): Promise<Bus> {
    const [b] = await db.insert(buses).values(bus).returning();
    return b;
  }
  async updateBus(id: number, updates: Partial<InsertBus>): Promise<Bus> {
    const [b] = await db.update(buses).set(updates).where(eq(buses.id, id)).returning();
    return b;
  }
  async deleteBus(id: number): Promise<void> {
    await db.delete(buses).where(eq(buses.id, id));
  }
  async getBusAssignments(busId?: number): Promise<(BusAssignment & { student: Student; bus: Bus })[]> {
    const rows = await db.select().from(busAssignments)
      .leftJoin(students, eq(busAssignments.studentId, students.id))
      .leftJoin(buses, eq(busAssignments.busId, buses.id));
    let mapped = rows.map(r => ({ ...r.bus_assignments, student: r.students!, bus: r.buses! }));
    if (busId) mapped = mapped.filter(r => r.busId === busId);
    return mapped;
  }
  async createBusAssignment(assignment: InsertBusAssignment): Promise<BusAssignment> {
    const [b] = await db.insert(busAssignments).values(assignment).returning();
    return b;
  }
  async deleteBusAssignment(id: number): Promise<void> {
    await db.delete(busAssignments).where(eq(busAssignments.id, id));
  }

  // ─── GALLERY ───────────────────────────────────────────────────────────────
  async getGallery(published?: boolean): Promise<Gallery[]> {
    if (published !== undefined) {
      return db.select().from(gallery).where(eq(gallery.isPublished, published)).orderBy(desc(gallery.createdAt));
    }
    return db.select().from(gallery).orderBy(desc(gallery.createdAt));
  }
  async createGallery(item: InsertGallery): Promise<Gallery> {
    const [g] = await db.insert(gallery).values(item).returning();
    return g;
  }
  async updateGallery(id: number, updates: Partial<InsertGallery>): Promise<Gallery> {
    const [g] = await db.update(gallery).set(updates).where(eq(gallery.id, id)).returning();
    return g;
  }
  async deleteGallery(id: number): Promise<void> {
    await db.delete(gallery).where(eq(gallery.id, id));
  }

  // ─── NEWS ──────────────────────────────────────────────────────────────────
  async getNews(published?: boolean): Promise<News[]> {
    if (published !== undefined) {
      return db.select().from(news).where(eq(news.isPublished, published)).orderBy(desc(news.publishedAt));
    }
    return db.select().from(news).orderBy(desc(news.publishedAt));
  }
  async createNews(item: InsertNews): Promise<News> {
    const [n] = await db.insert(news).values(item).returning();
    return n;
  }
  async updateNews(id: number, updates: Partial<InsertNews>): Promise<News> {
    const [n] = await db.update(news).set(updates).where(eq(news.id, id)).returning();
    return n;
  }
  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // ─── CONTACT ───────────────────────────────────────────────────────────────
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  async createContactMessage(msg: InsertContactMessage): Promise<ContactMessage> {
    const [c] = await db.insert(contactMessages).values(msg).returning();
    return c;
  }
  async markMessageRead(id: number): Promise<void> {
    await db.update(contactMessages).set({ isRead: true }).where(eq(contactMessages.id, id));
  }
  async deleteContactMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  async getDashboardStats(): Promise<DashboardStats> {
    const [totalStudents] = await db.select({ cnt: count() }).from(students).where(and(eq(students.isActive, true), eq(students.isExStudent, false)));
    const [totalStaff] = await db.select({ cnt: count() }).from(staff).where(eq(staff.isActive, true));
    const [pendingAdmissions] = await db.select({ cnt: count() }).from(admissions).where(eq(admissions.status, "pending"));
    const feeStats = await this.getFeeStats();
    const [totalBuses] = await db.select({ cnt: count() }).from(buses).where(eq(buses.isActive, true));
    const [unreadMessages] = await db.select({ cnt: count() }).from(contactMessages).where(eq(contactMessages.isRead, false));
    const today = new Date().toISOString().split("T")[0];
    const [todayPresent] = await db.select({ cnt: count() }).from(attendance).where(and(eq(attendance.date, today), eq(attendance.status, "present")));
    const [todayTotal] = await db.select({ cnt: count() }).from(attendance).where(eq(attendance.date, today));
    const allInventory = await this.getInventory();
    const lowStockItems = allInventory.filter(i => i.quantity <= (i.lowStockThreshold ?? 5)).length;
    const todayAttendanceRate = todayTotal[0]?.cnt > 0 ? Math.round((Number(todayPresent[0]?.cnt) / Number(todayTotal[0]?.cnt)) * 100) : 0;
    return {
      totalStudents: Number(totalStudents.cnt),
      totalStaff: Number(totalStaff.cnt),
      pendingAdmissions: Number(pendingAdmissions.cnt),
      monthlyRevenue: feeStats.monthlyRevenue,
      todayAttendanceRate,
      totalBuses: Number(totalBuses.cnt),
      unreadMessages: Number(unreadMessages.cnt),
      lowStockItems,
    };
  }
  async getAttendanceTrend(): Promise<{ date: string; present: number; absent: number; late: number }[]> {
    return this.getAttendanceSummary(14);
  }
  async getRevenueChart(): Promise<{ month: string; revenue: number }[]> {
    const rows = await db.select({
      month: feePayments.month,
      year: feePayments.year,
      total: sum(feePayments.amount),
    }).from(feePayments).where(eq(feePayments.status, "paid")).groupBy(feePayments.month, feePayments.year);
    return rows.map(r => ({ month: `${r.month} ${r.year}`, revenue: Number(r.total ?? 0) }));
  }
}

export const storage = new DatabaseStorage();
