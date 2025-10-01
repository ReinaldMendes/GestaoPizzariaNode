<template>
  <PrivateLayout>
    <div class="pizzas-page">
      <h1>Pizzas 🍕</h1>

      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

      <form @submit.prevent="salvarPizza" class="pizza-form">
        <label for="sabor">Sabor:</label>
        <input v-model="form.sabor" id="sabor" type="text" required placeholder="Ex: Calabresa" />

        <label for="preco">Preço:</label>
        <input v-model.number="form.preco" id="preco" type="number" step="0.01" required placeholder="Ex: 35.00" />

        <label for="estoque">Estoque de Pizzas Prontas:</label>
        <input v-model.number="form.estoque" id="estoque" type="number" min="0" required placeholder="Ex: 10" />

        <div class="ingredientes-group">
          <label for="ingredientes-select">Ingredientes:</label>
          <div class="ingredientes-list-wrapper">
            <select
              v-model="ingredienteSelecionadoId"
              id="ingredientes-select"
              class="ingredientes-select"
            >
              <option value="">Selecione um ingrediente</option>
              <option v-for="ingrediente in ingredientesDisponiveis" :key="ingrediente._id" :value="ingrediente._id">
                {{ ingrediente.nome }}
              </option>
            </select>
            <input
              v-model.number="quantidadeIngrediente"
              type="number"
              min="1"
              placeholder="Qtd."
              class="quantidade-input"
            />
            <button type="button" @click="adicionarIngrediente" class="add-btn">Adicionar</button>
          </div>
          <ul class="ingredientes-selecionados">
            <li v-for="(item, index) in form.ingredientes" :key="index">
              {{ obterNomeIngrediente(item.produto) }} ({{ item.quantidade_usada }})
              <button type="button" @click="removerIngrediente(index)" class="remove-btn">x</button>
            </li>
          </ul>
        </div>

        <div class="form-actions">
          <button type="submit">{{ editando ? 'Atualizar' : 'Cadastrar' }}</button>
          <button v-if="editando" type="button" @click="cancelarEdicao" class="cancel-btn">Cancelar</button>
        </div>
      </form>

      <h2>Lista de Pizzas</h2>
      <div class="table-wrapper">
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
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import PrivateLayout from "../components/PrivateLayout.vue";

const API_PIZZAS = import.meta.env.VITE_API_URL + "/pizzas";
const API_PRODUTOS = import.meta.env.VITE_API_URL + "/produtos";

axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

const pizzas = ref([]);
const ingredientesDisponiveis = ref([]);
const ingredienteSelecionadoId = ref('');
const quantidadeIngrediente = ref(1);

const form = ref({
  sabor: "",
  preco: null,
  estoque: null,
  ingredientes: [] // 🔹 Novo array para a receita
});

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

const carregarIngredientes = async () => {
  try {
    const res = await axios.get(API_PRODUTOS);
    ingredientesDisponiveis.value = res.data;
  } catch (e) {
    erro.value = "Erro ao carregar ingredientes.";
  }
};

const obterNomeIngrediente = (id) => {
  const ingrediente = ingredientesDisponiveis.value.find(p => p._id === id);
  return ingrediente ? ingrediente.nome : 'Desconhecido';
};

const adicionarIngrediente = () => {
  if (ingredienteSelecionadoId.value && quantidadeIngrediente.value > 0) {
    const ingrediente = ingredientesDisponiveis.value.find(p => p._id === ingredienteSelecionadoId.value);
    if (ingrediente) {
      form.value.ingredientes.push({
        produto: ingrediente._id,
        quantidade_usada: quantidadeIngrediente.value
      });
      // Limpa os campos para o próximo
      ingredienteSelecionadoId.value = '';
      quantidadeIngrediente.value = 1;
    }
  }
};

const removerIngrediente = (index) => {
  form.value.ingredientes.splice(index, 1);
};

onMounted(() => {
  carregarPizzas();
  carregarIngredientes();
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

    form.value = { sabor: "", preco: null, estoque: null, ingredientes: [] };
    editando.value = false;
    editandoId.value = null;
    carregarPizzas();
    setTimeout(() => (sucesso.value = ""), 3000);
  } catch (e) {
    erro.value = e.response?.data?.error || "Erro ao salvar pizza.";
  }
};

const editarPizza = (pizza) => {
  form.value = {
    sabor: pizza.sabor,
    preco: pizza.preco,
    estoque: pizza.estoque,
    ingredientes: [...pizza.ingredientes] // Cria uma cópia para edição
  };
  editandoId.value = pizza._id;
  editando.value = true;
};

const cancelarEdicao = () => {
  form.value = { sabor: "", preco: null, estoque: null, ingredientes: [] };
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
  box-sizing: border-box;
}

.pizza-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: flex-end;
}

.pizza-form label {
  flex-basis: 100%;
  font-weight: 600;
}

.pizza-form input {
  padding: 0.5rem;
  font-size: 1rem;
  flex: 1 1 30%;
  min-width: 150px;
  box-sizing: border-box;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  flex-basis: 100%;
  justify-content: flex-start;
  margin-top: 0.5rem;
}

.pizza-form button {
  padding: 0.5rem 1rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  min-width: 120px;
}

.cancel-btn {
  background-color: #999;
}

.pizza-form button:hover {
  background-color: #095c45;
}

.table-wrapper {
  overflow-x: auto;
}

.pizzas-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

.pizzas-table th,
.pizzas-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
  white-space: nowrap;
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
  margin-bottom: 1rem;
}

.error-message {
  color: red;
  font-weight: bold;
  margin-bottom: 1rem;
}

.ingredientes-group {
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  gap: 0.5rem;
}

.ingredientes-list-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.ingredientes-select, .quantidade-input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.ingredientes-select {
  flex: 1;
}

.quantidade-input {
  width: 70px;
}

.add-btn {
  background-color: #28a745;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.ingredientes-selecionados {
  list-style-type: none;
  padding: 0;
  margin: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
}

.ingredientes-selecionados li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* RESPONSIVIDADE */
@media (max-width: 720px) {
  .pizza-form {
    flex-direction: column;
    align-items: stretch;
  }

  .pizza-form label {
    flex-basis: auto;
  }

  .pizza-form input {
    flex-basis: 100%;
    min-width: auto;
  }

  .form-actions {
    justify-content: stretch;
  }

  .form-actions button {
    width: 100%;
  }

  .pizzas-table {
    min-width: 100%;
  }
}

@media (max-width: 400px) {
  .pizzas-table th,
  .pizzas-table td {
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .pizza-form button {
    font-size: 0.9rem;
  }
}
</style>