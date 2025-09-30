import Venda from "../models/venda-model.js";
import Pizza from "../models/pizza-model.js";
import mongoose from 'mongoose';

export const index = async (req, res) => {
  try {
    const vendas = await Venda.find()
      .populate({
        path: "cliente",
        select: "nome endereco telefone"
      })
      .populate("usuario", "name email")
      .populate("produtos.produto", "sabor preco estoque")
      .exec();
    res.json(vendas);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const show = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const venda = await Venda.findById(id)
      .populate({
        path: "cliente",
        select: "nome endereco telefone"
      })
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { cliente, produtos, usuario, promocao } = req.body;

    if (!usuario) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: "Usuário (vendedor) é obrigatório" });
    }

    let total = 0;
    const produtosFinal = [];

    for (const item of produtos) {
      const { produto: pizzaId, quantidade } = item;

      const pizza = await Pizza.findById(pizzaId).session(session).exec();

      if (!pizza) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ error: `Produto com ID ${pizzaId} não encontrado` });
      }

      if (pizza.estoque < quantidade) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ error: `Estoque insuficiente para pizza ${pizza.sabor}` });
      }

      pizza.estoque -= quantidade;
      await pizza.save({ session });

      total += pizza.preco * quantidade;

      produtosFinal.push({
        produto: pizza._id,
        quantidade,
        precoUnitario: pizza.preco,
      });
    }

    const venda = await Venda.create([{
      cliente,
      usuario,
      produtos: produtosFinal,
      total,
      retirada: false,
      promocao,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(venda[0]);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Erro ao processar a venda:', error);
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const venda = await Venda.findById(req.params.id).session(session).exec();
    if (!venda) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    for (const item of venda.produtos) {
      const pizza = await Pizza.findById(item.produto).session(session).exec();
      if (pizza) {
        pizza.estoque += item.quantidade;
        await pizza.save({ session });
      }
    }

    await Venda.findByIdAndDelete(req.params.id).session(session).exec();

    await session.commitTransaction();
    session.endSession();

    res.status(204).json();

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Erro ao deletar venda:', error);
    res.status(400).send(error.message);
  }
};

export const vendasMensal = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    const filtro = {};

    if (dataInicio || dataFim) {
      filtro.dataVenda = {};
      if (dataInicio) filtro.dataVenda.$gte = new Date(dataInicio);
      if (dataFim) filtro.dataVenda.$lte = new Date(dataFim);
    } else {
      // Padrão: Ano atual
      const now = new Date();
      const inicioAno = new Date(now.getFullYear(), 0, 1);
      const fimAno = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      filtro.dataVenda = {
        $gte: inicioAno,
        $lte: fimAno
      };
    }

    const vendasPorMes = await Venda.aggregate([
      { $match: filtro },
      {
        $group: {
          _id: { $month: "$dataVenda" },
          totalVendas: { $sum: "$total" },
          quantidade: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const resultado = meses.map((mes, index) => {
      const dadosMes = vendasPorMes.find(v => v._id === index + 1);
      return {
        mes,
        totalVendas: dadosMes ? dadosMes.totalVendas : 0,
        quantidade: dadosMes ? dadosMes.quantidade : 0
      };
    });

    res.json(resultado);

  } catch (error) {
    console.error('Erro ao buscar vendas mensais:', error);
    res.status(500).json({ erro: 'Erro ao buscar vendas mensais' });
  }
};

export async function maisVendidas(req, res) {
  try {
    const resultado = await Venda.aggregate([
      { $unwind: "$produtos" },
      {
        $group: {
          _id: "$produtos.produto",
          totalVendida: { $sum: "$produtos.quantidade" }
        }
      },
      {
        $lookup: {
          from: "pizzas",
          localField: "_id",
          foreignField: "_id",
          as: "pizza"
        }
      },
      { $unwind: "$pizza" },
      {
        $project: {
          _id: 0,
          sabor: "$pizza.sabor",
          totalVendida: 1
        }
      },
      { $sort: { totalVendida: -1 } },
      { $limit: 10 }
    ]);

    const labels = resultado.map((item) => item.sabor);
    const dados = resultado.map((item) => item.totalVendida);

    res.json({ labels, dados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar pizzas mais vendidas" });
  }
};