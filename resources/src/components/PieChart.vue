<template>
    <canvas ref="canvas"></canvas>
  </template>
  
  <script setup>
  import { onMounted, watch, ref } from 'vue'
  import { Pie } from 'vue-chartjs'
  import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'
  
  Chart.register(ArcElement, Tooltip, Legend)
  
  const props = defineProps({
    chartData: Object
  })
  
  const chartInstance = ref(null)
  const canvas = ref(null)
  
  onMounted(() => {
    chartInstance.value = new Chart(canvas.value, {
      type: 'pie',
      data: props.chartData,
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } }
      }
    })
  })
  
  watch(() => props.chartData, (newData) => {
    if (chartInstance.value) {
      chartInstance.value.data = newData
      chartInstance.value.update()
    }
  })
  </script>
  