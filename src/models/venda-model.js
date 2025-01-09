import { Schema, model } from "mongoose";

const vendaSchema = new Schema(
  {
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "User", // Referência ao cliente (usuário)
      required: true,
    },
    pizzas: [
      {
        pizza: {
          type: Schema.Types.ObjectId,
          ref: "Pizza", // Referência ao modelo de pizzas
          required: true,
        },
        quantidade: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    dataVenda: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Venda = model("Venda", vendaSchema);

export default Venda;
