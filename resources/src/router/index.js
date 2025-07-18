import { createRouter, createWebHistory } from 'vue-router'

// Páginas públicas
import Login from '../pages/Login.vue'
import Signup from '../pages/Signup.vue'

// Páginas privadas (comentar/descomentar conforme forem criadas)
import Dashboard from '../pages/Dashboard.vue'
import Usuarios from '../pages/Usuarios.vue'
import Produtos from '../pages/Produtos.vue'
import Pizzas from '../pages/Pizzas.vue'
import Clientes from '../pages/Clientes.vue'
import Vendas from '../pages/Vendas.vue'

// ✅ Rotas públicas (acessíveis sem autenticação)
const publicRoutes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup }
]

// ✅ Rotas privadas (requerem autenticação)
const privateRoutes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/usuarios', component: Usuarios },
  { path: '/produtos', component: Produtos },
  { path: '/pizzas', component: Pizzas },
  { path: '/clientes', component: Clientes },
  { path: '/vendas', component: Vendas }
]

// Junta todas as rotas
const routes = [...publicRoutes, ...privateRoutes]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Proteção de rota: impede acesso a páginas privadas sem login
router.beforeEach((to, from, next) => {
  const isAuth = !!localStorage.getItem('token')
  const publicPaths = publicRoutes.map(route => route.path)

  if (!publicPaths.includes(to.path) && !isAuth) {
    next('/login')
  } else {
    next()
  }
})

export default router
