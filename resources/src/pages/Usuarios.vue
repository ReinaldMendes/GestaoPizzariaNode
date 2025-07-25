<template>
  <PrivateLayout>
    <div class="usuarios-page">
      <h1>Usuários 👤</h1>

      <!-- Mensagens -->
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
      <ul v-if="usuarios.length">
        <li v-for="usuario in usuarios" :key="usuario._id">
          <strong>{{ usuario.name }}</strong> - {{ usuario.email }} - {{ usuario.role }}
          <button @click="removerUsuario(usuario._id)">Remover</button>
        </li>
      </ul>
      <p v-else>Nenhum usuário cadastrado ainda.</p>
    </div>
  </PrivateLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

const API =import.meta.env.VITE_API_URL+'/usuario'

// Adiciona o token JWT do localStorage no cabeçalho de todas as requisições
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`

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
    // limpa os campos
    novoUsuario.value = { name: '', email: '', password: '', role: '' }

    // sumir a mensagem após 3 segundos
    setTimeout(() => sucesso.value = '', 3000)
  } catch (error) {
    erro.value = 'Erro ao cadastrar usuário: ' + (error.response?.data?.error || error.message)
  }
}

const removerUsuario = async (id) => {
  if (!confirm('Tem certeza que deseja remover este usuário?')) return
  try {
    await axios.delete(`${API}/${id}`)
    usuarios.value = usuarios.value.filter(u => u._id !== id)
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
  max-width: 800px;
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
  padding: 0.5rem;
  font-size: 1rem;
}

.usuario-form button {
  padding: 0.5rem;
  background-color: #0c7c59;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
}

.usuario-form button:hover {
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
