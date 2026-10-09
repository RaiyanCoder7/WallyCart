
import type { Request, Response } from "express";
import Product from "../models/Product.js";
import { Types } from "mongoose";
import { createProductSchema } from "../validators/productValidator.js";

export const getProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { search, category, minPrice, maxPrice } = req.query;

    const filter: Record<string, unknown> = {};

    if (typeof search === "string" && search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (typeof category === "string" && category.trim()) {
      filter.category = category.trim();
    }

    const priceFilter: { $gte?: number; $lte?: number } = {};
    
    if (typeof minPrice === "string" && minPrice.trim() !== "") {
      const parsedMinPrice = Number(minPrice);
      if (!Number.isFinite(parsedMinPrice) || parsedMinPrice < 0) {
        res.status(400).json({
          success: false,
          message: "minPrice must be a non-negative number.",
        });
        return;
      }
      
      priceFilter.$gte = parsedMinPrice;
    }
    
    if (typeof maxPrice === "string" && maxPrice.trim() !== "") {
      const parsedMaxPrice = Number(maxPrice);
      if (!Number.isFinite(parsedMaxPrice) || parsedMaxPrice < 0) {
        res.status(400).json({
          success: false,
          message: "maxPrice must be a non-negative number.",
        });
        return;
      }
      
      priceFilter.$lte = parsedMaxPrice;
    }
    
    if (
      priceFilter.$gte !== undefined &&
      priceFilter.$lte !== undefined &&
      priceFilter.$gte > priceFilter.$lte
    ) {
      res.status(400).json({
        success: false,
        message: "minPrice cannot be greater than maxPrice.",
      });
      return;
    }
    
    if (Object.keys(priceFilter).length > 0) {
      filter.price = priceFilter;
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve products.",
    });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = req.params.id;

    if (typeof productId !== "string" || !Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
      return;
    }

    const product = await Product.findById(productId);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Failed to fetch product:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve product.",
    });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = req.params.id;

    if (typeof productId !== "string" || !Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
      return;
    }

    const result = createProductSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product data.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      result.data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Failed to update product:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update product.",
    });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = req.params.id;

    if (typeof productId !== "string" || !Types.ObjectId.isValid(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
      return;
    }
    
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete product:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = createProductSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid product data.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const product = await Product.create(result.data);

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Failed to create product:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
};