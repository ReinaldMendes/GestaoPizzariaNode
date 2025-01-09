import Venda from "../models/venda-model.js";
import Pizza from "../models/pizza-model.js";

export const index = async (req, res) => {
  try {
    const vendas = await Venda.find()
      .populate("cliente", "name email") // Popula dados do cliente
      .populate("pizzas.pizza", "sabor preco estoque") // Popula dados das pizzas
      .exec();
    res.json(vendas);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const show = async (req, res) => {
  try {
    const venda = await Venda.findById(req.params.id)
      .populate("cliente", "name email")
      .populate("pizzas.pizza", "sabor preco estoque")
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
    const { cliente, pizzas } = req.body;

    let total = 0;

    for (const item of pizzas) {
      const pizza = await Pizza.findById(item.pizza).exec();
      if (!pizza) {
        return res.status(404).json({ error: `Pizza com ID ${item.pizza} não encontrada` });
      }

      // Verifica o estoque
      if (pizza.estoque < item.quantidade) {
        return res
          .status(400)
          .json({ error: `Estoque insuficiente para a pizza de sabor ${pizza.sabor}` });
      }

      // Atualiza o total
      total += pizza.preco * item.quantidade;

      // Diminui o estoque
      pizza.estoque -= item.quantidade;
      await pizza.save();
    }

    const venda = await Venda.create({ cliente, pizzas, total });
    res.status(201).json(venda);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const update = async (req, res) => {
  return res.status(400).json({ error: "Atualização de vendas não permitida." });
};

export const destroy = async (req, res) => {
  try {
    const venda = await Venda.findById(req.params.id).exec();
    if (!venda) {
      return res.status(404).json({ error: "Venda não encontrada" });
    }

    // Restaura o estoque ao excluir a venda
    for (const item of venda.pizzas) {
      const pizza = await Pizza.findById(item.pizza).exec();
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
