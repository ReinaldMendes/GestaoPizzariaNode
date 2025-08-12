<template>
  <PrivateLayout>
    <div class="vendas-page">
      <h1>Vendas de Pizzas 🍕</h1>

      <!-- Mensagens -->
      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

      <!-- Formulário de nova venda -->
      <form @submit.prevent="criarVenda" class="venda-form">
        <label for="cliente">Cliente:</label>
        <select v-model="novaVenda.cliente" required>
          <option disabled value="">Selecione um cliente</option>
          <option v-for="c in clientes" :key="c._id" :value="c._id">{{ c.nome }}</option>
        </select>

        <label for="usuario">Vendedor:</label>
        <select v-model="usuarioSelecionado" required>
          <option disabled value="">Selecione o vendedor</option>
          <option v-for="u in usuarios" :key="u._id" :value="u._id">
            {{ u.name }}
          </option>
        </select>

        <h3>Pizzas</h3>
        <div v-for="(item, index) in novaVenda.pizzas" :key="index" class="produto-item">
          <select v-model="item.pizza" @change="atualizarPreco(index)" required>
            <option disabled value="">Selecione uma pizza</option>
            <option v-for="p in pizzas" :key="p._id" :value="p._id">
              {{ p.sabor }} - R$ {{ p.preco.toFixed(2) }} (Estoque: {{ p.estoque }})
            </option>
          </select>
          <input
            type="number"
            v-model.number="item.quantidade"
            min="1"
            :max="getEstoque(item.pizza)"
            placeholder="Quantidade"
            required
          />
          <button type="button" @click="removerPizza(index)">Remover</button>
        </div>

        <!-- Botões do formulário -->
        <div class="botoes-form">
          <button type="button" @click="adicionarPizza" class="btn-adicionar">
            Adicionar Pizza
          </button>

          <button type="submit" class="btn-registrar">
            Registrar Venda
          </button>
        </div>
      </form>

      <h2>Lista de Vendas</h2>

      <!-- Campo de pesquisa -->
      <div class="search-container">
        <input
          type="text"
          v-model="filtroVendedor"
          placeholder="Buscar por vendedor..."
          class="search-input"
        />
      </div>

      <table v-if="vendasFiltradas.length" class="vendas-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th>Pizzas</th>
            <th>Total (R$)</th>
            <th>Retirada</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="venda in vendasPaginaAtual" 
            :key="venda._id"
            @click="abrirRotaGoogleMaps(venda.cliente?.endereco)" 
            style="cursor: pointer;"
          >
            <td>{{ venda.cliente?.nome || '—' }}</td>
            <td>{{ venda.usuario?.name || '—' }}</td>
            <td>
              <ul>
                <li v-for="item in venda.produtos" :key="item.produto._id">
                  {{ item.produto.sabor }} x {{ item.quantidade }} = R$ {{ (item.precoUnitario * item.quantidade).toFixed(2) }}
                </li>
              </ul>
            </td>
            <td>{{ venda.total.toFixed(2) }}</td>
            <td>
              <input
                type="checkbox"
                :checked="venda.retirada"
                @change="toggleRetirada(venda)"
                @click.stop
              />
            </td>
            <td>
              <button @click.stop="removerVenda(venda._id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>Nenhuma venda registrada ainda.</p>

      <!-- Paginação -->
      <div v-if="vendasFiltradas.length > itensPorPagina" class="paginacao">
        <button 
          @click="paginaAtual--" 
          :disabled="paginaAtual === 1"
        >
          Anterior
        </button>

        <button
          v-for="page in totalPaginas"
          :key="page"
          @click="paginaAtual = page"
          :class="{ ativo: paginaAtual === page }"
        >
          {{ page }}
        </button>

        <button 
          @click="paginaAtual++" 
          :disabled="paginaAtual === totalPaginas"
        >
          Próximo
        </button>
      </div>

      <!-- Botão imprimir relatório abaixo da lista -->
      <div class="relatorio-botoes">
        <button @click="imprimirRelatorio" class="btn-imprimir">
          Imprimir Relatório PDF
        </button>
      </div>
    </div>
  </PrivateLayout>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import PrivateLayout from "../components/PrivateLayout.vue";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_VENDAS = import.meta.env.VITE_API_URL + "/vendas";
const API_CLIENTES = import.meta.env.VITE_API_URL + "/clientes";
const API_PIZZAS = import.meta.env.VITE_API_URL + "/pizzas";
const API_USUARIOS = import.meta.env.VITE_API_URL + "/usuario";

axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

const vendas = ref([]);
const clientes = ref([]);
const pizzas = ref([]);
const usuarios = ref([]);

const sucesso = ref("");
const erro = ref("");

const usuarioSelecionado = ref("");
const filtroVendedor = ref("");

const novaVenda = ref({
  cliente: "",
  pizzas: [
    {
      pizza: "",
      quantidade: 1,
    },
  ],
});

// PAGINAÇÃO
const itensPorPagina = 10;
const paginaAtual = ref(1);

const vendasFiltradas = computed(() => {
  if (!filtroVendedor.value.trim()) return vendas.value;
  const termo = filtroVendedor.value.toLowerCase();
  return vendas.value.filter((v) =>
    v.usuario?.name?.toLowerCase().includes(termo)
  );
});

const totalPaginas = computed(() => {
  return Math.ceil(vendasFiltradas.value.length / itensPorPagina);
});

const vendasPaginaAtual = computed(() => {
  const start = (paginaAtual.value - 1) * itensPorPagina;
  return vendasFiltradas.value.slice(start, start + itensPorPagina);
});

const abrirRotaGoogleMaps = (endereco) => {
  if (!endereco || !endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade) {
    alert("Endereço do cliente incompleto ou não disponível.");
    return;
  }
  const enderecoCompleto = `${endereco.rua} ${endereco.numero}, ${endereco.bairro}, ${endereco.cidade}`;
  const enderecoEncoded = encodeURIComponent(enderecoCompleto);
  const url = `https://www.google.com/maps/dir/?api=1&destination=${enderecoEncoded}`;
  window.open(url, "_blank");
};

const carregarVendas = async () => {
  try {
    const res = await axios.get(API_VENDAS);
    vendas.value = res.data;
  } catch (e) {
    erro.value = "Erro ao carregar vendas: " + (e.response?.data?.error || e.message);
  }
};

const carregarClientes = async () => {
  try {
    const res = await axios.get(API_CLIENTES);
    clientes.value = res.data;
  } catch (e) {
    erro.value = "Erro ao carregar clientes: " + (e.response?.data?.error || e.message);
  }
};

const carregarPizzas = async () => {
  try {
    const res = await axios.get(API_PIZZAS);
    pizzas.value = res.data;
  } catch (e) {
    erro.value = "Erro ao carregar pizzas: " + (e.response?.data?.error || e.message);
  }
};

const carregarUsuarios = async () => {
  try {
    const res = await axios.get(API_USUARIOS);
    usuarios.value = res.data;
  } catch (e) {
    erro.value = "Erro ao carregar usuários: " + (e.response?.data?.error || e.message);
  }
};

onMounted(() => {
  carregarVendas();
  carregarClientes();
  carregarPizzas();
  carregarUsuarios();
});

// Form handlers
const adicionarPizza = () => {
  novaVenda.value.pizzas.push({ pizza: "", quantidade: 1 });
};

const removerPizza = (index) => {
  novaVenda.value.pizzas.splice(index, 1);
};

const getEstoque = (pizzaId) => {
  const pizza = pizzas.value.find((p) => p._id === pizzaId);
  return pizza ? pizza.estoque : 0;
};

const criarVenda = async () => {
  sucesso.value = "";
  erro.value = "";

  if (!novaVenda.value.cliente) {
    erro.value = "Selecione um cliente.";
    return;
  }

  if (!usuarioSelecionado.value) {
    erro.value = "Selecione um vendedor.";
    return;
  }

  for (const item of novaVenda.value.pizzas) {
    if (!item.pizza) {
      erro.value = "Selecione todas as pizzas.";
      return;
    }
    if (item.quantidade < 1) {
      erro.value = "Quantidade deve ser no mínimo 1.";
      return;
    }
    if (item.quantidade > getEstoque(item.pizza)) {
      erro.value = "Quantidade maior que estoque disponível.";
      return;
    }
  }

  const payload = {
    cliente: novaVenda.value.cliente,
    usuario: usuarioSelecionado.value,
    produtos: novaVenda.value.pizzas.map((item) => ({
      produto: item.pizza,
      quantidade: item.quantidade,
    })),
  };

  try {
    await axios.post(API_VENDAS, payload);
    sucesso.value = "Venda registrada com sucesso!";
    novaVenda.value = { cliente: "", pizzas: [{ pizza: "", quantidade: 1 }] };
    usuarioSelecionado.value = "";
    carregarVendas();
    carregarPizzas();
    paginaAtual.value = 1;
    setTimeout(() => (sucesso.value = ""), 3000);
  } catch (e) {
    erro.value = "Erro ao registrar venda: " + (e.response?.data?.error || e.message);
  }
};

const toggleRetirada = async (venda) => {
  try {
    await axios.put(`${API_VENDAS}/${venda._id}/retirada`, { retirada: !venda.retirada });
    carregarVendas();
  } catch (e) {
    erro.value = "Erro ao atualizar retirada: " + (e.response?.data?.error || e.message);
  }
};

const removerVenda = async (id) => {
  if (!confirm("Confirma exclusão da venda?")) return;
  try {
    await axios.delete(`${API_VENDAS}/${id}`);
    sucesso.value = "Venda removida com sucesso!";
    carregarVendas();
    carregarPizzas();
    setTimeout(() => (sucesso.value = ""), 3000);
  } catch (e) {
    erro.value = "Erro ao remover venda: " + (e.response?.data?.error || e.message);
  }
};

// Função para gerar relatório PDF
const imprimirRelatorio = () => {
  const doc = new jsPDF();

  const dataHora = new Date().toLocaleString();
  doc.setFontSize(18);
  doc.setTextColor("#0c7c59");
  doc.text("Relatório de Vendas de Pizzas", 14, 22);

  doc.setFontSize(11);
  doc.setTextColor("#444");
  doc.text(`Data da impressão: ${dataHora}`, 14, 30);

  // Dados para tabela
  const dadosTabela = vendasFiltradas.value.map((venda) => {
    const pizzasDesc = venda.produtos
      .map(
        (item) =>
          `${item.produto.sabor} x ${item.quantidade} = R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}`
      )
      .join("\n");

    return [
      venda.cliente?.nome || "—",
      venda.usuario?.name || "—",
      pizzasDesc,
      venda.total.toFixed(2),
      venda.retirada ? "Sim" : "Não",
    ];
  });

  autoTable(doc, {
    startY: 38,
    head: [["Cliente", "Vendedor", "Pizzas", "Total (R$)", "Retirada"]],
    body: dadosTabela,
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: "#0c7c59",
      textColor: "white",
      fontStyle: "bold",
    },
    columnStyles: {
      2: { cellWidth: 70 }, // Coluna pizzas maior
      3: { halign: "right" },
      4: { halign: "center" },
    },
    didDrawPage: (data) => {
      const str = `Página ${doc.internal.getNumberOfPages()}`;
      doc.setFontSize(9);
      doc.setTextColor("#888");
      doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
    },
  });

  doc.save("relatorio_vendas.pdf");
};
</script>
<style scoped>
.vendas-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.search-container {
  margin-bottom: 1rem;
}

.search-input {
  padding: 0.5rem;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;
}

.venda-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.venda-form select,
.venda-form input[type="number"] {
  padding: 0.5rem;
  font-size: 1rem;
  width: 100%;
}

.produto-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.produto-item button {
  background-color: red;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;
  margin-left: auto;
}

.produto-item button:hover {
  background-color: darkred;
}

.vendas-table {
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  display: block;
}

.vendas-table th,
.vendas-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
  vertical-align: top;
  min-width: 120px;
}

.vendas-table th {
  background-color: #0c7c59;
  color: white;
}

.vendas-table tr:hover {
  background-color: #f5f5f5;
}

.success-message {
  color: green;
  margin-bottom: 1rem;
  font-weight: bold;
}

.error-message {
  color: red;
  margin-bottom: 1rem;
  font-weight: bold;
}

.paginacao {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.paginacao button {
  background-color: #0c7c59;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  border-radius: 4px;
  font-weight: bold;
}

.paginacao button[disabled] {
  background-color: #aaa;
  cursor: not-allowed;
}

.paginacao button.ativo {
  background-color: #095c45;
}

/* Botões do formulário */
.botoes-form {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn-adicionar {
  background-color: #0c7c59;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  flex: 1 1 auto;
  max-width: 150px;
  transition: background-color 0.3s ease;
}

.btn-adicionar:hover {
  background-color: #095c45;
}

.btn-registrar {
  background-color: #0c7c59;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 700;
  flex: 1 1 auto;
  max-width: 180px;
  transition: background-color 0.3s ease;
  text-align: center;
}

.btn-registrar:hover {
  background-color: #095c45;
}

/* Botão imprimir relatório */
.relatorio-botoes {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.btn-imprimir {
  background-color: #0c7c59;
  color: white;
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: background-color 0.3s ease;
}

.btn-imprimir:hover {
  background-color: #095c45;
}

/* Responsividade */
@media (max-width: 600px) {
  .botoes-form {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-adicionar,
  .btn-registrar {
    max-width: 100%;
    flex: 1 1 100%;
  }
}
</style>