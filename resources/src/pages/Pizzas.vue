<template>
  <PrivateLayout>
    <div class="pizzas-page">
      <h1>Pizzas 🍕</h1>

      <!-- Mensagens -->
      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

      <!-- Formulário de nova pizza -->
      <form @submit.prevent="salvarPizza" class="pizza-form">
        <label for="sabor">Sabor:</label>
        <input v-model="form.sabor" id="sabor" type="text" required placeholder="Ex: Calabresa" />

        <label for="preco">Preço:</label>
        <input v-model.number="form.preco" id="preco" type="number" step="0.01" required placeholder="Ex: 35.00" />

        <label for="estoque">Estoque:</label>
        <input v-model.number="form.estoque" id="estoque" type="number" min="0" required placeholder="Ex: 10" />

        <div class="form-actions">
          <button type="submit">{{ editando ? 'Atualizar' : 'Cadastrar' }}</button>
          <button v-if="editando" type="button" @click="cancelarEdicao" class="cancel-btn">Cancelar</button>
        </div>
      </form>

      <!-- Lista de pizzas -->
      <h2>Lista de Pizzas</h2>
      <table v-if="pizzas.length" class="pizzas-table">
        <thead>
          <tr>
            <th>Sabor</th>
            <th>Preço (R$)</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pizza in pizzas" :key="pizza._id">
            <td>{{ pizza.sabor }}</td>
            <td>{{ pizza.preco.toFixed(2) }}</td>
            <td>{{ pizza.estoque }}</td>
            <td>
              <button @click="editarPizza(pizza)">Editar</button>
              <button @click="removerPizza(pizza._id)" class="danger">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Nenhuma pizza cadastrada ainda.</p>
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import PrivateLayout from "../components/PrivateLayout.vue";

const API_PIZZAS = "http://localhost:3000/pizzas";

axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

const pizzas = ref([]);
const form = ref({ sabor: "", preco: null, estoque: null });
const sucesso = ref("");
const erro = ref("");
const editando = ref(false);
const editandoId = ref(null);

const carregarPizzas = async () => {
  try {
    const res = await axios.get(API_PIZZAS);
    pizzas.value = res.data;
  } catch (e) {
    erro.value = "Erro ao carregar pizzas.";
  }
};

onMounted(() => {
  carregarPizzas();
});

const salvarPizza = async () => {
  erro.value = "";
  sucesso.value = "";

  try {
    if (editando.value) {
      await axios.put(`${API_PIZZAS}/${editandoId.value}`, form.value);
      sucesso.value = "Pizza atualizada com sucesso!";
    } else {
      await axios.post(API_PIZZAS, form.value);
      sucesso.value = "Pizza cadastrada com sucesso!";
    }

    form.value = { sabor: "", preco: null, estoque: null };
    editando.value = false;
    editandoId.value = null;
    carregarPizzas();
    setTimeout(() => (sucesso.value = ""), 3000);
  } catch (e) {
    erro.value = e.response?.data?.error || "Erro ao salvar pizza.";
  }
};

const editarPizza = (pizza) => {
  form.value = { sabor: pizza.sabor, preco: pizza.preco, estoque: pizza.estoque };
  editandoId.value = pizza._id;
  editando.value = true;
};

const cancelarEdicao = () => {
  form.value = { sabor: "", preco: null, estoque: null };
  editando.value = false;
  editandoId.value = null;
};

const removerPizza = async (id) => {
  if (!confirm("Deseja realmente excluir esta pizza?")) return;
  try {
    await axios.delete(`${API_PIZZAS}/${id}`);
    sucesso.value = "Pizza removida com sucesso!";
    carregarPizzas();
    setTimeout(() => (sucesso.value = ""), 3000);
  } catch (e) {
    erro.value = "Erro ao remover pizza.";
  }
};
</script>

<style scoped>
.pizzas-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.pizza-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.pizza-form input {
  padding: 0.5rem;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.pizza-form button {
  padding: 0.5rem 1rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #999;
}

.pizza-form button:hover {
  background-color: #095c45;
}

.pizzas-table {
  width: 100%;
  border-collapse: collapse;
}

.pizzas-table th,
.pizzas-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
}

.pizzas-table th {
  background-color: #0c7c59;
  color: white;
}

.pizzas-table tr:hover {
  background-color: #f5f5f5;
}

.pizzas-table button {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.pizzas-table button:hover {
  opacity: 0.9;
}

.pizzas-table .danger {
  background-color: red;
  color: white;
  margin-left: 0.5rem;
}

.success-message {
  color: green;
  font-weight: bold;
}

.error-message {
  color: red;
  font-weight: bold;
}
</style>
