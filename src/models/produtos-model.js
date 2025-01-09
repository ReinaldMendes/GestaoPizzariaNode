import { Schema, model } from "mongoose";

const produtoSchema = new Schema(
  {
    nome: {
      type: String,
      required: true,
    },
    descricao: {
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

const Produto = model("Produto", produtoSchema);

export default Produto;
