<template>
    <div class="login">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="E-mail" required />
        <input v-model="password" type="password" placeholder="Senha" required />
        <button type="submit">Entrar</button>
      </form>
      <p v-if="erro">{{ erro }}</p>
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
      const res = await fetch('http://localhost:8000/usuario/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.value, senha: password.value })
      })
  
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Erro ao fazer login')
  
      localStorage.setItem('token', data.token)
      router.push('/dashboard')
    } catch (e) {
      erro.value = e.message
    }
  }
  </script>
  
  <style scoped>
  .login {
    max-width: 400px;
    margin: auto;
    padding: 2rem;
    background: #eee;
  }
  </style>
  