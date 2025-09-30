<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Promoção Pizzas DAV PG</h2>
      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="E-mail" required />
        <input v-model="password" type="password" placeholder="Senha" required />
        <button type="submit" :disabled="loading">
          {{ loading ? "Entrando..." : "Entrar" }}
        </button>
      </form>
      <p v-if="erro" class="error">{{ erro }}</p>
    </div>
    <div class="login-image">
      <img :src="logo" alt="Promoção Pizzaria" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/udv_logo.jpg' // ajuste o caminho conforme seu projeto

const API_LOGIN = import.meta.env.VITE_API_URL + "/usuario/login"
const router = useRouter()

const email = ref('')
const password = ref('')
const erro = ref('')
const loading = ref(false)

async function login() {
  erro.value = ''
  loading.value = true
  try {
    const res = await fetch(API_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao fazer login')
    }

    // Salva token e role no localStorage
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.user?.role || data.role || '')

    console.log("ROLE recebida:", data.user?.role || data.role)

    router.push('/dashboard')
  } catch (e) {
    erro.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  background: #fff;
  box-shadow: inset 0 0 10px #ccc;
}

/* FORMULÁRIO */
.login-form {
  flex: 1;
  max-width: 450px;
  margin: auto;
  padding: 2rem;
  background-color: #fff;
  box-shadow: 0 0 15px rgba(0,0,0,0.1);
  border-radius: 12px;
  text-align: center;
}

.login-form h2 {
  margin-bottom: 1.5rem;
  color: #07c4d1;
  font-weight: 700;
}

.login-form form input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.login-form form button {
  width: 100%;
  padding: 0.9rem;
  background-color: #07c4d1;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 700;
  cursor: pointer;
  font-size: 1.1rem;
  transition: background-color 0.3s;
}

.login-form form button:hover:enabled {
  background-color: #c0392b;
}

.login-form form button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  color: red;
  font-weight: 700;
}

/* IMAGEM */
.login-image {
  flex: 1;
  background-color: #f7f7f7;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.login-image img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
}

/* RESPONSIVO */
@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
  }

  .login-form,
  .login-image {
    max-width: 100%;
    flex: none;
    padding: 1.5rem;
  }

  .login-image img {
    max-height: 300px;
  }
}
</style>
