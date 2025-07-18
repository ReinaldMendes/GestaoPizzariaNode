<template>
  <div class="login-container">
    <div class="login-card">
      <h2>🍕 Bem-vindo à Pizzaria</h2>
      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="E-mail" required />
        <input v-model="password" type="password" placeholder="Senha" required />
        <button type="submit">Entrar</button>
      </form>
      <p v-if="erro" class="error">{{ erro }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const erro = ref('')

async function login() {
  try {
    const res = await fetch('http://localhost:3000/usuario/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login')

    localStorage.setItem('token', data.token)
    router.push('/dashboard')
  } catch (e) {
    erro.value = e.message
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: url('/pizzaria-fundo.jpg') center/cover no-repeat;
}

.login-card {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  width: 350px;
  text-align: center;
}

.login-card h2 {
  margin-bottom: 1rem;
  color: #c0392b;
}

form input {
  width: 100%;
  padding: 0.7rem;
  margin: 0.5rem 0;
  border: 1px solid #ccc;
  border-radius: 5px;
}

form button {
  width: 100%;
  padding: 0.8rem;
  background-color: #e74c3c;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

form button:hover {
  background-color: #c0392b;
}

.error {
  margin-top: 1rem;
  color: red;
  font-weight: bold;
}
</style>
