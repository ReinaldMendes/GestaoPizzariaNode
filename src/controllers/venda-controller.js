import Venda from "../models/venda-model.js";
import Pizza from "../models/pizza-model.js";

export const index = async (req, res) => {
  try {
    const vendas = await Venda.find()
      .populate("cliente", "nome email")
      .populate("usuario", "name email") // novo
      .populate("produtos.produto", "sabor preco estoque")
      .exec();
    res.json(vendas);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

import mongoose from 'mongoose';

export const show = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const venda = await Venda.findById(id)
      .populate("cliente", "nome email")
      .populate("usuario", "name email")
      .populate("produtos.produto", "sabor preco estoque")
      .exec();

    if (!venda) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    res.json(venda);
  } catch (error) {
    res.status(400).send(error.message);
  }
};


export const store = async (req, res) => {
  try {
    const { cliente, produtos, usuario } = req.body; // ✅ aqui importa o usuário

    if (!usuario) {
      return res.status(400).json({ error: "Usuário (vendedor) é obrigatório" });
    }

    let total = 0;
    const produtosFinal = [];

    for (const item of produtos) {
      const pizza = await Pizza.findById(item.produto).exec();
      if (!pizza) {
        return res.status(404).json({ error: `Produto com ID ${item.produto} não encontrado` });
      }

      if (pizza.estoque < item.quantidade) {
        return res
          .status(400)
          .json({ error: `Estoque insuficiente para pizza ${pizza.sabor}` });
      }

      const precoUnitario = pizza.preco;
      const subtotal = precoUnitario * item.quantidade;
      total += subtotal;

      pizza.estoque -= item.quantidade;
      await pizza.save();

      produtosFinal.push({
        produto: pizza._id,
        quantidade: item.quantidade,
        precoUnitario,
      });
    }

    const venda = await Venda.create({
      cliente,
      usuario, // ✅ agora definido corretamente
      produtos: produtosFinal,
      total,
      retirada: false,
    });

    res.status(201).json(venda);
  } catch (error) {
    res.status(400).send(error.message);
  }
};


export const updateRetirada = async (req, res) => {
  try {
    const { id } = req.params;
    const { retirada } = req.body;

    const venda = await Venda.findByIdAndUpdate(
      id,
      { retirada },
      { new: true }
    ).exec();

    if (!venda) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    res.json(venda);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const destroy = async (req, res) => {
  try {
    const venda = await Venda.findById(req.params.id).exec();
    if (!venda) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    for (const item of venda.produtos) {
      const pizza = await Pizza.findById(item.produto).exec();
      if (pizza) {
        pizza.estoque += item.quantidade;
        await pizza.save();
      }
    }

    await Venda.findByIdAndDelete(req.params.id).exec();
    res.status(204).json();
  } catch (error) {
    res.status(400).send(error.message);
  }
};
export const vendasMensal = async (req, res) => {
  console.log("Query params recebidos:", req.query);
  try {
    const { dataInicio, dataFim } = req.query;
    // Filtros de data recebidos via query
    // Exemplo: /vendas/mensal?dataInicio=2025-01-01&dataFim=2025-06-30
    
  

    const filtro = {};

if (dataInicio || dataFim) {
  filtro.dataVenda = {};
  if (dataInicio) filtro.dataVenda.$gte = new Date(dataInicio);
  if (dataFim) filtro.dataVenda.$lte = new Date(dataFim);
}

const resultados = await Venda.aggregate([
  { $match: filtro },
  {
    $group: {
      _id: {
        ano: { $year: "$dataVenda" },
        mes: { $month: "$dataVenda" }
      },
      totalVendas: { $sum: "$total" }
    }
  },
  {
    $sort: { "_id.ano": 1, "_id.mes": 1 }
  }
]);


    // Formata o resultado para algo mais amigável
    const meses = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const resposta = resultados.map(item => ({
      ano: item._id.ano,
      mesNum: item._id.mes,
      mes: meses[item._id.mes - 1],
      total: item.totalVendas
    }));

    res.json(resposta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
