import { Request, Response } from "express";
import * as productService from "./product.service.js";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";
import {
  createProductSchema,
  updateProductSchema,
} from "./product.validation.js";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = createProductSchema.parse(req.body);

    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const product = await productService.createProduct({
      ...data,
      imageUrl,
    }, req.user);

    res.status(201).json({ message: "Product created successfully", product });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    // Pass 'req.query' as the second argument so the service gets the page and search values
    const result = await productService.getProducts(req.user, req.query);

    res.json({
      message: "Products retrieved successfully",
      products: result.data,        // Array of products for TanStack Query
      pagination: result.pagination  // Pagination metadata (total, totalPages, etc.)
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const data = updateProductSchema.parse(req.body);

    const product = await productService.updateProduct(
      req.params.id,
      data,
      req.user
    );

    res.json({ message: "Product updated successfully", product });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await productService.deleteProduct(req.params.id, req.user);

    res.json({ message: "Product deleted Successfully" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};