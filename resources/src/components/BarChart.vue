<template>
    <canvas ref="chart"></canvas>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import Chart from 'chart.js/auto'
  
  const chart = ref(null)
  
  onMounted(() => {
    new Chart(chart.value, {
      type: 'bar',
      data: {
        labels: ['Calabresa', 'Marguerita', 'Frango', '4 Queijos'],
        datasets: [{
          label: 'Pedidos',
          data: [45, 32, 28, 60],
          backgroundColor: '#f97316'
        }]
      }
    })
  })
  </script>
  