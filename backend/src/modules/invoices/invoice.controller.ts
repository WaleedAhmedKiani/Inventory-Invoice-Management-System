import { Request, Response } from "express";
import * as service from "./invoice.service.js";
import { createInvoiceSchema } from "./invoice.validation.js";
import * as invoiceService from "./invoice.service.js";

// ^Create a new invoice
export const createInvoice = async (req: Request, res: Response) => {
  try {
    const data = createInvoiceSchema.parse(req.body);

    const invoice = await service.createInvoice(data, req.user);

    res.status(201).json({message: "Invoice created successfully", invoice });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ^Get Invoice details
export const getInvoices = async (req: Request, res: Response) => {
  try {
    const invoices = await service.getInvoices(req.user, req.query);

    res.json({message: "Invoices retrieved successfully", ...invoices });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ^Delete Invoice - DEV ONLY (will add "soft delete" later)
export const deleteInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user; 

    const result = await invoiceService.deleteInvoice(id, user);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    // Handle the specific "Senior" guards built
    if (
      error.message.includes("production") || 
      error.message.includes("PAID")
    ) {
      return res.status(403).json({
        success: false,
        error: "Forbidden",
        message: error.message,
      });
    }

    // Handle "Not Found"
    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    // Generic Server Error
    console.error("Delete Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during deletion",
    });
  }
};

// ^Get single invoice details
export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoice = await service.getInvoiceById(
      req.params.id,
      req.user
    );

    res.json({message: "Invoice retrieved successfully", invoice });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

// ^Cancel an invoice (soft delete)
export const cancelInvoice = async (req: Request, res: Response) => {
  try {
    const result = await service.cancelInvoice(
      req.params.id,
      req.user
    );

    res.json({message: "Invoice cancelled successfully", result });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
// ^Generate PDF for an invoice
export const downloadInvoicePdf = async (req: Request, res: Response) => {
  try {
    const pdf = await service.getInvoicePdf(
      req.params.id,
      req.user
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${req.params.id}.pdf`
    );

    res.send(pdf);
  } catch (err: any) {
    console.error("PDF Generation Error:", err);
    
    if (err.message === "Invoice not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(400).json({ error: err.message });
  }
};

// ^Mark invoice as paid
export const markInvoicePaid = async (req: Request, res: Response) => {
  try {
    const result = await service.markInvoicePaid(
      req.params.id,
      req.user
    );

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

