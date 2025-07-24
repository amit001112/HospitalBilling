import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertBillSchema, insertServiceItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const { search } = req.query;
      let patients;
      
      if (search && typeof search === 'string') {
        patients = await storage.searchPatients(search);
      } else {
        patients = await storage.getAllPatients();
      }
      
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.log("Server error:", error);
      res.status(500).json({ message: "Failed to create patient" });
    }
  });

  app.put("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(id, validatedData);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update patient" });
    }
  });

  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePatient(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json({ message: "Patient deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Bill routes
  app.get("/api/bills", async (req, res) => {
    try {
      const { patientId } = req.query;
      let bills;
      
      if (patientId) {
        bills = await storage.getBillsByPatient(parseInt(patientId as string));
      } else {
        bills = await storage.getAllBills();
      }
      
      res.json(bills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.get("/api/bills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bill = await storage.getBill(id);
      
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      res.json(bill);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  app.post("/api/bills", async (req, res) => {
    try {
      const validatedData = insertBillSchema.parse({
        ...req.body,
        billDate: new Date(req.body.billDate),
      });
      const bill = await storage.createBill(validatedData);
      res.status(201).json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create bill" });
    }
  });

  app.delete("/api/bills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBill(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      res.json({ message: "Bill deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete bill" });
    }
  });

  app.patch("/api/bills/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const updated = await storage.updateBillStatus(id, status);
      
      if (!updated) {
        return res.status(404).json({ message: "Bill not found" });
      }
      
      res.json({ message: "Bill status updated successfully", bill: updated });
    } catch (error) {
      res.status(500).json({ message: "Failed to update bill status" });
    }
  });

  // Service item routes
  app.get("/api/service-items", async (req, res) => {
    try {
      const serviceItems = await storage.getAllServiceItems();
      res.json(serviceItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service items" });
    }
  });

  app.get("/api/service-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const serviceItem = await storage.getServiceItem(id);
      
      if (!serviceItem) {
        return res.status(404).json({ message: "Service item not found" });
      }
      
      res.json(serviceItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service item" });
    }
  });

  app.post("/api/service-items", async (req, res) => {
    try {
      const validatedData = insertServiceItemSchema.parse(req.body);
      const serviceItem = await storage.createServiceItem(validatedData);
      res.status(201).json(serviceItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service item" });
    }
  });

  app.put("/api/service-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceItemSchema.partial().parse(req.body);
      const serviceItem = await storage.updateServiceItem(id, validatedData);
      
      if (!serviceItem) {
        return res.status(404).json({ message: "Service item not found" });
      }
      
      res.json(serviceItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service item" });
    }
  });

  app.delete("/api/service-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteServiceItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Service item not found" });
      }
      
      res.json({ message: "Service item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service item" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
