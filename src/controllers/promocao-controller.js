// src/controllers/promocao-controller.js
import Promocao from '../models/promocao-model.js';
import Venda from '../models/venda-model.js';

// Função para criar uma nova promoção
export const store = async (req, res) => {
  try {
    const promocao = await Promocao.create(req.body);
    res.status(201).json(promocao);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Função para listar todas as promoções
export const index = async (req, res) => {
  try {
    const promocoes = await Promocao.find().populate('pizzasIncluidas', 'sabor preco').exec();
    res.json(promocoes);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// 🔹 Função para calcular o relatório de uma promoção específica
export const relatorioPromocao = async (req, res) => {
  try {
    const { id } = req.params;

    // Procura a promoção
    const promocao = await Promocao.findById(id).exec();
    if (!promocao) {
      return res.status(404).json({ error: "Promoção não encontrada" });
    }

    // Busca todas as vendas associadas a essa promoção
    const vendasPromocao = await Venda.find({ promocao: id })
      .populate('produtos.produto', 'preco custo') // Popula com preco e custo da pizza
      .exec();

    let receitaBruta = 0;
    let despesaTotal = 0;

    vendasPromocao.forEach(venda => {
      venda.produtos.forEach(item => {
        // Verifica se o produto foi populado corretamente
        if (item.produto) {
          receitaBruta += item.produto.preco * item.quantidade;
          despesaTotal += item.produto.custo * item.quantidade;
        }
      });
    });

    const lucro = receitaBruta - despesaTotal;

    res.json({
      promocao: promocao.nome,
      receitaBruta,
      despesaTotal,
      lucro,
    });

  } catch (error) {
    console.error('Erro ao gerar relatório da promoção:', error);
    res.status(500).json({ error: "Erro ao gerar relatório da promoção" });
  }
};