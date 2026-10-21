
import { z } from "zod";


export const createOrderSchema = z
  .object({
    customer: z.object({
    name: z.string().trim().min(2, "Customer name must be at least 2 characters"),
    email: z.string().trim().email("Please provide a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please provide a valid Indian mobile number"),
    address: z.string().trim().min(5, "Delivery address must be at least 5 characters"),
  }),

    items: z
      .array(
        z.object({
          productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
          quantity: z
            .number()
            .int("Quantity must be a whole number")
            .min(1, "Quantity must be at least 1")
            .max(100, "Quantity cannot exceed 100"),
        })
      )
      .min(1, "An order must contain at least one item"),
  })
  .refine(
    (data) => {
      const productIds = data.items.map((item) => item.productId.toLowerCase());
      return new Set(productIds).size === productIds.length;
    },
    {
      message: "A product can appear only once in an order.",
      path: ["items"],
    }
  );

export type CreateOrderInput = z.infer<typeof createOrderSchema>;