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

        <button type="button" @click="adicionarPizza">Adicionar Pizza</button>

        <button type="submit">Registrar Venda</button>
      </form>

      <h2>Lista de Vendas</h2>
      <table v-if="vendas.length" class="vendas-table">
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
          <tr v-for="venda in vendas" :key="venda._id">
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
              />
            </td>
            <td>
              <button @click="removerVenda(venda._id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Nenhuma venda registrada ainda.</p>
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import PrivateLayout from "../components/PrivateLayout.vue";

const API_VENDAS = "http://localhost:3000/vendas";
const API_CLIENTES = "http://localhost:3000/clientes";
const API_PIZZAS = "http://localhost:3000/pizzas";
const API_USUARIOS = "http://localhost:3000/usuario"; // rota correta

axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

const vendas = ref([]);
const clientes = ref([]);
const pizzas = ref([]);
const usuarios = ref([]);

const sucesso = ref("");
const erro = ref("");

const usuarioSelecionado = ref("");

// Dados para nova venda
const novaVenda = ref({
  cliente: "",
  pizzas: [
    {
      pizza: "",
      quantidade: 1,
    },
  ],
});

// Carregar dados
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

// Manipulação do formulário

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
</script>

<style scoped>
.vendas-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
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

.venda-form button {
  padding: 0.5rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  width: fit-content;
}

.venda-form button:hover {
  background-color: #095c45;
}

.produto-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.produto-item button {
  background-color: red;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;
}

.produto-item button:hover {
  background-color: darkred;
}

.vendas-table {
  width: 100%;
  border-collapse: collapse;
}

.vendas-table th,
.vendas-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
  vertical-align: top;
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
</style>
