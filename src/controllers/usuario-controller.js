import User from "../models/usuario-model.js";
import jwtServices from "../services/jwt-services.js";

export const signup = async (req, res) => {
  try {
    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password, // Criptografa a senha
      role: req.body.role,
    });
    const token = jwtServices.generateAcessToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    const user = await User.findOne({ email }).exec()

    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    const valid = await user.isValidPassword(password)
    if (!valid) {
      return res.status(401).json({ error: 'Email ou senha incorretos' })
    }

    const token = jwtServices.generateAcessToken(user)
    return res.status(200).json({ user: { id: user._id, email: user.email, role: user.role }, token })
  } catch (error) {
    console.error('Erro no login:', error)
    return res.status(500).json({ error: 'Erro interno no servidor' })
  }
}


export const store = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ error: "User not authenticated" });
    }

    const { name, email, password, role } = req.body;

    // Verifica se já existe usuário com email
    const userExistente = await User.findOne({ email }).exec();
    if(userExistente) {
      return res.status(400).json({ error: 'Já existe usuário com esse email' });
    }

    // Cria o usuário
    const novoUser = await User.create({ name, email, password, role });

    res.status(201).json(novoUser);
  } catch (error) {
    res.status(400).json({ error: error.message || error });
  }
};

export const index = async (req, res) => {
  try {
    const content = await User.find().exec();
    res.json(content);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const show = async (req, res) => {
  try {
    const content = await User.findById(req.params.id).exec();
    res.json(content);
  } catch (error) {
    res.status(400).json(error);
  }
};

export const update = async (req, res) => {
  try {
    const content = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).exec();
    res.json(content);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

export const destroy = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id).exec();
    res.status(204).json(); // Retorna status 204 para indicar exclusão sem conteúdo
  } catch (error) {
    res.status(400).json(error);
  }
};