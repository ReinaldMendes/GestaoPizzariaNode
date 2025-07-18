<template>
  <PrivateLayout>
    <div class="clientes-page">
      <h1>Clientes 👥</h1>
      <form @submit.prevent="criarCliente" class="cliente-form">
        <input v-model="novoCliente.nome" type="text" placeholder="Nome" required />
        <input v-model="novoCliente.telefone" type="text" placeholder="Telefone" required />
        <input v-model="novoCliente.endereco" type="text" placeholder="Endereço" required />
        <button type="submit">Cadastrar Cliente</button>
      </form>

      <h2>Lista de Clientes</h2>
      <ul v-if="clientes.length">
        <li v-for="cliente in clientes" :key="cliente._id">
          <strong>{{ cliente.nome }}</strong> - {{ cliente.telefone }} - {{ cliente.endereco }}
          <button @click="removerCliente(cliente._id)">Remover</button>
        </li>
      </ul>
      <p v-else>Nenhum cliente cadastrado ainda.</p>
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import PrivateLayout from '../components/PrivateLayout.vue'

const clientes = ref([])
const novoCliente = ref({
  nome: '',
  telefone: '',
  endereco: ''
})

const API = 'http://localhost:3000/clientes'

const carregarClientes = async () => {
  try {
    const response = await axios.get(API)
    clientes.value = response.data
  } catch (error) {
    alert('Erro ao carregar clientes: ' + error.response?.data || error.message)
  }
}

const criarCliente = async () => {
  try {
    const response = await axios.post(API, novoCliente.value)
    clientes.value.push(response.data)
    // limpa os campos
    novoCliente.value = { nome: '', telefone: '', endereco: '' }
  } catch (error) {
    alert('Erro ao cadastrar cliente: ' + error.response?.data?.error || error.message)
  }
}

const removerCliente = async (id) => {
  if (!confirm('Tem certeza que deseja remover este cliente?')) return
  try {
    await axios.delete(`${API}/${id}`)
    clientes.value = clientes.value.filter(c => c._id !== id)
  } catch (error) {
    alert('Erro ao remover cliente: ' + error.response?.data || error.message)
  }
}

onMounted(() => {
  carregarClientes()
})
</script>

<style scoped>
.clientes-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.cliente-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cliente-form input {
  padding: 0.5rem;
  font-size: 1rem;
}

.cliente-form button {
  padding: 0.5rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
}

.cliente-form button:hover {
  background-color: #095c45;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 0.5rem;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

li button {
  background-color: red;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;
}

li button:hover {
  background-color: darkred;
}
</style>
