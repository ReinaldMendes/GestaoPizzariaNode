// src/models/promocao-model.js
import mongoose from 'mongoose';

const PromocaoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true
  },
  descricao: {
    type: String,
    required: false
  },
  // Use um array para incluir várias pizzas na mesma promoção
  pizzasIncluidas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pizza'
  }],
  dataInicio: {
    type: Date,
    required: true
  },
  dataFim: {
    type: Date,
    required: true
  },
  ativa: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Promocao = mongoose.model('Promocao', PromocaoSchema);

export default Promocao;