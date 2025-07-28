<template>
  <PrivateLayout>
    <div class="clientes-page">
      <h1>Clientes 👥</h1>

      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

      <form @submit.prevent="criarCliente" class="cliente-form">
        <input v-model="novoCliente.nome" type="text" placeholder="Nome" required />
        <input v-model="novoCliente.telefone" type="text" placeholder="Telefone" required />
        <input
          v-model="novoCliente.enderecoTexto"
          type="text"
          placeholder="Endereço (ex: Rua, Número, Bairro, Cidade)"
          required
        />
        <button type="submit">Cadastrar Cliente</button>
      </form>

      <h2>Lista de Clientes</h2>

      <div v-if="clientesPaginados.length" class="clientes-table-wrapper">
        <table class="clientes-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Endereço</th>
              <th v-if="usuarioRole === 'ADMINISTRATOR'">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cliente in clientesPaginados" :key="cliente._id">
              <td>{{ cliente.nome }}</td>
              <td>{{ cliente.telefone }}</td>
              <td>{{ formatarEndereco(cliente.endereco) }}</td>
              <td v-if="usuarioRole === 'ADMINISTRATOR'">
                <button @click="removerCliente(cliente._id)">Remover</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else>Nenhum cliente cadastrado ainda.</p>

      <!-- Paginação -->
      <div v-if="clientes.length > itensPorPagina" class="pagination">
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import PrivateLayout from '../components/PrivateLayout.vue'

const clientes = ref([])
const novoCliente = ref({
  nome: '',
  telefone: '',
  enderecoTexto: ''
})

const sucesso = ref('')
const erro = ref('')

const usuarioRole = localStorage.getItem('role') || ''
const API = import.meta.env.VITE_API_URL + '/clientes'

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

// Paginação
const itensPorPagina = 10
const paginaAtual = ref(1)

const totalPaginas = computed(() => {
  return Math.ceil(clientes.value.length / itensPorPagina)
})

const clientesPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * itensPorPagina
  return clientes.value.slice(start, start + itensPorPagina)
})

const carregarClientes = async () => {
  try {
    const response = await axios.get(API)
    clientes.value = response.data
  } catch (error) {
    erro.value = 'Erro ao carregar clientes: ' + (error.response?.data?.error || error.message)
  }
}

function formatarEndereco(endereco) {
  try {
    const obj = typeof endereco === 'string' ? JSON.parse(endereco) : endereco
    return `${obj.rua}, ${obj.numero} - ${obj.bairro}, ${obj.cidade}`
  } catch {
    return endereco
  }
}

const criarCliente = async () => {
  sucesso.value = ''
  erro.value = ''
  try {
    const partes = novoCliente.value.enderecoTexto.split(',').map(s => s.trim())
    if (partes.length < 4) {
      erro.value = 'Endereço deve conter Rua, Número, Bairro e Cidade separados por vírgula.'
      return
    }

    const enderecoObj = {
      rua: partes[0],
      numero: partes[1],
      bairro: partes[2],
      cidade: partes[3]
    }

    const payload = {
      nome: novoCliente.value.nome,
      telefone: novoCliente.value.telefone,
      endereco: enderecoObj
    }

    const response = await axios.post(API, payload)
    clientes.value.push(response.data)
    sucesso.value = 'Cliente criado com sucesso!'
    novoCliente.value = { nome: '', telefone: '', enderecoTexto: '' }
    setTimeout(() => (sucesso.value = ''), 3000)

    // Vai para última página para mostrar o cliente criado
    paginaAtual.value = totalPaginas.value
  } catch (error) {
    erro.value = 'Erro ao cadastrar cliente: ' + (error.response?.data?.error || error.message)
  }
}

const removerCliente = async (id) => {
  if (!confirm('Tem certeza que deseja remover este cliente?')) return
  try {
    await axios.delete(`${API}/${id}`)
    clientes.value = clientes.value.filter(c => c._id !== id)

    // Ajusta a página caso fique vazia
    if (clientesPaginados.value.length === 0 && paginaAtual.value > 1) {
      paginaAtual.value--
    }
  } catch (error) {
    erro.value = 'Erro ao remover cliente: ' + (error.response?.data?.error || error.message)
  }
}

onMounted(() => {
  carregarClientes()
})
</script>

<style scoped>
.clientes-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.cliente-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.cliente-form input {
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.cliente-form button {
  padding: 0.75rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 6px;
}

.cliente-form button:hover {
  background-color: #095c45;
}

.clientes-table-wrapper {
  overflow-x: auto;
}

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  min-width: 600px;
}

.clientes-table th,
.clientes-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
}

.clientes-table th {
  background-color: #0c7c59;
  color: white;
}

.clientes-table tr:hover {
  background-color: #f5f5f5;
}

.clientes-table button {
  background-color: red;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;
}

.clientes-table button:hover {
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

/* RESPONSIVO */
@media (max-width: 768px) {
  .clientes-page {
    padding: 1rem;
  }

  .clientes-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .cliente-form {
    gap: 0.75rem;
  }
}
</style>
