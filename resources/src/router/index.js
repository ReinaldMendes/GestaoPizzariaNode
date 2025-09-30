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
import PromocaoForm from '../views/PromocaoForm.vue'; // 🔹 Importa a nova página de promoção

// Rotas públicas
const publicRoutes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup }
];

// Rotas privadas
const privateRoutes = [
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/usuarios', component: Usuarios, meta: { requiresAuth: true } },
  { path: '/produtos', component: Produtos, meta: { requiresAuth: true } },
  { path: '/pizzas', component: Pizzas, meta: { requiresAuth: true } },
  { path: '/clientes', component: Clientes, meta: { requiresAuth: true } },
  { path: '/vendas', component: Vendas, meta: { requiresAuth: true } },
  { path: '/promocoes/criar', component: PromocaoForm, meta: { requiresAuth: true } }, // 🔹 Nova rota de promoção
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
      // Se não houver token, redireciona para o login
      return next('/login');
    }

    try {
      const user = JSON.parse(userRaw || '{}');

      // Verifica se a rota requer uma função específica (role)
      if (to.meta.requiredRole && user.role !== to.meta.requiredRole) {
        // Se o usuário não tiver a função necessária, redireciona
        return next('/dashboard');
      }

    } catch (err) {
      // Em caso de erro ao analisar o usuário, força o login
      console.error('Erro ao analisar dados do usuário:', err);
      return next('/login');
    }
  }

  next();
});

export default router;