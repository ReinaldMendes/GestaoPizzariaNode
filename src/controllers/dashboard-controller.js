// src/controllers/dashboard-controller.js
import Venda from '../models/venda-model.js';
import Pizza from '../models/pizza-model.js';

// Exemplo para pizzas vendidas por sabor
export const pizzasVendidas = async (req, res) => {
  try {
    const resultados = await Venda.aggregate([
      { $unwind: '$produtos' },
      {
        $lookup: {
          from: 'pizzas',
          localField: 'produtos.produto',
          foreignField: '_id',
          as: 'pizza',
        },
      },
      { $unwind: '$pizza' },
      {
        $group: {
          _id: '$pizza.sabor',
          quantidade: { $sum: '$produtos.quantidade' },
        },
      },
      {
        $project: {
          sabor: '$_id',
          quantidade: 1,
          _id: 0,
        },
      },
    ]);
    res.json(resultados);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
