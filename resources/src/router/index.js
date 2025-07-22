import { createRouter, createWebHistory } from 'vue-router'

// Páginas públicas
import Login from '../pages/Login.vue'
import Signup from '../pages/Signup.vue'

// Páginas privadas
import Dashboard from '../pages/Dashboard.vue'
import Usuarios from '../pages/Usuarios.vue'
import Produtos from '../pages/Produtos.vue'
import Pizzas from '../pages/Pizzas.vue'
import Clientes from '../pages/Clientes.vue'
import Vendas from '../pages/Vendas.vue'

// Rotas públicas
const publicRoutes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup }
]

// Rotas privadas
const privateRoutes = [
  { path: '/dashboard', component: Dashboard },
  { path: '/usuarios', component: Usuarios },
  { path: '/produtos', component: Produtos },
  { path: '/pizzas', component: Pizzas },
  { path: '/clientes', component: Clientes },
  { path: '/vendas', component: Vendas }
]

const routes = [...publicRoutes, ...privateRoutes]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Proteção de rotas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userRaw = localStorage.getItem('user')
  const publicPaths = publicRoutes.map(route => route.path)

  // 🔐 Se a rota não é pública e o usuário não tem token → redireciona para login
  if (!publicPaths.includes(to.path) && !token) {
    return next('/login')
  }

 //🔐 Protege a rota /usuarios para somente ADMINISTRATOR
  if (to.path === '/usuarios') {
    try {
      const user = JSON.parse(userRaw || '{}')
      if (user.role === 'ADMINISTRATOR') {
        return next('/dashboard') // usuário comum vai para dashboard
      }
    } catch (err) {
      return next('/login') // se deu erro ao ler o user, força login
    }
  }

  next()
})

export default router
