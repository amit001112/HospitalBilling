import { patients, bills, billItems, serviceItems, type Patient, type InsertPatient, type Bill, type InsertBill, type BillItem, type BillWithItems, type ServiceItem, type InsertServiceItem } from "@shared/schema";
import { patientDb, billingDb } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Patient operations
  getPatient(id: number): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  searchPatients(query: string): Promise<Patient[]>;
  
  // Bill operations
  getBill(id: number): Promise<BillWithItems | undefined>;
  getAllBills(): Promise<BillWithItems[]>;
  createBill(bill: InsertBill): Promise<BillWithItems>;
  updateBillStatus(id: number, status: string): Promise<BillWithItems | undefined>;
  deleteBill(id: number): Promise<boolean>;
  getBillsByPatient(patientId: number): Promise<BillWithItems[]>;
  
  // Service item operations
  getServiceItem(id: number): Promise<ServiceItem | undefined>;
  getAllServiceItems(): Promise<ServiceItem[]>;
  createServiceItem(serviceItem: InsertServiceItem): Promise<ServiceItem>;
  updateServiceItem(id: number, serviceItem: Partial<InsertServiceItem>): Promise<ServiceItem | undefined>;
  deleteServiceItem(id: number): Promise<boolean>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalPatients: number;
    todayBills: number;
    todayRevenue: number;
    pendingBills: number;
    recentPatients: Patient[];
    recentBills: BillWithItems[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Patient operations using patientDb
  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await patientDb.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getAllPatients(): Promise<Patient[]> {
    return await patientDb.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await patientDb
      .insert(patients)
      .values(insertPatient)
      .returning();
    return patient;
  }

  async updatePatient(id: number, updateData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [patient] = await patientDb
      .update(patients)
      .set(updateData)
      .where(eq(patients.id, id))
      .returning();
    return patient || undefined;
  }

  async deletePatient(id: number): Promise<boolean> {
    const result = await patientDb.delete(patients).where(eq(patients.id, id));
    return (result.rowCount || 0) > 0;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const allPatients = await this.getAllPatients();
    const lowerQuery = query.toLowerCase();
    return allPatients.filter(patient =>
      patient.firstName.toLowerCase().includes(lowerQuery) ||
      patient.lastName.toLowerCase().includes(lowerQuery) ||
      patient.phone.includes(query)
    );
  }

  // Billing operations using billingDb
  async getBill(id: number): Promise<BillWithItems | undefined> {
    const [bill] = await billingDb.select().from(bills).where(eq(bills.id, id));
    if (!bill) return undefined;
    
    const items = await billingDb.select().from(billItems).where(eq(billItems.billId, id));
    const [patient] = await patientDb.select().from(patients).where(eq(patients.id, bill.patientId));
    if (!patient) return undefined;
    
    return { ...bill, items, patient };
  }

  async getAllBills(): Promise<BillWithItems[]> {
    const allBills = await billingDb.select().from(bills).orderBy(desc(bills.createdAt));
    const billsWithItems: BillWithItems[] = [];
    
    for (const bill of allBills) {
      const items = await billingDb.select().from(billItems).where(eq(billItems.billId, bill.id));
      const [patient] = await patientDb.select().from(patients).where(eq(patients.id, bill.patientId));
      if (patient) {
        billsWithItems.push({ ...bill, items, patient });
      }
    }
    
    return billsWithItems;
  }

  async createBill(insertBill: InsertBill): Promise<BillWithItems> {
    // Verify patient exists before creating bill
    const [patient] = await patientDb.select().from(patients).where(eq(patients.id, insertBill.patientId));
    if (!patient) {
      throw new Error(`Patient with ID ${insertBill.patientId} not found`);
    }
    
    // Generate bill number: Try sequential first, fallback to timestamp if needed
    let billNumber: string;
    try {
      const existingBills = await billingDb.select().from(bills);
      if (existingBills.length === 0) {
        billNumber = "B000001";
      } else {
        const billNumbers = existingBills.map(bill => {
          const match = bill.billNumber.match(/B(\d+)/);
          return match ? parseInt(match[1]) : 0;
        });
        const nextNumber = Math.max(...billNumbers) + 1;
        billNumber = `B${nextNumber.toString().padStart(6, '0')}`;
      }
    } catch {
      // Fallback to timestamp-based numbering if sequential fails
      const timestamp = Date.now();
      billNumber = `B${timestamp.toString().slice(-6)}`;
    }
    
    const [bill] = await billingDb
      .insert(bills)
      .values({
        billNumber,
        patientId: insertBill.patientId,
        billDate: insertBill.billDate,
        subtotal: insertBill.subtotal.toFixed(2),
        tax: insertBill.tax.toFixed(2),
        discount: insertBill.discount.toFixed(2),
        total: insertBill.total.toFixed(2),
        status: insertBill.status,
        notes: insertBill.notes || null,
      })
      .returning();
    
    const itemsToInsert = insertBill.items.map((item, index) => ({
      billId: bill.id,
      serialNumber: index + 1,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate.toFixed(2),
      discount: item.discount ? item.discount.toFixed(2) : "0.00",
      amount: item.amount.toFixed(2),
    }));
    
    const items = await billingDb
      .insert(billItems)
      .values(itemsToInsert)
      .returning();
    
    return { ...bill, items, patient };
  }

  async updateBillStatus(id: number, status: string): Promise<BillWithItems | undefined> {
    const [bill] = await billingDb
      .update(bills)
      .set({ status })
      .where(eq(bills.id, id))
      .returning();
    
    if (!bill) return undefined;
    
    const items = await billingDb.select().from(billItems).where(eq(billItems.billId, id));
    const [patient] = await patientDb.select().from(patients).where(eq(patients.id, bill.patientId));
    if (!patient) return undefined;
    
    return { ...bill, items, patient };
  }

  async deleteBill(id: number): Promise<boolean> {
    await billingDb.delete(billItems).where(eq(billItems.billId, id));
    const result = await billingDb.delete(bills).where(eq(bills.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getBillsByPatient(patientId: number): Promise<BillWithItems[]> {
    const patientBills = await billingDb.select().from(bills).where(eq(bills.patientId, patientId));
    const billsWithItems: BillWithItems[] = [];
    
    for (const bill of patientBills) {
      const items = await billingDb.select().from(billItems).where(eq(billItems.billId, bill.id));
      const [patient] = await patientDb.select().from(patients).where(eq(patients.id, bill.patientId));
      if (patient) {
        billsWithItems.push({ ...bill, items, patient });
      }
    }
    
    return billsWithItems;
  }

  async getDashboardStats() {
    const allPatients = await this.getAllPatients();
    const allBills = await this.getAllBills();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const todayBills = allBills.filter(bill => {
      const billDate = new Date(bill.billDate);
      return billDate >= today && billDate <= todayEnd;
    });
    
    const todayRevenue = todayBills.reduce((sum, bill) => sum + parseFloat(bill.total), 0);
    const pendingBills = allBills.filter(bill => bill.status === 'pending').length;
    
    const recentPatients = allPatients.slice(-5).reverse();
    const recentBills = allBills.slice(-5).reverse();
    
    return {
      totalPatients: allPatients.length,
      todayBills: todayBills.length,
      todayRevenue,
      pendingBills,
      recentPatients,
      recentBills,
    };
  }

  // Service item operations using billingDb
  async getServiceItem(id: number): Promise<ServiceItem | undefined> {
    const [serviceItem] = await billingDb.select().from(serviceItems).where(eq(serviceItems.id, id));
    return serviceItem || undefined;
  }

  async getAllServiceItems(): Promise<ServiceItem[]> {
    return await billingDb.select().from(serviceItems).orderBy(desc(serviceItems.createdAt));
  }

  async createServiceItem(insertServiceItem: InsertServiceItem): Promise<ServiceItem> {
    const [serviceItem] = await billingDb
      .insert(serviceItems)
      .values({
        ...insertServiceItem,
        price: insertServiceItem.price.toFixed(2),
      })
      .returning();
    return serviceItem;
  }

  async updateServiceItem(id: number, updateData: Partial<InsertServiceItem>): Promise<ServiceItem | undefined> {
    const updateValues = { ...updateData };
    if (updateData.price !== undefined) {
      updateValues.price = updateData.price.toFixed(2) as any;
    }
    
    const [serviceItem] = await billingDb
      .update(serviceItems)
      .set(updateValues)
      .where(eq(serviceItems.id, id))
      .returning();
    return serviceItem || undefined;
  }

  async deleteServiceItem(id: number): Promise<boolean> {
    const result = await billingDb.delete(serviceItems).where(eq(serviceItems.id, id));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
