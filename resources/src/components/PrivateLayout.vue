<template>
  <div class="layout">
    <header>
      <h1>🍕 Pizzaria - Gestão</h1>
      <button class="mobile-menu-btn" @click="menuAberto = !menuAberto">☰</button>
      <button class="logout-btn" @click="logout">Sair</button>
    </header>

    <nav :class="{ aberto: menuAberto }">
      <router-link to="/dashboard">Dashboard</router-link>
      <router-link v-if="userRole === 'ADMINISTRATOR'" to="/usuarios">Usuários</router-link>
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
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userRole = ref('')
const menuAberto = ref(false)

watchEffect(() => {
  const userRaw = localStorage.getItem('user')
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw)
      userRole.value = user.role || ''
    } catch (error) {
      console.error('Erro ao ler user do localStorage:', error)
      userRole.value = ''
    }
  } else {
    userRole.value = ''
  }
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-areas:
    "header"
    "nav"
    "main";
  grid-template-rows: 60px auto 1fr;
  height: 100vh;
}

header {
  grid-area: header;
  background-color: #e74c3c;
  color: white;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.logout-btn {
  background: white;
  color: #e74c3c;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.logout-btn:hover {
  background: #ffe5e5;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.8rem;
  color: white;
  cursor: pointer;
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

/* ===== Responsivo ===== */

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 200px 1fr;
    grid-template-rows: 60px 1fr;
    grid-template-areas:
      "header header"
      "nav main";
  }

  .mobile-menu-btn {
    display: none;
  }

  nav {
    display: flex !important;
  }
}

@media (max-width: 767px) {
  .mobile-menu-btn {
    display: block;
  }

  nav {
    display: none;
    grid-area: nav;
  }

  nav.aberto {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: #f1f1f1;
    padding: 1rem;
  }
}
</style>
