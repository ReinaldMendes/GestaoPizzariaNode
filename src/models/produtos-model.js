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
    // 🔹 NOVO CAMPO: unidade de medida para o ingrediente
    unidadeMedida: {
      type: String,
      enum: ['g', 'ml', 'un', 'm'], // Exemplo: gramas, mililitros, unidades, metros
      required: true,
    },
  },
  { timestamps: true }
);

const Produto = model("Produto", produtoSchema);

export default Produto;