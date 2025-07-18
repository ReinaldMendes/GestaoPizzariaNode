<template>
    <div class="signup-container">
      <div class="signup-card">
        <h2>🍕 Criar Conta</h2>
        <form @submit.prevent="signup">
          <input v-model="name" type="text" placeholder="Nome completo" required />
          <input v-model="email" type="email" placeholder="E-mail" required />
          <input v-model="password" type="password" placeholder="Senha" required />
          <select v-model="role" required>
            <option disabled value="">Selecione um perfil</option>
            <option value="ADMINISTRATOR">Administrador</option>
            <option value="USER">Usuario</option>
          </select>
          <button type="submit">Cadastrar</button>
        </form>
        <p v-if="erro" class="error">{{ erro }}</p>
        <p class="redirect">
          Já tem uma conta? <router-link to="/login">Faça login</router-link>
        </p>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const name = ref('')
  const email = ref('')
  const password = ref('')
  const role = ref('')
  const erro = ref('')
  
  async function signup() {
  try {
    const res = await fetch('http://localhost:3000/usuario/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
        role: role.value
      })
    })

    const data = await res.json()
    if (!res.ok) {
      const errorMsg = data.error || data.message || 'Erro ao cadastrar'
      throw new Error(errorMsg)
    }

    // Cadastro bem-sucedido → redireciona para login
    router.push('/login')
  } catch (e) {
    erro.value = e.message
  }
}
  </script>
  
  <style scoped>
  .signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: url('/pizzaria-fundo.jpg') center/cover no-repeat;
  }
  
  .signup-card {
    background-color: rgba(255, 255, 255, 0.95);
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    width: 400px;
    text-align: center;
  }
  
  .signup-card h2 {
    margin-bottom: 1rem;
    color: #27ae60;
  }
  
  form input,
  form select {
    width: 100%;
    padding: 0.7rem;
    margin: 0.5rem 0;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  form button {
    width: 100%;
    padding: 0.8rem;
    background-color: #2ecc71;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  form button:hover {
    background-color: #27ae60;
  }
  
  .error {
    margin-top: 1rem;
    color: red;
    font-weight: bold;
  }
  
  .redirect {
    margin-top: 1rem;
  }
  </style>
  