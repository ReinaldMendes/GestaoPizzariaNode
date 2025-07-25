<template>
  <PrivateLayout>
    <div class="produtos-page">
      <h1>Produtos 🍕</h1>

      <!-- Mensagens -->
      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

      <!-- Formulário de Cadastro -->
      <form @submit.prevent="criarProduto" class="produto-form">
        <input v-model="novoProduto.nome" type="text" placeholder="Nome do Produto" required />
        <input v-model="novoProduto.descricao" type="text" placeholder="Descrição" required />
        <input v-model.number="novoProduto.preco" type="number" placeholder="Preço (R$)" required min="0" />
        <input v-model.number="novoProduto.estoque" type="number" placeholder="Estoque" required min="0" />
        <button type="submit">Cadastrar Produto</button>
      </form>

      <!-- Lista de Produtos -->
      <h2>Lista de Produtos</h2>

      <table v-if="produtos.length" class="produtos-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th v-if="usuarioRole === 'ADMINISTRATOR'">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="produto in produtos" :key="produto._id">
            <td>{{ produto.nome }}</td>
            <td>{{ produto.descricao }}</td>
            <td>R$ {{ produto.preco.toFixed(2) }}</td>
            <td>{{ produto.estoque }}</td>
            <td v-if="usuarioRole === 'ADMINISTRATOR'">
              <button @click="removerProduto(produto._id)">Remover</button>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else>Nenhum produto cadastrado ainda.</p>
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import PrivateLayout from '../components/PrivateLayout.vue'

const produtos = ref([])
const novoProduto = ref({
  nome: '',
  descricao: '',
  preco: 0,
  estoque: 0
})

const sucesso = ref('')
const erro = ref('')

const usuarioRole = localStorage.getItem('role') || ''
const API = import.meta.env.VITE_API_URL +'/produtos'

// Adiciona o token JWT no header
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

const carregarProdutos = async () => {
  try {
    const response = await axios.get(API)
    produtos.value = response.data
  } catch (error) {
    erro.value = 'Erro ao carregar produtos: ' + (error.response?.data?.error || error.message)
  }
}

const criarProduto = async () => {
  sucesso.value = ''
  erro.value = ''
  try {
    const response = await axios.post(API, novoProduto.value)
    produtos.value.push(response.data)
    sucesso.value = 'Produto cadastrado com sucesso!'
    novoProduto.value = { nome: '', descricao: '', preco: 0, estoque: 0 }
    setTimeout(() => (sucesso.value = ''), 3000)
  } catch (error) {
    erro.value = 'Erro ao cadastrar produto: ' + (error.response?.data?.error || error.message)
  }
}

const removerProduto = async (id) => {
  if (!confirm('Tem certeza que deseja remover este produto?')) return
  try {
    await axios.delete(`${API}/${id}`)
    produtos.value = produtos.value.filter(p => p._id !== id)
  } catch (error) {
    erro.value = 'Erro ao remover produto: ' + (error.response?.data?.error || error.message)
  }
}

onMounted(() => {
  carregarProdutos()
})
</script>

<style scoped>
.produtos-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.produto-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.produto-form input {
  padding: 0.5rem;
  font-size: 1rem;
}

.produto-form button {
  padding: 0.5rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
}

.produto-form button:hover {
  background-color: #095c45;
}

.produtos-table {
  width: 100%;
  border-collapse: collapse;
}

.produtos-table th,
.produtos-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
}

.produtos-table th {
  background-color: #0c7c59;
  color: white;
}

.produtos-table tr:hover {
  background-color: #f5f5f5;
}

.produtos-table button {
  background-color: red;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;
}

.produtos-table button:hover {
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
</style>
