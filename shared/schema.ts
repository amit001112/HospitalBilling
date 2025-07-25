// shared/schema.ts

import { pgTable, text, serial, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =====================
// Database Tables
// =====================

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  firstname: text("first_name").notNull(),
  lastname: text("last_name").notNull(),
  fatherhusbandname: text("father_husband_name"),
  gender: text("gender").notNull(),
  dob: text("dob").notNull(),
  age: integer("age").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  emergencyContact: text("emergency_contact"),
  bloodGroup: text("blood_group"),
  history: text("history"),
  admissionDate: text("admission_date"),
  dischargeDate: text("discharge_date"),
  status: text("status").default("active"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  billNo: text("bill_no").notNull().unique(),
  date: text("date").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const serviceItems = pgTable("service_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// =====================
// Zod Schemas
// =====================

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  created_at: true,
});

export const zPatient = z.object({
  firstname: z.string().min(1, "First name is required"),
  lastname: z.string().min(1, "Last name is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  age: z.number().min(0).max(120, "Age must be less than 120"),
  dob: z.string().min(1, "Date of birth is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
  email: z.string().email("Invalid email format").optional(),
  fatherhusbandname: z.string().optional(),
  emergencyContact: z.string().optional(),
  bloodGroup: z.string().optional(),
  history: z.string().optional(),
  admissionDate: z.preprocess(
    val => typeof val === "string" ? new Date(val) : undefined,
    z.date()
  ).optional(),
  dischargeDate: z.preprocess(
    val => typeof val === "string" ? new Date(val) : undefined,
    z.date()
  ).optional(),
  status: z.string().default("active"),
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  created_at: true,
});

export const zBill = z.object({
  patientId: z.number().min(1, "Patient is required"),
  billNo: z.string().min(1, "Bill number is required"),
  quantity: z.string().regex(/^\d+(\.\d+)?$/, "Must be positive"),
  rate: z.string().regex(/^\d+(\.\d+)?$/, "Must be positive"),
  discount: z.string().regex(/^\d+(\.\d+)?$/, "Must be positive").default("0.00"),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Amount is required"),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
  date: z.string().min(1, "Date is required"),
});

export const zServiceItem = z.object({
  name: z.string().min(1, "Service name is required"),
  price: z.string().regex(/^\d+(\.\d+)?$/, "Price must be a valid number"),
  description: z.string().min(1, "Description is required"),
});
