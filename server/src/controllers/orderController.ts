
import type { Request, Response } from "express";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { createOrderSchema } from "../validators/orderValidator.js";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Validate customer details and requested products.
    const result = createOrderSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid order data.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const { customer, items } = result.data;

    // 2. Fetch the actual products from MongoDB.
    const productIds = items.map((item) => item.productId);

    const products = await Product.find({
      _id: { $in: productIds },
    });

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product])
    );

    // 3. Reject the order if any product no longer exists.
    const missingProductIds = [
      ...new Set(
        productIds.filter((id) => !productMap.has(id))
      ),
    ];

    if (missingProductIds.length > 0) {
      res.status(404).json({
        success: false,
        message: "One or more products were not found.",
        missingProductIds,
      });
      return;
    }

    // 4. Build order items using trusted database prices.
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;

      return {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
    });

    // 5. Calculate the total on the server.
    
    const subtotal = Number(
      orderItems
        .reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
        .toFixed(2)
    );

    const deliveryFee = subtotal >= 499 ? 0 : 40;

    const totalAmount = Number(
      (subtotal + deliveryFee).toFixed(2)
    );

    // 6. Save the order in MongoDB.
    
    const accessToken = randomBytes(32).toString("hex");

    const accessTokenHash = createHash("sha256")
      .update(accessToken)
      .digest("hex");

    const order = await Order.create({
      customer,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      accessTokenHash,
    });

    const savedOrder = order.toObject();

    const { accessTokenHash: _hiddenHash, ...safeOrder } = savedOrder;

    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      data: safeOrder,
      accessToken,
    });
  } catch (error) {
    console.error("Failed to create order:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create order.",
    });
  }
};


export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id;
    const accessToken = req.get("x-order-access-token");

    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
      return;
    }

    if (!accessToken || !/^[a-f\d]{64}$/i.test(accessToken)) {
      res.status(400).json({
        success: false,
        message: "A valid order access token is required.",
      });
      return;
    }

    const order = await Order.findById(id).select("+accessTokenHash");

    if (!order || !order.accessTokenHash) {
      res.status(404).json({
        success: false,
        message: "Order not found or access denied.",
      });
      return;
    }

    const providedHash = createHash("sha256")
      .update(accessToken)
      .digest("hex");

    const storedHashBuffer = Buffer.from(order.accessTokenHash, "hex");
    const providedHashBuffer = Buffer.from(providedHash, "hex");

    if (
      storedHashBuffer.length !== providedHashBuffer.length ||
      !timingSafeEqual(storedHashBuffer, providedHashBuffer)
    ) {
      res.status(404).json({
        success: false,
        message: "Order not found or access denied.",
      });
      return;
    }

    const savedOrder = order.toObject();
    const { accessTokenHash: _hiddenHash, ...safeOrder } = savedOrder;

    res.status(200).json({
      success: true,
      data: safeOrder,
    });
  } catch (error) {
    console.error("Failed to retrieve order:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve order.",
    });
  }
};