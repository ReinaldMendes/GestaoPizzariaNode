import { Schema, model } from "mongoose";

const pizzaSchema = new Schema(
  {
    sabor: {
      type: String,
      required: true,
    },
    preco: {
      type: Number,
      required: true,
      min: 0,
    },
    estoque: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const Pizza = model("Pizza", pizzaSchema);

export default Pizza;
