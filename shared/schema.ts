import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fatherHusbandName: text("father_husband_name"),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  bloodGroup: text("blood_group"),
  medicalHistory: text("medical_history"),
  admissionDateTime: timestamp("admission_date_time"),
  dischargeDateTime: timestamp("discharge_date_time"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  billNumber: text("bill_number").notNull().unique(),
  patientId: integer("patient_id").notNull(),
  billDate: timestamp("bill_date").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const billItems = pgTable("bill_items", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull(),
  serialNumber: integer("serial_number").default(1),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
});

export const serviceItems = pgTable("service_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
}).extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  fatherHusbandName: z.string().optional(),
  age: z.number().min(1, "Age must be at least 1").max(120, "Age must be less than 120"),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().optional().refine(val => !val || val === "" || z.string().email().safeParse(val).success, "Invalid email format"),
  admissionDateTime: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : undefined),
  dischargeDateTime: z.union([z.string(), z.date()]).optional().transform(val => val ? new Date(val) : undefined),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  billNumber: true,
  createdAt: true,
}).extend({
  patientId: z.number().min(1, "Patient is required"),
  billDate: z.date(),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  tax: z.number().min(0, "Tax must be positive"),
  discount: z.number().min(0, "Discount must be positive").default(0),
  total: z.number().min(0, "Total must be positive"),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    rate: z.number().min(0, "Rate must be positive"),
    discount: z.number().min(0, "Discount must be positive").default(0),
    amount: z.number().min(0, "Amount must be positive"),
  })).min(1, "At least one item is required"),
});

export const insertServiceItemSchema = createInsertSchema(serviceItems).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1, "Service name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;
export type BillItem = typeof billItems.$inferSelect;
export type InsertServiceItem = z.infer<typeof insertServiceItemSchema>;
export type ServiceItem = typeof serviceItems.$inferSelect;

export interface BillWithItems extends Bill {
  items: BillItem[];
  patient: Patient;
}
