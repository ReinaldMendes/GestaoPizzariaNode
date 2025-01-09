import Cliente from "../models/cliente-model.js";

export const index = async (req, res) => {
  try {
    const clientes = await Cliente.find().exec();
    res.json(clientes);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const show = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id).exec();
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    res.json(cliente);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const store = async (req, res) => {
  try {
    const { nome, telefone, endereco } = req.body;

    // Verifica se já existe um cliente com o mesmo telefone
    const clienteExistente = await Cliente.findOne({ telefone }).exec();
    if (clienteExistente) {
      return res
        .status(400)
        .json({ error: "Já existe um cliente com esse telefone" });
    }

    const cliente = await Cliente.create({ nome, telefone, endereco });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, endereco } = req.body;

    const cliente = await Cliente.findByIdAndUpdate(
      id,
      { nome, telefone, endereco },
      { new: true, runValidators: true }
    ).exec();

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(cliente);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const destroy = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndDelete(req.params.id).exec();
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }
    res.status(204).json();
  } catch (error) {
    res.status(400).send(error.message);
  }
};
