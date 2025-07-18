<template>
    <div class="overflow-x-auto rounded-lg shadow-lg bg-white p-4">
      <h2 class="text-xl font-bold mb-4 text-gray-800">Clientes</h2>
      <table class="min-w-full table-auto">
        <thead class="bg-green-600 text-white">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold">Nome</th>
            <th class="px-6 py-3 text-left text-sm font-semibold">Email</th>
            <th class="px-6 py-3 text-left text-sm font-semibold">Data</th>
          </tr>
        </thead>
        <tbody class="text-gray-700">
          <tr
            v-for="cliente in clientes"
            :key="cliente.email"
            class="hover:bg-gray-50 border-b border-gray-200 transition duration-200"
          >
            <td class="px-6 py-4">{{ cliente.nome }}</td>
            <td class="px-6 py-4">{{ cliente.email }}</td>
            <td class="px-6 py-4">{{ cliente.data }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  const clientes = [
    { nome: 'João Silva', email: 'joao@email.com', data: '2025-07-15' },
    { nome: 'Maria Santos', email: 'maria@email.com', data: '2025-07-14' },
    { nome: 'Carlos Oliveira', email: 'carlos@email.com', data: '2025-07-13' }
  ]
  </script>
  