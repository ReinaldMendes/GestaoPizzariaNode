<template>
  <PrivateLayout>
    <div class="produtos-page">
      <h1>Produtos 🍕</h1>

      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

      <form @submit.prevent="criarProduto" class="produto-form">
        <input
          v-model="novoProduto.nome"
          type="text"
          placeholder="Nome do Produto"
          required
        />
        <input
          v-model="novoProduto.descricao"
          type="text"
          placeholder="Descrição"
          required
        />
        <input
          v-model.number="novoProduto.preco"
          type="number"
          placeholder="Preço (R$)"
          required
          min="0"
          step="0.01"
        />
        <input
          v-model.number="novoProduto.estoque"
          type="number"
          placeholder="Estoque"
          required
          min="0"
        />
        <select v-model="novoProduto.unidadeMedida" required>
          <option value="">Selecione a Unidade</option>
          <option value="g">Gramas (g)</option>
          <option value="ml">Mililitros (ml)</option>
          <option value="un">Unidades (un)</option>
          <option value="m">Metros (m)</option>
        </select>
        <button type="submit">Cadastrar Produto</button>
      </form>

      <h2>Lista de Produtos</h2>

      <div class="table-wrapper">
        <table v-if="produtosPaginados.length" class="produtos-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Unidade</th>
              <th v-if="usuarioRole === 'ADMINISTRATOR'">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="produto in produtosPaginados" :key="produto._id">
              <td v-if="produto.editando">
                <input v-model="produto.nome" />
              </td>
              <td v-else>{{ produto.nome }}</td>

              <td v-if="produto.editando">
                <input v-model="produto.descricao" />
              </td>
              <td v-else>{{ produto.descricao }}</td>

              <td v-if="produto.editando">
                <input v-model.number="produto.preco" type="number" step="0.01" />
              </td>
              <td v-else>R$ {{ produto.preco.toFixed(2) }}</td>

              <td v-if="produto.editando">
                <input v-model.number="produto.estoque" type="number" />
              </td>
              <td v-else>{{ produto.estoque }}</td>

              <td v-if="produto.editando">
                <select v-model="produto.unidadeMedida" required>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="un">un</option>
                  <option value="m">m</option>
                </select>
              </td>
              <td v-else>{{ produto.unidadeMedida }}</td>

              <td v-if="usuarioRole === 'ADMINISTRATOR'">
                <div class="acoes">
                  <button
                    v-if="!produto.editando"
                    class="btn-edit"
                    @click="editarProduto(produto)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="produto.editando"
                    class="btn-save"
                    @click="salvarEdicao(produto)"
                  >
                    Salvar
                  </button>
                  <button
                    class="btn-delete"
                    @click="removerProduto(produto._id)"
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>Nenhum produto cadastrado ainda.</p>
      </div>

      <div v-if="produtos.length > itensPorPagina" class="pagination">
        <button
          :disabled="paginaAtual === 1"
          @click="paginaAtual--"
          aria-label="Página anterior"
        >
          &laquo; Anterior
        </button>
        <button
          v-for="page in totalPaginas"
          :key="page"
          :class="{ active: paginaAtual === page }"
          @click="paginaAtual = page"
          aria-label="'Ir para página ' + page"
        >
          {{ page }}
        </button>
        <button
          :disabled="paginaAtual === totalPaginas"
          @click="paginaAtual++"
          aria-label="Próxima página"
        >
          Próximo &raquo;
        </button>
      </div>
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import PrivateLayout from "../components/PrivateLayout.vue";

const produtos = ref([]);
const novoProduto = ref({
  nome: "",
  descricao: "",
  preco: 0,
  estoque: 0,
  unidadeMedida: "", // 🔹 Adicione o campo `unidadeMedida`
});

const sucesso = ref("");
const erro = ref("");

const usuarioRole = localStorage.getItem("role") || "";
const API = import.meta.env.VITE_API_URL + "/produtos";

axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${localStorage.getItem("token")}`;

const itensPorPagina = 10;
const paginaAtual = ref(1);

const totalPaginas = computed(() => {
  return Math.ceil(produtos.value.length / itensPorPagina);
});

const produtosPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * itensPorPagina;
  return produtos.value.slice(start, start + itensPorPagina);
});

const carregarProdutos = async () => {
  try {
    const response = await axios.get(API);
    produtos.value = response.data.map((p) => ({ ...p, editando: false }));
  } catch (error) {
    erro.value =
      "Erro ao carregar produtos: " + (error.response?.data?.error || error.message);
  }
};

const criarProduto = async () => {
  sucesso.value = "";
  erro.value = "";
  try {
    const response = await axios.post(API, novoProduto.value);
    produtos.value.push({ ...response.data, editando: false });
    sucesso.value = "Produto cadastrado com sucesso!";
    novoProduto.value = { nome: "", descricao: "", preco: 0, estoque: 0, unidadeMedida: "" }; // 🔹 Limpe o campo
    setTimeout(() => (sucesso.value = ""), 3000);

    paginaAtual.value = totalPaginas.value;
  } catch (error) {
    erro.value =
      "Erro ao cadastrar produto: " + (error.response?.data?.error || error.message);
  }
};

const removerProduto = async (id) => {
  if (!confirm("Tem certeza que deseja remover este produto?")) return;
  try {
    await axios.delete(`${API}/${id}`);
    produtos.value = produtos.value.filter((p) => p._id !== id);

    if (produtosPaginados.value.length === 0 && paginaAtual.value > 1) {
      paginaAtual.value--;
    }
  } catch (error) {
    erro.value =
      "Erro ao remover produto: " + (error.response?.data?.error || error.message);
  }
};

const editarProduto = (produto) => {
  produto.editando = true;
};

const salvarEdicao = async (produto) => {
  try {
    const response = await axios.put(`${API}/${produto._id}`, produto);
    Object.assign(produto, response.data, { editando: false });
    sucesso.value = "Produto atualizado com sucesso!";
    setTimeout(() => (sucesso.value = ""), 3000);
  } catch (error) {
    erro.value =
      "Erro ao atualizar produto: " + (error.response?.data?.error || error.message);
  }
};

onMounted(() => {
  carregarProdutos();
});
</script>

<style scoped>
/* O CSS foi mantido o mesmo */
.produtos-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  box-sizing: border-box;
}

.produto-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.produto-form input {
  flex: 1 1 150px;
  padding: 0.5rem;
  font-size: 1rem;
  min-width: 120px;
  box-sizing: border-box;
}

.produto-form button {
  padding: 0.5rem 1rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  min-width: 130px;
}

.produto-form button:hover {
  background-color: #095c45;
}

.table-wrapper {
  overflow-x: auto;
}

.produtos-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

.produtos-table th,
.produtos-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
  white-space: nowrap;
}

.produtos-table th {
  background-color: #0c7c59;
  color: white;
}

.produtos-table tr:hover {
  background-color: #f5f5f5;
}

/* BOTÕES DE AÇÃO */
.acoes {
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;
}

.btn-edit:hover {
  background-color: #0056b3;
}

.btn-save {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;
}

.btn-save:hover {
  background-color: #1e7e34;
}

.btn-delete {
  background-color: red;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;
}

.btn-delete:hover {
  background-color: darkred;
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

/* PAGINAÇÃO */
.pagination {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
  user-select: none;
}

.pagination button {
  background-color: #0c7c59;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  min-width: 36px;
  transition: background-color 0.3s ease;
}

.pagination button:hover:not(:disabled) {
  background-color: #095c45;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: default;
}

.pagination button.active {
  background-color: #095c45;
  cursor: default;
}

/* RESPONSIVIDADE */
@media (max-width: 720px) {
  .produto-form {
    flex-direction: column;
  }

  .produto-form input,
  .produto-form button {
    flex-basis: 100%;
    min-width: auto;
  }

  .produtos-table {
    min-width: 100%;
  }
}

@media (max-width: 400px) {
  .produtos-table th,
  .produtos-table td {
    font-size: 0.85rem;
    padding: 0.5rem;
  }

  .produto-form button {
    font-size: 0.9rem;
  }
}
</style>