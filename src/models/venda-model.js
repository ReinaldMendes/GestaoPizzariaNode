import { Schema, model } from "mongoose";

const vendaSchema = new Schema(
  {
    cliente: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    produtos: [
      {
        produto: {
          type: Schema.Types.ObjectId,
          ref: "Pizza", // <-- corrigido aqui
          required: true,
        },
        quantidade: {
          type: Number,
          required: true,
          min: 1,
        },
        precoUnitario: {
          type: Number,
          required: true,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    retirada: {
      type: Boolean,
      default: false,
    },
    dataVenda: {
      type: Date,
      default: Date.now,
    },
    promocao: {
      type: Schema.Types.ObjectId,
      ref: 'Promocao',
      required: false // uma venda pode ou não estar ligada a uma promoção
    },
  },
  { timestamps: true }
);
const Venda = model("Venda", vendaSchema);
export default Venda;
