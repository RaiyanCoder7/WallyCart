
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    offer: {
      type: String,
      default: "",
      trim: true,
    },

    healthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

export type ProductDocument = InferSchemaType<
  typeof productSchema
>;

const Product = mongoose.model(
  "Product",
  productSchema
);

export default Product;