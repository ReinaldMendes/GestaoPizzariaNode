// src/models/pizza-model.js
import mongoose from "mongoose";

const PizzaSchema = new mongoose.Schema({
  sabor: {
    type: String,
    required: true,
    unique: true
  },
  preco: {
    type: Number,
    required: true
  },
  estoque: {
    type: Number,
    required: true // O estoque da pizza finalizada
  },
  // 🔹 Campo de "receita"
  ingredientes: [{
    produto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produto' // Referencia a tabela de ingredientes
    },
    quantidade_usada: { // A quantidade de cada ingrediente usado (ex: 150 para gramas)
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

const Pizza = mongoose.model("Pizza", PizzaSchema);
export default Pizza;