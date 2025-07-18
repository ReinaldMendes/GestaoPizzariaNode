<template>
    <canvas ref="chart"></canvas>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import Chart from 'chart.js/auto'
  
  const chart = ref(null)
  
  onMounted(() => {
    new Chart(chart.value, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
          label: 'Vendas',
          data: [1200, 1900, 3000, 2500, 2800, 3200],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          tension: 0.4,
          fill: true
        }]
      }
    })
  })
  </script>
  