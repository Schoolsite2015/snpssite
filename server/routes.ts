import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import {
  insertAdmissionSchema, insertStudentSchema, insertAttendanceSchema,
  insertTimetableSchema, insertExamSchema, insertMarkSchema,
  insertFeeStructureSchema, insertFeePaymentSchema, insertStaffSchema,
  insertSalaryPaymentSchema, insertIncomeSchema, insertExpenseSchema,
  insertInventorySchema, insertBusSchema, insertBusAssignmentSchema,
  insertGallerySchema, insertNewsSchema, insertContactMessageSchema,
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";

const JWT_SECRET = process.env.JWT_SECRET || "snpublicschool_secret_2024";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|pdf|doc|docx/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error("Only image and document files allowed"));
  },
});

function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

async function seedDatabase() {
  try {
    const existingStudents = await storage.getStudents();
    if (existingStudents.length === 0) {
      await storage.createStudent({
        admissionNumber: "SN20240001",
        name: "Arjun Kumar Singh",
        fatherName: "Rajesh Kumar Singh",
        motherName: "Sunita Singh",
        dob: "2010-03-15",
        gender: "male",
        class: "8",
        section: "A",
        rollNumber: "01",
        phone: "9876543210",
        address: "Village Pindra, Varanasi, UP - 221206",
        isActive: true,
        isExStudent: false,
      });
      await storage.createStudent({
        admissionNumber: "SN20240002",
        name: "Priya Sharma",
        fatherName: "Ramesh Sharma",
        motherName: "Kavita Sharma",
        dob: "2011-07-22",
        gender: "female",
        class: "7",
        section: "A",
        rollNumber: "02",
        phone: "9876543211",
        address: "Pindra Market, Varanasi, UP",
        isActive: true,
        isExStudent: false,
      });
      await storage.createStudent({
        admissionNumber: "SN20240003",
        name: "Rohit Verma",
        fatherName: "Suresh Verma",
        motherName: "Geeta Verma",
        dob: "2009-11-10",
        gender: "male",
        class: "9",
        section: "A",
        rollNumber: "03",
        phone: "9876543212",
        address: "Near Post Office, Pindra, Varanasi",
        isActive: true,
        isExStudent: false,
      });
    }

    const existingStaff = await storage.getStaff();
    if (existingStaff.length === 0) {
      await storage.createStaff({
        employeeId: "EMP001",
        name: "Dr. Anand Kumar",
        designation: "Principal",
        department: "Administration",
        phone: "9151312209",
        email: "principal@stsnpublicschool.com",
        address: "Pindra, Varanasi",
        salary: "75000",
        joiningDate: "2015-04-01",
        isActive: true,
      });
      await storage.createStaff({
        employeeId: "EMP002",
        name: "Mrs. Meena Tiwari",
        designation: "Senior Teacher",
        department: "Mathematics",
        phone: "9151312210",
        salary: "35000",
        joiningDate: "2018-06-01",
        isActive: true,
      });
      await storage.createStaff({
        employeeId: "EMP003",
        name: "Mr. Ajay Gupta",
        designation: "Teacher",
        department: "Science",
        phone: "9151312211",
        salary: "28000",
        joiningDate: "2020-07-15",
        isActive: true,
      });
    }

    const existingNews = await storage.getNews();
    if (existingNews.length === 0) {
      await storage.createNews({
        title: "Admission Open for Academic Year 2026-27",
        content: "S.N. Public School is pleased to announce admissions for classes Nursery to 10th. Limited seats available. Apply online now!",
        category: "admission",
        isPublished: true,
      });
      await storage.createNews({
        title: "Annual Sports Day - February 2026",
        content: "Our Annual Sports Day will be held on 15th February 2026. All students are encouraged to participate in various sports events.",
        category: "event",
        isPublished: true,
      });
      await storage.createNews({
        title: "School Achieves 100% Board Results",
        content: "We are proud to announce that all our students passed the board examinations with flying colors. 5 students secured distinction.",
        category: "achievement",
        isPublished: true,
      });
    }

    const existingGallery = await storage.getGallery();
    if (existingGallery.length === 0) {
      const demoImages = [
        { title: "Annual Function 2023", category: "events" },
        { title: "Science Exhibition", category: "academics" },
        { title: "Sports Day 2023", category: "sports" },
        { title: "Republic Day Celebration", category: "events" },
        { title: "Independence Day", category: "events" },
        { title: "School Campus", category: "campus" },
      ];
      for (const img of demoImages) {
        await storage.createGallery({
          title: img.title,
          imageUrl: `https://picsum.photos/seed/${img.title.replace(/\s/g, "")}/800/600`,
          category: img.category,
          isPublished: true,
        });
      }
    }

    const existingBuses = await storage.getBuses();
    if (existingBuses.length === 0) {
      await storage.createBus({
        busNumber: "UP65 AB 1234",
        routeName: "Varanasi City Route",
        driverName: "Ram Bahadur",
        driverPhone: "9876500001",
        capacity: 40,
        currentPassengers: 28,
        isActive: true,
      });
      await storage.createBus({
        busNumber: "UP65 CD 5678",
        routeName: "Lucknow Road Route",
        driverName: "Shiv Kumar",
        driverPhone: "9876500002",
        capacity: 40,
        currentPassengers: 32,
        isActive: true,
      });
    }

    const existingInventory = await storage.getInventory();
    if (existingInventory.length === 0) {
      await storage.createInventory({ itemName: "Whiteboard Markers", category: "Stationery", quantity: 50, unit: "box", condition: "good", lowStockThreshold: 10 });
      await storage.createInventory({ itemName: "Classroom Chairs", category: "Furniture", quantity: 200, unit: "nos", condition: "good", lowStockThreshold: 20 });
      await storage.createInventory({ itemName: "Computers", category: "Electronics", quantity: 25, unit: "nos", condition: "good", lowStockThreshold: 5 });
      await storage.createInventory({ itemName: "Projectors", category: "Electronics", quantity: 3, unit: "nos", condition: "good", lowStockThreshold: 2 });
    }

    // Create default admin
    const adminUser = await storage.getUserByEmail("admin@stsnpublicschool.com");
    if (!adminUser) {
      await storage.createUser({
        name: "School Admin",
        email: "admin@stsnpublicschool.com",
        password: "@Anjani123",
        role: "admin",
        isActive: true,
      });
    }

    console.log("Database seeded successfully");
  } catch (err) {
    console.error("Seeding error:", err);
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Serve uploads
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });

  // ─── AUTH ──────────────────────────────────────────────────────────────────
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user || !user.isActive) return res.status(401).json({ message: "Invalid credentials" });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: "Invalid credentials" });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get(api.auth.me.path, authMiddleware, async (req: any, res) => {
    const user = await storage.getUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  });

  // ─── STUDENTS ──────────────────────────────────────────────────────────────
  app.get(api.students.list.path, authMiddleware, async (req, res) => {
    const { class: cls, search, exStudents } = req.query as any;
    const result = await storage.getStudents({ class: cls, search, isExStudent: exStudents === "true" });
    res.json(result);
  });

  app.get(api.students.get.path, authMiddleware, async (req, res) => {
    const student = await storage.getStudentById(Number(req.params.id));
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  });

  app.post(api.students.create.path, authMiddleware, async (req, res) => {
    try {
      const data = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(data);
      res.status(201).json(student);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.put(api.students.update.path, authMiddleware, async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.dob) data.dob = new Date(data.dob); // Converts string to Date object
      const student = await storage.updateStudent(Number(req.params.id), data);
      res.json(student);
    } catch (err) {
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete(api.students.delete.path, authMiddleware, async (req, res) => {
    await storage.deleteStudent(Number(req.params.id));
    res.status(204).send();
  });

  app.post(api.students.generateTC.path, authMiddleware, async (req, res) => {
    try {
      const student = await storage.generateTC(Number(req.params.id));
      res.json(student);
    } catch (err) {
      res.status(500).json({ message: "Failed to generate TC" });
    }
  });

  app.post(api.students.uploadPhoto.path, authMiddleware, upload.single("photo"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const photoUrl = `/uploads/${req.file.filename}`;
    const student = await storage.updateStudent(Number(req.params.id), { photoUrl });
    res.json({ photoUrl, student });
  });

  // ─── ADMISSIONS ────────────────────────────────────────────────────────────
  app.get(api.admissions.list.path, authMiddleware, async (req, res) => {
    const { status } = req.query as any;
    const result = await storage.getAdmissions(status);
    res.json(result);
  });

  app.get(api.admissions.get.path, authMiddleware, async (req, res) => {
    const result = await storage.getAdmissionById(Number(req.params.id));
    if (!result) return res.status(404).json({ message: "Admission not found" });
    res.json(result);
  });

  app.post(api.admissions.create.path, async (req, res) => {
    try {
      const data = insertAdmissionSchema.parse(req.body);
      const result = await storage.createAdmission(data);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.put(api.admissions.update.path, authMiddleware, async (req, res) => {
    const result = await storage.updateAdmission(Number(req.params.id), req.body);
    res.json(result);
  });

  app.post(api.admissions.approve.path, authMiddleware, async (req, res) => {
    const result = await storage.updateAdmission(Number(req.params.id), { status: "approved" });
    res.json(result);
  });

  app.post(api.admissions.reject.path, authMiddleware, async (req, res) => {
    const { remarks } = req.body;
    const result = await storage.updateAdmission(Number(req.params.id), { status: "rejected", remarks });
    res.json(result);
  });

  app.post(api.admissions.convert.path, authMiddleware, async (req, res) => {
    try {
      const student = await storage.convertToStudent(Number(req.params.id));
      res.json(student);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ─── ATTENDANCE ────────────────────────────────────────────────────────────
  app.get(api.attendance.list.path, authMiddleware, async (req, res) => {
    const { class: cls, section, date, studentId } = req.query as any;
    const result = await storage.getAttendance({ class: cls, section, date, studentId: studentId ? Number(studentId) : undefined });
    res.json(result);
  });

  app.get(api.attendance.summary.path, authMiddleware, async (req, res) => {
    const result = await storage.getAttendanceSummary();
    res.json(result);
  });

  app.post(api.attendance.mark.path, authMiddleware, async (req: any, res) => {
    try {
      const data = insertAttendanceSchema.parse({ ...req.body, markedBy: req.user.id });
      const result = await storage.markAttendance(data);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to mark attendance" });
    }
  });

  app.put(api.news.update.path, authMiddleware, async (req, res) => {
  try {
    const updateData = { ...req.body };
    // Convert date string to a proper Date object to prevent toISOString errors
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }
    const result = await storage.updateNews(Number(req.params.id), updateData);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to update notice" });
  }
});

  // ─── TIMETABLE ─────────────────────────────────────────────────────────────
  app.get(api.timetable.list.path, authMiddleware, async (req, res) => {
    const { class: cls, section, day } = req.query as any;
    const result = await storage.getTimetable({ class: cls, section, day });
    res.json(result);
  });

  app.post(api.timetable.create.path, authMiddleware, async (req, res) => {
    try {
      const data = insertTimetableSchema.parse(req.body);
      const result = await storage.createTimetable(data);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create timetable entry" });
    }
  });

  app.put(api.timetable.update.path, authMiddleware, async (req, res) => {
    const result = await storage.updateTimetable(Number(req.params.id), req.body);
    res.json(result);
  });

  app.delete(api.timetable.delete.path, authMiddleware, async (req, res) => {
    await storage.deleteTimetable(Number(req.params.id));
    res.status(204).send();
  });

  // ─── EXAMS ─────────────────────────────────────────────────────────────────
  app.get(api.exams.list.path, authMiddleware, async (req, res) => {
    const { class: cls } = req.query as any;
    const result = await storage.getExams({ class: cls });
    res.json(result);
  });

  app.post(api.exams.create.path, authMiddleware, async (req, res) => {
    try {
      const data = insertExamSchema.parse(req.body);
      const result = await storage.createExam(data);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  app.put(api.exams.update.path, authMiddleware, async (req, res) => {
    const data = { ...req.body };
    if (data.examDate) data.examDate = new Date(data.examDate);
    const result = await storage.updateExam(Number(req.params.id), data);
    res.json(result);
  });

  app.delete(api.exams.delete.path, authMiddleware, async (req, res) => {
    await storage.deleteExam(Number(req.params.id));
    res.status(204).send();
  });

  // ─── MARKS ─────────────────────────────────────────────────────────────────
  app.get(api.marks.byExam.path, authMiddleware, async (req, res) => {
    const result = await storage.getMarksByExam(Number(req.params.examId));
    res.json(result);
  });

  app.get(api.marks.byStudent.path, authMiddleware, async (req, res) => {
    const result = await storage.getMarksByStudent(Number(req.params.studentId));
    res.json(result);
  });

  app.post(api.marks.create.path, authMiddleware, async (req, res) => {
    try {
      const data = insertMarkSchema.parse(req.body);
      const result = await storage.createMark(data);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to add marks" });
    }
  });

  app.put(api.marks.update.path, authMiddleware, async (req, res) => {
    const result = await storage.updateMark(Number(req.params.id), req.body);
    res.json(result);
  });

  app.delete(api.marks.delete.path, authMiddleware, async (req, res) => {
    await storage.deleteMark(Number(req.params.id));
    res.status(204).send();
  });

  // ─── FEES ──────────────────────────────────────────────────────────────────
  app.get(api.fees.structures.path, authMiddleware, async (req, res) => {
    const { class: cls } = req.query as any;
    const result = await storage.getFeeStructures(cls);
    res.json(result);
  });

  app.post(api.fees.createStructure.path, authMiddleware, async (req, res) => {
    const data = insertFeeStructureSchema.parse(req.body);
    const result = await storage.createFeeStructure(data);
    res.status(201).json(result);
  });

  app.get(api.fees.payments.path, authMiddleware, async (req, res) => {
    const { studentId, month, year, status } = req.query as any;
    const result = await storage.getFeePayments({ studentId: studentId ? Number(studentId) : undefined, month, year: year ? Number(year) : undefined, status });
    res.json(result);
  });

  app.post(api.fees.createPayment.path, authMiddleware, async (req: any, res) => {
    try {
      const paymentData = { ...req.body, collectedBy: req.user.id };
      
      // Ensure numeric types are handled correctly
      if (paymentData.studentId) paymentData.studentId = Number(paymentData.studentId);
      if (paymentData.year) paymentData.year = Number(paymentData.year);

      // Handle date conversion
      if (paymentData.paidAt) {
        paymentData.paidAt = new Date(paymentData.paidAt);
      } else {
        paymentData.paidAt = new Date();
      }

      const data = insertFeePaymentSchema.parse(paymentData);
      const result = await storage.createFeePayment(data);
      res.status(201).json(result);
    } catch (err) {
      console.error("Payment Error:", err);
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to record payment" });
    }
  });

  // ─── PDF EXPORT ────────────────────────────────────────────────────────────
  app.get("/api/admin/students/:id/export-pdf", authMiddleware, async (req, res) => {
    try {
      const student = await storage.getStudentById(Number(req.params.id));
      if (!student) return res.status(404).send("Student not found");

      const doc = new PDFDocument({ margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=Student_${student.admissionNumber}.pdf`);
      doc.pipe(res);

      // School Header
      doc.fontSize(20).text("S.N. PUBLIC SCHOOL", { align: "center" });
      doc.fontSize(10).text("Varanasi–Lucknow Road, Pindra, UP – 221206", { align: "center" });
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(16).text("STUDENT INFORMATION CARD", { align: "center", underline: true });
      doc.moveDown();

      const details = [
        ["Admission No:", student.admissionNumber],
        ["Name:", student.name],
        ["Class:", `${student.class}-${student.section}`],
        ["Roll No:", student.rollNumber || "N/A"],
        ["PEN No:", student.penNo || "N/A"],
        ["Aadhaar No:", student.aadhaarNo || "N/A"],
        ["Father's Name:", student.fatherName],
        ["Mother's Name:", student.motherName],
        ["Date of Birth:", student.dob],
        ["Phone:", student.phone],
        ["Address:", student.address],
      ];

      details.forEach(([label, value]) => {
        doc.fontSize(12).font("Helvetica-Bold").text(label, { continued: true })
           .font("Helvetica").text(` ${value}`);
        doc.moveDown(0.5);
      });

      doc.end();
    } catch (err) {
      res.status(500).send("Error generating PDF");
    }
  });

  app.put(api.fees.updatePayment.path, authMiddleware, async (req, res) => {
    const result = await storage.updateFeePayment(Number(req.params.id), req.body);
    res.json(result);
  });

  app.get(api.fees.stats.path, authMiddleware, async (req, res) => {
    const result = await storage.getFeeStats();
    res.json(result);
  });

  // ─── STAFF ─────────────────────────────────────────────────────────────────
  app.get(api.staff.list.path, authMiddleware, async (req, res) => {
    const { search } = req.query as any;
    const result = await storage.getStaff(search);
    res.json(result);
  });

  app.get(api.staff.get.path, authMiddleware, async (req, res) => {
    const result = await storage.getStaffById(Number(req.params.id));
    if (!result) return res.status(404).json({ message: "Staff not found" });
    res.json(result);
  });

  app.post(api.staff.create.path, authMiddleware, async (req, res) => {
    try {
      const data = insertStaffSchema.parse(req.body);
      const result = await storage.createStaff(data);
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to create staff" });
    }
  });

  app.put(api.staff.update.path, authMiddleware, async (req, res) => {
    const data = { ...req.body };
    if (data.joiningDate) data.joiningDate = new Date(data.joiningDate);
    const result = await storage.updateStaff(Number(req.params.id), data);
    res.json(result);
  });

  app.delete(api.staff.delete.path, authMiddleware, async (req, res) => {
    await storage.deleteStaff(Number(req.params.id));
    res.status(204).send();
  });

  // ─── SALARY ────────────────────────────────────────────────────────────────
  app.get(api.salary.list.path, authMiddleware, async (req, res) => {
    const { staffId } = req.query as any;
    const result = await storage.getSalaryPayments(staffId ? Number(staffId) : undefined);
    res.json(result);
  });

  app.post(api.salary.create.path, authMiddleware, async (req, res) => {
    const data = insertSalaryPaymentSchema.parse(req.body);
    const result = await storage.createSalaryPayment(data);
    res.status(201).json(result);
  });

  app.get(api.salary.summary.path, authMiddleware, async (req, res) => {
    const result = await storage.getSalarySummary();
    res.json(result);
  });

  // ─── FINANCE ───────────────────────────────────────────────────────────────
  app.get(api.finance.income.path, authMiddleware, async (req, res) => {
    res.json(await storage.getIncome());
  });

  app.post(api.finance.createIncome.path, authMiddleware, async (req, res) => {
    const data = insertIncomeSchema.parse(req.body);
    const result = await storage.createIncome(data);
    res.status(201).json(result);
  });

  app.delete(api.finance.deleteIncome.path, authMiddleware, async (req, res) => {
    await storage.deleteIncome(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.finance.expenses.path, authMiddleware, async (req, res) => {
    res.json(await storage.getExpenses());
  });

  app.post(api.finance.createExpense.path, authMiddleware, async (req, res) => {
    const data = insertExpenseSchema.parse(req.body);
    const result = await storage.createExpense(data);
    res.status(201).json(result);
  });

  app.delete(api.finance.deleteExpense.path, authMiddleware, async (req, res) => {
    await storage.deleteExpense(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.finance.summary.path, authMiddleware, async (req, res) => {
    res.json(await storage.getFinanceSummary());
  });

  // ─── INVENTORY ─────────────────────────────────────────────────────────────
  app.get(api.inventory.list.path, authMiddleware, async (req, res) => {
    const { search } = req.query as any;
    res.json(await storage.getInventory(search));
  });

  app.post(api.inventory.create.path, authMiddleware, async (req, res) => {
    const data = insertInventorySchema.parse(req.body);
    const result = await storage.createInventory(data);
    res.status(201).json(result);
  });

  app.put(api.inventory.update.path, authMiddleware, async (req, res) => {
    const result = await storage.updateInventory(Number(req.params.id), req.body);
    res.json(result);
  });

  app.delete(api.inventory.delete.path, authMiddleware, async (req, res) => {
    await storage.deleteInventory(Number(req.params.id));
    res.status(204).send();
  });

  // ─── TRANSPORT ─────────────────────────────────────────────────────────────
  app.get(api.transport.buses.path, authMiddleware, async (req, res) => {
    res.json(await storage.getBuses());
  });

  app.post(api.transport.createBus.path, authMiddleware, async (req, res) => {
    const data = insertBusSchema.parse(req.body);
    const result = await storage.createBus(data);
    res.status(201).json(result);
  });

  app.put(api.transport.updateBus.path, authMiddleware, async (req, res) => {
    const result = await storage.updateBus(Number(req.params.id), req.body);
    res.json(result);
  });

  app.delete(api.transport.deleteBus.path, authMiddleware, async (req, res) => {
    await storage.deleteBus(Number(req.params.id));
    res.status(204).send();
  });

  app.get(api.transport.assignments.path, authMiddleware, async (req, res) => {
    const { busId } = req.query as any;
    res.json(await storage.getBusAssignments(busId ? Number(busId) : undefined));
  });

  app.post(api.transport.createAssignment.path, authMiddleware, async (req, res) => {
    const data = insertBusAssignmentSchema.parse(req.body);
    const result = await storage.createBusAssignment(data);
    res.status(201).json(result);
  });

  app.delete(api.transport.deleteAssignment.path, authMiddleware, async (req, res) => {
    await storage.deleteBusAssignment(Number(req.params.id));
    res.status(204).send();
  });

  // ─── GALLERY ───────────────────────────────────────────────────────────────
  app.get(api.gallery.list.path, async (req, res) => {
    const { admin } = req.query as any;
    const published = admin === "true" ? undefined : true;
    res.json(await storage.getGallery(published));
  });

  app.post(api.gallery.upload.path, authMiddleware, upload.single("image"), async (req: any, res) => {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });
    const imageUrl = `/uploads/${req.file.filename}`;
    const item = await storage.createGallery({
      title: req.body.title || "Untitled",
      description: req.body.description,
      imageUrl,
      category: req.body.category || "general",
      isPublished: true,
    });
    res.status(201).json(item);
  });

  app.post(api.gallery.create.path, authMiddleware, async (req, res) => {
    const data = insertGallerySchema.parse(req.body);
    const result = await storage.createGallery(data);
    res.status(201).json(result);
  });

  app.put(api.gallery.update.path, authMiddleware, async (req, res) => {
    const result = await storage.updateGallery(Number(req.params.id), req.body);
    res.json(result);
  });

  app.delete(api.gallery.delete.path, authMiddleware, async (req, res) => {
    await storage.deleteGallery(Number(req.params.id));
    res.status(204).send();
  });

  // ─── NEWS ──────────────────────────────────────────────────────────────────
  app.get(api.news.list.path, async (req, res) => {
    const { admin } = req.query as any;
    const published = admin === "true" ? undefined : true;
    res.json(await storage.getNews(published));
  });

  app.post(api.news.create.path, authMiddleware, async (req, res) => {
    const data = insertNewsSchema.parse(req.body);
    const result = await storage.createNews(data);
    res.status(201).json(result);
  });

  app.put(api.news.update.path, authMiddleware, async (req, res) => {
    const result = await storage.updateNews(Number(req.params.id), req.body);
    res.json(result);
  });

  app.delete(api.news.delete.path, authMiddleware, async (req, res) => {
    await storage.deleteNews(Number(req.params.id));
    res.status(204).send();
  });

  // ─── CONTACT ───────────────────────────────────────────────────────────────
  app.post(api.contact.send.path, async (req, res) => {
    try {
      const data = insertContactMessageSchema.parse(req.body);
      const result = await storage.createContactMessage(data);
      res.status(201).json({ success: true, message: "Message sent successfully", id: result.id });
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get(api.contact.messages.path, authMiddleware, async (req, res) => {
    res.json(await storage.getContactMessages());
  });

  app.put(api.contact.markRead.path, authMiddleware, async (req, res) => {
    await storage.markMessageRead(Number(req.params.id));
    res.json({ success: true });
  });

  app.delete(api.contact.delete.path, authMiddleware, async (req, res) => {
    await storage.deleteContactMessage(Number(req.params.id));
    res.status(204).send();
  });

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────
  app.get(api.dashboard.stats.path, authMiddleware, async (req, res) => {
    res.json(await storage.getDashboardStats());
  });

  app.get(api.dashboard.attendanceTrend.path, authMiddleware, async (req, res) => {
    res.json(await storage.getAttendanceTrend());
  });

  app.get(api.dashboard.revenueChart.path, authMiddleware, async (req, res) => {
    res.json(await storage.getRevenueChart());
  });

  // await seedDatabase();
  return httpServer;
  // ─── STUDENT PDF EXPORT ───────────────────────────────────────────────
app.get("/api/students/:id/pdf", authMiddleware, async (req, res) => {
  try {
    const student = await storage.getStudentById(Number(req.params.id));

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=student-${student.admissionNumber}.pdf`
    );

    doc.pipe(res);

    // School Header
    doc
      .fontSize(22)
      .text("S.N. Public School", { align: "center" });

    doc
      .fontSize(16)
      .text("Student Profile Report", { align: "center" });

    doc.moveDown(2);

    // Student Details
    doc.fontSize(12);

    doc.text(`Admission Number: ${student.admissionNumber}`);
    doc.text(`Name: ${student.name}`);
    doc.text(`Father Name: ${student.fatherName}`);
    doc.text(`Mother Name: ${student.motherName}`);
    doc.text(`Date of Birth: ${student.dob}`);
    doc.text(`Gender: ${student.gender}`);
    doc.text(`Class: ${student.class}`);
    doc.text(`Section: ${student.section}`);
    doc.text(`Roll Number: ${student.rollNumber || "-"}`);
    doc.text(`Phone: ${student.phone}`);
    doc.text(`Email: ${student.email || "-"}`);
    doc.text(`PEN No: ${student.penNo || "-"}`);
    doc.text(`Aadhaar No: ${student.aadhaarNo || "-"}`);
    doc.text(`Address: ${student.address}`);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
});
}