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

export const show = async (req, res) => {
  try {
    const venda = await Venda.findById(req.params.id)
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
