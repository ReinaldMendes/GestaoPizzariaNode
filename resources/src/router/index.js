import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
// import Dashboard from '../pages/Dashboard.vue'
// import Usuarios from '../pages/Usuarios.vue'
// import Produtos from '../pages/Produtos.vue'
// import Pizzas from '../pages/Pizzas.vue'
// import Clientes from '../pages/Clientes.vue'
// import Vendas from '../pages/Vendas.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
//   { path: '/dashboard', component: Dashboard },
//   { path: '/usuarios', component: Usuarios },
//   { path: '/produtos', component: Produtos },
//   { path: '/pizzas', component: Pizzas },
//   { path: '/clientes', component: Clientes },
//   { path: '/vendas', component: Vendas }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from, next) => {
    const isAuth = !!localStorage.getItem('token')
    if (to.path !== '/login' && !isAuth) {
      next('/login')
    } else {
      next()
    }
  })
  
export default router
