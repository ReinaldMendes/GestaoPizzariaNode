import { Schema, model } from "mongoose";

const clienteSchema = new Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },
    telefone: {
      type: String,
      required: true,
      trim: true,
    },
    endereco: {
      rua: { type: String, required: true, trim: true },
      numero: { type: String, required: true, trim: true },
      bairro: { type: String, required: true, trim: true },
      cidade: { type: String, required: true, trim: true },
    
    },
  },
  { timestamps: true }
);

const Cliente = model("Cliente", clienteSchema);

export default Cliente;
