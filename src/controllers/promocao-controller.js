import Promocao from '../models/promocao-model.js';
import Venda from '../models/venda-model.js';
import Pizza from '../models/pizza-model.js';
import Produto from '../models/produtos-model.js';

// Função para criar uma nova promoção
export const store = async (req, res) => {
  try {
    const promocao = await Promocao.create(req.body);
    res.status(201).json(promocao);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Função para listar todas as promoções, com filtro opcional por data
export const index = async (req, res) => {
  try {
    const { data } = req.query;
    const filtro = {};

    if (data) {
      const dataFiltro = new Date(data);
      // Busca promoções que estejam ativas na data do filtro
      filtro.dataInicio = { $lte: dataFiltro };
      filtro.dataFim = { $gte: dataFiltro };
    }

    const promocoes = await Promocao.find(filtro).populate('pizzasIncluidas', 'sabor preco').exec();
    res.json(promocoes);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Função para calcular o relatório de uma promoção específica
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
      .populate({
        path: 'produtos.produto',
        model: 'Pizza',
        populate: {
          path: 'ingredientes.produto',
          model: 'Produto'
        }
      })
      .exec();

    let receitaBruta = 0;
    let despesaTotal = 0;

    vendasPromocao.forEach(venda => {
      venda.produtos.forEach(item => {
        if (item.produto) {
          // Receita Bruta (preço da pizza)
          receitaBruta += item.produto.preco * item.quantidade;

          // Despesa (custo dos ingredientes)
          item.produto.ingredientes.forEach(ingrediente => {
            if (ingrediente.produto) {
              despesaTotal += ingrediente.produto.preco * ingrediente.quantidade_usada * item.quantidade;
            }
          });
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