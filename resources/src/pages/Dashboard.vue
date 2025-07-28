<template>
  <PrivateLayout>
    <div class="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard 🍕</h1>

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

        <DashboardCard title="Pedidos Abertos" color="yellow" icon="clipboard-list">
          <p class="text-center text-gray-600">em breve...</p>
        </DashboardCard>

        <DashboardCard title="Estoque Baixo" color="red" icon="alert-triangle">
          <p class="text-center text-gray-600">em breve...</p>
        </DashboardCard>

        <DashboardCard title="Faturamento Total" color="indigo" icon="dollar-sign">
          <p class="text-center text-xl font-bold text-indigo-700">R$ 12.345,67</p>
        </DashboardCard>
      </div>
    </div>
  </PrivateLayout>
</template>

<script setup>
import PrivateLayout from '../components/PrivateLayout.vue'
import LineChart from '../components/LineChart.vue'
import BarChart from '../components/BarChart.vue'
import ClientTable from '../components/ClientTable.vue'
import DashboardCard from '../components/DashboardCard.vue'
</script>
