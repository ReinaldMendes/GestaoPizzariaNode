<template>
  <PrivateLayout>
    <div class="clientes-page">
      <h1>Clientes 👥</h1>

      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

      <!-- Formulário de criação -->
      <form @submit.prevent="criarCliente" class="cliente-form card">
        <h3>➕ Cadastrar novo cliente</h3>
        <input v-model="novoCliente.nome" type="text" placeholder="Nome" required />
        <input v-model="novoCliente.telefone" type="text" placeholder="Telefone" required />
        <input
          v-model="novoCliente.enderecoTexto"
          type="text"
          placeholder="Endereço (Rua, Número, Bairro, Cidade)"
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
              <!-- Removido o if, ações sempre aparecem -->
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="cliente in clientesPaginados"
              :key="cliente._id"
              @click="abrirNoGoogleMaps(cliente.endereco)"
              style="cursor: pointer;"
            >
              <td>{{ cliente.nome }}</td>
              <td>{{ cliente.telefone }}</td>
              <td>{{ formatarEndereco(cliente.endereco) }}</td>
              <td class="actions">
                <button class="edit" @click.stop="abrirModalEdicao(cliente)">✏️</button>
                <button class="delete" @click.stop="removerCliente(cliente._id)">🗑️</button>
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

      <!-- Modal de edição -->
      <div v-if="modalAberto" class="modal-overlay" @click.self="fecharModal">
        <div class="modal card">
          <h3>Editar Cliente</h3>
          <input v-model="clienteEditando.nome" type="text" placeholder="Nome" required />
          <input v-model="clienteEditando.telefone" type="text" placeholder="Telefone" required />
          <input
            v-model="clienteEditando.enderecoTexto"
            type="text"
            placeholder="Endereço (Rua, Número, Bairro, Cidade)"
            required
          />
          <div class="modal-actions">
            <button @click="atualizarCliente">Salvar</button>
            <button class="cancel" @click="fecharModal">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import PrivateLayout from '../components/PrivateLayout.vue'

const clientes = ref([])
const novoCliente = ref({ nome: '', telefone: '', enderecoTexto: '' })
const clienteEditando = ref({ _id: null, nome: '', telefone: '', enderecoTexto: '' })
const modalAberto = ref(false)

const sucesso = ref('')
const erro = ref('')

const API = import.meta.env.VITE_API_URL + '/clientes'

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

// Paginação
const itensPorPagina = 10
const paginaAtual = ref(1)

const totalPaginas = computed(() => Math.ceil(clientes.value.length / itensPorPagina))
const clientesPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * itensPorPagina
  return clientes.value.slice(start, start + itensPorPagina)
})

// Funções
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
      erro.value = 'Endereço deve conter Rua, Número, Bairro e Cidade.'
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
    if (clientesPaginados.value.length === 0 && paginaAtual.value > 1) {
      paginaAtual.value--
    }
  } catch (error) {
    erro.value = 'Erro ao remover cliente: ' + (error.response?.data?.error || error.message)
  }
}

// Edição
function abrirModalEdicao(cliente) {
  clienteEditando.value = {
    _id: cliente._id,
    nome: cliente.nome,
    telefone: cliente.telefone,
    enderecoTexto: formatarEndereco(cliente.endereco)
  }
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
}

const atualizarCliente = async () => {
  try {
    const partes = clienteEditando.value.enderecoTexto.split(',').map(s => s.trim())
    const enderecoObj = {
      rua: partes[0],
      numero: partes[1],
      bairro: partes[2],
      cidade: partes[3]
    }

    const payload = {
      nome: clienteEditando.value.nome,
      telefone: clienteEditando.value.telefone,
      endereco: enderecoObj
    }

    const response = await axios.put(`${API}/${clienteEditando.value._id}`, payload)
    const index = clientes.value.findIndex(c => c._id === clienteEditando.value._id)
    if (index !== -1) clientes.value[index] = response.data

    sucesso.value = 'Cliente atualizado com sucesso!'
    fecharModal()
    setTimeout(() => (sucesso.value = ''), 3000)
  } catch (error) {
    erro.value = 'Erro ao atualizar cliente: ' + (error.response?.data?.error || error.message)
  }
}

function abrirNoGoogleMaps(endereco) {
  if (!endereco) return
  try {
    const obj = typeof endereco === 'string' ? JSON.parse(endereco) : endereco
    const enderecoFormatado = `${obj.rua} ${obj.numero}, ${obj.bairro}, ${obj.cidade}`
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoFormatado)}`
    window.open(url, '_blank')
  } catch {
    console.error('Endereço inválido para abrir no Google Maps')
  }
}

onMounted(() => carregarClientes())
</script>


<style scoped>
.clientes-page {
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

/* Cartões */
.card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

/* Formulário */
.cliente-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

/* Tabela */
.clientes-table-wrapper {
  overflow-x: auto;
}

.clientes-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
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

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions button {
  border: none;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
}

.actions .edit {
  background-color: #f1c40f;
  color: white;
}

.actions .edit:hover {
  background-color: #d4ac0d;
}

.actions .delete {
  background-color: #e74c3c;
  color: white;
}

.actions .delete:hover {
  background-color: #c0392b;
}

/* Mensagens */
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

/* Paginação */
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  max-width: 500px;
  width: 100%;
}

.modal-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.modal-actions button {
  padding: 0.6rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: bold;
}

.modal-actions button:first-child {
  background-color: #0c7c59;
  color: white;
}

.modal-actions .cancel {
  background: #bdc3c7;
}

/* Responsivo */
@media (max-width: 768px) {
  .clientes-page {
    padding: 1rem;
  }

  .clientes-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>
