import Pizza from "../models/pizza-model.js";

export const index = async (req, res) => {
  try {
    const pizzas = await Pizza.find().exec();
    res.json(pizzas);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const show = async (req, res) => {
  try {
    const pizza = await Pizza.findById(req.params.id).exec();
    if (!pizza) {
      return res.status(404).json({ error: "Pizza não encontrada" });
    }
    res.json(pizza);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const store = async (req, res) => {
  try {
    const { sabor, preco, estoque } = req.body;

    // Verifica se já existe uma pizza com o mesmo sabor
    const pizzaExistente = await Pizza.findOne({ sabor }).exec();
    if (pizzaExistente) {
      return res.status(400).json({ error: "Já existe uma pizza com esse sabor" });
    }

    const pizza = await Pizza.create({ sabor, preco, estoque });
    res.status(201).json(pizza);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { sabor, preco, estoque } = req.body;

    const pizza = await Pizza.findByIdAndUpdate(
      id,
      { sabor, preco, estoque },
      { new: true, runValidators: true }
    ).exec();

    if (!pizza) {
      return res.status(404).json({ error: "Pizza não encontrada" });
    }

    res.json(pizza);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const destroy = async (req, res) => {
  try {
    const pizza = await Pizza.findByIdAndDelete(req.params.id).exec();
    if (!pizza) {
      return res.status(404).json({ error: "Pizza não encontrada" });
    }
    res.status(204).json();
  } catch (error) {
    res.status(400).send(error.message);
  }
};
