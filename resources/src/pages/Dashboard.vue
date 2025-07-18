<template>
  <PrivateLayout>
    <div class="dashboard flex h-screen bg-gray-100">
      <Sidebar />

      <div class="flex-1 p-6 overflow-auto">
        <h1 class="text-3xl font-bold mb-6 text-gray-800">Dashboard 🍕</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="bg-white p-4 rounded-2xl shadow-lg">
            <h2 class="text-xl font-semibold mb-4">Vendas Mensais</h2>
            <LineChart />
          </div>
          <div class="bg-white p-4 rounded-2xl shadow-lg">
            <h2 class="text-xl font-semibold mb-4">Produtos Mais Vendidos</h2>
            <BarChart />
          </div>
        </div>

        <div class="bg-white p-4 rounded-2xl shadow-lg">
          <h2 class="text-xl font-semibold mb-4">Clientes Recentes</h2>
          <ClientTable />
        </div>
      </div>
    </div>
  </PrivateLayout>
</template>

<script setup>
import PrivateLayout from '../components/PrivateLayout.vue'
import Sidebar from '../components/Sidebar.vue'
import LineChart from '../components/LineChart.vue'
import BarChart from '../components/BarChart.vue'
import ClientTable from '../components/ClientTable.vue'
</script>

<style scoped>
/* Scroll leve e limpo */
.dashboard::-webkit-scrollbar {
  width: 8px;
}
.dashboard::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 8px;
}
</style>
