import { Schema, model } from "mongoose";

const vendaSchema = new Schema(
  {
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    produtos: [
      {
        produto: {
          type: Schema.Types.ObjectId,
          ref: "Produto", // Referência ao modelo de produtos
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
