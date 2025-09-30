<template>
  <div class="layout">
    <header>
      <div class="logo-container" @click="goDashboard" role="button" tabindex="0" @keydown.enter="goDashboard" aria-label="Ir para dashboard">
        <img :src="logo" alt="Logo" class="logo" />
        <h1>Gestão - Promoção Pizzas DAV PG</h1>
      </div>

      <button class="mobile-menu-btn" @click="menuAberto = !menuAberto" aria-label="Abrir menu">
        ☰
      </button>

      <button class="logout-btn" @click="logout">Sair</button>
    </header>

    <nav :class="{ aberto: menuAberto }" @click="menuAberto = false">
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
import { ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import logo from '../assets/udv_logo.jpg'

const router = useRouter()
const userRole = ref('')
const menuAberto = ref(false)

watchEffect(() => {
  const userRaw = localStorage.getItem('user')
  if (userRaw) {
    try {
      const user = JSON.parse(userRaw)
      userRole.value = user.role || ''
    } catch {
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

function goDashboard() {
  menuAberto.value = false
  router.push('/dashboard')
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
  background-color: #09861a;
  color: white;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

/* Container do logo e título juntos */
.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.logo-container h1 {
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0;
  white-space: nowrap;  /* Evita quebrar linha */
  overflow: hidden;
  text-overflow: ellipsis; /* Reticências se texto for maior que espaço */
  max-width: 180px; /* Limita o tamanho no desktop */
}

/* Botão menu mobile */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 2rem;
  color: white;
  cursor: pointer;
}

/* Botão logout */
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

  .logo-container h1 {
    max-width: none;
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
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    z-index: 10;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }

  /* Ajusta logo e texto para caber em telas pequenas */
  .logo-container h1 {
    font-size: 1rem;
    max-width: 140px;
  }
}
</style>
