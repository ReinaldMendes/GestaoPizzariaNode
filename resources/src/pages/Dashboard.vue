<template>
  <PrivateLayout>
    <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">Dashboard 🍕</h1>
        <router-link to="/promocoes/criar" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
          Criar Promoção
        </router-link>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Vendas Mensais" color="blue" icon="bar-chart">
          <LineChart />
        </DashboardCard>

        <DashboardCard title="Produtos + Vendidos" color="green" icon="shopping-cart">
          <BarChart />
        </DashboardCard>

        <DashboardCard title="Clientes Recentes" color="purple" icon="users">
          <ClientTable />
        </DashboardCard>
      </div>
    </div>
  </PrivateLayout>
</template>

<script setup>
import PrivateLayout from '../components/PrivateLayout.vue';
import LineChart from '../components/LineChart.vue';
import BarChart from '../components/BarChart.vue';
import ClientTable from '../components/ClientTable.vue';
import DashboardCard from '../components/DashboardCard.vue';
import { RouterLink } from 'vue-router'; // 🔹 Importar RouterLink para o botão
</script>