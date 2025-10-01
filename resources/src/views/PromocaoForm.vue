<template>
  <PrivateLayout>
    <div class="promocao-page">
      <h1>Promoções 🍕</h1>

      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

      <form @submit.prevent="salvarPromocao" class="promocao-form">
        <label for="nome">Nome:</label>
        <input v-model="form.nome" id="nome" type="text" required placeholder="Ex: Pizza em dobro" />

        <label for="descricao">Descrição:</label>
        <input v-model="form.descricao" id="descricao" type="text" placeholder="Ex: Compre 1, leve 2" />

        <label for="pizzas">Pizzas Incluídas:</label>
        <select v-model="form.pizzasIncluidas" id="pizzas" multiple required class="pizzas-select">
          <option v-for="pizza in pizzas" :key="pizza._id" :value="pizza._id">{{ pizza.sabor }}</option>
        </select>
        <p class="select-info">Mantenha 'Ctrl' (ou 'Cmd') pressionado para selecionar múltiplas pizzas.</p>

        <label for="dataInicio">Data de Início:</label>
        <input v-model="form.dataInicio" id="dataInicio" type="date" required />

        <label for="dataFim">Data de Fim:</label>
        <input v-model="form.dataFim" id="dataFim" type="date" required />

        <div class="form-actions">
          <button type="submit">Salvar Promoção</button>
        </div>
      </form>

      <h2>Relatórios e Vendas</h2>
      <div class="actions-wrapper">
        <input v-model="filtroData" id="filtroData" type="date" class="date-input" @change="fetchPromocoesFiltradas" />
        <button @click="limparFiltro" class="cancel-btn">Limpar Filtro</button>
      </div>

      <div class="table-wrapper">
        <table v-if="promocoes.length" class="promocoes-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Período</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="promo in promocoes" :key="promo._id">
              <td>{{ promo.nome }}</td>
              <td>{{ formatDate(promo.dataInicio) }} - {{ formatDate(promo.dataFim) }}</td>
              <td>
                <button @click="generatePDF(promo)" class="relatorio-btn">Gerar PDF</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>Nenhuma promoção encontrada.</p>
      </div>
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import PrivateLayout from "../components/PrivateLayout.vue";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// 🔹 A URL base não deve ter o prefixo /api
const API_URL = import.meta.env.VITE_API_URL;
axios.defaults.headers.common["Authorization"] = `Bearer ${localStorage.getItem("token")}`;

const pizzas = ref([]);
const promocoes = ref([]);
const sucesso = ref("");
const erro = ref("");
const filtroData = ref("");

const form = ref({
  nome: "",
  descricao: "",
  pizzasIncluidas: [],
  dataInicio: null,
  dataFim: null,
});

const fetchPizzas = async () => {
  try {
    const response = await axios.get(`${API_URL}/pizzas`);
    pizzas.value = response.data;
  } catch (e) {
    erro.value = "Erro ao carregar pizzas.";
  }
};

const fetchPromocoes = async () => {
  try {
    // 🔹 Alterado para não usar /api
    const response = await axios.get(`${API_URL}/promocoes`);
    promocoes.value = response.data;
  } catch (e) {
    erro.value = "Erro ao carregar promoções.";
  }
};

const fetchPromocoesFiltradas = async () => {
  try {
    // 🔹 Alterado para não usar /api
    let url = `${API_URL}/promocoes`;
    if (filtroData.value) {
      url += `?data=${filtroData.value}`;
    }
    const response = await axios.get(url);
    promocoes.value = response.data;
  } catch (e) {
    erro.value = "Erro ao buscar promoções filtradas.";
  }
};

const limparFiltro = () => {
  filtroData.value = "";
  fetchPromocoes();
};

const salvarPromocao = async () => {
  erro.value = "";
  sucesso.value = "";

  try {
    // 🔹 Alterado para não usar /api
    await axios.post(`${API_URL}/promocoes`, form.value);
    sucesso.value = "Promoção salva com sucesso!";
    form.value = { nome: "", descricao: "", pizzasIncluidas: [], dataInicio: null, dataFim: null };
    fetchPromocoes();
    setTimeout(() => (sucesso.value = ""), 3000);
  } catch (e) {
    erro.value = e.response?.data?.error || "Erro ao salvar promoção.";
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const generatePDF = async (promo) => {
  try {
    // 🔹 Alterado para não usar /api
    const response = await axios.get(`${API_URL}/promocoes/relatorio/${promo._id}`);
    const relatorio = response.data;

    const doc = new jsPDF();
    doc.setFont('Helvetica');
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text(`Relatório da Promoção: ${relatorio.promocao}`, 10, 20);

    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`Receita Bruta: R$ ${relatorio.receitaBruta.toFixed(2)}`, 10, 40);
    doc.text(`Despesa Total: R$ ${relatorio.despesaTotal.toFixed(2)}`, 10, 50);
    doc.text(`Lucro Líquido: R$ ${relatorio.lucro.toFixed(2)}`, 10, 60);

    doc.save(`relatorio_${promo.nome}.pdf`);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    erro.value = "Erro ao gerar o PDF. Verifique os dados da promoção.";
    setTimeout(() => (erro.value = ""), 3000);
  }
};

onMounted(() => {
  fetchPizzas();
  fetchPromocoes();
});
</script>
<style scoped>
.promocao-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  box-sizing: border-box;
}

.promocao-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: flex-end;
}

.promocao-form label {
  flex-basis: 100%;
  font-weight: 600;
}

.promocao-form input,
.promocao-form select {
  padding: 0.5rem;
  font-size: 1rem;
  flex: 1 1 30%;
  min-width: 150px;
  box-sizing: border-box;
}

.pizzas-select {
  flex-basis: 100%;
  min-height: 150px;
}

.select-info {
  font-size: 0.85rem;
  color: #666;
  flex-basis: 100%;
  margin-top: -0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  flex-basis: 100%;
  justify-content: flex-start;
  margin-top: 0.5rem;
}

.promocao-form button {
  padding: 0.5rem 1rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  min-width: 120px;
}

.promocao-form button:hover {
  background-color: #095c45;
}

.actions-wrapper {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.date-input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.cancel-btn {
  background-color: #999;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  padding: 0.5rem 1rem;
  min-width: 120px;
}

.table-wrapper {
  overflow-x: auto;
}

.promocoes-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 500px;
}

.promocoes-table th,
.promocoes-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
  white-space: nowrap;
}

.promocoes-table th {
  background-color: #0c7c59;
  color: white;
}

.promocoes-table tr:hover {
  background-color: #f5f5f5;
}

.promocoes-table button {
  padding: 0.3rem 0.6rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
}

.promocoes-table button:hover {
  opacity: 0.9;
}

.relatorio-btn {
  background-color: #3f51b5;
  color: white;
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

/* RESPONSIVIDADE */
@media (max-width: 720px) {
  .promocao-form {
    flex-direction: column;
    align-items: stretch;
  }

  .promocao-form label {
    flex-basis: auto;
  }

  .promocao-form input,
  .promocao-form select {
    flex-basis: 100%;
    min-width: auto;
  }

  .form-actions {
    justify-content: stretch;
  }

  .form-actions button {
    width: 100%;
  }

  .actions-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>