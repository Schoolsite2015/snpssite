import { z } from "zod";

export const errorSchemas = {
  notFound: z.object({ message: z.string() }),
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    login: { method: "POST" as const, path: "/api/auth/login" as const },
    me: { method: "GET" as const, path: "/api/auth/me" as const },
  },
  students: {
    list: { method: "GET" as const, path: "/api/students" as const },
    get: { method: "GET" as const, path: "/api/students/:id" as const },
    create: { method: "POST" as const, path: "/api/students" as const },
    update: { method: "PUT" as const, path: "/api/students/:id" as const },
    delete: { method: "DELETE" as const, path: "/api/students/:id" as const },
    generateTC: { method: "POST" as const, path: "/api/students/:id/tc" as const },
    uploadPhoto: { method: "POST" as const, path: "/api/students/:id/photo" as const },
  },
  admissions: {
    list: { method: "GET" as const, path: "/api/admissions" as const },
    get: { method: "GET" as const, path: "/api/admissions/:id" as const },
    create: { method: "POST" as const, path: "/api/admissions" as const },
    update: { method: "PUT" as const, path: "/api/admissions/:id" as const },
    approve: { method: "POST" as const, path: "/api/admissions/:id/approve" as const },
    reject: { method: "POST" as const, path: "/api/admissions/:id/reject" as const },
    convert: { method: "POST" as const, path: "/api/admissions/:id/convert" as const },
  },
  attendance: {
    list: { method: "GET" as const, path: "/api/attendance" as const },
    mark: { method: "POST" as const, path: "/api/attendance" as const },
    update: { method: "PUT" as const, path: "/api/attendance/:id" as const },
    summary: { method: "GET" as const, path: "/api/attendance/summary" as const },
  },
  timetable: {
    list: { method: "GET" as const, path: "/api/timetable" as const },
    create: { method: "POST" as const, path: "/api/timetable" as const },
    update: { method: "PUT" as const, path: "/api/timetable/:id" as const },
    delete: { method: "DELETE" as const, path: "/api/timetable/:id" as const },
  },
  exams: {
    list: { method: "GET" as const, path: "/api/exams" as const },
    create: { method: "POST" as const, path: "/api/exams" as const },
    update: { method: "PUT" as const, path: "/api/exams/:id" as const },
    delete: { method: "DELETE" as const, path: "/api/exams/:id" as const },
  },
  marks: {
    list: { method: "GET" as const, path: "/api/marks" as const },
    create: { method: "POST" as const, path: "/api/marks" as const },
    update: { method: "PUT" as const, path: "/api/marks/:id" as const },
    delete: { method: "DELETE" as const, path: "/api/marks/:id" as const },
    byExam: { method: "GET" as const, path: "/api/marks/exam/:examId" as const },
    byStudent: { method: "GET" as const, path: "/api/marks/student/:studentId" as const },
  },
  fees: {
    structures: { method: "GET" as const, path: "/api/fees/structures" as const },
    createStructure: { method: "POST" as const, path: "/api/fees/structures" as const },
    payments: { method: "GET" as const, path: "/api/fees/payments" as const },
    createPayment: { method: "POST" as const, path: "/api/fees/payments" as const },
    updatePayment: { method: "PUT" as const, path: "/api/fees/payments/:id" as const },
    stats: { method: "GET" as const, path: "/api/fees/stats" as const },
  },
  staff: {
    list: { method: "GET" as const, path: "/api/staff" as const },
    get: { method: "GET" as const, path: "/api/staff/:id" as const },
    create: { method: "POST" as const, path: "/api/staff" as const },
    update: { method: "PUT" as const, path: "/api/staff/:id" as const },
    delete: { method: "DELETE" as const, path: "/api/staff/:id" as const },
  },
  salary: {
    list: { method: "GET" as const, path: "/api/salary" as const },
    create: { method: "POST" as const, path: "/api/salary" as const },
    summary: { method: "GET" as const, path: "/api/salary/summary" as const },
  },
  finance: {
    income: { method: "GET" as const, path: "/api/finance/income" as const },
    createIncome: { method: "POST" as const, path: "/api/finance/income" as const },
    deleteIncome: { method: "DELETE" as const, path: "/api/finance/income/:id" as const },
    expenses: { method: "GET" as const, path: "/api/finance/expenses" as const },
    createExpense: { method: "POST" as const, path: "/api/finance/expenses" as const },
    deleteExpense: { method: "DELETE" as const, path: "/api/finance/expenses/:id" as const },
    summary: { method: "GET" as const, path: "/api/finance/summary" as const },
  },
  inventory: {
    list: { method: "GET" as const, path: "/api/inventory" as const },
    create: { method: "POST" as const, path: "/api/inventory" as const },
    update: { method: "PUT" as const, path: "/api/inventory/:id" as const },
    delete: { method: "DELETE" as const, path: "/api/inventory/:id" as const },
  },
  transport: {
    buses: { method: "GET" as const, path: "/api/transport/buses" as const },
    createBus: { method: "POST" as const, path: "/api/transport/buses" as const },
    updateBus: { method: "PUT" as const, path: "/api/transport/buses/:id" as const },
    deleteBus: { method: "DELETE" as const, path: "/api/transport/buses/:id" as const },
    assignments: { method: "GET" as const, path: "/api/transport/assignments" as const },
    createAssignment: { method: "POST" as const, path: "/api/transport/assignments" as const },
    deleteAssignment: { method: "DELETE" as const, path: "/api/transport/assignments/:id" as const },
  },
  gallery: {
    list: { method: "GET" as const, path: "/api/gallery" as const },
    create: { method: "POST" as const, path: "/api/gallery" as const },
    update: { method: "PUT" as const, path: "/api/gallery/:id" as const },
    delete: { method: "DELETE" as const, path: "/api/gallery/:id" as const },
    upload: { method: "POST" as const, path: "/api/gallery/upload" as const },
  },
  news: {
    list: { method: "GET" as const, path: "/api/news" as const },
    create: { method: "POST" as const, path: "/api/news" as const },
    update: { method: "PUT" as const, path: "/api/news/:id" as const },
    delete: { method: "DELETE" as const, path: "/api/news/:id" as const },
  },
  contact: {
    messages: { method: "GET" as const, path: "/api/contact/messages" as const },
    send: { method: "POST" as const, path: "/api/contact" as const },
    markRead: { method: "PUT" as const, path: "/api/contact/messages/:id/read" as const },
    delete: { method: "DELETE" as const, path: "/api/contact/messages/:id" as const },
  },
  dashboard: {
    stats: { method: "GET" as const, path: "/api/dashboard/stats" as const },
    attendanceTrend: { method: "GET" as const, path: "/api/dashboard/attendance-trend" as const },
    revenueChart: { method: "GET" as const, path: "/api/dashboard/revenue-chart" as const },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
