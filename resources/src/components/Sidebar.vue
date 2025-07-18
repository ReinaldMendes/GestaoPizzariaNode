<template>
    <aside class="w-64 bg-white shadow-lg h-full p-6 flex flex-col">
      <h2 class="text-2xl font-bold text-green-700 mb-8">Pizzaria Admin</h2>
      <nav class="flex flex-col gap-4">
        <RouterLink to="/dashboard" class="hover:text-green-600 font-medium">Dashboard</RouterLink>
        <RouterLink to="/pedidos" class="hover:text-green-600 font-medium">Pedidos</RouterLink>
        <RouterLink to="/produtos" class="hover:text-green-600 font-medium">Produtos</RouterLink>
        <RouterLink to="/clientes" class="hover:text-green-600 font-medium">Clientes</RouterLink>
      </nav>
    </aside>
  </template>
  
  <script setup>
  import { RouterLink } from 'vue-router'
  </script>
  