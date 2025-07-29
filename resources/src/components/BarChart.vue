<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Chart from 'chart.js/auto'
import axios from 'axios'

const chart = ref(null)

onMounted(async () => {
  try {
    const res = await axios.get(import.meta.env.VITE_API_URL + "/vendas/mais-vendidas", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })

    const { labels, dados } = res.data

    new Chart(chart.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Quantidade Vendida',
          data: dados,
          backgroundColor: '#f97316'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    })
  } catch (err) {
    console.error("Erro ao carregar gráfico de pizzas mais vendidas:", err)
  }
})
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 300px;
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .chart-container {
    height: 250px;
  }
}
</style>
