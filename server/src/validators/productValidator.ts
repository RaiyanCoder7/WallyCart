
import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2, "Product name is required"),

  category: z.string().trim().min(2, "Category is required"),

  price: z.number().positive("Price must be greater than zero"),

  image: z.string().trim().min(1, "Image is required"),

  offer: z.string().trim().default(""),

  healthScore: z.number().min(0).max(10),
});