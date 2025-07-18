<template>
    <div class="layout">
      <header>
        <h1>🍕 Pizzaria - Gestão</h1>
        <button @click="logout">Sair</button>
      </header>
  
      <nav>
        <router-link to="/dashboard">Dashboard</router-link>
        <router-link to="/usuarios">Usuários</router-link>
        <router-link to="/produtos">Produtos</router-link>
        <router-link to="/pizzas">Pizzas</router-link>
        <router-link to="/clientes">Clientes</router-link>
        <router-link to="/vendas">Vendas</router-link>
      </nav>
  
      <main>
        <slot />
      </main>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  
  function logout() {
    localStorage.removeItem('token')
    router.push('/login')
  }
  </script>
  
  <style scoped>
  .layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    grid-template-rows: 60px 1fr;
    grid-template-areas:
      "header header"
      "nav main";
    height: 100vh;
  }
  
  header {
    grid-area: header;
    background-color: #e74c3c;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  nav {
    grid-area: nav;
    background-color: #f1f1f1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  nav a {
    text-decoration: none;
    color: #333;
    font-weight: bold;
  }
  
  nav a.router-link-exact-active {
    color: #e74c3c;
  }
  
  main {
    grid-area: main;
    padding: 2rem;
    overflow-y: auto;
  }
  </style>
  