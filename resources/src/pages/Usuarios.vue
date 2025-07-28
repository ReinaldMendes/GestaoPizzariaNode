<template>
  <PrivateLayout>
    <div class="usuarios-page">
      <h1>Usuários 👤</h1>

      <p v-if="sucesso" class="success-message">{{ sucesso }}</p>
      <p v-if="erro" class="error-message">{{ erro }}</p>

      <form @submit.prevent="criarUsuario" class="usuario-form">
        <input v-model="novoUsuario.name" type="text" placeholder="Nome" required />
        <input v-model="novoUsuario.email" type="email" placeholder="Email" required />
        <input v-model="novoUsuario.password" type="password" placeholder="Senha" required />
        <select v-model="novoUsuario.role" required>
          <option disabled value="">Selecione o papel</option>
          <option value="USER">Usuário</option>
          <option value="ADMINISTRATOR">Administrador</option>
        </select>
        <button type="submit">Cadastrar Usuário</button>
      </form>

      <h2>Lista de Usuários</h2>

      <div v-if="usuariosPaginados.length" class="usuarios-table-wrapper">
        <table class="usuarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Papel</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in usuariosPaginados" :key="usuario._id">
              <td>{{ usuario.name }}</td>
              <td>{{ usuario.email }}</td>
              <td>{{ usuario.role }}</td>
              <td>
                <button @click="removerUsuario(usuario._id)">Remover</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else>Nenhum usuário cadastrado ainda.</p>

      <!-- Paginação -->
      <div v-if="usuarios.length > itensPorPagina" class="pagination">
        <button :disabled="paginaAtual === 1" @click="paginaAtual--" aria-label="Página anterior">
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
        <button :disabled="paginaAtual === totalPaginas" @click="paginaAtual++" aria-label="Próxima página">
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

const usuarios = ref([])
const novoUsuario = ref({
  name: '',
  email: '',
  password: '',
  role: ''
})

const sucesso = ref('')
const erro = ref('')

const API = import.meta.env.VITE_API_URL + '/usuario'
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

// Paginação
const itensPorPagina = 10
const paginaAtual = ref(1)

const totalPaginas = computed(() => {
  return Math.ceil(usuarios.value.length / itensPorPagina)
})

const usuariosPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * itensPorPagina
  return usuarios.value.slice(start, start + itensPorPagina)
})

const carregarUsuarios = async () => {
  try {
    const response = await axios.get(API)
    usuarios.value = response.data
  } catch (error) {
    erro.value = 'Erro ao carregar usuários: ' + (error.response?.data?.error || error.message)
  }
}

const criarUsuario = async () => {
  sucesso.value = ''
  erro.value = ''
  try {
    const response = await axios.post(API, novoUsuario.value)
    usuarios.value.push(response.data)
    sucesso.value = 'Usuário criado com sucesso!'
    novoUsuario.value = { name: '', email: '', password: '', role: '' }
    setTimeout(() => (sucesso.value = ''), 3000)
    // Vai para última página para mostrar o novo usuário
    paginaAtual.value = totalPaginas.value
  } catch (error) {
    erro.value = 'Erro ao cadastrar usuário: ' + (error.response?.data?.error || error.message)
  }
}

const removerUsuario = async (id) => {
  if (!confirm('Tem certeza que deseja remover este usuário?')) return
  try {
    await axios.delete(`${API}/${id}`)
    usuarios.value = usuarios.value.filter(u => u._id !== id)
    // Ajusta página se necessário
    if (usuariosPaginados.value.length === 0 && paginaAtual.value > 1) {
      paginaAtual.value--
    }
  } catch (error) {
    erro.value = 'Erro ao remover usuário: ' + (error.response?.data?.error || error.message)
  }
}

onMounted(() => {
  carregarUsuarios()
})
</script>

<style scoped>
.usuarios-page {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

.usuario-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.usuario-form input,
.usuario-form select {
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.usuario-form button {
  padding: 0.75rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 6px;
}

.usuario-form button:hover {
  background-color: #095c45;
}

.usuarios-table-wrapper {
  overflow-x: auto;
}

.usuarios-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
  min-width: 600px;
}

.usuarios-table th,
.usuarios-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  text-align: left;
}

.usuarios-table th {
  background-color: #0c7c59;
  color: white;
}

.usuarios-table tr:hover {
  background-color: #f5f5f5;
}

.usuarios-table button {
  background-color: red;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
  border-radius: 4px;
}

.usuarios-table button:hover {
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
  .usuarios-page {
    padding: 1rem;
  }

  .usuarios-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .usuario-form {
    gap: 0.75rem;
  }
}
</style>
