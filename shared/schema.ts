import { pgTable, text, serial, integer, boolean, timestamp, date, decimal, varchar, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── ENUMS ────────────────────────────────────────────────────────────────────
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const admissionStatusEnum = pgEnum("admission_status", ["pending", "approved", "rejected"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late", "holiday"]);
export const feeStatusEnum = pgEnum("fee_status", ["paid", "unpaid", "partial"]);
export const userRoleEnum = pgEnum("user_role", ["admin", "teacher", "accountant"]);
export const assetConditionEnum = pgEnum("asset_condition", ["good", "fair", "poor", "damaged"]);

// ─── USERS (Admin/Staff logins) ────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default("teacher"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── STUDENTS ──────────────────────────────────────────────────────────────────
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  admissionNumber: text("admission_number").notNull().unique(),
  name: text("name").notNull(),
  fatherName: text("father_name").notNull(),
  motherName: text("mother_name").notNull(),
  dob: date("dob").notNull(),
  gender: genderEnum("gender").notNull(),
  class: text("class").notNull(),
  section: text("section").notNull().default("A"),
  rollNumber: text("roll_number"),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  penNo: text("pen_no"),
  aadhaarNo: text("aadhaar_no"),
  photoUrl: text("photo_url"),
  isActive: boolean("is_active").notNull().default(true),
  isExStudent: boolean("is_ex_student").notNull().default(false),
  tcGeneratedAt: timestamp("tc_generated_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── ADMISSIONS (Online Applications) ─────────────────────────────────────────
export const admissions = pgTable("admissions", {
  id: serial("id").primaryKey(),
  studentName: text("student_name").notNull(),
  dob: date("dob").notNull(),
  gender: genderEnum("gender").notNull(),
  classApplying: text("class_applying").notNull(),
  fatherName: text("father_name").notNull(),
  motherName: text("mother_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  penNo: text("pen_no"),
  aadhaarNo: text("aadhaar_no"),
  documentUrl: text("document_url"),
  status: admissionStatusEnum("status").notNull().default("pending"),
  remarks: text("remarks"),
  convertedStudentId: integer("converted_student_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── ATTENDANCE ────────────────────────────────────────────────────────────────
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  remarks: text("remarks"),
  markedBy: integer("marked_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── TIMETABLE ────────────────────────────────────────────────────────────────
export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  class: text("class").notNull(),
  section: text("section").notNull(),
  day: text("day").notNull(),
  period: integer("period").notNull(),
  subject: text("subject").notNull(),
  teacherId: integer("teacher_id").references(() => staff.id),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── EXAMINATIONS ─────────────────────────────────────────────────────────────
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  class: text("class").notNull(),
  subject: text("subject").notNull(),
  examDate: date("exam_date").notNull(),
  totalMarks: integer("total_marks").notNull(),
  passingMarks: integer("passing_marks").notNull(),
  academicYear: text("academic_year").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marks = pgTable("marks", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull().references(() => exams.id),
  studentId: integer("student_id").notNull().references(() => students.id),
  marksObtained: decimal("marks_obtained", { precision: 5, scale: 2 }).notNull(),
  grade: text("grade"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── FEE MANAGEMENT ───────────────────────────────────────────────────────────
export const feeStructures = pgTable("fee_structures", {
  id: serial("id").primaryKey(),
  class: text("class").notNull(),
  academicYear: text("academic_year").notNull(),
  tuitionFee: decimal("tuition_fee", { precision: 10, scale: 2 }).notNull(),
  admissionFee: decimal("admission_fee", { precision: 10, scale: 2 }).default("0"),
  examFee: decimal("exam_fee", { precision: 10, scale: 2 }).default("0"),
  sportsFee: decimal("sports_fee", { precision: 10, scale: 2 }).default("0"),
  libraryFee: decimal("library_fee", { precision: 10, scale: 2 }).default("0"),
  transportFee: decimal("transport_fee", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feePayments = pgTable("fee_payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: feeStatusEnum("status").notNull().default("unpaid"),
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"),
  transactionId: text("transaction_id"),
  receiptNumber: text("receipt_number"),
  collectedBy: integer("collected_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── STAFF / HR ────────────────────────────────────────────────────────────────
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  designation: text("designation").notNull(),
  department: text("department").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(),
  joiningDate: date("joining_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salaryPayments = pgTable("salary_payments", {
  id: serial("id").primaryKey(),
  staffId: integer("staff_id").notNull().references(() => staff.id),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── FINANCIAL ACCOUNTING ─────────────────────────────────────────────────────
export const income = pgTable("income", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── INVENTORY ────────────────────────────────────────────────────────────────
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: text("unit").notNull().default("nos"),
  condition: assetConditionEnum("condition").notNull().default("good"),
  location: text("location"),
  purchaseDate: date("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  lowStockThreshold: integer("low_stock_threshold").default(5),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── TRANSPORT ────────────────────────────────────────────────────────────────
export const buses = pgTable("buses", {
  id: serial("id").primaryKey(),
  busNumber: text("bus_number").notNull().unique(),
  routeName: text("route_name").notNull(),
  driverName: text("driver_name").notNull(),
  driverPhone: text("driver_phone").notNull(),
  capacity: integer("capacity").notNull(),
  currentPassengers: integer("current_passengers").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const busAssignments = pgTable("bus_assignments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  busId: integer("bus_id").notNull().references(() => buses.id),
  pickupPoint: text("pickup_point").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── GALLERY ──────────────────────────────────────────────────────────────────
export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull().default("general"),
  isPublished: boolean("is_published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── NEWS / NOTICES ────────────────────────────────────────────────────────────
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull().default("general"),
  isPublished: boolean("is_published").notNull().default(true),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── CONTACT MESSAGES ─────────────────────────────────────────────────────────
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ─── RELATIONS ────────────────────────────────────────────────────────────────
export const studentsRelations = relations(students, ({ many }) => ({
  attendance: many(attendance),
  marks: many(marks),
  feePayments: many(feePayments),
  busAssignments: many(busAssignments),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, { fields: [attendance.studentId], references: [students.id] }),
}));

export const marksRelations = relations(marks, ({ one }) => ({
  exam: one(exams, { fields: [marks.examId], references: [exams.id] }),
  student: one(students, { fields: [marks.studentId], references: [students.id] }),
}));

export const feePaymentsRelations = relations(feePayments, ({ one }) => ({
  student: one(students, { fields: [feePayments.studentId], references: [students.id] }),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  salaryPayments: many(salaryPayments),
  timetable: many(timetable),
}));

export const busAssignmentsRelations = relations(busAssignments, ({ one }) => ({
  student: one(students, { fields: [busAssignments.studentId], references: [students.id] }),
  bus: one(buses, { fields: [busAssignments.busId], references: [buses.id] }),
}));

// ─── INSERT SCHEMAS ────────────────────────────────────────────────────────────
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, createdAt: true, tcGeneratedAt: true });
export const insertAdmissionSchema = createInsertSchema(admissions).omit({ id: true, createdAt: true, updatedAt: true, convertedStudentId: true });
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, createdAt: true });
export const insertTimetableSchema = createInsertSchema(timetable).omit({ id: true, createdAt: true });
export const insertExamSchema = createInsertSchema(exams).omit({ id: true, createdAt: true });
export const insertMarkSchema = createInsertSchema(marks).omit({ id: true, createdAt: true });
export const insertFeeStructureSchema = createInsertSchema(feeStructures).omit({ id: true, createdAt: true });
export const insertFeePaymentSchema = createInsertSchema(feePayments)
  .omit({ id: true, createdAt: true })
  .extend({
    paidAt: z.coerce.date().optional(),
  });
export const insertStaffSchema = createInsertSchema(staff).omit({ id: true, createdAt: true });
export const insertSalaryPaymentSchema = createInsertSchema(salaryPayments)
  .omit({ id: true, createdAt: true })
  .extend({
    paidAt: z.coerce.date().optional(),
  });
export const insertIncomeSchema = createInsertSchema(income).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBusSchema = createInsertSchema(buses).omit({ id: true, createdAt: true });
export const insertBusAssignmentSchema = createInsertSchema(busAssignments).omit({ id: true, createdAt: true });
export const insertGallerySchema = createInsertSchema(gallery).omit({ id: true, createdAt: true });
export const insertNewsSchema = createInsertSchema(news).omit({ id: true, createdAt: true, publishedAt: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Admission = typeof admissions.$inferSelect;
export type InsertAdmission = z.infer<typeof insertAdmissionSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Timetable = typeof timetable.$inferSelect;
export type InsertTimetable = z.infer<typeof insertTimetableSchema>;
export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Mark = typeof marks.$inferSelect;
export type InsertMark = z.infer<typeof insertMarkSchema>;
export type FeeStructure = typeof feeStructures.$inferSelect;
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;
export type FeePayment = typeof feePayments.$inferSelect;
export type InsertFeePayment = z.infer<typeof insertFeePaymentSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type SalaryPayment = typeof salaryPayments.$inferSelect;
export type InsertSalaryPayment = z.infer<typeof insertSalaryPaymentSchema>;
export type Income = typeof income.$inferSelect;
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Bus = typeof buses.$inferSelect;
export type InsertBus = z.infer<typeof insertBusSchema>;
export type BusAssignment = typeof busAssignments.$inferSelect;
export type InsertBusAssignment = z.infer<typeof insertBusAssignmentSchema>;
export type Gallery = typeof gallery.$inferSelect;
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// Dashboard Stats type
export interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  pendingAdmissions: number;
  monthlyRevenue: number;
  todayAttendanceRate: number;
  totalBuses: number;
  unreadMessages: number;
  lowStockItems: number;
}

export interface AttendanceSummary {
  date: string;
  present: number;
  absent: number;
  late: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}
