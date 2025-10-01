import { createRouter, createWebHistory } from 'vue-router';

// Páginas públicas
import Login from '../pages/Login.vue';
import Signup from '../pages/Signup.vue';

// Páginas privadas
import Dashboard from '../pages/Dashboard.vue';
import Usuarios from '../pages/Usuarios.vue';
import Produtos from '../pages/Produtos.vue';
import Pizzas from '../pages/Pizzas.vue';
import Clientes from '../pages/Clientes.vue';
import Vendas from '../pages/Vendas.vue';
import PromocaoForm from '../views/PromocaoForm.vue';

// Rotas públicas
const publicRoutes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup }
];

// Rotas privadas
const privateRoutes = [
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  // 🔹 A rota de usuários agora tem a meta de `requiredRole`
  { path: '/usuarios', component: Usuarios, meta: { requiresAuth: true, requiredRole: 'ADMINISTRATOR' } },
  { path: '/produtos', component: Produtos, meta: { requiresAuth: true } },
  { path: '/pizzas', component: Pizzas, meta: { requiresAuth: true } },
  { path: '/clientes', component: Clientes, meta: { requiresAuth: true } },
  { path: '/vendas', component: Vendas, meta: { requiresAuth: true } },
  { path: '/promocoes/criar', component: PromocaoForm, meta: { requiresAuth: true } },
];

const routes = [...publicRoutes, ...privateRoutes];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Proteção de rotas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  // Verifica se a rota requer autenticação (todas as rotas privadas)
  if (to.meta.requiresAuth) {
    if (!token) {
      return next('/login');
    }

    try {
      const user = JSON.parse(userRaw || '{}');

      if (to.meta.requiredRole && user.role !== to.meta.requiredRole) {
        return next('/dashboard');
      }

    } catch (err) {
      console.error('Erro ao analisar dados do usuário:', err);
      return next('/login');
    }
  }

  next();
});

export default router;